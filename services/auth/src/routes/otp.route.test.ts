import { describe, it, expect, vi, beforeEach } from "vitest"
import request from "supertest"
import app from "../app.js"
import { otpService, OtpServiceError } from "../services/otp.service.js"

describe("OTP Routes & Endpoints (/api/auth/otp)", () => {
  beforeEach(() => {
    vi.restoreAllMocks()
  })

  describe("POST /api/auth/otp/send", () => {
    it("should return 200 OK with requestId for valid email dispatch", async () => {
      vi.spyOn(otpService, "sendOtp").mockResolvedValueOnce({
        success: true,
        requestId: "550e8400-e29b-41d4-a716-446655440000",
        expiresInSeconds: 600,
        cooldownSeconds: 60,
        debugOtp: "123456",
      })

      const res = await request(app)
        .post("/api/auth/otp/send")
        .send({
          identifier: "rider@forginity.com",
          identifierType: "email",
          purpose: "authentication",
        })

      expect(res.status).toBe(200)
      expect(res.body.success).toBe(true)
      expect(res.body.requestId).toBe("550e8400-e29b-41d4-a716-446655440000")
      expect(res.body.expiresInSeconds).toBe(600)
      expect(res.body.cooldownSeconds).toBe(60)
    })

    it("should return 400 Bad Request when trying to dispatch to phone (deferred to V2)", async () => {
      const res = await request(app)
        .post("/api/auth/otp/send")
        .send({
          identifier: "+14155552671",
          identifierType: "phone",
          purpose: "authentication",
        })

      expect(res.status).toBe(400)
      expect(res.body.error).toContain("Phone number verification is scheduled for V2 rollout")
      expect(res.body.code).toBe("PHONE_VERIFICATION_DEFERRED")
    })

    it("should return 400 Bad Request when email format is invalid", async () => {
      const res = await request(app)
        .post("/api/auth/otp/send")
        .send({
          identifier: "not-an-email",
          identifierType: "email",
        })

      expect(res.status).toBe(400)
      expect(res.body.error).toBe("Validation Error")
      expect(res.body.issues).toBeDefined()
    })

    it("should return 429 Too Many Requests when rate limit cooldown is active", async () => {
      vi.spyOn(otpService, "sendOtp").mockRejectedValueOnce(
        new OtpServiceError(
          "Please wait 45 seconds before requesting another verification code.",
          429,
          { code: "RATE_LIMITED" }
        )
      )

      const res = await request(app)
        .post("/api/auth/otp/send")
        .send({
          identifier: "rider@forginity.com",
          identifierType: "email",
        })

      expect(res.status).toBe(429)
      expect(res.body.error).toContain("Please wait 45 seconds")
      expect(res.body.code).toBe("RATE_LIMITED")
    })
  })

  describe("POST /api/auth/otp/verify", () => {
    it("should return 200 OK when code is valid", async () => {
      vi.spyOn(otpService, "verifyOtp").mockResolvedValueOnce({
        verified: true,
        requestId: "550e8400-e29b-41d4-a716-446655440000",
        identifier: "rider@forginity.com",
        identifierType: "email",
        purpose: "authentication",
      })

      const res = await request(app)
        .post("/api/auth/otp/verify")
        .send({
          requestId: "550e8400-e29b-41d4-a716-446655440000",
          code: "123456",
        })

      expect(res.status).toBe(200)
      expect(res.body.verified).toBe(true)
      expect(res.body.requestId).toBe("550e8400-e29b-41d4-a716-446655440000")
      expect(res.body.identifier).toBe("rider@forginity.com")
    })

    it("should return 400 Bad Request when requestId is not a valid UUID", async () => {
      const res = await request(app)
        .post("/api/auth/otp/verify")
        .send({
          requestId: "not-a-uuid",
          code: "123456",
        })

      expect(res.status).toBe(400)
      expect(res.body.error).toBe("Validation Error")
    })

    it("should return 400 Bad Request when code is not 6 digits", async () => {
      const res = await request(app)
        .post("/api/auth/otp/verify")
        .send({
          requestId: "550e8400-e29b-41d4-a716-446655440000",
          code: "1234",
        })

      expect(res.status).toBe(400)
      expect(res.body.error).toBe("Validation Error")
    })

    it("should return 400 Bad Request with remaining attempts when code is invalid", async () => {
      vi.spyOn(otpService, "verifyOtp").mockRejectedValueOnce(
        new OtpServiceError(
          "Invalid verification code.",
          400,
          {
            code: "INVALID_CODE",
            remainingAttempts: 2,
            maxAttempts: 3,
          }
        )
      )

      const res = await request(app)
        .post("/api/auth/otp/verify")
        .send({
          requestId: "550e8400-e29b-41d4-a716-446655440000",
          code: "000000",
        })

      expect(res.status).toBe(400)
      expect(res.body.error).toBe("Invalid verification code.")
      expect(res.body.code).toBe("INVALID_CODE")
      expect(res.body.remainingAttempts).toBe(2)
      expect(res.body.maxAttempts).toBe(3)
    })
  })

  describe("Centralized Malformed JSON Error Handling", () => {
    it("should intercept malformed JSON payloads and return a clean 400", async () => {
      const res = await request(app)
        .post("/api/auth/otp/send")
        .set("Content-Type", "application/json")
        .send('{"identifier": "invalid-json-body,')

      expect(res.status).toBe(400)
      expect(res.body.error).toBe("Malformed JSON payload in request body")
    })
  })

  describe("OpenAPI / Swagger Documentation", () => {
    it("should serve OpenAPI specification JSON at /api/docs.json", async () => {
      const res = await request(app).get("/api/docs.json")

      expect(res.status).toBe(200)
      expect(res.headers["content-type"]).toContain("application/json")
      expect(res.body.openapi).toBe("3.0.0")
      expect(res.body.info.title).toContain("Forginity")
      expect(res.body.paths["/api/auth/otp/send"]).toBeDefined()
      expect(res.body.paths["/api/auth/otp/verify"]).toBeDefined()
    })

    it("should serve interactive Swagger UI documentation at /api/docs/", async () => {
      const res = await request(app).get("/api/docs/")

      expect(res.status).toBe(200)
      expect(res.text).toContain("swagger-ui")
    })
  })
})
