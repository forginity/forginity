import { describe, it, expect, vi, beforeEach } from "vitest"
import request from "supertest"
import app from "../app.js"
import { userRepository } from "../repositories/user.repository.js"
import {
  userLifecycleService,
  UserLifecycleServiceError,
} from "../services/user-lifecycle.service.js"
import { signAccessToken } from "../utils/token.utils.js"
import type { User } from "../db/auth.schema.js"

describe("User Lifecycle Routes (/api/users)", () => {
  const mockUserId = "550e8400-e29b-41d4-a716-446655440001"
  const mockEmail = "rider@forginity.com"
  let validAccessToken: string

  const mockUser: User = {
    id: mockUserId,
    email: mockEmail,
    phone: "+14155552671",
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
    status: "active",
    createdAt: new Date(),
    updatedAt: new Date(),
  }

  beforeEach(async () => {
    vi.restoreAllMocks()
    validAccessToken = await signAccessToken({
      userId: mockUserId,
      email: mockEmail,
    })
    vi.spyOn(userRepository, "findUserById").mockResolvedValue(mockUser)
  })

  describe("DELETE /api/users/me", () => {
    it("should return 401 Unauthorized when missing Authorization header", async () => {
      const res = await request(app).delete("/api/users/me")
      expect(res.status).toBe(401)
      expect(res.body.code).toBe("UNAUTHORIZED")
    })

    it("should return 200 OK when user successfully soft-deletes own account", async () => {
      vi.spyOn(userLifecycleService, "deleteOwnAccount").mockResolvedValueOnce({
        success: true,
        message:
          "Account has been deleted successfully and all active sessions revoked.",
      })

      const res = await request(app)
        .delete("/api/users/me")
        .set("Authorization", `Bearer ${validAccessToken}`)

      expect(res.status).toBe(200)
      expect(res.body.success).toBe(true)
      expect(res.body.message).toContain("Account has been deleted successfully")
    })

    it("should return 400 Bad Request when account is already deleted", async () => {
      vi.spyOn(userLifecycleService, "deleteOwnAccount").mockRejectedValueOnce(
        new UserLifecycleServiceError("Account has already been deleted.", 400, {
          code: "ACCOUNT_DELETED",
        })
      )

      const res = await request(app)
        .delete("/api/users/me")
        .set("Authorization", `Bearer ${validAccessToken}`)

      expect(res.status).toBe(400)
      expect(res.body.code).toBe("ACCOUNT_DELETED")
    })
  })

  describe("POST /api/users/:userId/restore", () => {
    it("should return 400 Bad Request when userId is not a valid UUID", async () => {
      const res = await request(app)
        .post("/api/users/not-a-uuid/restore")
        .set("Authorization", `Bearer ${validAccessToken}`)

      expect(res.status).toBe(400)
      expect(res.body.error).toBe("Validation Error")
    })

    it("should return 200 OK when user is restored", async () => {
      vi.spyOn(userLifecycleService, "restoreAccount").mockResolvedValueOnce({
        success: true,
        message: "Account has been restored successfully.",
        user: { ...mockUser, status: "active" },
      })

      const res = await request(app)
        .post(`/api/users/${mockUserId}/restore`)
        .set("Authorization", `Bearer ${validAccessToken}`)

      expect(res.status).toBe(200)
      expect(res.body.success).toBe(true)
      expect(res.body.message).toBe("Account has been restored successfully.")
      expect(res.body.user.status).toBe("active")
    })

    it("should return 404 Not Found when user does not exist", async () => {
      vi.spyOn(userLifecycleService, "restoreAccount").mockRejectedValueOnce(
        new UserLifecycleServiceError("User account not found.", 404, {
          code: "USER_NOT_FOUND",
        })
      )

      const res = await request(app)
        .post(`/api/users/${mockUserId}/restore`)
        .set("Authorization", `Bearer ${validAccessToken}`)

      expect(res.status).toBe(404)
      expect(res.body.code).toBe("USER_NOT_FOUND")
    })
  })
})
