# TASK LIST: WEB_ADMIN_AUTH

## 1. COMPONENT DETAILS

- **Component Name:** `apps/admin` (Admin Authentication & User Directory Suite)
- **Domain:** Forginity Admin Console Authentication, Directory, and Moderation
- **Purpose:** Secure the Forginity Admin Portal (`apps/admin`) with passwordless administrative login (Email + OTP), HTTP-only session cookies, Next.js middleware protected route guards, and an administrative user management directory via integration with `services/auth`.
- **Key Features & Flows:**
  - Dedicated admin passwordless login screen (Email entry, 6-digit OTP prompt, client Zod validation).
  - HTTP-only cookie session handling and Next.js route middleware protecting `/users`, `/products`, etc.
  - Interactive user directory data table at `/users` consuming `services/auth` `GET /api/users` with search, status filtering, and pagination.
  - View User detail drawer / modal consuming `GET /api/users/:userId` with full user metadata, emergency contacts, and moderation actions (`active`, `blocked`, `deleted`).
- **Tech Stack:** Next.js 16 (App Router), React 19, Tailwind CSS v4, Shadcn UI (`@workspace/ui`), TypeScript, TanStack Query v5.
- **Component Status:** `PENDING` (0/3 tasks completed; target deadline: **Tomorrow, 2026-11-14**).
- **Central Implementation Record:** [`../IMPLEMENTATION_RECORD.md`](../IMPLEMENTATION_RECORD.md)
- **Overall Progress:** [`../PROGRESS.md`](../PROGRESS.md)

---

## 2. PROGRESSIVE TASK MATRIX

| Task ID | Task Title | Key Deliverable | Guide File | Status |
| :--- | :--- | :--- | :--- | :--- |
| `TASK-01` | Login Screen UI & Login API Integration (Email + OTP) | Responsive `/login` view, email OTP initiation & verify form, HTTP-only session cookies, and Next.js `middleware.ts` route protection | [`TASK_01_IMPLEMENTATION_GUIDE.md`](./TASK_01_IMPLEMENTATION_GUIDE.md) | `PENDING` |
| `TASK-02` | User List UI & Directory API Integration | Interactive responsive data table at `/users`, TanStack Query fetching `GET /api/users`, search filter, status tabs, pagination, and zero-CLS skeleton | [`TASK_02_IMPLEMENTATION_GUIDE.md`](./TASK_02_IMPLEMENTATION_GUIDE.md) | `PENDING` |
| `TASK-03` | View User UI & Account Moderation Integration | Slide-over user detail drawer at `/users` consuming `GET /api/users/:userId`, contact stats, and block/unblock action dialogs triggering `PATCH /api/users/:userId/status` | [`TASK_03_IMPLEMENTATION_GUIDE.md`](./TASK_03_IMPLEMENTATION_GUIDE.md) | `PENDING` |

---

## 3. TASK LIST

### `TASK-01`: Login Screen UI & Login API Integration (Email + OTP)
- **Target Completion Date:** 2026-11-14 (Tomorrow)
- **Description:** Build responsive login view at `/login` supporting two-step passwordless Email + OTP authentication:
  - Step 1: Input admin email address, validate format via Zod, and dispatch `POST /api/auth/email/initiate` to `services/auth`.
  - Step 2: Render 6-digit numeric OTP input code screen, submit verification to `POST /api/auth/email/verify`.
  - Enforce `userType === "admin"` check. If caller is not an admin, reject with unauthorized notification.
  - Store JWT tokens in secure HTTP-only cookies (`admin_session`) and configure root Next.js `middleware.ts` to guard `/`, `/users`, and `/products`.
- **Guide:** [`TASK_01_IMPLEMENTATION_GUIDE.md`](./TASK_01_IMPLEMENTATION_GUIDE.md)

### `TASK-02`: User List UI & Directory API Integration
- **Target Completion Date:** 2026-11-14 (Tomorrow)
- **Description:** Build user management directory data table at `/users` consuming `services/auth` `GET /api/users`:
  - Connect TanStack Query `useQuery` hook with debounced search input (by name or email) and status tab filter (`All`, `Active`, `Blocked`, `Deleted`).
  - Render touch-friendly horizontal scroll table (`min-w-[850px]`) with avatar, full name, provider badge, verification indicators, and formatted timestamps.
  - Implement zero-CLS loading skeleton matching table container geometry and row count.
- **Guide:** [`TASK_02_IMPLEMENTATION_GUIDE.md`](./TASK_02_IMPLEMENTATION_GUIDE.md)

### `TASK-03`: View User UI & Account Moderation Integration
- **Target Completion Date:** 2026-11-14 (Tomorrow)
- **Description:** Implement detailed user inspection drawer and moderation actions:
  - Slide-over sheet component opening on row click, fetching full account profile via `GET /api/users/:userId` (demographics, emergency contacts count, active sessions).
  - Moderation action triggers: Block User, Unblock User, and Soft Delete Account.
  - Destructive action confirmation modal warning that blocking immediately purges all active database sessions across devices.
  - Submit `PATCH /api/users/:userId/status` and invalidate TanStack Query cache.
- **Guide:** [`TASK_03_IMPLEMENTATION_GUIDE.md`](./TASK_03_IMPLEMENTATION_GUIDE.md)
