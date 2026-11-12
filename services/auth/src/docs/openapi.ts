import { z } from "zod"
import {
  extendZodWithOpenApi,
  OpenAPIRegistry,
  OpenApiGeneratorV3,
} from "@asteasolutions/zod-to-openapi"
import {
  SendOtpSchema,
  VerifyOtpRequestSchema,
  InitiateEmailAuthSchema,
  VerifyEmailAuthSchema,
  GoogleAuthSchema,
  RefreshSessionSchema,
  SwitchProductSchema,
  RevokeSessionSchema,
  OnboardingProfileSchema,
} from "../db/auth.validator.js"

// Patch Zod with OpenAPI methods
extendZodWithOpenApi(z)

export const registry = new OpenAPIRegistry()

// Security schemes
registry.registerComponent("securitySchemes", "BearerAuth", {
  type: "http",
  scheme: "bearer",
  bearerFormat: "JWT",
  description: "Scoped Onboarding or SSO Session JWT",
})

// Common Schemas
export const HealthResponseSchema = z
  .object({
    status: z.string().openapi({ example: "ok" }),
    service: z.string().openapi({ example: "auth" }),
    database: z.string().openapi({ example: "connected" }),
    timestamp: z.string().openapi({ example: "2026-11-06T21:00:00.000Z" }),
  })
  .openapi("HealthResponse", {
    description: "Auth microservice operational health status",
  })

export const ErrorResponseSchema = z
  .object({
    error: z.string().openapi({ example: "Invalid verification code." }),
    code: z.string().optional().openapi({ example: "INVALID_CODE" }),
    remainingAttempts: z.number().int().optional().openapi({ example: 2 }),
    maxAttempts: z.number().int().optional().openapi({ example: 3 }),
    issues: z
      .array(
        z.object({
          field: z.string().openapi({ example: "identifier" }),
          message: z.string().openapi({ example: "Invalid email address" }),
        })
      )
      .optional(),
  })
  .openapi("ErrorResponse", {
    description: "Standard API error response payload",
  })

export const SendOtpResponseSchema = z
  .object({
    success: z.boolean().openapi({ example: true }),
    requestId: z.string().uuid().openapi({ example: "550e8400-e29b-41d4-a716-446655440000" }),
    expiresInSeconds: z.number().openapi({ example: 600 }),
    cooldownSeconds: z.number().openapi({ example: 60 }),
    debugOtp: z.string().optional().openapi({ example: "123456" }),
  })
  .openapi("SendOtpResponse", {
    description: "Response confirming dispatch of verification code with opaque requestId",
  })

export const VerifyOtpResponseSchema = z
  .object({
    verified: z.boolean().openapi({ example: true }),
    requestId: z.string().uuid().openapi({ example: "550e8400-e29b-41d4-a716-446655440000" }),
    identifier: z.string().openapi({ example: "user@forginity.com" }),
    identifierType: z.enum(["email", "phone"]).openapi({ example: "email" }),
    purpose: z.string().openapi({ example: "authentication" }),
  })
  .openapi("VerifyOtpResponse", {
    description: "Verification response confirming successful code validation against requestId",
  })

export const InitiateEmailAuthResponseSchema = z
  .object({
    success: z.boolean().openapi({ example: true }),
    isNewUser: z
      .boolean()
      .openapi({
        example: true,
        description: "True if the email belongs to a new user; false if returning user",
      }),
    requestId: z.string().uuid().openapi({ example: "550e8400-e29b-41d4-a716-446655440000" }),
    expiresInSeconds: z.number().openapi({ example: 600 }),
    cooldownSeconds: z.number().openapi({ example: 60 }),
    debugOtp: z.string().optional().openapi({ example: "123456" }),
  })
  .openapi("InitiateEmailAuthResponse", {
    description: "Response from unified passwordless email authentication initiation",
  })

