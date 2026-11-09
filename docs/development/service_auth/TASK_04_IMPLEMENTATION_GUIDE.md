# TASK IMPLEMENTATION GUIDE: TASK-04 - Unified Passwordless Email Authentication API

- **Service:** `services/auth`
- **Status:** `IN_PROGRESS`
- **Task List:** [`./TASK_LIST.md`](./TASK_LIST.md)
- **Record:** [`../IMPLEMENTATION_RECORD.md`](../IMPLEMENTATION_RECORD.md)
- **Progress:** [`../PROGRESS.md`](../PROGRESS.md)
- **Figma Reference:** [Forginity UI Node `179:509` (Mobile Onboarding)](https://www.figma.com/design/sERqI1nBTDZqA6JDZVnRt4/Forginity-Ui?node-id=179-509)

---

## 1. SUMMARY & GOAL

Implement the unified passwordless Email Authentication API for `services/auth`.
Modern authentication architectures (such as Slack, Linear, and Supabase) eliminate the artificial boundary between "sign-up" and "sign-in". Instead of maintaining two divergent endpoints that return duplicate errors, this single entry workflow accepts a user's email, automatically detects whether the user is brand new or returning, dispatches a 6-digit OTP via the standalone OTP engine (`TASK-03`), and upon verification routes the user cleanly:
1. **Returning Onboarded User (`isOnboarded: true`):** Issues full production session tokens (`accessToken` + `refreshToken`) for instant redirect to the **Dashboard**.
2. **New User or Un-onboarded User (`isOnboarded: false`):** Automatically registers a pending user record and issues a scoped 2-hour `onboardingToken` for redirect to the **Profile Onboarding Flow** (`TASK-06`).

---

## 2. SCOPE OF CHANGES

- **Files to Create:**
  - `services/auth/src/utils/token.utils.ts` (JWT generation and verification using `jose` for access, refresh, and onboarding tokens)
  - `services/auth/src/repositories/user.repository.ts` (Drizzle ORM repository for `users` table operations)
  - `services/auth/src/repositories/session.repository.ts` (Drizzle ORM repository for `sessions` table operations)
  - `services/auth/src/services/auth.service.ts` (Business logic for `initiateEmailAuth` and `verifyEmailAuth`)
  - `services/auth/src/controllers/auth.controller.ts` (Express controller handlers for email auth endpoints)
  - `services/auth/src/routes/auth.route.ts` (Express route definitions for `/api/auth/email/*`)
  - `services/auth/src/services/auth.service.test.ts` (Unit tests for auth service business logic)
  - `services/auth/src/routes/auth.route.test.ts` (HTTP contract and integration tests for auth routes)
  - `services/auth/src/repositories/user.repository.test.ts` (Integration tests for user repository operations)

- **Files to Modify:**
  - `services/auth/src/db/auth.validator.ts` (Add `InitiateEmailAuthSchema` and `VerifyEmailAuthSchema`)
  - `services/auth/src/routes/api.router.ts` (Mount `authRouter` at `/api/auth/email`)
  - `services/auth/src/docs/openapi.ts` (Register OpenAPI contracts for `/api/auth/email/initiate` and `/api/auth/email/verify`)
  - `services/auth/src/app.ts` (Ensure route mounting and error handling)

---

## 3. STEP-BY-STEP IMPLEMENTATION

### Step 1: Define Validation Schemas & Types
- **Target File:** `services/auth/src/db/auth.validator.ts`
- **Action:**
  - Add `InitiateEmailAuthSchema`: validates `email` (trimmed, lowercase, standard email regex).
  - Add `VerifyEmailAuthSchema`: validates `requestId` (UUID) and `code` (6-digit numeric string).
  - Derive TypeScript types `InitiateEmailAuthInput` and `VerifyEmailAuthInput`.

### Step 2: Implement Cryptographic Token Engine
- **Target File:** `services/auth/src/utils/token.utils.ts`
- **Action:**
  - Implement JWT issuance and verification functions using `jose`:
    - `signAccessToken({ userId, email, currentProductId? })`: 15-minute expiration, `scope: 'access'`.
    - `signRefreshToken({ userId, sessionId })`: 30-day expiration, `scope: 'refresh'`.
    - `signOnboardingToken({ userId, email })`: 2-hour expiration, `scope: 'onboarding'`.
    - `verifyJwtToken<T>(token, expectedScope)`: validates signature, expiration, and scope.
  - Read secret strictly from `process.env.JWT_SECRET` with secure development fallback.

### Step 3: Implement User and Session Repositories
- **Target Files:**
  - `services/auth/src/repositories/user.repository.ts`
  - `services/auth/src/repositories/session.repository.ts`
- **Action:**
  - `UserRepository`:
    - `findUserById(id: string)`
    - `findUserByEmail(email: string)`
    - `createUser(data: CreateUserInput)`
    - `updateUser(id: string, data: Partial<User>)`
    - `checkConnection()`
  - `SessionRepository`:
    - `createSession(data: CreateSessionInput)`
    - `findSessionById(id: string)`
    - `deleteSession(id: string)`
    - `deleteSessionsByUserId(userId: string)`

### Step 4: Implement Unified Auth Service
- **Target File:** `services/auth/src/services/auth.service.ts`
- **Action:**
  - Implement `initiateEmailAuth(input: InitiateEmailAuthInput)`:
    1. Query user by normalized email.
    2. If user exists and `status === 'blocked'`, throw `AuthServiceError("Account is blocked. Please contact support.", 403)`.
    3. If user exists and `status === 'deleted'`, throw `AuthServiceError("Account has been deleted.", 403)`.
    4. Set `isNewUser = !user`.
    5. Call `otpService.sendOtp({ identifier: email, identifierType: "email", purpose: "authentication" })`.
    6. Return `{ success: true, isNewUser, requestId, expiresInSeconds, cooldownSeconds }`.
  - Implement `verifyEmailAuth(input: VerifyEmailAuthInput, context: { ipAddress?, userAgent? })`:
    1. Verify OTP with `otpService.verifyOtp({ requestId: input.requestId, code: input.code })`.
    2. Query user by verified email identifier.
    3. If user does not exist:
       - Create user record with `email`, `authProvider: "email_otp"`, `isVerified: true`, `isOnboarded: false`, `status: "active"`.
       - Issue 2-hour scoped `onboardingToken`.
       - Return `{ success: true, isNewUser: true, isOnboarded: false, user: sanitize(user), onboardingToken }`.
    4. If user exists:
       - Verify account status (`blocked` or `deleted` -> 403).
       - If `!user.isVerified`, update `isVerified: true`.
       - If `user.isOnboarded === true`:
         - Create session in `sessions` table.
         - Issue 15-minute `accessToken` and 30-day `refreshToken`.
         - Return `{ success: true, isNewUser: false, isOnboarded: true, user: sanitize(user), session: { accessToken, refreshToken, expiresIn: 900 } }`.
       - If `user.isOnboarded === false`:
         - Issue 2-hour scoped `onboardingToken`.
         - Return `{ success: true, isNewUser: false, isOnboarded: false, user: sanitize(user), onboardingToken }`.

### Step 5: Implement Controller & Express Routes
- **Target Files:**
  - `services/auth/src/controllers/auth.controller.ts`
  - `services/auth/src/routes/auth.route.ts`
  - `services/auth/src/routes/api.router.ts`
- **Action:**
  - Bind `POST /api/auth/email/initiate` to validate `InitiateEmailAuthSchema` and handle response.
  - Bind `POST /api/auth/email/verify` to validate `VerifyEmailAuthSchema`, extract client IP and user agent, and handle response.
  - Mount router under `/api/auth/email` in `api.router.ts`.

### Step 6: OpenAPI / Swagger Documentation
- **Target File:** `services/auth/src/docs/openapi.ts`
- **Action:**
  - Register `InitiateEmailAuthRequest` and `VerifyEmailAuthRequest` schemas.
  - Register endpoints `POST /api/auth/email/initiate` and `POST /api/auth/email/verify` with full response contracts (200, 400, 403, 429).
  - Verify accessibility at `/api/docs` and spec at `/api/docs.json`.

---

## 4. VERIFICATION & TESTS

Execute verification commands:
```bash
pnpm --filter @services/auth typecheck
pnpm --filter @services/auth lint
pnpm --filter @services/auth test
pnpm typecheck
```

Test scenarios to cover:
- **Happy Path (New User):**
  - `POST /api/auth/email/initiate` returns `isNewUser: true`, dispatches OTP, returns valid `requestId`.
  - `POST /api/auth/email/verify` with correct code creates user, returns `isOnboarded: false` and `onboardingToken`.
- **Happy Path (Returning Onboarded User):**
  - `POST /api/auth/email/initiate` returns `isNewUser: false`, dispatches OTP.
  - `POST /api/auth/email/verify` returns `isOnboarded: true` and full session (`accessToken`, `refreshToken`).
- **Account Blocked / Moderated:**
  - `POST /api/auth/email/initiate` with blocked user returns `403 Forbidden`.
- **Input Validation Failure:**
  - Invalid email string returns `400 Bad Request` with descriptive validation error.
  - Malformed `requestId` or non-6-digit code returns `400 Bad Request`.
- **OTP Verification Failures:**
  - Wrong OTP code returns `400 Bad Request` with attempts remaining.
  - Expired or already used OTP returns `400 Bad Request`.
- **Rate Limiting:**
  - Requesting OTP twice within 60 seconds returns `429 Too Many Requests`.

---

## 5. SECURITY & GUARDRAILS

- [x] **No `.env` touched.** Secrets read strictly from `process.env`.
- [x] **Input validation.** All external payloads parsed and validated using Zod.
- [x] **Timing-safe comparison.** OTP codes verified using HMAC-SHA256 and `crypto.timingSafeEqual`.
- [x] **Cryptographic token scoping.** Onboarding tokens strictly scoped (`scope: 'onboarding'`) cannot be used as access tokens.
- [x] **SQL parameterization.** All queries use Drizzle ORM query builders.
- [x] **Account status defense.** Blocked and deleted accounts are denied before issuing OTPs or tokens.

---

## 6. RECORD UPDATE

1. Mark task as `COMPLETED` in [`./TASK_LIST.md`](./TASK_LIST.md).
2. Update the **LAST UPDATE** block and append row #21 to [`../IMPLEMENTATION_RECORD.md`](../IMPLEMENTATION_RECORD.md).
3. Refresh the component row and overall metrics in [`../PROGRESS.md`](../PROGRESS.md).
