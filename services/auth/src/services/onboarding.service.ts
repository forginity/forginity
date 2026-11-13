import crypto from "node:crypto"
import { userRepository, type UserRepository } from "../repositories/user.repository.js"
import { sessionRepository, type SessionRepository } from "../repositories/session.repository.js"
import { signAccessToken, signRefreshToken } from "../utils/token.utils.js"
import type {
  OnboardingResult,
  SanitizedUser,
  AuthErrorCode,
} from "../types/auth.types.js"
import type { OnboardingProfileInput } from "../db/auth.validator.js"
import type { User } from "../db/auth.schema.js"

export class OnboardingServiceError extends Error {
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
    this.name = "OnboardingServiceError"
    this.statusCode = statusCode
    this.code = code
    this.issues = issues
  }
}

function sanitizeUser(user: User): SanitizedUser {
  const { passwordHash, ...sanitized } = user
  return sanitized
}

export class OnboardingService {
  private userRepo: UserRepository
  private sessionRepo: SessionRepository

  constructor(
    userRepo: UserRepository = userRepository,
    sessionRepo: SessionRepository = sessionRepository
  ) {
    this.userRepo = userRepo
    this.sessionRepo = sessionRepo
  }

  /**
   * Completes user profile onboarding and upgrades to an active production session.
   */
  async completeOnboarding(
    userId: string,
    input: OnboardingProfileInput,
    context?: { ipAddress?: string; userAgent?: string }
  ): Promise<OnboardingResult> {
    const user = await this.userRepo.findUserById(userId)
    if (!user) {
      throw new OnboardingServiceError("User account not found.", 401, "USER_NOT_FOUND")
    }

    if (user.status === "blocked") {
      throw new OnboardingServiceError(
        "Account is blocked. Please contact support.",
        403,
        "ACCOUNT_BLOCKED"
      )
    }

    if (user.status === "deleted") {
      throw new OnboardingServiceError(
        "Account has been deleted.",
        403,
        "ACCOUNT_DELETED"
      )
    }

    const fullName = `${input.firstName} ${input.lastName}`.trim()

    const updatedUser = await this.userRepo.updateUser(user.id, {
      firstName: input.firstName,
      lastName: input.lastName,
      name: fullName,
      gender: input.gender,
      country: input.country,
      isOnboarded: true,
    })

    // Establish full production session
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

    const userRole = updatedUser?.userType || user.userType || "user"
    const accessToken = await signAccessToken({
      userId: user.id,
      email: user.email!,
      role: userRole,
      userType: userRole,
    })

    const refreshToken = await signRefreshToken({
      userId: user.id,
      sessionId: sessionRecord.id,
      tokenSecret: sessionTokenBytes,
    })

    return {
      success: true,
      user: sanitizeUser(updatedUser || user),
      session: {
        accessToken,
        refreshToken,
        expiresIn: 900,
      },
    }
  }
}

export const onboardingService = new OnboardingService()
