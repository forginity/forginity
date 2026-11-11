import crypto from "node:crypto"
import { UserRepository, userRepository } from "../repositories/user.repository.js"
import { SessionRepository, sessionRepository } from "../repositories/session.repository.js"
import { OtpService, otpService } from "./otp.service.js"
import {
  signAccessToken,
  signRefreshToken,
  signOnboardingToken,
} from "../utils/token.utils.js"
import type { User } from "../db/auth.schema.js"
import type {
  InitiateEmailAuthInput,
  VerifyEmailAuthInput,
} from "../db/auth.validator.js"
import type {
  SanitizedUser,
  InitiateEmailAuthResult,
  VerifyEmailAuthResult,
  AuthErrorDetails,
} from "../types/auth.types.js"

export class AuthServiceError extends Error {
  public statusCode: number
  public details?: AuthErrorDetails

  constructor(
    message: string,
    statusCode: number = 400,
    details?: AuthErrorDetails
  ) {
    super(message)
    this.name = "AuthServiceError"
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

export class AuthService {
  private userRepo: UserRepository
  private sessionRepo: SessionRepository
  private otp: OtpService

  constructor(
    userRepo: UserRepository = userRepository,
    sessionRepo: SessionRepository = sessionRepository,
    otp: OtpService = otpService
  ) {
    this.userRepo = userRepo
    this.sessionRepo = sessionRepo
    this.otp = otp
  }

  /**
   * Unified initiate endpoint for both sign-up and sign-in.
   * Checks whether the user exists, verifies moderation status,
   * dispatches a 6-digit OTP code, and returns isNewUser: true | false.
   */
  async initiateEmailAuth(
    input: InitiateEmailAuthInput
  ): Promise<InitiateEmailAuthResult> {
    const normalizedEmail = input.email.toLowerCase().trim()

    // 1. Query existing user
    const existingUser = await this.userRepo.findUserByEmail(normalizedEmail)

    // 2. Account moderation checks
    if (existingUser) {
      if (existingUser.status === "blocked") {
        throw new AuthServiceError(
          "Account is blocked. Please contact support.",
          403,
          { code: "ACCOUNT_BLOCKED" }
        )
      }
      if (existingUser.status === "deleted") {
        throw new AuthServiceError("Account has been deleted.", 403, {
          code: "ACCOUNT_DELETED",
        })
      }
    }

    const isNewUser = !existingUser

    // 3. Dispatch OTP via reusable OTP engine
    const otpResult = await this.otp.sendOtp({
      identifier: normalizedEmail,
      identifierType: "email",
      purpose: "authentication",
    })

    return {
      success: true,
      isNewUser,
      requestId: otpResult.requestId,
      expiresInSeconds: otpResult.expiresInSeconds,
      cooldownSeconds: otpResult.cooldownSeconds,
      ...(otpResult.debugOtp ? { debugOtp: otpResult.debugOtp } : {}),
    }
  }

  /**
   * Unified verification endpoint for both sign-up and sign-in.
   * Validates code against requestId via OTP engine.
   * - If new user: registers active account, issues scoped 2-hour onboardingToken.
   * - If returning onboarded user: creates session, issues accessToken (15m) + refreshToken (30d).
   * - If returning un-onboarded user: issues scoped 2-hour onboardingToken.
   */
  async verifyEmailAuth(
    input: VerifyEmailAuthInput,
    context?: { ipAddress?: string; userAgent?: string }
  ): Promise<VerifyEmailAuthResult> {
    // 1. Validate OTP code against requestId
    const otpVerification = await this.otp.verifyOtp({
      requestId: input.requestId,
      code: input.code,
    })

    const userEmail = otpVerification.identifier.toLowerCase().trim()

    // 2. Query user by verified email
    let user = await this.userRepo.findUserByEmail(userEmail)

    // 3. Case: Brand new user registration
    if (!user) {
      user = await this.userRepo.createUser({
        email: userEmail,
        authProvider: "email_otp",
        isVerified: true,
        isEmailVerified: true,
        isPhoneVerified: false,
        isOnboarded: false,
        status: "active",
      })

      const onboardingToken = await signOnboardingToken({
        userId: user.id,
        email: user.email!,
      })

      return {
        success: true,
        isNewUser: true,
        isOnboarded: false,
        user: sanitizeUser(user),
        onboardingToken,
      }
    }

    // 4. Case: Existing user checks
    if (user.status === "blocked") {
      throw new AuthServiceError(
        "Account is blocked. Please contact support.",
        403,
        { code: "ACCOUNT_BLOCKED" }
      )
    }

    if (user.status === "deleted") {
      throw new AuthServiceError("Account has been deleted.", 403, {
        code: "ACCOUNT_DELETED",
      })
    }

    // Update email verified flag if not already set
    if (!user.isEmailVerified || !user.isVerified) {
      const updated = await this.userRepo.updateUser(user.id, {
        isEmailVerified: true,
        isVerified: true,
      })
      if (updated) {
        user = updated
      }
    }

    // 5. Case: Returning user who completed onboarding -> Issue full session
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
      })

      const accessToken = await signAccessToken({
        userId: user.id,
        email: user.email!,
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
          expiresIn: 900, // 15 minutes- use for access Token
        },
      }
    }

    // 6. Case: Returning user who hasn't completed onboarding -> Issue onboarding token
    const onboardingToken = await signOnboardingToken({
      userId: user.id,
      email: user.email!,
    })

    return {
      success: true,
      isNewUser: false,
      isOnboarded: false,
      user: sanitizeUser(user),
      onboardingToken,
    }
  }
}

export const authService = new AuthService()
