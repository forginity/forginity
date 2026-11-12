import { eq, sql } from "drizzle-orm"
import { db } from "../index.js"
import { users, type User } from "../db/auth.schema.js"
import type { CreateUserInput, UpdateUserInput } from "../types/auth.types.js"

export class UserRepository {
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

  async findUserById(id: string): Promise<User | null> {
    const result = await this.client
      .select()
      .from(users)
      .where(eq(users.id, id))
      .limit(1)

    return result[0] || null
  }

  async findUserByEmail(email: string): Promise<User | null> {
    const normalized = email.toLowerCase().trim()
    const result = await this.client
      .select()
      .from(users)
      .where(eq(users.email, normalized))
      .limit(1)

    return result[0] || null
  }

  async findUserByGoogleId(googleId: string): Promise<User | null> {
    const result = await this.client
      .select()
      .from(users)
      .where(eq(users.googleId, googleId))
      .limit(1)

    return result[0] || null
  }

  async createUser(input: CreateUserInput): Promise<User> {
    const normalizedEmail = input.email.toLowerCase().trim()

    const [created] = await this.client
      .insert(users)
      .values({
        email: normalizedEmail,
        name: input.name,
        authProvider: input.authProvider || "email_otp",
        googleId: input.googleId,
        avatarUrl: input.avatarUrl,
        isVerified: input.isVerified ?? false,
        isEmailVerified: input.isEmailVerified ?? false,
        isPhoneVerified: input.isPhoneVerified ?? false,
        isOnboarded: input.isOnboarded ?? false,
        status: input.status || "active",
        firstName: input.firstName,
        lastName: input.lastName,
        gender: input.gender,
        country: input.country,
      })
      .returning()

    return created
  }

  async updateUser(id: string, input: UpdateUserInput): Promise<User | null> {
    const [updated] = await this.client
      .update(users)
      .set({
        ...input,
        updatedAt: new Date(),
      })
      .where(eq(users.id, id))
      .returning()

    return updated || null
  }

  async deleteUserById(id: string): Promise<boolean> {
    const deleted = await this.client
      .delete(users)
      .where(eq(users.id, id))
      .returning()

    return deleted.length > 0
  }
}

export const userRepository = new UserRepository()
