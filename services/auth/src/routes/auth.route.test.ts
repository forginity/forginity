import { describe, it, expect, vi, beforeEach } from "vitest"
import request from "supertest"
import app from "../app.js"
import { authService, AuthServiceError } from "../services/auth.service.js"
import { OtpServiceError } from "../services/otp.service.js"

describe("Email Auth Routes (/api/auth/email)", () => {
  beforeEach(() => {
    vi.restoreAllMocks()
  })

  describe("POST /api/auth/email/initiate", () => {
    it("should return 200 OK with isNewUser: true for a new user email", async () => {
      vi.spyOn(authService, "initiateEmailAuth").mockResolvedValueOnce({
        success: true,
        isNewUser: true,
        requestId: "550e8400-e29b-41d4-a716-446655440000",
        expiresInSeconds: 600,
        cooldownSeconds: 60,
        debugOtp: "123456",
      })

      const res = await request(app)
        .post("/api/auth/email/initiate")
        .send({
          email: "newuser@forginity.com",
        })

      expect(res.status).toBe(200)
      expect(res.body.success).toBe(true)
      expect(res.body.isNewUser).toBe(true)
      expect(res.body.requestId).toBe("550e8400-e29b-41d4-a716-446655440000")
      expect(res.body.expiresInSeconds).toBe(600)
    })

    it("should return 200 OK with isNewUser: false for a returning user email", async () => {
      vi.spyOn(authService, "initiateEmailAuth").mockResolvedValueOnce({
        success: true,
        isNewUser: false,
        requestId: "550e8400-e29b-41d4-a716-446655440000",
        expiresInSeconds: 600,
        cooldownSeconds: 60,
      })

      const res = await request(app)
        .post("/api/auth/email/initiate")
        .send({
          email: "returning@forginity.com",
        })

      expect(res.status).toBe(200)
      expect(res.body.success).toBe(true)
      expect(res.body.isNewUser).toBe(false)
      expect(res.body.requestId).toBeDefined()
    })

    it("should return 400 Bad Request if email format is invalid", async () => {
      const res = await request(app)
        .post("/api/auth/email/initiate")
        .send({
          email: "not-an-email",
        })

      expect(res.status).toBe(400)
      expect(res.body.error).toBe("Validation Error")
      expect(res.body.issues).toBeDefined()
    })

    it("should return 403 Forbidden if account is blocked", async () => {
      vi.spyOn(authService, "initiateEmailAuth").mockRejectedValueOnce(
        new AuthServiceError("Account is blocked. Please contact support.", 403, {
          code: "ACCOUNT_BLOCKED",
        })
      )

      const res = await request(app)
        .post("/api/auth/email/initiate")
        .send({
          email: "blocked@forginity.com",
        })

      expect(res.status).toBe(403)
      expect(res.body.error).toBe("Account is blocked. Please contact support.")
      expect(res.body.code).toBe("ACCOUNT_BLOCKED")
    })

    it("should return 429 Too Many Requests if rate limit cooldown is active", async () => {
      vi.spyOn(authService, "initiateEmailAuth").mockRejectedValueOnce(
        new OtpServiceError("Please wait 45 seconds before requesting another verification code.", 429, {
          code: "RATE_LIMITED",
        })
      )

      const res = await request(app)
        .post("/api/auth/email/initiate")
        .send({
          email: "rider@forginity.com",
        })

      expect(res.status).toBe(429)
      expect(res.body.error).toContain("Please wait 45 seconds")
      expect(res.body.code).toBe("RATE_LIMITED")
    })
  })

  describe("POST /api/auth/email/verify", () => {
    it("should return 200 OK with onboardingToken for a new unregistered user", async () => {
      vi.spyOn(authService, "verifyEmailAuth").mockResolvedValueOnce({
        success: true,
        isNewUser: true,
        isOnboarded: false,
        user: {
          id: "550e8400-e29b-41d4-a716-446655440001",
          email: "newuser@forginity.com",
          name: null,
          phone: null,
          firstName: null,
          lastName: null,
          gender: null,
          country: null,
          avatarUrl: null,
          googleId: null,
          authProvider: "email_otp",
          isVerified: true,
          isEmailVerified: true,
          isPhoneVerified: false,
          isOnboarded: false,
          status: "active",
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        onboardingToken: "mock.onboarding.token",
      })

      const res = await request(app)
        .post("/api/auth/email/verify")
        .send({
          requestId: "550e8400-e29b-41d4-a716-446655440000",
          code: "123456",
        })

      expect(res.status).toBe(200)
      expect(res.body.success).toBe(true)
      expect(res.body.isNewUser).toBe(true)
      expect(res.body.isOnboarded).toBe(false)
      expect(res.body.onboardingToken).toBe("mock.onboarding.token")
      expect(res.body.user.email).toBe("newuser@forginity.com")
      expect(res.body.user.isEmailVerified).toBe(true)
      expect(res.body.user.isPhoneVerified).toBe(false)
    })

    it("should return 200 OK with active session for returning onboarded user", async () => {
      vi.spyOn(authService, "verifyEmailAuth").mockResolvedValueOnce({
        success: true,
        isNewUser: false,
        isOnboarded: true,
        user: {
          id: "550e8400-e29b-41d4-a716-446655440001",
          email: "rider@forginity.com",
          name: "John Doe",
          phone: null,
          firstName: "John",
          lastName: "Doe",
          gender: "male",
          country: "US",
          avatarUrl: null,
          googleId: null,
          authProvider: "email_otp",
          isVerified: true,
          isEmailVerified: true,
          isPhoneVerified: false,
          isOnboarded: true,
          status: "active",
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        session: {
          accessToken: "mock.access.token",
          refreshToken: "mock.refresh.token",
          expiresIn: 900,
        },
      })

      const res = await request(app)
        .post("/api/auth/email/verify")
        .send({
          requestId: "550e8400-e29b-41d4-a716-446655440000",
          code: "123456",
        })

      expect(res.status).toBe(200)
      expect(res.body.success).toBe(true)
      expect(res.body.isNewUser).toBe(false)
      expect(res.body.isOnboarded).toBe(true)
      expect(res.body.session.accessToken).toBe("mock.access.token")
      expect(res.body.session.refreshToken).toBe("mock.refresh.token")
    })

    it("should return 400 Bad Request if requestId is not a valid UUID", async () => {
      const res = await request(app)
        .post("/api/auth/email/verify")
        .send({
          requestId: "not-a-uuid",
          code: "123456",
        })

      expect(res.status).toBe(400)
      expect(res.body.error).toBe("Validation Error")
    })

    it("should return 400 Bad Request with remaining attempts if code is invalid", async () => {
      vi.spyOn(authService, "verifyEmailAuth").mockRejectedValueOnce(
        new OtpServiceError("Invalid verification code.", 400, {
          code: "INVALID_CODE",
          remainingAttempts: 2,
          maxAttempts: 3,
        })
      )

      const res = await request(app)
        .post("/api/auth/email/verify")
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
})
