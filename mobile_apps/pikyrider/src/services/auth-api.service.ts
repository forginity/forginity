import { Platform } from "react-native";
import Constants from "expo-constants";
import type {
  InitiateEmailAuthPayload,
  InitiateEmailAuthResponse,
  VerifyEmailAuthPayload,
  VerifyEmailAuthResponse,
  GoogleAuthPayload,
  GoogleAuthResponse,
  OnboardingPayload,
  OnboardingResponse,
  CheckUsernameResponse,
  RefreshSessionResponse,
  RevokeSessionResponse,
  SessionMeResponse,
  AuthApiErrorResponse,
  UserProfileSummary,
} from "../types/auth-api.types";

export class AuthApiError extends Error {
  code?: string;
  remainingAttempts?: number;
  statusCode: number;

  constructor(message: string, statusCode = 400, code?: string, remainingAttempts?: number) {
    super(message);
    this.name = "AuthApiError";
    this.statusCode = statusCode;
    this.code = code;
    this.remainingAttempts = remainingAttempts;
  }
}

const isGoogleMockEnabled = (): boolean =>
  process.env.EXPO_PUBLIC_ENABLE_GOOGLE_MOCK === "true";

const createMockUser = (
  isOnboarded = false,
  overrides: Partial<UserProfileSummary> = {}
): UserProfileSummary => ({
  id: "mock-google-user-id",
  email: "alex.rider@gmail.com",
  name: "Alex Rider",
  firstName: "Alex",
  lastName: "Rider",
  username: isOnboarded ? "alexrider" : "alex_7281",
  gender: isOnboarded ? "male" : null,
  country: isOnboarded ? "US" : null,
  avatarUrl:
    "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=200&h=200&q=80",
  authProvider: "google",
  isVerified: true,
  isEmailVerified: true,
  isPhoneVerified: false,
  isOnboarded,
  userType: "user",
  status: "active",
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  ...overrides,
});

class AuthApiService {
  private getBaseUrl(): string {
    if (process.env.EXPO_PUBLIC_AUTH_API_URL) {
      return process.env.EXPO_PUBLIC_AUTH_API_URL;
    }

    // Automatically resolve dev machine IP when running via Expo on physical devices
    const hostUri =
      Constants.expoConfig?.hostUri ||
      (Constants as any).manifest2?.extra?.expoGo?.debuggerHost ||
      (Constants as any).manifest?.debuggerHost;

    if (hostUri) {
      const hostIp = hostUri.split(":")[0];
      if (hostIp && hostIp !== "localhost" && hostIp !== "127.0.0.1") {
        return `http://${hostIp}:3001`;
      }
    }

    // Fallbacks: Android emulator routes host localhost via 10.0.2.2; iOS simulator routes via localhost
    return Platform.select({
      android: "http://10.0.2.2:3001",
      ios: "http://localhost:3001",
      default: "http://localhost:3001",
    });
  }

  /**
   * Safe fetch with request timeout to prevent UI from freezing indefinitely on network disconnects.
   */
  private async fetchWithTimeout(
    url: string,
    options: RequestInit,
    timeoutMs = 12000
  ): Promise<Response> {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

    try {
      const response = await fetch(url, {
        ...options,
        signal: controller.signal,
      });
      return response;
    } catch (err: any) {
      if (err.name === "AbortError") {
        throw new AuthApiError(
          `Request to authentication server timed out (${Math.round(
            timeoutMs / 1000
          )}s). Please ensure your phone is on the same Wi-Fi as your computer (${this.getBaseUrl()}).`,
          408,
          "REQUEST_TIMEOUT"
        );
      }
      throw err;
    } finally {
      clearTimeout(timeoutId);
    }
  }

