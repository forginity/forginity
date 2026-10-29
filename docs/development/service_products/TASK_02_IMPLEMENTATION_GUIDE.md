# TASK IMPLEMENTATION GUIDE: TASK-02 - Build Database Schemas, Relations, and Migrations

- **Service:** `services/products`
- **Status:** `COMPLETED`
- **Task List:** [`./TASK_LIST.md`](./TASK_LIST.md)
- **Record:** [`./IMPLEMENTATIONS_RECORD.md`](./IMPLEMENTATIONS_RECORD.md)

---

## 1. SUMMARY & GOAL

Define the PostgreSQL database relational schemas for the products microservice using Drizzle ORM. Build data contracts for `products`, `product_features`, `product_maintenance`, and `product_versions`. Generate initial SQL migration files and create authoritative Zod validation schemas with inferred TypeScript types.

---

## 2. SCOPE OF CHANGES

- **Files Created:**
  - `services/products/src/db/products.schema.ts`
  - `services/products/src/db/products.validator.ts`
  - `services/products/drizzle/20261024150745_nervous_silk_fever/migration.sql`
  - `services/products/drizzle/20261024150745_nervous_silk_fever/snapshot.json`

---

## 3. STEP-BY-STEP IMPLEMENTATION

### Step 1: Drizzle Table Definitions & Relations
- Created `products` table with UUID primary key, unique slug, name, status enum (`alpha`, `beta`, `active`, `deprecated`), and `createdAt` timestamp.
- Created `product_features` table with `productId` foreign key with cascade deletion, feature key, name, and status enum (`enabled`, `disabled`, `beta`).
- Created `product_maintenance` table with `productId` foreign key, `startsAt`, `endsAt`, status enum (`scheduled`, `active`, `completed`, `cancelled`), and message text.
- Created `product_versions` table with `productId` foreign key, version string, and status enum (`latest`, `supported`, `deprecated`).
- Defined explicit relations using `defineRelations` across all entities.

### Step 2: Zod Validator & Type-First Architecture
- Defined schemas in `src/db/products.validator.ts` for UUID params, slug lookups, query filtering, and entity create/update payloads.
- Added validation refinement for maintenance windows requiring `endsAt > startsAt`.
- Exported inferred TypeScript types (`CreateProductInput`, `UpdateProductInput`, etc.).

### Step 3: Migration Generation
- Generated migration files via `drizzle-kit generate` into `drizzle/`.

---

## 4. VERIFICATION & TESTS

```bash
pnpm --filter @services/products typecheck
pnpm --filter @services/products test
```

- **Schema Integrity:** Column definitions, constraints, and indexes validated against TypeScript types.
- **Zod Validation Tests:** Enforces slug regex, required fields, and date comparisons.

---

## 5. SECURITY & GUARDRAILS

- [x] **No `.env` touched.** Secrets read strictly from `process.env`.
- [x] **Strict Type-First Architecture:** External inputs validated before entering database layer.
- [x] **Relational integrity:** Cascade deletes ensure no dangling child records.

---

## 6. RECORD UPDATE

1. Logged in [`./IMPLEMENTATIONS_RECORD.md`](./IMPLEMENTATIONS_RECORD.md).
2. Status marked `COMPLETED` in [`./TASK_LIST.md`](./TASK_LIST.md).
