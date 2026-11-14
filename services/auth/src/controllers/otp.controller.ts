import type { Request, Response, NextFunction } from "express"
import { otpService, OtpServiceError } from "../services/otp.service.js"
import type {
  SendOtpInput,
  VerifyOtpRequestInput,
} from "../db/auth.validator.js"

export class OtpController {
  private service: typeof otpService

  constructor(service: typeof otpService = otpService) {
    this.service = service
  }

  sendOtp = async (
    req: Request<{}, {}, SendOtpInput>,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const { identifier, identifierType, purpose, productName } = req.body

      if (identifierType !== "email") {
        res.status(400).json({
          error:
            "Phone number verification is scheduled for V2 rollout. Please verify using an email address.",
          code: "PHONE_VERIFICATION_DEFERRED",
        })
        return
      }

      const result = await this.service.sendOtp({
        identifier,
        identifierType,
        purpose,
        ...(productName ? { productName } : {}),
      })

      res.status(200).json(result)
    } catch (error) {
      if (error instanceof OtpServiceError) {
        res.status(error.statusCode).json(error.toJSON())
        return
      }
      next(error)
    }
  }

  verifyOtp = async (
    req: Request<{}, {}, VerifyOtpRequestInput>,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const { requestId, code } = req.body

      const result = await this.service.verifyOtp({
        requestId,
        code,
      })

      res.status(200).json(result)
    } catch (error) {
      if (error instanceof OtpServiceError) {
        res.status(error.statusCode).json(error.toJSON())
        return
      }
      next(error)
    }
  }
}

export const otpController = new OtpController()
