import { Router } from "express"
import { authController } from "../controllers/auth.controller.js"
import { validateRequest } from "../middleware/validate.middleware.js"
import {
  InitiateEmailAuthSchema,
  VerifyEmailAuthSchema,
} from "../db/auth.validator.js"

export const authRouter = Router()

/**
 * POST /api/auth/email/initiate
 * Single entry point for email authentication (Sign-in / Sign-up).
 * Dispatches a 6-digit OTP and indicates if user is new or returning.
 */
authRouter.post(
  "/initiate",
  validateRequest({ body: InitiateEmailAuthSchema }),
  authController.initiateEmailAuth
)

/**
 * POST /api/auth/email/verify
 * Validates OTP code against requestId.
 * Automatically provisions account and returns onboardingToken (if new/unonboarded)
 * or creates session and returns accessToken + refreshToken (if onboarded).
 */
authRouter.post(
  "/verify",
  validateRequest({ body: VerifyEmailAuthSchema }),
  authController.verifyEmailAuth
)
