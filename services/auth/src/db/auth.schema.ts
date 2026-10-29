import { defineRelations } from "drizzle-orm"
import {
  pgTable,
  uuid,
  varchar,
  text,
  boolean,
  integer,
  timestamp,
  index,
  uniqueIndex,
} from "drizzle-orm/pg-core"

/**
 * 1. Users Table
 * Central user account registry supporting multi-channel authentication,
 * passwordless onboarding, and account lifecycle state.
 */
export const users = pgTable(
  "users",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    email: varchar("email", { length: 255 }),
    phone: varchar("phone", { length: 50 }),
    passwordHash: text("password_hash"),
    firstName: varchar("first_name", { length: 100 }),
    lastName: varchar("last_name", { length: 100 }),
    gender: varchar("gender", { length: 30 }), // 'male', 'female', 'other', 'prefer_not_to_say'
    country: varchar("country", { length: 2 }), // ISO 3166-1 alpha-2 uppercase e.g. 'IN', 'US'
    avatarUrl: text("avatar_url"),
    googleId: varchar("google_id", { length: 255 }),
    authProvider: varchar("auth_provider", { length: 50 }).notNull().default("email_otp"), // 'email_otp', 'phone_otp', 'google'
    isVerified: boolean("is_verified").notNull().default(false),
    isOnboarded: boolean("is_onboarded").notNull().default(false),
    status: varchar("status", { length: 50 }).notNull().default("active"), // 'active', 'blocked', 'deleted'
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    uniqueIndex("users_email_idx").on(table.email),
    uniqueIndex("users_phone_idx").on(table.phone),
    uniqueIndex("users_google_id_idx").on(table.googleId),
    index("users_status_idx").on(table.status),
    index("users_auth_provider_idx").on(table.authProvider),
  ]
)

/**
 * 2. OTPs Table
 * Ephemeral one-time passwords for passwordless email/phone verification.
 */
export const otps = pgTable(
  "otps",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    identifier: varchar("identifier", { length: 255 }).notNull(),
    identifierType: varchar("identifier_type", { length: 20 }).notNull(), // 'email', 'phone'
    otpHash: text("otp_hash").notNull(),
    purpose: varchar("purpose", { length: 50 }).notNull().default("sign_in"), // 'sign_up', 'sign_in', 'verify'
    attempts: integer("attempts").notNull().default(0),
    maxAttempts: integer("max_attempts").notNull().default(3),
    expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
    verifiedAt: timestamp("verified_at", { withTimezone: true }),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    index("otps_identifier_idx").on(table.identifier),
    index("otps_expires_at_idx").on(table.expiresAt),
  ]
)

/**
 * 3. Sessions Table
 * SSO user session tracking for token refresh, revocation, and device awareness.
 */
export const sessions = pgTable(
  "sessions",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    sessionTokenHash: text("session_token_hash").notNull(),
    currentProductId: uuid("current_product_id"),
    currentSection: varchar("current_section", { length: 100 }),
    ipAddress: varchar("ip_address", { length: 45 }),
    userAgent: text("user_agent"),
    deviceType: varchar("device_type", { length: 50 }), // 'mobile', 'desktop', 'tablet'
    expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
    lastActiveAt: timestamp("last_active_at", { withTimezone: true }).defaultNow().notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    uniqueIndex("sessions_token_hash_idx").on(table.sessionTokenHash),
    index("sessions_user_id_idx").on(table.userId),
    index("sessions_current_product_id_idx").on(table.currentProductId),
    index("sessions_expires_at_idx").on(table.expiresAt),
  ]
)

/**
 * 4. User Products Table
 * Tracks which products a user has accessed and their authorization standing.
 * Uses productId as logical reference to services/products catalog.
 */
export const userProducts = pgTable(
  "user_products",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    productId: uuid("product_id").notNull(),
    tier: varchar("tier", { length: 50 }).notNull().default("free"), // 'free', 'pro', 'enterprise'
    status: varchar("status", { length: 50 }).notNull().default("active"), // 'active', 'suspended', 'expired'
    firstUsedAt: timestamp("first_used_at", { withTimezone: true }).defaultNow().notNull(),
    lastUsedAt: timestamp("last_used_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    index("user_products_user_id_idx").on(table.userId),
    index("user_products_product_id_idx").on(table.productId),
    uniqueIndex("user_product_user_product_idx").on(table.userId, table.productId),
  ]
)

/**
 * 5. User Emergency Contacts Table
 * Shared emergency contact registry accessible across products (e.g. TrackRide).
 */
export const userEmergencyContacts = pgTable(
  "user_emergency_contacts",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    contactName: varchar("contact_name", { length: 255 }).notNull(),
    contactPhone: varchar("contact_phone", { length: 50 }).notNull(),
    relationship: varchar("relationship", { length: 50 }),
    isPrimary: boolean("is_primary").notNull().default(true),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    index("user_emergency_contacts_user_id_idx").on(table.userId),
  ]
)

/**
 * Schema Relations
 */
export const schemaRelations = defineRelations(
  {
    users,
    sessions,
    userProducts,
    userEmergencyContacts,
  },
  (r) => ({
    users: {
      sessions: r.many.sessions({
        from: r.users.id,
        to: r.sessions.userId,
      }),
      products: r.many.userProducts({
        from: r.users.id,
        to: r.userProducts.userId,
      }),
      emergencyContacts: r.many.userEmergencyContacts({
        from: r.users.id,
        to: r.userEmergencyContacts.userId,
      }),
    },
    sessions: {
      user: r.one.users({
        from: r.sessions.userId,
        to: r.users.id,
      }),
    },
    userProducts: {
      user: r.one.users({
        from: r.userProducts.userId,
        to: r.users.id,
      }),
    },
    userEmergencyContacts: {
      user: r.one.users({
        from: r.userEmergencyContacts.userId,
        to: r.users.id,
      }),
    },
  })
)

// Inferred TypeScript Types
export type User = typeof users.$inferSelect
export type NewUser = typeof users.$inferInsert

export type Otp = typeof otps.$inferSelect
export type NewOtp = typeof otps.$inferInsert

export type Session = typeof sessions.$inferSelect
export type NewSession = typeof sessions.$inferInsert

export type UserProduct = typeof userProducts.$inferSelect
export type NewUserProduct = typeof userProducts.$inferInsert

export type UserEmergencyContact = typeof userEmergencyContacts.$inferSelect
export type NewUserEmergencyContact = typeof userEmergencyContacts.$inferInsert
