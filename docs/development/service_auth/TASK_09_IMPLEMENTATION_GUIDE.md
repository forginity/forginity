# TASK IMPLEMENTATION GUIDE: TASK-09 - User Lifecycle & Self-Service Account Deletion API

- **Service:** `services/auth`
- **Status:** `COMPLETED`
- **Task List:** [`./TASK_LIST.md`](./TASK_LIST.md)
- **Record:** [`../IMPLEMENTATION_RECORD.md`](../IMPLEMENTATION_RECORD.md)
- **Progress:** [`../PROGRESS.md`](../PROGRESS.md)
- **Completed Date:** 2026-11-13

---

## 1. SUMMARY & GOAL

Implement the User Lifecycle & Self-Service Account Deletion API for `services/auth`.
Users must be empowered to delete their accounts in compliance with privacy regulations (GDPR/CCPA).
Whenever an account is soft-deleted, the system must **immediately purge all active database sessions** across all devices and products (TrackRide, Admin Portal, etc.) so that the deleted user is instantly logged out everywhere. Additionally, an account recovery/restore mechanism is provided to reactivate previously soft-deleted accounts.

---

## 2. SCOPE OF CHANGES

- **Files to Create:**
  - `services/auth/src/services/user-lifecycle.service.ts`
  - `services/auth/src/services/user-lifecycle.service.test.ts`
  - `services/auth/src/controllers/user-lifecycle.controller.ts`
  - `services/auth/src/routes/user-lifecycle.route.test.ts`

- **Files to Modify:**
  - `services/auth/src/routes/user.route.ts` (Mount `DELETE /me` and `POST /:userId/restore`)
  - `services/auth/src/docs/openapi.ts` (Register `DELETE /api/users/me` and `POST /api/users/{userId}/restore`)
  - `services/auth/src/types/auth.types.ts` (Add lifecycle response types)

---

## 3. STEP-BY-STEP IMPLEMENTATION

### Step 1: Types & Contracts
- Add `DeleteAccountResponse` and `RestoreAccountResponse` contracts to `auth.types.ts`.

### Step 2: Domain Service (`user-lifecycle.service.ts`)
- Implement `deleteOwnAccount(userId: string)`:
  - Validates user exists and is not already deleted.
  - Updates user `status = "deleted"`.
  - Purges all active sessions via `sessionRepository.deleteSessionsByUserId(userId)`.
  - Returns confirmation message.
- Implement `restoreAccount(userId: string)`:
  - Validates user exists.
  - Updates user `status = "active"`.
  - Returns restored user entity.

### Step 3: Controller & Route Integration
- Create `UserLifecycleController`.
- In `user.route.ts`, register:
  - `DELETE /me`: Protected by `authenticate`, calls `deleteOwnAccount`.
  - `POST /:userId/restore`: Calls `restoreAccount`.

### Step 4: Swagger / OpenAPI Documentation
- Register schemas and routes in `openapi.ts`.

### Step 5: Automated Test Verification
- Unit test service logic (`user-lifecycle.service.test.ts`).
- Integration test HTTP endpoints via Supertest (`user-lifecycle.route.test.ts`).

---

## 4. VERIFICATION & TESTS

Execute verification commands:
```bash
pnpm --filter @services/auth typecheck
pnpm --filter @services/auth lint
pnpm --filter @services/auth test
pnpm typecheck
```

---

## 5. SECURITY & GUARDRAILS

- [ ] **Instant Session Invalidation.** Account deletion purges all refresh and access tokens immediately.
- [ ] **No `.env` touched.** Secrets read strictly from `process.env`.
- [ ] **Input validation.** All parameters validated with Zod.

---

## 6. RECORD UPDATE

1. Mark task as `COMPLETED` in [`./TASK_LIST.md`](./TASK_LIST.md).
2. Update the **LAST UPDATE** block and append task row in [`../IMPLEMENTATION_RECORD.md`](../IMPLEMENTATION_RECORD.md).
3. Refresh the component row and overall metrics in [`../PROGRESS.md`](../PROGRESS.md).
