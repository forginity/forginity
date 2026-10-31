# TASK LIST: WEB_ADMIN_AUTH

## 1. COMPONENT DETAILS

- **Component Name:** `apps/admin` (Admin Authentication & User Moderation Suite)
- **Domain:** Forginity Admin Console Authentication, RBAC, and User Management
- **Purpose:** Secure the Forginity Admin Portal (`apps/admin`) with administrative authentication, HTTP-only session cookies, Next.js middleware protected route guards, and an administrative user management directory via integration with `services/auth`.
- **Key Features & Flows:**
  - Dedicated admin login screen with client Zod validation.
  - HTTP-only cookie session handling and Next.js auth proxy handlers.
  - Next.js middleware route protection redirecting unauthenticated requests.
  - User directory search and profile inspection table.
  - User moderation actions: role assignment, account suspension, and soft deletion.
- **Tech Stack:** Next.js 16 (App Router), React 19, Tailwind CSS v4, Shadcn UI (`@workspace/ui`), TypeScript.
- **Reference Specification:** [`./README.md`](./README.md)
- **Implementation Record:** [`./IMPLEMENTATIONS_RECORD.md`](file:///home/vikas/Documents/forginity/docs/development/web_admin_auth/IMPLEMENTATIONS_RECORD.md)

---

## 2. PROGRESSIVE TASK MATRIX

| Task ID | Task Title | Key Deliverable | Guide File | Status |
| :--- | :--- | :--- | :--- | :--- |
| `TASK-01` | Admin Sign-In Screen | Credentials form with email and admin password, client Zod validation | [`TASK_01_IMPLEMENTATION_GUIDE.md`](./TASK_01_IMPLEMENTATION_GUIDE.md) | `PENDING` |
| `TASK-02` | HTTP-Only Cookie Session & Next.js Proxy Routes | Secure session cookie setting, server route handlers for auth proxying | [`TASK_02_IMPLEMENTATION_GUIDE.md`](./TASK_02_IMPLEMENTATION_GUIDE.md) | `PENDING` |
| `TASK-03` | Next.js Middleware Route Protection | Middleware interceptor checking admin token, redirecting unauthorized requests | [`TASK_03_IMPLEMENTATION_GUIDE.md`](./TASK_03_IMPLEMENTATION_GUIDE.md) | `PENDING` |
| `TASK-04` | User Directory & Role Management UI | Admin views to search users, inspect accounts, and assign admin/support roles | [`TASK_04_IMPLEMENTATION_GUIDE.md`](./TASK_04_IMPLEMENTATION_GUIDE.md) | `PENDING` |
| `TASK-05` | Account Suspension & Deletion Moderation Actions | Trigger suspend/unblock or soft-delete endpoints via `services/auth` | [`TASK_05_IMPLEMENTATION_GUIDE.md`](./TASK_05_IMPLEMENTATION_GUIDE.md) | `PENDING` |

---

## 3. TASK LIST

### `TASK-01`: Admin Sign-In Screen
- **Description:** Build responsive login view at `/login` with email and password inputs.
  Validate inputs using Zod and submit authentication requests to `services/auth`.
- **Guide:** [`TASK_01_IMPLEMENTATION_GUIDE.md`](./TASK_01_IMPLEMENTATION_GUIDE.md) (Covers scope, step-by-step code, test cases, and security gates.)

### `TASK-02`: HTTP-Only Cookie Session & Next.js Proxy Routes
- **Description:** Implement Next.js App Router route handlers at `/api/auth/session` to store JWT tokens in encrypted HTTP-only cookies.
  Expose session retrieval helper for React Server Components.
- **Guide:** [`TASK_02_IMPLEMENTATION_GUIDE.md`](./TASK_02_IMPLEMENTATION_GUIDE.md) (Covers scope, step-by-step code, test cases, and security gates.)

### `TASK-03`: Next.js Middleware Route Protection
- **Description:** Configure root Next.js `middleware.ts` to inspect session tokens on all protected routes.
  Redirect unauthenticated or non-admin users to `/login` with return URL preservation.
- **Guide:** [`TASK_03_IMPLEMENTATION_GUIDE.md`](./TASK_03_IMPLEMENTATION_GUIDE.md) (Covers scope, step-by-step code, test cases, and security gates.)

### `TASK-04`: User Directory & Role Management UI
- **Description:** Build user management data table at `/users` consuming `services/auth` user listing endpoints.
  Support filtering by email, registration date, and role (`user`, `support`, `admin`).
- **Guide:** [`TASK_04_IMPLEMENTATION_GUIDE.md`](./TASK_04_IMPLEMENTATION_GUIDE.md) (Covers scope, step-by-step code, test cases, and security gates.)

### `TASK-05`: Account Suspension & Deletion Moderation Actions
- **Description:** Implement moderation action buttons to suspend, unblock, or soft-delete user accounts.
  Confirm destructive actions with a modal dialog and invoke administrative endpoints in `services/auth`.
- **Guide:** [`TASK_05_IMPLEMENTATION_GUIDE.md`](./TASK_05_IMPLEMENTATION_GUIDE.md) (Covers scope, step-by-step code, test cases, and security gates.)
