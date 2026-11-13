import { describe, it, expect, vi, beforeEach } from "vitest"
import request from "supertest"
import app from "../app.js"
import { sessionService, SessionServiceError } from "../services/session.service.js"
import { userRepository } from "../repositories/user.repository.js"
import { signAccessToken } from "../utils/token.utils.js"
import type { User } from "../db/auth.schema.js"

describe("Session Routes (/api/auth/session)", () => {
  const mockUserId = "550e8400-e29b-41d4-a716-446655440001"
  const mockSessionId = "550e8400-e29b-41d4-a716-446655440002"
  const mockProductId = "550e8400-e29b-41d4-a716-446655440003"

  const mockUser: User = {
    id: mockUserId,
    email: "rider@forginity.com",
    phone: null,
    name: "Alex Rider",
    passwordHash: null,
    firstName: "Alex",
    lastName: "Rider",
    gender: "male",
    country: "US",
    avatarUrl: null,
    googleId: null,
    authProvider: "email_otp",
    isVerified: true,
    isEmailVerified: true,
    isPhoneVerified: false,
    isOnboarded: true,
    userType: "user",
    status: "active",
    createdAt: new Date(),
    updatedAt: new Date(),
  }

  let validAccessToken: string

  beforeEach(async () => {
    vi.restoreAllMocks()

    // Default mock user repository
    vi.spyOn(userRepository, "findUserById").mockResolvedValue(mockUser)

    validAccessToken = await signAccessToken({
      userId: mockUserId,
      email: mockUser.email!,
      role: "active",
    })
  })

  describe("POST /api/auth/session/refresh and POST /api/auth/session", () => {
    it("should return 200 OK with rotated tokens for a valid refresh token", async () => {
      vi.spyOn(sessionService, "refreshSession").mockResolvedValueOnce({
        success: true,
        session: {
          accessToken: "mock.rotated.access.token",
          refreshToken: "mock.rotated.refresh.token",
          expiresIn: 900,
        },
      })

      const res = await request(app)
        .post("/api/auth/session/refresh")
        .send({
          refreshToken: "valid.mock.refresh.token",
        })

      expect(res.status).toBe(200)
      expect(res.body.success).toBe(true)
      expect(res.body.session.accessToken).toBe("mock.rotated.access.token")
      expect(res.body.session.refreshToken).toBe("mock.rotated.refresh.token")
      expect(res.body.session.expiresIn).toBe(900)
    })

    it("should support POST /api/auth/session as an alias for refresh", async () => {
      vi.spyOn(sessionService, "refreshSession").mockResolvedValueOnce({
        success: true,
        session: {
          accessToken: "mock.rotated.access.token",
          refreshToken: "mock.rotated.refresh.token",
          expiresIn: 900,
        },
      })

      const res = await request(app)
        .post("/api/auth/session")
        .send({
          refreshToken: "valid.mock.refresh.token",
        })

      expect(res.status).toBe(200)
      expect(res.body.success).toBe(true)
    })

    it("should return 400 Bad Request if refreshToken is missing", async () => {
      const res = await request(app).post("/api/auth/session/refresh").send({})

      expect(res.status).toBe(400)
      expect(res.body.error).toBe("Validation Error")
      expect(res.body.issues).toBeDefined()
    })

    it("should return 401 Unauthorized if refresh token is invalid or expired", async () => {
      vi.spyOn(sessionService, "refreshSession").mockRejectedValueOnce(
        new SessionServiceError("Invalid or expired refresh token.", 401, "INVALID_TOKEN")
      )

      const res = await request(app)
        .post("/api/auth/session/refresh")
        .send({
          refreshToken: "invalid.refresh.token",
        })

      expect(res.status).toBe(401)
      expect(res.body.error).toBe("Invalid or expired refresh token.")
      expect(res.body.code).toBe("INVALID_TOKEN")
    })

    it("should return 403 Forbidden if account is blocked", async () => {
      vi.spyOn(sessionService, "refreshSession").mockRejectedValueOnce(
        new SessionServiceError("Account is blocked. Please contact support.", 403, "ACCOUNT_BLOCKED")
      )

      const res = await request(app)
        .post("/api/auth/session/refresh")
        .send({
          refreshToken: "blocked.user.refresh.token",
        })

      expect(res.status).toBe(403)
      expect(res.body.error).toBe("Account is blocked. Please contact support.")
      expect(res.body.code).toBe("ACCOUNT_BLOCKED")
    })
  })

  describe("POST /api/auth/session/switch-product", () => {
    it("should return 200 OK with updated access token when authenticated", async () => {
      vi.spyOn(sessionService, "switchProduct").mockResolvedValueOnce({
        success: true,
        accessToken: "mock.switched.product.access.token",
        currentProductId: mockProductId,
        currentSection: "radar",
        expiresIn: 900,
      })

      const res = await request(app)
        .post("/api/auth/session/switch-product")
        .set("Authorization", `Bearer ${validAccessToken}`)
        .send({
          productId: mockProductId,
          section: "radar",
        })

      expect(res.status).toBe(200)
      expect(res.body.success).toBe(true)
      expect(res.body.currentProductId).toBe(mockProductId)
      expect(res.body.currentSection).toBe("radar")
      expect(res.body.accessToken).toBe("mock.switched.product.access.token")
    })

    it("should return 401 Unauthorized if Bearer token is missing", async () => {
      const res = await request(app)
        .post("/api/auth/session/switch-product")
        .send({
          productId: mockProductId,
        })

      expect(res.status).toBe(401)
      expect(res.body.code).toBe("UNAUTHORIZED")
    })

    it("should return 400 Bad Request if productId is not a valid UUID", async () => {
      const res = await request(app)
        .post("/api/auth/session/switch-product")
        .set("Authorization", `Bearer ${validAccessToken}`)
        .send({
          productId: "not-a-valid-uuid",
        })

      expect(res.status).toBe(400)
      expect(res.body.error).toBe("Validation Error")
    })
  })

  describe("POST /api/auth/session/revoke", () => {
    it("should return 200 OK on successful session revocation", async () => {
      vi.spyOn(sessionService, "revokeSession").mockResolvedValueOnce({
        success: true,
        message: "Session successfully revoked.",
      })

      const res = await request(app)
        .post("/api/auth/session/revoke")
        .send({
          refreshToken: "mock.refresh.token",
        })

      expect(res.status).toBe(200)
      expect(res.body.success).toBe(true)
      expect(res.body.message).toBe("Session successfully revoked.")
    })
  })

  describe("POST /api/auth/session/revoke-all", () => {
    it("should return 200 OK and count of revoked sessions when authenticated", async () => {
      vi.spyOn(sessionService, "revokeAllSessions").mockResolvedValueOnce({
        success: true,
        message: "All user sessions successfully revoked.",
        revokedCount: 3,
      })

      const res = await request(app)
        .post("/api/auth/session/revoke-all")
        .set("Authorization", `Bearer ${validAccessToken}`)
        .send()

      expect(res.status).toBe(200)
      expect(res.body.success).toBe(true)
      expect(res.body.revokedCount).toBe(3)
    })

    it("should return 401 Unauthorized when Bearer token is omitted", async () => {
      const res = await request(app).post("/api/auth/session/revoke-all").send()

      expect(res.status).toBe(401)
      expect(res.body.code).toBe("UNAUTHORIZED")
    })
  })

  describe("GET /api/auth/session/me", () => {
    it("should return 200 OK with sanitized user and active session metadata", async () => {
      vi.spyOn(sessionService, "getCurrentSession").mockResolvedValueOnce({
        success: true,
        user: {
          id: mockUserId,
          email: "rider@forginity.com",
          name: "Alex Rider",
          phone: null,
          firstName: "Alex",
          lastName: "Rider",
          gender: "male",
          country: "US",
          avatarUrl: null,
          googleId: null,
          authProvider: "email_otp",
          isVerified: true,
          isEmailVerified: true,
          isPhoneVerified: false,
          isOnboarded: true,
          userType: "user",
          status: "active",
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        session: {
          id: mockSessionId,
          userId: mockUserId,
          currentProductId: mockProductId,
          currentSection: "dashboard",
          ipAddress: "127.0.0.1",
          userAgent: "Vitest/1.0",
          deviceType: "desktop",
          expiresAt: new Date(),
          lastActiveAt: new Date(),
          createdAt: new Date(),
        },
      })

      const res = await request(app)
        .get("/api/auth/session/me")
        .set("Authorization", `Bearer ${validAccessToken}`)

      expect(res.status).toBe(200)
      expect(res.body.success).toBe(true)
      expect(res.body.user.id).toBe(mockUserId)
      expect(res.body.user.email).toBe("rider@forginity.com")
      expect(res.body.session.id).toBe(mockSessionId)
      expect(res.body.session.currentProductId).toBe(mockProductId)
    })

    it("should return 401 Unauthorized if Bearer header is missing", async () => {
      const res = await request(app).get("/api/auth/session/me")

      expect(res.status).toBe(401)
      expect(res.body.code).toBe("UNAUTHORIZED")
    })
  })
})
