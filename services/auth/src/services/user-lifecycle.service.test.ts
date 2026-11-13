import { describe, it, expect, beforeEach, vi } from "vitest"
import {
  UserLifecycleService,
  UserLifecycleServiceError,
} from "./user-lifecycle.service.js"
import type { UserRepository } from "../repositories/user.repository.js"
import type { SessionRepository } from "../repositories/session.repository.js"
import type { User } from "../db/auth.schema.js"

describe("UserLifecycleService Unit Tests", () => {
  let mockUsers: Map<string, User>
  let mockUserRepo: UserRepository
  let mockSessionRepo: SessionRepository
  let lifecycleService: UserLifecycleService

  const testUserId = "550e8400-e29b-41d4-a716-446655440001"

  beforeEach(() => {
    mockUsers = new Map()

    const activeUser: User = {
      id: testUserId,
      email: "rider@forginity.com",
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
    mockUsers.set(testUserId, activeUser)

    mockUserRepo = {
      async findUserById(id: string) {
        return mockUsers.get(id) || null
      },
      async updateUser(id: string, input: any) {
        const existing = mockUsers.get(id)
        if (!existing) return null
        const updated = { ...existing, ...input, updatedAt: new Date() }
        mockUsers.set(id, updated)
        return updated
      },
    } as unknown as UserRepository

    mockSessionRepo = {
      deleteSessionsByUserId: vi.fn().mockResolvedValue(true),
    } as unknown as SessionRepository

    lifecycleService = new UserLifecycleService(mockUserRepo, mockSessionRepo)
  })

  describe("deleteOwnAccount", () => {
    it("should soft-delete active user account and purge all active sessions", async () => {
      const result = await lifecycleService.deleteOwnAccount(testUserId)

      expect(result.success).toBe(true)
      expect(result.message).toContain("Account has been deleted successfully")

      // Verify user status is flipped to deleted
      const user = mockUsers.get(testUserId)
      expect(user?.status).toBe("deleted")

      // Verify session purge was triggered
      expect(mockSessionRepo.deleteSessionsByUserId).toHaveBeenCalledWith(testUserId)
    })

    it("should throw 404 USER_NOT_FOUND when user does not exist", async () => {
      await expect(
        lifecycleService.deleteOwnAccount("non-existent-user-id")
      ).rejects.toThrowError(UserLifecycleServiceError)

      try {
        await lifecycleService.deleteOwnAccount("non-existent-user-id")
      } catch (err: any) {
        expect(err.statusCode).toBe(404)
        expect(err.details?.code).toBe("USER_NOT_FOUND")
      }
    })

    it("should throw 400 ACCOUNT_DELETED when user is already deleted", async () => {
      mockUsers.set(testUserId, {
        ...mockUsers.get(testUserId)!,
        status: "deleted",
      })

      try {
        await lifecycleService.deleteOwnAccount(testUserId)
      } catch (err: any) {
        expect(err.statusCode).toBe(400)
        expect(err.details?.code).toBe("ACCOUNT_DELETED")
      }
    })
  })

  describe("restoreAccount", () => {
    it("should restore a deleted account back to active status", async () => {
      mockUsers.set(testUserId, {
        ...mockUsers.get(testUserId)!,
        status: "deleted",
      })

      const result = await lifecycleService.restoreAccount(testUserId)

      expect(result.success).toBe(true)
      expect(result.user.status).toBe("active")
      expect(result.message).toContain("restored successfully")
    })

    it("should return message if account is already active", async () => {
      const result = await lifecycleService.restoreAccount(testUserId)

      expect(result.success).toBe(true)
      expect(result.message).toBe("Account is already active.")
      expect(result.user.status).toBe("active")
    })

    it("should throw 404 USER_NOT_FOUND when restoring non-existent user", async () => {
      try {
        await lifecycleService.restoreAccount("non-existent-user-id")
      } catch (err: any) {
        expect(err.statusCode).toBe(404)
        expect(err.details?.code).toBe("USER_NOT_FOUND")
      }
    })
  })
})
