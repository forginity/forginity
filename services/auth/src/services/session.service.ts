import crypto from "node:crypto"
import { sessionRepository, type SessionRepository } from "../repositories/session.repository.js"
import { userRepository, type UserRepository } from "../repositories/user.repository.js"
import {
  signAccessToken,
  signRefreshToken,
  verifyJwtToken,
} from "../utils/token.utils.js"
import type {
  RefreshTokenPayload,
  RefreshSessionInput,
  SwitchProductInput,
  RevokeSessionInput,
  SessionTokensResult,
  SwitchProductResult,
  SessionMeResult,
  SessionInfo,
  SanitizedUser,
  AuthErrorCode,
} from "../types/auth.types.js"
import type { Session, User } from "../db/auth.schema.js"

export class SessionServiceError extends Error {
  statusCode: number
  code: AuthErrorCode
  issues?: Array<{ field: string; message: string }>

  constructor(
    message: string,
    statusCode = 400,
    code: AuthErrorCode = "VALIDATION_ERROR",
    issues?: Array<{ field: string; message: string }>
  ) {
    super(message)
    this.name = "SessionServiceError"
    this.statusCode = statusCode
    this.code = code
    this.issues = issues
  }
}

function sanitizeUser(user: User): SanitizedUser {
  const { passwordHash, ...sanitized } = user
  return sanitized
}

function formatSessionInfo(session: Session): SessionInfo {
  return {
    id: session.id,
    userId: session.userId,
    currentProductId: session.currentProductId,
    currentSection: session.currentSection,
    ipAddress: session.ipAddress,
    userAgent: session.userAgent,
    deviceType: session.deviceType,
    expiresAt: session.expiresAt,
    lastActiveAt: session.lastActiveAt,
    createdAt: session.createdAt,
  }
}

export class SessionService {
  private sessionRepo: SessionRepository
  private userRepo: UserRepository

  constructor(
    sessionRepo: SessionRepository = sessionRepository,
    userRepo: UserRepository = userRepository
  ) {
    this.sessionRepo = sessionRepo
    this.userRepo = userRepo
  }

  /**
   * Refreshes user session with Token Rotation.
   * Validates refresh token JWT, checks session standing in DB, checks token secret
   * to detect token replay/reuse, rotates session token secret, and issues new tokens.
   */
  async refreshSession(
    input: RefreshSessionInput,
    context?: { ipAddress?: string; userAgent?: string }
  ): Promise<SessionTokensResult> {
    let payload: RefreshTokenPayload
    try {
      payload = await verifyJwtToken<RefreshTokenPayload>(
        input.refreshToken,
        "refresh"
      )
    } catch (err: any) {
      throw new SessionServiceError(
        err?.message || "Invalid or expired refresh token.",
        401,
        "INVALID_TOKEN"
      )
    }

    const session = await this.sessionRepo.findSessionById(payload.sessionId)
    if (!session) {
      throw new SessionServiceError(
        "Session not found or has been revoked.",
        401,
        "SESSION_NOT_FOUND"
      )
    }

    // Check expiration
    if (new Date(session.expiresAt).getTime() <= Date.now()) {
      await this.sessionRepo.deleteSession(session.id)
      throw new SessionServiceError(
        "Session has expired. Please sign in again.",
        401,
        "SESSION_EXPIRED"
      )
    }

    // Check user account standing
    const user = await this.userRepo.findUserById(session.userId)
    if (!user) {
      await this.sessionRepo.deleteSession(session.id)
      throw new SessionServiceError("User account not found.", 401, "USER_NOT_FOUND")
    }

    if (user.status === "blocked") {
      throw new SessionServiceError(
        "Account is blocked. Please contact support.",
        403,
        "ACCOUNT_BLOCKED"
      )
    }

    if (user.status === "deleted") {
      throw new SessionServiceError("Account has been deleted.", 403, "ACCOUNT_DELETED")
    }

    // Verify token secret match for rotation reuse detection
    if (payload.tokenSecret) {
      const incomingHash = crypto
        .createHash("sha256")
        .update(payload.tokenSecret)
        .digest("hex")

      if (incomingHash !== session.sessionTokenHash) {
        // Reuse detected! Immediate revocation to prevent replay attacks
        await this.sessionRepo.deleteSession(session.id)
        throw new SessionServiceError(
          "Invalid refresh token. Token reuse detected. Session revoked.",
          401,
          "INVALID_TOKEN"
        )
      }
    }

    // Rotate session secret
    const newSessionTokenBytes = crypto.randomBytes(32).toString("hex")
    const newSessionTokenHash = crypto
      .createHash("sha256")
      .update(newSessionTokenBytes)
      .digest("hex")

    const newExpiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30 days

    await this.sessionRepo.updateSession(session.id, {
      sessionTokenHash: newSessionTokenHash,
      expiresAt: newExpiresAt,
      lastActiveAt: new Date(),
      ipAddress: context?.ipAddress || session.ipAddress,
      userAgent: context?.userAgent || session.userAgent,
    })

    const accessToken = await signAccessToken({
      userId: user.id,
      email: user.email!,
      currentProductId: session.currentProductId || undefined,
      userType: user.userType,
      role: user.userType,
    })

    const refreshToken = await signRefreshToken({
      userId: user.id,
      sessionId: session.id,
      tokenSecret: newSessionTokenBytes,
    })

    return {
      success: true,
      session: {
        accessToken,
        refreshToken,
        expiresIn: 900,
      },
    }
  }

