# TASK IMPLEMENTATION GUIDE: TASK-07 - Version Control & Release Track Manager

- **Service / Application:** `packages/sdk` & `apps/admin` (Component: `web_admin_product_crud`)
- **Status:** `COMPLETED`
- **Task List:** [`./TASK_LIST.md`](./TASK_LIST.md)
- **Record:** [`../IMPLEMENTATION_RECORD.md`](../IMPLEMENTATION_RECORD.md)
- **Progress:** [`../PROGRESS.md`](../PROGRESS.md)
- **Figma Reference:** [Node `283:3769` (Versions Table) & Node `283:3761` (Latest Version Card)](https://www.figma.com/design/sERqI1nBTDZqA6JDZVnRt4/Forginity-Ui?node-id=283-3769)

---

## 1. SUMMARY & GOAL

Build the Version Control & Release Track Manager interface within the Forginity Admin Console (`apps/admin`) and extend the client SDK (`@forginity/sdk`) with complete version mutation hooks.

Currently, the Product Details view ([`/products/[id]`](file:///home/vikas/Documents/forginity/apps/admin/app/products/[id]/page.tsx)) renders a read-only view of version history. This task delivers interactive version management:
- Empower administrators to register new semantic versions (`v1.2.0`, `2.0.0`) directly from the product details screen.
- Modify version lifecycle statuses (`latest`, `supported`, `deprecated`) to promote releases or sunset legacy builds.
- Document and update release availability notes and changelogs.
- Provide safe version removal workflows with user confirmation.
- Execute automatic React Query cache invalidation across product details, version registries, and product lists.

---

## 2. SCOPE OF CHANGES

- **Files to Create:**
  - `apps/admin/lib/validators/version-form.validator.ts` — Authoritative client-side Zod validation schema for version registration and updates (`version`, `status`, `changelog`).
  - `apps/admin/components/version-dialog.tsx` — Accessible modal dialog supporting both "Register Version" and "Edit Version" modes with Coral Sunset tokens and responsive layout.

- **Files to Modify:**
  - `packages/sdk/src/modules/products/products.hooks.ts` — Export `useUpdateProductVersion` and `useDeleteProductVersion` mutation hooks with query cache invalidation.
  - `packages/sdk/src/modules/products/products.hooks.test.ts` — Add test coverage verifying `useUpdateProductVersion` and `useDeleteProductVersion`.
  - `apps/admin/app/products/[id]/page.tsx` — Add "Register version" action button to the Versions panel header, and integrate row action buttons (Edit, Delete) on each version row.
  - `docs/development/web_admin_product_crud/TASK_LIST.md` — Transition `TASK-07` status to `IN_PROGRESS`.

---

## 3. STEP-BY-STEP IMPLEMENTATION PLAN

### Step 1: Add Version Mutation Hooks in `@forginity/sdk`
- **Target File:** `packages/sdk/src/modules/products/products.hooks.ts`
- **Action:**
  - Export `useUpdateProductVersion`:
    ```typescript
    export function useUpdateProductVersion(productId: string) {
      const queryClient = useQueryClient()
      return useMutation({
        mutationFn: ({ versionId, payload }: { versionId: string; payload: UpdateProductVersionInput }) =>
          ProductsService.updateVersion(versionId, payload),
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: productCacheKeys.versions(productId) })
          queryClient.invalidateQueries({ queryKey: productCacheKeys.detail(productId) })
        },
      })
    }
    ```
  - Export `useDeleteProductVersion`:
    ```typescript
    export function useDeleteProductVersion(productId: string) {
      const queryClient = useQueryClient()
      return useMutation({
        mutationFn: (versionId: string) =>
          ProductsService.deleteVersion(versionId),
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: productCacheKeys.versions(productId) })
          queryClient.invalidateQueries({ queryKey: productCacheKeys.detail(productId) })
        },
      })
    }
    ```

### Step 2: Add Version Mutation Unit Tests
- **Target File:** `packages/sdk/src/modules/products/products.hooks.test.ts`
- **Action:**
  - Add assertions verifying `useUpdateProductVersion` and `useDeleteProductVersion` are exported as functions.
  - Run `pnpm --filter @forginity/sdk test` to ensure all tests pass.

### Step 3: Define Client Validation Schema in `apps/admin`
- **Target File:** `apps/admin/lib/validators/version-form.validator.ts`
- **Action:**
  - Create Zod validation schema matching backend constraints in `services/products`:
    ```typescript
    import { z } from "zod"

    export const versionFormSchema = z.object({
      version: z
        .string()
        .min(1, "Version is required")
        .max(50, "Version cannot exceed 50 characters")
        .regex(
          /^v?[0-9]+(\.[0-9]+)*(-[a-zA-Z0-9.]+)?$/,
          "Version must follow semantic format (e.g. '1.0.0' or 'v2.1.0-beta')"
        ),
      status: z.enum(["latest", "supported", "deprecated"]).default("latest"),
      changelog: z.string().max(500, "Changelog cannot exceed 500 characters").optional(),
    })

    export type VersionFormValues = z.infer<typeof versionFormSchema>
    ```

### Step 4: Build Reusable Version Dialog (`version-dialog.tsx`)
- **Target File:** `apps/admin/components/version-dialog.tsx`
- **Action:**
  - Implement accessible modal dialog using `@workspace/ui/components/dialog` and Coral Sunset styling.
  - Support both **Create** ("Register version") and **Edit** ("Edit version") modes.
  - Input fields:
    - Semantic Version string (`version`) with live format hint.
    - Status selector (`status`: `latest`, `supported`, `deprecated`).
    - Availability / Changelog note textarea (`changelog`) with live character counter (`x/500`).
  - Wire to `useCreateProductVersion` or `useUpdateProductVersion`.
  - Handle loading spinners and inline validation errors.

### Step 5: Enhance Versions Card in Product Details View
- **Target File:** `apps/admin/app/products/[id]/page.tsx`
- **Action:**
  - Add "Register version" action button in the Versions Card header alongside the version count.
  - Add table column `Actions` with:
    - Edit button: opens `VersionDialog` pre-filled with the version data.
    - Delete button: executes `useDeleteProductVersion` with confirmation prompt.
  - Ensure the table remains responsive across mobile and tablet with `overflow-x-auto`.

---

## 4. VERIFICATION & TESTS

Execute the comprehensive monorepo verification suite:

```bash
# 1. Verify SDK types and unit tests
pnpm --filter @forginity/sdk test
pnpm --filter @forginity/sdk typecheck

# 2. Verify Admin frontend typecheck, linting, and build
pnpm --filter admin typecheck
pnpm --filter admin lint
pnpm --filter admin build
```

### Test Scenarios to Cover:
1. **Happy Path - Register Version:**
   - Input valid semver string (`1.1.0`), select status `latest`, enter release notes.
   - Submit -> version creates -> dialog closes -> table and latest version card refresh immediately.
2. **Input Validation Failure:**
   - Input invalid semver string (e.g. `invalid-ver`) -> form displays inline error: `"Version must follow semantic format"`.
   - Empty version string -> displays `"Version is required"`.
3. **Updating Version Track:**
   - Change a version from `latest` to `deprecated` -> updates immediately with proper status pill color.
4. **Deleting Version:**
   - Delete a version with confirmation -> row disappears from version history table.

---

## 5. SECURITY & GUARDRAILS

- [ ] **No `.env` touched:** Secrets read strictly from `process.env`.
- [ ] **Type-First Architecture:** Derive all contracts from authoritative Zod schemas.
- [ ] **No Barrel Exports:** Direct imports from specific module source files.
- [ ] **Input Sanitization:** Client inputs parsed through Zod before network submission.
- [ ] **Zero CLS Principle:** Skeletons accurately mirror resolved card and table geometries.
- [ ] **Read-Only Git Operations:** No mutating git commands.

---

## 6. RECORD UPDATE INSTRUCTIONS

Upon completing verification:
1. Mark `TASK-07` as `COMPLETED` in [`./TASK_LIST.md`](./TASK_LIST.md).
2. Update the **LAST UPDATE** block and append task row in [`../IMPLEMENTATION_RECORD.md`](../IMPLEMENTATION_RECORD.md).
3. Refresh the component row and overall metrics in [`../PROGRESS.md`](../PROGRESS.md).
