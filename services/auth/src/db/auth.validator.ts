import { z } from "zod"

/**
 * Domain Enums
 */
export const AuthProviderEnum = z.enum(["email_otp", "phone_otp", "google"])
export type AuthProvider = z.infer<typeof AuthProviderEnum>

export const UserStatusEnum = z.enum(["active", "blocked", "deleted"])
export type UserStatus = z.infer<typeof UserStatusEnum>

export const GenderEnum = z.enum(["male", "female", "other", "prefer_not_to_say"])
export type Gender = z.infer<typeof GenderEnum>

export const OtpIdentifierTypeEnum = z.enum(["email", "phone"])
export type OtpIdentifierType = z.infer<typeof OtpIdentifierTypeEnum>

export const OtpPurposeEnum = z.enum(["sign_up", "sign_in", "verify"])
export type OtpPurpose = z.infer<typeof OtpPurposeEnum>

export const DeviceTypeEnum = z.enum(["mobile", "desktop", "tablet"])
export type DeviceType = z.infer<typeof DeviceTypeEnum>

export const ProductTierEnum = z.enum(["free", "pro", "enterprise"])
export type ProductTier = z.infer<typeof ProductTierEnum>

export const ProductAccessStatusEnum = z.enum(["active", "suspended", "expired"])
export type ProductAccessStatus = z.infer<typeof ProductAccessStatusEnum>

/**
 * Common Parameter Schemas
 */
export const UuidParamSchema = z.object({
  id: z.string().uuid("Invalid UUID format"),
})

export const PaginationQuerySchema = z.object({
  limit: z.coerce.number().int().min(1).max(100).default(20),
  offset: z.coerce.number().int().min(0).default(0),
})

/**
 * User & Onboarding Schemas
 */
export const E164PhoneRegex = /^\+[1-9]\d{1,14}$/
export const IsoCountryCodeRegex = /^[A-Z]{2}$/

export const OnboardingProfileSchema = z.object({
  firstName: z
    .string()
    .trim()
    .min(1, "First name is required")
    .max(100, "First name cannot exceed 100 characters"),
  lastName: z
    .string()
    .trim()
    .min(1, "Last name is required")
    .max(100, "Last name cannot exceed 100 characters"),
  gender: GenderEnum,
  country: z
    .string()
    .trim()
    .regex(IsoCountryCodeRegex, "Country must be a 2-letter uppercase ISO 3166-1 alpha-2 code (e.g. IN, US)"),
})
export type OnboardingProfileInput = z.infer<typeof OnboardingProfileSchema>

export const UpdateUserProfileSchema = z.object({
  firstName: z.string().trim().min(1).max(100).optional(),
  lastName: z.string().trim().min(1).max(100).optional(),
  gender: GenderEnum.optional(),
  country: z.string().trim().regex(IsoCountryCodeRegex, "Country must be a 2-letter uppercase ISO code").optional(),
  avatarUrl: z.string().url("Invalid avatar URL format").optional(),
})
export type UpdateUserProfileInput = z.infer<typeof UpdateUserProfileSchema>

export const CreateUserSchema = z.object({
  email: z.string().email("Invalid email address").optional(),
  phone: z.string().regex(E164PhoneRegex, "Phone must be in E.164 format (e.g. +14155552671)").optional(),
  googleId: z.string().min(1).optional(),
  authProvider: AuthProviderEnum.default("email_otp"),
  firstName: z.string().max(100).optional(),
  lastName: z.string().max(100).optional(),
  gender: GenderEnum.optional(),
  country: z.string().regex(IsoCountryCodeRegex).optional(),
  avatarUrl: z.string().url().optional(),
  status: UserStatusEnum.default("active"),
})
export type CreateUserInput = z.infer<typeof CreateUserSchema>

/**
 * OTP Schemas
 */
export const SendOtpSchema = z
  .object({
    identifier: z.string().trim().min(1, "Identifier is required").max(255),
    identifierType: OtpIdentifierTypeEnum,
    purpose: OtpPurposeEnum.default("sign_in"),
  })
  .refine(
    (data) => {
      if (data.identifierType === "email") {
        return z.string().email().safeParse(data.identifier).success
      }
      return E164PhoneRegex.test(data.identifier)
    },
    {
      message: "Identifier must be a valid email or E.164 formatted phone number corresponding to identifierType",
      path: ["identifier"],
    }
  )
export type SendOtpInput = z.infer<typeof SendOtpSchema>

export const VerifyOtpSchema = z.object({
  identifier: z.string().trim().min(1, "Identifier is required").max(255),
  otp: z.string().regex(/^\d{6}$/, "OTP must be a 6-digit numeric string"),
  productId: z.string().uuid().optional(),
})
export type VerifyOtpInput = z.infer<typeof VerifyOtpSchema>

export const GoogleAuthSchema = z.object({
  idToken: z.string().min(1, "Google ID token is required"),
  productId: z.string().uuid().optional(),
})
export type GoogleAuthInput = z.infer<typeof GoogleAuthSchema>

/**
 * Session Schemas
 */
export const CreateSessionSchema = z.object({
  userId: z.string().uuid("Invalid user ID"),
  sessionTokenHash: z.string().min(1, "Session token hash is required"),
  currentProductId: z.string().uuid("Invalid product ID").optional(),
  currentSection: z.string().max(100).optional(),
  ipAddress: z.string().max(45).optional(),
  userAgent: z.string().optional(),
  deviceType: DeviceTypeEnum.optional(),
  expiresAt: z.coerce.date(),
})
export type CreateSessionInput = z.infer<typeof CreateSessionSchema>

export const SwitchProductSchema = z.object({
  productId: z.string().uuid("Invalid product ID"),
})
export type SwitchProductInput = z.infer<typeof SwitchProductSchema>

/**
 * User Products Schemas
 */
export const CreateUserProductSchema = z.object({
  userId: z.string().uuid("Invalid user ID"),
  productId: z.string().uuid("Invalid product ID"),
  tier: ProductTierEnum.default("free"),
  status: ProductAccessStatusEnum.default("active"),
})
export type CreateUserProductInput = z.infer<typeof CreateUserProductSchema>

/**
 * Emergency Contact Schemas
 */
export const CreateEmergencyContactSchema = z.object({
  contactName: z.string().trim().min(1, "Contact name is required").max(255),
  contactPhone: z.string().trim().regex(E164PhoneRegex, "Contact phone must be in E.164 format (e.g. +14155552671)"),
  relationship: z.string().trim().max(50).optional(),
  isPrimary: z.boolean().default(true),
})
export type CreateEmergencyContactInput = z.infer<typeof CreateEmergencyContactSchema>

export const UpdateEmergencyContactSchema = CreateEmergencyContactSchema.partial()
export type UpdateEmergencyContactInput = z.infer<typeof UpdateEmergencyContactSchema>
