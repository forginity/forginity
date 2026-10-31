# TASK LIST: WEB_APP_ADMIN

## 1. SERVICE DETAILS

- **Application Name:** `apps/admin`
- **Domain:** Forginity Centralized Administration Portal
- **Purpose:** `apps/admin` is the unified web-based administration console for the Forginity monorepo ecosystem. It equips platform operators and administrators with centralized controls to manage products, schedule maintenance windows, monitor release versions, manage users and roles, and orchestrate automated system workflows.
- **Key Features & Flows:**
  - Product catalog management with lifecycle controls and feature toggles via `services/products`.
  - Maintenance window scheduling and global broadcast alerts.
  - Software version registry management.
  - User account directory, role-based access moderation, and soft-delete controls via `services/auth`.
  - Visual automation workflow canvas using `@xyflow/react` integrated with `services/auto`.
- **Tech Stack:** Next.js 16 (App Router), React 19, Tailwind CSS v4, Shadcn UI (`@workspace/ui`), `@xyflow/react`, Lucide React, TypeScript.
- **Reference Service:** [`apps/admin`](file:///home/vikas/Documents/forginity/apps/admin)
- **Service Specification:** [`./README.md`](./README.md)
- **Implementation Record:** [`./IMPLEMENTATIONS_RECORD.md`](file:///home/vikas/Documents/forginity/docs/development/web_app_admin/IMPLEMENTATIONS_RECORD.md)

---

## 2. PROGRESSIVE TASK MATRIX

| Task ID | Task Title | Key Deliverable | Guide File | Status |
| :--- | :--- | :--- | :--- | :--- |
| `TASK-01` | Scaffold `apps/admin` package and Next.js foundation | Base Next.js 16 app, Tailwind v4, Shadcn UI components, tsconfig, package scripts | [`TASK_01_IMPLEMENTATION_GUIDE.md`](./TASK_01_IMPLEMENTATION_GUIDE.md) | `IN_PROGRESS` |
| `TASK-02` | Admin Authentication & Session Guard | Admin login view, session token management, protected route middleware via `services/auth` | [`TASK_02_IMPLEMENTATION_GUIDE.md`](./TASK_02_IMPLEMENTATION_GUIDE.md) | `PENDING` |
| `TASK-03` | Product Catalog & Lifecycle Management UI | Product table, creation drawer, status toggles, `services/products` integration | [`TASK_03_IMPLEMENTATION_GUIDE.md`](./TASK_03_IMPLEMENTATION_GUIDE.md) | `PENDING` |
| `TASK-04` | Maintenance Windows & Version Control Management UI | Scheduled maintenance calendar, version release track manager | [`TASK_04_IMPLEMENTATION_GUIDE.md`](./TASK_04_IMPLEMENTATION_GUIDE.md) | `PENDING` |
| `TASK-05` | User & Organization Moderation UI | User directory search, role assignment, suspension and soft-delete actions via `services/auth` | [`TASK_05_IMPLEMENTATION_GUIDE.md`](./TASK_05_IMPLEMENTATION_GUIDE.md) | `PENDING` |
| `TASK-06` | Automation Workflow Builder Canvas | Visual node editor with `@xyflow/react`, trigger configuration, `services/auto` integration | [`TASK_06_IMPLEMENTATION_GUIDE.md`](./TASK_06_IMPLEMENTATION_GUIDE.md) | `PENDING` |

---

## 3. TASK LIST

### `TASK-01`: Scaffold `apps/admin` package and Next.js foundation
- **Description:** Initialize `apps/admin` workspace package with Next.js 16 App Router, React 19, TypeScript, Tailwind CSS v4, and Shadcn UI.
  Configure `tsconfig.json`, `next.config.ts`, theme provider with `next-themes`, and foundation layout.
- **Guide:** [`TASK_01_IMPLEMENTATION_GUIDE.md`](./TASK_01_IMPLEMENTATION_GUIDE.md) (Covers scope, step-by-step code, test cases, and security gates.)

### `TASK-02`: Admin Authentication & Session Guard
- **Description:** Implement administrative login screen with credential validation against `services/auth`.
  Configure HTTP-only cookie session handling, Next.js proxy route handlers, and middleware-level protected route guards.
- **Guide:** [`TASK_02_IMPLEMENTATION_GUIDE.md`](./TASK_02_IMPLEMENTATION_GUIDE.md) (Covers scope, step-by-step code, test cases, and security gates.)

### `TASK-03`: Product Catalog & Lifecycle Management UI
- **Description:** Build product management dashboard consuming `services/products` REST APIs.
  Implement interactive product list table, status filter badges, creation drawer, and slug validation.
- **Guide:** [`TASK_03_IMPLEMENTATION_GUIDE.md`](./TASK_03_IMPLEMENTATION_GUIDE.md) (Covers scope, step-by-step code, test cases, and security gates.)

### `TASK-04`: Maintenance Windows & Version Control Management UI
- **Description:** Build scheduling interface for product and platform-wide maintenance periods.
  Implement release version registry UI displaying active, supported, and deprecated versions.
- **Guide:** [`TASK_04_IMPLEMENTATION_GUIDE.md`](./TASK_04_IMPLEMENTATION_GUIDE.md) (Covers scope, step-by-step code, test cases, and security gates.)

### `TASK-05`: User & Organization Moderation UI
- **Description:** Build administrative user directory with search and filtering by email or user ID.
  Implement account moderation actions including role assignments, suspension toggles, and soft-delete commands via `services/auth`.
- **Guide:** [`TASK_05_IMPLEMENTATION_GUIDE.md`](./TASK_05_IMPLEMENTATION_GUIDE.md) (Covers scope, step-by-step code, test cases, and security gates.)

### `TASK-06`: Automation Workflow Builder Canvas
- **Description:** Build interactive node-based workflow editor using `@xyflow/react`.
  Configure custom workflow nodes, trigger connectors, and API dispatch integration with `services/auto`.
- **Guide:** [`TASK_06_IMPLEMENTATION_GUIDE.md`](./TASK_06_IMPLEMENTATION_GUIDE.md) (Covers scope, step-by-step code, test cases, and security gates.)
