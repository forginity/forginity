import { eq, and, or, ilike, desc, sql } from "drizzle-orm"
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
        userType: input.userType || "user",
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

  async findUsersWithPagination(options: {
    search?: string
    status?: string
    userType?: string
    authProvider?: string
    limit: number
    offset: number
  }): Promise<User[]> {
    const conditions = []

    if (options.status) {
      conditions.push(eq(users.status, options.status))
    }
    if (options.userType) {
      conditions.push(eq(users.userType, options.userType))
    }
    if (options.authProvider) {
      conditions.push(eq(users.authProvider, options.authProvider))
    }
    if (options.search) {
      const searchPattern = `%${options.search.toLowerCase()}%`
      conditions.push(
        or(
          ilike(users.email, searchPattern),
          ilike(users.name, searchPattern),
          ilike(users.firstName, searchPattern),
          ilike(users.lastName, searchPattern)
        )
      )
    }

    const query = this.client.select().from(users)

    if (conditions.length > 0) {
      query.where(and(...conditions))
    }

    return query
      .orderBy(desc(users.createdAt))
      .limit(options.limit)
      .offset(options.offset)
  }

  async countUsers(options: {
    search?: string
    status?: string
    userType?: string
    authProvider?: string
  }): Promise<number> {
    const conditions = []

    if (options.status) {
      conditions.push(eq(users.status, options.status))
    }
    if (options.userType) {
      conditions.push(eq(users.userType, options.userType))
    }
    if (options.authProvider) {
      conditions.push(eq(users.authProvider, options.authProvider))
    }
    if (options.search) {
      const searchPattern = `%${options.search.toLowerCase()}%`
      conditions.push(
        or(
          ilike(users.email, searchPattern),
          ilike(users.name, searchPattern),
          ilike(users.firstName, searchPattern),
          ilike(users.lastName, searchPattern)
        )
      )
    }

    const [result] = await this.client
      .select({ count: sql<number>`cast(count(*) as integer)` })
      .from(users)
      .where(conditions.length > 0 ? and(...conditions) : undefined)

    return result?.count ?? 0
  }

  async updateUserStatusById(
    userId: string,
    status: string
  ): Promise<User | null> {
    const [updated] = await this.client
      .update(users)
      .set({
        status,
        updatedAt: new Date(),
      })
      .where(eq(users.id, userId))
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
