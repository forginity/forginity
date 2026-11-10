import type { JWTPayload } from "jose"
import type { User, Session, NewUser } from "../db/auth.schema.js"
import type {
  InitiateEmailAuthInput,
  VerifyEmailAuthInput,
} from "../db/auth.validator.js"

/**
 * 1. Sanitized User Entity (Password Hash Excluded)
 */
export type SanitizedUser = Omit<User, "passwordHash">

/**
 * 2. Token Payloads & Contracts
 */
export interface AccessTokenPayload extends JWTPayload {
  sub: string // User UUID
  email: string
  scope: "access"
  productId?: string
  role?: string
}

export interface RefreshTokenPayload extends JWTPayload {
  sub: string // User UUID
  sessionId: string // Session UUID
  scope: "refresh"
}

export interface OnboardingTokenPayload extends JWTPayload {
  sub: string // User UUID
  email: string
  scope: "onboarding"
}

export type JwtPayloadType =
  | AccessTokenPayload
  | RefreshTokenPayload
  | OnboardingTokenPayload

/**
 * 3. User Repository Contracts
 */
export interface CreateUserInput {
  email: string
  name?: string
  authProvider?: string
  isVerified?: boolean
  isEmailVerified?: boolean
  isPhoneVerified?: boolean
  isOnboarded?: boolean
  status?: string
  firstName?: string
  lastName?: string
  gender?: string
  country?: string
}

export interface UpdateUserInput extends Partial<NewUser> {}

/**
 * 4. Session Repository Contracts
 */
export interface CreateSessionRecordInput {
  userId: string
  sessionTokenHash: string
  expiresAt: Date
  currentProductId?: string
  currentSection?: string
  ipAddress?: string
  userAgent?: string
  deviceType?: string
}

/**
 * 5. Auth Service Contracts
 */
export interface InitiateEmailAuthResult {
  success: boolean
  isNewUser: boolean
  requestId: string
  expiresInSeconds: number
  cooldownSeconds: number
  debugOtp?: string
}

export interface VerifyEmailAuthNewUserResult {
  success: true
  isNewUser: true
  isOnboarded: false
  user: SanitizedUser
  onboardingToken: string
}

export interface VerifyEmailAuthPendingOnboardingResult {
  success: true
  isNewUser: false
  isOnboarded: false
  user: SanitizedUser
  onboardingToken: string
}

export interface VerifyEmailAuthOnboardedResult {
  success: true
  isNewUser: false
  isOnboarded: true
  user: SanitizedUser
  session: {
    accessToken: string
    refreshToken: string
    expiresIn: number
  }
}

export type VerifyEmailAuthResult =
  | VerifyEmailAuthNewUserResult
  | VerifyEmailAuthPendingOnboardingResult
  | VerifyEmailAuthOnboardedResult

export type AuthErrorCode =
  | "ACCOUNT_BLOCKED"
  | "ACCOUNT_DELETED"
  | "USER_NOT_FOUND"
  | "INVALID_TOKEN"
  | "TOKEN_EXPIRED"
  | "INVALID_CREDENTIALS"
  | "VALIDATION_ERROR"

export interface AuthErrorDetails {
  code: AuthErrorCode
  issues?: Array<{ field: string; message: string }>
}
