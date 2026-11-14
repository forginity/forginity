# TASK IMPLEMENTATION GUIDE: TASK-01 - Scaffold apps/admin Package and Global Shadcn Shell Foundation

- **Service:** `apps/admin` (and `@workspace/ui`)
- **Status:** `COMPLETED`
- **Task List:** [`./TASK_LIST.md`](./TASK_LIST.md)
- **Record:** [`../IMPLEMENTATION_RECORD.md`](../IMPLEMENTATION_RECORD.md)

---

## 1. SUMMARY & GOAL

Establish the organization-wide UI foundation and administrative shell architecture. Integrate global shadcn/ui components into `@workspace/ui` (`packages/ui`) with brand design tokens, navigation types, and constants. Implement reusable `AppShell`, `AppSidebar`, `AppHeader`, and `MetricCard` components in the global UI package and wire them into `apps/admin` to deliver the responsive administrative layout and overview dashboard referenced in `apps/admin/refrence`.

---

## 2. SCOPE OF CHANGES

- **Files to Create in `@workspace/ui` (`packages/ui`):**
  - `src/types/navigation.types.ts`: Navigation contracts, user profiles, and workspace models.
  - `src/constants/brand.constants.ts`: Forginity brand, console version, operational status, and environment constants.
  - `src/components/brand-logo.tsx`: Scalable SVG Forginity brand mark with title and uppercase sublabel.
  - `src/components/app-sidebar.tsx`: Collapsible, responsive sidebar with active route highlighting, workspace switcher, and user profile.
  - `src/components/app-header.tsx`: Top bar with breadcrumb tracking, search input (`⌘ K`), notifications, and environment pill.
  - `src/components/app-shell.tsx`: Master responsive shell layout coordinating sidebar, header, mobile sheet, and content area.
  - `src/components/dashboard-header.tsx`: Header banner with title, description, and action slots.
  - `src/components/metric-card.tsx`: Metric card displaying value, badge indicator, title, and subtext.

- **Files to Modify in `@workspace/ui` (`packages/ui`):**
  - `package.json`: Register exports for `./types/*` and `./constants/*`.
  - `src/styles/globals.css`: Tune brand colors, dark mode tokens, and Tailwind v4 source paths.

- **Files to Create / Modify in `apps/admin`:**
  - `constants/admin-nav.constants.ts`: Concrete navigation items, user session, and workspace info for Admin.
  - `app/layout.tsx`: Consume `@workspace/ui/globals.css`, font variables, and theme provider.
  - `app/page.tsx`: Render administrative dashboard overview with metric cards and layout shell.
  - Remove redundant local duplicate components in `apps/admin/components/ui/`.

---

## 3. STEP-BY-STEP IMPLEMENTATION

### Step 1: Install and Verify Shadcn Primitives in `@workspace/ui`
- **Target Directory:** `packages/ui/`
- **Action:** Install base primitives (`badge`, `card`, `separator`, `avatar`, `tooltip`, `input`, `dropdown-menu`, `sheet`, `dialog`, `skeleton`, `breadcrumb`, `collapsible`) and register subpath exports in `package.json`.

### Step 2: Define Navigation Types & Brand Constants
- **Target Files:**
  - `packages/ui/src/types/navigation.types.ts`
  - `packages/ui/src/constants/brand.constants.ts`
- **Action:** Create strict TypeScript contracts for navigation items, submenus, user sessions, and workspace metadata.

### Step 3: Implement Global Shell Components in `@workspace/ui`
- **Target Files:**
  - `packages/ui/src/components/brand-logo.tsx`
  - `packages/ui/src/components/app-sidebar.tsx`
  - `packages/ui/src/components/app-header.tsx`
  - `packages/ui/src/components/app-shell.tsx`
  - `packages/ui/src/components/dashboard-header.tsx`
  - `packages/ui/src/components/metric-card.tsx`
- **Action:** Implement accessible, typed components following the `apps/admin/refrence` specifications.

### Step 4: Wire Shell into `apps/admin`
- **Target Files:**
  - `apps/admin/constants/admin-nav.constants.ts`
  - `apps/admin/app/layout.tsx`
  - `apps/admin/app/page.tsx`
- **Action:** Import global shell, define admin navigation structure, and render the dashboard overview.

---

## 4. VERIFICATION & TESTS

Execute verification commands:
```bash
pnpm --filter @workspace/ui typecheck
pnpm --filter @web/admin typecheck
pnpm --filter @web/admin build
```

Test scenarios to cover:
- **Responsive Layout:** Sidebar collapses or renders inside sheet drawer on mobile viewports.
- **Active Route Highlighting:** Current route matches active nav item with coral highlight.
- **Collapsible Menu:** Submenu items expand and collapse cleanly without layout jump.
- **Zero Hydration Mismatch:** Clean server-side rendering and client hydration.

---

## 5. SECURITY & GUARDRAILS

- [x] **No `.env` touched.** Secrets read strictly from `process.env`.
- [x] **No barrel files.** All imports target authoritative source modules directly.
- [x] **Input sanitization.** Search and text inputs cleanly bounded.

---

## 6. RECORD UPDATE

1. Update the **LAST UPDATE** block in [`../IMPLEMENTATION_RECORD.md`](../IMPLEMENTATION_RECORD.md) with a two-line summary.
2. Add a row to **COMPLETED TASKS** in [`../IMPLEMENTATION_RECORD.md`](../IMPLEMENTATION_RECORD.md).
3. Mark task as `COMPLETED` in [`./TASK_LIST.md`](./TASK_LIST.md).
