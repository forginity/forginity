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
  tokenSecret?: string // Random session secret for rotation verification
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
  googleId?: string
  avatarUrl?: string
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

/**
 * 6. Google Auth Contracts
 */
export interface GoogleTokenClaims {
  sub: string
  email: string
  email_verified?: boolean
  name?: string
  picture?: string
  given_name?: string
  family_name?: string
}

export interface GoogleAuthNewUserResult {
  success: true
  isNewUser: true
  isOnboarded: false
  user: SanitizedUser
  onboardingToken: string
}

export interface GoogleAuthPendingOnboardingResult {
  success: true
  isNewUser: false
  isOnboarded: false
  user: SanitizedUser
  onboardingToken: string
}

export interface GoogleAuthOnboardedResult {
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

export type GoogleAuthResult =
  | GoogleAuthNewUserResult
  | GoogleAuthPendingOnboardingResult
  | GoogleAuthOnboardedResult

export type AuthErrorCode =
  | "ACCOUNT_BLOCKED"
  | "ACCOUNT_DELETED"
  | "USER_NOT_FOUND"
  | "INVALID_TOKEN"
  | "TOKEN_EXPIRED"
  | "INVALID_CREDENTIALS"
  | "VALIDATION_ERROR"
  | "SESSION_NOT_FOUND"
  | "SESSION_EXPIRED"
  | "SESSION_REVOKED"
  | "UNAUTHORIZED"
  | "FORBIDDEN"
  | "ALREADY_ONBOARDED"

export interface AuthErrorDetails {
  code: AuthErrorCode
  issues?: Array<{ field: string; message: string }>
}

/**
 * 6. Session Service Contracts
 */
export interface RefreshSessionInput {
  refreshToken: string
}

export interface SwitchProductInput {
  productId: string
  section?: string
}

export interface RevokeSessionInput {
  refreshToken?: string
  sessionId?: string
}

export interface SessionTokensResult {
  success: true
  session: {
    accessToken: string
    refreshToken: string
    expiresIn: number
  }
}

export interface SwitchProductResult {
  success: true
  accessToken: string
  currentProductId: string
  currentSection?: string | null
  expiresIn: number
}

export interface SessionInfo {
  id: string
  userId: string
  currentProductId: string | null
  currentSection: string | null
  ipAddress: string | null
  userAgent: string | null
  deviceType: string | null
  expiresAt: Date
  lastActiveAt: Date
  createdAt: Date
}

export interface SessionMeResult {
  success: true
  user: SanitizedUser
  session: SessionInfo
}

/**
 * 7. Onboarding Service Contracts
 */
export interface OnboardingResult {
  success: true
  user: SanitizedUser
  session: {
    accessToken: string
    refreshToken: string
    expiresIn: number
  }
}
