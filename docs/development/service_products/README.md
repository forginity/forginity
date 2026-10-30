# SERVICE SPECIFICATION: SERVICE_PRODUCTS

## 1. EXECUTIVE SUMMARY

- **Service Name:** `services/products`
- **Domain:** Centralized Product Catalog, Feature Flags, Maintenance Windows, and Version Registry
- **Owner:** Forginity Core Platform Team
- **Purpose:** `services/products` serves as the authoritative product metadata and capability registry for the entire Forginity ecosystem. It manages distinct application products, controls feature flag enablement across environments, coordinates scheduled system maintenance windows, and registers supported software version release tracks.
- **Consumers:**
  - **Frontend Applications:** `apps/shell` (Host container), `apps/admin` (Management portal), and client application frontends.
  - **Backend Microservices:** `services/auth` (User product authorization & onboarding), `services/payment-api` (Subscription billing), and `services/notification-api`.
- **Development Roadmap:** [`./TASK_LIST.md`](./TASK_LIST.md)
- **Implementation Record:** [`./IMPLEMENTATIONS_RECORD.md`](./IMPLEMENTATIONS_RECORD.md)

---

## 2. BUSINESS & FUNCTIONAL REQUIREMENTS

### Core Capabilities
- **Product Entity Lifecycle:** Register, update, query, and deprecate platform products (e.g., TrackRide, Custom Apparel, Automated Screening) with unique URL-safe slugs and operational statuses.
- **Maintenance Coordination:** Schedule, announce, and manage maintenance periods per product or globally, providing start/end timestamps and user-facing notifications.
- **Version Compatibility Registry:** Track active releases, current release versions (`latest`), and backward-compatible version deprecations (`supported`, `deprecated`).

### Workflows
1. **Product Provisioning Flow:**
   - Admin or automated orchestrator submits product payload (`slug`, `name`, `status`).
   - System validates unique slug format and creates product record.
   - Downstream services can query product identity by UUID (`:id`) or slug (`/slug/:slug`).
2. **Scheduled Maintenance Flow:**
   - Operator posts maintenance window specifying `startsAt`, `endsAt`, and `message`.
   - APIs serve active maintenance status to client apps to display graceful degradation notices.

### Edge Cases & Failure Modes
- **Duplicate Slug Conflict:** Creation or rename with an existing slug returns `409 Conflict`.
- **Malformed Identifiers:** Ingress requests validate UUID or slug formats strictly via Zod; invalid patterns return `400 Bad Request`.
- **Orphan Prevention:** Deleting a product triggers cascade deletion across its maintenance schedules and version entries.
- **Invalid Maintenance Timestamps:** Maintenance end time must strictly succeed start time (`endsAt > startsAt`).

---

## 3. ARCHITECTURE & TECH STACK

- **Runtime Framework:** Node.js, Express 5, TypeScript.
- **Database Architecture:** PostgreSQL 18 with Drizzle ORM (Database-per-Service isolation).
- **Validation Engine:** Zod runtime validation with Type-First inferred contracts and separated domain constants.
- **Testing Framework:** Vitest with Supertest.
- **Architectural Reference:** [`services/products`](file:///home/vikas/Documents/forginity/services/products)

---

## 4. DOMAIN DATA MODELS

Managed within `src/db/products.schema.ts`:

- **Products (`products`):**
  - `id` (UUID, Primary Key, auto-generated)
  - `slug` (VARCHAR(100), Unique, Not Null, lowercase-alphanumeric with hyphens)
  - `name` (VARCHAR(255), Not Null)
  - `status` (VARCHAR(50), Default `"active"`, values: `alpha`, `beta`, `active`, `deprecated`)
  - `createdAt` (TIMESTAMPTZ, Default `NOW()`, Not Null)

- **Product Maintenance (`product_maintenance`):**
  - `id` (UUID, Primary Key, auto-generated)
  - `productId` (UUID, Foreign Key -> `products.id` on cascade delete, indexed)
  - `startsAt` (TIMESTAMPTZ, Not Null)
  - `endsAt` (TIMESTAMPTZ, Not Null)
  - `status` (VARCHAR(50), Default `"scheduled"`, values: `scheduled`, `active`, `completed`, `cancelled`, indexed)
  - `message` (TEXT, Not Null)

- **Product Versions (`product_versions`):**
  - `id` (UUID, Primary Key, auto-generated)
  - `productId` (UUID, Foreign Key -> `products.id` on cascade delete, indexed)
  - `version` (VARCHAR(50), Not Null, SemVer format)
  - `status` (VARCHAR(50), Default `"latest"`, values: `latest`, `supported`, `deprecated`)

---

## 5. API SPECIFICATIONS

Summary of endpoints exposed under `/api`:

| Method | Endpoint | Description | Auth Required |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/health` | Health & readiness check returning service status, uptime, and database connection state (200 OK / 503 Unavailable) | No |
| `GET` | `/api/products` | List products with pagination, search, and status filter | No |
| `GET` | `/api/products/:id` | Retrieve product by UUID `id` (`?includeRelations=true`) | No |
| `GET` | `/api/products/slug/:slug` | Retrieve product by unique `slug` (`?includeRelations=true`) | No |
| `POST` | `/api/products` | Create a new product | Yes (Admin) |
| `PATCH` | `/api/products/:id` | Update product by UUID `id` | Yes (Admin) |
| `DELETE` | `/api/products/:id` | Delete product by UUID `id` | Yes (Admin) |
| `GET` | `/api/products/:id/maintenance` | List maintenance schedules for product | No |
| `POST` | `/api/products/:id/maintenance` | Schedule maintenance window | Yes (Admin) |
| `PATCH` | `/api/products/maintenance/:id` | Update maintenance window | Yes (Admin) |
| `DELETE` | `/api/products/maintenance/:id` | Cancel/delete maintenance window | Yes (Admin) |
| `GET` | `/api/products/:id/versions` | List product versions | No |
| `POST` | `/api/products/:id/versions` | Register new product version | Yes (Admin) |
| `PATCH` | `/api/products/versions/:id` | Update version status | Yes (Admin) |
| `DELETE` | `/api/products/versions/:id` | Delete product version | Yes (Admin) |

---

## 6. SECURITY & COMPLIANCE

- **Zero `.env` Access:** Never inspect, create, or modify `.env` files. Environment variables are accessed strictly via `process.env`.
- **Input Sanitization:** All incoming requests (params, queries, bodies) pass through strict Zod validators prior to controller execution.
- **SQL Parameterization:** All queries execute via Drizzle ORM query builders, preventing SQL injection vulnerabilities.
- **Relational Integrity:** Foreign keys enforce strict cascade deletions to avoid orphaned feature or maintenance records.
