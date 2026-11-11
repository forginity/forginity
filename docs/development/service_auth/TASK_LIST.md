# TASK LIST: SERVICE_AUTH

## 1. SERVICE DETAILS

- **Service Name:** `services/auth`
- **Domain:** Centralized Single Sign-On (SSO), Identity, Reusable OTP Engine, and User Lifecycle
- **Purpose:** Provides unified authentication, social sign-in, onboarding, and user management across Forginity products. Issues scoped session JWTs, provides standalone OTP verification primitives, and manages user profiles.
- **Key Features & Flows:**
  - Standalone Reusable OTP Engine keyed by opaque `requestId` for authentication, payments, and MFA.
  - Unified Passwordless Authentication via Email OTP with dynamic `isNewUser: true/false` routing.
  - Dedicated Session Management (`/session`) issuing 15-minute access JWTs and 30-day refresh sessions.
  - Social Sign-in & Sign-up via Google OAuth 2.0 / OIDC.
  - Mandatory Profile Onboarding collecting First Name, Last Name, Gender, and Country per Figma Node `179:509`.
  - User lifecycle management: Edit Profile, Emergency Contacts, Soft Delete, and Admin Block/Unblock.
- **Tech Stack:** Express, TypeScript, PostgreSQL 18, Drizzle ORM, Zod, Redis 7, `jose`, Nodemailer / Resend SMTP, Vitest, Supertest.
- **Service Status:** `IN_PROGRESS` (Active: TASK-03 completed; TASK-04 up next).
- **Reference Service:** [`services/products`](file:///home/vikas/Documents/forginity/services/products)
- **Central Implementation Record:** [`../IMPLEMENTATION_RECORD.md`](../IMPLEMENTATION_RECORD.md)
- **Overall Progress:** [`../PROGRESS.md`](../PROGRESS.md)

---

## 2. PROGRESSIVE TASK MATRIX

| Task ID   | Task Title                                      | Key Deliverable                                                                              | Guide File                                                             | Status      |
| :-------- | :---------------------------------------------- | :------------------------------------------------------------------------------------------- | :--------------------------------------------------------------------- | :---------- |
| `TASK-01` | Scaffold `services/auth` package and configs    | Base Express app, tsconfig, drizzle config                                                   | [`TASK_01_IMPLEMENTATION_GUIDE.md`](./TASK_01_IMPLEMENTATION_GUIDE.md) | `COMPLETED` |
| `TASK-02` | Build database schemas and migrations           | `src/db/auth.schema.ts` and migrations                                                       | [`TASK_02_IMPLEMENTATION_GUIDE.md`](./TASK_02_IMPLEMENTATION_GUIDE.md) | `COMPLETED` |
| `TASK-03` | Reusable OTP Service & Transport Engine         | Standalone OTP generator, HMAC-SHA256, `requestId` dispatch/verify, Resend transport         | [`TASK_03_IMPLEMENTATION_GUIDE.md`](./TASK_03_IMPLEMENTATION_GUIDE.md) | `COMPLETED` |
| `TASK-04` | Unified Passwordless Email Authentication API   | `POST /api/auth/email/initiate` (`isNewUser` detection) & `POST /api/auth/email/verify`      | [`TASK_04_IMPLEMENTATION_GUIDE.md`](./TASK_04_IMPLEMENTATION_GUIDE.md) | `COMPLETED` |
| `TASK-05` | User Session Management & Token Engine          | `POST /api/auth/session` (15m Access JWT, 30d Refresh token, `auth_db.sessions`, revocation) | [`TASK_05_IMPLEMENTATION_GUIDE.md`](./TASK_05_IMPLEMENTATION_GUIDE.md) | `COMPLETED` |
| `TASK-06` | Mandatory Profile Onboarding API                | `POST /api/auth/onboarding` (Name, Gender, Country per Figma `179:509`), session upgrade     | [`TASK_06_IMPLEMENTATION_GUIDE.md`](./TASK_06_IMPLEMENTATION_GUIDE.md) | `PENDING`   |
| `TASK-07` | Social Authentication (Google OAuth 2.0 / OIDC) | Google ID token verification, account linking, routes to session or onboarding               | [`TASK_07_IMPLEMENTATION_GUIDE.md`](./TASK_07_IMPLEMENTATION_GUIDE.md) | `PENDING`   |
| `TASK-08` | User Profile & Emergency Contacts API           | `GET/PUT /api/users/me` profile manager, emergency contact CRUD sub-resources                | [`TASK_08_IMPLEMENTATION_GUIDE.md`](./TASK_08_IMPLEMENTATION_GUIDE.md) | `PENDING`   |
| `TASK-09` | User Lifecycle & Account Moderation API         | Soft deletion, admin block/unblock, instant cross-service session revocation                 | [`TASK_09_IMPLEMENTATION_GUIDE.md`](./TASK_09_IMPLEMENTATION_GUIDE.md) | `PENDING`   |

---

## 3. TASK LIST

### `TASK-01`: Scaffold `services/auth` package and configs

- **Description:** Initialize `services/auth` workspace package using `services/products` as an architectural reference.
  Configure `package.json`, `tsconfig.json`, `drizzle.config.ts`, Vitest, and bootstrap Express app scaffolding.
- **Guide:** [`TASK_01_IMPLEMENTATION_GUIDE.md`](./TASK_01_IMPLEMENTATION_GUIDE.md)

### `TASK-02`: Build database schemas and migrations

- **Description:** Implement Drizzle ORM schemas in `src/db/auth.schema.ts` for `users`, `otps`, `sessions`, `user_products`, and `user_emergency_contacts`.
  Generate SQL migration files and verify PostgreSQL schema constraints and index definitions.
- **Guide:** [`TASK_02_IMPLEMENTATION_GUIDE.md`](./TASK_02_IMPLEMENTATION_GUIDE.md)

### `TASK-03`: Reusable OTP Service & Transport Engine

- **Description:** Implement a standalone, platform-wide OTP subsystem decoupled from specific user tables.
  Supports `POST /api/auth/otp/send` and `POST /api/auth/otp/verify` bound to opaque `requestId`s.
  Generates 6-digit numeric codes, stores timing-safe HMAC-SHA-256 hashes, dispatches branded emails via Nodemailer + Resend SMTP (`smtp.resend.com:465`), and provides zero-cost `ConsoleOtpTransport` for development and automated testing.
- **Guide:** [`TASK_03_IMPLEMENTATION_GUIDE.md`](./TASK_03_IMPLEMENTATION_GUIDE.md)

### `TASK-04`: Unified Passwordless Email Authentication API

- **Description:** Implement single-entry passwordless authentication.
  - `POST /api/auth/email/initiate`: Validates email, verifies account is not blocked, determines `isNewUser: true/false`, and calls OTP Service to dispatch code, returning `{ isNewUser, requestId, expiresInSeconds }`.
  - `POST /api/auth/email/verify`: Verifies code with `requestId` via OTP Service. If returning onboarded user, calls Session Engine to issue access and refresh tokens. If new user, creates user and issues scoped `onboardingToken`.
- **Guide:** [`TASK_04_IMPLEMENTATION_GUIDE.md`](./TASK_04_IMPLEMENTATION_GUIDE.md)

### `TASK-05`: User Session Management & Token Engine

- **Description:** Implement centralized session management at `/api/auth/session`.
  Issues 15-minute access JWTs and 30-day refresh sessions stored in `auth_db.sessions` and Redis.
  Supports session refresh with token rotation, single-session revocation, all-session revocation, and multi-tenant product switching.
- **Guide:** [`TASK_05_IMPLEMENTATION_GUIDE.md`](./TASK_05_IMPLEMENTATION_GUIDE.md)

### `TASK-06`: Mandatory Profile Onboarding API

- **Description:** Implement `/api/auth/onboarding` endpoint guarded by `onboardingToken` to capture First Name, Last Name, Gender, and 2-letter Country code per Figma Node `179:509`.
  Promotes user to `isOnboarded = true` and upgrades session to full production tokens via Session Engine.
- **Guide:** [`TASK_06_IMPLEMENTATION_GUIDE.md`](./TASK_06_IMPLEMENTATION_GUIDE.md)

### `TASK-07`: Social Authentication (Google OAuth 2.0 / OIDC)

- **Description:** Implement Google OAuth 2.0 / OIDC token verification endpoint for instant 1-click registration and login.
  Links Google identities to existing accounts or creates pending accounts, seamlessly routing to Session Engine if onboarded or Onboarding if new.
- **Guide:** [`TASK_07_IMPLEMENTATION_GUIDE.md`](./TASK_07_IMPLEMENTATION_GUIDE.md)

### `TASK-08`: User Profile & Emergency Contacts API

- **Description:** Implement `/api/users/me` profile update endpoint and emergency contact CRUD endpoints with authorization middleware.
- **Guide:** [`TASK_08_IMPLEMENTATION_GUIDE.md`](./TASK_08_IMPLEMENTATION_GUIDE.md)

### `TASK-09`: User Lifecycle & Account Moderation API

- **Description:** Implement account soft deletion and administrative block/unblock endpoints with RBAC authorization guards and instant session revocation.
- **Guide:** [`TASK_09_IMPLEMENTATION_GUIDE.md`](./TASK_09_IMPLEMENTATION_GUIDE.md)
