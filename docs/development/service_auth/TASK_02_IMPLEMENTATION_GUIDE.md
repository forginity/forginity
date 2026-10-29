# TASK IMPLEMENTATION GUIDE: TASK-02 - Build Database Schemas and Migrations

- **Service:** `services/auth`
- **Status:** `IN_PROGRESS`
- **Task List:** [`./TASK_LIST.md`](./TASK_LIST.md)
- **Record:** [`./IMPLEMENTATIONS_RECORD.md`](./IMPLEMENTATIONS_RECORD.md)

---

## 1. SUMMARY & GOAL

Define and build the production-grade PostgreSQL database schema for `services/auth` (`auth_db`) using Drizzle ORM and Zod validators. This schema models the complete Single Sign-On (SSO) identity foundation: multi-channel user accounts (Email OTP, Phone OTP, Google OAuth), onboarding profiles, ephemeral OTP authentication tracking, multi-device SSO sessions, product authorizations, and cross-product emergency contacts.

---

## 2. SCOPE OF CHANGES

- **Files to Create:**
  - `services/auth/src/db/auth.schema.ts` (Full Drizzle ORM table definitions, relations, and indexes)
  - `services/auth/src/db/auth.validator.ts` (Authoritative Zod schemas and derived domain types)
  - `services/auth/src/db/auth.schema.test.ts` (Unit tests verifying schemas, constraints, and validation)
- **Files to Modify:**
  - `services/auth/src/index.ts` (Export schema tables, relations, and Zod validator types)
  - `docs/development/service_auth/TASK_LIST.md` (Update status to COMPLETED once verified)
  - `docs/development/service_auth/IMPLEMENTATIONS_RECORD.md` (Log completed task and verification date)

---

## 3. PROPOSED DATABASE TABLES & FIELD DEFINITIONS

The following 5 tables comprise the `auth_db` domain schema:

### 3.1 Table: `users`
Central user account registry supporting multi-channel authentication, passwordless onboarding, and account lifecycle state.

| Column Name | SQL Data Type | Drizzle Representation | Nullable | Default Value | Constraints & Indexes | Description |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| `id` | `UUID` | `uuid("id").primaryKey().defaultRandom()` | **No** | `gen_random_uuid()` | Primary Key | Unique internal user identifier. |
| `email` | `VARCHAR(255)` | `varchar("email", { length: 255 })` | Yes | `NULL` | Unique Index (`users_email_idx`) | User email address. Nullable for phone-only signups. |
| `phone` | `VARCHAR(50)` | `varchar("phone", { length: 50 })` | Yes | `NULL` | Unique Index (`users_phone_idx`) | E.164 formatted phone number. Nullable for email-only/Google signups. |
| `password_hash` | `TEXT` | `text("password_hash")` | Yes | `NULL` | None | PHC-formatted argon2id hash. Nullable for passwordless/OAuth users. |
| `first_name` | `VARCHAR(100)` | `varchar("first_name", { length: 100 })` | Yes | `NULL` | None | First name collected during mandatory onboarding. |
| `last_name` | `VARCHAR(100)` | `varchar("last_name", { length: 100 })` | Yes | `NULL` | None | Last name collected during mandatory onboarding. |
| `gender` | `VARCHAR(30)` | `varchar("gender", { length: 30 })` | Yes | `NULL` | Enum: `male`, `female`, `other`, `prefer_not_to_say` | Gender identity collected during onboarding. |
| `country` | `VARCHAR(2)` | `varchar("country", { length: 2 })` | Yes | `NULL` | 2-letter uppercase ISO 3166-1 alpha-2 | Country code (e.g. `IN`, `US`, `DE`). |
| `avatar_url` | `TEXT` | `text("avatar_url")` | Yes | `NULL` | None | URL to user profile image or Google avatar. |
| `google_id` | `VARCHAR(255)` | `varchar("google_id", { length: 255 })` | Yes | `NULL` | Unique Index (`users_google_id_idx`) | Subject identifier from Google OAuth 2.0 / OIDC. |
| `auth_provider` | `VARCHAR(50)` | `varchar("auth_provider", { length: 50 })` | **No** | `'email_otp'` | Index | Primary ingress provider: `email_otp`, `phone_otp`, `google`. |
| `is_verified` | `BOOLEAN` | `boolean("is_verified")` | **No** | `false` | None | Set to `true` once email or phone OTP is verified. |
| `is_onboarded` | `BOOLEAN` | `boolean("is_onboarded")` | **No** | `false` | None | Set to `true` when first name, last name, gender, and country are set. |
| `status` | `VARCHAR(50)` | `varchar("status", { length: 50 })` | **No** | `'active'` | Index (`users_status_idx`) | Account status: `active`, `blocked`, `deleted`. |
| `created_at` | `TIMESTAMPTZ` | `timestamp("created_at", { withTimezone: true })` | **No** | `NOW()` | None | Record creation timestamp. |
| `updated_at` | `TIMESTAMPTZ` | `timestamp("updated_at", { withTimezone: true })` | **No** | `NOW()` | `$onUpdate` hook | Last update timestamp. |

