# TASK IMPLEMENTATION GUIDE: TASK-06 - Mandatory Profile Onboarding API

- **Service:** `services/auth`
- **Status:** `COMPLETED`
- **Task List:** [`./TASK_LIST.md`](./TASK_LIST.md)
- **Record:** [`../IMPLEMENTATION_RECORD.md`](../IMPLEMENTATION_RECORD.md)
- **Progress:** [`../PROGRESS.md`](../PROGRESS.md)
- **Figma Reference:** [Forginity UI Node `179:509` (Mobile Onboarding)](https://www.figma.com/design/sERqI1nBTDZqA6JDZVnRt4/Forginity-Ui?node-id=179-509)

---

## 1. SUMMARY & GOAL

Implement the mandatory profile onboarding API at `POST /api/auth/onboarding`.
When a brand new user registers via passwordless email OTP (`TASK-04`), they receive a scoped 2-hour `onboardingToken`. They cannot access platform resources or products until their user profile is completed.
This task delivers:
1. **Onboarding Guard:** Authorization middleware verifying the 2-hour scoped `onboardingToken` (`scope: "onboarding"`), restricting un-onboarded users from accessing regular APIs and preventing access tokens from calling onboarding.
2. **Profile Completion:** Captures and validates First Name, Last Name, Gender, and 2-letter ISO Country Code per Figma Node `179:509`.
3. **Session Upgrade:** Flips `isOnboarded: true`, sets `name = "${firstName} ${lastName}"`, establishes an active session in `auth_db.sessions`, and issues full production tokens (15-minute `accessToken` and 30-day rotating `refreshToken`).
4. **OpenAPI / Swagger Documentation:** Complete OpenAPI 3.0 specification registered with request/response schemas.

---

## 2. SCOPE OF CHANGES

- **Files to Create:**
  - `services/auth/src/services/onboarding.service.ts` (Core onboarding business logic, user update, and session generation)
  - `services/auth/src/controllers/onboarding.controller.ts` (Express controller for onboarding routes)
  - `services/auth/src/routes/onboarding.route.ts` (Express router for `/api/auth/onboarding`)
  - `services/auth/src/services/onboarding.service.test.ts` (Vitest unit tests for onboarding service logic)
  - `services/auth/src/routes/onboarding.route.test.ts` (HTTP integration tests using Supertest)

- **Files to Modify:**
  - `services/auth/src/types/auth.types.ts` (Add `OnboardingResult` and onboarding error contracts)
  - `services/auth/src/middleware/auth.middleware.ts` (Add `authenticateOnboarding` middleware)
  - `services/auth/src/routes/api.router.ts` (Mount `onboardingRouter` at `/api/auth/onboarding`)
  - `services/auth/src/docs/openapi.ts` (Register OpenAPI contracts for `POST /api/auth/onboarding`)

- **Out of Scope:**
  - Social authentication via Google OAuth 2.0 (deferred to `TASK-07`).
  - Emergency contact CRUD sub-resources (deferred to `TASK-08`).

---

## 3. STEP-BY-STEP IMPLEMENTATION

### Step 1: Define Types and Contracts
- **Target File:** `services/auth/src/types/auth.types.ts`
- **Actions:**
  - Define `OnboardingResult` returning `{ success: true, user: SanitizedUser, session: { accessToken, refreshToken, expiresIn } }`.
  - Add `ALREADY_ONBOARDED` to `AuthErrorCode`.

### Step 2: Implement Onboarding Authentication Middleware
- **Target File:** `services/auth/src/middleware/auth.middleware.ts`
- **Actions:**
  - Implement `createOnboardingAuthMiddleware(userRepo)`.
  - Extract Bearer token from `Authorization` header.
  - Verify token with `verifyJwtToken<OnboardingTokenPayload>(token, "onboarding")`.
  - Fetch user from `userRepo.findUserById(payload.sub)`.
  - Check account status (`blocked` or `deleted`).
  - Attach `req.user` and `req.tokenPayload`.

### Step 3: Implement Onboarding Service
- **Target File:** `services/auth/src/services/onboarding.service.ts`
- **Actions:**
  - Implement `completeOnboarding(userId, input, context)`.
  - Update user in `userRepo.updateUser`: set `firstName`, `lastName`, `name`, `gender`, `country`, `isOnboarded: true`.
  - Create session in `sessionRepo.createSession` with 30-day expiration and random 32-byte secret hash.
  - Sign 15-minute `accessToken` and 30-day rotating `refreshToken`.
  - Return updated sanitized user and session tokens.

### Step 4: Implement Controller and Routes
- **Target Files:**
  - `services/auth/src/controllers/onboarding.controller.ts`
  - `services/auth/src/routes/onboarding.route.ts`
- **Actions:**
  - Bind `POST /api/auth/onboarding` with `authenticateOnboarding` and `validateRequest({ body: OnboardingProfileSchema })`.
  - Mount under `apiRouter.use("/onboarding", onboardingRouter)`.

### Step 5: Swagger / OpenAPI Documentation
- **Target File:** `services/auth/src/docs/openapi.ts`
- **Actions:**
  - Register `OnboardingResponseSchema`.
  - Register route `POST /api/auth/onboarding` with `BearerAuth` security scheme.

---

## 4. TEST SCENARIOS TO COVER

### A. Unit Tests (`onboarding.service.test.ts`)
1. **Happy Path:** Updates profile fields (`firstName`, `lastName`, `name`, `gender`, `country`), flips `isOnboarded = true`, creates session, issues valid access and refresh tokens.
2. **User Not Found:** Throws 401 `USER_NOT_FOUND`.
3. **Account Blocked:** Throws 403 `ACCOUNT_BLOCKED`.
4. **Account Deleted:** Throws 403 `ACCOUNT_DELETED`.

### B. Route Integration Tests (`onboarding.route.test.ts`)
1. **200 OK:** Valid payload and valid `onboardingToken` completes onboarding and returns active session.
2. **400 Bad Request:** Missing or invalid fields (e.g. empty `firstName`, invalid `gender` enum, or lowercase/invalid `country` code).
3. **401 Unauthorized:** Missing `Authorization` header or token with invalid signature/scope.
4. **401 Unauthorized:** Trying to use an `accessToken` (`scope: "access"`) on the onboarding endpoint (scope mismatch).
5. **403 Forbidden:** Blocked user attempt.

---

## 5. SECURITY SCENARIOS TO COVER

- **Strict Token Scope Enforcement:** Only tokens with `scope: "onboarding"` are accepted. Access tokens or refresh tokens cannot bypass or access onboarding.
- **Payload Sanitization & ISO Constraints:** Two-letter uppercase ISO 3166-1 alpha-2 validation prevents arbitrary strings in the `country` column.
- **Protected Password Hash Exclusion:** User object returned is strictly sanitized, omitting sensitive credentials.
- **OWASP Session Management:** Immediate establishment of cryptographically secure session with token rotation secret.

---

## 6. POST-IMPLEMENTATION WORKFLOW

Execute verification suite:
```bash
pnpm --filter @services/auth typecheck
pnpm --filter @services/auth test
pnpm typecheck
```

---

## 7. RECORD UPDATE INSTRUCTIONS

1. Mark `TASK-06` as `COMPLETED` in [`TASK_LIST.md`](./TASK_LIST.md).
2. Append `TASK-06` record to [`docs/development/IMPLEMENTATION_RECORD.md`](../IMPLEMENTATION_RECORD.md).
3. Refresh `service_auth` progress in [`docs/development/PROGRESS.md`](../PROGRESS.md).
