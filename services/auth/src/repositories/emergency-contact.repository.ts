import { eq, and, desc, ne, sql } from "drizzle-orm"
import { db } from "../index.js"
import {
  userEmergencyContacts,
  type UserEmergencyContact,
} from "../db/auth.schema.js"
import type {
  CreateEmergencyContactInput,
  UpdateEmergencyContactInput,
} from "../db/auth.validator.js"

export class EmergencyContactRepository {
  private client: typeof db

  constructor(client: typeof db = db) {
    this.client = client
  }

  async checkConnection(): Promise<boolean> {
    if (!this.client) {
      throw new Error("Database connection failed: Database client is not initialized")
    }
    await this.client.execute(sql`SELECT 1`)
    return true
  }

  /**
   * Sets isPrimary = false for any existing primary contacts belonging to this user.
   */
  async demotePrimaryContacts(userId: string, exceptContactId?: string): Promise<void> {
    const conditions = [
      eq(userEmergencyContacts.userId, userId),
      eq(userEmergencyContacts.isPrimary, true),
    ]

    if (exceptContactId) {
      conditions.push(ne(userEmergencyContacts.id, exceptContactId))
    }

    await this.client
      .update(userEmergencyContacts)
      .set({ isPrimary: false, updatedAt: new Date() })
      .where(and(...conditions))
  }

  /**
   * Creates an emergency contact for the specified user.
   * If isPrimary is true, demotes any existing primary contacts first.
   */
  async createContact(
    userId: string,
    input: CreateEmergencyContactInput
  ): Promise<UserEmergencyContact> {
    const isPrimary = input.isPrimary ?? true

    if (isPrimary) {
      await this.demotePrimaryContacts(userId)
    }

    const [created] = await this.client
      .insert(userEmergencyContacts)
      .values({
        userId,
        contactName: input.contactName.trim(),
        contactPhone: input.contactPhone.trim(),
        relationship: input.relationship?.trim() || null,
        isPrimary,
      })
      .returning()

    return created
  }

  /**
   * Retrieves all emergency contacts for a given user, ordered by primary first, then newest.
   */
  async findContactsByUserId(userId: string): Promise<UserEmergencyContact[]> {
    return this.client
      .select()
      .from(userEmergencyContacts)
      .where(eq(userEmergencyContacts.userId, userId))
      .orderBy(
        desc(userEmergencyContacts.isPrimary),
        desc(userEmergencyContacts.createdAt)
      )
  }

  /**
   * Finds a single emergency contact strictly bound to the authenticated user ID.
   */
  async findContactById(
    userId: string,
    contactId: string
  ): Promise<UserEmergencyContact | null> {
    const result = await this.client
      .select()
      .from(userEmergencyContacts)
      .where(
        and(
          eq(userEmergencyContacts.userId, userId),
          eq(userEmergencyContacts.id, contactId)
        )
      )
      .limit(1)

    return result[0] || null
  }

  /**
   * Updates an existing contact strictly bound to the authenticated user ID.
   * If isPrimary is set to true, demotes other contacts for this user first.
   */
  async updateContact(
    userId: string,
    contactId: string,
    input: UpdateEmergencyContactInput
  ): Promise<UserEmergencyContact | null> {
    const existing = await this.findContactById(userId, contactId)
    if (!existing) {
      return null
    }

    if (input.isPrimary === true) {
      await this.demotePrimaryContacts(userId, contactId)
    }

    const updatePayload: Record<string, any> = {
      updatedAt: new Date(),
    }

    if (input.contactName !== undefined) {
      updatePayload.contactName = input.contactName.trim()
    }
    if (input.contactPhone !== undefined) {
      updatePayload.contactPhone = input.contactPhone.trim()
    }
    if (input.relationship !== undefined) {
      updatePayload.relationship = input.relationship ? input.relationship.trim() : null
    }
    if (input.isPrimary !== undefined) {
      updatePayload.isPrimary = input.isPrimary
    }

    const [updated] = await this.client
      .update(userEmergencyContacts)
      .set(updatePayload)
      .where(
        and(
          eq(userEmergencyContacts.userId, userId),
          eq(userEmergencyContacts.id, contactId)
        )
      )
      .returning()

    return updated || null
  }

  /**
   * Deletes an emergency contact strictly bound to the authenticated user ID.
   */
  async deleteContact(userId: string, contactId: string): Promise<boolean> {
    const deleted = await this.client
      .delete(userEmergencyContacts)
      .where(
        and(
          eq(userEmergencyContacts.userId, userId),
          eq(userEmergencyContacts.id, contactId)
        )
      )
      .returning()

    return deleted.length > 0
  }
}

export const emergencyContactRepository = new EmergencyContactRepository()
