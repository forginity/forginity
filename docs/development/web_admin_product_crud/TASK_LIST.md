# TASK LIST: WEB_ADMIN_PRODUCT_CRUD & FORGINITY SDK

## 1. COMPONENT DETAILS

- **Component Name:** `packages/sdk` & `apps/admin` (Product CRUD & Maintenance Suite)
- **Domain:** Forginity Client SDK & Admin Console Product Lifecycle & Maintenance Management
- **Purpose:** Provide a scalable, multi-product client data fetching foundation (`@forginity/sdk`) and build the administrative interface within the Forginity Admin Portal (`apps/admin`) to view, create, update, deprecate, and configure products, maintenance windows, and version tracks in `services/products` with role-based access control.
- **Key Features & Flows:**
  - Scalable `@forginity/sdk` package with modular domain folders (`/products`, `/auth`, etc.).
  - Central Axios instance with request auth interceptors and normalized `ApiError` response interceptors.
  - Pure async service methods and reactive TanStack Query hooks with typed cache keys.
  - Product catalog table in `apps/admin` with search and lifecycle filter badges.
  - Create and edit product drawer with Zod schema validation.
  - Maintenance window scheduling interface with time validation.
  - Release version registry manager.
  - Admin RBAC guards on mutating operations (create, update, delete).
  - Interactive toast feedback on create, edit, and delete operations.
- **Tech Stack:** Next.js 16 (App Router), React 19, Tailwind CSS v4, Shadcn UI (`@workspace/ui`), `@forginity/sdk` (Axios, `@tanstack/react-query`), TypeScript.
- **Central Implementation Record:** [`../IMPLEMENTATION_RECORD.md`](../IMPLEMENTATION_RECORD.md)
- **Overall Progress:** [`../PROGRESS.md`](../PROGRESS.md)

---

## 2. PROGRESSIVE TASK MATRIX

| Task ID | Task Title | Key Deliverable | Guide File | Status |
| :--- | :--- | :--- | :--- | :--- |
| `TASK-01` | Scaffold `@forginity/sdk` Package Foundation & Core HTTP Client | `packages/sdk` config, Axios client, interceptors, `ApiError` normalization, pnpm workspace link | [`TASK_01_IMPLEMENTATION_GUIDE.md`](./TASK_01_IMPLEMENTATION_GUIDE.md) | `COMPLETED` |
| `TASK-02` | Implement Product Domain SDK (Endpoints, Services & Query Hooks) | Pure async methods, cache key factories, `useProducts` query & mutation hooks in `@forginity/sdk` | [`TASK_02_IMPLEMENTATION_GUIDE.md`](./TASK_02_IMPLEMENTATION_GUIDE.md) | `COMPLETED` |
| `TASK-03` | Integrate SDK in `apps/admin` & Build Product Catalog Table | `QueryProvider` setup, live data table consuming `useProducts`, search by name/slug, status tabs | [`TASK_03_IMPLEMENTATION_GUIDE.md`](./TASK_03_IMPLEMENTATION_GUIDE.md) | `COMPLETED` |
| `TASK-04` | Create & Edit Product Views (Figma Aligned) | Form validation with Zod, calling `useCreateProduct` & `useUpdateProduct` with cache invalidation | [`TASK_04_IMPLEMENTATION_GUIDE.md`](./TASK_04_IMPLEMENTATION_GUIDE.md) | `COMPLETED` |
| `TASK-05` | Product Deletion Workflow (Figma Aligned) | Confirmation screen calling `useDeleteProduct`, cascade warnings, table state removal | [`TASK_05_IMPLEMENTATION_GUIDE.md`](./TASK_05_IMPLEMENTATION_GUIDE.md) | `COMPLETED` |
| `TASK-06` | Maintenance Windows Scheduling Interface | List and schedule maintenance windows via `useProductMaintenance` & `useCreateMaintenance` | [`TASK_06_IMPLEMENTATION_GUIDE.md`](./TASK_06_IMPLEMENTATION_GUIDE.md) | `COMPLETED` |
| `TASK-07` | Version Control & Release Track Manager | Release version registry UI, `useProductVersions` & `useCreateVersion` | [`TASK_07_IMPLEMENTATION_GUIDE.md`](./TASK_07_IMPLEMENTATION_GUIDE.md) | `PENDING` |
| `TASK-08` | Implement Admin RBAC Guards on Mutating Endpoints | Route guards & UI permissions restricting create, edit, delete actions to Admin role | [`TASK_08_IMPLEMENTATION_GUIDE.md`](./TASK_08_IMPLEMENTATION_GUIDE.md) | `PENDING` |

