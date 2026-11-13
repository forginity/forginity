# Auth & Identity Microservice (`@services/auth`)

Centralized Single Sign-On (SSO), Identity, and Reusable OTP Engine for the Forginity monorepo platform.

---

## 1. What This Service Is

The Auth & Identity Service is a core backend microservice for the Forginity platform. It provides passwordless authentication, multi-tenant session orchestration, and unified user identity across all Forginity consumer products (e.g. TrackRide, PikyRider) and internal administrative portals.

It serves as the single source of truth for user accounts, credential issuance, emergency contacts, session token rotation, and administrative user moderation.

### Primary Responsibilities
- **Passwordless Multi-Channel Authentication:** Dispatches and verifies cryptographically secure 6-digit OTP tokens via transactional email (and SMS extensibility).
- **Social SSO Federation:** Google OAuth 2.0 ID token verification and automatic user profile sync with profile picture extraction.
- **Onboarding Engine:** Captures and validates first-time profile setups (names, gender, ISO 3166-1 alpha-2 country codes) before issuing standard platform access tokens.
- **SSO Session Management & Token Rotation:** Issues 15-minute scoped JWT access tokens and 30-day rotating refresh tokens with SHA-256 session secret hashes and multi-device revocation.
- **User Self-Service & Lifecycle Management:** Supports profile updates, emergency contact management, soft deletion, and 30-day grace period restoration.
- **Administrative Back-Office Directory & Moderation:** Administrative APIs for paginated user search, detailed account inspection, and user status toggling (`active`, `blocked`, `deleted`) with RBAC enforcement (`userType === 'admin'`).

### Primary Consumers & Integrations
- **Web Admin Portal (`apps/admin`):** Consumes administrative user management APIs (`GET /api/users`, `GET /api/users/:userId`, `PATCH /api/users/:userId/status`) using admin credentials.
- **Consumer Product Frontends (`apps/shell`, TrackRide / PikyRider):** Consumes passwordless sign-in, Google SSO, session refresh, profile management, and emergency contact APIs.
- **Shared Platform Packages (`@forginity/sdk`):** SDK client wrapper standardizing typed API calls, token caching, and automated session refreshing.

---

## 2. Architecture & Tech Stack

- **Runtime / Framework:** Node.js with Express 5 and TypeScript.
- **Database / Storage:** PostgreSQL 18 with Drizzle ORM (Database-per-Service isolation).
- **Validation Engine:** Zod runtime schemas with Type-First inference and `@asteasolutions/zod-to-openapi`.
- **Token Security:** `jose` library using HMAC-SHA256 (HS256) with separate secret rotation for access and refresh tokens.
- **Email Delivery:** Nodemailer integration supporting SMTP and Resend API transports with responsive, minimal HTML templates.
- **API Documentation:** Interactive Swagger UI at `/api/docs` and raw OpenAPI 3.0 specification at `/api/docs.json`.
- **Testing Framework:** Vitest with Supertest.

---

## 3. What It Exposes

