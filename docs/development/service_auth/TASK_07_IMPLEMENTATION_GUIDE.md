# TASK IMPLEMENTATION GUIDE: TASK-07 - Social Authentication (Google OAuth 2.0 / OIDC)

- **Service:** `services/auth`
- **Status:** `COMPLETED`
- **Task List:** [`./TASK_LIST.md`](./TASK_LIST.md)
- **Record:** [`../IMPLEMENTATION_RECORD.md`](../IMPLEMENTATION_RECORD.md)
- **Progress:** [`../PROGRESS.md`](../PROGRESS.md)
- **Completed Date:** 2026-11-12

---

## 1. SUMMARY & GOAL

Implement single-click social authentication and registration via Google OAuth 2.0 / OIDC for `services/auth`.
Modern SaaS platforms eliminate friction by enabling users to sign in with their existing Google identities.
This task delivers:
1. **Google OIDC ID Token Verification:** Validates incoming Google ID tokens cryptographically using `jose` against Google's public JSON Web Key Set (`https://www.googleapis.com/oauth2/v3/certs`), checking signature, expiration, issuer, and audience.
2. **Deterministic Identity Resolution & Account Linking:**
   - If a user with matching `googleId` exists, authenticates them immediately.
   - If a user with the same verified email exists without a `googleId`, securely links their Google identity to the existing account.
   - If no account exists, registers a new account pre-filling name, email, and avatar.
3. **Smart Session & Onboarding Routing:**
   - Fully onboarded users (`isOnboarded: true`) receive active production session tokens (`accessToken` + `refreshToken`) via the Session Engine (`TASK-05`).
   - New or pending users (`isOnboarded: false`) receive a scoped 2-hour `onboardingToken` for mandatory profile onboarding (`TASK-06`).
4. **OpenAPI / Swagger Integration:** Registers `POST /api/auth/google` in `/api/docs` with full request and response schemas.

---

## 2. SCOPE OF CHANGES

- **Files to Create:**
  - `services/auth/src/utils/google.utils.ts` (Google OIDC token verifier using `jose` remote JWKS)
  - `services/auth/src/services/google-auth.service.ts` (Domain logic for Google authentication and account linking)
  - `services/auth/src/controllers/google-auth.controller.ts` (Express controller for Google auth endpoint)
  - `services/auth/src/routes/google-auth.route.ts` (Express route definition for `/api/auth/google`)
  - `services/auth/src/services/google-auth.service.test.ts` (Vitest unit tests for Google auth service)
  - `services/auth/src/routes/google-auth.route.test.ts` (HTTP integration tests using Supertest)

- **Files to Modify:**
  - `services/auth/src/types/auth.types.ts` (Add `GoogleTokenClaims` and `GoogleAuthResult` contracts)
  - `services/auth/src/repositories/user.repository.ts` (Add `findUserByGoogleId` and persist `googleId` / `avatarUrl`)
  - `services/auth/src/routes/api.router.ts` (Mount `googleAuthRouter` at `/api/auth/google`)
  - `services/auth/src/docs/openapi.ts` (Register OpenAPI contracts for `POST /api/auth/google`)

---

## 3. STEP-BY-STEP IMPLEMENTATION

### Step 1: Update Domain Contracts and User Repository
- **Target Files:**
  - `services/auth/src/types/auth.types.ts`
  - `services/auth/src/repositories/user.repository.ts`
- **Actions:**
  - Add `GoogleTokenClaims` interface to `auth.types.ts`.
  - Add `GoogleAuthResult` union type to `auth.types.ts`.
  - Add `findUserByGoogleId(googleId: string): Promise<User | null>` in `user.repository.ts`.
  - Ensure `createUser` in `user.repository.ts` persists `googleId` and `avatarUrl`.

