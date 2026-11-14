import type { Request, Response, NextFunction } from "express"
import { authService, AuthServiceError } from "../services/auth.service.js"
import { OtpServiceError } from "../services/otp.service.js"
import type {
  InitiateEmailAuthInput,
  VerifyEmailAuthInput,
} from "../db/auth.validator.js"

export class AuthController {
  private service: typeof authService

  constructor(service: typeof authService = authService) {
    this.service = service
  }

  initiateEmailAuth = async (
    req: Request<{}, {}, InitiateEmailAuthInput>,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const result = await this.service.initiateEmailAuth(req.body)
      res.status(200).json(result)
    } catch (error) {
      if (error instanceof AuthServiceError) {
        res.status(error.statusCode).json(error.toJSON())
        return
      }
      if (error instanceof OtpServiceError) {
        res.status(error.statusCode).json(error.toJSON())
        return
      }
      next(error)
    }
  }

  verifyEmailAuth = async (
    req: Request<{}, {}, VerifyEmailAuthInput>,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const clientIp =
        (req.headers["x-forwarded-for"] as string)?.split(",")[0]?.trim() ||
        req.ip ||
        req.socket.remoteAddress
      const userAgent = req.headers["user-agent"]

      const result = await this.service.verifyEmailAuth(req.body, {
        ipAddress: clientIp,
        userAgent,
      })

      res.status(200).json(result)
    } catch (error) {
      if (error instanceof AuthServiceError) {
        res.status(error.statusCode).json(error.toJSON())
        return
      }
      if (error instanceof OtpServiceError) {
        res.status(error.statusCode).json(error.toJSON())
        return
      }
      next(error)
    }
  }
}

export const authController = new AuthController()
