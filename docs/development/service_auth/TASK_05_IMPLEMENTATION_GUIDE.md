# TASK IMPLEMENTATION GUIDE: TASK-05 - User Session Management & Token Engine

- **Service:** `services/auth`
- **Status:** `COMPLETED`
- **Task List:** [`./TASK_LIST.md`](./TASK_LIST.md)
- **Record:** [`../IMPLEMENTATION_RECORD.md`](../IMPLEMENTATION_RECORD.md)
- **Progress:** [`../PROGRESS.md`](../PROGRESS.md)

---

## 1. SUMMARY & GOAL

Implement centralized SSO session management and token lifecycle engine in `services/auth`.
Modern multi-tenant SaaS applications require secure, long-lived user sessions without sacrificing immediate revocation capabilities or token security.
This task delivers:
1. **Token Refresh with Rotation (`POST /api/auth/session` & `POST /api/auth/session/refresh`):** Accepts a 30-day refresh token, verifies its cryptographic signature and database standing in `auth_db.sessions`, rotates the session secret and refresh token to eliminate replay attacks, and issues a fresh 15-minute access JWT.
2. **Multi-Tenant Product Switching (`POST /api/auth/session/switch-product`):** Allows an authenticated user to switch context between Forginity products (e.g., TrackRide, Custom Apparel, Admin Dashboard), persisting active `currentProductId` and issuing an updated access JWT embedding product authorization context.
3. **Session Revocation (`POST /api/auth/session/revoke` & `POST /api/auth/session/revoke-all`):** Provides single-session logout and global multi-device logout by deleting session records from `auth_db.sessions`.
4. **Current Session & Profile Inspection (`GET /api/auth/session/me`):** Provides authenticated access to the user's active session metadata and sanitized profile.

---

## 2. SCOPE OF CHANGES

- **Files to Create:**
  - `services/auth/src/services/session.service.ts` (Core session domain logic: refresh with rotation, switch product, revoke, revoke-all, get session)
  - `services/auth/src/controllers/session.controller.ts` (HTTP controller mapping for session routes)
  - `services/auth/src/routes/session.route.ts` (Express router for `/api/auth/session/*`)
  - `services/auth/src/middleware/auth.middleware.ts` (Bearer JWT authentication guard middleware)
  - `services/auth/src/services/session.service.test.ts` (Vitest unit tests for session service logic)
  - `services/auth/src/routes/session.route.test.ts` (HTTP integration tests using Supertest)
  - `services/auth/src/repositories/session.repository.test.ts` (Database operations test for session repository)

- **Files to Modify:**
  - `services/auth/src/types/auth.types.ts` (Add session request/response types and token payload enhancements)
  - `services/auth/src/utils/token.utils.ts` (Support `tokenSecret` in `signRefreshToken` for rotation verification)
  - `services/auth/src/repositories/session.repository.ts` (Add `updateSession` and `findSessionsByUserId`)
  - `services/auth/src/db/auth.validator.ts` (Zod validation schemas for refresh, switch-product, and revocation)
  - `services/auth/src/services/auth.service.ts` (Pass `tokenSecret: sessionTokenBytes` to `signRefreshToken`)
  - `services/auth/src/routes/api.router.ts` (Mount `sessionRouter` at `/api/auth/session`)
  - `services/auth/src/docs/openapi.ts` (Register OpenAPI contracts for all session endpoints)

- **Out of Scope:**
  - Mandatory profile onboarding form endpoints (deferred to `TASK-06`).
  - Google OAuth 2.0 social authentication (deferred to `TASK-07`).

---

## 3. STEP-BY-STEP IMPLEMENTATION

### Step 1: Update Domain Contracts and Token Utilities
- **Target Files:**
  - `services/auth/src/types/auth.types.ts`
  - `services/auth/src/utils/token.utils.ts`
- **Actions:**
  - Add `tokenSecret` to `RefreshTokenPayload`.
  - Define `RefreshSessionInput`, `SwitchProductInput`, `RevokeSessionInput`, `SessionResult`, and `SessionMeResult`.
  - Update `signRefreshToken` to accept optional `tokenSecret`.

### Step 2: Enhance Session Repository
- **Target File:** `services/auth/src/repositories/session.repository.ts`
- **Actions:**
  - Implement `updateSession(id: string, input: Partial<Session>): Promise<Session | null>`.
  - Implement `findSessionsByUserId(userId: string): Promise<Session[]>`.
  - Ensure parameterized queries via Drizzle ORM.

### Step 3: Define Request Validation Schemas
- **Target File:** `services/auth/src/db/auth.validator.ts`
- **Actions:**
  - Define `RefreshSessionSchema` validating `{ refreshToken: z.string().min(1) }`.
  - Define `SwitchProductSchema` validating `{ productId: z.string().uuid(), section: z.string().max(100).optional() }`.
  - Define `RevokeSessionSchema` validating `{ refreshToken: z.string().min(1).optional() }`.