  /**
   * Switches product context for an active user session.
   * Updates session record with new productId and returns updated access token.
   */
  async switchProduct(
    userId: string,
    input: SwitchProductInput,
    preferredSessionId?: string
  ): Promise<SwitchProductResult> {
    const user = await this.userRepo.findUserById(userId)
    if (!user) {
      throw new SessionServiceError("User account not found.", 401, "USER_NOT_FOUND")
    }

    if (user.status === "blocked") {
      throw new SessionServiceError(
        "Account is blocked. Please contact support.",
        403,
        "ACCOUNT_BLOCKED"
      )
    }

    let targetSession: Session | null = null
    if (preferredSessionId) {
      targetSession = await this.sessionRepo.findSessionById(preferredSessionId)
    }

    if (!targetSession) {
      const userSessions = await this.sessionRepo.findSessionsByUserId(userId)
      targetSession = userSessions[0] || null
    }

    if (targetSession) {
      await this.sessionRepo.updateSession(targetSession.id, {
        currentProductId: input.productId,
        currentSection: input.section || null,
        lastActiveAt: new Date(),
      })
    }

    const accessToken = await signAccessToken({
      userId: user.id,
      email: user.email!,
      currentProductId: input.productId,
      userType: user.userType,
      role: user.userType,
    })

    return {
      success: true,
      accessToken,
      currentProductId: input.productId,
      currentSection: input.section || null,
      expiresIn: 900,
    }
  }

  /**
   * Revokes a single session by session ID or refresh token.
   */
  async revokeSession(
    input: RevokeSessionInput,
    preferredSessionId?: string
  ): Promise<{ success: true; message: string }> {
    let targetSessionId = preferredSessionId

    if (!targetSessionId && input.refreshToken) {
      try {
        const payload = await verifyJwtToken<RefreshTokenPayload>(
          input.refreshToken,
          "refresh"
        )
        targetSessionId = payload.sessionId
      } catch {
        // Idempotent return for invalid or expired tokens
        return { success: true, message: "Session successfully revoked." }
      }
    }

    if (targetSessionId) {
      await this.sessionRepo.deleteSession(targetSessionId)
    }

    return { success: true, message: "Session successfully revoked." }
  }

  /**
   * Revokes all active sessions for a user (global logout).
   */
  async revokeAllSessions(
    userId: string
  ): Promise<{ success: true; message: string; revokedCount: number }> {
    const revokedCount = await this.sessionRepo.deleteSessionsByUserId(userId)
    return {
      success: true,
      message: "All user sessions successfully revoked.",
      revokedCount,
    }
  }

  /**
   * Retrieves active session info and profile for the authenticated user.
   */
  async getCurrentSession(
    userId: string,
    preferredSessionId?: string
  ): Promise<SessionMeResult> {
    const user = await this.userRepo.findUserById(userId)
    if (!user) {
      throw new SessionServiceError("User account not found.", 401, "USER_NOT_FOUND")
    }

    let session: Session | null = null
    if (preferredSessionId) {
      session = await this.sessionRepo.findSessionById(preferredSessionId)
    }

    if (!session) {
      const userSessions = await this.sessionRepo.findSessionsByUserId(userId)
      session = userSessions[0] || null
    }

    if (!session) {
      throw new SessionServiceError(
        "No active session found for user.",
        404,
        "SESSION_NOT_FOUND"
      )
    }

    return {
      success: true,
      user: sanitizeUser(user),
      session: formatSessionInfo(session),
    }
  }
}

export const sessionService = new SessionService()
