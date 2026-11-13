import {
  EmergencyContactRepository,
  emergencyContactRepository,
} from "../repositories/emergency-contact.repository.js"
import { UserRepository, userRepository } from "../repositories/user.repository.js"
import type { UserEmergencyContact } from "../db/auth.schema.js"
import type {
  CreateEmergencyContactInput,
  UpdateEmergencyContactInput,
} from "../db/auth.validator.js"
import type { AuthErrorDetails } from "../types/auth.types.js"

export class EmergencyContactServiceError extends Error {
  public statusCode: number
  public details?: AuthErrorDetails

  constructor(
    message: string,
    statusCode: number = 400,
    details?: AuthErrorDetails
  ) {
    super(message)
    this.name = "EmergencyContactServiceError"
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

export class EmergencyContactService {
  private emergencyRepo: EmergencyContactRepository
  private userRepo: UserRepository

  constructor(
    emergencyRepo: EmergencyContactRepository = emergencyContactRepository,
    userRepo: UserRepository = userRepository
  ) {
    this.emergencyRepo = emergencyRepo
    this.userRepo = userRepo
  }

  private async verifyUserStanding(userId: string): Promise<void> {
    const user = await this.userRepo.findUserById(userId)
    if (!user) {
      throw new EmergencyContactServiceError("User account not found.", 404, {
        code: "USER_NOT_FOUND",
      })
    }

    if (user.status === "blocked") {
      throw new EmergencyContactServiceError(
        "Account is blocked. Please contact support.",
        403,
        { code: "ACCOUNT_BLOCKED" }
      )
    }

    if (user.status === "deleted") {
      throw new EmergencyContactServiceError("Account has been deleted.", 403, {
        code: "ACCOUNT_DELETED",
      })
    }
  }

  /**
   * Lists all emergency contacts configured by the user.
   */
  async listContacts(userId: string): Promise<UserEmergencyContact[]> {
    await this.verifyUserStanding(userId)
    return this.emergencyRepo.findContactsByUserId(userId)
  }

  /**
   * Retrieves a single emergency contact strictly bound to the user.
   */
  async getContactById(
    userId: string,
    contactId: string
  ): Promise<UserEmergencyContact> {
    await this.verifyUserStanding(userId)
    const contact = await this.emergencyRepo.findContactById(userId, contactId)
    if (!contact) {
      throw new EmergencyContactServiceError(
        "Emergency contact not found.",
        404,
        { code: "CONTACT_NOT_FOUND" }
      )
    }
    return contact
  }

  /**
   * Creates a new emergency contact. If isPrimary is true, demotes existing primary contacts.
   */
  async createContact(
    userId: string,
    input: CreateEmergencyContactInput
  ): Promise<UserEmergencyContact> {
    await this.verifyUserStanding(userId)
    return this.emergencyRepo.createContact(userId, input)
  }

  /**
   * Updates an existing contact. Prevents IDOR by verifying ownership.
   */
  async updateContact(
    userId: string,
    contactId: string,
    input: UpdateEmergencyContactInput
  ): Promise<UserEmergencyContact> {
    await this.verifyUserStanding(userId)
    const updated = await this.emergencyRepo.updateContact(
      userId,
      contactId,
      input
    )
    if (!updated) {
      throw new EmergencyContactServiceError(
        "Emergency contact not found.",
        404,
        { code: "CONTACT_NOT_FOUND" }
      )
    }
    return updated
  }

  /**
   * Deletes an emergency contact. Prevents IDOR by verifying ownership.
   */
  async deleteContact(
    userId: string,
    contactId: string
  ): Promise<{ success: true; message: string }> {
    await this.verifyUserStanding(userId)
    const deleted = await this.emergencyRepo.deleteContact(userId, contactId)
    if (!deleted) {
      throw new EmergencyContactServiceError(
        "Emergency contact not found.",
        404,
        { code: "CONTACT_NOT_FOUND" }
      )
    }
    return {
      success: true,
      message: "Emergency contact deleted successfully",
    }
  }
}

export const emergencyContactService = new EmergencyContactService()
