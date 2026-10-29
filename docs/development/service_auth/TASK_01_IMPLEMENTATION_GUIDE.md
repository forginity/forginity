# TASK IMPLEMENTATION GUIDE: TASK-01 - Scaffold services/auth Package and Configurations

- **Service:** `services/auth`
- **Status:** `COMPLETED`
- **Task List:** [`./TASK_LIST.md`](./TASK_LIST.md)
- **Record:** [`./IMPLEMENTATIONS_RECORD.md`](./IMPLEMENTATIONS_RECORD.md)

---

## 1. SUMMARY & GOAL

Initialize the `services/auth` workspace package using `services/products` as an architectural blueprint. Set up standard configuration files (`package.json`, `tsconfig.json`, `drizzle.config.ts`), base Express application bootstrapping, health check routing, and automated test setup.

---

## 2. SCOPE OF CHANGES

- **Files to Create:**
  - `services/auth/package.json`
  - `services/auth/tsconfig.json`
  - `services/auth/drizzle.config.ts`
  - `services/auth/.env.example`
  - `services/auth/src/app.ts`
  - `services/auth/src/index.ts`
  - `services/auth/src/routes/index.ts`
  - `services/auth/src/routes/health.route.ts`
  - `services/auth/src/routes/health.route.test.ts`
- **Files to Modify:**
  - `docs/development/service_auth/TASK_LIST.md`
  - `docs/development/service_auth/IMPLEMENTATIONS_RECORD.md`
  - `pnpm-lock.yaml` (updated via package install)

---

## 3. STEP-BY-STEP IMPLEMENTATION

### Step 1: Package Scaffolding & Configuration

- **Target Files:** `services/auth/package.json`, `services/auth/tsconfig.json`, `services/auth/drizzle.config.ts`, `services/auth/.env.example`
- **Action:**
  - Define `@services/auth` with Express, Drizzle ORM, Zod, pg, and dotenv dependencies matching monorepo conventions.
  - Configure `tsconfig.json` with target `esnext`, module `nodenext`, strict mode, and erasable syntax options.
  - Set up `drizzle.config.ts` pointing to `src/db/auth.schema.ts` and postgresql dialect.
  - Provide safe environment template `.env.example` with dummy values.

### Step 2: Express App & Health Routing

- **Target Files:** `services/auth/src/routes/health.route.ts`, `services/auth/src/routes/index.ts`, `services/auth/src/app.ts`, `services/auth/src/index.ts`
- **Action:**
  - Implement `/api/auth/health` endpoint returning `{ status: "ok", service: "auth", timestamp, uptime }`.
  - Configure `apiRouter` to mount sub-routes prefixed with `/api/auth`.
  - Bootstrap `app.ts` with standard body parsing middleware, root info endpoint (`api: "/api/auth"`, `health: "/api/auth/health"`), centralized error handler, and conditional listener for `NODE_ENV !== "test"`.
  - Export public exports in `src/index.ts`.

### Step 3: Scaffold Unit & Integration Tests

- **Target File:** `services/auth/src/routes/health.route.test.ts`
- **Action:**
  - Implement Supertest + Vitest tests verifying `GET /api/auth/health` returns status 200 with service metadata, root `GET /` fallback responds with `/api/auth` routes, and non-existent endpoints return 404.

---

## 4. VERIFICATION & TESTS

### Execution & Run Commands:

```bash
# Start development server with file watching
pnpm --filter @services/auth dev

# Start service server directly
pnpm --filter @services/auth start
```

### Verification & Automated Test Commands:

```bash
pnpm --filter @services/auth typecheck
pnpm --filter @services/auth lint
pnpm --filter @services/auth test
```

### Manual Testing with cURL:

```bash
# Verify health check endpoint (isolated under /api/auth)
curl -s http://localhost:3001/api/auth/health

# Verify alias health check endpoint
curl -s http://localhost:3001/api/health

# Verify service metadata fallback
curl -s http://localhost:3001/

# Verify 404 handling
curl -s -i http://localhost:3001/api/unknown-endpoint
```

### Test scenarios covered:

- **Happy Path:** `GET /api/auth/health` and `GET /api/health` return 200 with `{ status: "ok", service: "auth" }`.
- **Root Fallback:** `GET /` returns 200 with `{ name: "auth-service", api: "/api/auth", health: "/api/auth/health" }`.
- **404 Route Handling:** `GET /api/unknown-endpoint` and `GET /api/auth/unknown-endpoint` return 404.

---

## 5. SECURITY & GUARDRAILS

- [x] **No `.env` touched.** Secrets read strictly from `process.env`. Only dummy `.env.example` provided.
- [x] **Input validation.** Express body parsers configured with limits; validation layers prepared for upcoming schemas.
- [x] **SQL parameterization.** Drizzle ORM configured for strictly parameterized query construction.

---

## 6. RECORD UPDATE

1. Update the **LAST UPDATE** block in [`./IMPLEMENTATIONS_RECORD.md`](./IMPLEMENTATIONS_RECORD.md) with a two-line summary.
2. Add a row to **COMPLETED TASKS** in [`./IMPLEMENTATIONS_RECORD.md`](./IMPLEMENTATIONS_RECORD.md).
3. Mark task as `COMPLETED` in [`./TASK_LIST.md`](./TASK_LIST.md).
