import { Router } from "express"
import { userController } from "../controllers/user.controller.js"
import { emergencyContactController } from "../controllers/emergency-contact.controller.js"
import { adminUserController } from "../controllers/admin-user.controller.js"
import { authenticate, requireAdmin } from "../middleware/auth.middleware.js"
import { validateRequest } from "../middleware/validate.middleware.js"
import {
  UpdateUserProfileSchema,
  CreateEmergencyContactSchema,
  UpdateEmergencyContactSchema,
  ContactIdParamSchema,
  UserIdParamSchema,
  UserDirectoryQuerySchema,
  UpdateUserStatusSchema,
} from "../db/auth.validator.js"

export const userRouter = Router()

// All user and profile routes require Bearer accessToken authentication
userRouter.use(authenticate)

/**
 * 1. User Profile & Self-Service Lifecycle Routes
 */
userRouter.get("/me", userController.getProfile)

userRouter.put(
  "/me",
  validateRequest({ body: UpdateUserProfileSchema }),
  userController.updateProfile
)

userRouter.delete("/me", userController.deleteOwnAccount)

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
  userController.restoreAccount
)

/**
 * 4. Admin User Management Directory & Moderation Operations
 */
userRouter.get(
  "/",
  requireAdmin,
  validateRequest({ query: UserDirectoryQuerySchema }),
  adminUserController.listUsers
)

userRouter.patch(
  "/:userId/status",
  requireAdmin,
  validateRequest({
    params: UserIdParamSchema,
    body: UpdateUserStatusSchema,
  }),
  adminUserController.updateUserStatus
)

userRouter.get(
  "/:userId",
  requireAdmin,
  validateRequest({ params: UserIdParamSchema }),
  adminUserController.getUserDetails
)