---

### 3.2 Table: `otps`
Ephemeral one-time password records for email and SMS passwordless verification with rate limiting and attempt caps.

| Column Name | SQL Data Type | Drizzle Representation | Nullable | Default Value | Constraints & Indexes | Description |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| `id` | `UUID` | `uuid("id").primaryKey().defaultRandom()` | **No** | `gen_random_uuid()` | Primary Key | Unique OTP transaction identifier. |
| `identifier` | `VARCHAR(255)` | `varchar("identifier", { length: 255 })` | **No** | None | Index (`otps_identifier_idx`) | Target email or phone number. |
| `identifier_type` | `VARCHAR(20)` | `varchar("identifier_type", { length: 20 })` | **No** | None | Enum: `email`, `phone` | Channel type used for OTP delivery. |
| `otp_hash` | `TEXT` | `text("otp_hash")` | **No** | None | Argon2id hash | Secure hash of the 6-digit cryptographic OTP. |
| `purpose` | `VARCHAR(50)` | `varchar("purpose", { length: 50 })` | **No** | `'sign_in'` | Enum: `sign_up`, `sign_in`, `verify` | Security workflow purpose. |
| `attempts` | `INTEGER` | `integer("attempts")` | **No** | `0` | None | Counter tracking consecutive failed attempts. |
| `max_attempts` | `INTEGER` | `integer("max_attempts")` | **No** | `3` | None | Maximum allowed failed attempts before invalidation. |
| `expires_at` | `TIMESTAMPTZ` | `timestamp("expires_at", { withTimezone: true })` | **No** | None | Index (`otps_expires_at_idx`) | Expiration timestamp (typically 5 minutes from dispatch). |
| `verified_at` | `TIMESTAMPTZ` | `timestamp("verified_at", { withTimezone: true })` | Yes | `NULL` | None | Timestamp when successfully consumed; prevents replay attacks. |
| `created_at` | `TIMESTAMPTZ` | `timestamp("created_at", { withTimezone: true })` | **No** | `NOW()` | None | Dispatch timestamp. |

---

### 3.3 Table: `sessions`
Active SSO user session tracking supporting cross-product token refreshes, session revocation, and device awareness.

| Column Name | SQL Data Type | Drizzle Representation | Nullable | Default Value | Constraints & Indexes | Description |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| `id` | `UUID` | `uuid("id").primaryKey().defaultRandom()` | **No** | `gen_random_uuid()` | Primary Key | Session identifier encoded in refresh cookie. |
| `user_id` | `UUID` | `uuid("user_id")` | **No** | None | FK -> `users.id` ON DELETE CASCADE, Index | Owning user account. |
| `session_token_hash`| `TEXT` | `text("session_token_hash")` | **No** | None | Unique Index (`sessions_token_hash_idx`) | Cryptographic hash of opaque refresh token secret. |
| `current_product_id`| `UUID` | `uuid("current_product_id")` | Yes | `NULL` | Index | Active product context ID (e.g. TrackRide). |
| `current_section` | `VARCHAR(100)` | `varchar("current_section", { length: 100 })`| Yes | `NULL` | None | Navigation state e.g. `'active_navigation'`, `'checkout'`. |
| `ip_address` | `VARCHAR(45)` | `varchar("ip_address", { length: 45 })` | Yes | `NULL` | None | Client IP address (IPv4 or IPv6 string). |
| `user_agent` | `TEXT` | `text("user_agent")` | Yes | `NULL` | None | Client browser/mobile device User-Agent header. |
| `device_type` | `VARCHAR(50)` | `varchar("device_type", { length: 50 })` | Yes | `NULL` | Enum: `mobile`, `desktop`, `tablet` | Normalized client hardware classification. |
| `expires_at` | `TIMESTAMPTZ` | `timestamp("expires_at", { withTimezone: true })` | **No** | None | Index (`sessions_expires_at_idx`) | Expiration deadline (30 days from creation/refresh). |
| `last_active_at` | `TIMESTAMPTZ` | `timestamp("last_active_at", { withTimezone: true })` | **No** | `NOW()` | None | Last access time for sliding window analytics. |
| `created_at` | `TIMESTAMPTZ` | `timestamp("created_at", { withTimezone: true })` | **No** | `NOW()` | None | Initial authentication timestamp. |

