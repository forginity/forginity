import { describe, it, expect } from "vitest"
import { getTableName } from "drizzle-orm"
import {
  users,
  otps,
  sessions,
  userProducts,
  userEmergencyContacts,
  schemaRelations,
} from "./auth.schema.js"
import {
  OnboardingProfileSchema,
  UpdateUserProfileSchema,
  SendOtpSchema,
  VerifyOtpSchema,
  GoogleAuthSchema,
  CreateSessionSchema,
  CreateUserProductSchema,
  CreateEmergencyContactSchema,
  UserStatusEnum,
  AuthProviderEnum,
} from "./auth.validator.js"

describe("Auth Database Schema & Drizzle Definitions", () => {
  it("should define all 5 core tables with appropriate columns", () => {
    expect(users).toBeDefined()
    expect(otps).toBeDefined()
    expect(sessions).toBeDefined()
    expect(userProducts).toBeDefined()
    expect(userEmergencyContacts).toBeDefined()

    // Table names via Drizzle getTableName
    expect(getTableName(users)).toBe("users")
    expect(getTableName(otps)).toBe("otps")
    expect(getTableName(sessions)).toBe("sessions")
    expect(getTableName(userProducts)).toBe("user_products")
    expect(getTableName(userEmergencyContacts)).toBe("user_emergency_contacts")
  })

  it("should export schemaRelations covering all table relations", () => {
    expect(schemaRelations).toBeDefined()
  })
})