export const UserResponseSchema = z
  .object({
    id: z.string().uuid().openapi({ example: "550e8400-e29b-41d4-a716-446655440000" }),
    email: z.string().email().openapi({ example: "rider@forginity.com" }),
    phone: z.string().nullable().optional(),
    name: z.string().nullable().optional().openapi({ example: "John Doe" }),
    firstName: z.string().nullable().optional().openapi({ example: "John" }),
    lastName: z.string().nullable().optional().openapi({ example: "Doe" }),
    gender: z.string().nullable().optional().openapi({ example: "male" }),
    country: z.string().nullable().optional().openapi({ example: "IN" }),
    avatarUrl: z.string().nullable().optional(),
    authProvider: z.string().openapi({ example: "email_otp" }),
    isVerified: z.boolean().openapi({ example: true }),
    isEmailVerified: z.boolean().openapi({ example: true }),
    isPhoneVerified: z.boolean().openapi({ example: false }),
    isOnboarded: z.boolean().openapi({ example: false }),
    status: z.string().openapi({ example: "active" }),
    createdAt: z.date().or(z.string()).openapi({ example: "2026-11-10T20:00:00.000Z" }),
    updatedAt: z.date().or(z.string()).openapi({ example: "2026-11-10T20:00:00.000Z" }),
  })
  .openapi("UserResponse", {
    description: "Sanitized user profile entity",
  })

export const VerifyEmailAuthResponseSchema = z
  .object({
    success: z.boolean().openapi({ example: true }),
    isNewUser: z.boolean().openapi({ example: true }),
    isOnboarded: z.boolean().openapi({ example: false }),
    user: UserResponseSchema,
    onboardingToken: z.string().optional().openapi({ example: "eyJhbGciOiJIUzI1NiIsIn..." }),
    session: z
      .object({
        accessToken: z.string().openapi({ example: "eyJhbGciOiJIUzI1NiIsIn..." }),
        refreshToken: z.string().openapi({ example: "eyJhbGciOiJIUzI1NiIsIn..." }),
        expiresIn: z.number().openapi({ example: 900 }),
      })
      .optional(),
  })
  .openapi("VerifyEmailAuthResponse", {
    description: "Verification response returning onboardingToken or active session",
  })

export const GoogleAuthResponseSchema = z
  .object({
    success: z.boolean().openapi({ example: true }),
    isNewUser: z.boolean().openapi({
      example: false,
      description: "True if a new user account was registered; false if returning user",
    }),
    isOnboarded: z.boolean().openapi({
      example: true,
      description: "True if profile onboarding is complete; false if onboarding is required",
    }),
    user: UserResponseSchema,
    onboardingToken: z.string().optional().openapi({
      example: "eyJhbGciOiJIUzI1NiIsIn...",
      description: "2-hour scoped JWT token returned when isOnboarded is false for mandatory onboarding",
    }),
    session: z
      .object({
        accessToken: z.string().openapi({ example: "eyJhbGciOiJIUzI1NiIsIn..." }),
        refreshToken: z.string().openapi({ example: "eyJhbGciOiJIUzI1NiIsIn..." }),
        expiresIn: z.number().openapi({ example: 900 }),
      })
      .optional(),
  })
  .openapi("GoogleAuthResponse", {
    description: "Response from Google authentication returning onboardingToken or active session",
  })

// 1. Health Route
registry.registerPath({
  method: "get",
  path: "/api/health",
  tags: ["System"],
  summary: "Health Check",
  description: "Returns health status of the auth microservice and database connection.",
  responses: {
    200: {
      description: "Service is healthy and database is connected",
      content: {
        "application/json": {
          schema: HealthResponseSchema,
        },
      },
    },
    503: {
      description: "Service or database is unhealthy",
      content: {
        "application/json": {
          schema: HealthResponseSchema,
        },
      },
    },
  },
})

