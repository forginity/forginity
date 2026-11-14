import { eq, and, desc, sql } from "drizzle-orm"
import { db } from "../index.js"
import { otps } from "../db/auth.schema.js"
import type { CreateOtpRecordInput, OtpRecord } from "../types/otp.types.js"

export class OtpRepository {
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

  async createOtp(input: CreateOtpRecordInput) {
    const [created] = await this.client
      .insert(otps)
      .values({
        identifier: input.identifier.toLowerCase().trim(),
        identifierType: input.identifierType,
        otpHash: input.otpHash,
        purpose: input.purpose,
        expiresAt: input.expiresAt,
        maxAttempts: input.maxAttempts ?? 3,
        attempts: 0,
      })
      .returning()

    return created
  }

  async findOtpById(requestId: string) {
    const result = await this.client
      .select()
      .from(otps)
      .where(eq(otps.id, requestId))
      .limit(1)

    return result[0] || null
  }

  async findLatestActiveOtpByIdentifier(identifier: string, purpose: string) {
    const normalized = identifier.toLowerCase().trim()
    const result = await this.client
      .select()
      .from(otps)
      .where(
        and(
          eq(otps.identifier, normalized),
          eq(otps.purpose, purpose)
        )
      )
      .orderBy(desc(otps.createdAt))
      .limit(1)

    return result[0] || null
  }

  async incrementOtpAttempts(requestId: string) {
    const [updated] = await this.client
      .update(otps)
      .set({
        attempts: sql`${otps.attempts} + 1`,
      })
      .where(eq(otps.id, requestId))
      .returning()

    return updated || null
  }

  async markOtpVerified(requestId: string) {
    const [updated] = await this.client
      .update(otps)
      .set({
        verifiedAt: new Date(),
      })
      .where(and(eq(otps.id, requestId), sql`${otps.verifiedAt} IS NULL`))
      .returning()

    return updated || null
  }

  async countRecentOtpsByIdentifier(identifier: string, since: Date): Promise<number> {
    const normalized = identifier.toLowerCase().trim()
    const result = await this.client
      .select({ count: sql<number>`count(*)` })
      .from(otps)
      .where(
        and(
          eq(otps.identifier, normalized),
          sql`${otps.createdAt} >= ${since}`
        )
      )

    return Number(result[0]?.count || 0)
  }

  async deleteOtpById(requestId: string) {
    const [deleted] = await this.client
      .delete(otps)
      .where(eq(otps.id, requestId))
      .returning()

    return deleted || null
  }
}

export const otpRepository = new OtpRepository()
