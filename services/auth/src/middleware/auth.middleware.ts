import type { Request, Response, NextFunction } from "express"
import { verifyJwtToken } from "../utils/token.utils.js"
import { userRepository, type UserRepository } from "../repositories/user.repository.js"
import { sessionRepository, type SessionRepository } from "../repositories/session.repository.js"
import { extractCookie, REFRESH_TOKEN_COOKIE_NAME } from "../utils/cookie.utils.js"
import type {
  AccessTokenPayload,
  OnboardingTokenPayload,
  RefreshTokenPayload,
} from "../types/auth.types.js"
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

export function createAuthMiddleware(
  userRepo: UserRepository = userRepository,
  sessionRepo: SessionRepository = sessionRepository
) {
  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      let token: string | undefined
      let tokenError: any = null

      const authHeader = req.headers.authorization
      if (authHeader && authHeader.startsWith("Bearer ")) {
        token = authHeader.substring(7).trim()
      }

      // Fallback 1: Extract accessToken from cookies if header was omitted
      if (!token && req.headers.cookie) {
        token =
          extractCookie(req.headers.cookie, "admin_session") ||
          extractCookie(req.headers.cookie, "accessToken") ||
          extractCookie(req.headers.cookie, "access_token")
      }

      // If an access token is present, attempt verification
      if (token) {
        try {
          const payload = await verifyJwtToken<AccessTokenPayload>(token, "access")
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
          return
        } catch (err: any) {
          tokenError = err
          // Access token expired or invalid -> fall through to refresh token cookie validation
        }
      }

      // Fallback 2: Check if an active, valid refreshToken cookie exists (seamless session continuity)
      if (req.headers.cookie) {
        const cookieRefreshToken = extractCookie(
          req.headers.cookie,
          REFRESH_TOKEN_COOKIE_NAME
        )

        if (cookieRefreshToken) {
          try {
            const refreshPayload = await verifyJwtToken<RefreshTokenPayload>(
              cookieRefreshToken,
              "refresh"
            )

            const session = await sessionRepo.findSessionById(
              refreshPayload.sessionId
            )

            if (session && new Date(session.expiresAt).getTime() > Date.now()) {
              const user = await userRepo.findUserById(session.userId)

              if (
                user &&
                user.status !== "blocked" &&
                user.status !== "deleted"
              ) {
                req.user = user
                req.tokenPayload = {
                  sub: user.id,
                  email: user.email!,
                  role: user.userType,
                  userType: user.userType,
                  scope: "access",
                } as AccessTokenPayload
                next()
                return
              }
            }
          } catch {
            // Refresh token also expired or invalid -> fall through to 401
          }
        }
      }

      if (tokenError) {
        res.status(401).json({
          error: tokenError?.message || "Unauthorized: Invalid or expired access token",
          code: "INVALID_TOKEN",
        })
        return
      }

      res.status(401).json({
        error: "Unauthorized: Missing or malformed Authorization header",
        code: "UNAUTHORIZED",
      })
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

/**
 * Administrative Access Guard Middleware.
 * Strictly verifies that the authenticated user possesses `userType === "admin"`.
 * Returns 403 Forbidden with standard code "FORBIDDEN" for non-admin users.
 */
export function requireAdmin(
  req: Request,
  res: Response,
  next: NextFunction
): void {
  const user = req.user
  if (!user || user.userType !== "admin") {
    res.status(403).json({
      error: "Forbidden: Administrative access required",
      code: "FORBIDDEN",
    })
    return
  }
  next()
}

