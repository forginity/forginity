import axios, {
  type AxiosError,
  type AxiosInstance,
  type CreateAxiosDefaults,
  type InternalAxiosRequestConfig,
} from "axios"
import { ApiError } from "./api-error.js"

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
      if (provider) {
        try {
          const token = await provider()
          if (token && !config.headers.Authorization) {
            config.headers.Authorization = `Bearer ${token}`
          }
        } catch {
          // Ignore token retrieval failure and proceed unauthenticated
        }
      }
      return config
    },
    (error) => Promise.reject(error)
  )

  // Response Interceptor: Normalize all responses and errors into ApiError
  instance.interceptors.response.use(
    (response) => response,
    (error: AxiosError<BackendErrorPayload>) => {
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
 * Singleton default Axios HTTP client instance.
 */
export const apiClient = createHttpClient()
