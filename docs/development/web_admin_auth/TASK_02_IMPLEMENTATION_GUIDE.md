# TASK IMPLEMENTATION GUIDE: TASK-02 - User List UI & Directory API Integration

- **Service / App:** `apps/admin` (`@web/admin`)
- **Status:** `COMPLETED`
- **Task List:** [`./TASK_LIST.md`](./TASK_LIST.md)
- **Record:** [`../IMPLEMENTATION_RECORD.md`](../IMPLEMENTATION_RECORD.md)
- **Progress:** [`../PROGRESS.md`](../PROGRESS.md)
- **Figma Reference:** [`Forginity · Users overview (Node 321:362 / 309:326)`](https://www.figma.com/design/sERqI1nBTDZqA6JDZVnRt4/Forginity-Ui?node-id=321-362&t=RAVOgr6fDakWcrm9-4)

---

## 1. SUMMARY & GOAL

Implement the responsive user management directory overview at `/users` in `apps/admin` matching the Figma design (`Node 321:362` / `309:326`) and integrate it with the live `services/auth` `GET /api/users` endpoint via `@forginity/sdk` (`useUsers`).

Key deliverables:
1. **Interactive KPI Metric Cards:** Dynamic calculation and display of `Total users`, `Active users`, `Verified users`, and `Pending onboarding` based on live directory query responses.
2. **Search & Multi-Filter Controls:** Debounced search query (filter by name, email, or phone) and dropdown filters for `Status` (`All`, `Active`, `Blocked`, `Deleted`), `Provider` (`All`, `Google`, `Email OTP`), and `Verification` (`All`, `Verified`, `Unverified`).
3. **Responsive User Data Table:** Touch-friendly horizontal scroll table (`min-w-[950px]`) displaying user avatar/initials, full name, email, phone, country, auth provider, verification badges, onboarding state, status badges, formatted joined timestamp, and a `View ↗` action button.
4. **Server-Side Pagination:** Pagination bar supporting page numbers, rows per page, previous/next buttons, and record count summary (`Showing X–Y of Z users`).
5. **Zero-CLS Loading Skeleton:** Mirrors the exact geometry of KPI cards, controls bar, and table rows to eliminate Content Layout Shift (CLS = 0.00).

---

## 2. SCOPE OF CHANGES

- **Files to Modify:**
  - `packages/sdk/src/modules/auth/auth.types.ts` - Refine `ListUsersParams` and `ListUsersResponse` to support `offset`, `hasMore`, `authProvider`, and `page`.
  - `packages/sdk/src/modules/auth/auth.service.ts` - Map `page` and `limit` to backend `offset` seamlessly.
  - `apps/admin/app/users/page.tsx` - Implement complete Users Overview screen matching Figma (`309:326`), integrating `useUsers` hook, debounced search, filters, pagination, and zero-CLS skeleton.
  - `docs/development/web_admin_auth/TASK_LIST.md` - Update `TASK-02` status.

---

## 3. STEP-BY-STEP IMPLEMENTATION

### Step 1: Align SDK Types and Service Layer
- **Target Files:**
  - `packages/sdk/src/modules/auth/auth.types.ts`
  - `packages/sdk/src/modules/auth/auth.service.ts`
- **Action:** Ensure `ListUsersParams` accepts `search`, `status`, `userType`, `authProvider`, `limit`, `offset`, and `page`. Ensure `listUsers` translates `page` to `offset` if provided.

### Step 2: Build Responsive Users Overview Page
- **Target File:** `apps/admin/app/users/page.tsx`
- **Action:**
  - Render inside `<AdminShell>` with breadcrumbs `[{ label: "Workspace" }, { label: "Users" }, { label: "Overview" }]`.
  - Header: Title `Users`, description `Monitor accounts, verification and onboarding in one place.`, and `Export users` action button.
  - 4 Metric cards (`Total users`, `Active users`, `Verified users`, `Pending onboarding`).
  - Search input with 300ms debounce.
  - Filter selectors for `Status`, `Provider`, and `Verification`.
  - Responsive table container with `overflow-x-auto` and `min-w-[950px]`.
  - Exact styling from Figma:
    - User column: Name (`#f6f6f6`, 14px font-medium) + Email (`#929292`, 12px).
    - Status badges: Active (`bg-[#1c2820] text-[#a2c7ad]`), Blocked (`bg-[#2a1b18] text-[#ff967f]`), Deleted (`bg-[#252525] text-[#929292]`).
    - Verification badges: Verified (`bg-[#1c2820] text-[#a2c7ad]`), Unverified (`bg-[#29251c] text-[#dfc38c]`).
    - Formatted UTC join dates (`12 Nov 2026, 09:42 UTC`).
    - `View ↗` button navigating to user detail drawer/modal.
  - Pagination bar with page buttons, previous/next, and showing count.
  - Dynamic zero-CLS skeleton during data fetching.

---

## 4. VERIFICATION & TESTS

Execute verification commands:
```bash
pnpm --filter @forginity/sdk test
pnpm --filter @web/admin typecheck
pnpm --filter @web/admin lint
pnpm --filter @web/admin build
```

UI scenarios to verify:
- **Zero-CLS Loading:** Skeletons match resolved state heights and row paddings.
- **Search & Debounce:** Typing in search updates table after 300ms without flickering.
- **Filter Switching:** Filtering by status (`active`, `blocked`, `deleted`) requests correct records from backend.
- **Pagination Navigation:** Page switching updates `offset`/`page` and refreshes records.
- **Universal Responsiveness:** Table scrolls smoothly horizontally on mobile/tablet without clipping or layout blowout.

---

## 5. SECURITY & GUARDRAILS

- [x] **No `.env` touched.** Secrets read strictly from `process.env`.
- [x] **Admin authorization.** Route guarded by Next.js `proxy.ts` and backend `requireAdmin` middleware.
- [x] **No barrel files.** Direct authoritative imports.

---

## 6. RECORD UPDATE

1. Mark task as `COMPLETED` in [`./TASK_LIST.md`](./TASK_LIST.md).
2. Update the **LAST UPDATE** block and append task row in [`../IMPLEMENTATION_RECORD.md`](../IMPLEMENTATION_RECORD.md).
3. Refresh the component row and overall metrics in [`../PROGRESS.md`](../PROGRESS.md).
