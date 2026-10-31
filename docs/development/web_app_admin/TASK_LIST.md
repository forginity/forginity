# TASK LIST: WEB_APP_ADMIN

## 1. SERVICE DETAILS

- **Application Name:** `apps/admin` (Portal Foundation & Shell)
- **Domain:** Forginity Admin Console Setup & Shell Architecture
- **Purpose:** Foundation and shell for the Forginity unified administration console. Sets up the Shadcn UI component architecture, dark/light theme system, responsive collapsible sidebar navigation, header controls, and routing hierarchy with empty placeholder views before feature integrations.
- **Key Features & Flows:**
  - Base Next.js 16 App Router configuration with React 19 and Tailwind CSS v4.
  - Shadcn UI component library integration (`@workspace/ui`) with typography and color tokens.
  - Admin dashboard shell with collapsible sidebar navigation, top bar, and theme switcher.
  - Route navigation hierarchy with empty placeholder pages for `/`, `/products`, `/maintenance`, `/users`, `/automation`, and `/settings`.
  - Active route highlighting and breadcrumb path tracking.
- **Tech Stack:** Next.js 16 (App Router), React 19, Tailwind CSS v4, Shadcn UI (`@workspace/ui`), `next-themes`, Lucide React, TypeScript.
- **Reference Service:** [`apps/admin`](file:///home/vikas/Documents/forginity/apps/admin)
- **Service Specification:** [`./README.md`](./README.md)
- **Implementation Record:** [`./IMPLEMENTATIONS_RECORD.md`](file:///home/vikas/Documents/forginity/docs/development/web_app_admin/IMPLEMENTATIONS_RECORD.md)

---

## 2. PROGRESSIVE TASK MATRIX

| Task ID | Task Title | Key Deliverable | Guide File | Status |
| :--- | :--- | :--- | :--- | :--- |
| `TASK-01` | Scaffold `apps/admin` Package and Next.js 16 Foundation | Next.js 16 App Router foundation, tsconfig, package scripts, Turborepo wiring | [`TASK_01_IMPLEMENTATION_GUIDE.md`](./TASK_01_IMPLEMENTATION_GUIDE.md) | `IN_PROGRESS` |
| `TASK-02` | Configure Shadcn UI Components & Styling Tokens | Core Shadcn UI primitives (`@workspace/ui`), Lucide icons, dark/light theme tokens | [`TASK_02_IMPLEMENTATION_GUIDE.md`](./TASK_02_IMPLEMENTATION_GUIDE.md) | `PENDING` |
| `TASK-03` | Build Admin Dashboard Shell & Collapsible Sidebar | Responsive admin layout, collapsible sidebar, top bar with theme toggle & user menu | [`TASK_03_IMPLEMENTATION_GUIDE.md`](./TASK_03_IMPLEMENTATION_GUIDE.md) | `PENDING` |
| `TASK-04` | Scaffold Navigation Route Hierarchy & Empty Page Shells | Empty placeholder views with breadcrumbs and headers for `/products`, `/maintenance`, `/users`, `/automation`, `/settings` | [`TASK_04_IMPLEMENTATION_GUIDE.md`](./TASK_04_IMPLEMENTATION_GUIDE.md) | `PENDING` |
| `TASK-05` | Verification Suite, Build Check & Layout Verification | TypeScript verification (`tsc --noEmit`), ESLint, and production build validation | [`TASK_05_IMPLEMENTATION_GUIDE.md`](./TASK_05_IMPLEMENTATION_GUIDE.md) | `PENDING` |

---

## 3. TASK LIST

### `TASK-01`: Scaffold `apps/admin` Package and Next.js 16 Foundation
- **Description:** Initialize and verify the `apps/admin` workspace package with Next.js 16 App Router, React 19, TypeScript, and Tailwind CSS v4.
  Configure `tsconfig.json`, `next.config.ts`, and root `app/layout.tsx` with font variables and theme wrapper.
- **Guide:** [`TASK_01_IMPLEMENTATION_GUIDE.md`](./TASK_01_IMPLEMENTATION_GUIDE.md) (Covers scope, step-by-step code, test cases, and security gates.)

### `TASK-02`: Configure Shadcn UI Components & Styling Tokens
- **Description:** Wire `@workspace/ui` Shadcn primitives into `apps/admin` (Button, Card, Sidebar, Sheet, Dropdown, Avatar, Breadcrumb, Separator, Tooltip).
  Configure Tailwind CSS v4 design tokens and test dark/light mode switching via `next-themes`.
- **Guide:** [`TASK_02_IMPLEMENTATION_GUIDE.md`](./TASK_02_IMPLEMENTATION_GUIDE.md) (Covers scope, step-by-step code, test cases, and security gates.)

### `TASK-03`: Build Admin Dashboard Shell & Collapsible Sidebar
- **Description:** Implement responsive dashboard shell layout featuring collapsible navigation sidebar and top header bar.
  Include brand logo, navigation links with active state styling, mobile slide-out sheet menu, and top header with user avatar placeholder and theme toggle.
- **Guide:** [`TASK_03_IMPLEMENTATION_GUIDE.md`](./TASK_03_IMPLEMENTATION_GUIDE.md) (Covers scope, step-by-step code, test cases, and security gates.)

### `TASK-04`: Scaffold Navigation Route Hierarchy & Empty Page Shells
- **Description:** Create empty placeholder page routes matching the admin architecture: `/` (Dashboard overview), `/products` (Product catalog), `/maintenance` (Maintenance windows), `/users` (User moderation), `/automation` (Workflows), and `/settings` (Settings).
  Provide each route with breadcrumbs, page title header, and an empty state card explaining the upcoming feature scope.
- **Guide:** [`TASK_04_IMPLEMENTATION_GUIDE.md`](./TASK_04_IMPLEMENTATION_GUIDE.md) (Covers scope, step-by-step code, test cases, and security gates.)

### `TASK-05`: Verification Suite, Build Check & Layout Verification
- **Description:** Run full verification suite against `apps/admin`: type checking (`tsc --noEmit`), linting (`next lint`), and production build (`next build`).
  Ensure zero hydration mismatches, zero CSS layout glitches, and verify that all placeholder navigation links render properly.
- **Guide:** [`TASK_05_IMPLEMENTATION_GUIDE.md`](./TASK_05_IMPLEMENTATION_GUIDE.md) (Covers scope, step-by-step code, test cases, and security gates.)
