export type UserStatus = "active" | "blocked" | "deleted"
export type UserType = "user" | "admin"
export type AuthIntent = "authentication" | "sign_in"

export interface UserProfile {
  id: string
  email: string | null
  phone: string | null
  name: string | null
  firstName: string | null
  lastName: string | null
  avatarUrl: string | null
  gender: string | null
  country: string | null
  isEmailVerified: boolean
  isPhoneVerified: boolean
  isOnboarded: boolean
  userType: UserType
  status: UserStatus
  createdAt: string
  updatedAt: string
}

export interface SessionData {
  sessionId: string
  userId: string
  accessToken: string
  refreshToken?: string
  expiresAt: string
}

export interface InitiateEmailAuthPayload {
  email: string
  intent?: AuthIntent
  userType?: UserType
  productName?: string
}

export interface InitiateEmailAuthResponse {
  success: boolean
  message: string
  requestId: string
  isNewUser: boolean
  expiresInSeconds: number
  cooldownSeconds: number
  debugOtp?: string
}

export interface VerifyEmailAuthPayload {
  requestId: string
  code: string
  intent?: AuthIntent
  userType?: UserType
}

export interface VerifyEmailAuthResponse {
  success: boolean
  message: string
  isNewUser: boolean
  isOnboarded: boolean
  onboardingToken?: string
  user: UserProfile
  session?: SessionData
}

export interface SessionMeResponse {
  success: boolean
  session: {
    id: string
    userId: string
    currentProductId: string | null
    currentSection: string | null
    ipAddress: string | null
    deviceType: string | null
    expiresAt: string
  }
  user: UserProfile
}

export interface RefreshSessionPayload {
  refreshToken?: string
}

export interface RefreshSessionResponse {
  success: boolean
  session: SessionData
}

export interface RevokeSessionPayload {
  refreshToken?: string
}

export interface ListUsersParams {
  status?: UserStatus
  userType?: UserType
  search?: string
  page?: number
  limit?: number
}

export interface ListUsersResponse {
  success: boolean
  users: UserProfile[]
  pagination: {
    total: number
    page: number
    limit: number
    totalPages: number
  }
}

export interface UpdateUserStatusPayload {
  status: UserStatus
  reason?: string
}
