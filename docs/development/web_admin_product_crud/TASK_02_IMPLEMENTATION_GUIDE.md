# TASK IMPLEMENTATION GUIDE: TASK-02 - Implement Product Domain SDK (Endpoints, Services & Query Hooks)

- **Service:** `packages/sdk` (Component: `web_admin_product_crud`)
- **Status:** `COMPLETED`
- **Task List:** [`./TASK_LIST.md`](./TASK_LIST.md)
- **Record:** [`../IMPLEMENTATION_RECORD.md`](../IMPLEMENTATION_RECORD.md)
- **Progress:** [`../PROGRESS.md`](../PROGRESS.md)

---

## 1. SUMMARY & GOAL

Implement the comprehensive Product domain within `@forginity/sdk` (`packages/sdk/src/modules/products/`).
This includes authoritative DTO types, endpoint constants, pure asynchronous API services, stable TanStack Query key factories, and query/mutation hooks.
Per system specifications and Figma UI reference (`Forginity · Add product`, `Forginity · Edit product`):
- `createProduct` supports optional atomic `initialVersion` registration.
- `updateProduct` supports optional `newVersion` registration.
- `getProduct` and `getProductBySlug` include a `versionList: boolean` option (defaulting to `true`) which transparently maps to backend relation expansion.
- `deleteProduct` enforces a client-side safety guard (`confirmation: boolean`, defaulting to `false`).

---

## 2. SCOPE OF CHANGES

- **Files to Create:**
  - `packages/sdk/src/constants/endpoints.ts` - Centralized API endpoints registry for Products, Maintenance, and Versions.
  - `packages/sdk/src/modules/products/products.types.ts` - TypeScript contracts for Products, Versions, Maintenance, filters, and composite mutation payloads.
  - `packages/sdk/src/modules/products/products.service.ts` - Pure async methods orchestrating product CRUD, version linking, and deletion guards.
  - `packages/sdk/src/modules/products/products.keys.ts` - Structured TanStack Query cache key factories.
  - `packages/sdk/src/modules/products/products.hooks.ts` - Custom React Query hooks (`useProducts`, `useProduct`, `useProductBySlug`, `useCreateProduct`, `useUpdateProduct`, `useDeleteProduct`, `useProductVersions`).
  - `packages/sdk/src/modules/products/products.service.test.ts` - Vitest unit tests verifying service methods, parameters, and error guards.
  - `packages/sdk/src/modules/products/products.hooks.test.tsx` - Vitest unit tests verifying React Query hooks and cache key invalidation.

- **Out of Scope:**
  - Admin table and drawer UI wiring in `apps/admin` (covered in `TASK-03` and `TASK-04`).

---

## 3. STEP-BY-STEP IMPLEMENTATION

### Step 1: Define API Route Registry
- **Target File:** `packages/sdk/src/constants/endpoints.ts`
- **Action:** Define `API_ENDPOINTS.PRODUCTS` with functions for root, by-ID, by-slug, maintenance, active maintenance, and versions.

### Step 2: Define Authoritative Domain Types & DTOs
- **Target File:** `packages/sdk/src/modules/products/products.types.ts`
- **Action:** Define `Product`, `ProductVersion`, `ProductMaintenance`, `ProductWithRelations`, `ListProductsParams`, `CreateProductPayload`, `UpdateProductPayload`, and `GetProductOptions`.

### Step 3: Implement Pure Product API Service Layer
- **Target File:** `packages/sdk/src/modules/products/products.service.ts`
- **Action:**
  - `list(params)`: Calls `GET /api/products` with query serialization.
  - `getById(id, options)`: Calls `GET /api/products/:id` with `includeRelations = options.versionList !== false`.
  - `getBySlug(slug, options)`: Calls `GET /api/products/slug/:slug`.
  - `create(payload)`: Posts product; if `payload.initialVersion` provided, registers initial version via `POST /api/products/:id/versions`.
  - `update(id, payload)`: Patches product; if `payload.newVersion` provided, registers version via `POST /api/products/:id/versions`.
  - `delete(id, options)`: Validates `options?.confirmation === true` before dispatching `DELETE /api/products/:id`.
  - Sub-resource methods for maintenance and versions.

### Step 4: Implement Query Key Factory & Hooks
- **Target Files:** `packages/sdk/src/modules/products/products.keys.ts`, `packages/sdk/src/modules/products/products.hooks.ts`
- **Action:** Define query keys hierarchy and React Query hooks with automatic cache invalidation on mutations.

### Step 5: Test Verification Suite
- **Target Files:** `packages/sdk/src/modules/products/products.service.test.ts`, `packages/sdk/src/modules/products/products.hooks.test.tsx`
- **Action:** Validate happy paths, version inclusion defaults, mutation composite flows, and deletion confirmation safeguards.

---

## 4. VERIFICATION & TESTS

Execute verification commands:
```bash
pnpm --filter @forginity/sdk typecheck
pnpm --filter @forginity/sdk test
```

Test scenarios to cover:
- **Default Version Inclusion:** `getProductById` calls backend with `includeRelations=true` when `versionList` is omitted or `true`.
- **Version Exclusion:** `getProductById` calls backend without `includeRelations` when `versionList: false`.
- **Atomic Creation:** `createProduct` executes both product creation and initial version creation when `initialVersion` is passed.
- **Atomic Update:** `updateProduct` updates details and registers new version when `newVersion` is passed.
- **Deletion Safety Guard:** `deleteProduct` throws `ApiError` when `confirmation` is `false` or missing without making network calls.
- **Deletion Confirmed:** `deleteProduct` executes `DELETE` when `confirmation: true`.
- **Hook Invalidation:** `useCreateProduct` and `useDeleteProduct` invalidate the product lists cache.

---

## 5. SECURITY & GUARDRAILS

- [ ] **No `.env` touched.** Base URLs resolved through `process.env`.
- [ ] **No barrel exports.** Modules imported directly from authoritative source files.
- [ ] **Confirmation gate.** Destructive actions guarded against accidental execution.

---

## 6. RECORD UPDATE INSTRUCTIONS

Upon completing verification:
1. Mark `TASK-02` as `COMPLETED` in [`./TASK_LIST.md`](./TASK_LIST.md).
2. Update **LAST UPDATE** block and append `TASK-02` row in [`../IMPLEMENTATION_RECORD.md`](../IMPLEMENTATION_RECORD.md).
3. Refresh `web_admin_product_crud` row and overall metrics in [`../PROGRESS.md`](../PROGRESS.md).
