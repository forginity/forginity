# TASK LIST: SERVICE_AUTH

## 1. SERVICE DETAILS

- **Service Name:** `services/auth`
- **Domain:** Centralized Single Sign-On (SSO), Identity, and User Accounts
- **Purpose:** Provides unified authentication, social sign-in, onboarding, and user management across Forginity products. Issues scoped session JWTs and manages user profiles.
- **Key Features & Flows:**
  - Passwordless Sign-up & Sign-in via Email + OTP.
  - Passwordless Sign-up & Sign-in via Phone Number + OTP.
  - Social Sign-up & Sign-in via Google OAuth 2.0 / OIDC.
  - Unified Onboarding collecting First Name, Last Name, Gender, and Country.
  - User lifecycle management: Edit Profile, Delete User (soft delete), Block / Unblock User.
  - Hybrid Sessions: 15-minute scoped JWT access tokens with 30-day refresh sessions stored in `auth_db.sessions` and Redis.
- **Tech Stack:** Express, TypeScript, PostgreSQL 18, Drizzle ORM, Zod, Redis 7, `argon2id`, Vitest, Supertest.
- **Reference Service:** [`services/products`](file:///home/vikas/Documents/forginity/services/products)
- **Service Specification:** [`./README.md`](./README.md)
- **Implementation Record:** [`./IMPLEMENTATIONS_RECORD.md`](file:///home/vikas/Documents/forginity/docs/development/service_auth/IMPLEMENTATIONS_RECORD.md)

---

## 2. PROGRESSIVE TASK MATRIX

| Task ID | Task Title | Key Deliverable | Guide File | Status |
| :--- | :--- | :--- | :--- | :--- |
| `TASK-01` | Scaffold `services/auth` package and configs | Base Express app, tsconfig, drizzle config | [`TASK_01_IMPLEMENTATION_GUIDE.md`](./TASK_01_IMPLEMENTATION_GUIDE.md) | `COMPLETED` |
| `TASK-02` | Build database schemas and migrations | `src/db/auth.schema.ts` and migrations | [`TASK_02_IMPLEMENTATION_GUIDE.md`](./TASK_02_IMPLEMENTATION_GUIDE.md) | `IN_PROGRESS` |
| `TASK-03` | Create Sign-up API (Email OTP, Phone OTP, Google) | Sign-up routes, OTP dispatch, unit & route tests | [`TASK_03_IMPLEMENTATION_GUIDE.md`](./TASK_03_IMPLEMENTATION_GUIDE.md) | `PENDING` |
| `TASK-04` | Create Sign-in API (Email OTP, Phone OTP, Google) | Sign-in routes, OTP verification, session tokens, tests | [`TASK_04_IMPLEMENTATION_GUIDE.md`](./TASK_04_IMPLEMENTATION_GUIDE.md) | `PENDING` |
| `TASK-05` | Basic Onboarding API | Onboarding validation, name/gender/country update, tests | [`TASK_05_IMPLEMENTATION_GUIDE.md`](./TASK_05_IMPLEMENTATION_GUIDE.md) | `PENDING` |
| `TASK-06` | Edit User Profile API | User update endpoint, authorization guards, tests | [`TASK_06_IMPLEMENTATION_GUIDE.md`](./TASK_06_IMPLEMENTATION_GUIDE.md) | `PENDING` |
| `TASK-07` | Delete User API | Account deletion / soft delete with session cleanup, tests | [`TASK_07_IMPLEMENTATION_GUIDE.md`](./TASK_07_IMPLEMENTATION_GUIDE.md) | `PENDING` |
| `TASK-08` | Block User API | Admin block / suspend / unblock endpoints, tests | [`TASK_08_IMPLEMENTATION_GUIDE.md`](./TASK_08_IMPLEMENTATION_GUIDE.md) | `PENDING` |

---

## 3. TASK LIST

### `TASK-01`: Scaffold `services/auth` package and configs
- **Description:** Initialize `services/auth` workspace package using `services/products` as an architectural reference.
  Configure `package.json`, `tsconfig.json`, `drizzle.config.ts`, Vitest, and bootstrap Express app scaffolding.
- **Guide:** [`TASK_01_IMPLEMENTATION_GUIDE.md`](./TASK_01_IMPLEMENTATION_GUIDE.md) (Covers scope, step-by-step code, test cases, and security gates.)

### `TASK-02`: Build database schemas and migrations
- **Description:** Implement Drizzle ORM schemas in `src/db/auth.schema.ts` for `users`, `otps`, `sessions`, `user_products`, and `user_emergency_contacts`.
  Generate SQL migration files and verify PostgreSQL schema constraints and index definitions.
- **Guide:** [`TASK_02_IMPLEMENTATION_GUIDE.md`](./TASK_02_IMPLEMENTATION_GUIDE.md) (Covers scope, step-by-step code, test cases, and security gates.)

### `TASK-03`: Create Sign-up API
- **Description:** Implement registration flow supporting Email OTP, Phone OTP, and Google OAuth with rate-limited OTP dispatch.
  Create pending user records in `auth_db.users` with `is_onboarded = false` and issue restricted onboarding tokens.
- **Guide:** [`TASK_03_IMPLEMENTATION_GUIDE.md`](./TASK_03_IMPLEMENTATION_GUIDE.md) (Covers scope, step-by-step code, test cases, and security gates.)

### `TASK-04`: Create Sign-in API
- **Description:** Implement authentication flow verifying Email OTP, Phone OTP, or Google OIDC tokens against existing user records.
  Issue 15-minute scoped JWT access tokens and 30-day refresh sessions stored in `auth_db.sessions` and Redis.
- **Guide:** [`TASK_04_IMPLEMENTATION_GUIDE.md`](./TASK_04_IMPLEMENTATION_GUIDE.md) (Covers scope, step-by-step code, test cases, and security gates.)

### `TASK-05`: Basic Onboarding API
- **Description:** Implement `/api/v1/auth/onboarding` endpoint guarded by onboarding token to capture first name, last name, gender, and country.
  Validate input with Zod, update profile, promote user to `is_onboarded = true`, and upgrade session to full access tokens.
- **Guide:** [`TASK_05_IMPLEMENTATION_GUIDE.md`](./TASK_05_IMPLEMENTATION_GUIDE.md) (Covers scope, step-by-step code, test cases, and security gates.)

### `TASK-06`: Edit User Profile API
- **Description:** Implement `/api/v1/users/me` update endpoint allowing authenticated users to modify editable profile details.
  Enforce Zod validation, authorization middleware, audit timestamps, and comprehensive unit and integration tests.
- **Guide:** [`TASK_06_IMPLEMENTATION_GUIDE.md`](./TASK_06_IMPLEMENTATION_GUIDE.md) (Covers scope, step-by-step code, test cases, and security gates.)

### `TASK-07`: Delete User API
- **Description:** Implement `/api/v1/users/me` account deletion endpoint supporting soft-deletion or irreversible GDPR purge.
  Revoke all active Redis and database sessions immediately and verify cascading record handling.
- **Guide:** [`TASK_07_IMPLEMENTATION_GUIDE.md`](./TASK_07_IMPLEMENTATION_GUIDE.md) (Covers scope, step-by-step code, test cases, and security gates.)

### `TASK-08`: Block User API
- **Description:** Implement administrative `/api/v1/users/:id/block` and `/unblock` endpoints with RBAC authorization guards.
  Update user account status, revoke active sessions from Redis instantly, and reject blocked credentials at gateway middleware.
- **Guide:** [`TASK_08_IMPLEMENTATION_GUIDE.md`](./TASK_08_IMPLEMENTATION_GUIDE.md) (Covers scope, step-by-step code, test cases, and security gates.)
