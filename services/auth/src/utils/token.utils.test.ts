import { describe, it, expect } from "vitest"
import {
  signAccessToken,
  signRefreshToken,
  signOnboardingToken,
  verifyJwtToken,
} from "./token.utils.js"
import type {
  AccessTokenPayload,
  RefreshTokenPayload,
  OnboardingTokenPayload,
} from "../types/auth.types.js"

describe("Token Utilities (token.utils)", () => {
  const mockUserId = "550e8400-e29b-41d4-a716-446655440001"
  const mockEmail = "rider@forginity.com"
  const mockSessionId = "550e8400-e29b-41d4-a716-446655440099"

  describe("signAccessToken & verifyJwtToken", () => {
    it("should issue a valid access token and successfully verify it", async () => {
      const token = await signAccessToken({
        userId: mockUserId,
        email: mockEmail,
        currentProductId: "550e8400-e29b-41d4-a716-446655440002",
        role: "admin",
      })

      expect(typeof token).toBe("string")

      const payload = await verifyJwtToken<AccessTokenPayload>(token, "access")
      expect(payload.sub).toBe(mockUserId)
      expect(payload.email).toBe(mockEmail)
      expect(payload.scope).toBe("access")
      expect(payload.productId).toBe("550e8400-e29b-41d4-a716-446655440002")
      expect(payload.role).toBe("admin")
    })

    it("should reject verification if expected scope does not match", async () => {
      const token = await signAccessToken({
        userId: mockUserId,
        email: mockEmail,
      })

      await expect(verifyJwtToken(token, "onboarding")).rejects.toThrow(
        /Invalid token scope: expected 'onboarding' but received 'access'/
      )
    })
  })

  describe("signRefreshToken & verifyJwtToken", () => {
    it("should issue a valid refresh token tied to session ID", async () => {
      const token = await signRefreshToken({
        userId: mockUserId,
        sessionId: mockSessionId,
      })

      expect(typeof token).toBe("string")

      const payload = await verifyJwtToken<RefreshTokenPayload>(token, "refresh")
      expect(payload.sub).toBe(mockUserId)
      expect(payload.sessionId).toBe(mockSessionId)
      expect(payload.scope).toBe("refresh")
    })
  })

  describe("signOnboardingToken & verifyJwtToken", () => {
    it("should issue a valid onboarding token scoped strictly to onboarding", async () => {
      const token = await signOnboardingToken({
        userId: mockUserId,
        email: mockEmail,
      })

      expect(typeof token).toBe("string")

      const payload = await verifyJwtToken<OnboardingTokenPayload>(token, "onboarding")
      expect(payload.sub).toBe(mockUserId)
      expect(payload.email).toBe(mockEmail)
      expect(payload.scope).toBe("onboarding")
    })

    it("should reject using onboarding token as access token", async () => {
      const token = await signOnboardingToken({
        userId: mockUserId,
        email: mockEmail,
      })

      await expect(verifyJwtToken(token, "access")).rejects.toThrow(
        /Invalid token scope: expected 'access' but received 'onboarding'/
      )
    })
  })
})
