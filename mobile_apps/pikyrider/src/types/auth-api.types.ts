/**
 * Authentication API Types & Contracts
 * Authoritative Source of Truth: services/auth/README.md
 */

export interface InitiateEmailAuthPayload {
  email: string;
  productName?: string;
  intent?: "authentication" | "sign_in";
  userType?: "user" | "admin";
}

export interface InitiateEmailAuthResponse {
  success: boolean;
  isNewUser: boolean;
  requestId: string;
  expiresInSeconds: number;
  cooldownSeconds: number;
  debugOtp?: string;
}

export interface VerifyEmailAuthPayload {
  requestId: string;
  code: string;
  intent?: "authentication" | "sign_in";
  userType?: "user" | "admin";
}

export interface UserProfileSummary {
  id: string;
  email: string;
  phone?: string | null;
  name?: string | null;
  username?: string | null;
  firstName?: string | null;
  lastName?: string | null;
  gender?: string | null;
  country?: string | null;
  avatarUrl?: string | null;
  authProvider: string;
  isVerified: boolean;
  isEmailVerified: boolean;
  isPhoneVerified: boolean;
  isOnboarded: boolean;
  userType: string;
  status: string;
  createdAt: string;
  updatedAt: string;
}

export interface SessionData {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
}

export interface VerifyEmailAuthResponse {
  success: boolean;
  isNewUser: boolean;
  isOnboarded: boolean;
  user: UserProfileSummary;
  onboardingToken?: string;
  session?: SessionData;
}

export interface OnboardingPayload {
  username?: string;
  firstName: string;
  lastName: string;
  gender: "male" | "female" | "other" | "prefer_not_to_say";
  country: string;
}

export interface CheckUsernameResponse {
  success: boolean;
  available: boolean;
  username: string;
}

export interface OnboardingResponse {
  success: boolean;
  user: UserProfileSummary;
  session: SessionData;
}

export interface RefreshSessionPayload {
  refreshToken: string;
}

export interface RefreshSessionResponse {
  success: boolean;
  session: SessionData;
}

export interface RevokeSessionPayload {
  refreshToken?: string;
}

export interface RevokeSessionResponse {
  success: boolean;
  message: string;
}

export interface SessionInfo {
  userId: string;
  currentProductId?: string | null;
  currentSection?: string | null;
  deviceType?: string | null;
  expiresAt: string;
}

export interface SessionMeResponse {
  success: boolean;
  session: SessionInfo;
  user: UserProfileSummary;
}

export interface AuthApiErrorResponse {
  error: string;
  code?: string;
  remainingAttempts?: number;
  maxAttempts?: number;
  issues?: { field: string; message: string }[];
}
