# TASK IMPLEMENTATION GUIDE: TASK-10 - Admin User Management Suite (API & RBAC Authorization)

- **Service / App:** `services/auth` (Microservice)
- **Status:** `COMPLETED`
- **Task List:** [`./TASK_LIST.md`](./TASK_LIST.md)
- **Record:** [`../IMPLEMENTATION_RECORD.md`](../IMPLEMENTATION_RECORD.md)
- **Progress:** [`../PROGRESS.md`](../PROGRESS.md)
- **Completed Date:** 2026-11-13
- **Verified By:** Platform Engineering (Vitest Automated Test Suite: 25 files, 194 passing tests)

---

## 1. SUMMARY & GOAL

Implement the backend administrative user management and moderation suite in `services/auth`.
Platform administrators must be able to list, search, filter, inspect details of, and moderate (`active`, `blocked`, `deleted`) user accounts across all Forginity products.

To protect administrative functionality, a dedicated `userType` column (`varchar(50) NOT NULL DEFAULT 'user'`) is introduced into the `users` table. Access to administrative directory and moderation routes is strictly gated by the `requireAdmin` middleware, enforcing that callers possess `userType === 'admin'`. Non-administrative callers receive a `403 Forbidden` (`FORBIDDEN`) response.

Whenever an administrator blocks or deletes a user, the system **immediately purges all active database sessions and refresh tokens** across all devices and products via `sessionRepository.deleteSessionsByUserId(userId)`, terminating unauthorized access in real time.

> [!NOTE]
> Client SDK query hooks (`@forginity/sdk`) and Admin Web Portal UI (`apps/admin`) are tracked independently under the dedicated Web Admin Auth initiative in `PROGRESS.md`.

---

## 2. SCOPE OF CHANGES

### Backend Architecture & Actor Decoupling
- **Actor-Based Clean Architecture:**
  - **Actor 1: Self-Service End User (`/me` & `/:userId/restore`)**:
    - Service: `services/auth/src/services/user.service.ts` (Consolidated profile management and self-service account deletion)
    - Controller: `services/auth/src/controllers/user.controller.ts`
    - Sub-resource: `services/auth/src/services/emergency-contact.service.ts` & `emergency-contact.controller.ts`
  - **Actor 2: Back-Office Administrator (`/api/users/*`)**:
    - Service: `services/auth/src/services/admin-user.service.ts`
    - Controller: `services/auth/src/controllers/admin-user.controller.ts`
- **Database Schema & Migration:**
  - Added `user_type varchar(50) NOT NULL DEFAULT 'user'` column to `users` table with `users_user_type_idx` index.
- **RBAC Middleware:**
  - Added `requireAdmin` guard checking `req.user.userType === 'admin'`.
- **Files Created:**
  - `services/auth/src/services/user.service.ts` & `user.service.test.ts`
  - `services/auth/src/controllers/user.controller.ts`
  - `services/auth/src/services/admin-user.service.ts` & `admin-user.service.test.ts`
  - `services/auth/src/controllers/admin-user.controller.ts`
  - `services/auth/src/routes/admin-user.route.test.ts`
  - `services/auth/README.md`
- **Files Modified:**
  - `services/auth/src/db/auth.schema.ts` (Added `userType` column and index)
  - `services/auth/src/db/auth.validator.ts` (Added `UserTypeEnum`, `UserDirectoryQuerySchema`, `UpdateUserStatusSchema`)
  - `services/auth/src/types/auth.types.ts` (Extended `AccessTokenPayload`, `CreateUserInput`, `SanitizedUser`, admin directory contracts)
  - `services/auth/src/utils/token.utils.ts` (Embedded `userType` and `role` in JWT access tokens)
  - `services/auth/src/middleware/auth.middleware.ts` (Implemented `requireAdmin` guard)
  - `services/auth/src/repositories/user.repository.ts` (Added `findUsersWithPagination`, `countUsers`, `updateUserStatusById`)
  - `services/auth/src/routes/user.route.ts` (Mounted admin routes with `requireAdmin` guard)
  - `services/auth/src/routes/user.route.test.ts` (Updated mock schemas and asserted self-service boundaries)
  - `services/auth/src/docs/openapi.ts` (Registered routes 21, 22, 23 with 403 Forbidden schemas)
- **Files Removed (Consolidated):**
  - Obsolete `user-profile.service.ts`, `user-profile.controller.ts`, `user-lifecycle.service.ts`, `user-lifecycle.controller.ts`.

---

## 3. IMPLEMENTATION DETAILS

