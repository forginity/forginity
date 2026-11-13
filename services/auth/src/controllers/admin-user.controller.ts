import type { Request, Response, NextFunction } from "express"
import {
  adminUserService,
  AdminUserServiceError,
} from "../services/admin-user.service.js"
import type {
  UserDirectoryQueryInput,
  UserIdParam,
  UpdateUserStatusInput,
} from "../db/auth.validator.js"

export class AdminUserController {
  private service: typeof adminUserService

  constructor(service: typeof adminUserService = adminUserService) {
    this.service = service
  }

  listUsers = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const query = req.query as unknown as UserDirectoryQueryInput
      const result = await this.service.listUsers(query)
      res.status(200).json(result)
    } catch (error) {
      if (error instanceof AdminUserServiceError) {
        res.status(error.statusCode).json(error.toJSON())
        return
      }
      next(error)
    }
  }

  getUserDetails = async (
    req: Request<UserIdParam>,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const { userId } = req.params
      const result = await this.service.getUserDetails(userId)
      res.status(200).json(result)
    } catch (error) {
      if (error instanceof AdminUserServiceError) {
        res.status(error.statusCode).json(error.toJSON())
        return
      }
      next(error)
    }
  }

  updateUserStatus = async (
    req: Request<UserIdParam, {}, UpdateUserStatusInput>,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const { userId } = req.params
      const result = await this.service.updateUserStatus(userId, req.body)
      res.status(200).json(result)
    } catch (error) {
      if (error instanceof AdminUserServiceError) {
        res.status(error.statusCode).json(error.toJSON())
        return
      }
      next(error)
    }
  }
}

export const adminUserController = new AdminUserController()
