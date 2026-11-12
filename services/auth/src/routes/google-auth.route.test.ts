import { describe, it, expect, vi, beforeEach } from "vitest"
import request from "supertest"
import app from "../app.js"
import {
  googleAuthService,
  GoogleAuthServiceError,
} from "../services/google-auth.service.js"

describe("Google Auth Routes (/api/auth/google)", () => {
  beforeEach(() => {
    vi.restoreAllMocks()
  })

  describe("POST /api/auth/google", () => {
    it("should return 200 OK with session for onboarded user", async () => {
      vi.spyOn(googleAuthService, "authenticateGoogle").mockResolvedValueOnce({
        success: true,
        isNewUser: false,
        isOnboarded: true,
        user: {
          id: "550e8400-e29b-41d4-a716-446655440000",
          email: "rider@forginity.com",
          phone: null,
          name: "John Doe",
          firstName: "John",
          lastName: "Doe",
          gender: "male",
          country: "US",
          avatarUrl: "https://lh3.googleusercontent.com/avatar",
          googleId: "google-12345",
          authProvider: "google",
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
        .post("/api/auth/google")
        .send({
          idToken: "valid-google-id-token",
          productId: "550e8400-e29b-41d4-a716-446655440000",
        })

      expect(res.status).toBe(200)
      expect(res.body.success).toBe(true)
      expect(res.body.isNewUser).toBe(false)
      expect(res.body.isOnboarded).toBe(true)
      expect(res.body.session.accessToken).toBe("mock.access.token")
      expect(res.body.session.refreshToken).toBe("mock.refresh.token")
      expect(res.body.user.email).toBe("rider@forginity.com")
    })

    it("should return 200 OK with onboardingToken for new or un-onboarded user", async () => {
      vi.spyOn(googleAuthService, "authenticateGoogle").mockResolvedValueOnce({
        success: true,
        isNewUser: true,
        isOnboarded: false,
        user: {
          id: "550e8400-e29b-41d4-a716-446655440001",
          email: "newrider@forginity.com",
          phone: null,
          name: "New Rider",
          firstName: "New",
          lastName: "Rider",
          gender: null,
          country: null,
          avatarUrl: "https://lh3.googleusercontent.com/avatar-new",
          googleId: "google-67890",
          authProvider: "google",
          isVerified: true,
          isEmailVerified: true,
          isPhoneVerified: false,
          isOnboarded: false,
          status: "active",
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        onboardingToken: "mock.onboarding.jwt",
      })

      const res = await request(app)
        .post("/api/auth/google")
        .send({
          idToken: "valid-new-user-id-token",
        })

      expect(res.status).toBe(200)
      expect(res.body.success).toBe(true)
      expect(res.body.isNewUser).toBe(true)
      expect(res.body.isOnboarded).toBe(false)
      expect(res.body.onboardingToken).toBe("mock.onboarding.jwt")
      expect(res.body.user.email).toBe("newrider@forginity.com")
    })

    it("should forward x-forwarded-for and user-agent context", async () => {
      const spy = vi
        .spyOn(googleAuthService, "authenticateGoogle")
        .mockResolvedValueOnce({
          success: true,
          isNewUser: false,
          isOnboarded: false,
          user: {
            id: "550e8400-e29b-41d4-a716-446655440002",
            email: "rider2@forginity.com",
            phone: null,
            name: "Rider Two",
            firstName: null,
            lastName: null,
            gender: null,
            country: null,
            avatarUrl: null,
            googleId: "google-99999",
            authProvider: "google",
            isVerified: true,
            isEmailVerified: true,
            isPhoneVerified: false,
            isOnboarded: false,
            status: "active",
            createdAt: new Date(),
            updatedAt: new Date(),
          },
          onboardingToken: "mock.onboarding.jwt",
        })

      await request(app)
        .post("/api/auth/google")
        .set("x-forwarded-for", "203.0.113.195, 70.41.3.18")
        .set("user-agent", "TrackRide-Mobile-App/1.0")
        .send({
          idToken: "token-with-headers",
        })

      expect(spy).toHaveBeenCalledWith(
        { idToken: "token-with-headers" },
        expect.objectContaining({
          ipAddress: "203.0.113.195",
          userAgent: "TrackRide-Mobile-App/1.0",
        })
      )
    })

    it("should return 400 Bad Request when idToken is missing", async () => {
      const res = await request(app).post("/api/auth/google").send({})

      expect(res.status).toBe(400)
      expect(res.body.error).toBe("Validation Error")
      expect(res.body.issues).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            field: "idToken",
          }),
        ])
      )
    })

    it("should return 400 Bad Request when idToken is an empty string", async () => {
      const res = await request(app).post("/api/auth/google").send({
        idToken: "",
      })

      expect(res.status).toBe(400)
      expect(res.body.error).toBe("Validation Error")
    })

    it("should return 400 Bad Request when productId is not a valid UUID", async () => {
      const res = await request(app).post("/api/auth/google").send({
        idToken: "valid-token",
        productId: "invalid-not-a-uuid",
      })

      expect(res.status).toBe(400)
      expect(res.body.error).toBe("Validation Error")
      expect(res.body.issues).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            field: "productId",
          }),
        ])
      )
    })

    it("should return 401 Unauthorized when token verification fails", async () => {
      vi.spyOn(googleAuthService, "authenticateGoogle").mockRejectedValueOnce(
        new GoogleAuthServiceError("Invalid Google ID token.", 401, {
          code: "INVALID_TOKEN",
        })
      )

      const res = await request(app).post("/api/auth/google").send({
        idToken: "bad-or-expired-token",
      })

      expect(res.status).toBe(401)
      expect(res.body.error).toBe("Invalid Google ID token.")
      expect(res.body.code).toBe("INVALID_TOKEN")
    })

    it("should return 403 Forbidden when user is blocked", async () => {
      vi.spyOn(googleAuthService, "authenticateGoogle").mockRejectedValueOnce(
        new GoogleAuthServiceError(
          "Account is blocked. Please contact support.",
          403,
          { code: "ACCOUNT_BLOCKED" }
        )
      )

      const res = await request(app).post("/api/auth/google").send({
        idToken: "blocked-user-token",
      })

      expect(res.status).toBe(403)
      expect(res.body.error).toBe("Account is blocked. Please contact support.")
      expect(res.body.code).toBe("ACCOUNT_BLOCKED")
    })

    it("should return 403 Forbidden when user is deleted", async () => {
      vi.spyOn(googleAuthService, "authenticateGoogle").mockRejectedValueOnce(
        new GoogleAuthServiceError("Account has been deleted.", 403, {
          code: "ACCOUNT_DELETED",
        })
      )

      const res = await request(app).post("/api/auth/google").send({
        idToken: "deleted-user-token",
      })

      expect(res.status).toBe(403)
      expect(res.body.error).toBe("Account has been deleted.")
      expect(res.body.code).toBe("ACCOUNT_DELETED")
    })
  })
})
