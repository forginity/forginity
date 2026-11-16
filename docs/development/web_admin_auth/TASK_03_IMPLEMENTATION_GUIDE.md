# TASK IMPLEMENTATION GUIDE: TASK-03 - View User UI & Account Moderation Integration

- **Service:** `apps/admin` (Admin Authentication & User Directory Suite)
- **Status:** `COMPLETED`
- **Task List:** [`./TASK_LIST.md`](./TASK_LIST.md)
- **Record:** [`../IMPLEMENTATION_RECORD.md`](../IMPLEMENTATION_RECORD.md)
- **Progress:** [`../PROGRESS.md`](../PROGRESS.md)

---

## 1. SUMMARY & GOAL

Implement the comprehensive user detail inspection page and account moderation workflow for the Forginity Admin Portal strictly matching Figma Node `309:404` ("Forginity · User details") at `/users/[id]`. When administrators click a user row or the "View ↗" action button in the `/users` table, client-side navigation transitions to the dedicated `/users/[id]` page wrapped in `AdminShell`. The page presents a full-width user account summary hero card, personal information grid, contact information with verified badges, system information with instant copy-to-clipboard, authentication & provider metadata, verification & onboarding states, account UTC timestamps, linked emergency contacts, and active moderation action controls (Block, Unblock, Soft Delete) wired directly to `services/auth` API endpoints via TanStack Query.

---

## 2. SCOPE OF CHANGES

- **Files Created:**
  - `apps/admin/app/users/[id]/page.tsx` - Dedicated User Details view strictly implementing Figma Node `309:404` with account summary, 2-column info grid, JSON export, and moderation dialogs.
  - `apps/admin/app/users/[id]/skeleton.tsx` - High-fidelity Zero-CLS loading skeleton mirroring the exact geometry of Figma Node `309:404`.
  - `apps/admin/components/user-detail-sheet.tsx` - Slide-over sheet component maintained for auxiliary preview.
- **Files Modified:**
  - `apps/admin/app/users/page.tsx` - Removed redundant "X users" badge from "All users" card title, wired table rows and "View ↗" button to navigate to `/users/${user.id}`.
  - `apps/admin/lib/store/slices/user-slice.ts` - Fixed hydration mismatch by initializing state with `user: null` and synchronizing client localStorage via `admin-shell.tsx`.
  - `apps/admin/components/admin-shell.tsx` - Added safe client-side hydration for cached admin user profile.
  - `packages/sdk/src/modules/auth/auth.types.ts` - Added `EmergencyContact` and `UserDetailsResponse` interfaces, and added `googleId` to `UserProfile`.
  - `packages/sdk/src/modules/auth/auth.service.ts` - Enhanced `getUserById` to return `UserDetailsResponse`.
  - `packages/sdk/src/modules/auth/auth.hooks.ts` - Added `useUser` and `useUpdateUserStatus` hooks with TanStack Query cache invalidation.
  - `packages/ui/src/components/sheet.tsx` - Fixed utility import path to `@workspace/ui/lib/utils`.

---

## 3. STEP-BY-STEP IMPLEMENTATION

### Step 1: SDK Data Contracts & Hooks
- **Target File:** `packages/sdk/src/modules/auth/auth.types.ts`, `packages/sdk/src/modules/auth/auth.service.ts`, `packages/sdk/src/modules/auth/auth.hooks.ts`
- **Action:** Define `EmergencyContact` and `UserDetailsResponse` types. Provide `getUserById(userId)` service call and TanStack Query `useUser(userId)` and `useUpdateUserStatus()` hooks.

### Step 2: Dedicated User Details Page & Zero-CLS Skeleton (Figma Node 309:404)
- **Target File:** `apps/admin/app/users/[id]/page.tsx`, `apps/admin/app/users/[id]/skeleton.tsx`
- **Action:** Build dedicated page displaying:
  - Top breadcrumb/back navigation `← All users` with transition.
  - Page header: `User details` title, subtitle, and `Export details` JSON download action.
  - User Account Summary hero card with full name, email, membership date, status badges (`active`, `blocked`, `deleted`), verification pill, and onboarding state text.
  - 2-Column responsive content grid:
    - Left column: Personal information card, Contact information card (with email/phone verified pills), System information card (with interactive Copy ID button), and Emergency contacts list.
    - Right column: Authentication provider card (Email OTP / Google with provider ID), Verification & onboarding status matrix, UTC account timestamps card, and Account moderation card.
  - Moderation confirmation modal handling user blocking (with session revocation warning), unblocking, and soft deletion.

### Step 3: Integrate Table Navigation in Users Overview
- **Target File:** `apps/admin/app/users/page.tsx`
- **Action:** Connect table row clicks and "View ↗" action buttons to route directly to `/users/${user.id}` via Next.js `Link` and `useRouter`.

---

## 4. VERIFICATION & TESTS

Execute verification commands:
```bash
pnpm --filter @web/admin typecheck
pnpm --filter @web/admin lint
pnpm --filter @web/admin build
pnpm --filter @forginity/sdk test
pnpm --filter @services/auth test
```

Test scenarios covered:
- **Happy Path:** Clicking table row or "View ↗" loads user details and opens slide-over drawer seamlessly.
- **Hydration Safety:** Zero React SSR hydration mismatches in browser console.
- **Moderation Actions:** Status update mutations trigger `PATCH /api/users/:userId/status` and invalidate user queries.
- **Responsive Geometry:** Sheet is responsive and scrolls smoothly on mobile, tablet, and desktop.

---

## 5. SECURITY & GUARDRAILS

- [x] **No `.env` touched.** Secrets read strictly from `process.env`.
- [x] **Input validation.** All external inputs parsed through Zod.
- [x] **SQL parameterization.** All queries use Drizzle ORM builders.

---

## 6. RECORD UPDATE

1. Mark task as `COMPLETED` in [`./TASK_LIST.md`](./TASK_LIST.md).
2. Update the **LAST UPDATE** block and append task row in [`../IMPLEMENTATION_RECORD.md`](../IMPLEMENTATION_RECORD.md).
3. Refresh the component row and overall metrics in [`../PROGRESS.md`](../PROGRESS.md).
