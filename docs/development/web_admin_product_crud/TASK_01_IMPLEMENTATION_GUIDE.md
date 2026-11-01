# TASK IMPLEMENTATION GUIDE: TASK-01 - Product Catalog Table & Status Filtering

- **Service:** `apps/admin` (Component: `web_admin_product_crud`)
- **Status:** `IN_PROGRESS`
- **Task List:** [`./TASK_LIST.md`](./TASK_LIST.md)
- **Record:** [`../IMPLEMENTATION_RECORD.md`](../IMPLEMENTATION_RECORD.md)

---

## 1. SUMMARY & GOAL

Connect the administrative product portfolio table in `apps/admin` to the real backend service (`services/products`).
Implement client-side data fetching, search filtering by name or slug, and status tab filtering (`All`, `Live`, `Maintenance`, `Draft`) with loading skeletons and empty state feedback.

---

## 2. SCOPE OF CHANGES

- **Files to Create:**
  - `apps/admin/lib/api/products.client.ts` - Type-safe API client functions calling `GET /api/products` and handling error boundaries.
  - `apps/admin/types/products.types.ts` - Domain types derived from authoritative product schemas.
- **Files to Modify:**
  - `apps/admin/app/products/page.tsx` - Wire data fetching, active tab filtering, real-time search, and fallback states into the Coral Sunset Figma table.

---

## 3. STEP-BY-STEP IMPLEMENTATION

### Step 1: Define Authoritative Frontend Product Contracts
- **Target File:** `apps/admin/types/products.types.ts`
- **Action:** Define product response contracts, query parameters (search, status, limit, offset), and status enums matching `services/products/src/db/products.validator.ts`.

### Step 2: Implement Type-Safe API Client
- **Target File:** `apps/admin/lib/api/products.client.ts`
- **Action:** Create `fetchProducts` with error handling, URL query serialization, and fallback simulation for local development.

### Step 3: Wire Data Table & Filtering in Products View
- **Target File:** `apps/admin/app/products/page.tsx`
- **Action:**
  - Bind search query input and category/status tabs (`All`, `Active`, `Maintenance`, `Draft`) to reactive state.
  - Display loading skeleton during fetch.
  - Handle empty result states gracefully with actionable "Add Product" prompt.

---

## 4. VERIFICATION & TESTS

Execute verification commands:
```bash
pnpm --filter @web/admin typecheck
pnpm --filter @web/admin lint
pnpm --filter @web/admin build
```

Test scenarios to cover:
- **Happy Path:** Catalog table loads products and displays names, categories, user counts, and statuses.
- **Search Filtering:** Searching by text filters products in real time.
- **Tab Filtering:** Clicking status tabs filters rows to matching lifecycle states.
- **Empty State:** Searching for nonexistent text renders clean empty state message.

---

## 5. SECURITY & GUARDRAILS

- [ ] **No `.env` touched.** Environment variables read exclusively via `process.env`.
- [ ] **Input validation.** Search and query parameters sanitized before URL interpolation.
- [ ] **No barrel exports.** Imports directly target authoritative module files.
- [ ] **Single font rule.** Exclusively use Lexend typography.

---

## 6. RECORD UPDATE INSTRUCTIONS

Upon completing verification:
1. Append `TASK-01` row to `docs/development/IMPLEMENTATION_RECORD.md`.
2. Update **Last Update Record** in `docs/development/IMPLEMENTATION_RECORD.md`.
3. Mark `TASK-01` as `COMPLETED` in `TASK_LIST.md`.
4. Refresh `docs/development/PROGRESS.md`.
