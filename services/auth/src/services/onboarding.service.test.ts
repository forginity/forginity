import { describe, it, expect, beforeEach } from "vitest"
import { OnboardingService, OnboardingServiceError } from "./onboarding.service.js"
import type { UserRepository } from "../repositories/user.repository.js"
import type { SessionRepository } from "../repositories/session.repository.js"
import type { User, Session } from "../db/auth.schema.js"
import { verifyJwtToken } from "../utils/token.utils.js"
import type {
  AccessTokenPayload,
  RefreshTokenPayload,
} from "../types/auth.types.js"

describe("OnboardingService Unit Tests", () => {
  let mockUsers: Map<string, User>
  let mockSessions: Map<string, Session>
  let mockUserRepo: UserRepository
  let mockSessionRepo: SessionRepository
  let onboardingService: OnboardingService

  const testUserId = "550e8400-e29b-41d4-a716-446655440001"

  beforeEach(() => {
    mockUsers = new Map()
    mockSessions = new Map()

    const initialUser: User = {
      id: testUserId,
      email: "newrider@forginity.com",
      phone: null,
      name: null,
      passwordHash: null,
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
      userType: "user",
      status: "active",
      createdAt: new Date(),
      updatedAt: new Date(),
    }
    mockUsers.set(testUserId, initialUser)

    mockUserRepo = {
      async findUserById(id: string) {
        return mockUsers.get(id) || null
      },
      async findUserByEmail() {
        return null
      },
      async createUser() {
        throw new Error("Not implemented in mock")
      },
      async updateUser(id: string, input: any) {
        const u = mockUsers.get(id)
        if (!u) return null
        const updated = { ...u, ...input, updatedAt: new Date() }
        mockUsers.set(id, updated)
        return updated
      },
      async deleteUserById(id: string) {
        return mockUsers.delete(id)
      },
      async checkConnection() {
        return true
      },
    } as unknown as UserRepository

    mockSessionRepo = {
      async createSession(input: any) {
        const id = `session-${Math.random().toString(16).slice(2)}`
        const session: Session = {
          id,
          userId: input.userId,
          sessionTokenHash: input.sessionTokenHash,
          currentProductId: input.currentProductId || null,
          currentSection: input.currentSection || null,
          ipAddress: input.ipAddress || null,
          userAgent: input.userAgent || null,
          deviceType: input.deviceType || null,
          expiresAt: input.expiresAt,
          lastActiveAt: new Date(),
          createdAt: new Date(),
        }
        mockSessions.set(id, session)
        return session
      },
      async findSessionById(id: string) {
        return mockSessions.get(id) || null
      },
      async findSessionByTokenHash(tokenHash: string) {
        for (const s of mockSessions.values()) {
          if (s.sessionTokenHash === tokenHash) return s
        }
        return null
      },
      async findSessionsByUserId(userId: string) {
        return Array.from(mockSessions.values()).filter(
          (s) => s.userId === userId
        )
      },
      async updateSession(id: string, input: any) {
        const existing = mockSessions.get(id)
        if (!existing) return null
        const updated = { ...existing, ...input, lastActiveAt: new Date() }
        mockSessions.set(id, updated)
        return updated
      },
      async deleteSession(id: string) {
        return mockSessions.delete(id)
      },
      async deleteSessionsByUserId(userId: string) {
        let count = 0
        for (const [id, s] of mockSessions.entries()) {
          if (s.userId === userId) {
            mockSessions.delete(id)
            count++
          }
        }
        return count
      },
      async checkConnection() {
        return true
      },
    } as unknown as SessionRepository

    onboardingService = new OnboardingService(mockUserRepo, mockSessionRepo)
  })

  describe("completeOnboarding", () => {
    it("should successfully update profile fields, set isOnboarded: true, and issue session tokens", async () => {
      const res = await onboardingService.completeOnboarding(
        testUserId,
        {
          firstName: "Alex",
          lastName: "Rider",
          gender: "male",
          country: "US",
        },
        { ipAddress: "127.0.0.1", userAgent: "Vitest/1.0" }
      )

      expect(res.success).toBe(true)
      expect(res.user.id).toBe(testUserId)
      expect(res.user.firstName).toBe("Alex")
      expect(res.user.lastName).toBe("Rider")
      expect(res.user.name).toBe("Alex Rider")
      expect(res.user.gender).toBe("male")
      expect(res.user.country).toBe("US")
      expect(res.user.isOnboarded).toBe(true)

      // Verify that session tokens are returned
      expect(res.session).toBeDefined()
      expect(res.session.accessToken).toBeDefined()
      expect(res.session.refreshToken).toBeDefined()
      expect(res.session.expiresIn).toBe(900)

      // Verify Access JWT claims
      const accessPayload = await verifyJwtToken<AccessTokenPayload>(
        res.session.accessToken,
        "access"
      )
      expect(accessPayload.sub).toBe(testUserId)
      expect(accessPayload.email).toBe("newrider@forginity.com")
      expect(accessPayload.scope).toBe("access")

      // Verify Refresh JWT claims
      const refreshPayload = await verifyJwtToken<RefreshTokenPayload>(
        res.session.refreshToken,
        "refresh"
      )
      expect(refreshPayload.sub).toBe(testUserId)
      expect(refreshPayload.scope).toBe("refresh")

      // Verify DB session record was created
      expect(mockSessions.size).toBe(1)
      const createdSession = Array.from(mockSessions.values())[0]
      expect(createdSession.userId).toBe(testUserId)
      expect(createdSession.ipAddress).toBe("127.0.0.1")
    })

    it("should throw 401 USER_NOT_FOUND if user does not exist", async () => {
      await expect(
        onboardingService.completeOnboarding("550e8400-e29b-41d4-a716-000000000000", {
          firstName: "John",
          lastName: "Doe",
          gender: "male",
          country: "US",
        })
      ).rejects.toThrow("User account not found.")
    })

    it("should throw 403 ACCOUNT_BLOCKED if user account is blocked", async () => {
      const u = mockUsers.get(testUserId)!
      u.status = "blocked"

      await expect(
        onboardingService.completeOnboarding(testUserId, {
          firstName: "John",
          lastName: "Doe",
          gender: "male",
          country: "US",
        })
      ).rejects.toThrow("Account is blocked. Please contact support.")
    })

    it("should throw 403 ACCOUNT_DELETED if user account is deleted", async () => {
      const u = mockUsers.get(testUserId)!
      u.status = "deleted"

      await expect(
        onboardingService.completeOnboarding(testUserId, {
          firstName: "John",
          lastName: "Doe",
          gender: "male",
          country: "US",
        })
      ).rejects.toThrow("Account has been deleted.")
    })
  })
})
