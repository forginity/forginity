import axios, {
  type AxiosError,
  type AxiosInstance,
  type CreateAxiosDefaults,
  type InternalAxiosRequestConfig,
} from "axios"
import { ApiError } from "./api-error"

export type AuthTokenProvider = () => string | null | Promise<string | null>

let globalAuthTokenProvider: AuthTokenProvider | null = null

/**
 * Configure the global authentication token provider for API requests.
 */
export function setAuthTokenProvider(provider: AuthTokenProvider | null): void {
  globalAuthTokenProvider = provider
}

/**
 * Interface representing common API error payload shape from Express backends.
 */
interface BackendErrorPayload {
  message?: string
  error?: string
  code?: string
  details?: unknown
  errors?: unknown
}

export interface HttpClientOptions extends CreateAxiosDefaults {
  tokenProvider?: AuthTokenProvider
}

/**
 * Creates and configures an Axios instance with standard interceptors.
 */
export function createHttpClient(options?: HttpClientOptions): AxiosInstance {
  const instance = axios.create({
    baseURL:
      process.env.NEXT_PUBLIC_API_URL ||
      process.env.API_URL ||
      "http://localhost:3002",
    timeout: 15000,
    withCredentials: true,
    headers: {
      "Content-Type": "application/json",
      "X-Request-Source": "@forginity/sdk",
    },
    ...options,
  })

  // Request Interceptor: Attach dynamic Bearer Token and metadata
  instance.interceptors.request.use(
    async (config: InternalAxiosRequestConfig) => {
      const provider = options?.tokenProvider || globalAuthTokenProvider
      let token: string | null | undefined

      if (provider) {
        try {
          token = await provider()
        } catch {
          token = null
        }
      }

      // Browser client fallback: retrieve stored access token directly
      if (!token && typeof window !== "undefined") {
        try {
          token =
            localStorage.getItem("admin_access_token") ||
            localStorage.getItem("access_token")
        } catch {
          token = null
        }
      }

      if (token && !config.headers.Authorization) {
        config.headers.Authorization = `Bearer ${token}`
      }

      return config
    },
    (error) => Promise.reject(error)
  )

  // Response Interceptor: Normalize all responses and errors into ApiError
  instance.interceptors.response.use(
    (response) => response,
    async (error: AxiosError<BackendErrorPayload>) => {
      const originalRequest = error.config as
        | (InternalAxiosRequestConfig & { _retry?: boolean })
        | undefined

      // Automatic silent refresh on 401 Unauthorized using HTTP-only refreshToken cookie
      if (
        error.response?.status === 401 &&
        originalRequest &&
        !originalRequest._retry &&
        !originalRequest.url?.includes("/session/refresh") &&
        !originalRequest.url?.includes("/email/verify") &&
        !originalRequest.url?.includes("/email/initiate")
      ) {
        originalRequest._retry = true

        try {
          const authBaseUrl =
            process.env.NEXT_PUBLIC_AUTH_API_URL ||
            process.env.AUTH_API_URL ||
            "http://localhost:3001"

          const refreshRes = await axios.post<{
            success: boolean
            accessToken: string
            expiresIn?: number
          }>(
            `${authBaseUrl}/api/auth/session/refresh`,
            {},
            { withCredentials: true }
          )

          if (refreshRes.data?.accessToken) {
            const newAccessToken = refreshRes.data.accessToken

            if (typeof window !== "undefined") {
              try {
                localStorage.setItem("admin_access_token", newAccessToken)
                document.cookie = `admin_session=${newAccessToken}; path=/; max-age=${refreshRes.data.expiresIn || 900}; SameSite=Lax`
              } catch {
                // Ignore storage write errors
              }
            }

            originalRequest.headers.Authorization = `Bearer ${newAccessToken}`
            return instance(originalRequest)
          }
        } catch {
          // Refresh failed - fall through to standard ApiError rejection
        }
      }

      if (error.response) {
        const data = error.response.data
        const message =
          data?.message ||
          data?.error ||
          error.message ||
          "An error occurred while processing the request"
        const code = data?.code
        const details = data?.details || data?.errors

        return Promise.reject(
          new ApiError({
            message,
            status: error.response.status,
            code,
            details,
          })
        )
      }

      if (error.request) {
        return Promise.reject(
          new ApiError({
            message: "Network error: unable to establish connection to server",
            status: 0,
            code: "NETWORK_ERROR",
          })
        )
      }

      return Promise.reject(
        new ApiError({
          message: error.message || "Unexpected client error",
          status: 500,
          code: "CLIENT_CONFIG_ERROR",
        })
      )
    }
  )

  return instance
}

/**
 * Singleton default Axios HTTP client instance for products and general microservices.
 */
export const apiClient = createHttpClient()

/**
 * Singleton Axios HTTP client instance specifically configured for the auth microservice (port 3001).
 */
export const authClient = createHttpClient({
  baseURL:
    process.env.NEXT_PUBLIC_AUTH_API_URL ||
    process.env.AUTH_API_URL ||
    "http://localhost:3001",
  withCredentials: true,
})
