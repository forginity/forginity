import axios, {
  type AxiosError,
  type AxiosInstance,
  type CreateAxiosDefaults,
  type InternalAxiosRequestConfig,
} from "axios"
import { ApiError } from "./api-error"

export type AuthTokenProvider = () => string | null | Promise<string | null>
export type UnauthorizedHandler = (error: ApiError) => void

let globalAuthTokenProvider: AuthTokenProvider | null = null
let globalUnauthorizedHandler: UnauthorizedHandler | null = null

interface SilentRefreshResult {
  accessToken: string
  expiresIn: number
}

interface RefreshEndpointResponse {
  success?: boolean
  accessToken?: string
  expiresIn?: number
  session?: {
    accessToken?: string
    refreshToken?: string
    expiresIn?: number
  }
}

let inFlightRefreshPromise: Promise<SilentRefreshResult | null> | null = null

const PUBLIC_AUTH_PATH_SEGMENTS = [
  "/session/refresh",
  "/session/revoke",
  "/logout",
  "/email/verify",
  "/email/initiate",
  "/otp/send",
  "/otp/verify",
  "/google",
]

function isPublicAuthEndpoint(url?: string): boolean {
  if (!url) return false
  return PUBLIC_AUTH_PATH_SEGMENTS.some((segment) => url.includes(segment))
}

function clearBrowserAuthState(): void {
  if (typeof window === "undefined") return
  try {
    localStorage.removeItem("admin_access_token")
    localStorage.removeItem("access_token")
    localStorage.removeItem("admin_user")
    document.cookie = "admin_session=; path=/; max-age=0"
  } catch {
    // Ignore storage errors in restricted environments
  }
}

async function performSilentRefresh(): Promise<SilentRefreshResult | null> {
  if (!inFlightRefreshPromise) {
    const authBaseUrl =
      process.env.NEXT_PUBLIC_AUTH_API_URL ||
      process.env.AUTH_API_URL ||
      "http://localhost:3001"

    inFlightRefreshPromise = axios
      .post<RefreshEndpointResponse>(
        `${authBaseUrl}/api/auth/session/refresh`,
        {},
        { withCredentials: true }
      )
      .then((refreshRes) => {
        const accessToken =
          refreshRes.data?.session?.accessToken || refreshRes.data?.accessToken
        if (!accessToken) return null

        const expiresIn =
          refreshRes.data?.session?.expiresIn ||
          refreshRes.data?.expiresIn ||
          900

        if (typeof window !== "undefined") {
          try {
            localStorage.setItem("admin_access_token", accessToken)
            document.cookie = `admin_session=${accessToken}; path=/; max-age=${expiresIn}; SameSite=Lax`
          } catch {
            // Ignore storage write errors
          }
        }

        return { accessToken, expiresIn }
      })
      .catch(() => null)
      .finally(() => {
        inFlightRefreshPromise = null
      })
  }

  return inFlightRefreshPromise
}

/**
 * Configure the global authentication token provider for API requests.
 */
export function setAuthTokenProvider(provider: AuthTokenProvider | null): void {
  globalAuthTokenProvider = provider
}

/**
 * Configure the global callback invoked when authentication cannot be recovered
 * (e.g. expired access token and missing/revoked refresh session).
 */
export function setUnauthorizedHandler(
  handler: UnauthorizedHandler | null
): void {
  globalUnauthorizedHandler = handler
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
  onUnauthorized?: UnauthorizedHandler
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
      const isProtectedUnauthorized =
        error.response?.status === 401 &&
        Boolean(originalRequest) &&
        !isPublicAuthEndpoint(originalRequest?.url)

      if (isProtectedUnauthorized && originalRequest && !originalRequest._retry) {
        originalRequest._retry = true

        const refreshed = await performSilentRefresh()
        if (refreshed?.accessToken) {
          if (originalRequest.headers) {
            originalRequest.headers.Authorization = `Bearer ${refreshed.accessToken}`
          }
          return instance(originalRequest)
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

        const apiError = new ApiError({
          message,
          status: error.response.status,
          code,
          details,
        })

        // If a protected request remains unauthorized after silent refresh fails,
        // clear stale client auth artifacts and notify the host application.
        if (isProtectedUnauthorized) {
          clearBrowserAuthState()
          const unauthorizedHandler =
            options?.onUnauthorized || globalUnauthorizedHandler
          unauthorizedHandler?.(apiError)
        }

        return Promise.reject(apiError)
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