describe("Zod Validation Schemas (Type-First Guardrails)", () => {
  describe("OnboardingProfileSchema", () => {
    it("should accept valid onboarding data", () => {
      const valid = {
        firstName: "Vikas",
        lastName: "Sharma",
        gender: "male" as const,
        country: "IN",
      }
      const result = OnboardingProfileSchema.safeParse(valid)
      expect(result.success).toBe(true)
    })

    it("should reject invalid gender", () => {
      const invalid = {
        firstName: "Alex",
        lastName: "Rider",
        gender: "unknown",
        country: "US",
      }
      const result = OnboardingProfileSchema.safeParse(invalid)
      expect(result.success).toBe(false)
    })

    it("should reject lowercase or invalid length country codes", () => {
      expect(
        OnboardingProfileSchema.safeParse({
          firstName: "Jane",
          lastName: "Doe",
          gender: "female",
          country: "in",
        }).success
      ).toBe(false)

      expect(
        OnboardingProfileSchema.safeParse({
          firstName: "Jane",
          lastName: "Doe",
          gender: "female",
          country: "IND",
        }).success
      ).toBe(false)
    })

    it("should reject empty names", () => {
      expect(
        OnboardingProfileSchema.safeParse({
          firstName: "   ",
          lastName: "Doe",
          gender: "female",
          country: "US",
        }).success
      ).toBe(false)
    })
  })

  describe("UpdateUserProfileSchema", () => {
    it("should allow partial profile updates", () => {
      const result = UpdateUserProfileSchema.safeParse({
        firstName: "UpdatedName",
        avatarUrl: "https://example.com/avatar.jpg",
      })
      expect(result.success).toBe(true)
    })

    it("should reject invalid avatar URLs", () => {
      const result = UpdateUserProfileSchema.safeParse({
        avatarUrl: "not-a-valid-url",
      })
      expect(result.success).toBe(false)
    })
  })

  describe("SendOtpSchema", () => {
    it("should accept valid email OTP request", () => {
      const result = SendOtpSchema.safeParse({
        identifier: "rider@forginity.com",
        identifierType: "email",
        purpose: "sign_in",
      })
      expect(result.success).toBe(true)
    })

    it("should accept valid E.164 phone OTP request", () => {
      const result = SendOtpSchema.safeParse({
        identifier: "+14155552671",
        identifierType: "phone",
        purpose: "sign_up",
      })
      expect(result.success).toBe(true)
    })

    it("should reject invalid email for email channel", () => {
      const result = SendOtpSchema.safeParse({
        identifier: "invalid-email-string",
        identifierType: "email",
      })
      expect(result.success).toBe(false)
    })

    it("should reject non-E.164 phone numbers for phone channel", () => {
      const result = SendOtpSchema.safeParse({
        identifier: "1234567890", // Missing leading '+'
        identifierType: "phone",
      })
      expect(result.success).toBe(false)
    })
  })

  describe("VerifyOtpSchema", () => {
    it("should accept valid 6-digit numeric OTP", () => {
      const result = VerifyOtpSchema.safeParse({
        identifier: "rider@forginity.com",
        otp: "847291",
      })
      expect(result.success).toBe(true)
    })

    it("should reject non-6-digit OTPs", () => {
      expect(
        VerifyOtpSchema.safeParse({
          identifier: "rider@forginity.com",
          otp: "12345",
        }).success
      ).toBe(false)

      expect(
        VerifyOtpSchema.safeParse({
          identifier: "rider@forginity.com",
          otp: "1234567",
        }).success
      ).toBe(false)

      expect(
        VerifyOtpSchema.safeParse({
          identifier: "rider@forginity.com",
          otp: "abcdef",
        }).success
      ).toBe(false)
    })
  })

  describe("GoogleAuthSchema", () => {
    it("should accept valid Google ID token payload", () => {
      const result = GoogleAuthSchema.safeParse({
        idToken: "eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9...",
      })
      expect(result.success).toBe(true)
    })

    it("should reject missing ID token", () => {
      const result = GoogleAuthSchema.safeParse({})
      expect(result.success).toBe(false)
    })
  })

  describe("CreateSessionSchema", () => {
    it("should accept valid session payload", () => {
      const result = CreateSessionSchema.safeParse({
        userId: "11111111-1111-4111-a111-111111111111",
        sessionTokenHash: "hashed_token_string",
        currentProductId: "22222222-2222-4222-a222-222222222222",
        deviceType: "mobile",
        expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      })
      expect(result.success).toBe(true)
    })

    it("should reject invalid UUIDs for user ID", () => {
      const result = CreateSessionSchema.safeParse({
        userId: "invalid-user-uuid",
        sessionTokenHash: "hash",
        expiresAt: new Date(),
      })
      expect(result.success).toBe(false)
    })
  })

  describe("CreateUserProductSchema", () => {
    it("should accept valid user product link", () => {
      const result = CreateUserProductSchema.safeParse({
        userId: "11111111-1111-4111-a111-111111111111",
        productId: "22222222-2222-4222-a222-222222222222",
        tier: "pro",
        status: "active",
      })
      expect(result.success).toBe(true)
    })

    it("should reject invalid tier values", () => {
      const result = CreateUserProductSchema.safeParse({
        userId: "11111111-1111-4111-a111-111111111111",
        productId: "22222222-2222-4222-a222-222222222222",
        tier: "ultra_vip",
      })
      expect(result.success).toBe(false)
    })
  })

  describe("CreateEmergencyContactSchema", () => {
    it("should accept valid emergency contact payload", () => {
      const result = CreateEmergencyContactSchema.safeParse({
        contactName: "Maya Sharma",
        contactPhone: "+919876543210",
        relationship: "spouse",
        isPrimary: true,
      })
      expect(result.success).toBe(true)
    })

    it("should reject non-E.164 phone numbers", () => {
      const result = CreateEmergencyContactSchema.safeParse({
        contactName: "Maya Sharma",
        contactPhone: "9876543210", // Missing '+'
      })
      expect(result.success).toBe(false)
    })
  })

  describe("Enums", () => {
    it("should have expected values for UserStatus and AuthProvider", () => {
      expect(UserStatusEnum.options).toEqual(["active", "blocked", "deleted"])
      expect(AuthProviderEnum.options).toEqual(["email_otp", "phone_otp", "google"])
    })
  })
})