### 3.1 Data Contracts & Zod Schemas (`src/db/auth.validator.ts`)
```ts
export const UserTypeEnum = z.enum(["user", "admin"])
export type UserType = z.infer<typeof UserTypeEnum>

export const UserDirectoryQuerySchema = z.object({
  search: z.string().trim().max(100).optional(),
  status: UserStatusEnum.optional(),
  authProvider: AuthProviderEnum.optional(),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  offset: z.coerce.number().int().min(0).default(0),
})
export type UserDirectoryQueryInput = z.infer<typeof UserDirectoryQuerySchema>

export const UpdateUserStatusSchema = z.object({
  status: UserStatusEnum,
  reason: z.string().trim().max(255).optional(),
})
export type UpdateUserStatusInput = z.infer<typeof UpdateUserStatusSchema>
```

### 3.2 User Repository Extension (`src/repositories/user.repository.ts`)
- `findUsersWithPagination(options)`:
  - Supports optional `search` filter matching case-insensitive `name` or `email` via `ilike(users.email, `%${search}%`)` and `ilike(users.name, `%${search}%`)`.
  - Supports optional `status` filter (`active`, `blocked`, `deleted`).
  - Deterministic ordering by `desc(users.createdAt)` with `limit` and `offset`.
- `countUsers(options)`: Returns total matched rows for pagination metadata.
- `updateUserStatusById(userId, status)`: Updates `users.status` and `users.updatedAt`.

### 3.3 Admin User Domain Service (`src/services/admin-user.service.ts`)
- `listUsers(query: UserDirectoryQueryInput)`:
  - Queries `userRepository.findUsersWithPagination` and `userRepository.countUsers`.
  - Returns sanitized users directory with pagination metadata (`total`, `limit`, `offset`, `hasMore`).
- `getUserDetails(userId: string)`:
  - Fetches target user by UUID; throws 404 `USER_NOT_FOUND` if absent.
  - Queries emergency contacts and active sessions count.
- `updateUserStatus(userId: string, input: UpdateUserStatusInput)`:
  - Updates target user status in database.
  - **Instant Session Invalidation Hook:** If target status is `"blocked"` or `"deleted"`, calls `sessionRepository.deleteSessionsByUserId(userId)` to immediately revoke all active refresh and access tokens across all client devices.

### 3.4 Controller, RBAC Guard & Route Binding
- `requireAdmin` middleware checks `req.user?.userType === 'admin'`. If falsy or non-admin, returns:
  ```json
  {
    "error": "Forbidden: Administrative access required",
    "code": "FORBIDDEN"
  }
  ```
- Admin endpoints mounted on `userRouter`:
  - `GET /api/users`: `requireAdmin`, `validateRequest({ query: UserDirectoryQuerySchema })`, `adminUserController.listUsers`
  - `GET /api/users/:userId`: `requireAdmin`, `validateRequest({ params: UserIdParamSchema })`, `adminUserController.getUserDetails`
  - `PATCH /api/users/:userId/status`: `requireAdmin`, `validateRequest({ params: UserIdParamSchema, body: UpdateUserStatusSchema })`, `adminUserController.updateUserStatus`

---

## 4. VERIFICATION & TEST SUITE

### 4.1 Verification Commands Executed
```bash
# 1. Auth microservice typecheck
pnpm --filter @services/auth typecheck
# Result: 0 errors

# 2. Auth microservice lint
pnpm --filter @services/auth lint
# Result: 0 errors

# 3. Auth microservice test suite
pnpm --filter @services/auth test
# Result: 25 test files passed, 194 tests passed

# 4. Monorepo full typecheck
pnpm typecheck
# Result: 6/6 packages passed
```

### 4.2 Test Coverage Highlights
- **RBAC Enforcement:**
  - Non-admin callers (`userType: 'user'`) attempting to access `GET /api/users`, `GET /api/users/:userId`, or `PATCH /api/users/:userId/status` are blocked with `403 FORBIDDEN`.
  - Admin callers (`userType: 'admin'`) successfully access all administrative endpoints.
- **Directory Search & Pagination:**
  - Case-insensitive search across name and email.
  - Status enum filtering (`active`, `blocked`, `deleted`).
  - Validation rejection of limits > 100.
- **Moderation & Instant Session Revocation:**
  - Updating status to `blocked` purges all active database sessions and returns `revokedSessionsCount`.
  - Updating status to `active` preserves existing sessions.

---

## 5. RECORD UPDATE INSTRUCTIONS

1. Mark `TASK-10` as `COMPLETED` in [`docs/development/service_auth/TASK_LIST.md`](./TASK_LIST.md) (Service completion: 10/10 tasks = **100% COMPLETE**).
2. Update the **LAST UPDATE** block and append task row #27 in [`docs/development/IMPLEMENTATION_RECORD.md`](../IMPLEMENTATION_RECORD.md).
3. Refresh component row #4 and overall metrics in [`docs/development/PROGRESS.md`](../PROGRESS.md).
