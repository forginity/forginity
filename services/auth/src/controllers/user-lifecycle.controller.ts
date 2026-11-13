import type { Request, Response, NextFunction } from "express"
import {
  userLifecycleService,
  UserLifecycleServiceError,
} from "../services/user-lifecycle.service.js"

export class UserLifecycleController {
  private service: typeof userLifecycleService

  constructor(service: typeof userLifecycleService = userLifecycleService) {
    this.service = service
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
      if (error instanceof UserLifecycleServiceError) {
        res.status(error.statusCode).json(error.toJSON())
        return
      }
      next(error)
    }
  }

  restoreAccount = async (
    req: Request<{ userId: string }>,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const { userId } = req.params
      const result = await this.service.restoreAccount(userId)
      res.status(200).json(result)
    } catch (error) {
      if (error instanceof UserLifecycleServiceError) {
        res.status(error.statusCode).json(error.toJSON())
        return
      }
      next(error)
    }
  }
}

export const userLifecycleController = new UserLifecycleController()
