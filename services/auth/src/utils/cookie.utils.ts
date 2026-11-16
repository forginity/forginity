import type { Response } from "express"

export const REFRESH_TOKEN_COOKIE_NAME = "refreshToken"
export const REFRESH_TOKEN_MAX_AGE_MS = 30 * 24 * 60 * 60 * 1000 // 30 days

/**
 * Sets the long-lived refresh token in an HTTP-only secure cookie.
 * In development, secure is false and sameSite is 'lax' to support local cross-port workflows.
 * In production, secure is true and sameSite is 'lax' (or 'none' for cross-domain).
 */
export function setRefreshTokenCookie(res: Response, refreshToken: string): void {
  const isProduction = process.env.NODE_ENV === "production"
  res.cookie(REFRESH_TOKEN_COOKIE_NAME, refreshToken, {
    httpOnly: true,
    secure: isProduction,
    sameSite: isProduction ? "none" : "lax",
    path: "/",
    maxAge: REFRESH_TOKEN_MAX_AGE_MS,
  })
}

/**
 * Clears the refresh token cookie upon logout or session revocation.
 */
export function clearRefreshTokenCookie(res: Response): void {
  const isProduction = process.env.NODE_ENV === "production"
  res.clearCookie(REFRESH_TOKEN_COOKIE_NAME, {
    httpOnly: true,
    secure: isProduction,
    sameSite: isProduction ? "none" : "lax",
    path: "/",
  })
}

/**
 * Extracts a cookie value by name from the raw Cookie header string.
 */
export function extractCookie(cookieHeader: string | undefined, name: string): string | undefined {
  if (!cookieHeader) return undefined
  const match = cookieHeader.match(new RegExp(`(?:^|;\\s*)${name}=([^;]*)`))
  return match ? decodeURIComponent(match[1]) : undefined
}
