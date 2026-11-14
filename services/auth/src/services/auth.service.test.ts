import { describe, it, expect, beforeEach, vi } from "vitest"
import { AuthService, AuthServiceError } from "./auth.service.js"
import type { UserRepository } from "../repositories/user.repository.js"
import type { SessionRepository } from "../repositories/session.repository.js"
import type { OtpService } from "./otp.service.js"
import type { User, Session } from "../db/auth.schema.js"
import { verifyJwtToken } from "../utils/token.utils.js"
import type { OnboardingTokenPayload, AccessTokenPayload } from "../types/auth.types.js"

describe("AuthService Unit Tests", () => {
  let mockUsers: Map<string, User>
  let mockSessions: Map<string, Session>
  let mockUserRepo: UserRepository
  let mockSessionRepo: SessionRepository
  let mockOtpService: OtpService
  let authService: AuthService

  beforeEach(() => {
    mockUsers = new Map()
    mockSessions = new Map()

    mockUserRepo = {
      async findUserById(id: string) {
        return mockUsers.get(id) || null
      },
      async findUserByEmail(email: string) {
        const normalized = email.toLowerCase().trim()
        for (const user of mockUsers.values()) {
          if (user.email?.toLowerCase().trim() === normalized) {
            return user
          }
        }
        return null
      },
      async createUser(input: any) {
        const id = `550e8400-e29b-41d4-a716-${Math.random().toString(16).slice(2, 14).padEnd(12, "0")}`
        const user: User = {
          id,
          email: input.email,
          phone: input.phone || null,
          name: input.name || null,
          passwordHash: null,
          firstName: input.firstName || null,
          lastName: input.lastName || null,
          gender: input.gender || null,
          country: input.country || null,
          avatarUrl: null,
          googleId: null,
          authProvider: input.authProvider || "email_otp",
          isVerified: input.isVerified ?? false,
          isEmailVerified: input.isEmailVerified ?? false,
          isPhoneVerified: input.isPhoneVerified ?? false,
          isOnboarded: input.isOnboarded ?? false,
          userType: input.userType || "user",
          status: input.status || "active",
          createdAt: new Date(),
          updatedAt: new Date(),
        }
        mockUsers.set(id, user)
        return user
      },
      async updateUser(id: string, input: any) {
        const existing = mockUsers.get(id)
        if (!existing) return null
        const updated = { ...existing, ...input, updatedAt: new Date() }
        mockUsers.set(id, updated)
        return updated
      },
      async checkConnection() {
        return true
      },
    } as unknown as UserRepository

    mockSessionRepo = {
      async createSession(input: any) {
        const id = `550e8400-e29b-41d4-a716-${Math.random().toString(16).slice(2, 14).padEnd(12, "0")}`
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
      async findSessionByTokenHash() {
        return null
      },
      async updateLastActive() {},
      async deleteSession(id: string) {
        return mockSessions.delete(id)
      },
      async deleteSessionsByUserId() {
        return 0
      },
    } as unknown as SessionRepository

    mockOtpService = {
      async sendOtp(options: any) {
        return {
          success: true,
          requestId: "550e8400-e29b-41d4-a716-446655440000",
          expiresInSeconds: 600,
          cooldownSeconds: 60,
          debugOtp: "123456",
        }
      },
      async verifyOtp(options: any) {
        return {
          verified: true,
          requestId: options.requestId,
          identifier: "rider@forginity.com",
          identifierType: "email",
          purpose: "authentication",
        }
      },
    } as unknown as OtpService

    authService = new AuthService(mockUserRepo, mockSessionRepo, mockOtpService)
  })

  describe("initiateEmailAuth", () => {
    it("should return isNewUser: true for an unregistered email address", async () => {
      const res = await authService.initiateEmailAuth({
        email: "brandnew@forginity.com",
      })

      expect(res.success).toBe(true)
      expect(res.isNewUser).toBe(true)
      expect(res.requestId).toBe("550e8400-e29b-41d4-a716-446655440000")
      expect(res.expiresInSeconds).toBe(600)
      expect(res.cooldownSeconds).toBe(60)
    })

    it("should return isNewUser: false for an existing registered email address", async () => {
      await mockUserRepo.createUser({
        email: "existing@forginity.com",
        isOnboarded: true,
      })

      const res = await authService.initiateEmailAuth({
        email: "existing@forginity.com",
      })

      expect(res.success).toBe(true)
      expect(res.isNewUser).toBe(false)
      expect(res.requestId).toBeDefined()
    })

    it("should throw 403 ACCOUNT_BLOCKED if user account is blocked", async () => {
      await mockUserRepo.createUser({
        email: "blocked@forginity.com",
        status: "blocked",
      })

      await expect(
        authService.initiateEmailAuth({ email: "blocked@forginity.com" })
      ).rejects.toThrow("Account is blocked. Please contact support.")
    })

    it("should throw 403 ACCOUNT_DELETED if user account is deleted", async () => {
      await mockUserRepo.createUser({
        email: "deleted@forginity.com",
        status: "deleted",
      })

      await expect(
        authService.initiateEmailAuth({ email: "deleted@forginity.com" })
      ).rejects.toThrow("Account has been deleted.")
    })
  })

  describe("verifyEmailAuth", () => {
    it("should register new user and issue onboardingToken when user does not exist", async () => {
      const res = await authService.verifyEmailAuth({
        requestId: "550e8400-e29b-41d4-a716-446655440000",
        code: "123456",
      })

      expect(res.success).toBe(true)
      expect(res.isNewUser).toBe(true)
      expect(res.isOnboarded).toBe(false)
      expect(res.user.email).toBe("rider@forginity.com")
      expect(res.user.isVerified).toBe(true)
      expect(res.user.isEmailVerified).toBe(true)
      expect(res.user.isPhoneVerified).toBe(false)
      expect(res.user.isOnboarded).toBe(false)
      expect((res as any).onboardingToken).toBeDefined()

      // Verify the onboarding token
      const tokenPayload = await verifyJwtToken<OnboardingTokenPayload>(
        (res as any).onboardingToken,
        "onboarding"
      )
      expect(tokenPayload.sub).toBe(res.user.id)
      expect(tokenPayload.email).toBe("rider@forginity.com")
      expect(tokenPayload.scope).toBe("onboarding")
    })

    it("should return onboardingToken when existing user has not completed onboarding", async () => {
      const created = await mockUserRepo.createUser({
        email: "rider@forginity.com",
        isOnboarded: false,
        isVerified: false,
      })

      const res = await authService.verifyEmailAuth({
        requestId: "550e8400-e29b-41d4-a716-446655440000",
        code: "123456",
      })

      expect(res.success).toBe(true)
      expect(res.isNewUser).toBe(false)
      expect(res.isOnboarded).toBe(false)
      expect(res.user.id).toBe(created.id)
      expect((res as any).onboardingToken).toBeDefined()
    })

    it("should create session and issue access/refresh tokens when user is fully onboarded", async () => {
      const created = await mockUserRepo.createUser({
        email: "rider@forginity.com",
        isOnboarded: true,
        firstName: "Vikas",
        lastName: "Sharma",
      })

      const res = await authService.verifyEmailAuth(
        {
          requestId: "550e8400-e29b-41d4-a716-446655440000",
          code: "123456",
        },
        { ipAddress: "127.0.0.1", userAgent: "Vitest/1.0" }
      )

      expect(res.success).toBe(true)
      expect(res.isNewUser).toBe(false)
      expect(res.isOnboarded).toBe(true)
      expect(res.user.id).toBe(created.id)
      expect((res as any).session).toBeDefined()
      expect((res as any).session.accessToken).toBeDefined()
      expect((res as any).session.refreshToken).toBeDefined()
      expect((res as any).session.expiresIn).toBe(900)

      // Verify access token
      const accessPayload = await verifyJwtToken<AccessTokenPayload>(
        (res as any).session.accessToken,
        "access"
      )
      expect(accessPayload.sub).toBe(created.id)
      expect(accessPayload.email).toBe("rider@forginity.com")
    })

    it("should reject verification if account is blocked", async () => {
      await mockUserRepo.createUser({
        email: "rider@forginity.com",
        status: "blocked",
      })

      await expect(
        authService.verifyEmailAuth({
          requestId: "550e8400-e29b-41d4-a716-446655440000",
          code: "123456",
        })
      ).rejects.toThrow("Account is blocked. Please contact support.")
    })
  })
})
