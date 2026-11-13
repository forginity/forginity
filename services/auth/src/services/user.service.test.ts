import { describe, it, expect, beforeEach, vi } from "vitest"
import { UserService, UserServiceError } from "./user.service.js"
import { UserRepository } from "../repositories/user.repository.js"
import { SessionRepository } from "../repositories/session.repository.js"
import type { User } from "../db/auth.schema.js"

describe("UserService Unit Tests (Self-Service Profile & Lifecycle)", () => {
  let mockUserRepo: UserRepository
  let mockSessionRepo: SessionRepository
  let userService: UserService
  let usersDb: Map<string, User>

  const mockUser: User = {
    id: "550e8400-e29b-41d4-a716-446655440001",
    email: "rider@forginity.com",
    phone: "+14155552671",
    name: "Alex Rider",
    passwordHash: null,
    firstName: "Alex",
    lastName: "Rider",
    gender: "male",
    country: "US",
    avatarUrl: "https://example.com/avatar.png",
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

  beforeEach(() => {
    vi.restoreAllMocks()
    usersDb = new Map()
    usersDb.set(mockUser.id, { ...mockUser })

    mockUserRepo = {
      async findUserById(id: string) {
        return usersDb.get(id) || null
      },
      async updateUser(id: string, input: any) {
        const existing = usersDb.get(id)
        if (!existing) return null
        const updated = {
          ...existing,
          ...input,
          updatedAt: new Date(),
        }
        usersDb.set(id, updated)
        return updated
      },
    } as unknown as UserRepository

    mockSessionRepo = {
      deleteSessionsByUserId: vi.fn().mockResolvedValue(2),
    } as unknown as SessionRepository

    userService = new UserService(mockUserRepo, mockSessionRepo)
  })

  describe("getUserProfile", () => {
    it("should return sanitized profile for valid active user", async () => {
      const profile = await userService.getUserProfile(mockUser.id)

      expect(profile).toBeDefined()
      expect(profile.id).toBe(mockUser.id)
      expect(profile.email).toBe(mockUser.email)
      expect(profile.firstName).toBe("Alex")
      expect(profile.lastName).toBe("Rider")
      expect(profile).not.toHaveProperty("passwordHash")
    })

    it("should throw 404 if user does not exist", async () => {
      await expect(
        userService.getUserProfile("non-existent-user-id")
      ).rejects.toThrowError(UserServiceError)

      try {
        await userService.getUserProfile("non-existent-user-id")
      } catch (err: any) {
        expect(err.statusCode).toBe(404)
        expect(err.details?.code).toBe("USER_NOT_FOUND")
      }
    })

    it("should throw 403 if user is blocked", async () => {
      usersDb.set(mockUser.id, { ...mockUser, status: "blocked" })

      try {
        await userService.getUserProfile(mockUser.id)
      } catch (err: any) {
        expect(err.statusCode).toBe(403)
        expect(err.details?.code).toBe("ACCOUNT_BLOCKED")
      }
    })

    it("should throw 403 if user is soft-deleted", async () => {
      usersDb.set(mockUser.id, { ...mockUser, status: "deleted" })

      try {
        await userService.getUserProfile(mockUser.id)
      } catch (err: any) {
        expect(err.statusCode).toBe(403)
        expect(err.details?.code).toBe("ACCOUNT_DELETED")
      }
    })
  })

  describe("updateUserProfile", () => {
    it("should update profile fields and recalculate composite display name", async () => {
      const updated = await userService.updateUserProfile(mockUser.id, {
        firstName: "Alexander",
        lastName: "Great",
        gender: "other",
        country: "GB",
        avatarUrl: "https://example.com/new-avatar.png",
      })

      expect(updated.firstName).toBe("Alexander")
      expect(updated.lastName).toBe("Great")
      expect(updated.name).toBe("Alexander Great")
      expect(updated.gender).toBe("other")
      expect(updated.country).toBe("GB")
      expect(updated.avatarUrl).toBe("https://example.com/new-avatar.png")
      expect(updated).not.toHaveProperty("passwordHash")
    })

    it("should throw 404 if updating non-existent user", async () => {
      await expect(
        userService.updateUserProfile("unknown-user", { firstName: "Test" })
      ).rejects.toThrow("User account not found.")
    })
  })

  describe("deleteOwnAccount", () => {
    it("should soft-delete user account and purge all active sessions", async () => {
      const result = await userService.deleteOwnAccount(mockUser.id)

      expect(result.success).toBe(true)
      expect(result.message).toContain("Account has been deleted successfully")

      const userInDb = usersDb.get(mockUser.id)
      expect(userInDb?.status).toBe("deleted")
      expect(mockSessionRepo.deleteSessionsByUserId).toHaveBeenCalledWith(
        mockUser.id
      )
    })

    it("should throw 400 if user account is already deleted", async () => {
      usersDb.set(mockUser.id, { ...mockUser, status: "deleted" })

      await expect(
        userService.deleteOwnAccount(mockUser.id)
      ).rejects.toThrow("Account has already been deleted.")
    })
  })

  describe("restoreAccount", () => {
    it("should restore a soft-deleted account back to active status", async () => {
      usersDb.set(mockUser.id, { ...mockUser, status: "deleted" })

      const result = await userService.restoreAccount(mockUser.id)

      expect(result.success).toBe(true)
      expect(result.user.status).toBe("active")

      const userInDb = usersDb.get(mockUser.id)
      expect(userInDb?.status).toBe("active")
    })

    it("should return early if account is already active", async () => {
      const result = await userService.restoreAccount(mockUser.id)

      expect(result.success).toBe(true)
      expect(result.message).toBe("Account is already active.")
      expect(result.user.status).toBe("active")
    })
  })
})
