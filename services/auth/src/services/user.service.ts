import {
  UserRepository,
  userRepository,
} from "../repositories/user.repository.js"
import {
  SessionRepository,
  sessionRepository,
} from "../repositories/session.repository.js"
import type { User } from "../db/auth.schema.js"
import type { UpdateUserProfileInput } from "../db/auth.validator.js"
import type {
  SanitizedUser,
  DeleteAccountResult,
  RestoreAccountResult,
  AuthErrorDetails,
} from "../types/auth.types.js"

export class UserServiceError extends Error {
  public statusCode: number
  public details?: AuthErrorDetails

  constructor(
    message: string,
    statusCode: number = 400,
    details?: AuthErrorDetails
  ) {
    super(message)
    this.name = "UserServiceError"
    this.statusCode = statusCode
    this.details = details
  }

  toJSON() {
    return {
      error: this.message,
      ...(this.details?.code ? { code: this.details.code } : {}),
      ...(this.details?.issues ? { issues: this.details.issues } : {}),
    }
  }
}

export function sanitizeUser(user: User): SanitizedUser {
  const { passwordHash: _unused, ...sanitized } = user
  return sanitized
}

export class UserService {
  private userRepo: UserRepository
  private sessionRepo: SessionRepository

  constructor(
    userRepo: UserRepository = userRepository,
    sessionRepo: SessionRepository = sessionRepository
  ) {
    this.userRepo = userRepo
    this.sessionRepo = sessionRepo
  }

  /**
   * Retrieves the sanitized profile for the authenticated user.
   */
  async getUserProfile(userId: string): Promise<SanitizedUser> {
    const user = await this.userRepo.findUserById(userId)
    if (!user) {
      throw new UserServiceError("User account not found.", 404, {
        code: "USER_NOT_FOUND",
      })
    }

    if (user.status === "blocked") {
      throw new UserServiceError(
        "Account is blocked. Please contact support.",
        403,
        { code: "ACCOUNT_BLOCKED" }
      )
    }

    if (user.status === "deleted") {
      throw new UserServiceError("Account has been deleted.", 403, {
        code: "ACCOUNT_DELETED",
      })
    }

    return sanitizeUser(user)
  }

  /**
   * Updates profile fields (names, gender, country, avatarUrl) and recalculates display name.
   */
  async updateUserProfile(
    userId: string,
    input: UpdateUserProfileInput
  ): Promise<SanitizedUser> {
    const existing = await this.userRepo.findUserById(userId)
    if (!existing) {
      throw new UserServiceError("User account not found.", 404, {
        code: "USER_NOT_FOUND",
      })
    }

    if (existing.status === "blocked") {
      throw new UserServiceError(
        "Account is blocked. Please contact support.",
        403,
        { code: "ACCOUNT_BLOCKED" }
      )
    }

    if (existing.status === "deleted") {
      throw new UserServiceError("Account has been deleted.", 403, {
        code: "ACCOUNT_DELETED",
      })
    }

    const firstName =
      input.firstName !== undefined ? input.firstName : existing.firstName
    const lastName =
      input.lastName !== undefined ? input.lastName : existing.lastName
    const compositeName =
      [firstName, lastName].filter(Boolean).join(" ") || existing.name

    const updateData: Record<string, any> = {
      ...input,
      ...(firstName !== undefined || lastName !== undefined
        ? { name: compositeName }
        : {}),
    }

    const updated = await this.userRepo.updateUser(userId, updateData)
    if (!updated) {
      throw new UserServiceError("Failed to update profile.", 500)
    }

    return sanitizeUser(updated)
  }

  /**
   * Self-service soft-deletes an authenticated user's account and immediately
   * revokes all active database sessions across all devices and products.
   */
  async deleteOwnAccount(userId: string): Promise<DeleteAccountResult> {
    const user = await this.userRepo.findUserById(userId)
    if (!user) {
      throw new UserServiceError("User account not found.", 404, {
        code: "USER_NOT_FOUND",
      })
    }

    if (user.status === "deleted") {
      throw new UserServiceError("Account has already been deleted.", 400, {
        code: "ACCOUNT_DELETED",
      })
    }

    // 1. Soft-delete user account
    await this.userRepo.updateUser(userId, { status: "deleted" })

    // 2. Instantly purge all active sessions across all devices
    await this.sessionRepo.deleteSessionsByUserId(userId)

    return {
      success: true,
      message:
        "Account has been deleted successfully and all active sessions revoked.",
    }
  }

  /**
   * Restores a previously soft-deleted or blocked account back to active status.
   */
  async restoreAccount(userId: string): Promise<RestoreAccountResult> {
    const user = await this.userRepo.findUserById(userId)
    if (!user) {
      throw new UserServiceError("User account not found.", 404, {
        code: "USER_NOT_FOUND",
      })
    }

    if (user.status === "active") {
      return {
        success: true,
        message: "Account is already active.",
        user: sanitizeUser(user),
      }
    }

    const updated = await this.userRepo.updateUser(userId, { status: "active" })
    if (!updated) {
      throw new UserServiceError("Failed to restore account.", 500)
    }

    return {
      success: true,
      message: "Account has been restored successfully.",
      user: sanitizeUser(updated),
    }
  }
}

export const userService = new UserService()
