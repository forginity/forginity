# TASK IMPLEMENTATION GUIDE: TASK-06 - Maintenance Windows Scheduling Interface

- **Service / Application:** `packages/sdk` & `apps/admin` (Component: `web_admin_product_crud`)
- **Status:** `COMPLETED`
- **Task List:** [`./TASK_LIST.md`](./TASK_LIST.md)
- **Record:** [`../IMPLEMENTATION_RECORD.md`](../IMPLEMENTATION_RECORD.md)
- **Progress:** [`../PROGRESS.md`](../PROGRESS.md)

---

## 1. SUMMARY & GOAL

Build the Maintenance Windows Scheduling Interface within the Forginity Admin Console (`apps/admin`) and align the client SDK (`@forginity/sdk`) with `services/products` maintenance contracts. 

This enables administrators to schedule upcoming maintenance downtime, broadcast customer-facing outage notifications, update window timelines, and cancel or complete maintenance windows for any product or platform-wide service. The implementation enforces strict client-side validation using Zod (preventing start times in the past, guaranteeing that end times succeed start times, and requiring explanatory messages), utilizes Coral Sunset dark-theme tokens, provides zero-CLS loading skeletons, and executes automatic React Query cache invalidation across product details, maintenance schedules, and active maintenance queries.

---

## 2. SCOPE OF CHANGES

- **Files to Create:**
  - `apps/admin/lib/validators/maintenance-form.validator.ts` — Authoritative client-side Zod schema validating maintenance creation and update payloads (`startsAt`, `endsAt`, `status`, `message`).
  - `apps/admin/components/maintenance-dialog.tsx` — Accessible modal dialog for scheduling new maintenance windows and modifying existing schedules with Coral Sunset styling.
  - `apps/admin/components/maintenance-panel.tsx` — Responsive card panel embedded in Product Details displaying active and scheduled maintenance windows, timeline badges, status pills, and cancellation actions.
  - `apps/admin/components/maintenance-panel-skeleton.tsx` — Geometric loading skeleton matching the exact height and layout of the maintenance panel for zero Content Layout Shift (CLS = 0.00).

- **Files to Modify:**
  - `packages/sdk/src/modules/products/products.types.ts` — Align `ProductMaintenance`, `CreateProductMaintenanceInput`, and `UpdateProductMaintenanceInput` types with `services/products` schema (`startsAt`, `endsAt`, `status`, `message`).
  - `packages/sdk/src/modules/products/products.hooks.ts` — Add `useUpdateProductMaintenance` and `useDeleteProductMaintenance` mutation hooks with automatic cache invalidation.
  - `packages/sdk/src/modules/products/products.service.test.ts` — Update and extend sub-resource tests for maintenance endpoints and payload structures.
  - `packages/sdk/src/modules/products/products.hooks.test.ts` — Add tests for maintenance mutation hooks (`useCreateProductMaintenance`, `useUpdateProductMaintenance`, `useDeleteProductMaintenance`).
  - `apps/admin/app/products/[id]/page.tsx` — Integrate `MaintenancePanel` into the product view page below the Versions table.
  - `apps/admin/app/products/[id]/skeleton.tsx` — Include the maintenance panel skeleton in the dynamic view loading skeleton.
  - `docs/development/web_admin_product_crud/TASK_LIST.md` — Update `TASK-06` status to `IN_PROGRESS`.

---

## 3. STEP-BY-STEP IMPLEMENTATION PLAN

### Step 1: Align Maintenance Types in `@forginity/sdk`
- **Target File:** `packages/sdk/src/modules/products/products.types.ts`
- **Action:**
  - Align `ProductMaintenance` fields with backend Drizzle schema:
    ```typescript
    export type MaintenanceStatus = "scheduled" | "active" | "completed" | "cancelled"

    export interface ProductMaintenance {
      id: string
      productId: string
      startsAt: string
      endsAt: string
      status: MaintenanceStatus
      message: string
      createdAt?: string
    }

    export interface CreateProductMaintenanceInput {
      startsAt: string
      endsAt: string
      status?: MaintenanceStatus
      message: string
    }

    export interface UpdateProductMaintenanceInput {
      startsAt?: string
      endsAt?: string
      status?: MaintenanceStatus
      message?: string
    }
    ```

### Step 2: Add Maintenance Mutation Hooks in `@forginity/sdk`
- **Target File:** `packages/sdk/src/modules/products/products.hooks.ts`
- **Action:**
  - Export `useUpdateProductMaintenance`:
    ```typescript
    export function useUpdateProductMaintenance(productId: string) {
      const queryClient = useQueryClient()
      return useMutation({
        mutationFn: ({ maintenanceId, payload }: { maintenanceId: string; payload: UpdateProductMaintenanceInput }) =>
          ProductsService.updateMaintenance(maintenanceId, payload),
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: productCacheKeys.maintenance(productId) })
          queryClient.invalidateQueries({ queryKey: productCacheKeys.maintenance() })
          queryClient.invalidateQueries({ queryKey: productCacheKeys.detail(productId) })
        },
      })
    }
    ```
  - Export `useDeleteProductMaintenance`:
    ```typescript
    export function useDeleteProductMaintenance(productId: string) {
      const queryClient = useQueryClient()
      return useMutation({
        mutationFn: (maintenanceId: string) =>
          ProductsService.deleteMaintenance(maintenanceId),
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: productCacheKeys.maintenance(productId) })
          queryClient.invalidateQueries({ queryKey: productCacheKeys.maintenance() })
          queryClient.invalidateQueries({ queryKey: productCacheKeys.detail(productId) })
        },
      })
    }
    ```

