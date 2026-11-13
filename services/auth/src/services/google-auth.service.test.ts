import { describe, it, expect, beforeEach } from "vitest"
import {
  GoogleAuthService,
  GoogleAuthServiceError,
} from "./google-auth.service.js"
import type { UserRepository } from "../repositories/user.repository.js"
import type { SessionRepository } from "../repositories/session.repository.js"
import type { GoogleTokenVerifier } from "../utils/google.utils.js"
import type { User, Session } from "../db/auth.schema.js"
import { verifyJwtToken } from "../utils/token.utils.js"
import type {
  OnboardingTokenPayload,
  AccessTokenPayload,
  GoogleTokenClaims,
} from "../types/auth.types.js"

describe("GoogleAuthService Unit Tests", () => {
  let mockUsers: Map<string, User>
  let mockSessions: Map<string, Session>
  let mockUserRepo: UserRepository
  let mockSessionRepo: SessionRepository
  let mockVerifier: GoogleTokenVerifier
  let googleAuthService: GoogleAuthService

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
      async findUserByGoogleId(googleId: string) {
        for (const user of mockUsers.values()) {
          if (user.googleId === googleId) {
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
          avatarUrl: input.avatarUrl || null,
          googleId: input.googleId || null,
          authProvider: input.authProvider || "google",
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
    } as unknown as SessionRepository

    mockVerifier = {
      async verify(idToken: string): Promise<GoogleTokenClaims> {
        if (idToken === "invalid-token") {
          throw new Error("Invalid signature or expired token")
        }
        if (idToken === "unverified-email-token") {
          throw new Error("Google email address is not verified")
        }
        if (idToken === "existing-google-onboarded-token") {
          return {
            sub: "google-sub-onboarded",
            email: "onboarded@forginity.com",
            email_verified: true,
            name: "Onboarded Rider",
            picture: "https://lh3.googleusercontent.com/avatar1",
            given_name: "Onboarded",
            family_name: "Rider",
          }
        }
        if (idToken === "existing-google-pending-token") {
          return {
            sub: "google-sub-pending",
            email: "pending@forginity.com",
            email_verified: true,
            name: "Pending Rider",
            picture: "https://lh3.googleusercontent.com/avatar2",
            given_name: "Pending",
            family_name: "Rider",
          }
        }
        if (idToken === "link-account-token") {
          return {
            sub: "google-sub-link",
            email: "emailuser@forginity.com",
            email_verified: true,
            name: "Email User",
            picture: "https://lh3.googleusercontent.com/avatar3",
            given_name: "Email",
            family_name: "User",
          }
        }
        if (idToken === "blocked-user-token") {
          return {
            sub: "google-sub-blocked",
            email: "blocked@forginity.com",
            email_verified: true,
            name: "Blocked User",
          }
        }
        if (idToken === "deleted-user-token") {
          return {
            sub: "google-sub-deleted",
            email: "deleted@forginity.com",
            email_verified: true,
            name: "Deleted User",
          }
        }

        // Default valid token claims for brand new user
        return {
          sub: "google-sub-brand-new",
          email: "brandnew@forginity.com",
          email_verified: true,
          name: "Brand New",
          picture: "https://lh3.googleusercontent.com/avatar-new",
          given_name: "Brand",
          family_name: "New",
        }
      },
    }

    googleAuthService = new GoogleAuthService(
      mockUserRepo,
      mockSessionRepo,
      mockVerifier
    )
  })

  it("should register a brand new user and return a 2-hour onboardingToken", async () => {
    const result = await googleAuthService.authenticateGoogle({
      idToken: "valid-brand-new-token",
    })

    expect(result.success).toBe(true)
    expect(result.isNewUser).toBe(true)
    expect(result.isOnboarded).toBe(false)
    expect("onboardingToken" in result).toBe(true)
    expect(result.user.email).toBe("brandnew@forginity.com")
    expect(result.user.name).toBe("Brand New")
    expect(result.user.firstName).toBe("Brand")
    expect(result.user.lastName).toBe("New")
    expect(result.user.avatarUrl).toBe("https://lh3.googleusercontent.com/avatar-new")
    expect(result.user.googleId).toBe("google-sub-brand-new")
    expect(result.user.authProvider).toBe("google")
    expect(result.user.isEmailVerified).toBe(true)
    expect(result.user.isVerified).toBe(true)

    // Verify token validity and scope
    const payload = await verifyJwtToken<OnboardingTokenPayload>(
      (result as any).onboardingToken,
      "onboarding"
    )
    expect(payload.sub).toBe(result.user.id)
    expect(payload.scope).toBe("onboarding")
  })

  it("should authenticate returning onboarded user and return active session tokens", async () => {
    const existing = await mockUserRepo.createUser({
      email: "onboarded@forginity.com",
      googleId: "google-sub-onboarded",
      name: "Onboarded Rider",
      authProvider: "google",
      isOnboarded: true,
      status: "active",
    })

    const result = await googleAuthService.authenticateGoogle(
      {
        idToken: "existing-google-onboarded-token",
        productId: "550e8400-e29b-41d4-a716-446655440000",
      },
      { ipAddress: "192.168.1.1", userAgent: "Mozilla/5.0" }
    )

    expect(result.success).toBe(true)
    expect(result.isNewUser).toBe(false)
    expect(result.isOnboarded).toBe(true)
    expect("session" in result).toBe(true)

    const sessionRes = (result as any).session
    expect(sessionRes.accessToken).toBeDefined()
    expect(sessionRes.refreshToken).toBeDefined()
    expect(sessionRes.expiresIn).toBe(900)

    // Verify access token
    const accessPayload = await verifyJwtToken<AccessTokenPayload>(
      sessionRes.accessToken,
      "access"
    )
    expect(accessPayload.sub).toBe(existing.id)
    expect(accessPayload.productId).toBe("550e8400-e29b-41d4-a716-446655440000")
    expect(accessPayload.scope).toBe("access")

    // Verify session repository record
    expect(mockSessions.size).toBe(1)
    const storedSession = Array.from(mockSessions.values())[0]
    expect(storedSession.userId).toBe(existing.id)
    expect(storedSession.ipAddress).toBe("192.168.1.1")
    expect(storedSession.userAgent).toBe("Mozilla/5.0")
    expect(storedSession.currentProductId).toBe(
      "550e8400-e29b-41d4-a716-446655440000"
    )
  })

  it("should return onboardingToken for returning un-onboarded user", async () => {
    await mockUserRepo.createUser({
      email: "pending@forginity.com",
      googleId: "google-sub-pending",
      name: "Pending Rider",
      authProvider: "google",
      isOnboarded: false,
      status: "active",
    })

    const result = await googleAuthService.authenticateGoogle({
      idToken: "existing-google-pending-token",
    })

    expect(result.success).toBe(true)
    expect(result.isNewUser).toBe(false)
    expect(result.isOnboarded).toBe(false)
    expect("onboardingToken" in result).toBe(true)
    expect("session" in result).toBe(false)
  })

  it("should perform deterministic account linking when user with same email exists without googleId", async () => {
    const existing = await mockUserRepo.createUser({
      email: "emailuser@forginity.com",
      authProvider: "email_otp",
      isOnboarded: true,
      status: "active",
    })
    expect(existing.googleId).toBeNull()

    const result = await googleAuthService.authenticateGoogle({
      idToken: "link-account-token",
    })

    expect(result.success).toBe(true)
    expect(result.isNewUser).toBe(false)
    expect(result.isOnboarded).toBe(true)

    // Verify user record in repository has been linked
    const updatedUser = await mockUserRepo.findUserById(existing.id)
    expect(updatedUser?.googleId).toBe("google-sub-link")
    expect(updatedUser?.isEmailVerified).toBe(true)
    expect(updatedUser?.avatarUrl).toBe("https://lh3.googleusercontent.com/avatar3")
  })

  it("should reject blocked users with 403 ACCOUNT_BLOCKED", async () => {
    await mockUserRepo.createUser({
      email: "blocked@forginity.com",
      googleId: "google-sub-blocked",
      status: "blocked",
      isOnboarded: true,
    })

    await expect(
      googleAuthService.authenticateGoogle({
        idToken: "blocked-user-token",
      })
    ).rejects.toThrowError(GoogleAuthServiceError)

    try {
      await googleAuthService.authenticateGoogle({
        idToken: "blocked-user-token",
      })
    } catch (err: any) {
      expect(err.statusCode).toBe(403)
      expect(err.details?.code).toBe("ACCOUNT_BLOCKED")
    }
  })

  it("should reject deleted users with 403 ACCOUNT_DELETED", async () => {
    await mockUserRepo.createUser({
      email: "deleted@forginity.com",
      googleId: "google-sub-deleted",
      status: "deleted",
      isOnboarded: true,
    })

    try {
      await googleAuthService.authenticateGoogle({
        idToken: "deleted-user-token",
      })
    } catch (err: any) {
      expect(err.statusCode).toBe(403)
      expect(err.details?.code).toBe("ACCOUNT_DELETED")
    }
  })

  it("should throw 401 INVALID_TOKEN when verifier throws signature or expiration error", async () => {
    try {
      await googleAuthService.authenticateGoogle({
        idToken: "invalid-token",
      })
    } catch (err: any) {
      expect(err.statusCode).toBe(401)
      expect(err.details?.code).toBe("INVALID_TOKEN")
      expect(err.message).toBe("Invalid signature or expired token")
    }
  })

  it("should throw 401 INVALID_TOKEN when email is unverified by Google", async () => {
    try {
      await googleAuthService.authenticateGoogle({
        idToken: "unverified-email-token",
      })
    } catch (err: any) {
      expect(err.statusCode).toBe(401)
      expect(err.details?.code).toBe("INVALID_TOKEN")
      expect(err.message).toBe("Google email address is not verified")
    }
  })
})
