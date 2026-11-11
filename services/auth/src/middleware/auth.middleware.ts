import type { Request, Response, NextFunction } from "express"
import { verifyJwtToken } from "../utils/token.utils.js"
import { userRepository, type UserRepository } from "../repositories/user.repository.js"
import type { AccessTokenPayload, OnboardingTokenPayload } from "../types/auth.types.js"
import type { User } from "../db/auth.schema.js"

export interface AuthenticatedRequest extends Request {
  user: User
  tokenPayload: AccessTokenPayload | OnboardingTokenPayload
}

declare global {
  namespace Express {
    interface Request {
      user?: User
      tokenPayload?: AccessTokenPayload | OnboardingTokenPayload
    }
  }
}

export function createAuthMiddleware(userRepo: UserRepository = userRepository) {
  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const authHeader = req.headers.authorization
      if (!authHeader || !authHeader.startsWith("Bearer ")) {
        res.status(401).json({
          error: "Unauthorized: Missing or malformed Authorization header",
          code: "UNAUTHORIZED",
        })
        return
      }

      const token = authHeader.substring(7).trim()
      if (!token) {
        res.status(401).json({
          error: "Unauthorized: Token string is empty",
          code: "UNAUTHORIZED",
        })
        return
      }

      let payload: AccessTokenPayload
      try {
        payload = await verifyJwtToken<AccessTokenPayload>(token, "access")
      } catch (tokenError: any) {
        res.status(401).json({
          error: tokenError?.message || "Unauthorized: Invalid or expired access token",
          code: "INVALID_TOKEN",
        })
        return
      }

      const user = await userRepo.findUserById(payload.sub)
      if (!user) {
        res.status(401).json({
          error: "Unauthorized: User account not found",
          code: "USER_NOT_FOUND",
        })
        return
      }

      if (user.status === "blocked") {
        res.status(403).json({
          error: "Account is blocked. Please contact support.",
          code: "ACCOUNT_BLOCKED",
        })
        return
      }

      if (user.status === "deleted") {
        res.status(403).json({
          error: "Account has been deleted.",
          code: "ACCOUNT_DELETED",
        })
        return
      }

      req.user = user
      req.tokenPayload = payload
      next()
    } catch (error) {
      next(error)
    }
  }
}

export const authenticate = createAuthMiddleware()

export function createOnboardingAuthMiddleware(userRepo: UserRepository = userRepository) {
  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const authHeader = req.headers.authorization
      if (!authHeader || !authHeader.startsWith("Bearer ")) {
        res.status(401).json({
          error: "Unauthorized: Missing or malformed Authorization header",
          code: "UNAUTHORIZED",
        })
        return
      }

      const token = authHeader.substring(7).trim()
      if (!token) {
        res.status(401).json({
          error: "Unauthorized: Token string is empty",
          code: "UNAUTHORIZED",
        })
        return
      }

      let payload: OnboardingTokenPayload
      try {
        payload = await verifyJwtToken<OnboardingTokenPayload>(token, "onboarding")
      } catch (tokenError: any) {
        res.status(401).json({
          error: tokenError?.message || "Unauthorized: Invalid or expired onboarding token",
          code: "INVALID_TOKEN",
        })
        return
      }

      const user = await userRepo.findUserById(payload.sub)
      if (!user) {
        res.status(401).json({
          error: "Unauthorized: User account not found",
          code: "USER_NOT_FOUND",
        })
        return
      }

      if (user.status === "blocked") {
        res.status(403).json({
          error: "Account is blocked. Please contact support.",
          code: "ACCOUNT_BLOCKED",
        })
        return
      }

      if (user.status === "deleted") {
        res.status(403).json({
          error: "Account has been deleted.",
          code: "ACCOUNT_DELETED",
        })
        return
      }

      req.user = user
      req.tokenPayload = payload
      next()
    } catch (error) {
      next(error)
    }
  }
}

export const authenticateOnboarding = createOnboardingAuthMiddleware()
