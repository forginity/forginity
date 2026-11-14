import { Router } from "express"
import { googleAuthController } from "../controllers/google-auth.controller.js"
import { validateRequest } from "../middleware/validate.middleware.js"
import { GoogleAuthSchema } from "../db/auth.validator.js"

export const googleAuthRouter = Router()

/**
 * POST /api/auth/google
 * Social authentication and deterministic account linking via Google OAuth 2.0 / OIDC.
 */
googleAuthRouter.post(
  "/",
  validateRequest({ body: GoogleAuthSchema }),
  googleAuthController.authenticateGoogle
)
