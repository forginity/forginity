# TASK IMPLEMENTATION GUIDE: TASK-01 - Scaffold @forginity/sdk Package Foundation & Core HTTP Client

- **Service:** `packages/sdk` (Component: `web_admin_product_crud`)
- **Status:** `COMPLETED`
- **Task List:** [`./TASK_LIST.md`](./TASK_LIST.md)
- **Record:** [`../IMPLEMENTATION_RECORD.md`](../IMPLEMENTATION_RECORD.md)
- **Progress:** [`../PROGRESS.md`](../PROGRESS.md)

---

## 1. SUMMARY & GOAL

Initialize the shared client SDK package (`packages/sdk` under `@forginity/sdk`) in the Forginity monorepo workspace.
Establish the foundational HTTP layer using Axios with extensible request interceptors (auth token injection, correlation IDs) and response interceptors (unwrapping and normalizing server errors into standardized `ApiError` shapes), preparing a scalable foundation for multi-product data access.

---

## 2. SCOPE OF CHANGES

- **Files to Create:**
  - `packages/sdk/package.json` - Package manifest with pnpm workspace dependencies (`axios`, `@tanstack/react-query`).
  - `packages/sdk/tsconfig.json` - TypeScript configuration inheriting from `@workspace/typescript-config`.
  - `packages/sdk/src/core/api-error.ts` - Standardized `ApiError` domain class and error payload contract.
  - `packages/sdk/src/core/http-client.ts` - Configured Axios instance with request and response interceptors.
  - `packages/sdk/src/core/query-client.ts` - TanStack Query default configuration presets for web and admin apps.
  - `packages/sdk/src/core/http-client.test.ts` - Unit tests verifying error normalization and request configuration.

- **Out of Scope:**
  - Domain-specific product methods and hooks (covered in `TASK-02`).
  - Next.js Admin UI table integration (covered in `TASK-03`).

---

## 3. STEP-BY-STEP IMPLEMENTATION

### Step 1: Scaffold Package Configuration & Workspace Link
- **Target Files:** `packages/sdk/package.json`, `packages/sdk/tsconfig.json`
- **Action:** Define package name `@forginity/sdk`, ESM module resolution, script commands (`typecheck`, `test`), and install dependencies (`axios`, `@tanstack/react-query`).

### Step 2: Implement Standardized `ApiError`
- **Target File:** `packages/sdk/src/core/api-error.ts`
- **Action:** Create `ApiError` extending `Error` with `status: number`, `code?: string`, `details?: unknown`, and helper method `isApiError(err)`.

### Step 3: Implement Core Axios Client & Interceptors
- **Target File:** `packages/sdk/src/core/http-client.ts`
- **Action:**
  - Instantiate Axios client with configurable `baseURL` (resolving from `process.env.NEXT_PUBLIC_API_URL` or fallback).
  - Add request interceptor for bearer token attachment and tracing headers.
  - Add response interceptor mapping Axios errors to `ApiError` instances without leaking internal stack traces.

### Step 4: Implement Query Client Defaults
- **Target File:** `packages/sdk/src/core/query-client.ts`
- **Action:** Export `createDefaultQueryClient()` configuring optimal caching defaults (`staleTime: 5 mins`, `retry: 1`, `refetchOnWindowFocus: false`).

### Step 5: Unit Test Core HTTP Layer
- **Target File:** `packages/sdk/src/core/http-client.test.ts`
- **Action:** Write Vitest unit tests verifying that 4xx/5xx network errors properly unwrap into structured `ApiError` objects and request interceptors properly attach custom headers.

---

## 4. VERIFICATION & TESTS

Execute verification commands:
```bash
pnpm --filter @forginity/sdk typecheck
pnpm --filter @forginity/sdk test
```

Test scenarios to cover:
- **Happy Path:** Axios client successfully executes GET/POST calls and returns typed responses.
- **Error Normalization:** 400 Bad Request and 500 Internal Error responses are intercepted and transformed into structured `ApiError` instances.
- **Request Interception:** Dynamic auth headers are properly injected when auth tokens exist.

---

## 5. SECURITY & GUARDRAILS

- [ ] **No `.env` touched.** Secrets read strictly from `process.env`.
- [ ] **No barrel exports.** Imports directly target authoritative source files (e.g. `@forginity/sdk/core/http-client.js`).
- [ ] **No token leakage.** Auth headers sanitized in error logs.

---

## 6. RECORD UPDATE INSTRUCTIONS

Upon completing verification:
1. Mark `TASK-01` as `COMPLETED` in [`./TASK_LIST.md`](./TASK_LIST.md).
2. Update **LAST UPDATE** block and append `TASK-01` row in [`../IMPLEMENTATION_RECORD.md`](../IMPLEMENTATION_RECORD.md).
3. Refresh `web_admin_product_crud` row and overall metrics in [`../PROGRESS.md`](../PROGRESS.md).
