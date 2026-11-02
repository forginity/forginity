# TASK IMPLEMENTATION GUIDE: TASK-03 - Integrate SDK in apps/admin & Build Product Catalog Table

- **Service:** `apps/admin` (Component: `web_admin_product_crud`)
- **Status:** `COMPLETED`
- **Task List:** [`./TASK_LIST.md`](./TASK_LIST.md)
- **Record:** [`../IMPLEMENTATION_RECORD.md`](../IMPLEMENTATION_RECORD.md)
- **Progress:** [`../PROGRESS.md`](../PROGRESS.md)

---

## 1. SUMMARY & GOAL

Connect `apps/admin` to `@forginity/sdk` and implement the production-grade administrative Product Catalog Table at `apps/admin/app/products/page.tsx`.
The view strictly adheres to **UI-Stream Psychology & Universal Responsiveness**:
- Synchronous layout paint with zero Content Layout Shift (CLS = 0.00) using pixel-perfect skeleton primitives.
- Mobile, tablet, and desktop viewport adaptation (responsive KPI grid, touch-friendly horizontal table scroll, responsive header actions).
- Common query error handling with retry capability (`QueryErrorState`).
- Clean empty states for non-matching searches (`ProductTableEmptyState`).
- Live KPI metrics and lifecycle tab filtering (`all`, `active`, `beta`, `deprecated`).

---

## 2. SCOPE OF CHANGES

- **Files to Modify:**
  - `apps/admin/package.json` - Add `"@forginity/sdk": "workspace:*"`.
  - `apps/admin/app/layout.tsx` - Mount `<QueryProvider>`.
  - `apps/admin/app/products/page.tsx` - Replace static mock data with `@forginity/sdk`'s `useProducts()`, responsive UI-Stream state machine, debounced search, status tabs, and dynamic KPI metric calculations.

- **Files to Create:**
  - `apps/admin/providers/query-provider.tsx` - Client wrapper configuring `createDefaultQueryClient()`.
  - `apps/admin/components/query-error-state.tsx` - Reusable error boundary component matching Coral Sunset dark theme.
  - `apps/admin/app/products/product-table-skeleton.tsx` - Pixel-perfect skeleton matching exact row height (70px) and column distribution.
  - `apps/admin/app/products/product-table-empty-state.tsx` - Clean zero-results feedback component with filter reset action.

---

## 3. STEP-BY-STEP IMPLEMENTATION

### Step 1: Link `@forginity/sdk` in `apps/admin`
- **Target File:** `apps/admin/package.json`
- **Action:** Add `"@forginity/sdk": "workspace:*"` and run `pnpm install`.

### Step 2: Implement `QueryProvider`
- **Target File:** `apps/admin/providers/query-provider.tsx`
- **Action:** Create client component wrapping children in `QueryClientProvider` using `createDefaultQueryClient()`. Mount in `apps/admin/app/layout.tsx`.

### Step 3: Implement Common Error State
- **Target File:** `apps/admin/components/query-error-state.tsx`
- **Action:** Build reusable alert card displaying `ApiError` message and status code, with a single-click "Retry" button.

### Step 4: Implement UI-Stream Skeletons & Empty States
- **Target Files:**
  - `apps/admin/app/products/product-table-skeleton.tsx`
  - `apps/admin/app/products/product-table-empty-state.tsx`
- **Action:** Build responsive skeletons matching 70px rows, column widths, and responsive KPI grid.

### Step 5: Wire Products Catalog Page
- **Target File:** `apps/admin/app/products/page.tsx`
- **Action:**
  - Wire `useProducts({ search, status })` from `@forginity/sdk`.
  - Compute live KPI metrics dynamically from backend data.
  - Implement debounced text search (300ms).
  - Bind lifecycle tabs (`All`, `Active`, `Beta`, `Deprecated`) to backend query state.
  - Implement full responsive wrapper (`overflow-x-auto min-w-[850px]`).

---

## 4. VERIFICATION & TESTS

Execute verification commands:
```bash
pnpm --filter @web/admin typecheck
pnpm --filter @web/admin lint
pnpm --filter @web/admin build
```

Test scenarios to cover:
- **Streaming State:** Skeletons render immediately with zero visual shift when live data loads.
- **Search & Filtering:** Real-time text search and tab changes update table rows.
- **Error State:** Network error renders `QueryErrorState` with retry button.
- **Empty State:** Nonexistent search string renders `ProductTableEmptyState`.
- **Responsiveness:** Validated on mobile (375px), tablet (768px), and desktop (1440px).

---

## 5. SECURITY & GUARDRAILS

- [ ] **No `.env` touched.** Secrets read strictly from `process.env`.
- [ ] **No barrel exports.** Imports directly target authoritative files (`@forginity/sdk/modules/products/products.hooks.js`).
- [ ] **Single font rule.** Exclusively use Lexend typography.

---

## 6. RECORD UPDATE INSTRUCTIONS

Upon completing verification:
1. Mark `TASK-03` as `COMPLETED` in [`./TASK_LIST.md`](./TASK_LIST.md).
2. Update **LAST UPDATE** block and append `TASK-03` row in [`../IMPLEMENTATION_RECORD.md`](../IMPLEMENTATION_RECORD.md).
3. Refresh `web_admin_product_crud` row and overall metrics in [`../PROGRESS.md`](../PROGRESS.md).
