import type { Request, Response, NextFunction } from "express"
import {
  sessionService,
  SessionService,
  SessionServiceError,
} from "../services/session.service.js"

export class SessionController {
  private service: SessionService

  constructor(service: SessionService = sessionService) {
    this.service = service
  }

  refreshSession = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const ipAddress =
        (req.headers["x-forwarded-for"] as string) || req.socket.remoteAddress
      const userAgent = req.headers["user-agent"]

      const result = await this.service.refreshSession(req.body, {
        ipAddress: ipAddress ? String(ipAddress).split(",")[0].trim() : undefined,
        userAgent: userAgent ? String(userAgent) : undefined,
      })

      res.status(200).json(result)
    } catch (error) {
      if (error instanceof SessionServiceError) {
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

  switchProduct = async (
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

      const result = await this.service.switchProduct(req.user.id, req.body)
      res.status(200).json(result)
    } catch (error) {
      if (error instanceof SessionServiceError) {
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

  revokeSession = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const result = await this.service.revokeSession(req.body)
      res.status(200).json(result)
    } catch (error) {
      if (error instanceof SessionServiceError) {
        res.status(error.statusCode).json({
          error: error.message,
          code: error.code,
        })
        return
      }
      next(error)
    }
  }

  revokeAllSessions = async (
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

      const result = await this.service.revokeAllSessions(req.user.id)
      res.status(200).json(result)
    } catch (error) {
      if (error instanceof SessionServiceError) {
        res.status(error.statusCode).json({
          error: error.message,
          code: error.code,
        })
        return
      }
      next(error)
    }
  }

  getCurrentSession = async (
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

      const result = await this.service.getCurrentSession(req.user.id)
      res.status(200).json(result)
    } catch (error)
      {
      if (error instanceof SessionServiceError) {
        res.status(error.statusCode).json({
          error: error.message,
          code: error.code,
        })
        return
      }
      next(error)
    }
  }
}

export const sessionController = new SessionController()