---

### 3.4 Table: `user_products`
Junction table tracking products a user has accessed, authorization tiers, and subscription standing. Product UUID acts as the single source of truth referencing the products catalog.

| Column Name | SQL Data Type | Drizzle Representation | Nullable | Default Value | Constraints & Indexes | Description |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| `id` | `UUID` | `uuid("id").primaryKey().defaultRandom()` | **No** | `gen_random_uuid()` | Primary Key | Unique link identifier. |
| `user_id` | `UUID` | `uuid("user_id")` | **No** | None | FK -> `users.id` ON DELETE CASCADE | Target user account. |
| `product_id` | `UUID` | `uuid("product_id")` | **No** | None | Index (`user_products_product_idx`) | Forginity product identifier (source of truth). |
| `tier` | `VARCHAR(50)` | `varchar("tier", { length: 50 })` | **No** | `'free'` | Enum: `free`, `pro`, `enterprise` | Current user tier for this product. |
| `status` | `VARCHAR(50)` | `varchar("status", { length: 50 })` | **No** | `'active'` | Enum: `active`, `suspended`, `expired` | Membership standing. |
| `first_used_at` | `TIMESTAMPTZ` | `timestamp("first_used_at", { withTimezone: true })` | **No** | `NOW()` | None | Timestamp of first launch. |
| `last_used_at` | `TIMESTAMPTZ` | `timestamp("last_used_at", { withTimezone: true })` | **No** | `NOW()` | None | Timestamp of most recent product session. |

*Unique Composite Constraint:* `uniqueIndex("user_product_user_product_idx").on(table.userId, table.productId)` prevents duplicate user-to-product mapping rows.

---

### 3.5 Table: `user_emergency_contacts`
Shared cross-product emergency registry accessible across platforms (e.g. TrackRide crash detection & group ride alerts).

| Column Name | SQL Data Type | Drizzle Representation | Nullable | Default Value | Constraints & Indexes | Description |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| `id` | `UUID` | `uuid("id").primaryKey().defaultRandom()` | **No** | `gen_random_uuid()` | Primary Key | Contact entry identifier. |
| `user_id` | `UUID` | `uuid("user_id")` | **No** | None | FK -> `users.id` ON DELETE CASCADE, Index | Target user account. |
| `contact_name` | `VARCHAR(255)` | `varchar("contact_name", { length: 255 })` | **No** | None | None | Full name of the designated emergency contact. |
| `contact_phone` | `VARCHAR(50)` | `varchar("contact_phone", { length: 50 })` | **No** | None | None | E.164 phone number for emergency SMS / dispatch. |
| `relationship` | `VARCHAR(50)` | `varchar("relationship", { length: 50 })` | Yes | `NULL` | None | e.g. `'spouse'`, `'parent'`, `'sibling'`, `'friend'`. |
| `is_primary` | `BOOLEAN` | `boolean("is_primary")` | **No** | `true` | None | Designates top-priority emergency recipient. |
| `created_at` | `TIMESTAMPTZ` | `timestamp("created_at", { withTimezone: true })` | **No** | `NOW()` | None | Record creation timestamp. |
| `updated_at` | `TIMESTAMPTZ` | `timestamp("updated_at", { withTimezone: true })` | **No** | `NOW()` | `$onUpdate` hook | Last update timestamp. |

---

## 4. ENTITY RELATIONSHIPS & DRIZZLE RELATIONS

