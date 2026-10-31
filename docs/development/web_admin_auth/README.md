# COMPONENT SPECIFICATION: WEB_ADMIN_AUTH

## 1. EXECUTIVE SUMMARY

- **Component Name:** `apps/admin` (Admin Authentication & User Moderation Suite)
- **Folder Reference:** `docs/development/web_admin_auth`
- **Domain:** Forginity Admin Console Authentication, RBAC, and User Management
- **Owner:** Platform Security & Identity Engineering Team
- **Purpose:** Secure the Forginity Admin Portal (`apps/admin`) with administrative authentication, HTTP-only session cookies, Next.js middleware protected route guards, and an administrative user management directory via integration with `services/auth`.
- **Consumers:** Internal platform administrators, security operators, and support engineers.
- **Development Roadmap:** [`./TASK_LIST.md`](./TASK_LIST.md)
- **Implementation Record:** [`./IMPLEMENTATIONS_RECORD.md`](./IMPLEMENTATIONS_RECORD.md)

---

## 2. BUSINESS & FUNCTIONAL REQUIREMENTS

### Core Capabilities
- **Admin Sign-In Screen:** Dedicated administrative login interface at `/login` with credentials validation against `services/auth`.
- **HTTP-Only Cookie Session Handling:** Secure storage of session JWTs in encrypted HTTP-only cookies, preventing XSS access.
- **Next.js Middleware Protection:** Edge middleware route guard intercepting unauthenticated requests and redirecting to `/login`.
- **User Directory & Account Search:** Administrative data table to browse all platform users, search by email or UUID, and view account statuses.
- **User Moderation Controls:** Capabilities to change user roles (e.g. `user`, `support`, `admin`), suspend active accounts, and execute soft-deletions via `services/auth`.

### User Flows & Workflows
1. **Admin Login:**
   - Operator visits `admin.forginity.com` without an active session.
   - Next.js middleware intercepts request and redirects to `/login`.
   - Operator enters administrative email and password.
   - App calls `services/auth` sign-in endpoint, verifies admin role, sets HTTP-only session cookie, and navigates to the dashboard.
2. **Account Moderation:**
   - Operator visits `/users` and filters for a reported account.
   - Operator reviews session logs and account creation date.
   - Operator triggers account suspension, instantly revoking all active user tokens across services.

---

## 3. ARCHITECTURE & TECH STACK

- **Framework:** Next.js 16 App Router, React 19, TypeScript.
- **UI Components:** Shadcn UI (`@workspace/ui`), Tailwind CSS v4, Lucide React icons.
- **Route Guard:** Next.js Edge Middleware (`middleware.ts`).
- **Session Strategy:** Iron Session or secure HTTP-only cookie store.
- **Backend Service Consumed:** [`services/auth`](file:///home/vikas/Documents/forginity/services/auth).

---

## 4. APPLICATION ROUTES

Managed within `apps/admin/app`:

- `/login` - Administrative sign-in portal.
- `/users` - User directory, role management, and account moderation interface.
- `/users/[id]` - Detailed user profile, login sessions, and permission assignments.

---

## 5. SECURITY & COMPLIANCE

- **Zero `.env` Access:** Auth endpoints and secrets are resolved strictly via runtime process environments.
- **RBAC Enforcement:** Non-admin accounts attempting to sign into `apps/admin` receive an explicit 403 Forbidden error.
- **Cookie Security:** Cookies enforce `HttpOnly`, `SameSite=Lax`, and `Secure` attributes across all production environments.
