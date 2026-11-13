import type { Request, Response, NextFunction } from "express"
import { userService, UserServiceError } from "../services/user.service.js"
import type {
  UpdateUserProfileInput,
  UserIdParam,
} from "../db/auth.validator.js"

export class UserController {
  private service: typeof userService

  constructor(service: typeof userService = userService) {
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
      if (error instanceof UserServiceError) {
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
      if (error instanceof UserServiceError) {
        res.status(error.statusCode).json(error.toJSON())
        return
      }
      next(error)
    }
  }

  deleteOwnAccount = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const userId = req.user!.id
      const result = await this.service.deleteOwnAccount(userId)
      res.status(200).json(result)
    } catch (error) {
      if (error instanceof UserServiceError) {
        res.status(error.statusCode).json(error.toJSON())
        return
      }
      next(error)
    }
  }

  restoreAccount = async (
    req: Request<UserIdParam>,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const { userId } = req.params
      const result = await this.service.restoreAccount(userId)
      res.status(200).json(result)
    } catch (error) {
      if (error instanceof UserServiceError) {
        res.status(error.statusCode).json(error.toJSON())
        return
      }
      next(error)
    }
  }
}

export const userController = new UserController()