### Step 3: Verify SDK Tests & Update Mock Contracts
- **Target Files:**
  - `packages/sdk/src/modules/products/products.service.test.ts`
  - `packages/sdk/src/modules/products/products.hooks.test.ts`
- **Action:**
  - Update mock payloads in unit tests to match `{ startsAt, endsAt, status, message }`.
  - Add test coverage for `useUpdateProductMaintenance` and `useDeleteProductMaintenance`.
  - Run `pnpm --filter @forginity/sdk test` to ensure all tests pass.

### Step 4: Define Client Validation Schema in `apps/admin`
- **Target File:** `apps/admin/lib/validators/maintenance-form.validator.ts`
- **Action:** Create Zod schema validating maintenance dates and message:
  ```typescript
  import { z } from "zod"

  export const maintenanceFormSchema = z
    .object({
      startsAt: z.string().min(1, "Start time is required"),
      endsAt: z.string().min(1, "End time is required"),
      status: z.enum(["scheduled", "active", "completed", "cancelled"]).default("scheduled"),
      message: z
        .string()
        .min(5, "Maintenance message must be at least 5 characters")
        .max(500, "Maintenance message cannot exceed 500 characters"),
    })
    .refine(
      (data) => {
        const start = new Date(data.startsAt).getTime()
        const end = new Date(data.endsAt).getTime()
        return !isNaN(start) && !isNaN(end) && end > start
      },
      {
        message: "End time must be after start time",
        path: ["endsAt"],
      }
    )

  export type MaintenanceFormData = z.infer<typeof maintenanceFormSchema>
  ```

### Step 5: Build Reusable Maintenance Dialog (`maintenance-dialog.tsx`)
- **Target File:** `apps/admin/components/maintenance-dialog.tsx`
- **Action:**
  - Implement accessible modal dialog using `@workspace/ui/components/dialog` and Coral Sunset tokens.
  - Support both **Create** and **Edit** modes.
  - Render datetime-local inputs for `startsAt` and `endsAt`.
  - Render `status` select dropdown (`scheduled`, `active`, `completed`, `cancelled`).
  - Render `message` textarea with live character counter (`x/500`).
  - Hook into `useCreateProductMaintenance` or `useUpdateProductMaintenance`.
  - Display validation errors inline and show loading spinner during submission.

### Step 6: Build Maintenance Panel (`maintenance-panel.tsx`) & Skeleton
- **Target Files:**
  - `apps/admin/components/maintenance-panel.tsx`
  - `apps/admin/components/maintenance-panel-skeleton.tsx`
- **Action:**
  - Render a Card with header: "Maintenance Windows", descriptive subtitle, and "Schedule maintenance" button opening the dialog.
  - Query maintenance list via `useProductMaintenance(productId)`.
  - Display table/list of maintenance items with:
    - Status pill (`scheduled`, `active`, `completed`, `cancelled`).
    - Formatted start and end datetime ranges with relative duration badge.
    - Customer announcement message.
    - Action menu: Edit, Mark Complete, or Cancel/Delete.
  - Render zero-data empty state when no maintenance windows are scheduled.
  - Implement `MaintenancePanelSkeleton` mirroring the panel layout with 0.00 CLS.

### Step 7: Integrate Panel into Product Details View
- **Target Files:**
  - `apps/admin/app/products/[id]/page.tsx`
  - `apps/admin/app/products/[id]/skeleton.tsx`
- **Action:**
  - Mount `<MaintenancePanel productId={id} productName={product.name} />` on the details page below the Versions card.
  - Add `<MaintenancePanelSkeleton />` to the view skeleton so the entire layout loads seamlessly without shifting.

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
1. **Happy Path - Scheduling Maintenance:**
   - Select valid start date/time (e.g. tomorrow) and end date/time (4 hours later).
   - Enter descriptive message ("Database maintenance and migration").
   - Confirm dialog -> creates maintenance window -> table updates instantly -> dialog closes.
2. **Input Validation Failure:**
   - Set end time earlier than or equal to start time -> form displays inline error: `"End time must be after start time"`.
   - Leave message blank -> form displays `"Maintenance message must be at least 5 characters"`.
3. **Updating / Cancelling Maintenance:**
   - Edit an existing window -> change message or status -> updates immediately via `useUpdateProductMaintenance`.
   - Delete/cancel a maintenance schedule -> window disappears from active list via `useDeleteProductMaintenance`.
4. **Layout & Responsiveness:**
   - Verify layout on mobile (`< 640px`), tablet (`640px - 1024px`), and desktop (`> 1024px`).
   - Confirm zero Content Layout Shift (CLS = 0.00) with loading skeleton.

---

## 5. SECURITY & GUARDRAILS

- [ ] **No `.env` files touched:** Strictly read environment variables from `process.env`.
- [ ] **Type-First Architecture:** Derive all contracts from authoritative Zod schemas and Drizzle definitions.
- [ ] **No Barrel Exports:** Import all components, hooks, services, and types directly from source files.
- [ ] **Input Sanitization & Validation:** All user inputs parsed through client Zod validator and server API validators.
- [ ] **Zero CLS Principle:** Skeletons accurately mirror resolved table and card geometries.
- [ ] **Read-Only Git Operations:** No mutating git commands (`git commit`, `git push`, etc.).

---

## 6. RECORD UPDATE INSTRUCTIONS

Upon completing verification:
1. Mark `TASK-06` as `COMPLETED` in [`./TASK_LIST.md`](./TASK_LIST.md).
2. Update the **LAST UPDATE** block and append the completed row to **COMPLETED TASKS** in [`../IMPLEMENTATION_RECORD.md`](../IMPLEMENTATION_RECORD.md).
3. Refresh the component row and overall metrics in [`../PROGRESS.md`](../PROGRESS.md).
