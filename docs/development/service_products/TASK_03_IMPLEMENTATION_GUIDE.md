# TASK IMPLEMENTATION GUIDE: TASK-03 - Implement Product, Feature, Maintenance, and Version CRUD APIs & Service Layer

- **Service:** `services/products`
- **Status:** `COMPLETED`
- **Task List:** [`./TASK_LIST.md`](./TASK_LIST.md)
- **Record:** [`./IMPLEMENTATIONS_RECORD.md`](./IMPLEMENTATIONS_RECORD.md)

---

## 1. SUMMARY & GOAL

Implement repository queries, service business logic, and Express HTTP routes for full CRUD operations across products, product features, maintenance windows, and version tracking. Ensure proper error handling, duplicate slug prevention, and automated testing via Vitest and Supertest.

---

## 2. SCOPE OF CHANGES

- **Files Created:**
  - `services/products/src/repositories/product.repository.ts`
  - `services/products/src/services/product.service.ts`
  - `services/products/src/routes/products.route.ts`
  - `services/products/src/services/product.service.test.ts`
  - `services/products/src/routes/products.route.test.ts`

---

## 3. STEP-BY-STEP IMPLEMENTATION

### Step 1: Repository Layer
- Implemented `ProductRepository` in `src/repositories/product.repository.ts` with Drizzle ORM queries for `findMany` (with filtering and pagination count), `findById`, `findBySlug`, `findByIdWithRelations`, `findBySlugWithRelations`, `create`, `update`, and `delete`.
- Implemented CRUD database operations for `productFeatures`, `productMaintenance`, and `productVersions`.

### Step 2: Service Layer
- Implemented `ProductService` in `src/services/product.service.ts`.
- Added duplicate slug validation on creation and update.
- Implemented UUID vs. slug routing logic.
- Managed relational integrity checks when attaching features or maintenance windows.

### Step 3: Express Routes & Controllers
- Built RESTful endpoints under `/api/products` for parent products and nested feature/maintenance/version sub-resources.
- Bound Zod validation middleware to body, query, and path parameters.
- Mapped duplicate slug and resource-not-found errors to appropriate HTTP status codes (`400`, `404`, `409`).

---

## 4. VERIFICATION & TESTS

```bash
pnpm --filter @services/products typecheck
pnpm --filter @services/products test
```

- **Unit Tests:** 10 test scenarios in `src/services/product.service.test.ts` testing pagination, lookup by UUID/slug, relations, slug conflicts, and feature creation.
- **Route Tests:** 7 test scenarios in `src/routes/products.route.test.ts` testing health, list, create, duplicate slug rejection, invalid query params, and 404 responses.
- **Total Passing Tests:** 17 tests across 2 suites.

---

## 5. SECURITY & GUARDRAILS

- [x] **No `.env` touched.** Secrets read strictly from `process.env`.
- [x] **Input sanitization.** All parameters and request bodies validated strictly via Zod schemas.
- [x] **SQL parameterization.** All queries constructed using Drizzle ORM builders.

---

## 6. RECORD UPDATE

1. Logged in [`./IMPLEMENTATIONS_RECORD.md`](./IMPLEMENTATIONS_RECORD.md).
2. Status marked `COMPLETED` in [`./TASK_LIST.md`](./TASK_LIST.md).
