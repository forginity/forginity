import { describe, it, expect, beforeEach, afterEach, vi } from "vitest"
import axios from "axios"
import { ApiError } from "./api-error.js"
import {
  createHttpClient,
  setAuthTokenProvider,
} from "./http-client.js"
import { createDefaultQueryClient } from "./query-client.js"

describe("packages/sdk/src/core/api-error", () => {
  it("should create an ApiError instance with structured properties", () => {
    const error = new ApiError({
      message: "Resource not found",
      status: 404,
      code: "NOT_FOUND",
      details: { resource: "product" },
    })

    expect(error).toBeInstanceOf(Error)
    expect(error).toBeInstanceOf(ApiError)
    expect(error.name).toBe("ApiError")
    expect(error.message).toBe("Resource not found")
    expect(error.status).toBe(404)
    expect(error.code).toBe("NOT_FOUND")
    expect(error.details).toEqual({ resource: "product" })
  })

  it("should accurately identify ApiError using isApiError type-guard", () => {
    const apiError = new ApiError({ message: "Forbidden", status: 403 })
    const regularError = new Error("Standard error")
    const stringError = "Some error string"

    expect(ApiError.isApiError(apiError)).toBe(true)
    expect(ApiError.isApiError(regularError)).toBe(false)
    expect(ApiError.isApiError(stringError)).toBe(false)
    expect(ApiError.isApiError(null)).toBe(false)
  })
})

describe("packages/sdk/src/core/http-client", () => {
  beforeEach(() => {
    setAuthTokenProvider(null)
  })

  afterEach(() => {
    setAuthTokenProvider(null)
    vi.restoreAllMocks()
  })

  it("should initialize with default headers and config", () => {
    const client = createHttpClient()
    expect(client.defaults.headers["Content-Type"]).toBe("application/json")
    expect(client.defaults.headers["X-Request-Source"]).toBe("@forginity/sdk")
    expect(client.defaults.timeout).toBe(15000)
  })

  it("should inject Bearer token in request headers when token provider is set", async () => {
    setAuthTokenProvider(() => "test-jwt-token")
    const client = createHttpClient()

    // Test request interceptor directly
    const interceptor = client.interceptors.request as unknown as {
      handlers: Array<{
        fulfilled: (config: { headers: Record<string, string> }) => Promise<{ headers: Record<string, string> }>
      }>
    }
    const handler = interceptor.handlers[0]
    expect(handler).toBeDefined()

    const config = {
      headers: {} as Record<string, string>,
    }
    const modifiedConfig = await handler!.fulfilled(config)

    expect(modifiedConfig.headers["Authorization"]).toBe("Bearer test-jwt-token")
  })

  it("should normalize response errors into structured ApiError", async () => {
    const client = createHttpClient()

    const interceptor = client.interceptors.response as unknown as {
      handlers: Array<{ rejected: (error: unknown) => Promise<never> }>
    }
    const errorHandler = interceptor.handlers[0]
    expect(errorHandler).toBeDefined()

    const mockAxiosError = {
      name: "AxiosError",
      message: "Request failed with status code 400",
      response: {
        status: 400,
        data: {
          message: "Validation failed: slug is required",
          code: "VALIDATION_ERROR",
          details: [{ field: "slug", issue: "Required" }],
        },
      },
    }

    await expect(errorHandler!.rejected(mockAxiosError)).rejects.toSatisfy((err: unknown) => {
      expect(ApiError.isApiError(err)).toBe(true)
      const apiErr = err as ApiError
      expect(apiErr.status).toBe(400)
      expect(apiErr.message).toBe("Validation failed: slug is required")
      expect(apiErr.code).toBe("VALIDATION_ERROR")
      expect(apiErr.details).toEqual([{ field: "slug", issue: "Required" }])
      return true
    })
  })

  it("should handle network disconnects when error.request exists without response", async () => {
    const client = createHttpClient()

    const interceptor = client.interceptors.response as unknown as {
      handlers: Array<{ rejected: (error: unknown) => Promise<never> }>
    }
    const errorHandler = interceptor.handlers[0]

    const mockNetworkError = {
      name: "AxiosError",
      message: "Network Error",
      request: {},
    }

    await expect(errorHandler!.rejected(mockNetworkError)).rejects.toSatisfy((err: unknown) => {
      expect(ApiError.isApiError(err)).toBe(true)
      const apiErr = err as ApiError
      expect(apiErr.status).toBe(0)
      expect(apiErr.code).toBe("NETWORK_ERROR")
      expect(apiErr.message).toContain("Network error")
      return true
    })
  })
})

describe("packages/sdk/src/core/query-client", () => {
  it("should create QueryClient with default caching and retry policies", () => {
    const queryClient = createDefaultQueryClient()
    const defaultOptions = queryClient.getDefaultOptions()

    expect(defaultOptions.queries?.staleTime).toBe(300000)
    expect(defaultOptions.queries?.gcTime).toBe(600000)
    expect(defaultOptions.queries?.refetchOnWindowFocus).toBe(false)
    expect(defaultOptions.mutations?.retry).toBe(0)

    // Test retry logic with 4xx ApiError
    const retryFn = defaultOptions.queries?.retry as (count: number, err: unknown) => boolean
    expect(retryFn).toBeDefined()

    const clientError = new ApiError({ message: "Bad request", status: 400 })
    expect(retryFn(0, clientError)).toBe(false)

    const serverError = new ApiError({ message: "Server error", status: 500 })
    expect(retryFn(0, serverError)).toBe(true)
    expect(retryFn(1, serverError)).toBe(true)
    expect(retryFn(2, serverError)).toBe(false)
  })
})
