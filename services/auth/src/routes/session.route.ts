import { Router } from "express"
import { sessionController } from "../controllers/session.controller.js"
import { validateRequest } from "../middleware/validate.middleware.js"
import { authenticate } from "../middleware/auth.middleware.js"
import {
  RefreshSessionSchema,
  SwitchProductSchema,
  RevokeSessionSchema,
} from "../db/auth.validator.js"

export const sessionRouter = Router()

/**
 * POST /api/auth/session/refresh (and POST /api/auth/session)
 * Refreshes user session with Token Rotation.
 */
sessionRouter.post(
  "/refresh",
  validateRequest({ body: RefreshSessionSchema }),
  sessionController.refreshSession
)

sessionRouter.post(
  "/",
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
 * Revokes a single session (logout) via refresh token or active session.
 */
sessionRouter.post(
  "/revoke",
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
 * GET /api/auth/session/me
 * Retrieves current active session metadata and user profile.
 */
sessionRouter.get(
  "/me",
  authenticate,
  sessionController.getCurrentSession
)
