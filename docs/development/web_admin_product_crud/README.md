# COMPONENT SPECIFICATION: WEB_ADMIN_PRODUCT_CRUD

## 1. EXECUTIVE SUMMARY

- **Component Name:** `apps/admin` (Product CRUD & Maintenance Suite)
- **Folder Reference:** `docs/development/web_admin_product_crud`
- **Domain:** Forginity Admin Console Product Lifecycle & Maintenance Management
- **Owner:** Platform Frontend & Admin Engineering Team
- **Purpose:** Provide an administrative interface within the Forginity Admin Portal (`apps/admin`) to view, create, update, deprecate, and configure products registered in `services/products`. Supports scheduling maintenance windows and publishing version releases.
- **Consumers:** Internal platform administrators and product managers.
- **Development Roadmap:** [`./TASK_LIST.md`](./TASK_LIST.md)
- **Implementation Record:** [`./IMPLEMENTATIONS_RECORD.md`](./IMPLEMENTATIONS_RECORD.md)

---

## 2. BUSINESS & FUNCTIONAL REQUIREMENTS

### Core Capabilities
- **Product Catalog Table:** Tabular listing of all platform products with columns for name, slug, description, lifecycle status (`alpha`, `beta`, `active`, `deprecated`), and created date.
- **Create Product Modal / Drawer:** Slide-over form with client-side Zod validation for registering new products via `POST /api/products`.
- **Edit & Status Updates:** Modal to update product metadata and toggle operational status via `PATCH /api/products/:id`.
- **Product Maintenance Management:** Dedicated tab to view active maintenance notices, schedule maintenance periods, and cancel scheduled windows via `POST /api/products/:productId/maintenance`.
- **Version Control Manager:** View and register semantic version releases (`latest`, `supported`, `deprecated`) via `POST /api/products/:productId/versions`.

### User Flows & Workflows
1. **Register New Product:**
   - Admin opens `/products` route in Admin Portal.
   - Admin clicks "Add Product", filling in Name, Slug, Description, and initial status.
   - Form validates slug format and submits payload to `services/products`.
   - Table revalidates and displays newly created product with instant feedback toast.
2. **Schedule Maintenance Window:**
   - Admin navigates to product detail page at `/products/[id]`.
   - Admin selects "Maintenance" tab and clicks "Schedule Window".
   - Admin sets Start Time, End Time, and broadcast alert message.
   - System registers maintenance window with automatic validation preventing end times before start times.

---

## 3. ARCHITECTURE & TECH STACK

- **Framework:** Next.js 16 App Router, React 19, TypeScript.
- **UI Components:** Shadcn UI (`@workspace/ui`), Tailwind CSS v4, Lucide React icons.
- **Data Fetching:** React Server Components with Server Actions or client fetch hooks consuming `services/products` REST API.
- **Validation:** Zod client schemas aligned with `services/products` validator contracts.
- **Backend Service Consumed:** [`services/products`](file:///home/vikas/Documents/forginity/services/products).

---

## 4. APPLICATION ROUTES

Managed within `apps/admin/app`:

- `/products` - Product catalog data table, status filtering, and creation drawer.
- `/products/[id]` - Product detail view, lifecycle settings, and version list.
- `/products/[id]/maintenance` - Maintenance window calendar and scheduling drawer.

---

## 5. SECURITY & COMPLIANCE

- **Zero `.env` Access:** Backend API URLs are read strictly from runtime environment configurations.
- **Form Sanitization:** All text inputs are validated through Zod before network submission.
- **Network Boundary:** Requests include admin credentials and validate against central product contracts.
