# TASK IMPLEMENTATION GUIDE: TASK-04 - Database Seeding and DB Connectivity Check in CRUD Test Suite

- **Service:** `services/products`
- **Status:** `PENDING`
- **Task List:** [`./TASK_LIST.md`](./TASK_LIST.md)
- **Record:** [`./IMPLEMENTATIONS_RECORD.md`](./IMPLEMENTATIONS_RECORD.md)

---

## 1. SUMMARY & GOAL

Build an automated database seed script for `services/products` that seeds two foundational products (`project_1` and `project_2`) into PostgreSQL using Drizzle ORM with idempotent upsert handling. Enhance the CRUD test suite to mandate an active database connectivity check before performing database operations, throwing an explicit error if the database connection cannot be established.

---

## 2. SCOPE OF CHANGES

- **Files to Create:**
  - `services/products/src/db/connection.ts` (Database connectivity check utility)
  - `services/products/src/db/seed.ts` (Database seeding script for `project_1` and `project_2`)
  - `services/products/src/db/connection.test.ts` (Unit test verifying DB connectivity validation and error throwing)
- **Files to Modify:**
  - `services/products/package.json` (Register `"db:seed": "tsx src/db/seed.ts"`)
  - `services/products/src/index.ts` (Export `checkDatabaseConnection`)
  - `services/products/src/repositories/product.repository.ts` / test suites (Integrate DB connectivity check in CRUD test suite)
  - `docs/development/service_products/TASK_LIST.md` (Update task status upon completion)
  - `docs/development/service_products/IMPLEMENTATIONS_RECORD.md` (Log completion record)

---

## 3. STEP-BY-STEP IMPLEMENTATION

### Step 1: Database Connectivity Check Utility
- **Target File:** `services/products/src/db/connection.ts`
- **Action:**
  - Implement and export `checkDatabaseConnection()` function.
  - Execute a lightweight ping query (`sql`SELECT 1``) against Drizzle `db`.
  - If the query fails, times out, or throws, throw an explicit Error:
    ```typescript
    throw new Error(`Database connection failed: ${error.message}`)
    ```
  - Export `checkDatabaseConnection` from `services/products/src/index.ts`.

### Step 2: Idempotent Product Seed Script
- **Target File:** `services/products/src/db/seed.ts`
- **Action:**
  - Import `db`, `products`, and `checkDatabaseConnection`.
  - Validate database connectivity prior to attempting inserts (abort and throw if not connected).
  - Define the two required seed products:
    ```typescript
    const SEED_PRODUCTS = [
      {
        slug: "project-1",
        name: "Project 1",
        status: "active" as const,
      },
      {
        slug: "project-2",
        name: "Project 2",
        status: "active" as const,
      },
    ]
    ```
  - Upsert or conflict-check by `slug` using Drizzle:
    ```typescript
    await db
      .insert(products)
      .values(item)
      .onConflictDoUpdate({
        target: products.slug,
        set: { name: item.name, status: item.status },
      })
    ```
  - Log successful seed counts and execution summary.
  - Add `"db:seed": "tsx src/db/seed.ts"` under `"scripts"` in `services/products/package.json`.

### Step 3: CRUD Test Suite Database Connectivity Verification
- **Target File:** `services/products/src/db/connection.test.ts` and repository/route tests
- **Action:**
  - Add test suite verifying that `checkDatabaseConnection()`:
    1. Resolves successfully when the database connection is healthy.
    2. Explicitly throws an Error (`Database connection failed`) when the database is unreachable or query rejects.
  - In CRUD test scenarios, verify that database connectivity guards trigger before CRUD operations, ensuring tests do not execute against a disconnected database without raising a fatal error.

---

## 4. VERIFICATION & TESTS

Execute verification suite:
```bash
pnpm --filter @services/products typecheck
pnpm --filter @services/products test
```

Test scenarios to cover:
- **DB Connection Success:** Health probe executes `SELECT 1` and confirms connection.
- **DB Connection Failure:** Simulated DB outage or network failure throws descriptive error.
- **Seeding Insertion:** `seed.ts` seeds `project-1` and `project-2` into the database.
- **Seeding Idempotency:** Running `db:seed` multiple times updates existing records without primary/unique key constraint errors.

---

## 5. SECURITY & GUARDRAILS

- [ ] **No `.env` touched.** Secrets read strictly from `process.env`.
- [ ] **SQL parameterization.** Seed and connectivity queries utilize Drizzle ORM query builders.
- [ ] **Safe test isolation.** Unit tests mock connectivity responses; integration tests verify live connectivity gracefully.

---

## 6. RECORD UPDATE

1. Update the **LAST UPDATE** block in [`./IMPLEMENTATIONS_RECORD.md`](./IMPLEMENTATIONS_RECORD.md) with completion timestamp and summary.
2. Add a row to **COMPLETED TASKS** in [`./IMPLEMENTATIONS_RECORD.md`](./IMPLEMENTATIONS_RECORD.md).
3. Mark `TASK-04` as `COMPLETED` in [`./TASK_LIST.md`](./TASK_LIST.md).