### Endpoints & Routes
| Method | Endpoint | Description | Auth Required | Access Level |
| :--- | :--- | :--- | :--- | :--- |
| `GET` | `/api/health` | Operational health and database connectivity check | No | Public |
| `GET` | `/api/docs` | Interactive Swagger UI documentation | No | Public |
| `GET` | `/api/docs.json` | Raw OpenAPI 3.0.0 JSON specification | No | Public |
| `POST` | `/api/auth/otp/send` | Request 6-digit email OTP for verification | No | Public |
| `POST` | `/api/auth/otp/verify` | Verify OTP code against active requestId | No | Public |
| `POST` | `/api/auth/email/initiate` | Unified email OTP dispatch for sign-in / sign-up | No | Public |
| `POST` | `/api/auth/email/verify` | Verify email OTP; issues onboardingToken or session | No | Public |
| `POST` | `/api/auth/google` | Google Social Sign-In via Google ID token | No | Public |
| `POST` | `/api/auth/onboarding` | Complete first-time user profile onboarding | Yes | Onboarding Token |
| `POST` | `/api/auth/session/refresh` | Rotate session refresh token and issue access token | No | Refresh Token Body |
| `GET` | `/api/auth/session/me` | Retrieve active session details and user profile | Yes | Access Token |
| `POST` | `/api/auth/sessions/switch-product` | Switch session product context without re-auth | Yes | Access Token |
| `GET` | `/api/auth/sessions` | List all active sessions across devices | Yes | Access Token |
| `DELETE` | `/api/auth/sessions` | Revoke all active sessions (global sign-out) | Yes | Access Token |
| `DELETE` | `/api/auth/sessions/:sessionId` | Revoke a single specific active session by UUID | Yes | Access Token |
| `GET` | `/api/users/me` | Retrieve authenticated user profile | Yes | Access Token |
| `PUT` | `/api/users/me` | Update personal profile information | Yes | Access Token |
| `DELETE` | `/api/users/me` | Soft-delete own account and terminate sessions | Yes | Access Token |
| `POST` | `/api/users/:userId/restore` | Restore soft-deleted account within grace period | Yes | Access Token |
| `GET` | `/api/users/me/emergency-contacts` | List configured emergency contacts | Yes | Access Token |
| `POST` | `/api/users/me/emergency-contacts` | Add new emergency contact | Yes | Access Token |
| `GET` | `/api/users/me/emergency-contacts/:contactId` | Retrieve single emergency contact | Yes | Access Token |
| `PUT` | `/api/users/me/emergency-contacts/:contactId` | Update emergency contact details | Yes | Access Token |
| `DELETE` | `/api/users/me/emergency-contacts/:contactId` | Remove emergency contact | Yes | Access Token |
| `GET` | `/api/users` | Directory search and user list with pagination | Yes | Admin Only |
| `GET` | `/api/users/:userId` | Detailed user record with sessions & contacts | Yes | Admin Only |
| `PATCH` | `/api/users/:userId/status` | Change user status (`active`, `blocked`, `deleted`) | Yes | Admin Only |

---

## 4. How to Use & Integrate

### 1. Configuration & Environment Variables
Configuration values are read exclusively from `process.env`. Never create, modify, or commit `.env` files.

```bash
PORT=3001
NODE_ENV=development
AUTH_DATABASE_URL=postgres://postgres:postgres@localhost:5432/forginity_auth
JWT_SECRET=your_jwt_signing_secret_here
GOOGLE_CLIENT_ID=your_google_oauth_client_id.apps.googleusercontent.com
SMTP_HOST=smtp.mailgun.org
SMTP_PORT=587
SMTP_USER=postmaster@forginity.com
SMTP_PASS=your_smtp_password
EMAIL_FROM=Forginity Auth <no-reply@forginity.com>
```

### 2. Usage Examples

#### Making Authenticated Calls
Include the issued access token in the `Authorization` header:

```bash
curl -X GET http://localhost:3001/api/users/me \
  -H "Authorization: Bearer <access_token>"
```

#### Administrative User Moderation (Admin Only)
Callers with `userType === "admin"` can block or restore accounts:

```bash
curl -X PATCH http://localhost:3001/api/users/550e8400-e29b-41d4-a716-446655440001/status \
  -H "Authorization: Bearer <admin_access_token>" \
  -H "Content-Type: application/json" \
  -d '{"status": "blocked", "reason": "Violation of Terms of Service"}'
```

---

## 5. Development & Testing Commands

Execute verification commands from the repository root:

```bash
# Run unit and integration tests (25 test suites, 194 tests)
pnpm --filter @services/auth test

# Run strict TypeScript typecheck
pnpm --filter @services/auth typecheck

# Run linter
pnpm --filter @services/auth lint
```

---

## 6. Security & Guardrails

- **Strict Environment Protection:** Zero `.env` file reading or inspection. Secrets read exclusively from `process.env`.
- **Role-Based Access Control (RBAC):** Administrative endpoints strictly require `req.user.userType === "admin"`. Non-admin requests return `403 FORBIDDEN`.
- **Session Invalidation on Moderation:** Blocking or deleting a user immediately purges all active database sessions and refresh tokens across all client devices.
- **Type-First Contracts:** All external payloads validated through authoritative Zod schemas before hitting business logic.
