# TASK IMPLEMENTATION GUIDE: TASK-03 - Reusable OTP Service & Transport Engine

- **Service:** `services/auth`
- **Status:** `COMPLETED`
- **Task List:** [`./TASK_LIST.md`](./TASK_LIST.md)
- **Record:** [`../IMPLEMENTATION_RECORD.md`](../IMPLEMENTATION_RECORD.md)
- **Progress:** [`../PROGRESS.md`](../PROGRESS.md)
- **Reference Architecture:** [`services/products`](file:///home/vikas/Documents/forginity/services/products)

---

## 1. SUMMARY & GOAL

Implement a standalone, reusable platform-level **OTP Service and Transport Engine** within `services/auth`.

Rather than coupling OTPs directly to user registration/login screens, this service acts as an agnostic platform primitive keyed by an opaque `requestId` (UUID). It can be leveraged across Forginity for:
1. Unified Passwordless Email Authentication (`TASK-04`)
2. Payment Transaction Confirmations (`services/payment`)
3. Sensitive Profile / Security Step-Up MFA (`TASK-08`)
4. Future International SMS/WhatsApp Delivery ([`v2_vision`](../v2_vision/TASK_LIST.md))

The service generates cryptographically secure 6-digit numeric OTPs, computes timing-safe HMAC-SHA-256 hashes, dispatches them via Nodemailer + Resend SMTP (`smtp.resend.com:465`) using branded Coral Sunset HTML templates, and provides a zero-cost `ConsoleOtpTransport` for development and automated testing.

---

## 2. SCOPE OF CHANGES

- **Files to Create:**
  - `services/auth/src/middleware/validate.middleware.ts` — Generic Zod request validation middleware (body, query, params).
  - `services/auth/src/templates/otp-email.template.ts` — Branded Coral Sunset HTML & plain-text email templates.
  - `services/auth/src/transports/otp-transport.interface.ts` — Pluggable transport interface for dispatch adapters.
  - `services/auth/src/transports/console-otp.transport.ts` — $0.00 zero-network transport for local dev & automated CI tests.
  - `services/auth/src/transports/resend-email.transport.ts` — Production Nodemailer SMTP transport for Resend.
  - `services/auth/src/repositories/otp.repository.ts` — Drizzle ORM queries for `auth_db.otps` keyed by `requestId`.
  - `services/auth/src/services/otp.service.ts` — Standalone OTP generation, HMAC-SHA-256 hashing, timing-safe validation, expiration, and attempt tracking.
  - `services/auth/src/controllers/otp.controller.ts` — Express controller for `/api/auth/otp/send` and `/api/auth/otp/verify`.
  - `services/auth/src/routes/otp.route.ts` — Express route bindings for `/api/auth/otp/send` and `/api/auth/otp/verify`.
  - `services/auth/src/docs/openapi.ts` — OpenAPI 3.0 registration for OTP endpoints.
  - `services/auth/src/services/otp.service.test.ts` — Unit tests for cryptographic OTP logic and attempt limits.
  - `services/auth/src/routes/otp.route.test.ts` — Route integration tests validating 200 OK, 400 Bad Request, 429 Too Many Requests, and OpenAPI docs.

- **Files to Modify:**
  - `services/auth/src/routes/api.router.ts` — Mount `otpRouter` under `/api/auth/otp`.
  - `services/auth/src/app.ts` — Mount Swagger UI at `/api/docs`, raw spec at `/api/docs.json`, and centralized malformed JSON error handling.

---

## 3. STEP-BY-STEP IMPLEMENTATION PLAN

### Step 1: Validation Middleware (`validate.middleware.ts`)
- **Target File:** `services/auth/src/middleware/validate.middleware.ts`
- **Action:**
  - Create standard Express request validator using Zod.
  - Intercept and validate `req.body`, `req.query`, and `req.params`.
  - Return formatted `400 Bad Request` with field-level issues on validation failure.

### Step 2: Coral Sunset Email Template (`otp-email.template.ts`)
- **Target File:** `services/auth/src/templates/otp-email.template.ts`
- **Action:**
  - Render responsive HTML and plain-text email.
  - Apply Forginity dark tokens: `#0C0A09` background, `#18181B` card, `#27272A` borders, `#F97316` / `#FB923C` primary coral accents.
  - Prominent 6-digit OTP code container with `letter-spacing: 10px`, monospace font, and 10-minute expiry warning.

### Step 3: Pluggable Transport Layer
- **Target Files:**
  - `services/auth/src/transports/otp-transport.interface.ts`
  - `services/auth/src/transports/console-otp.transport.ts`
  - `services/auth/src/transports/resend-email.transport.ts`
- **Action:**
  - Define `OtpTransport` interface with `send(options: OtpDeliveryOptions): Promise<OtpDeliveryResult>`.
  - Implement `ConsoleOtpTransport` storing `lastSentOtp` for deterministic test assertions.
  - Implement `ResendEmailTransport` using `nodemailer.createTransport` (`smtp.resend.com:465`, secure `true`, user `resend`, pass from `process.env.RESEND_API_KEY` or `process.env.SMTP_PASS`).
  - Provide `getOtpTransport()` factory falling back to console in test/dev.

### Step 4: OTP Repository Layer (`otp.repository.ts`)
- **Target File:** `services/auth/src/repositories/otp.repository.ts`
- **Action:**
  - Implement Drizzle ORM operations on `auth_db.otps`:
    - `createOtpRecord(input)`: Inserts record, generates UUID `id` (serves as `requestId`).
    - `findOtpById(requestId: string)`: Fetches OTP record by primary key UUID.
    - `findLatestActiveOtpByIdentifier(identifier: string, purpose: string)`: Cooldown rate-limit check.
    - `incrementOtpAttempts(requestId: string)`: Atomically increments attempts counter.
    - `markOtpVerified(requestId: string)`: Sets `verified_at = now()`.

### Step 5: OTP Domain Service (`otp.service.ts`)
- **Target File:** `services/auth/src/services/otp.service.ts`
- **Action:**
  - `sendOtp(params: { identifier, identifierType, purpose })`:
    - Cooldown check: Throws 429 if active OTP dispatched to this identifier within 60 seconds.
    - Generate 6-digit numeric OTP via `crypto.randomInt(100000, 1000000)`.
    - Compute HMAC-SHA-256 hash using server pepper.
    - Persist in `auth_db.otps` with 10-minute expiry and max 3 attempts.
    - Dispatch via `OtpTransport`.
    - Return `{ success: true, requestId: record.id, expiresInSeconds: 600, cooldownSeconds: 60 }`.
  - `verifyOtp(params: { requestId: string, code: string })`:
    - Lookup by `requestId`. If not found, throw 400 Bad Request with `{ error: "Verification request not found. Invalid request ID.", code: "REQUEST_NOT_FOUND" }`.
    - If already verified: throw 400 Bad Request with `{ error: "This verification code has already been used.", code: "ALREADY_VERIFIED" }`.
    - If expired (`new Date() > record.expiresAt`): throw 400 Bad Request with `{ error: "Verification code has expired. Please request a new code.", code: "OTP_EXPIRED", remainingAttempts, maxAttempts }`.
    - If `attempts >= maxAttempts`: throw 400 Bad Request with `{ error: "Maximum verification attempts exceeded. Please request a new code.", code: "MAX_ATTEMPTS_EXCEEDED", remainingAttempts: 0, maxAttempts }`.
    - Timing-safe hash validation (`crypto.timingSafeEqual`):
      - If invalid: increment attempts, throw 400 Bad Request with `{ error: "Invalid verification code.", code: "INVALID_CODE", remainingAttempts, maxAttempts }` or `"MAX_ATTEMPTS_EXCEEDED"`.
      - If valid: mark OTP verified. Return `{ verified: true, requestId, identifier: record.identifier, purpose: record.purpose }`.

### Step 6: OTP Controller & Routes (`otp.controller.ts`, `otp.route.ts`)
- **Target Files:**
  - `services/auth/src/controllers/otp.controller.ts`
  - `services/auth/src/routes/otp.route.ts`
- **Action:**
  - `POST /api/auth/otp/send`: Validates body using `SendOtpSchema`. Returns 200 OK with `requestId`.
  - `POST /api/auth/otp/verify`: Validates body using `VerifyOtpRequestSchema` (`requestId: uuid`, `code: 6-digits`). Returns 200 OK with verification result.
  - Mount router in `api.router.ts`.

### Step 7: Swagger / OpenAPI 3.0 Documentation (`openapi.ts`)
- **Target File:** `services/auth/src/docs/openapi.ts`
- **Action:**
  - Register OpenAPI paths and schemas for `/api/auth/otp/send` and `/api/auth/otp/verify`.
  - Expose interactive Swagger UI at `/api/docs` and raw spec at `/api/docs.json`.

### Step 8: Automated Tests & Verification
- **Target Files:**
  - `services/auth/src/services/otp.service.test.ts`
  - `services/auth/src/routes/otp.route.test.ts`
- **Action:**
  - Verify dispatch, `requestId` issuance, timing-safe verification, attempt decrement, expiry, cooldown rate-limiting, and malformed JSON.

---

## 4. VERIFICATION & TESTS

Execute verification suite:
```bash
pnpm --filter @services/auth typecheck
pnpm --filter @services/auth lint
pnpm --filter @services/auth test
pnpm typecheck
```

### Test Scenarios to Cover:
1. **Happy Path — OTP Send:**
   - POST `/api/auth/otp/send` with `{ identifier: "user@forginity.com", identifierType: "email", purpose: "authentication" }`.
   - Returns 200 OK with `{ success: true, requestId: "<uuid>", expiresInSeconds: 600, cooldownSeconds: 60 }`.
2. **Happy Path — OTP Verify with `requestId`:**
   - POST `/api/auth/otp/verify` with `{ requestId: "<uuid>", code: "123456" }`.
   - Returns 200 OK with `{ verified: true, requestId: "<uuid>", identifier: "user@forginity.com", purpose: "authentication" }`.
3. **Invalid Code Handling:**
   - Submit incorrect 6-digit code -> Returns 400 Bad Request ("Invalid verification code.").
4. **Max Attempts Exceeded:**
   - Fail OTP 3 times -> Returns 400 Bad Request ("Maximum verification attempts exceeded. Please request a new code.").
5. **Expired Code Rejection:**
   - Verify code after 10-minute expiry -> Returns 400 Bad Request ("Verification code has expired. Please request a new code.").
6. **Cooldown Rate Limiting (429):**
   - Request OTP twice within 60 seconds -> Returns 429 Too Many Requests ("Please wait X seconds...").
7. **Malformed Request Handling:**
   - Invalid email or malformed UUID `requestId` -> Returns 400 Bad Request with field-level validation issues.
   - Malformed raw JSON payload -> Returns 400 Bad Request without stack trace.

---

## 5. SECURITY & GUARDRAILS

- [ ] **No `.env` files touched:** Secrets read strictly from `process.env`.
- [ ] **Cryptographic Hash Security:** Raw OTP codes never stored in database; hashed via HMAC-SHA-256 before storage.
- [ ] **Timing-Safe Comparison:** `crypto.timingSafeEqual` prevents timing side-channel attacks.
- [ ] **Rate Limiting & Attempt Caps:** Max 3 verification attempts per OTP; 60-second cooldown per identifier before re-dispatch.
- [ ] **Opaque Request IDs:** Verification is bound to opaque UUID `requestId`, decoupling identity from transport and preventing replay attacks.
- [ ] **No Barrel Exports:** Direct imports from specific module source files.
- [ ] **Read-Only Git Commands:** No mutating git commands executed.

---

## 6. RECORD UPDATE INSTRUCTIONS

Upon completing verification:
1. Mark `TASK-03` as `COMPLETED` in [`./TASK_LIST.md`](./TASK_LIST.md).
2. Update the **LAST UPDATE** block and append task row in [`../IMPLEMENTATION_RECORD.md`](../IMPLEMENTATION_RECORD.md).
3. Refresh the component row and overall metrics in [`../PROGRESS.md`](../PROGRESS.md).
