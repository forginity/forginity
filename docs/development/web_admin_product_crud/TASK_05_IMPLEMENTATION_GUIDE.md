# TASK IMPLEMENTATION GUIDE: TASK-05 - Product Deletion & Permanent Purge Workflow (Figma Aligned)

- **Service:** `apps/admin` (Component: `web_admin_product_crud`)
- **Status:** `COMPLETED`
- **Task List:** [`./TASK_LIST.md`](./TASK_LIST.md)
- **Record:** [`../IMPLEMENTATION_RECORD.md`](../IMPLEMENTATION_RECORD.md)
- **Progress:** [`../PROGRESS.md`](../PROGRESS.md)
- **Figma Reference:** [Node `283:4004` (Forginity · Delete product)](https://www.figma.com/design/sERqI1nBTDZqA6JDZVnRt4/Forginity-Ui?node-id=283-4004)

---

## 1. SUMMARY & GOAL

Implement the Product Deletion confirmation view and permanent purge workflow in `apps/admin` adhering to Figma Node `283:4004` and breadcrumb hierarchy (`Workspace > Product > [Product Name] > Delete product`).

The workflow safely prompts administrators to confirm deletion with explicit cascade impact disclosure (deleting the product and all associated release versions), executing `useDeleteProduct({ id, options: { confirmation: true } })`, invalidating TanStack Query cache lists, and routing cleanly back to the catalog table at `/products`.

---

## 2. SCOPE OF CHANGES

- **Files to Create:**
  - `apps/admin/app/products/[id]/delete/page.tsx` — Deletion confirmation view with two-column responsive layout, impact summary, and permanent deletion action button.
- **Files to Modify:**
  - `docs/development/web_admin_product_crud/TASK_LIST.md` — Mark `TASK-05` completed.
  - `docs/development/IMPLEMENTATION_RECORD.md` — Append completion log.
  - `docs/development/PROGRESS.md` — Refresh metrics.

---

## 3. STEP-BY-STEP IMPLEMENTATION

### Step 1: Deletion Confirmation Page
- **Target File:** `apps/admin/app/products/[id]/delete/page.tsx`
- **Action:**
  - Wrap in `AppShell` with dynamic breadcrumb: `Workspace > Product > [Product Name] > Delete product`.
  - Add back navigation: `← Back to product` (`/products/[id]`).
  - Query product details and associated version relations with `useProduct(id, { versionList: true })`.
  - Render dual-column responsive layout matching Figma Node `283:4004`:
    - Left Column: Deletion confirmation card with product name, slug, status, cascade warning notes, "Cancel" button, and red "Delete product" button.
    - Right Column: "Product record" creation date metadata card and "Versions to be deleted" preview list.
  - Bind "Delete product" action to `@forginity/sdk`'s `useDeleteProduct({ id, options: { confirmation: true } })`.
  - On success, redirect to `/products` and invalidate cache.

---

## 4. VERIFICATION & TESTS

Execute verification commands:
```bash
pnpm --filter @web/admin typecheck
pnpm --filter @web/admin lint
pnpm --filter @web/admin build
pnpm --filter @forginity/sdk test
```

Test scenarios covered:
- **Confirmation Safety Requirement:** Deletion requires `{ confirmation: true }` parameter.
- **Cascade Deletion:** Backend cascade deletes all associated versions and maintenance records.
- **Cache Invalidation:** Deletion purges product from `productCacheKeys.lists()` and `productCacheKeys.detail(id)`.
- **Zero CLS Skeleton:** Loading skeleton matches layout dimensions.

---

## 5. SECURITY & GUARDRAILS

- [x] **No `.env` touched.** Secrets read strictly from `process.env`.
- [x] **Input validation.** All inputs parsed through Zod.
- [x] **Confirmation guard.** Destructive operation strictly requires user confirmation.
- [x] **Strict Git Ban.** Read-only git commands only; no commits or pushes.

---

## 6. POST-IMPLEMENTATION VERIFICATION RESULTS

- `pnpm --filter @web/admin typecheck` — 0 errors (clean `tsc --noEmit`).
- `pnpm --filter @web/admin lint` — 0 errors (clean `eslint`).
- `pnpm --filter @web/admin build` — Next.js 16 App Router build compiled 10 routes successfully.
- `pnpm --filter @forginity/sdk test` — 20/20 Vitest unit tests pass.
