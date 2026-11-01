# TASK IMPLEMENTATION GUIDE: TASK-02 - Configure Shadcn UI Components & Styling Tokens

- **Service:** `apps/admin` (and `@workspace/ui`)
- **Status:** `IN_PROGRESS`
- **Task List:** [`./TASK_LIST.md`](./TASK_LIST.md)
- **Record:** [`./IMPLEMENTATIONS_RECORD.md`](./IMPLEMENTATIONS_RECORD.md)

---

## 1. SUMMARY & GOAL

Configure and expand the comprehensive suite of shadcn/ui primitives and design system tokens in `@workspace/ui` (`packages/ui`). Standardize design tokens (brand colors, dark/light theme contrast, radii, typography) and install essential UI components (Table, Select, Tabs, Popover, Switch, Form controls, Charts) to support full feature development across the admin console and future web applications.

---

## 2. SCOPE OF CHANGES

- **Files to Create / Expand in `@workspace/ui` (`packages/ui`):**
  - `src/components/table.tsx`: Accessible data table primitives (`Table`, `TableHeader`, `TableRow`, `TableCell`, etc.).
  - `src/components/select.tsx`: Base UI / shadcn select dropdowns.
  - `src/components/tabs.tsx`: Tabbed navigation and view switchers.
  - `src/components/popover.tsx`: Popovers for filters, date pickers, and toolbars.
  - `src/components/switch.tsx`: Toggle switches for settings and flags.
  - `src/components/form.tsx`: Structured form field wrappers (`FieldGroup`, `Field`, `FieldLabel`).
  - `src/styles/globals.css`: Authoritative theme variables for dark/light modes and brand accents.

- **Files to Modify in `apps/admin`:**
  - `app/layout.tsx`: Verify theme variables and font bindings.
  - `app/products/page.tsx` & `app/users/page.tsx`: Ingest newly configured table and select primitives.

---

## 3. STEP-BY-STEP IMPLEMENTATION

### Step 1: Ingest Figma Tokens / Component Specifications
- **Action:** Extract exact color tokens, typography scales, spacing, and component variants from the design specification (via Figma integration, Dev Mode CSS, or exported design tokens).

### Step 2: Install Primitives into `@workspace/ui`
- **Target Directory:** `packages/ui/`
- **Action:** Add required primitives using shadcn CLI or Base UI bindings without barrel exports.

### Step 3: Configure Design System Tokens & Themes
- **Target File:** `packages/ui/src/styles/globals.css`
- **Action:** Align CSS variables for `--primary`, `--accent`, `--card`, `--border`, `--muted` with Forginity brand guidelines for both dark and light modes.

### Step 4: Verify Component Composition & Theme Switching
- **Target File:** `apps/admin/`
- **Action:** Verify zero-flash dark/light mode switching via `next-themes` and test composite components.

---

## 4. VERIFICATION & TESTS

Execute verification commands:
```bash
pnpm --filter @workspace/ui typecheck
pnpm --filter @workspace/ui lint
pnpm --filter @web/admin typecheck
pnpm --filter @web/admin lint
pnpm --filter @web/admin build
```

Test scenarios to cover:
- **Theme Switching:** Dark and light modes render with high contrast and zero hydration mismatches.
- **Component Anatomy:** Table, Select, and Form controls adhere to accessibility and Base UI standards.
- **Responsive Layout:** Components adapt across mobile, tablet, and desktop viewports.

---

## 5. SECURITY & GUARDRAILS

- [x] **No `.env` touched.** Secrets read strictly from `process.env`.
- [x] **No barrel files.** Direct authoritative file imports only.
- [x] **Strict Type-First Architecture.** Derived types and strict interfaces.

---

## 6. RECORD UPDATE

1. Update the **LAST UPDATE** block in [`./IMPLEMENTATIONS_RECORD.md`](./IMPLEMENTATIONS_RECORD.md) with a two-line summary.
2. Add a row to **COMPLETED TASKS** in [`./IMPLEMENTATIONS_RECORD.md`](./IMPLEMENTATIONS_RECORD.md).
3. Mark task as `COMPLETED` in [`./TASK_LIST.md`](./TASK_LIST.md).
