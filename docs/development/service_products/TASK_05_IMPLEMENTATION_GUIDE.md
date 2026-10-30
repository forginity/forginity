# TASK IMPLEMENTATION GUIDE: TASK-05 - Add Swagger / OpenAPI Documentation with Zod

- **Service:** `services/products`
- **Status:** `PENDING`
- **Task List:** [`./TASK_LIST.md`](./TASK_LIST.md)
- **Record:** [`./IMPLEMENTATIONS_RECORD.md`](./IMPLEMENTATIONS_RECORD.md)

---

## 1. SUMMARY & GOAL

Integrate `@asteasolutions/zod-to-openapi` and `swagger-ui-express` to automatically generate and serve OpenAPI 3.0 documentation for `services/products`. Leverage existing authoritative Zod schemas (`src/db/products.validator.ts`) as the single source of truth for both runtime validation and API documentation. Mount interactive Swagger UI at `GET /api/docs` and expose raw OpenAPI specification at `GET /api/docs.json`.

---

## 2. SCOPE OF CHANGES

- **Files to Create:**
  - `services/products/src/docs/openapi.ts` (OpenAPI registry and document generator)
  - `services/products/src/docs/openapi.test.ts` (Automated tests verifying `/api/docs` and `/api/docs.json`)
- **Files to Modify:**
  - `services/products/package.json` (Add `@asteasolutions/zod-to-openapi`, `swagger-ui-express`, `@types/swagger-ui-express`)
  - `services/products/src/db/products.validator.ts` (Extend Zod with `.openapi()` descriptions and examples)
  - `services/products/src/app.ts` (Mount Swagger UI and JSON endpoints)
  - `docs/development/service_products/TASK_LIST.md` (Update task status upon completion)
  - `docs/development/service_products/IMPLEMENTATIONS_RECORD.md` (Log completion record)

---

## 3. STEP-BY-STEP IMPLEMENTATION

### Step 1: Install Dependencies
- Run:
  ```bash
  pnpm --filter @services/products add @asteasolutions/zod-to-openapi swagger-ui-express
  pnpm --filter @services/products add -D @types/swagger-ui-express
  ```

### Step 2: Extend Zod Schemas with OpenAPI Metadata
- **Target File:** `services/products/src/db/products.validator.ts`
- **Action:**
  - Import `extendZodWithOpenApi` from `@asteasolutions/zod-to-openapi`.
  - Execute `extendZodWithOpenApi(z)`.
  - Enrich `ProductSchema`, `CreateProductSchema`, `UpdateProductSchema`, `IdParamSchema`, `SlugParamSchema`, `CreateProductMaintenanceSchema`, and `CreateProductVersionSchema` with `.openapi()` metadata (descriptions, field examples, and component registration names).

### Step 3: OpenAPI Registry & Specification Generator
- **Target File:** `services/products/src/docs/openapi.ts`
- **Action:**
  - Create `OpenAPIRegistry` instance.
  - Register all API paths:
    - `GET /api/health`
    - `GET /api/products`
    - `GET /api/products/:id`
    - `GET /api/products/slug/:slug`
    - `POST /api/products`
    - `PATCH /api/products/:id`
    - `DELETE /api/products/:id`
    - `GET /api/products/:id/maintenance`
    - `POST /api/products/:id/maintenance`
    - `PATCH /api/products/maintenance/:id`
    - `DELETE /api/products/maintenance/:id`
    - `GET /api/products/:id/versions`
    - `POST /api/products/:id/versions`
    - `PATCH /api/products/versions/:id`
    - `DELETE /api/products/versions/:id`
  - Generate and export `openApiDocument` using `OpenApiGeneratorV3`.

### Step 4: Mount Swagger UI in Express Bootstrap
- **Target File:** `services/products/src/app.ts`
- **Action:**
  - Import `swaggerUi` from `swagger-ui-express` and `openApiDocument` from `./docs/openapi.js`.
  - Mount `app.use("/api/docs", swaggerUi.serve, swaggerUi.setup(openApiDocument))`.
  - Mount `app.get("/api/docs.json", (_req, res) => res.json(openApiDocument))`.

---

## 4. VERIFICATION & TESTS

Execute verification commands:
```bash
pnpm --filter @services/products typecheck
pnpm --filter @services/products build
pnpm --filter @services/products test
```

Test scenarios to cover:
- **Interactive Docs:** `GET /api/docs` returns `200 OK` or `301 Redirect` serving Swagger UI HTML.
- **OpenAPI JSON Endpoint:** `GET /api/docs.json` returns `200 OK` with valid OpenAPI 3.0 specification containing info, paths, and components.
- **Spec Completeness:** All product, version, and maintenance endpoints are present in `paths`.

---

## 5. SECURITY & GUARDRAILS

- [ ] **No `.env` touched.** Secrets read strictly from `process.env`.
- [ ] **No Barrel Exports.** Import schemas, controllers, and generators directly from specific files.
- [ ] **Schema Synchronization.** Documentation contracts derive directly from authoritative Zod schemas to prevent drift.

---

## 6. RECORD UPDATE

1. Update the **LAST UPDATE** block in [`./IMPLEMENTATIONS_RECORD.md`](./IMPLEMENTATIONS_RECORD.md) with completion timestamp and summary.
2. Add a row to **COMPLETED TASKS** in [`./IMPLEMENTATIONS_RECORD.md`](./IMPLEMENTATIONS_RECORD.md).
3. Mark `TASK-05` as `COMPLETED` in [`./TASK_LIST.md`](./TASK_LIST.md).
