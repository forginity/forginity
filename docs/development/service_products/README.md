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
- **Interactive OpenAPI Documentation:** Automatically produce and serve OpenAPI 3.0 documentation synchronized with runtime Zod validators at `/api/docs` and `/api/docs.json`.

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
- **Documentation Engine:** `@asteasolutions/zod-to-openapi` and `swagger-ui-express`.
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
| `GET` | `/api/docs` | Interactive Swagger UI API documentation and live explorer | No |
| `GET` | `/api/docs.json` | Raw OpenAPI 3.0 JSON specification contract | No |
| `GET` | `/api/products` | List products with pagination, search, and status filter | No |
| `GET` | `/api/products/:id` | Retrieve product by UUID `id` (`?includeRelations=true`) | No |
| `GET` | `/api/products/slug/:slug` | Retrieve product by unique `slug` (`?includeRelations=true`) | No |
| `POST` | `/api/products` | Create a new product | Yes (Admin) |
| `PATCH` | `/api/products/:id` | Update product by UUID `id` | Yes (Admin) |
| `DELETE` | `/api/products/:id` | Delete product by UUID `id` | Yes (Admin) |
| `GET` | `/api/products/maintenance/active` | List all active maintenance schedules across the platform | No |
| `GET` | `/api/products/maintenance/:id` | Get single maintenance window record by maintenance UUID | No |
| `PATCH` | `/api/products/maintenance/:id` | Update maintenance window by maintenance UUID | Yes (Admin) |
| `DELETE` | `/api/products/maintenance/:id` | Cancel/delete maintenance window by maintenance UUID | Yes (Admin) |
| `GET` | `/api/products/:id/maintenance` | List maintenance schedules for product by product UUID | No |
| `POST` | `/api/products/:id/maintenance` | Schedule maintenance window for product by product UUID | Yes (Admin) |
| `GET` | `/api/products/versions/:id` | Get single product release version record by version UUID | No |
| `PATCH` | `/api/products/versions/:id` | Update version status by version UUID | Yes (Admin) |
| `DELETE` | `/api/products/versions/:id` | Delete product version by version UUID | Yes (Admin) |
| `GET` | `/api/products/:id/versions` | List product versions by product UUID | No |
| `POST` | `/api/products/:id/versions` | Register new product version by product UUID | Yes (Admin) |

---

## 6. GETTING STARTED & LOCAL OPERATIONS

### 1. Prerequisites

Start the shared PostgreSQL database container from the monorepo root:

```bash
docker compose up -d
```

You can also run the root package shortcut:

```bash
pnpm db:up
```

Configure required environment variables:

```bash
PORT=4000
DATABASE_URL=postgres://postgres:postgres@localhost:5432/forginity_products
NODE_ENV=development
```

### 2. Database Migrations

Apply database schema migrations:

```bash
pnpm --filter @services/products db:migrate
```

To inspect database records visually, run:

```bash
pnpm --filter @services/products db:studio
```

### 3. How to Seed the Database

The database seeding script lives in `src/db/seed.ts`.
It tests database connectivity and inserts default platform products (`project_1` and `project_2`) safely:

```bash
pnpm --filter @services/products db:seed
```

### 4. How to Start the Service

To run the development server with live watch mode:

```bash
pnpm --filter @services/products dev
```

The service starts on port `4000`.
To build and run in production:

```bash
pnpm --filter @services/products build
pnpm --filter @services/products start
```

---

## 7. SWAGGER & OPENAPI DOCUMENTATION

The service exposes interactive Swagger UI documentation and raw JSON OpenAPI 3.0 contracts.
All endpoint paths and payload types derive directly from runtime Zod schemas.

### Interactive Swagger UI URL

Start the service with `pnpm --filter @services/products dev`, then open:

```text
http://localhost:4000/api/docs
```

### Raw OpenAPI JSON Specification URL

To access the raw OpenAPI 3.0 JSON specification:

```text
http://localhost:4000/api/docs.json
```

---

## 8. TESTING & VERIFICATION

To run static type checking without emitting artifacts:

```bash
pnpm --filter @services/products typecheck
```

To run all automated unit and integration tests with Vitest:

```bash
pnpm --filter @services/products test
```

---

## 9. SECURITY & COMPLIANCE

- **Zero `.env` Access:** Never inspect, create, or modify `.env` files. Environment variables are accessed strictly via `process.env`.
- **Input Sanitization:** All incoming requests (params, queries, bodies) pass through strict Zod validators prior to controller execution.
- **SQL Parameterization:** All queries execute via Drizzle ORM query builders, preventing SQL injection vulnerabilities.
- **Relational Integrity:** Foreign keys enforce strict cascade deletions to avoid orphaned feature or maintenance records.
