# APP SPECIFICATION: WEB_APP_ADMIN

## 1. EXECUTIVE SUMMARY

- **Application Name:** `apps/admin`
- **Folder Reference:** `docs/development/web_app_admin`
- **Domain:** Forginity Centralized Administration Portal
- **Owner:** Forginity Core Platform Team
- **Purpose:** `apps/admin` is the unified web-based administration console for the Forginity monorepo ecosystem. It equips platform operators and administrators with centralized controls to manage products, schedule maintenance windows, monitor release versions, manage users and roles, and orchestrate automated system workflows.
- **Consumers:** Internal platform administrators, product managers, and support engineers.
- **Development Roadmap:** [`./TASK_LIST.md`](./TASK_LIST.md)
- **Implementation Record:** [`./IMPLEMENTATIONS_RECORD.md`](./IMPLEMENTATIONS_RECORD.md)

---

## 2. BUSINESS & FUNCTIONAL REQUIREMENTS

### Core Capabilities
- **Product Catalog Management:** View, register, edit, and deprecate platform products connected to `services/products`.
- **Maintenance Operations:** Schedule, monitor, and cancel product-specific or global maintenance windows with client-facing notices.
- **Release Version Management:** View and register semantic version releases and update support statuses (`latest`, `supported`, `deprecated`).
- **User & Account Moderation:** Search users, inspect profile attributes, assign RBAC permissions, and execute suspension or soft-deletion actions via `services/auth`.
- **Automation Workflow Canvas:** Design and trigger background orchestration workflows using a visual node-based editor connected to `services/auto`.

### Workflows
1. **Product & Maintenance Scheduling:**
   - Operator logs into Admin Portal with administrative credentials.
   - Operator selects product from the catalog table.
   - Operator creates maintenance window with start/end timestamps and custom broadcast messages.
2. **User Moderation & Account Lifecycle:**
   - Administrator searches user by email, phone, or UUID.
   - Administrator inspects active login sessions and role memberships.
   - Administrator triggers soft-delete or immediate suspension if security violations occur.

---

## 3. ARCHITECTURE & TECH STACK

- **Framework:** Next.js 16 (App Router), React 19, TypeScript.
- **Styling & UI Components:** Tailwind CSS v4, Shadcn UI (`@workspace/ui`), Lucide React icons.
- **Workflow Visualization:** `@xyflow/react` for visual node-based workflow orchestration.
- **State Management & Theming:** `next-themes` (Dark/Light mode) and React Server Components.
- **Backend Services Consumed:**
  - `services/auth` (SSO, admin session tokens, user management)
  - `services/products` (Catalog, maintenance windows, version tracks)
  - `services/auto` (Workflow automation execution and cron triggers)
- **Architectural Reference:** [`apps/admin`](file:///home/vikas/Documents/forginity/apps/admin)

---

## 4. APPLICATION ROUTE STRUCTURE

Managed within `apps/admin/app`:

- `/` - Admin dashboard landing page with platform health and metrics summary
- `/login` - Administrative sign-in portal via `services/auth`
- `/products` - Product catalog list and creation drawer
- `/products/[id]` - Product detail, active maintenance schedules, and version releases
- `/maintenance` - Global maintenance window scheduling calendar
- `/users` - User directory, account details, and role assignments
- `/automation` - Visual workflow editor powered by `@xyflow/react` and `services/auto`

---

## 5. SECURITY & COMPLIANCE

- **Zero `.env` Access:** Never inspect, create, or commit `.env` files. Secrets are read strictly from `process.env`.
- **RBAC Route Guards:** Protected routes require valid administrative JWT session tokens issued by `services/auth`.
- **Input Sanitization:** Client-side forms validate inputs with Zod before dispatching mutation payloads to backend services.