---

## 3. TASK LIST

### `TASK-01`: Scaffold `@forginity/sdk` Package Foundation & Core HTTP Client
- **Description:** Scaffold the shared client SDK package at `packages/sdk` with TypeScript configuration and pnpm workspace integration. Implement the core Axios HTTP client instance, request interceptor (extensible for JWT token injection and correlation IDs), response interceptor (normalizing errors to standard `ApiError`), and base URL configuration.
- **Guide:** [`TASK_01_IMPLEMENTATION_GUIDE.md`](./TASK_01_IMPLEMENTATION_GUIDE.md)

### `TASK-02`: Implement Product Domain SDK (Endpoints, Services & Query Hooks)
- **Description:** Implement the modular products domain under `packages/sdk/src/modules/products/`. Define DTO types matching `services/products` validators, centralize route endpoints in `constants/endpoints.ts`, build pure async methods in `products.service.ts`, and create TanStack Query hooks (`useProducts`, `useProduct`, `useCreateProduct`, `useUpdateProduct`, `useDeleteProduct`) with stable query key factories.
- **Guide:** [`TASK_02_IMPLEMENTATION_GUIDE.md`](./TASK_02_IMPLEMENTATION_GUIDE.md)

### `TASK-03`: Integrate SDK in `apps/admin` & Build Product Catalog Table
- **Description:** Link `@forginity/sdk` into `apps/admin`. Set up `<QueryProvider>` in `apps/admin/app/layout.tsx` with App Router safe client caching. Update `apps/admin/app/products/page.tsx` to consume `useProducts()`, implementing live real-time search, category/status tabs (`All`, `Active`, `Maintenance`, `Draft`), loading skeletons, and empty state feedback.
- **Guide:** [`TASK_03_IMPLEMENTATION_GUIDE.md`](./TASK_03_IMPLEMENTATION_GUIDE.md)

### `TASK-04`: Create & Edit Product Drawer
- **Description:** Implement slide-over drawer containing form fields for product name, URL slug, and description. Bind form submission to `useCreateProduct` and `useUpdateProduct` with real-time Zod error feedback and automatic query cache invalidation.
- **Guide:** [`TASK_04_IMPLEMENTATION_GUIDE.md`](./TASK_04_IMPLEMENTATION_GUIDE.md)

### `TASK-05`: Product Deletion & Soft-Deprecate Workflow
- **Description:** Build confirmation dialog for deprecating or deleting products with safety confirmation inputs. Execute `useDeleteProduct`, invalidate product list queries, and display feedback toasts.
- **Guide:** [`TASK_05_IMPLEMENTATION_GUIDE.md`](./TASK_05_IMPLEMENTATION_GUIDE.md)

### `TASK-06`: Maintenance Windows Scheduling Interface
- **Description:** Build interface to manage maintenance periods for specific products or global platform. Validate datetime pickers preventing start times in the past or end times prior to start times, wired to maintenance SDK hooks.
- **Guide:** [`TASK_06_IMPLEMENTATION_GUIDE.md`](./TASK_06_IMPLEMENTATION_GUIDE.md)

### `TASK-07`: Version Control & Release Track Manager
- **Description:** Build version history list displaying semantic versions and support statuses (`latest`, `supported`, `deprecated`). Provide modal to register new version releases tied to the selected product via version SDK hooks.
- **Guide:** [`TASK_07_IMPLEMENTATION_GUIDE.md`](./TASK_07_IMPLEMENTATION_GUIDE.md)

### `TASK-08`: Implement Admin RBAC Guards on Mutating Endpoints
- **Description:** Enforce administrative role verification on all mutating product actions (create, edit, delete, maintenance scheduling). Conditionally hide or disable mutation controls for read-only / support operators, returning clean authorization error toasts.
- **Guide:** [`TASK_08_IMPLEMENTATION_GUIDE.md`](./TASK_08_IMPLEMENTATION_GUIDE.md)
