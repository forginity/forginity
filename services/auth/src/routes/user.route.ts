import { Router } from "express"
import { userProfileController } from "../controllers/user-profile.controller.js"
import { emergencyContactController } from "../controllers/emergency-contact.controller.js"
import { userLifecycleController } from "../controllers/user-lifecycle.controller.js"
import { authenticate } from "../middleware/auth.middleware.js"
import { validateRequest } from "../middleware/validate.middleware.js"
import {
  UpdateUserProfileSchema,
  CreateEmergencyContactSchema,
  UpdateEmergencyContactSchema,
  ContactIdParamSchema,
  UserIdParamSchema,
} from "../db/auth.validator.js"

export const userRouter = Router()

// All user and profile routes require Bearer accessToken authentication
userRouter.use(authenticate)

/**
 * 1. User Profile & Self-Service Lifecycle Routes
 */
userRouter.get("/me", userProfileController.getProfile)

userRouter.put(
  "/me",
  validateRequest({ body: UpdateUserProfileSchema }),
  userProfileController.updateProfile
)

userRouter.delete("/me", userLifecycleController.deleteOwnAccount)

/**
 * 2. Emergency Contacts Sub-Resource Routes (/me/emergency-contacts)
 */
userRouter.get(
  "/me/emergency-contacts",
  emergencyContactController.listContacts
)

userRouter.post(
  "/me/emergency-contacts",
  validateRequest({ body: CreateEmergencyContactSchema }),
  emergencyContactController.createContact
)

userRouter.get(
  "/me/emergency-contacts/:contactId",
  validateRequest({ params: ContactIdParamSchema }),
  emergencyContactController.getContact
)

userRouter.put(
  "/me/emergency-contacts/:contactId",
  validateRequest({
    params: ContactIdParamSchema,
    body: UpdateEmergencyContactSchema,
  }),
  emergencyContactController.updateContact
)

userRouter.delete(
  "/me/emergency-contacts/:contactId",
  validateRequest({ params: ContactIdParamSchema }),
  emergencyContactController.deleteContact
)

/**
 * 3. Parameterized User Account Operations
 */
userRouter.post(
  "/:userId/restore",
  validateRequest({ params: UserIdParamSchema }),
  userLifecycleController.restoreAccount
)