### Step 2: Implement Google Token Verifier
- **Target File:** `services/auth/src/utils/google.utils.ts`
- **Actions:**
  - Define `GoogleTokenVerifier` interface and `DefaultGoogleTokenVerifier` class.
  - Implement remote JWKS verification using `jose.createRemoteJWKSet(new URL("https://www.googleapis.com/oauth2/v3/certs"))`.
  - Validate issuer against `https://accounts.google.com` and `accounts.google.com`.
  - Validate audience against `process.env.GOOGLE_OAUTH_CLIENT_ID` / `process.env.GOOGLE_CLIENT_ID`.

### Step 3: Implement Google Auth Service
- **Target File:** `services/auth/src/services/google-auth.service.ts`
- **Actions:**
  - Verify ID token via `GoogleTokenVerifier`.
  - Check existing user by `googleId` -> authenticate.
  - Check existing user by `email` -> link account and authenticate.
  - If brand new -> create user with `authProvider: "google"`.
  - Validate account standing (blocked/deleted return 403).
  - Issue full session tokens if onboarded; issue `onboardingToken` if pending profile onboarding.

### Step 4: Implement Controller, Route & API Router Binding
- **Target Files:**
  - `services/auth/src/controllers/google-auth.controller.ts`
  - `services/auth/src/routes/google-auth.route.ts`
  - `services/auth/src/routes/api.router.ts`
- **Actions:**
  - Map HTTP request, extract client IP and user-agent.
  - Validate request body with `GoogleAuthSchema`.
  - Mount router at `apiRouter.use("/google", googleAuthRouter)`.

### Step 5: Swagger / OpenAPI Documentation
- **Target File:** `services/auth/src/docs/openapi.ts`
- **Actions:**
  - Register `GoogleAuthResponseSchema`.
  - Register `POST /api/auth/google` with full descriptions and example bodies.

---

## 4. TEST SCENARIOS TO COVER

### A. Unit Tests (`google-auth.service.test.ts`)
1. **Existing Google User (Onboarded):** Returns `isNewUser: false`, `isOnboarded: true`, and active production session tokens.
2. **Existing Google User (Pending Onboarding):** Returns `isNewUser: false`, `isOnboarded: false`, and 2-hour `onboardingToken`.
3. **Account Linking:** Existing email OTP user authenticating with Google links `googleId` and returns session/onboarding.
4. **Brand New User:** Registers account with `authProvider: "google"`, pre-fills name and avatar, and returns 2-hour `onboardingToken`.
5. **Account Blocked / Deleted:** Throws 403 with `ACCOUNT_BLOCKED` or `ACCOUNT_DELETED`.
6. **Invalid Token:** Throws 401 with `INVALID_TOKEN` when Google token verification fails.

### B. Route Integration Tests (`google-auth.route.test.ts`)
1. `POST /api/auth/google` returns `200 OK` with valid payload and token.
2. `POST /api/auth/google` returns `400 Bad Request` if `idToken` is missing or empty.
3. `POST /api/auth/google` returns `401 Unauthorized` if token verification throws.
4. `POST /api/auth/google` returns `403 Forbidden` if account is blocked.

---

## 5. SECURITY SCENARIOS TO COVER

- **Cryptographic Signature Verification:** Only tokens signed by Google's private key are accepted via remote JWKS.
- **Audience Enforcement:** Verifies that the token was minted specifically for our Google OAuth Client ID, preventing cross-client token injection attacks.
- **Timing-Safe User Lookup & Moderation:** Blocked or soft-deleted accounts cannot bypass restrictions through social login.
- **Sanitized Response:** Omits all sensitive database credentials from API responses.

---

## 6. POST-IMPLEMENTATION WORKFLOW

Execute verification commands:
```bash
pnpm --filter @services/auth typecheck
pnpm --filter @services/auth test
pnpm typecheck
```

---

## 7. RECORD UPDATE INSTRUCTIONS

1. Mark `TASK-07` as `COMPLETED` in [`TASK_LIST.md`](./TASK_LIST.md).
2. Append `TASK-07` record to [`docs/development/IMPLEMENTATION_RECORD.md`](../IMPLEMENTATION_RECORD.md).
3. Refresh progress metrics in [`docs/development/PROGRESS.md`](../PROGRESS.md).