### Step 4: Implement Authentication Middleware
- **Target File:** `services/auth/src/middleware/auth.middleware.ts`
- **Actions:**
  - Extract Bearer token from `Authorization` header.
  - Verify access token via `verifyJwtToken(token, "access")`.
  - Verify user active standing in `UserRepository`.
  - Inject `req.user` and `req.tokenPayload` into request context.

### Step 5: Implement Session Service & Controller
- **Target Files:**
  - `services/auth/src/services/session.service.ts`
  - `services/auth/src/controllers/session.controller.ts`
- **Actions:**
  - Implement `refreshSession`: checks token, verifies session hash match (detecting token reuse), rotates session token secret, updates DB record, issues new access + refresh token.
  - Implement `switchProduct`: updates session's `currentProductId` and `currentSection`, returns new access token with updated claims.
  - Implement `revokeSession`: single session logout by session ID or refresh token.
  - Implement `revokeAllSessions`: global logout for a user.
  - Implement `getCurrentSession`: returns sanitized user and active session metadata.

### Step 6: Define Routes & Mount in API Router
- **Target Files:**
  - `services/auth/src/routes/session.route.ts`
  - `services/auth/src/routes/api.router.ts`
- **Actions:**
  - Define `/api/auth/session` routes:
    - `POST /` & `POST /refresh` -> `sessionController.refreshSession`
    - `POST /switch-product` -> `authenticate`, `validateRequest`, `sessionController.switchProduct`
    - `POST /revoke` -> `sessionController.revokeSession`
    - `POST /revoke-all` -> `authenticate`, `sessionController.revokeAllSessions`
    - `GET /me` -> `authenticate`, `sessionController.getCurrentSession`
  - Mount under `apiRouter.use("/auth/session", sessionRouter)`.

### Step 7: OpenAPI / Swagger Documentation
- **Target File:** `services/auth/src/docs/openapi.ts`
- **Actions:**
  - Register `/api/auth/session/refresh`, `/api/auth/session/switch-product`, `/api/auth/session/revoke`, `/api/auth/session/revoke-all`, and `/api/auth/session/me`.
  - Include schemas, request bodies, 200 responses, 400 validation error responses, 401 unauthorized responses, and 403 forbidden responses.

---

## 4. TEST SCENARIOS TO COVER

### A. Unit Tests (`session.service.test.ts`)
1. **Refresh Token Happy Path:** Successfully refreshes session, rotates refresh token secret in database, returns new access and refresh tokens.
2. **Token Reuse Detection:** Reusing an old rotated refresh token fails with `401 INVALID_TOKEN` and revokes the session.
3. **Session Expiration:** Expired session in DB returns `401 SESSION_EXPIRED`.
4. **Revoked Session:** Attempting to refresh a deleted session returns `401 SESSION_NOT_FOUND`.
5. **Blocked/Deleted User:** User account blocked or deleted returns `403 ACCOUNT_BLOCKED` or `ACCOUNT_DELETED`.
6. **Switch Product:** Updates `currentProductId` on session and issues access token containing new `productId`.
7. **Revoke Single Session:** Successfully deletes session from database.
8. **Revoke All Sessions:** Successfully deletes all sessions for the given user ID.

### B. Route Integration Tests (`session.route.test.ts`)
1. `POST /api/auth/session/refresh` returns `200 OK` with rotated tokens.
2. `POST /api/auth/session/refresh` returns `400 Bad Request` if refreshToken is missing or malformed.
3. `POST /api/auth/session/switch-product` returns `200 OK` with updated access token when authenticated.
4. `POST /api/auth/session/switch-product` returns `401 Unauthorized` when Bearer header is missing.
5. `POST /api/auth/session/revoke` returns `200 OK` on successful session deletion.
6. `POST /api/auth/session/revoke-all` returns `200 OK` and count of revoked sessions.
7. `GET /api/auth/session/me` returns `200 OK` with user and session metadata.

---

## 5. SECURITY SCENARIOS TO COVER

- **OWASP Session Management:** Cryptographically random session tokens (32 bytes entropy), hashed with SHA-256 in database.
- **Refresh Token Rotation (RTR):** Every refresh rotates both the access token and the refresh token. Replay of an old refresh token is detected and blocked.
- **Short-Lived Access Tokens:** Access tokens expire in 15 minutes to limit blast radius of stolen tokens.
- **Strict Scope Separation:** Access tokens (`scope: access`) cannot be passed to refresh endpoints; refresh tokens (`scope: refresh`) cannot be passed to API authentication endpoints.
- **Instant Revocation:** Global logout invalidates all sessions in the database immediately.

---

## 6. POST-IMPLEMENTATION WORKFLOW

Execute verification suite against `@services/auth`:
```bash
pnpm --filter @services/auth typecheck
pnpm --filter @services/auth test
pnpm typecheck
```

---

## 7. RECORD UPDATE INSTRUCTIONS

1. Mark `TASK-05` as `COMPLETED` in [`TASK_LIST.md`](./TASK_LIST.md).
2. Append `TASK-05` record to [`docs/development/IMPLEMENTATION_RECORD.md`](../IMPLEMENTATION_RECORD.md).
3. Update `service_auth` component metrics in [`docs/development/PROGRESS.md`](../PROGRESS.md).
