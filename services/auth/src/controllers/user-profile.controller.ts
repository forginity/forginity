import type { Request, Response, NextFunction } from "express"
import {
  userProfileService,
  UserProfileServiceError,
} from "../services/user-profile.service.js"
import type { UpdateUserProfileInput } from "../db/auth.validator.js"

export class UserProfileController {
  private service: typeof userProfileService

  constructor(service: typeof userProfileService = userProfileService) {
    this.service = service
  }

  getProfile = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const userId = req.user!.id
      const user = await this.service.getUserProfile(userId)
      res.status(200).json({ success: true, user })
    } catch (error) {
      if (error instanceof UserProfileServiceError) {
        res.status(error.statusCode).json(error.toJSON())
        return
      }
      next(error)
    }
  }

  updateProfile = async (
    req: Request<{}, {}, UpdateUserProfileInput>,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const userId = req.user!.id
      const user = await this.service.updateUserProfile(userId, req.body)
      res.status(200).json({ success: true, user })
    } catch (error) {
      if (error instanceof UserProfileServiceError) {
        res.status(error.statusCode).json(error.toJSON())
        return
      }
      next(error)
    }
  }
}

export const userProfileController = new UserProfileController()
