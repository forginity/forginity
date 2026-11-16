import {
  useMutation,
  useQuery,
  useQueryClient,
  type UseMutationOptions,
  type UseQueryOptions,
} from "@tanstack/react-query"
import { AuthService } from "./auth.service"
import { authCacheKeys } from "./auth.cache-keys"
import { ApiError } from "../../core/api-error"
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

export function useInitiateEmailAuth(
  options?: UseMutationOptions<
    InitiateEmailAuthResponse,
    ApiError,
    InitiateEmailAuthPayload
  >
) {
  return useMutation({
    mutationFn: (payload: InitiateEmailAuthPayload) =>
      AuthService.initiateEmailAuth(payload),
    ...options,
  })
}

export function useVerifyEmailAuth(
  options?: UseMutationOptions<
    VerifyEmailAuthResponse,
    ApiError,
    VerifyEmailAuthPayload
  >
) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (payload: VerifyEmailAuthPayload) =>
      AuthService.verifyEmailAuth(payload),
    onSuccess: (data, variables, ...rest) => {
      queryClient.invalidateQueries({ queryKey: authCacheKeys.session() })
      options?.onSuccess?.(data, variables, ...rest)
    },
    ...options,
  })
}

export function useCurrentSession(
  options?: Partial<UseQueryOptions<SessionMeResponse, ApiError>>
) {
  return useQuery({
    queryKey: authCacheKeys.session(),
    queryFn: () => AuthService.getCurrentSession(),
    retry: 1,
    staleTime: 5 * 60 * 1000, // 5 minutes
    ...options,
  })
}

export function useRefreshSession(
  options?: UseMutationOptions<
    RefreshSessionResponse,
    ApiError,
    RefreshSessionPayload | undefined
  >
) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (payload?: RefreshSessionPayload) =>
      AuthService.refreshSession(payload),
    onSuccess: (data, variables, ...rest) => {
      queryClient.invalidateQueries({ queryKey: authCacheKeys.session() })
      options?.onSuccess?.(data, variables, ...rest)
    },
    ...options,
  })
}

export function useLogout(
  options?: UseMutationOptions<
    { success: boolean; message: string },
    ApiError,
    RevokeSessionPayload | undefined
  >
) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (payload?: RevokeSessionPayload) => AuthService.logout(payload),
    onSuccess: (data, variables, ...rest) => {
      queryClient.clear()
      options?.onSuccess?.(data, variables, ...rest)
    },
    ...options,
  })
}

export function useUsers(
  params?: ListUsersParams,
  options?: Partial<UseQueryOptions<ListUsersResponse, ApiError>>
) {
  return useQuery({
    queryKey: authCacheKeys.users(params),
    queryFn: () => AuthService.listUsers(params),
    staleTime: 60 * 1000,
    ...options,
  })
}

export function useUser(
  userId?: string | null,
  options?: Partial<UseQueryOptions<UserDetailsResponse, ApiError>>
) {
  return useQuery({
    queryKey: authCacheKeys.user(userId || ""),
    queryFn: () => AuthService.getUserById(userId!),
    enabled: Boolean(userId),
    staleTime: 60 * 1000,
    ...options,
  })
}

export function useUpdateUserStatus(
  options?: UseMutationOptions<
    { success: boolean; message: string; user: UserProfile },
    ApiError,
    { userId: string; payload: UpdateUserStatusPayload }
  >
) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ userId, payload }: { userId: string; payload: UpdateUserStatusPayload }) =>
      AuthService.updateUserStatus(userId, payload),
    onSuccess: (data, variables, ...rest) => {
      queryClient.invalidateQueries({ queryKey: authCacheKeys.all() })
      options?.onSuccess?.(data, variables, ...rest)
    },
    ...options,
  })
}