// 2. OTP Send Route
registry.registerPath({
  method: "post",
  path: "/api/auth/otp/send",
  tags: ["OTP"],
  summary: "Dispatch 6-Digit OTP Code",
  description:
    "Generates a 6-digit numeric OTP, computes HMAC-SHA-256 hash, and dispatches via Resend Nodemailer SMTP, returning an opaque requestId.",
  request: {
    body: {
      content: {
        "application/json": {
          schema: SendOtpSchema,
          example: {
            identifier: "rider@forginity.com",
            identifierType: "email",
            purpose: "authentication",
          },
        },
      },
    },
  },
  responses: {
    200: {
      description: "OTP generated and dispatched successfully",
      content: {
        "application/json": {
          schema: SendOtpResponseSchema,
        },
      },
    },
    400: {
      description: "Validation failure or phone verification deferred to V2",
      content: {
        "application/json": {
          schema: ErrorResponseSchema,
        },
      },
    },
    429: {
      description: "Rate limit cooldown active (must wait 60 seconds)",
      content: {
        "application/json": {
          schema: ErrorResponseSchema,
        },
      },
    },
  },
})

// 3. OTP Verify Route
registry.registerPath({
  method: "post",
  path: "/api/auth/otp/verify",
  tags: ["OTP"],
  summary: "Verify OTP Code by RequestId",
  description:
    "Validates 6-digit numeric code against HMAC-SHA-256 hash using the opaque requestId. Enforces 10-minute expiry and 3 attempts.",
  request: {
    body: {
      content: {
        "application/json": {
          schema: VerifyOtpRequestSchema,
          example: {
            requestId: "550e8400-e29b-41d4-a716-446655440000",
            code: "123456",
          },
        },
      },
    },
  },
  responses: {
    200: {
      description: "Code verified successfully against requestId",
      content: {
        "application/json": {
          schema: VerifyOtpResponseSchema,
        },
      },
    },
    400: {
      description: "Invalid OTP code, expired code, or maximum attempts exceeded",
      content: {
        "application/json": {
          schema: ErrorResponseSchema,
        },
      },
    },
  },
})

// 4. Email Auth Initiate Route
registry.registerPath({
  method: "post",
  path: "/api/auth/email/initiate",
  tags: ["Authentication"],
  summary: "Initiate Passwordless Email Sign-In / Sign-Up",
  description:
    "Unified entry point for both registration and authentication. Checks if the account exists, validates account status, dispatches a 6-digit OTP code, and returns isNewUser: true/false with an opaque requestId.",
  request: {
    body: {
      content: {
        "application/json": {
          schema: InitiateEmailAuthSchema,
          example: {
            email: "rider@forginity.com",
          },
        },
      },
    },
  },
  responses: {
    200: {
      description: "OTP dispatched successfully with isNewUser indication",
      content: {
        "application/json": {
          schema: InitiateEmailAuthResponseSchema,
        },
      },
    },
    400: {
      description: "Validation failure (e.g. malformed email)",
      content: {
        "application/json": {
          schema: ErrorResponseSchema,
        },
      },
    },
    403: {
      description: "Account is blocked or deleted",
      content: {
        "application/json": {
          schema: ErrorResponseSchema,
        },
      },
    },
    429: {
      description: "Rate limit cooldown active (must wait 60 seconds)",
      content: {
        "application/json": {
          schema: ErrorResponseSchema,
        },
      },
    },
  },
})

