import type { Request, Response, NextFunction } from "express"
import {
  googleAuthService,
  GoogleAuthServiceError,
} from "../services/google-auth.service.js"
import type { GoogleAuthInput } from "../db/auth.validator.js"

export class GoogleAuthController {
  private service: typeof googleAuthService

  constructor(service: typeof googleAuthService = googleAuthService) {
    this.service = service
  }

  authenticateGoogle = async (
    req: Request<{}, {}, GoogleAuthInput>,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const clientIp =
        (req.headers["x-forwarded-for"] as string)?.split(",")[0]?.trim() ||
        req.ip ||
        req.socket.remoteAddress
      const userAgent = req.headers["user-agent"]

      const result = await this.service.authenticateGoogle(req.body, {
        ipAddress: clientIp,
        userAgent,
      })

      res.status(200).json(result)
    } catch (error) {
      if (error instanceof GoogleAuthServiceError) {
        res.status(error.statusCode).json(error.toJSON())
        return
      }
      next(error)
    }
  }
}

export const googleAuthController = new GoogleAuthController()
