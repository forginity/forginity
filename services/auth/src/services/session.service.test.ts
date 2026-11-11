import { describe, it, expect, beforeEach } from "vitest"
import crypto from "node:crypto"
import { SessionService, SessionServiceError } from "./session.service.js"
import type { SessionRepository } from "../repositories/session.repository.js"
import type { UserRepository } from "../repositories/user.repository.js"
import type { Session, User } from "../db/auth.schema.js"
import {
  signAccessToken,
  signRefreshToken,
  verifyJwtToken,
} from "../utils/token.utils.js"
import type {
  AccessTokenPayload,
  RefreshTokenPayload,
} from "../types/auth.types.js"

describe("SessionService Unit Tests", () => {
  let mockUsers: Map<string, User>
  let mockSessions: Map<string, Session>
  let mockUserRepo: UserRepository
  let mockSessionRepo: SessionRepository
  let sessionService: SessionService

  const testUserId = "550e8400-e29b-41d4-a716-446655440001"
  const testSessionId = "550e8400-e29b-41d4-a716-446655440002"
  const testSecret = "initial_secret_token_1234567890abcdef"
  const testSecretHash = crypto
    .createHash("sha256")
    .update(testSecret)
    .digest("hex")

  beforeEach(() => {
    mockUsers = new Map()
    mockSessions = new Map()

    const initialUser: User = {
      id: testUserId,
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
      status: "active",
      createdAt: new Date(),
      updatedAt: new Date(),
    }
    mockUsers.set(testUserId, initialUser)

    const initialSession: Session = {
      id: testSessionId,
      userId: testUserId,
      sessionTokenHash: testSecretHash,
      currentProductId: "550e8400-e29b-41d4-a716-446655440003",
      currentSection: "dashboard",
      ipAddress: "127.0.0.1",
      userAgent: "Vitest/1.0",
      deviceType: "desktop",
      expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
      lastActiveAt: new Date(),
      createdAt: new Date(),
    }
    mockSessions.set(testSessionId, initialSession)

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
      async updateLastActive(id: string) {
        const existing = mockSessions.get(id)
        if (existing) {
          existing.lastActiveAt = new Date()
        }
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
    } as unknown as SessionRepository

    sessionService = new SessionService(mockSessionRepo, mockUserRepo)
  })

  describe("refreshSession", () => {
    it("should successfully refresh session with token rotation", async () => {
      const validRefreshToken = await signRefreshToken({
        userId: testUserId,
        sessionId: testSessionId,
        tokenSecret: testSecret,
      })

      const result = await sessionService.refreshSession({
        refreshToken: validRefreshToken,
      })

      expect(result.success).toBe(true)
      expect(result.session.accessToken).toBeDefined()
      expect(result.session.refreshToken).toBeDefined()
      expect(result.session.expiresIn).toBe(900)

      // Verify the new access token
      const accessPayload = await verifyJwtToken<AccessTokenPayload>(
        result.session.accessToken,
        "access"
      )
      expect(accessPayload.sub).toBe(testUserId)
      expect(accessPayload.email).toBe("rider@forginity.com")

      // Verify that database sessionTokenHash has rotated
      const updatedSession = mockSessions.get(testSessionId)!
      expect(updatedSession.sessionTokenHash).not.toBe(testSecretHash)

      // Verify that the new refresh token is valid and contains new rotated secret
      const newRefreshPayload = await verifyJwtToken<RefreshTokenPayload>(
        result.session.refreshToken,
        "refresh"
      )
      expect(newRefreshPayload.sessionId).toBe(testSessionId)
      expect(newRefreshPayload.tokenSecret).toBeDefined()
    })

    it("should detect refresh token reuse and immediately revoke the session", async () => {
      // First refresh: rotates the token
      const originalToken = await signRefreshToken({
        userId: testUserId,
        sessionId: testSessionId,
        tokenSecret: testSecret,
      })

      await sessionService.refreshSession({ refreshToken: originalToken })

      // Second attempt to use the same old token (replay attack simulation)
      await expect(
        sessionService.refreshSession({ refreshToken: originalToken })
      ).rejects.toThrow("Invalid refresh token. Token reuse detected. Session revoked.")

      // Session must be deleted from database
      expect(mockSessions.get(testSessionId)).toBeUndefined()
    })

    it("should reject expired session in database with 401 SESSION_EXPIRED", async () => {
      // Set session to expired in mock DB
      const expiredSession = mockSessions.get(testSessionId)!
      expiredSession.expiresAt = new Date(Date.now() - 1000)

      const refreshToken = await signRefreshToken({
        userId: testUserId,
        sessionId: testSessionId,
        tokenSecret: testSecret,
      })

      await expect(
        sessionService.refreshSession({ refreshToken })
      ).rejects.toThrow("Session has expired. Please sign in again.")

      expect(mockSessions.get(testSessionId)).toBeUndefined()
    })

    it("should reject non-existent session with 401 SESSION_NOT_FOUND", async () => {
      mockSessions.delete(testSessionId)

      const refreshToken = await signRefreshToken({
        userId: testUserId,
        sessionId: testSessionId,
        tokenSecret: testSecret,
      })

      await expect(
        sessionService.refreshSession({ refreshToken })
      ).rejects.toThrow("Session not found or has been revoked.")
    })

    it("should reject refresh if user account is blocked", async () => {
      const user = mockUsers.get(testUserId)!
      user.status = "blocked"

      const refreshToken = await signRefreshToken({
        userId: testUserId,
        sessionId: testSessionId,
        tokenSecret: testSecret,
      })

      await expect(
        sessionService.refreshSession({ refreshToken })
      ).rejects.toThrow("Account is blocked. Please contact support.")
    })

    it("should reject refresh if user account is deleted", async () => {
      const user = mockUsers.get(testUserId)!
      user.status = "deleted"

      const refreshToken = await signRefreshToken({
        userId: testUserId,
        sessionId: testSessionId,
        tokenSecret: testSecret,
      })

      await expect(
        sessionService.refreshSession({ refreshToken })
      ).rejects.toThrow("Account has been deleted.")
    })
  })

  describe("switchProduct", () => {
    it("should update currentProductId and issue an updated access token", async () => {
      const newProductId = "550e8400-e29b-41d4-a716-446655440099"

      const res = await sessionService.switchProduct(testUserId, {
        productId: newProductId,
        section: "routes",
      })

      expect(res.success).toBe(true)
      expect(res.currentProductId).toBe(newProductId)
      expect(res.currentSection).toBe("routes")
      expect(res.expiresIn).toBe(900)

      const payload = await verifyJwtToken<AccessTokenPayload>(
        res.accessToken,
        "access"
      )
      expect(payload.sub).toBe(testUserId)
      expect(payload.productId).toBe(newProductId)

      // Confirm DB was updated
      const session = mockSessions.get(testSessionId)!
      expect(session.currentProductId).toBe(newProductId)
      expect(session.currentSection).toBe("routes")
    })
  })

  describe("revokeSession", () => {
    it("should delete session by preferredSessionId", async () => {
      const res = await sessionService.revokeSession({}, testSessionId)
      expect(res.success).toBe(true)
      expect(mockSessions.get(testSessionId)).toBeUndefined()
    })

    it("should delete session by valid refresh token", async () => {
      const token = await signRefreshToken({
        userId: testUserId,
        sessionId: testSessionId,
      })

      const res = await sessionService.revokeSession({ refreshToken: token })
      expect(res.success).toBe(true)
      expect(mockSessions.get(testSessionId)).toBeUndefined()
    })

    it("should return success idempotently when token is already invalid", async () => {
      const res = await sessionService.revokeSession({
        refreshToken: "invalid.token.payload",
      })
      expect(res.success).toBe(true)
    })
  })

  describe("revokeAllSessions", () => {
    it("should delete all active sessions for a user", async () => {
      // Add a second session for the user
      const secondSession: Session = {
        ...mockSessions.get(testSessionId)!,
        id: "session-2",
      }
      mockSessions.set("session-2", secondSession)

      expect(mockSessions.size).toBe(2)

      const res = await sessionService.revokeAllSessions(testUserId)
      expect(res.success).toBe(true)
      expect(res.revokedCount).toBe(2)
      expect(mockSessions.size).toBe(0)
    })
  })

  describe("getCurrentSession", () => {
    it("should return sanitized user and formatted session info", async () => {
      const res = await sessionService.getCurrentSession(testUserId, testSessionId)
      expect(res.success).toBe(true)
      expect(res.user.id).toBe(testUserId)
      expect(res.user.email).toBe("rider@forginity.com")
      expect((res.user as any).passwordHash).toBeUndefined()
      expect(res.session.id).toBe(testSessionId)
      expect(res.session.currentSection).toBe("dashboard")
    })

    it("should throw 404 when user has no active session", async () => {
      mockSessions.clear()

      await expect(
        sessionService.getCurrentSession(testUserId)
      ).rejects.toThrow("No active session found for user.")
    })
  })
})