// 5. Email Auth Verify Route
registry.registerPath({
  method: "post",
  path: "/api/auth/email/verify",
  tags: ["Authentication"],
  summary: "Verify Email OTP & Provision Session or Onboarding Token",
  description:
    "Validates the OTP code against requestId. If the user is new, automatically registers the account and returns a 2-hour onboardingToken. If the user is returning and onboarded, establishes an active session and returns accessToken + refreshToken.",
  request: {
    body: {
      content: {
        "application/json": {
          schema: VerifyEmailAuthSchema,
          example: {
            requestId: "550e8400-e29b-41d4-a716-446655440000",
            code: "123456",
          },
        },
      },
    },
  },
  responses: {
    200: {
      description: "Code verified successfully; returns user entity with onboardingToken or active session",
      content: {
        "application/json": {
          schema: VerifyEmailAuthResponseSchema,
        },
      },
    },
    400: {
      description: "Invalid OTP code, expired code, or maximum attempts exceeded",
      content: {
        "application/json": {
          schema: ErrorResponseSchema,
        },
      },
    },
    403: {
      description: "Account is blocked or deleted",
      content: {
        "application/json": {
          schema: ErrorResponseSchema,
        },
      },
    },
  },
})

// 6. Google Social Auth Route
registry.registerPath({
  method: "post",
  path: "/api/auth/google",
  tags: ["Authentication"],
  summary: "Google OAuth 2.0 / OIDC Social Authentication",
  description:
    "Verifies Google ID token cryptographically using remote JWKS. Performs automatic account linking and provisions new user or returns session tokens.",
  request: {
    body: {
      content: {
        "application/json": {
          schema: GoogleAuthSchema,
          example: {
            idToken: "eyJhbGciOiJSUzI1NiIsImtpZCI6...",
            productId: "550e8400-e29b-41d4-a716-446655440000",
          },
        },
      },
    },
  },
  responses: {
    200: {
      description: "Google authentication successful; returns session tokens or onboarding token",
      content: {
        "application/json": {
          schema: GoogleAuthResponseSchema,
        },
      },
    },
    400: {
      description: "Invalid request body or malformed payload",
      content: {
        "application/json": {
          schema: ErrorResponseSchema,
        },
      },
    },
    401: {
      description: "Invalid, expired, or unverified Google ID token",
      content: {
        "application/json": {
          schema: ErrorResponseSchema,
        },
      },
    },
    403: {
      description: "Account is blocked or soft-deleted",
      content: {
        "application/json": {
          schema: ErrorResponseSchema,
        },
      },
    },
  },
})

export const SessionTokensResponseSchema = z
  .object({
    success: z.boolean().openapi({ example: true }),
    session: z.object({
      accessToken: z.string().openapi({ example: "eyJhbGciOiJIUzI1NiIsIn..." }),
      refreshToken: z.string().openapi({ example: "eyJhbGciOiJIUzI1NiIsIn..." }),
      expiresIn: z.number().openapi({ example: 900 }),
    }),
  })
  .openapi("SessionTokensResponse", {
    description: "Refreshed and rotated session tokens",
  })

export const SwitchProductResponseSchema = z
  .object({
    success: z.boolean().openapi({ example: true }),
    accessToken: z.string().openapi({ example: "eyJhbGciOiJIUzI1NiIsIn..." }),
    currentProductId: z.string().uuid().openapi({ example: "550e8400-e29b-41d4-a716-446655440002" }),
    currentSection: z.string().nullable().optional().openapi({ example: "dashboard" }),
    expiresIn: z.number().openapi({ example: 900 }),
  })
  .openapi("SwitchProductResponse", {
    description: "Updated access token with new active product context",
  })

export const RevokeSessionResponseSchema = z
  .object({
    success: z.boolean().openapi({ example: true }),
    message: z.string().openapi({ example: "Session successfully revoked." }),
  })
  .openapi("RevokeSessionResponse")

export const RevokeAllSessionsResponseSchema = z
  .object({
    success: z.boolean().openapi({ example: true }),
    message: z.string().openapi({ example: "All user sessions successfully revoked." }),
    revokedCount: z.number().int().openapi({ example: 2 }),
  })
  .openapi("RevokeAllSessionsResponse")

