# TASK IMPLEMENTATION GUIDE: TASK-04 - Create & Edit Product Views (Figma Aligned)

- **Service:** `apps/admin` (Component: `web_admin_product_crud`)
- **Status:** `COMPLETED`
- **Task List:** [`./TASK_LIST.md`](./TASK_LIST.md)
- **Record:** [`../IMPLEMENTATION_RECORD.md`](../IMPLEMENTATION_RECORD.md)
- **Progress:** [`../PROGRESS.md`](../PROGRESS.md)
- **Figma Reference:** [Node `283:3228` (Forginity · Add product)](https://www.figma.com/design/sERqI1nBTDZqA6JDZVnRt4/Forginity-Ui?node-id=283-3228)

---

## 1. SUMMARY & GOAL

Implement the Product Creation and Editing workflows in `apps/admin` adhering directly to the approved Figma design ([Node `283:3228`](https://www.figma.com/design/sERqI1nBTDZqA6JDZVnRt4/Forginity-Ui?node-id=283-3228)) and breadcrumb navigation hierarchy (`Workspace > Product > Add product`). 

The implementation wires the form to `@forginity/sdk`'s `useCreateProduct` and `useUpdateProduct` mutations, supporting:
- Full client-side Zod form validation with real-time error messages.
- Automatic slug generation with hyphenated lowercase normalization.
- Atomic initial version definition (`initialVersion: { version, status, changelog }`) during creation.
- Atomic new version track release (`newVersion: { version, status, changelog }`) during updates.
- Structured `ApiError` alert handling with single-click dismiss/retry.
- Automatic TanStack Query cache invalidation (`productCacheKeys.lists()` and `productCacheKeys.detail(id)`) ensuring 0-delay catalog synchronization.

---

## 2. SCOPE OF CHANGES

- **Files to Create:**
  - `apps/admin/lib/validators/product-form.validator.ts` — Authoritative client-side Zod schema for product creation & edit inputs.
  - `apps/admin/components/product-form.tsx` — Reusable, accessible form component implementing Figma card layout, live character counters, and atomic version fields.
  - `apps/admin/app/products/add/page.tsx` — Dedicated Add Product page view with breadcrumb header and back button.
  - `apps/admin/app/products/[id]/edit/page.tsx` — Dedicated Edit Product page view with pre-populated data and UI-stream loading skeleton.

- **Files to Modify:**
  - `docs/development/web_admin_product_crud/TASK_LIST.md` — Set status to `IN_PROGRESS`.

---

## 3. STEP-BY-STEP IMPLEMENTATION PLAN

### Step 1: Form Validation Schema (`product-form.validator.ts`)
- **Target File:** `apps/admin/lib/validators/product-form.validator.ts`
- **Action:** Define `productFormSchema` with Zod:
  ```typescript
  export const productFormSchema = z.object({
    name: z.string().min(2, "Product name must be at least 2 characters").max(100),
    slug: z.string()
      .min(2, "Slug must be at least 2 characters")
      .max(100)
      .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Slug must be lowercase alphanumeric with hyphens"),
    status: z.enum(["active", "beta", "deprecated"]),
    // Optional initial/new version track
    hasVersion: z.boolean().default(true),
    version: z.string()
      .regex(/^\d+\.\d+\.\d+$/, "Version must follow semantic format (e.g. 1.0.0)")
      .optional()
      .or(z.literal("")),
    versionStatus: z.enum(["latest", "active", "deprecated"]).default("latest"),
    changelog: z.string().max(500).optional(),
  })
  ```

### Step 2: Reusable Form Component (`product-form.tsx`)
- **Target File:** `apps/admin/components/product-form.tsx`
- **Action:** Build responsive, dual-card form component matching Figma Node `283:3228`:
  1. **Card 1: Product Settings (`Product settings`)**
     - Field 1: **Product Name** (with real-time character limit counter `x/100`).
     - Field 2: **URL Slug** (auto-populated from Name until manually overridden, with `/` prefix indicator).
     - Field 3: **Lifecycle Status** (Native/custom select: `active`, `beta`, `deprecated`).
     - Status Guidance Box: Dark-accent info callout explaining lifecycle implications.
  2. **Card 2: Release Version Track (`Initial version`)**
     - Checkbox or toggle to include release version track.
     - Semantic version input (`1.0.0`) with character guidance.
     - Release track status selector (`latest`, `active`, `deprecated`).
     - Optional changelog / release notes textarea.
  3. **Bottom Actions Bar**
     - Editing context indicator.
     - "Cancel" button navigating back to `/products`.
     - Coral Sunset "Create product" / "Save changes" submit button with pending spinner state.

### Step 3: Create Product Page View (`apps/admin/app/products/add/page.tsx`)
- **Target File:** `apps/admin/app/products/add/page.tsx`
- **Action:**
  - Wrap in `AppShell` with breadcrumbs: `[{ label: "Workspace" }, { label: "Product", href: "/products" }, { label: "Add product" }]`.
  - Add back navigation: `← Back to products`.
  - Bind form to `@forginity/sdk`'s `useCreateProduct()` hook.
  - On submit: pass `{ name, slug, status, initialVersion: { version, status: versionStatus, changelog } }`.
  - On success: router pushes to `/products` and invalidates product list cache.
  - On failure: render `QueryErrorState` banner with server error details.

### Step 4: Edit Product Page View (`apps/admin/app/products/[id]/edit/page.tsx`)
- **Target File:** `apps/admin/app/products/[id]/edit/page.tsx`
- **Action:**
  - Wrap in `AppShell` with dynamic breadcrumb: `Workspace > Product > [Product Name] > Edit`.
  - Add back navigation: `← Back to product details`.
  - Fetch existing record with `useProduct(id, { versionList: true })`.
  - Display UI-stream skeleton during initial data fetch.
  - Pre-populate form with current product name, slug, and status.
  - Allow specifying a `newVersion` payload during update.
  - Bind to `useUpdateProduct()` hook with automatic cache invalidation for both the single item and lists.

---

## 4. VERIFICATION & TESTS

Execute verification suite:
```bash
# 1. Typecheck the admin package
pnpm --filter @web/admin typecheck

# 2. Linting
pnpm --filter @web/admin lint

# 3. Production build (verifying static generation & route resolution)
pnpm --filter @web/admin build

# 4. Verify SDK tests still pass 100%
pnpm --filter @forginity/sdk test
```

### Test Scenarios to Validate
- **Happy Path Creation:** Submitting valid name, slug, and initial version (e.g., `TrackRide`, `trackride`, `1.0.0`) creates the product and redirects to `/products`.
- **Auto-slug Behavior:** Typing "Piky Rider Fleet" automatically generates "piky-rider-fleet" in the slug input.
- **Slug Validation Failure:** Entering uppercase letters or spaces in the slug triggers immediate validation error without hitting the server.
- **Atomic Version Payload:** Inspecting the network request confirms `initialVersion` is bundled into the single `POST /api/products` call.
- **Error Banner Handling:** Simulating a duplicate slug (409 Conflict) renders clean error banner without page crash.
- **Responsive Adaptation:** Verified on mobile (375px), tablet (768px), and desktop (1440px).

---

## 5. SECURITY & GUARDRAILS

- [ ] **No `.env` touched.** Secrets read strictly from `process.env`.
- [ ] **Input validation.** All client inputs strictly verified through Zod schema before network dispatch.
- [ ] **No barrel exports.** Imports directly target authoritative source files.
- [ ] **Single typography.** Lexend font used exclusively across all form elements and labels.

---

## 6. RECORD UPDATE INSTRUCTIONS

Upon completing verification:
1. Mark `TASK-04` as `COMPLETED` in [`./TASK_LIST.md`](./TASK_LIST.md).
2. Update **LAST UPDATE** block and append `TASK-04` row in [`../IMPLEMENTATION_RECORD.md`](../IMPLEMENTATION_RECORD.md).
3. Refresh `web_admin_product_crud` row and overall progress metrics in [`../PROGRESS.md`](../PROGRESS.md).
