import { UserRepository, userRepository } from "../repositories/user.repository.js"
import { SessionRepository, sessionRepository } from "../repositories/session.repository.js"
import type { User } from "../db/auth.schema.js"
import type {
  SanitizedUser,
  DeleteAccountResult,
  RestoreAccountResult,
  AuthErrorDetails,
} from "../types/auth.types.js"

export class UserLifecycleServiceError extends Error {
  public statusCode: number
  public details?: AuthErrorDetails

  constructor(
    message: string,
    statusCode: number = 400,
    details?: AuthErrorDetails
  ) {
    super(message)
    this.name = "UserLifecycleServiceError"
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

export class UserLifecycleService {
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
   * Soft-deletes a user's account and immediately purges all active sessions across all devices.
   */
  async deleteOwnAccount(userId: string): Promise<DeleteAccountResult> {
    const user = await this.userRepo.findUserById(userId)
    if (!user) {
      throw new UserLifecycleServiceError("User account not found.", 404, {
        code: "USER_NOT_FOUND",
      })
    }

    if (user.status === "deleted") {
      throw new UserLifecycleServiceError("Account has already been deleted.", 400, {
        code: "ACCOUNT_DELETED",
      })
    }

    // 1. Soft-delete user account
    await this.userRepo.updateUser(userId, { status: "deleted" })

    // 2. Instantly purge all active sessions across all devices
    await this.sessionRepo.deleteSessionsByUserId(userId)

    return {
      success: true,
      message: "Account has been deleted successfully and all active sessions revoked.",
    }
  }

  /**
   * Restores a previously deleted or blocked account back to active.
   */
  async restoreAccount(userId: string): Promise<RestoreAccountResult> {
    const user = await this.userRepo.findUserById(userId)
    if (!user) {
      throw new UserLifecycleServiceError("User account not found.", 404, {
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
      throw new UserLifecycleServiceError("Failed to restore account.", 500)
    }

    return {
      success: true,
      message: "Account has been restored successfully.",
      user: sanitizeUser(updated),
    }
  }
}

export const userLifecycleService = new UserLifecycleService()
