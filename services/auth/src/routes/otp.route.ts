import { Router } from "express"
import { otpController } from "../controllers/otp.controller.js"
import { validateRequest } from "../middleware/validate.middleware.js"
import {
  SendOtpSchema,
  VerifyOtpRequestSchema,
} from "../db/auth.validator.js"

export const otpRouter = Router()

/**
 * @openapi
 * /api/otp/send:
 *   post:
 *     summary: Dispatch 6-digit OTP code
 *     description: Generates an OTP, stores hash, and dispatches via Resend/Nodemailer returning an opaque requestId.
 */
otpRouter.post(
  "/send",
  validateRequest({ body: SendOtpSchema }),
  otpController.sendOtp
)

/**
 * @openapi
 * /api/otp/verify:
 *   post:
 *     summary: Verify 6-digit OTP against requestId
 *     description: Validates 6-digit code against HMAC-SHA-256 hash using requestId.
 */
otpRouter.post(
  "/verify",
  validateRequest({ body: VerifyOtpRequestSchema }),
  otpController.verifyOtp
)
