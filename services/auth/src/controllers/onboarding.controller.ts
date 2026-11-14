import type { Request, Response, NextFunction } from "express"
import {
  onboardingService,
  OnboardingService,
  OnboardingServiceError,
} from "../services/onboarding.service.js"

export class OnboardingController {
  private service: OnboardingService

  constructor(service: OnboardingService = onboardingService) {
    this.service = service
  }

  completeOnboarding = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      if (!req.user) {
        res.status(401).json({
          error: "Unauthorized: User not authenticated",
          code: "UNAUTHORIZED",
        })
        return
      }

      const ipAddress =
        (req.headers["x-forwarded-for"] as string) || req.socket.remoteAddress
      const userAgent = req.headers["user-agent"]

      const result = await this.service.completeOnboarding(
        req.user.id,
        req.body,
        {
          ipAddress: ipAddress ? String(ipAddress).split(",")[0].trim() : undefined,
          userAgent: userAgent ? String(userAgent) : undefined,
        }
      )

      res.status(200).json(result)
    } catch (error) {
      if (error instanceof OnboardingServiceError) {
        res.status(error.statusCode).json({
          error: error.message,
          code: error.code,
          ...(error.issues ? { issues: error.issues } : {}),
        })
        return
      }
      next(error)
    }
  }
}

export const onboardingController = new OnboardingController()