export const SessionMeResponseSchema = z
  .object({
    success: z.boolean().openapi({ example: true }),
    user: UserResponseSchema,
    session: z.object({
      id: z.string().uuid().openapi({ example: "550e8400-e29b-41d4-a716-446655440000" }),
      userId: z.string().uuid().openapi({ example: "550e8400-e29b-41d4-a716-446655440001" }),
      currentProductId: z.string().uuid().nullable().optional(),
      currentSection: z.string().nullable().optional(),
      ipAddress: z.string().nullable().optional(),
      userAgent: z.string().nullable().optional(),
      deviceType: z.string().nullable().optional(),
      expiresAt: z.date().or(z.string()),
      lastActiveAt: z.date().or(z.string()),
      createdAt: z.date().or(z.string()),
    }),
  })
  .openapi("SessionMeResponse")

// 6. Session Refresh Route
registry.registerPath({
  method: "post",
  path: "/api/auth/session/refresh",
  tags: ["Session Management"],
  summary: "Refresh Session Tokens with Token Rotation",
  description:
    "Accepts a 30-day refresh token, verifies its signature and database standing in auth_db.sessions, rotates the refresh token secret to eliminate replay attacks, and issues a fresh 15-minute access JWT.",
  request: {
    body: {
      content: {
        "application/json": {
          schema: RefreshSessionSchema,
          example: {
            refreshToken: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
          },
        },
      },
    },
  },
  responses: {
    200: {
      description: "Session refreshed and rotated successfully",
      content: {
        "application/json": {
          schema: SessionTokensResponseSchema,
        },
      },
    },
    400: {
      description: "Invalid request payload or malformed token",
      content: {
        "application/json": {
          schema: ErrorResponseSchema,
        },
      },
    },
    401: {
      description: "Expired, revoked, or reused refresh token",
      content: {
        "application/json": {
          schema: ErrorResponseSchema,
        },
      },
    },
    403: {
      description: "Account is blocked or deleted",
      content: {
        "application/json": {
          schema: ErrorResponseSchema,
        },
      },
    },
  },
})

// 7. Multi-Tenant Product Switch Route
registry.registerPath({
  method: "post",
  path: "/api/auth/session/switch-product",
  tags: ["Session Management"],
  summary: "Switch Active Product Context",
  description:
    "Updates the active product ID on the user session and issues a new access token containing updated product claims.",
  security: [{ BearerAuth: [] }],
  request: {
    body: {
      content: {
        "application/json": {
          schema: SwitchProductSchema,
          example: {
            productId: "550e8400-e29b-41d4-a716-446655440002",
            section: "rider-map",
          },
        },
      },
    },
  },
  responses: {
    200: {
      description: "Switched product context successfully",
      content: {
        "application/json": {
          schema: SwitchProductResponseSchema,
        },
      },
    },
    400: {
      description: "Invalid product ID format",
      content: {
        "application/json": {
          schema: ErrorResponseSchema,
        },
      },
    },
    401: {
      description: "Missing or invalid Bearer access token",
      content: {
        "application/json": {
          schema: ErrorResponseSchema,
        },
      },
    },
    403: {
      description: "Account is blocked or deleted",
      content: {
        "application/json": {
          schema: ErrorResponseSchema,
        },
      },
    },
  },
})

// 8. Revoke Single Session Route
registry.registerPath({
  method: "post",
  path: "/api/auth/session/revoke",
  tags: ["Session Management"],
  summary: "Revoke Single Session (Logout)",
  description:
    "Revokes the session corresponding to the provided refresh token or active session.",
  request: {
    body: {
      content: {
        "application/json": {
          schema: RevokeSessionSchema,
          example: {
            refreshToken: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
          },
        },
      },
    },
  },
  responses: {
    200: {
      description: "Session revoked successfully",
      content: {
        "application/json": {
          schema: RevokeSessionResponseSchema,
        },
      },
    },
  },
})

