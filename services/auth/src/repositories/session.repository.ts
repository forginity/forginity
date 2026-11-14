import { eq, desc, sql } from "drizzle-orm"
import { db } from "../index.js"
import { sessions, type Session } from "../db/auth.schema.js"
import type { CreateSessionRecordInput } from "../types/auth.types.js"

export class SessionRepository {
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

  async createSession(input: CreateSessionRecordInput): Promise<Session> {
    const [created] = await this.client
      .insert(sessions)
      .values({
        userId: input.userId,
        sessionTokenHash: input.sessionTokenHash,
        expiresAt: input.expiresAt,
        currentProductId: input.currentProductId,
        currentSection: input.currentSection,
        ipAddress: input.ipAddress,
        userAgent: input.userAgent,
        deviceType: input.deviceType,
      })
      .returning()

    return created
  }

  async findSessionById(id: string): Promise<Session | null> {
    const result = await this.client
      .select()
      .from(sessions)
      .where(eq(sessions.id, id))
      .limit(1)

    return result[0] || null
  }

  async findSessionByTokenHash(tokenHash: string): Promise<Session | null> {
    const result = await this.client
      .select()
      .from(sessions)
      .where(eq(sessions.sessionTokenHash, tokenHash))
      .limit(1)

    return result[0] || null
  }

  async findSessionsByUserId(userId: string): Promise<Session[]> {
    return this.client
      .select()
      .from(sessions)
      .where(eq(sessions.userId, userId))
      .orderBy(desc(sessions.lastActiveAt))
  }

  async updateSession(
    id: string,
    input: Partial<Omit<Session, "id" | "userId" | "createdAt">>
  ): Promise<Session | null> {
    const [updated] = await this.client
      .update(sessions)
      .set({
        ...input,
        lastActiveAt: input.lastActiveAt ?? new Date(),
      })
      .where(eq(sessions.id, id))
      .returning()

    return updated || null
  }

  async updateLastActive(id: string): Promise<void> {
    await this.client
      .update(sessions)
      .set({
        lastActiveAt: new Date(),
      })
      .where(eq(sessions.id, id))
  }

  async deleteSession(id: string): Promise<boolean> {
    const deleted = await this.client
      .delete(sessions)
      .where(eq(sessions.id, id))
      .returning()

    return deleted.length > 0
  }

  async deleteSessionsByUserId(userId: string): Promise<number> {
    const deleted = await this.client
      .delete(sessions)
      .where(eq(sessions.userId, userId))
      .returning()

    return deleted.length
  }
}

export const sessionRepository = new SessionRepository()
