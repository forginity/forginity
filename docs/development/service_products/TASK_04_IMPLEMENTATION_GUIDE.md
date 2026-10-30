# TASK IMPLEMENTATION GUIDE: TASK-04 - Database Seeding, DB-Backed Health Checks, and Live Database CRUD Tests

- **Service:** `services/products`
- **Status:** `COMPLETED`
- **Task List:** [`./TASK_LIST.md`](./TASK_LIST.md)
- **Record:** [`./IMPLEMENTATIONS_RECORD.md`](./IMPLEMENTATIONS_RECORD.md)

---

## 1. SUMMARY & GOAL

1. **Database Seeding (`seed.ts`):** Provide an independent script for seeding default/common platform products (`project_1` and `project_2`) directly into PostgreSQL, decoupled completely from tests.
2. **Database-Backed Health & Readiness (`/api/health`):** Enhance the health check route to verify service uptime and active database connectivity (`SELECT 1`), returning `200 OK` when healthy and `503 Service Unavailable` when disconnected.
3. **Real Database CRUD Test Suite:** Build integration test cases executing the complete real database CRUD lifecycle (`Add -> Get -> Edit -> Delete`) with pre-execution connectivity verification and automatic teardown.

---

## 2. SCOPE OF CHANGES

- **Files Created:**
  - `services/products/src/db/connection.ts` (Database connectivity probe utility)
  - `services/products/src/db/seed.ts` (Independent seed script for `project_1` and `project_2`)
  - `services/products/src/db/connection.test.ts` (Unit tests verifying ping probe, error throwing, and client check)
  - `services/products/src/repositories/product.repository.test.ts` (Real database CRUD test suite: Add -> Get -> Edit -> Delete)
- **Files Modified:**
  - `services/products/src/routes/health.route.ts` (Added DB connectivity verification; returns 200 or 503)
  - `services/products/src/routes/products.route.test.ts` (Added tests for health endpoint connected/disconnected states)
  - `services/products/package.json` (Added `"db:seed": "tsx src/db/seed.ts"`, fixed build script)
  - `services/products/src/index.ts` (Exported connectivity and seed utilities)
  - `services/products/src/repositories/product.repository.ts` (Added `checkConnection` helper)
  - `docs/development/service_products/README.md`
  - `docs/development/service_products/TASK_LIST.md`
  - `docs/development/service_products/IMPLEMENTATIONS_RECORD.md`

---

## 3. STEP-BY-STEP IMPLEMENTATION

### Step 1: Database Connectivity Check Utility
- **Target File:** `services/products/src/db/connection.ts`
- **Action:**
  - Implement `checkDatabaseConnection(targetDb)` executing `SELECT 1`.
  - Throw explicit `Error("Database connection failed: <message>")` if uninitialized or unreachable.

### Step 2: Database-Backed Health Check
- **Target File:** `services/products/src/routes/health.route.ts`
- **Action:**
  - Invoke `checkDatabaseConnection()` inside `GET /api/health`.
  - When connected: return `200 OK` with `{ status: "ok", service: "products", database: "connected", timestamp, uptime }`.
  - When disconnected: return `503 Service Unavailable` with `{ status: "error", service: "products", database: "disconnected", error, timestamp, uptime }`.

### Step 3: Default Product Seed Script (Decoupled from Tests)
- **Target File:** `services/products/src/db/seed.ts`
- **Action:**
  - Validate DB connection before execution.
  - Insert or update foundational records `project-1` (`project_1`) and `project-2` (`project_2`).
  - Decoupled from the test suite; executed solely via `pnpm --filter @services/products db:seed`.

### Step 4: Real Database CRUD Lifecycle Tests
- **Target File:** `services/products/src/repositories/product.repository.test.ts`
- **Action:**
  - Before tests run, assert `ProductRepository.checkConnection()`; throws if DB is unreachable.
  - **1. Add (Create):** Insert test record in the real database with unique timestamped slug.
  - **2. Get (Read):** Query and verify record by both `id` and `slug`.
  - **3. Edit (Update):** Mutate fields and verify changes persist in PostgreSQL.
  - **4. Delete:** Remove product by `id` and verify `findById` returns `null`.
  - Ensure automated cleanup in `afterAll`.

---

## 4. VERIFICATION & TESTS

Execute verification suite:
```bash
pnpm --filter @services/products typecheck
pnpm --filter @services/products build
pnpm --filter @services/products test
```

Test Results:
- **`src/repositories/product.repository.test.ts`:** 6 passing tests confirming live DB connectivity and sequential CRUD execution (`Add -> Get -> Edit -> Delete`).
- **`src/routes/products.route.test.ts`:** 14 passing tests including connected (200) and disconnected (503) `/api/health` checks.
- **`src/db/connection.test.ts`:** 3 passing tests for probe behaviors.
- **`src/services/product.service.test.ts`:** 10 passing tests for domain business logic.
- **Total:** 33 passing tests across 4 suites.

---

## 5. SECURITY & GUARDRAILS

- [x] **No `.env` touched.** Secrets read strictly from `process.env`.
- [x] **SQL parameterization.** Seed and repository queries utilize Drizzle ORM builders.
- [x] **Safe test isolation.** Integration test records use unique slugs and are deleted on test teardown.

---

## 6. RECORD UPDATE

1. Updated [`./IMPLEMENTATIONS_RECORD.md`](./IMPLEMENTATIONS_RECORD.md).
2. Status marked `COMPLETED` in [`./TASK_LIST.md`](./TASK_LIST.md).
