import crypto from "node:crypto"
import { UserRepository, userRepository } from "../repositories/user.repository.js"
import { SessionRepository, sessionRepository } from "../repositories/session.repository.js"
import {
  defaultGoogleTokenVerifier,
  type GoogleTokenVerifier,
} from "../utils/google.utils.js"
import {
  signAccessToken,
  signRefreshToken,
  signOnboardingToken,
} from "../utils/token.utils.js"
import type { User } from "../db/auth.schema.js"
import type { GoogleAuthInput } from "../db/auth.validator.js"
import type {
  SanitizedUser,
  GoogleTokenClaims,
  GoogleAuthResult,
  AuthErrorDetails,
} from "../types/auth.types.js"

export class GoogleAuthServiceError extends Error {
  public statusCode: number
  public details?: AuthErrorDetails

  constructor(
    message: string,
    statusCode: number = 400,
    details?: AuthErrorDetails
  ) {
    super(message)
    this.name = "GoogleAuthServiceError"
    this.statusCode = statusCode
    this.details = details
  }

  toJSON() {
    return {
      error: this.message,
      ...(this.details?.code ? { code: this.details.code } : {}),
      ...(this.details?.issues ? { issues: this.details.issues } : {}),
    }
  }
}

export function sanitizeUser(user: User): SanitizedUser {
  const { passwordHash: _unused, ...sanitized } = user
  return sanitized
}

export class GoogleAuthService {
  private userRepo: UserRepository
  private sessionRepo: SessionRepository
  private verifier: GoogleTokenVerifier

  constructor(
    userRepo: UserRepository = userRepository,
    sessionRepo: SessionRepository = sessionRepository,
    verifier: GoogleTokenVerifier = defaultGoogleTokenVerifier
  ) {
    this.userRepo = userRepo
    this.sessionRepo = sessionRepo
    this.verifier = verifier
  }

  /**
   * Authenticates or registers a user via Google OAuth 2.0 / OIDC ID token.
   * - Verifies token cryptographically using remote JWKS.
   * - Deterministically links identity by Google ID or verified email.
   * - Checks account moderation standing (blocked/deleted return 403).
   * - If onboarded: provisions session and returns accessToken + refreshToken.
   * - If pending onboarding: returns scoped 2-hour onboardingToken.
   */
  async authenticateGoogle(
    input: GoogleAuthInput,
    context?: { ipAddress?: string; userAgent?: string }
  ): Promise<GoogleAuthResult> {
    // 1. Verify Google ID token
    let claims: GoogleTokenClaims
    try {
      claims = await this.verifier.verify(input.idToken)
    } catch (error: any) {
      throw new GoogleAuthServiceError(
        error?.message || "Invalid Google ID token.",
        401,
        { code: "INVALID_TOKEN" }
      )
    }

    // 2. Query user by Google subject ID
    let user = await this.userRepo.findUserByGoogleId(claims.sub)
    let isNewUser = false

    // 3. Fallback: Query by email for deterministic account linking
    if (!user) {
      const existingUserByEmail = await this.userRepo.findUserByEmail(claims.email)
      if (existingUserByEmail) {
        const updated = await this.userRepo.updateUser(existingUserByEmail.id, {
          googleId: claims.sub,
          isEmailVerified: true,
          isVerified: true,
          ...(existingUserByEmail.name ? {} : claims.name ? { name: claims.name } : {}),
          ...(existingUserByEmail.firstName ? {} : claims.given_name ? { firstName: claims.given_name } : {}),
          ...(existingUserByEmail.lastName ? {} : claims.family_name ? { lastName: claims.family_name } : {}),
          ...(existingUserByEmail.avatarUrl ? {} : claims.picture ? { avatarUrl: claims.picture } : {}),
        })
        user = updated || existingUserByEmail
      }
    }

    // 4. Create new user account if neither Google ID nor email matched
    if (!user) {
      isNewUser = true
      user = await this.userRepo.createUser({
        email: claims.email,
        name: claims.name,
        firstName: claims.given_name,
        lastName: claims.family_name,
        avatarUrl: claims.picture,
        googleId: claims.sub,
        authProvider: "google",
        isVerified: true,
        isEmailVerified: true,
        isPhoneVerified: false,
        isOnboarded: false,
        status: "active",
      })
    }

    // 5. Account moderation checks
    if (user.status === "blocked") {
      throw new GoogleAuthServiceError(
        "Account is blocked. Please contact support.",
        403,
        { code: "ACCOUNT_BLOCKED" }
      )
    }

    if (user.status === "deleted") {
      throw new GoogleAuthServiceError(
        "Account has been deleted.",
        403,
        { code: "ACCOUNT_DELETED" }
      )
    }

    // 6. Returning onboarded user -> Issue full production session
    if (user.isOnboarded) {
      const sessionTokenBytes = crypto.randomBytes(32).toString("hex")
      const sessionTokenHash = crypto
        .createHash("sha256")
        .update(sessionTokenBytes)
        .digest("hex")

      const sessionExpiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30 days

      const sessionRecord = await this.sessionRepo.createSession({
        userId: user.id,
        sessionTokenHash,
        expiresAt: sessionExpiresAt,
        ipAddress: context?.ipAddress,
        userAgent: context?.userAgent,
        currentProductId: input.productId,
      })

      const accessToken = await signAccessToken({
        userId: user.id,
        email: user.email!,
        currentProductId: input.productId,
        role: user.status,
      })

      const refreshToken = await signRefreshToken({
        userId: user.id,
        sessionId: sessionRecord.id,
        tokenSecret: sessionTokenBytes,
      })

      return {
        success: true,
        isNewUser: false,
        isOnboarded: true,
        user: sanitizeUser(user),
        session: {
          accessToken,
          refreshToken,
          expiresIn: 900, // 15 minutes
        },
      }
    }

    // 7. New or un-onboarded user -> Issue scoped 2-hour onboarding token
    const onboardingToken = await signOnboardingToken({
      userId: user.id,
      email: user.email!,
    })

    return {
      success: true,
      isNewUser,
      isOnboarded: false,
      user: sanitizeUser(user),
      onboardingToken,
    }
  }
}

export const googleAuthService = new GoogleAuthService()
