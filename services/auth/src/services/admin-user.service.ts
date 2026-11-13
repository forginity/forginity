import {
  UserRepository,
  userRepository,
} from "../repositories/user.repository.js"
import {
  EmergencyContactRepository,
  emergencyContactRepository,
} from "../repositories/emergency-contact.repository.js"
import {
  SessionRepository,
  sessionRepository,
} from "../repositories/session.repository.js"
import type { User } from "../db/auth.schema.js"
import type {
  UserDirectoryQueryInput,
  UpdateUserStatusInput,
} from "../db/auth.validator.js"
import type {
  SanitizedUser,
  UserDirectoryResult,
  AdminUserDetailsResult,
  UpdateUserStatusResult,
} from "../types/auth.types.js"

export class AdminUserServiceError extends Error {
  public readonly statusCode: number
  public readonly details?: Record<string, any>

  constructor(
    message: string,
    statusCode: number = 400,
    details?: Record<string, any>
  ) {
    super(message)
    this.name = "AdminUserServiceError"
    this.statusCode = statusCode
    this.details = details
  }

  toJSON() {
    return {
      error: this.message,
      ...(this.details || {}),
    }
  }
}

export function sanitizeUser(user: User): SanitizedUser {
  const { passwordHash, ...rest } = user
  return rest
}

export class AdminUserService {
  private userRepo: UserRepository
  private contactRepo: EmergencyContactRepository
  private sessionRepo: SessionRepository

  constructor(
    userRepo: UserRepository = userRepository,
    contactRepo: EmergencyContactRepository = emergencyContactRepository,
    sessionRepo: SessionRepository = sessionRepository
  ) {
    this.userRepo = userRepo
    this.contactRepo = contactRepo
    this.sessionRepo = sessionRepo
  }

  /**
   * Retrieves paginated users list with search and status filtering.
   */
  async listUsers(
    query: UserDirectoryQueryInput
  ): Promise<UserDirectoryResult> {
    const limit = Math.min(Math.max(query.limit ?? 20, 1), 100)
    const offset = Math.max(query.offset ?? 0, 0)

    const [rawUsers, total] = await Promise.all([
      this.userRepo.findUsersWithPagination({
        search: query.search,
        status: query.status,
        userType: query.userType,
        authProvider: query.authProvider,
        limit,
        offset,
      }),
      this.userRepo.countUsers({
        search: query.search,
        status: query.status,
        userType: query.userType,
        authProvider: query.authProvider,
      }),
    ])

    const sanitized = rawUsers.map((u) => sanitizeUser(u))

    return {
      success: true,
      users: sanitized,
      pagination: {
        total,
        limit,
        offset,
        hasMore: offset + rawUsers.length < total,
      },
    }
  }

  /**
   * Retrieves single user details along with linked emergency contacts and active sessions.
   */
  async getUserDetails(userId: string): Promise<AdminUserDetailsResult> {
    const user = await this.userRepo.findUserById(userId)
    if (!user) {
      throw new AdminUserServiceError("User not found", 404, {
        code: "USER_NOT_FOUND",
      })
    }

    const [contacts, activeSessions] = await Promise.all([
      this.contactRepo.findContactsByUserId(userId),
      this.sessionRepo.findSessionsByUserId(userId),
    ])

    return {
      success: true,
      user: sanitizeUser(user),
      emergencyContacts: contacts,
      activeSessionsCount: activeSessions.length,
    }
  }

  /**
   * Updates user status (active, blocked, deleted).
   * If status is blocked or deleted, immediately revokes all active sessions across all devices.
   */
  async updateUserStatus(
    userId: string,
    input: UpdateUserStatusInput
  ): Promise<UpdateUserStatusResult> {
    const user = await this.userRepo.findUserById(userId)
    if (!user) {
      throw new AdminUserServiceError("User not found", 404, {
        code: "USER_NOT_FOUND",
      })
    }

    const updated = await this.userRepo.updateUserStatusById(
      userId,
      input.status
    )

    if (!updated) {
      throw new AdminUserServiceError("Failed to update user status", 500, {
        code: "STATUS_UPDATE_FAILED",
      })
    }

    let revokedSessionsCount = 0
    if (input.status === "blocked" || input.status === "deleted") {
      revokedSessionsCount =
        await this.sessionRepo.deleteSessionsByUserId(userId)
    }

    return {
      success: true,
      message: `User status updated to ${input.status} successfully.${
        revokedSessionsCount > 0
          ? ` Revoked ${revokedSessionsCount} active session${revokedSessionsCount === 1 ? "" : "s"}.`
          : ""
      }`,
      user: sanitizeUser(updated),
      revokedSessionsCount,
    }
  }
}

export const adminUserService = new AdminUserService()
