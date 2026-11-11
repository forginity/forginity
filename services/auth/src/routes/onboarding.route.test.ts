import { describe, it, expect, vi, beforeEach } from "vitest"
import request from "supertest"
import app from "../app.js"
import { onboardingService, OnboardingServiceError } from "../services/onboarding.service.js"
import { userRepository } from "../repositories/user.repository.js"
import { signOnboardingToken, signAccessToken } from "../utils/token.utils.js"
import type { User } from "../db/auth.schema.js"

describe("Onboarding Route (POST /api/auth/onboarding)", () => {
  const mockUserId = "550e8400-e29b-41d4-a716-446655440001"
  const mockEmail = "newuser@forginity.com"

  const mockUser: User = {
    id: mockUserId,
    email: mockEmail,
    phone: null,
    name: null,
    passwordHash: null,
    firstName: null,
    lastName: null,
    gender: null,
    country: null,
    avatarUrl: null,
    googleId: null,
    authProvider: "email_otp",
    isVerified: true,
    isEmailVerified: true,
    isPhoneVerified: false,
    isOnboarded: false,
    status: "active",
    createdAt: new Date(),
    updatedAt: new Date(),
  }

  let validOnboardingToken: string
  let invalidScopeAccessToken: string

  beforeEach(async () => {
    vi.restoreAllMocks()

    vi.spyOn(userRepository, "findUserById").mockResolvedValue(mockUser)

    validOnboardingToken = await signOnboardingToken({
      userId: mockUserId,
      email: mockEmail,
    })

    invalidScopeAccessToken = await signAccessToken({
      userId: mockUserId,
      email: mockEmail,
      role: "active",
    })
  })

  it("should return 200 OK with user profile and session tokens upon completing onboarding", async () => {
    vi.spyOn(onboardingService, "completeOnboarding").mockResolvedValueOnce({
      success: true,
      user: {
        ...mockUser,
        firstName: "Alex",
        lastName: "Rider",
        name: "Alex Rider",
        gender: "male",
        country: "US",
        isOnboarded: true,
      },
      session: {
        accessToken: "mock.upgraded.access.token",
        refreshToken: "mock.upgraded.refresh.token",
        expiresIn: 900,
      },
    })

    const res = await request(app)
      .post("/api/auth/onboarding")
      .set("Authorization", `Bearer ${validOnboardingToken}`)
      .send({
        firstName: "Alex",
        lastName: "Rider",
        gender: "male",
        country: "US",
      })

    expect(res.status).toBe(200)
    expect(res.body.success).toBe(true)
    expect(res.body.user.firstName).toBe("Alex")
    expect(res.body.user.lastName).toBe("Rider")
    expect(res.body.user.name).toBe("Alex Rider")
    expect(res.body.user.isOnboarded).toBe(true)
    expect(res.body.session.accessToken).toBe("mock.upgraded.access.token")
    expect(res.body.session.refreshToken).toBe("mock.upgraded.refresh.token")
    expect(res.body.session.expiresIn).toBe(900)
  })

  it("should return 400 Bad Request if firstName is missing or empty", async () => {
    const res = await request(app)
      .post("/api/auth/onboarding")
      .set("Authorization", `Bearer ${validOnboardingToken}`)
      .send({
        firstName: "",
        lastName: "Rider",
        gender: "male",
        country: "US",
      })

    expect(res.status).toBe(400)
    expect(res.body.error).toBe("Validation Error")
    expect(res.body.issues).toBeDefined()
  })

  it("should return 400 Bad Request if gender is not an accepted enum value", async () => {
    const res = await request(app)
      .post("/api/auth/onboarding")
      .set("Authorization", `Bearer ${validOnboardingToken}`)
      .send({
        firstName: "Alex",
        lastName: "Rider",
        gender: "invalid_gender",
        country: "US",
      })

    expect(res.status).toBe(400)
    expect(res.body.error).toBe("Validation Error")
  })

  it("should return 400 Bad Request if country is lowercase or not 2 uppercase characters", async () => {
    const res = await request(app)
      .post("/api/auth/onboarding")
      .set("Authorization", `Bearer ${validOnboardingToken}`)
      .send({
        firstName: "Alex",
        lastName: "Rider",
        gender: "male",
        country: "usa", // invalid, should be 2-letter uppercase
      })

    expect(res.status).toBe(400)
    expect(res.body.error).toBe("Validation Error")
  })

  it("should return 401 Unauthorized if Authorization header is omitted", async () => {
    const res = await request(app)
      .post("/api/auth/onboarding")
      .send({
        firstName: "Alex",
        lastName: "Rider",
        gender: "male",
        country: "US",
      })

    expect(res.status).toBe(401)
    expect(res.body.code).toBe("UNAUTHORIZED")
  })

  it("should return 401 Unauthorized if access token is used instead of onboarding token (scope mismatch)", async () => {
    const res = await request(app)
      .post("/api/auth/onboarding")
      .set("Authorization", `Bearer ${invalidScopeAccessToken}`)
      .send({
        firstName: "Alex",
        lastName: "Rider",
        gender: "male",
        country: "US",
      })

    expect(res.status).toBe(401)
    expect(res.body.code).toBe("INVALID_TOKEN")
    expect(res.body.error).toContain("Invalid token scope")
  })

  it("should return 403 Forbidden if user account is blocked", async () => {
    vi.spyOn(userRepository, "findUserById").mockResolvedValueOnce({
      ...mockUser,
      status: "blocked",
    })

    const res = await request(app)
      .post("/api/auth/onboarding")
      .set("Authorization", `Bearer ${validOnboardingToken}`)
      .send({
        firstName: "Alex",
        lastName: "Rider",
        gender: "male",
        country: "US",
      })

    expect(res.status).toBe(403)
    expect(res.body.code).toBe("ACCOUNT_BLOCKED")
    expect(res.body.error).toBe("Account is blocked. Please contact support.")
  })
})
