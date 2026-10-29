# TASK IMPLEMENTATION GUIDE: TASK-01 - Scaffold services/products Package and Configurations

- **Service:** `services/products`
- **Status:** `COMPLETED`
- **Task List:** [`./TASK_LIST.md`](./TASK_LIST.md)
- **Record:** [`./IMPLEMENTATIONS_RECORD.md`](./IMPLEMENTATIONS_RECORD.md)

---

## 1. SUMMARY & GOAL

Initialize the `@services/products` microservice package within the Turborepo monorepo. Establish core dependencies (`express`, `drizzle-orm`, `pg`, `zod`, `dotenv`), TypeScript compilation configuration, Drizzle ORM configuration, base Express routing structure, and automated testing framework with Vitest and Supertest.

---

## 2. SCOPE OF CHANGES

- **Files Created:**
  - `services/products/package.json`
  - `services/products/tsconfig.json`
  - `services/products/drizzle.config.ts`
  - `services/products/src/app.ts`
  - `services/products/src/index.ts`
  - `services/products/src/routes/index.ts`
  - `services/products/src/routes/health.route.ts`
  - `services/products/src/middleware/validate.middleware.ts`

---

## 3. STEP-BY-STEP IMPLEMENTATION

### Step 1: Package Scaffolding & Configuration
- Set up `package.json` with scripts for `dev`, `build`, `typecheck`, `test`, and Drizzle CLI workflows (`db:generate`, `db:migrate`, `db:studio`).
- Set up strict TypeScript compiler options in `tsconfig.json`.
- Configure `drizzle.config.ts` targeting PostgreSQL with schema path `./src/db/products.schema.ts`.

### Step 2: Express Bootstrap & Health Route
- Set up Express app in `src/app.ts` with JSON body parser and global error handler.
- Mount `/api` base router in `src/routes/index.ts`.
- Implement `GET /api/health` returning service status, timestamp, and process uptime.
- Implement reusable Zod request validation middleware `validateRequest` in `src/middleware/validate.middleware.ts`.

---

## 4. VERIFICATION & TESTS

```bash
pnpm --filter @services/products typecheck
pnpm --filter @services/products test
```

- **Health Check Scenario:** `GET /api/health` returns `200 OK` with `{ status: "ok", service: "products" }`.

---

## 5. SECURITY & GUARDRAILS

- [x] **No `.env` touched.** Secrets read strictly from `process.env`.
- [x] **Express error boundary.** Centralized error handler catches unhandled exceptions and masks stack traces in non-dev environments.

---

## 6. RECORD UPDATE

1. Logged in [`./IMPLEMENTATIONS_RECORD.md`](./IMPLEMENTATIONS_RECORD.md).
2. Status marked `COMPLETED` in [`./TASK_LIST.md`](./TASK_LIST.md).
