import { QueryClient, type QueryClientConfig } from "@tanstack/react-query"
import { ApiError } from "./api-error.js"

/**
 * Creates a QueryClient with resilient Forginity platform defaults.
 */
export function createDefaultQueryClient(config?: QueryClientConfig): QueryClient {
  return new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 5 * 60 * 1000, // 5 minutes
        gcTime: 10 * 60 * 1000, // 10 minutes cache retention
        refetchOnWindowFocus: false,
        retry: (failureCount, error) => {
          // Do not retry 4xx client errors (e.g. 400 Bad Request, 404 Not Found, 401 Unauthorized)
          if (ApiError.isApiError(error) && error.status >= 400 && error.status < 500) {
            return false
          }
          return failureCount < 2
        },
      },
      mutations: {
        retry: 0,
      },
      ...config?.defaultOptions,
    },
    ...config,
  })
}
