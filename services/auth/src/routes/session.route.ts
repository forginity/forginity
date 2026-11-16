import { Router, type Request, type Response, type NextFunction } from "express"
import { sessionController } from "../controllers/session.controller.js"
import { validateRequest } from "../middleware/validate.middleware.js"
import { authenticate } from "../middleware/auth.middleware.js"
import { extractCookie, REFRESH_TOKEN_COOKIE_NAME } from "../utils/cookie.utils.js"
import {
  RefreshSessionSchema,
  SwitchProductSchema,
  RevokeSessionSchema,
} from "../db/auth.validator.js"

export const sessionRouter = Router()

/**
 * Middleware that extracts the refreshToken from the HTTP-only cookie
 * if it is not already provided in the request body.
 */
const populateRefreshTokenFromCookie = (
  req: Request,
  _res: Response,
  next: NextFunction
): void => {
  if (!req.body?.refreshToken) {
    const cookieToken = extractCookie(req.headers.cookie, REFRESH_TOKEN_COOKIE_NAME)
    if (cookieToken) {
      req.body = { ...req.body, refreshToken: cookieToken }
    }
  }
  next()
}

/**
 * POST /api/auth/session/refresh (and POST /api/auth/session)
 * Refreshes user session with Token Rotation.
 */
sessionRouter.post(
  "/refresh",
  populateRefreshTokenFromCookie,
  validateRequest({ body: RefreshSessionSchema }),
  sessionController.refreshSession
)

sessionRouter.post(
  "/",
  populateRefreshTokenFromCookie,
  validateRequest({ body: RefreshSessionSchema }),
  sessionController.refreshSession
)

/**
 * POST /api/auth/session/switch-product
 * Switches product context for an active authenticated user session.
 */
sessionRouter.post(
  "/switch-product",
  authenticate,
  validateRequest({ body: SwitchProductSchema }),
  sessionController.switchProduct
)

/**
 * POST /api/auth/session/revoke
 * Token-level session revocation via refreshToken in request body or cookie.
 */
sessionRouter.post(
  "/revoke",
  populateRefreshTokenFromCookie,
  validateRequest({ body: RevokeSessionSchema }),
  sessionController.revokeSession
)

/**
 * POST /api/auth/session/logout
 * Authenticated single session logout via Bearer access token (and optional refreshToken in body or cookie).
 */
sessionRouter.post(
  "/logout",
  authenticate,
  populateRefreshTokenFromCookie,
  validateRequest({ body: RevokeSessionSchema }),
  sessionController.revokeSession
)

/**
 * POST /api/auth/session/revoke-all
 * Revokes all active sessions for the authenticated user (global logout).
 */
sessionRouter.post(
  "/revoke-all",
  authenticate,
  sessionController.revokeAllSessions
)

/**
 * POST /api/auth/session/logout-all (Alias for /revoke-all)
 */
sessionRouter.post(
  "/logout-all",
  authenticate,
  sessionController.revokeAllSessions
)

/**
 * GET /api/auth/session/me
 * Retrieves current active session metadata and user profile.
 */
sessionRouter.get(
  "/me",
  authenticate,
  sessionController.getCurrentSession
)