```text
users (1)
  │
  ├──────< sessions (M)                       [user_id]
  ├──────< user_products (M)                  [user_id]
  └──────< user_emergency_contacts (M)        [user_id]
```

### Drizzle `defineRelations` Architecture
```ts
export const usersRelations = defineRelations(users, ({ many }) => ({
  sessions: many(sessions),
  products: many(userProducts),
  emergencyContacts: many(userEmergencyContacts),
}))

export const sessionsRelations = defineRelations(sessions, ({ one }) => ({
  user: one(users, {
    fields: [sessions.userId],
    references: [users.id],
  }),
}))

export const userProductsRelations = defineRelations(userProducts, ({ one }) => ({
  user: one(users, {
    fields: [userProducts.userId],
    references: [users.id],
  }),
}))

export const userEmergencyContactsRelations = defineRelations(userEmergencyContacts, ({ one }) => ({
  user: one(users, {
    fields: [userEmergencyContacts.userId],
    references: [users.id],
  }),
}))
```

---

## 5. ZOD RUNTIME SCHEMAS & DERIVED TYPES (`auth.validator.ts`)

Type-First data contracts derived directly from schemas:
1. **`insertUserSchema`:** Validates user creation via email, phone, or Google ID.
2. **`onboardingProfileSchema`:** Strictly validates `firstName` (1-100 chars), `lastName` (1-100 chars), `gender` enum, and `country` (2-letter uppercase ISO code).
3. **`updateUserProfileSchema`:** Partial schema for profile modifications (`firstName`, `lastName`, `gender`, `country`, `avatarUrl`).
4. **`otpDispatchSchema`:** Validates email or E.164 phone number dispatch payloads.
5. **`otpVerifySchema`:** Validates 6-digit numeric OTP and recipient identifier.
6. **`insertSessionSchema`:** Validates session creation metadata.
7. **`insertEmergencyContactSchema`:** Validates emergency contact name, relationship, and E.164 phone number.

---

## 6. STEP-BY-STEP IMPLEMENTATION PLAN (POST-APPROVAL)

### Step 1: Implement Drizzle Schema
- **Target File:** `services/auth/src/db/auth.schema.ts`
- **Action:** Write all 5 table definitions, column types, composite unique indexes, foreign keys, and `defineRelations`.

### Step 2: Implement Zod Validators & TypeScript Types
- **Target File:** `services/auth/src/db/auth.validator.ts`
- **Action:** Implement runtime validation schemas and export inferred TypeScript types (`User`, `NewUser`, `Session`, etc.).

### Step 3: Connect Schema in Service Bootstrap
- **Target File:** `services/auth/src/index.ts`
- **Action:** Export schema and validator definitions from package root.

### Step 4: Generate Migration Files
- **Target Directory:** `services/auth/drizzle/`
- **Command:** `pnpm --filter @services/auth db:generate`

### Step 5: Test Schema Definitions and Validation
- **Target File:** `services/auth/src/db/auth.schema.test.ts`
- **Action:** Automated unit tests covering valid payloads, constraint edge cases, invalid phone formats, enum rejections, and type inferencing.

---

## 7. VERIFICATION & TESTS

Execute verification commands:
```bash
pnpm --filter @services/auth typecheck
pnpm --filter @services/auth lint
pnpm --filter @services/auth test
```

Test scenarios to cover:
- **Happy Path:** Valid user, session, and OTP schema objects pass Zod validation and match Drizzle inferred types.
- **Onboarding Validation:** Rejects invalid gender values, lower-case country codes, or missing first/last names.
- **OTP Validation:** Rejects non-6-digit OTPs and non-E.164 phone formats.
- **Emergency Contact Validation:** Rejects blank contact names and invalid phone numbers.

---

## 8. SECURITY & GUARDRAILS

- [x] **No `.env` touched.** Secrets read strictly from `process.env`.
- [x] **Input validation.** All external inputs validated through strict Zod schemas before touching database layers.
- [x] **Password/Token hashing.** Argon2id hashing enforced for password storage, OTPs, and refresh session token hashes.
- [x] **SQL injection defense.** All queries constructed using Drizzle ORM parameterized builders.
- [x] **Cascading cleanup.** All child records (`sessions`, `user_products`, `user_emergency_contacts`) enforce `onDelete: "cascade"` to prevent orphaned data upon user deletion.
