import { describe, it, expect, vi, beforeEach } from "vitest"
import request from "supertest"
import app from "../app.js"
import { userRepository } from "../repositories/user.repository.js"
import {
  adminUserService,
  AdminUserServiceError,
} from "../services/admin-user.service.js"
import { signAccessToken } from "../utils/token.utils.js"
import type { User } from "../db/auth.schema.js"

describe("Admin User Routes (/api/users)", () => {
  const mockAdminId = "550e8400-e29b-41d4-a716-446655440001"
  const targetUserId = "550e8400-e29b-41d4-a716-446655440002"
  const mockEmail = "admin@forginity.com"
  let validAccessToken: string

  const mockAdminUser: User = {
    id: mockAdminId,
    email: mockEmail,
    phone: "+14155552671",
    name: "Platform Admin",
    passwordHash: null,
    firstName: "Platform",
    lastName: "Admin",
    gender: "other",
    country: "US",
    avatarUrl: null,
    googleId: null,
    authProvider: "email_otp",
    isVerified: true,
    isEmailVerified: true,
    isPhoneVerified: false,
    isOnboarded: true,
    userType: "admin",
    status: "active",
    createdAt: new Date(),
    updatedAt: new Date(),
  }

  const mockRegularUser: User = {
    id: "550e8400-e29b-41d4-a716-446655440099",
    email: "regular@forginity.com",
    phone: "+14155552699",
    name: "Regular Rider",
    passwordHash: null,
    firstName: "Regular",
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

  let regularUserAccessToken: string

  beforeEach(async () => {
    vi.restoreAllMocks()
    validAccessToken = await signAccessToken({
      userId: mockAdminId,
      email: mockEmail,
      userType: "admin",
      role: "admin",
    })
    regularUserAccessToken = await signAccessToken({
      userId: mockRegularUser.id,
      email: mockRegularUser.email!,
      userType: "user",
      role: "user",
    })
    vi.spyOn(userRepository, "findUserById").mockImplementation(async (id: string) => {
      if (id === mockAdminId) return mockAdminUser
      if (id === mockRegularUser.id) return mockRegularUser
      return null
    })
  })

  describe("GET /api/users", () => {
    it("should return 401 Unauthorized when missing Authorization header", async () => {
      const res = await request(app).get("/api/users")
      expect(res.status).toBe(401)
      expect(res.body.code).toBe("UNAUTHORIZED")
    })

    it("should return 403 Forbidden when caller is not an admin", async () => {
      const res = await request(app)
        .get("/api/users")
        .set("Authorization", `Bearer ${regularUserAccessToken}`)

      expect(res.status).toBe(403)
      expect(res.body.code).toBe("FORBIDDEN")
    })

    it("should return 200 OK with paginated users directory", async () => {
      vi.spyOn(adminUserService, "listUsers").mockResolvedValueOnce({
        success: true,
        users: [
          {
            id: targetUserId,
            email: "rider@forginity.com",
            phone: null,
            name: "Alex Rider",
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
        ],
        pagination: {
          total: 1,
          limit: 20,
          offset: 0,
          hasMore: false,
        },
      })

      const res = await request(app)
        .get("/api/users?search=rider&status=active&limit=20&offset=0")
        .set("Authorization", `Bearer ${validAccessToken}`)

      expect(res.status).toBe(200)
      expect(res.body.success).toBe(true)
      expect(res.body.users).toHaveLength(1)
      expect(res.body.pagination.total).toBe(1)
    })

    it("should return 400 Bad Request when limit exceeds 100", async () => {
      const res = await request(app)
        .get("/api/users?limit=250")
        .set("Authorization", `Bearer ${validAccessToken}`)

      expect(res.status).toBe(400)
      expect(res.body.error).toBe("Validation Error")
    })

    it("should return 400 Bad Request when status enum is invalid", async () => {
      const res = await request(app)
        .get("/api/users?status=invalid_status")
        .set("Authorization", `Bearer ${validAccessToken}`)

      expect(res.status).toBe(400)
      expect(res.body.error).toBe("Validation Error")
    })
  })

  describe("GET /api/users/:userId", () => {
    it("should return 403 Forbidden when caller is not an admin", async () => {
      const res = await request(app)
        .get(`/api/users/${targetUserId}`)
        .set("Authorization", `Bearer ${regularUserAccessToken}`)

      expect(res.status).toBe(403)
      expect(res.body.code).toBe("FORBIDDEN")
    })

    it("should return 400 Bad Request when userId is not a valid UUID", async () => {
      const res = await request(app)
        .get("/api/users/not-a-uuid")
        .set("Authorization", `Bearer ${validAccessToken}`)

      expect(res.status).toBe(400)
      expect(res.body.error).toBe("Validation Error")
    })

    it("should return 404 Not Found when user does not exist", async () => {
      vi.spyOn(adminUserService, "getUserDetails").mockRejectedValueOnce(
        new AdminUserServiceError("User not found", 404, {
          code: "USER_NOT_FOUND",
        })
      )

      const res = await request(app)
        .get(`/api/users/${targetUserId}`)
        .set("Authorization", `Bearer ${validAccessToken}`)

      expect(res.status).toBe(404)
      expect(res.body.error).toBe("User not found")
      expect(res.body.code).toBe("USER_NOT_FOUND")
    })

    it("should return 200 OK with full user details", async () => {
      vi.spyOn(adminUserService, "getUserDetails").mockResolvedValueOnce({
        success: true,
        user: {
          id: targetUserId,
          email: "rider@forginity.com",
          phone: "+14155552671",
          name: "Alex Rider",
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
        emergencyContacts: [],
        activeSessionsCount: 2,
      })

      const res = await request(app)
        .get(`/api/users/${targetUserId}`)
        .set("Authorization", `Bearer ${validAccessToken}`)

      expect(res.status).toBe(200)
      expect(res.body.success).toBe(true)
      expect(res.body.user.id).toBe(targetUserId)
      expect(res.body.activeSessionsCount).toBe(2)
    })
  })

  describe("PATCH /api/users/:userId/status", () => {
    it("should return 403 Forbidden when caller is not an admin", async () => {
      const res = await request(app)
        .patch(`/api/users/${targetUserId}/status`)
        .set("Authorization", `Bearer ${regularUserAccessToken}`)
        .send({ status: "blocked" })

      expect(res.status).toBe(403)
      expect(res.body.code).toBe("FORBIDDEN")
    })

    it("should return 400 Bad Request when status is invalid", async () => {
      const res = await request(app)
        .patch(`/api/users/${targetUserId}/status`)
        .set("Authorization", `Bearer ${validAccessToken}`)
        .send({ status: "super_blocked" })

      expect(res.status).toBe(400)
      expect(res.body.error).toBe("Validation Error")
    })

    it("should return 200 OK when user status is updated to blocked", async () => {
      vi.spyOn(adminUserService, "updateUserStatus").mockResolvedValueOnce({
        success: true,
        message:
          "User status updated to blocked successfully. Revoked 2 active sessions.",
        user: {
          id: targetUserId,
          email: "rider@forginity.com",
          phone: null,
          name: "Alex Rider",
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
          status: "blocked",
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        revokedSessionsCount: 2,
      })

      const res = await request(app)
        .patch(`/api/users/${targetUserId}/status`)
        .set("Authorization", `Bearer ${validAccessToken}`)
        .send({
          status: "blocked",
          reason: "Terms of service violation",
        })

      expect(res.status).toBe(200)
      expect(res.body.success).toBe(true)
      expect(res.body.user.status).toBe("blocked")
      expect(res.body.revokedSessionsCount).toBe(2)
    })
  })
})
