import { Router } from "express"
import { onboardingController } from "../controllers/onboarding.controller.js"
import { validateRequest } from "../middleware/validate.middleware.js"
import { authenticateOnboarding } from "../middleware/auth.middleware.js"
import { OnboardingProfileSchema } from "../db/auth.validator.js"

export const onboardingRouter = Router()

/**
 * POST /api/auth/onboarding
 * Completes mandatory user profile onboarding and upgrades to an active production session.
 * Guarded strictly by the 2-hour scoped onboardingToken.
 */
onboardingRouter.post(
  "/",
  authenticateOnboarding,
  validateRequest({ body: OnboardingProfileSchema }),
  onboardingController.completeOnboarding
)