  /**
   * Dispatches email OTP for passwordless sign-in / sign-up.
   * Authoritative Source: services/auth/README.md -> Group C (POST /api/auth/email/initiate)
   */
  async initiateEmailAuth(
    payload: InitiateEmailAuthPayload
  ): Promise<InitiateEmailAuthResponse> {
    const url = `${this.getBaseUrl()}/api/auth/email/initiate`;

    try {
      const response = await this.fetchWithTimeout(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({
          email: payload.email.trim().toLowerCase(),
          productName: payload.productName || "TrackRide",
          intent: payload.intent || "authentication",
          ...(payload.userType ? { userType: payload.userType } : {}),
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        const errorData = data as AuthApiErrorResponse;
        throw new AuthApiError(
          errorData.error || "Failed to initiate email authentication.",
          response.status,
          errorData.code,
          errorData.remainingAttempts
        );
      }

      return data as InitiateEmailAuthResponse;
    } catch (err: any) {
      if (err instanceof AuthApiError) {
        throw err;
      }
      throw new AuthApiError(
        err?.message ||
          `Unable to connect to authentication server at ${this.getBaseUrl()}. Please ensure your phone and computer share the same Wi-Fi.`,
        500,
        "NETWORK_ERROR"
      );
    }
  }

  /**
   * Verifies the 6-digit OTP code against the active requestId.
   * Authoritative Source: services/auth/README.md -> Group C (POST /api/auth/email/verify)
   */
  async verifyEmailAuth(
    payload: VerifyEmailAuthPayload
  ): Promise<VerifyEmailAuthResponse> {
    const url = `${this.getBaseUrl()}/api/auth/email/verify`;

    try {
      const response = await this.fetchWithTimeout(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({
          requestId: payload.requestId,
          code: payload.code.trim(),
          ...(payload.intent ? { intent: payload.intent } : {}),
          ...(payload.userType ? { userType: payload.userType } : {}),
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        const errorData = data as AuthApiErrorResponse;
        throw new AuthApiError(
          errorData.error || "Failed to verify code.",
          response.status,
          errorData.code,
          errorData.remainingAttempts
        );
      }

      return data as VerifyEmailAuthResponse;
    } catch (err: any) {
      if (err instanceof AuthApiError) {
        throw err;
      }
      throw new AuthApiError(
        err?.message ||
          `Unable to connect to authentication server at ${this.getBaseUrl()}. Please ensure your phone and computer share the same Wi-Fi.`,
        500,
        "NETWORK_ERROR"
      );
    }
  }

  async authenticateGoogle(
    payload: GoogleAuthPayload
  ): Promise<GoogleAuthResponse> {
    if (payload.idToken === "mock.google.id.token" || isGoogleMockEnabled()) {
      const isReturning =
        process.env.EXPO_PUBLIC_GOOGLE_MOCK_RETURNING === "true";

      if (isReturning) {
        return {
          success: true,
          isNewUser: false,
          isOnboarded: true,
          user: createMockUser(true),
          session: {
            accessToken: "mock.access.token",
            refreshToken: "mock.refresh.token",
            expiresIn: 3600,
          },
        };
      }

      return {
        success: true,
        isNewUser: true,
        isOnboarded: false,
        user: createMockUser(false),
        onboardingToken: "mock.onboarding.token",
      };
    }

    const url = `${this.getBaseUrl()}/api/auth/google`;

    try {
      const response = await this.fetchWithTimeout(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({
          idToken: payload.idToken.trim(),
          ...(payload.productId ? { productId: payload.productId } : {}),
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        const errorData = data as AuthApiErrorResponse;
        throw new AuthApiError(
          errorData.error || "Google authentication failed.",
          response.status,
          errorData.code
        );
      }

      return data as GoogleAuthResponse;
    } catch (err: any) {
      if (err instanceof AuthApiError) {
        throw err;
      }
      throw new AuthApiError(
        err?.message ||
          `Unable to authenticate with Google at ${this.getBaseUrl()}. Please check your connection.`,
        500,
        "NETWORK_ERROR"
      );
    }
  }

  async checkUsernameAvailability(
    username: string
  ): Promise<CheckUsernameResponse> {
    const normalized = username.trim().toLowerCase();
    const url = `${this.getBaseUrl()}/api/auth/users/check-username?username=${encodeURIComponent(
      normalized
    )}`;

    try {
      const response = await this.fetchWithTimeout(url, {
        method: "GET",
        headers: {
          Accept: "application/json",
        },
      });

      const data = await response.json();

      if (!response.ok) {
        const errorData = data as AuthApiErrorResponse;
        throw new AuthApiError(
          errorData.error || "Failed to check username availability.",
          response.status,
          errorData.code
        );
      }

      return data as CheckUsernameResponse;
    } catch (err: any) {
      if (err instanceof AuthApiError) {
        throw err;
      }
      throw new AuthApiError(
        err?.message ||
          `Unable to verify username at ${this.getBaseUrl()}. Please check your connection.`,
        500,
        "NETWORK_ERROR"
      );
    }
  }

  /**
   * Completes user profile onboarding with scoped onboardingToken.
   * Authoritative Source: services/auth/README.md -> Group E (POST /api/auth/onboarding)
   */
  async submitOnboarding(
    payload: OnboardingPayload,
    onboardingToken: string
  ): Promise<OnboardingResponse> {
    const normalizedUsername = payload.username?.trim().toLowerCase();

    if (
      onboardingToken.startsWith("mock.") ||
      (isGoogleMockEnabled() && onboardingToken === "mock.onboarding.token")
    ) {
      return {
        success: true,
        user: createMockUser(true, {
          firstName: payload.firstName.trim(),
          lastName: payload.lastName.trim(),
          name: `${payload.firstName.trim()} ${payload.lastName.trim()}`,
          username: normalizedUsername || "alexrider",
          gender: payload.gender,
          country: payload.country.trim().toUpperCase(),
        }),
        session: {
          accessToken: "mock.access.token",
          refreshToken: "mock.refresh.token",
          expiresIn: 3600,
        },
      };
    }

    const url = `${this.getBaseUrl()}/api/auth/onboarding`;

    try {
      const response = await this.fetchWithTimeout(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
          Authorization: `Bearer ${onboardingToken.trim()}`,
        },
        body: JSON.stringify({
          ...(normalizedUsername ? { username: normalizedUsername } : {}),
          firstName: payload.firstName.trim(),
          lastName: payload.lastName.trim(),
          gender: payload.gender,
          country: payload.country.trim().toUpperCase(),
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        const errorData = data as AuthApiErrorResponse;
        throw new AuthApiError(
          errorData.error || "Failed to complete onboarding.",
          response.status,
          errorData.code
        );
      }

      return data as OnboardingResponse;
    } catch (err: any) {
      if (err instanceof AuthApiError) {
        throw err;
      }
      throw new AuthApiError(
        err?.message ||
          `Unable to complete onboarding at ${this.getBaseUrl()}. Please check your connection.`,
        500,
        "NETWORK_ERROR"
      );
    }
  }

  /**
   * Rotates refresh token and returns fresh access token in non-cookie mobile environment.
   * Authoritative Source: services/auth/README.md -> Group F (POST /api/auth/session/refresh)
   */
  async refreshSession(refreshToken: string): Promise<RefreshSessionResponse> {
    if (refreshToken.startsWith("mock.")) {
      return {
        success: true,
        session: {
          accessToken: "mock.access.token",
          refreshToken: "mock.refresh.token",
          expiresIn: 3600,
        },
      };
    }

    const url = `${this.getBaseUrl()}/api/auth/session/refresh`;

    try {
      const response = await this.fetchWithTimeout(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({
          refreshToken: refreshToken.trim(),
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        const errorData = data as AuthApiErrorResponse;
        throw new AuthApiError(
          errorData.error || "Session expired or revoked.",
          response.status,
          errorData.code
        );
      }

      return data as RefreshSessionResponse;
    } catch (err: any) {
      if (err instanceof AuthApiError) {
        throw err;
      }
      throw new AuthApiError(
        err?.message || "Unable to refresh session. Please check your network connection.",
        500,
        "NETWORK_ERROR"
      );
    }
  }

  /**
   * Revokes single device session on backend.
   * Authoritative Source: services/auth/README.md -> Group F (POST /api/auth/session/revoke)
   */
  async revokeSession(
    refreshToken?: string,
    accessToken?: string
  ): Promise<RevokeSessionResponse> {
    if (
      (refreshToken && refreshToken.startsWith("mock.")) ||
      (accessToken && accessToken.startsWith("mock."))
    ) {
      return {
        success: true,
        message: "Session successfully revoked.",
      };
    }

    const url = `${this.getBaseUrl()}/api/auth/session/revoke`;

    try {
      const headers: Record<string, string> = {
        "Content-Type": "application/json",
        Accept: "application/json",
      };
      if (accessToken) {
        headers.Authorization = `Bearer ${accessToken.trim()}`;
      }

      const response = await this.fetchWithTimeout(url, {
        method: "POST",
        headers,
        body: JSON.stringify(
          refreshToken ? { refreshToken: refreshToken.trim() } : {}
        ),
      });

      const data = await response.json();

      if (!response.ok) {
        const errorData = data as AuthApiErrorResponse;
        throw new AuthApiError(
          errorData.error || "Failed to revoke session.",
          response.status,
          errorData.code
        );
      }

      return data as RevokeSessionResponse;
    } catch (err: any) {
      if (err instanceof AuthApiError) {
        throw err;
      }
      throw new AuthApiError(
        err?.message || "Unable to revoke session. Please check your network connection.",
        500,
        "NETWORK_ERROR"
      );
    }
  }

  /**
   * Retrieves active session details and user profile for cold-start hydration.
   * Authoritative Source: services/auth/README.md -> Group F (GET /api/auth/session/me)
   */
  async getCurrentSession(accessToken: string): Promise<SessionMeResponse> {
    if (accessToken.startsWith("mock.")) {
      return {
        success: true,
        user: createMockUser(true),
        session: {
          userId: "mock-google-user-id",
          currentProductId: null,
          currentSection: null,
          deviceType: "mobile",
          expiresAt: new Date(Date.now() + 3600 * 1000).toISOString(),
        },
      };
    }

    const url = `${this.getBaseUrl()}/api/auth/session/me`;

    try {
      const response = await this.fetchWithTimeout(url, {
        method: "GET",
        headers: {
          Accept: "application/json",
          Authorization: `Bearer ${accessToken.trim()}`,
        },
      });

      const data = await response.json();

      if (!response.ok) {
        const errorData = data as AuthApiErrorResponse;
        throw new AuthApiError(
          errorData.error || "Failed to retrieve session details.",
          response.status,
          errorData.code
        );
      }

      return data as SessionMeResponse;
    } catch (err: any) {
      if (err instanceof AuthApiError) {
        throw err;
      }
      throw new AuthApiError(
        err?.message || "Unable to retrieve session profile. Please check your network connection.",
        500,
        "NETWORK_ERROR"
      );
    }
  }
}

export const authApiService = new AuthApiService();
