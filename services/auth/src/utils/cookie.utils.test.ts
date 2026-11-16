import { describe, it, expect, vi } from "vitest"
import type { Response } from "express"
import {
  setRefreshTokenCookie,
  clearRefreshTokenCookie,
  extractCookie,
  REFRESH_TOKEN_COOKIE_NAME,
  REFRESH_TOKEN_MAX_AGE_MS,
} from "./cookie.utils.js"

describe("cookie.utils", () => {
  it("should set refresh token cookie with correct options in development", () => {
    const mockCookie = vi.fn()
    const mockRes = { cookie: mockCookie } as unknown as Response

    setRefreshTokenCookie(mockRes, "mock-refresh-token")

    expect(mockCookie).toHaveBeenCalledWith(
      REFRESH_TOKEN_COOKIE_NAME,
      "mock-refresh-token",
      expect.objectContaining({
        httpOnly: true,
        path: "/",
        maxAge: REFRESH_TOKEN_MAX_AGE_MS,
      })
    )
  })

  it("should clear refresh token cookie", () => {
    const mockClearCookie = vi.fn()
    const mockRes = { clearCookie: mockClearCookie } as unknown as Response

    clearRefreshTokenCookie(mockRes)

    expect(mockClearCookie).toHaveBeenCalledWith(
      REFRESH_TOKEN_COOKIE_NAME,
      expect.objectContaining({
        httpOnly: true,
        path: "/",
      })
    )
  })

  it("should correctly extract cookie from header", () => {
    const header = "session=xyz; refreshToken=token123; other=abc"
    expect(extractCookie(header, "refreshToken")).toBe("token123")
    expect(extractCookie(header, "session")).toBe("xyz")
    expect(extractCookie(header, "nonexistent")).toBeUndefined()
    expect(extractCookie(undefined, "refreshToken")).toBeUndefined()
  })
})
