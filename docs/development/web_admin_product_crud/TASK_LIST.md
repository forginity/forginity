# TASK LIST: WEB_ADMIN_PRODUCT_CRUD

## 1. COMPONENT DETAILS

- **Component Name:** `apps/admin` (Product CRUD & Maintenance Suite)
- **Domain:** Forginity Admin Console Product Lifecycle & Maintenance Management
- **Purpose:** Administrative interface within the Forginity Admin Portal (`apps/admin`) to view, create, update, deprecate, and configure products, maintenance windows, and version tracks in `services/products`.
- **Key Features & Flows:**
  - Product catalog table with search and lifecycle filter badges.
  - Create and edit product drawer with Zod schema validation.
  - Maintenance window scheduling interface with time validation.
  - Release version registry manager.
  - Interactive toast feedback on create, edit, and delete operations.
- **Tech Stack:** Next.js 16 (App Router), React 19, Tailwind CSS v4, Shadcn UI (`@workspace/ui`), TypeScript.
- **Reference Specification:** [`./README.md`](./README.md)
- **Implementation Record:** [`./IMPLEMENTATIONS_RECORD.md`](file:///home/vikas/Documents/forginity/docs/development/web_admin_product_crud/IMPLEMENTATIONS_RECORD.md)

---

## 2. PROGRESSIVE TASK MATRIX

| Task ID | Task Title | Key Deliverable | Guide File | Status |
| :--- | :--- | :--- | :--- | :--- |
| `TASK-01` | Product Catalog Table & Status Filtering | Data table consuming `GET /api/products`, search by name/slug, status badges | [`TASK_01_IMPLEMENTATION_GUIDE.md`](./TASK_01_IMPLEMENTATION_GUIDE.md) | `PENDING` |
| `TASK-02` | Create & Edit Product Drawer | Form validation with Zod, calling `POST /api/products` and `PATCH /api/products/:id` | [`TASK_02_IMPLEMENTATION_GUIDE.md`](./TASK_02_IMPLEMENTATION_GUIDE.md) | `PENDING` |
| `TASK-03` | Product Deletion & Soft-Deprecate Workflow | Confirmation modal calling `DELETE /api/products/:id`, cascade warnings | [`TASK_03_IMPLEMENTATION_GUIDE.md`](./TASK_03_IMPLEMENTATION_GUIDE.md) | `PENDING` |
| `TASK-04` | Maintenance Windows Scheduling Interface | List and schedule maintenance windows via `POST /api/products/:productId/maintenance` | [`TASK_04_IMPLEMENTATION_GUIDE.md`](./TASK_04_IMPLEMENTATION_GUIDE.md) | `PENDING` |
| `TASK-05` | Version Control & Release Track Manager | Release version registry UI, `POST /api/products/:productId/versions` | [`TASK_05_IMPLEMENTATION_GUIDE.md`](./TASK_05_IMPLEMENTATION_GUIDE.md) | `PENDING` |

---

## 3. TASK LIST

### `TASK-01`: Product Catalog Table & Status Filtering
- **Description:** Build responsive data table displaying products fetched from `services/products`.
  Implement text search filtering by name or slug, and status tab filtering (`All`, `Active`, `Beta`, `Deprecated`).
- **Guide:** [`TASK_01_IMPLEMENTATION_GUIDE.md`](./TASK_01_IMPLEMENTATION_GUIDE.md) (Covers scope, step-by-step code, test cases, and security gates.)

### `TASK-02`: Create & Edit Product Drawer
- **Description:** Implement slide-over drawer containing form fields for product name, URL slug, and description.
  Bind form submission to `POST /api/products` and `PATCH /api/products/:id` with real-time Zod error feedback.
- **Guide:** [`TASK_02_IMPLEMENTATION_GUIDE.md`](./TASK_02_IMPLEMENTATION_GUIDE.md) (Covers scope, step-by-step code, test cases, and security gates.)

### `TASK-03`: Product Deletion & Soft-Deprecate Workflow
- **Description:** Build confirmation dialog for deprecating or deleting products with safety confirmation inputs.
  Execute `DELETE /api/products/:id` and update table state upon successful removal.
- **Guide:** [`TASK_03_IMPLEMENTATION_GUIDE.md`](./TASK_03_IMPLEMENTATION_GUIDE.md) (Covers scope, step-by-step code, test cases, and security gates.)

### `TASK-04`: Maintenance Windows Scheduling Interface
- **Description:** Build interface to manage maintenance periods for specific products or global platform.
  Validate datetime pickers preventing start times in the past or end times prior to start times.
- **Guide:** [`TASK_04_IMPLEMENTATION_GUIDE.md`](./TASK_04_IMPLEMENTATION_GUIDE.md) (Covers scope, step-by-step code, test cases, and security gates.)

### `TASK-05`: Version Control & Release Track Manager
- **Description:** Build version history list displaying semantic versions and support statuses (`latest`, `supported`, `deprecated`).
  Provide modal to register new version releases tied to the selected product.
- **Guide:** [`TASK_05_IMPLEMENTATION_GUIDE.md`](./TASK_05_IMPLEMENTATION_GUIDE.md) (Covers scope, step-by-step code, test cases, and security gates.)
