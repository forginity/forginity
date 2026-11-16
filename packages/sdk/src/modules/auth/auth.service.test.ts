import { describe, it, expect, vi, beforeEach } from "vitest"
import { AuthService } from "./auth.service"
import { authClient } from "../../core/http-client"
import { API_ENDPOINTS } from "../../constants/endpoints"

describe("AuthService", () => {
  beforeEach(() => {
    vi.restoreAllMocks()
  })

  it("should dispatch initiateEmailAuth to correct endpoint", async () => {
    const mockPost = vi.spyOn(authClient, "post").mockResolvedValueOnce({
      data: {
        success: true,
        message: "Code sent",
        requestId: "req-123",
        isNewUser: false,
        expiresInSeconds: 600,
        cooldownSeconds: 60,
      },
    })

    const payload = {
      email: "admin@forginity.com",
      intent: "sign_in" as const,
      userType: "admin" as const,
    }

    const result = await AuthService.initiateEmailAuth(payload)

    expect(mockPost).toHaveBeenCalledWith(API_ENDPOINTS.AUTH.INITIATE, payload)
    expect(result.requestId).toBe("req-123")
  })

  it("should dispatch verifyEmailAuth to correct endpoint", async () => {
    const mockPost = vi.spyOn(authClient, "post").mockResolvedValueOnce({
      data: {
        success: true,
        message: "Verified",
        isNewUser: false,
        isOnboarded: true,
        user: { id: "user-1", email: "admin@forginity.com", userType: "admin", status: "active" },
        session: { sessionId: "s-1", userId: "user-1", accessToken: "token-abc", expiresAt: "2026-11-15T00:00:00Z" },
      },
    })

    const payload = {
      requestId: "req-123",
      code: "123456",
      intent: "sign_in" as const,
      userType: "admin" as const,
    }

    const result = await AuthService.verifyEmailAuth(payload)

    expect(mockPost).toHaveBeenCalledWith(API_ENDPOINTS.AUTH.VERIFY, payload)
    expect(result.session?.accessToken).toBe("token-abc")
  })

  it("should dispatch getCurrentSession to ME endpoint", async () => {
    const mockGet = vi.spyOn(authClient, "get").mockResolvedValueOnce({
      data: {
        success: true,
        session: { id: "s-1", userId: "user-1", expiresAt: "2026-11-15T00:00:00Z" },
        user: { id: "user-1", email: "admin@forginity.com", userType: "admin" },
      },
    })

    const result = await AuthService.getCurrentSession()

    expect(mockGet).toHaveBeenCalledWith(API_ENDPOINTS.AUTH.ME)
    expect(result.user.email).toBe("admin@forginity.com")
  })

  it("should dispatch listUsers with query params", async () => {
    const mockGet = vi.spyOn(authClient, "get").mockResolvedValueOnce({
      data: {
        success: true,
        users: [{ id: "u-1", name: "Admin One" }],
        pagination: { total: 1, page: 1, limit: 10, totalPages: 1 },
      },
    })

    const params = { status: "active" as const, page: 1, limit: 10 }
    const result = await AuthService.listUsers(params)

    expect(mockGet).toHaveBeenCalledWith(API_ENDPOINTS.AUTH.USERS, {
      params: { ...params, offset: 0 },
    })
    expect(result.users).toHaveLength(1)
  })
})
