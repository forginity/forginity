import { authClient } from "../../core/http-client"
import { API_ENDPOINTS } from "../../constants/endpoints"
import type {
  InitiateEmailAuthPayload,
  InitiateEmailAuthResponse,
  VerifyEmailAuthPayload,
  VerifyEmailAuthResponse,
  SessionMeResponse,
  RefreshSessionPayload,
  RefreshSessionResponse,
  RevokeSessionPayload,
  ListUsersParams,
  ListUsersResponse,
  UserProfile,
  UserDetailsResponse,
  UpdateUserStatusPayload,
} from "./auth.types"

export class AuthService {
  /**
   * Dispatches a 6-digit one-time code to the target email.
   */
  static async initiateEmailAuth(
    payload: InitiateEmailAuthPayload
  ): Promise<InitiateEmailAuthResponse> {
    const response = await authClient.post<InitiateEmailAuthResponse>(
      API_ENDPOINTS.AUTH.INITIATE,
      payload
    )
    return response.data
  }

  /**
   * Verifies the 6-digit code against an active requestId.
   * On returning user, backend sets the HTTP-only refreshToken cookie and returns session.
   */
  static async verifyEmailAuth(
    payload: VerifyEmailAuthPayload
  ): Promise<VerifyEmailAuthResponse> {
    const response = await authClient.post<VerifyEmailAuthResponse>(
      API_ENDPOINTS.AUTH.VERIFY,
      payload
    )
    return response.data
  }

  /**
   * Retrieves the active session and user profile via Bearer authentication.
   */
  static async getCurrentSession(): Promise<SessionMeResponse> {
    const response = await authClient.get<SessionMeResponse>(
      API_ENDPOINTS.AUTH.ME
    )
    return response.data
  }

  /**
   * Refreshes the active session. If refreshToken is omitted, uses the HTTP-only cookie.
   */
  static async refreshSession(
    payload?: RefreshSessionPayload
  ): Promise<RefreshSessionResponse> {
    const response = await authClient.post<RefreshSessionResponse>(
      API_ENDPOINTS.AUTH.REFRESH,
      payload || {}
    )
    return response.data
  }

  /**
   * Logs out the current session and clears the refresh token cookie.
   */
  static async logout(payload?: RevokeSessionPayload): Promise<{ success: boolean; message: string }> {
    const response = await authClient.post<{ success: boolean; message: string }>(
      API_ENDPOINTS.AUTH.LOGOUT,
      payload || {}
    )
    return response.data
  }

  /**
   * Lists users in the organization with pagination and filters (Admin only).
   */
  static async listUsers(params?: ListUsersParams): Promise<ListUsersResponse> {
    const queryParams: Record<string, any> = { ...params }
    if (params?.page && params?.limit && queryParams.offset === undefined) {
      queryParams.offset = (params.page - 1) * params.limit
    }
    const response = await authClient.get<ListUsersResponse>(
      API_ENDPOINTS.AUTH.USERS,
      { params: queryParams }
    )
    return response.data
  }

  /**
   * Retrieves a single user record by UUID (Admin only).
   */
  static async getUserById(userId: string): Promise<UserDetailsResponse> {
    const response = await authClient.get<UserDetailsResponse>(
      API_ENDPOINTS.AUTH.USER_BY_ID(userId)
    )
    return response.data
  }

  /**
   * Updates user account standing (active, blocked, deleted) (Admin only).
   */
  static async updateUserStatus(
    userId: string,
    payload: UpdateUserStatusPayload
  ): Promise<{ success: boolean; message: string; user: UserProfile }> {
    const response = await authClient.patch<{ success: boolean; message: string; user: UserProfile }>(
      API_ENDPOINTS.AUTH.USER_STATUS(userId),
      payload
    )
    return response.data
  }
}
