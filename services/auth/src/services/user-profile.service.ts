import { UserRepository, userRepository } from "../repositories/user.repository.js"
import type { User } from "../db/auth.schema.js"
import type { UpdateUserProfileInput } from "../db/auth.validator.js"
import type {
  SanitizedUser,
  AuthErrorDetails,
} from "../types/auth.types.js"

export class UserProfileServiceError extends Error {
  public statusCode: number
  public details?: AuthErrorDetails

  constructor(
    message: string,
    statusCode: number = 400,
    details?: AuthErrorDetails
  ) {
    super(message)
    this.name = "UserProfileServiceError"
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

export class UserProfileService {
  private userRepo: UserRepository

  constructor(userRepo: UserRepository = userRepository) {
    this.userRepo = userRepo
  }

  /**
   * Retrieves the sanitized profile for the authenticated user.
   */
  async getUserProfile(userId: string): Promise<SanitizedUser> {
    const user = await this.userRepo.findUserById(userId)
    if (!user) {
      throw new UserProfileServiceError("User account not found.", 404, {
        code: "USER_NOT_FOUND",
      })
    }

    if (user.status === "blocked") {
      throw new UserProfileServiceError(
        "Account is blocked. Please contact support.",
        403,
        { code: "ACCOUNT_BLOCKED" }
      )
    }

    if (user.status === "deleted") {
      throw new UserProfileServiceError("Account has been deleted.", 403, {
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
      throw new UserProfileServiceError("User account not found.", 404, {
        code: "USER_NOT_FOUND",
      })
    }

    if (existing.status === "blocked") {
      throw new UserProfileServiceError(
        "Account is blocked. Please contact support.",
        403,
        { code: "ACCOUNT_BLOCKED" }
      )
    }

    if (existing.status === "deleted") {
      throw new UserProfileServiceError("Account has been deleted.", 403, {
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
      throw new UserProfileServiceError("Failed to update profile.", 500)
    }

    return sanitizeUser(updated)
  }
}

export const userProfileService = new UserProfileService()
