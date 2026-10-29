# SERVICE SPECIFICATION: SERVICE_AUTH

## 1. EXECUTIVE SUMMARY

- **Service Name:** `services/auth`
- **Domain:** Centralized Single Sign-On (SSO), Identity, and User Accounts
- **Architectural Reference:** [`services/products`](file:///home/vikas/Documents/forginity/services/products)
- **Task List:** [`./TASK_LIST.md`](./TASK_LIST.md)
- **Implementation Record:** [`./IMPLEMENTATIONS_RECORD.md`](./IMPLEMENTATIONS_RECORD.md)

### Purpose
`services/auth` provides the shared identity foundation for the Forginity monorepo ecosystem. It eliminates redundant authentication systems across individual apps by offering a centralized identity provider. Users register once and gain access to TrackRide, Custom Apparel, HR tools, and future platform applications.

### Consumers
- **Frontend Applications:** `apps/shell` (Host container), `apps/admin` (Portal), and `apps/project-1` (TrackRide).
- **Backend Microservices:** `services/products`, `services/payment-api`, and `services/notification-api`. Downstream services verify access tokens locally without querying `auth_db`.

---

## 2. AUTHENTICATION & ONBOARDING WORKFLOWS

### Ingress Channels

Every user accesses the platform through one of three passwordless or social authentication channels:

1. **Email + OTP.**
   - User submits email. The service generates a 6-digit cryptographic OTP, hashes it using `argon2id`, and stores it in Redis with a 5-minute TTL.
   - User receives OTP via email and submits it for verification.
   - If the account is new or uncompleted, the system issues an `onboarding_token` and routes the user to the onboarding screen. If already onboarded, the system issues full session tokens.

2. **Phone Number + OTP.**
   - User submits an E.164 formatted phone number.
   - The service dispatches a 6-digit OTP via SMS and stores the hashed OTP in Redis.
   - Submitting the valid OTP resolves the user. New accounts transition to onboarding. Existing accounts receive session tokens.

3. **Google OAuth 2.0 / OIDC.**
   - User authenticates through Google Identity Services. The client submits the Google ID Token to `POST /api/v1/auth/google`.
   - The service verifies the token signature against Google public keys. It extracts `google_id`, `email`, and avatar.
   - New Google users transition to onboarding with their first name, last name, and avatar prefilled from Google profile data.

---

### Dedicated Onboarding Flow

All three ingress channels converge on a mandatory onboarding process for first-time users:

- **Gate:** Protected by a restricted `onboarding_token` (JWT with `scope: "onboarding"`). The user cannot access protected service APIs or application views until this step completes.
- **Endpoint:** `POST /api/v1/auth/onboarding`
- **Collected Fields:**
  - `firstName` (String, required, 1 to 100 characters)
  - `lastName` (String, required, 1 to 100 characters)
  - `gender` (Enum: `male`, `female`, `other`, `prefer_not_to_say`)
  - `country` (String, required, 2-letter uppercase ISO 3166-1 alpha-2 code, e.g. `IN`, `US`)
- **Promotion:** Onboarding writes these profile fields to `auth_db.users`, sets `is_onboarded = true`, creates a persistent session, and returns the full access token and HTTP-only refresh cookie.

---

## 3. USER LIFECYCLE MANAGEMENT

- **Edit Profile (`PUT /api/v1/users/me`):** Authenticated users can modify their name, avatar, gender, and country.
- **Delete Account (`DELETE /api/v1/users/me`):** Users can delete their account. The service marks the account soft-deleted or purges records, while invalidating all active sessions across devices immediately.
- **Block / Suspend User (`POST /api/v1/users/:id/block`, `/unblock`):** Administrators can suspend user accounts. The service invalidates all Redis sessions for that user instantly and rejects any future OTP or token verification attempts.

---

## 4. SESSION & TOKEN ARCHITECTURE

- **Hybrid Dual-Token Standard:**
  - **Access Token:** Short-lived (15 minutes) signed JWT. Encodes user ID (`sub`), email, active product (`current_product_id`), and product roles. Microservices verify this token statelessly.
  - **Refresh Session:** Long-lived (30 days) opaque UUID stored in a secure, HTTP-only cookie. Persisted in `auth_db.sessions` and cached in Redis.
- **Cross-Product Context Switching:** When a user switches apps in `apps/shell`, the client requests `/api/v1/auth/switch-product`. The service updates `sessions.current_product_id` and mints a new access token scoped to the destination application.
- **Password Hashing:** `argon2id` (RFC 9106) configured with 64 MiB memory cost, 3 iterations, and 4 parallel threads.

---

## 5. DATABASE ARCHITECTURE (`auth_db`)

The service owns the `auth_db` database using PostgreSQL 18 and Drizzle ORM:

- **`users`:** Stores account credentials, provider links, verification flags, and onboarding profiles:
  - `id` (UUID PK), `email` (VARCHAR, Unique, Nullable), `phone` (VARCHAR, Unique, Nullable), `first_name`, `last_name`, `gender`, `country`, `avatar_url`, `google_id` (Unique, Nullable), `auth_provider`, `is_verified` (Boolean), `is_onboarded` (Boolean), `status` (`active`, `blocked`, `deleted`), `created_at`, `updated_at`.
- **`otps`:** Ephemeral OTP tracking (backed primarily by Redis with database fallback for audit logs).
- **`sessions`:** Active SSO session tracking linking users to device metadata, expiration dates, and `current_product_id`.
- **`user_products`:** Junction table tracking which products a user has accessed and their authorization tier.
- **`user_emergency_contacts`:** Shared emergency contact registry accessible across products like TrackRide.

---

## 6. API CONTRACT OVERVIEW

| Method | Endpoint | Purpose | Access Control |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/v1/auth/otp/send` | Request 6-digit OTP to Email or Phone | Public (Rate-limited) |
| `POST` | `/api/v1/auth/otp/verify` | Verify OTP; returns session or onboarding token | Public |
| `POST` | `/api/v1/auth/google` | Exchange Google ID token for session or onboarding token | Public |
| `POST` | `/api/v1/auth/onboarding` | Submit first name, last name, gender, country | `requireOnboardingToken` |
| `POST` | `/api/v1/auth/refresh` | Rotate access token using HTTP-only cookie | Public (Session Cookie) |
| `POST` | `/api/v1/auth/switch-product` | Switch active product scope (e.g. to TrackRide) | `requireAuth` |
| `POST` | `/api/v1/auth/logout` | Revoke active session in Redis and database | `requireAuth` |
| `GET` | `/api/v1/users/me` | Fetch active user profile | `requireAuth` |
| `PUT` | `/api/v1/users/me` | Update name, avatar, gender, or country | `requireAuth` |
| `DELETE` | `/api/v1/users/me` | Soft-delete user account and clear sessions | `requireAuth` |
| `POST` | `/api/v1/users/:id/block` | Block user account and kill active sessions | Admin Guard |
| `POST` | `/api/v1/users/:id/unblock` | Restore suspended user account | Admin Guard |

---

## 7. EXECUTION ROADMAP

Refer to [`./TASK_LIST.md`](./TASK_LIST.md) for the sequential 8-step engineering plan. Each task is defined with a dedicated implementation guide and colocated test suites. Progress is recorded in [`./IMPLEMENTATIONS_RECORD.md`](./IMPLEMENTATIONS_RECORD.md).