// 9. Revoke All Sessions Route
registry.registerPath({
  method: "post",
  path: "/api/auth/session/revoke-all",
  tags: ["Session Management"],
  summary: "Revoke All Sessions for User (Global Logout)",
  description:
    "Deletes all active sessions across all devices for the authenticated user.",
  security: [{ BearerAuth: [] }],
  responses: {
    200: {
      description: "All sessions revoked successfully",
      content: {
        "application/json": {
          schema: RevokeAllSessionsResponseSchema,
        },
      },
    },
    401: {
      description: "Unauthorized",
      content: {
        "application/json": {
          schema: ErrorResponseSchema,
        },
      },
    },
  },
})

// 10. Current Session Me Route
registry.registerPath({
  method: "get",
  path: "/api/auth/session/me",
  tags: ["Session Management"],
  summary: "Get Current Active Session & User Profile",
  description:
    "Retrieves the authenticated user profile and active session metadata.",
  security: [{ BearerAuth: [] }],
  responses: {
    200: {
      description: "Current session retrieved successfully",
      content: {
        "application/json": {
          schema: SessionMeResponseSchema,
        },
      },
    },
    401: {
      description: "Unauthorized",
      content: {
        "application/json": {
          schema: ErrorResponseSchema,
        },
      },
    },
    404: {
      description: "No active session found",
      content: {
        "application/json": {
          schema: ErrorResponseSchema,
        },
      },
    },
  },
})

export const OnboardingResponseSchema = z
  .object({
    success: z.boolean().openapi({ example: true }),
    user: UserResponseSchema,
    session: z.object({
      accessToken: z.string().openapi({ example: "eyJhbGciOiJIUzI1NiIsIn..." }),
      refreshToken: z.string().openapi({ example: "eyJhbGciOiJIUzI1NiIsIn..." }),
      expiresIn: z.number().openapi({ example: 900 }),
    }),
  })
  .openapi("OnboardingResponse", {
    description: "Response from profile onboarding with updated user and upgraded session tokens",
  })

// 11. Profile Onboarding Route
registry.registerPath({
  method: "post",
  path: "/api/auth/onboarding",
  tags: ["Onboarding"],
  summary: "Complete Mandatory Profile Onboarding",
  description:
    "Captures first name, last name, gender, and ISO country code per Figma Node 179:509. Guarded strictly by the 2-hour scoped onboardingToken. Flips isOnboarded to true and upgrades session to production tokens.",
  security: [{ BearerAuth: [] }],
  request: {
    body: {
      content: {
        "application/json": {
          schema: OnboardingProfileSchema,
          example: {
            firstName: "Alex",
            lastName: "Rider",
            gender: "male",
            country: "US",
          },
        },
      },
    },
  },
  responses: {
    200: {
      description: "Profile onboarding completed successfully; returns active session and user entity",
      content: {
        "application/json": {
          schema: OnboardingResponseSchema,
        },
      },
    },
    400: {
      description: "Validation error in profile fields",
      content: {
        "application/json": {
          schema: ErrorResponseSchema,
        },
      },
    },
    401: {
      description: "Missing or invalid onboarding token",
      content: {
        "application/json": {
          schema: ErrorResponseSchema,
        },
      },
    },
    403: {
      description: "Account is blocked or deleted",
      content: {
        "application/json": {
          schema: ErrorResponseSchema,
        },
      },
    },
  },
})

// OpenAPI 3.0.0 Document Generator
const generator = new OpenApiGeneratorV3(registry.definitions)

export const openApiDocument = generator.generateDocument({
  openapi: "3.0.0",
  info: {
    title: "Forginity Auth & Identity Microservice API",
    version: "1.0.0",
    description:
      "Centralized Single Sign-On (SSO), Identity, and Reusable OTP Engine for the Forginity monorepo platform.",
    contact: {
      name: "Forginity Platform Engineering",
      url: "https://forginity.com",
    },
  },
  servers: [
    {
      url: "http://localhost:3001",
      description: "Local Development Server",
    },
  ],
})
