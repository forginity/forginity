/**
 * Normalized API Error contract across the Forginity monorepo ecosystem.
 */
export interface ApiErrorPayload {
  message: string
  status: number
  code?: string
  details?: unknown
}

/**
 * Standardized ApiError class for unhandled and handled HTTP responses.
 */
export class ApiError extends Error {
  readonly status: number
  readonly code?: string
  readonly details?: unknown

  constructor(payload: ApiErrorPayload) {
    super(payload.message)
    this.name = "ApiError"
    this.status = payload.status
    this.code = payload.code
    this.details = payload.details
    Object.setPrototypeOf(this, ApiError.prototype)
  }

  /**
   * Type-guard to check whether an unknown caught value is an ApiError.
   */
  static isApiError(error: unknown): error is ApiError {
    return error instanceof ApiError
  }
}
