# Products Service (`@services/products`)

Authoritative product catalog, maintenance window coordinator, and version registry for the Forginity monorepo platform.

## What Products Service Is

The Products Service is a dedicated backend microservice.
It serves as the single source of truth for platform product definitions, scheduled maintenance notices, and software release version tracks across Forginity applications.

### Primary Responsibilities

- **Product Catalog Management.** Tracks registered platform products with unique URL-safe slugs and operational lifecycles (`alpha`, `beta`, `active`, `deprecated`).
- **Maintenance Coordination.** Schedules and publishes maintenance windows with start and end times to give client frontends advance notice of scheduled downtime.
- **Version Compatibility Registry.** Registers software release versions with semantic versioning tags and support statuses (`latest`, `supported`, `deprecated`).
- **OpenAPI 3.0 Documentation.** Serves interactive Swagger UI documentation generated directly from authoritative Zod runtime schemas.

### Primary Consumers

- **Frontend Applications.** `apps/shell` and `apps/admin`.
- **Backend Microservices.** `services/auth` for product authorization checks and `services/payment-api` for subscription tier binding.

---

## Architecture and Tech Stack

- **Runtime:** Node.js with Express 5 and TypeScript.
- **Database:** PostgreSQL 18 with Drizzle ORM.
- **Validation:** Zod schemas extended with `@asteasolutions/zod-to-openapi`.
- **API Documentation:** Swagger UI served via `swagger-ui-express`.
- **Testing:** Vitest with Supertest.
- **Isolation:** Follows a strict database-per-service pattern.

---

## Quickstart

### 1. Prerequisites

Before starting the service, ensure that you have the following installed and running:

- Node.js (v20 or newer)
- pnpm (v9 or newer)
- PostgreSQL database instance

To start the shared local PostgreSQL database container from the repository root, run:

```bash
docker compose up -d
```

You can also run the root package script alias:

```bash
pnpm db:up
```

### 2. Configure Environment Variables

The service reads configuration values from `process.env`.
Set the following environment variables:

```bash
PORT=3000
DATABASE_URL=postgres://postgres:postgres@localhost:5432/forginity_products
NODE_ENV=development
```

### 3. Apply Database Migrations

To apply schema tables to your PostgreSQL database, run:

```bash
pnpm --filter @services/products db:migrate
```

To inspect your database schema in a visual web browser interface, run:

```bash
pnpm --filter @services/products db:studio
```

---

## How to Seed the Database

The service provides an independent database seeding script in `src/db/seed.ts`.
The script validates database connectivity first.
If the database connection fails, the script aborts immediately.
It then creates or updates foundational platform products (`project_1` and `project_2`) in an idempotent manner.

To seed the database, run:

```bash
pnpm --filter @services/products db:seed
```

If you are already inside the `services/products` directory, run:

```bash
pnpm db:seed
```

Expected output:

```text
[seed] Database connectivity verified.
[seed] Inserted default product 'project-1'
[seed] Inserted default product 'project-2'
[seed] Seeding complete. 2 product records verified.
```

---

## How to Start and Use the Service

### Start Development Server

To launch the service in development mode with automatic hot reloading, run:

```bash
pnpm --filter @services/products dev
```

The server listens on port `4000` by default.
You will see:

```text
[products] service listening on port 4000 (API docs: /api/docs)
```

### Production Build and Start

To compile TypeScript to JavaScript, run:

```bash
pnpm --filter @services/products build
```

To run the compiled production service, run:

```bash
pnpm --filter @services/products start
```

---

## Swagger and OpenAPI Documentation

The Products Service automatically serves interactive Swagger documentation and a raw OpenAPI 3.0 JSON specification.
All documentation schemas derive directly from runtime Zod validators.
This design guarantees that documentation never drifts from runtime API validation.

### Interactive Swagger UI

To explore and test endpoints interactively in your browser:

1. Start the server with `pnpm --filter @services/products dev`.
2. Open the following URL in your web browser:

```text
http://localhost:4000/api/docs
```

The Swagger UI provides live request builders, parameter descriptions, schema models, and response status examples for all 18 API operations.

### Raw OpenAPI JSON Specification

To retrieve the raw OpenAPI 3.0 specification for automated tooling or client SDK generation, navigate to:

```text
http://localhost:4000/api/docs.json
```

---

## API Endpoints Reference

All application endpoints are mounted under the `/api` prefix.
Sub-resource routes distinguish the parent product UUID (`:productId`) from the individual item UUID (`:maintenanceId` or `:versionId`).

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/api/health` | Health probe returning service uptime and PostgreSQL connectivity status |
| `GET` | `/api/docs` | Interactive Swagger UI API documentation |
| `GET` | `/api/docs.json` | Raw OpenAPI 3.0 JSON specification |
| `GET` | `/api/products` | List products with pagination, search, and status filters |
| `POST` | `/api/products` | Create a new product record |
| `GET` | `/api/products/:id` | Get single product by UUID (`?includeRelations=true`) |
| `GET` | `/api/products/slug/:slug` | Get single product by URL slug (`?includeRelations=true`) |
| `PATCH` | `/api/products/:id` | Update product attributes by UUID |
| `DELETE` | `/api/products/:id` | Delete product and cascade delete relations |
| `GET` | `/api/products/maintenance/active` | List all active maintenance schedules across the platform |
| `GET` | `/api/products/maintenance/:id` | Get single maintenance window record by maintenance UUID |
| `PATCH` | `/api/products/maintenance/:id` | Update maintenance window times or status by maintenance UUID |
| `DELETE` | `/api/products/maintenance/:id` | Delete a maintenance window schedule by maintenance UUID |
| `GET` | `/api/products/:id/maintenance` | List all scheduled maintenance windows for a product by product UUID |
| `POST` | `/api/products/:id/maintenance` | Schedule a new maintenance window for a product by product UUID |
| `GET` | `/api/products/versions/:id` | Get single product release version record by version UUID |
| `PATCH` | `/api/products/versions/:id` | Update version release status by version UUID |
| `DELETE` | `/api/products/versions/:id` | Delete a product release version by version UUID |
| `GET` | `/api/products/:id/versions` | List all software release versions for a product by product UUID |
| `POST` | `/api/products/:id/versions` | Register a new software release version for a product by product UUID |

### Example Request

To query the product catalog with curl, run:

```bash
curl -X GET "http://localhost:4000/api/products?status=active&limit=10" -H "Accept: application/json"
```

To create a new product, run:

```bash
curl -X POST "http://localhost:4000/api/products" \
  -H "Content-Type: application/json" \
  -d '{"slug":"trackride","name":"TrackRide Navigation","status":"active"}'
```

---

## Testing and Verification

To run static type checking without emitting files, run:

```bash
pnpm --filter @services/products typecheck
```

To execute all automated unit and integration tests with Vitest, run:

```bash
pnpm --filter @services/products test
```

The test suite covers:

- `src/repositories/product.repository.test.ts` (CRUD queries and relational joins)
- `src/services/product.service.test.ts` (Business logic and validation rules)
- `src/db/connection.test.ts` (Live database ping and disconnection handling)
- `src/routes/products.route.test.ts` (HTTP routing, status codes, and error cases)
- `src/docs/openapi.test.ts` (Swagger UI delivery and OpenAPI 3.0 specification completeness)

---

## Project Structure

```text
services/products/
├── src/
│   ├── app.ts                  # Express server bootstrap and Swagger endpoint mounting
│   ├── index.ts                # Drizzle database client initialization
│   ├── constants/
│   │   └── products.constants.ts # Shared domain statuses and enums
│   ├── controllers/
│   │   └── product.controller.ts # Express HTTP request handlers
│   ├── db/
│   │   ├── connection.ts       # Database connectivity health checks
│   │   ├── products.schema.ts  # Drizzle ORM table definitions and relations
│   │   ├── products.validator.ts # Authoritative Zod schemas with OpenAPI metadata
│   │   └── seed.ts             # Database seeding utility
│   ├── docs/
│   │   ├── openapi.ts          # OpenAPI registry and document generator
│   │   └── openapi.test.ts     # Swagger endpoint test suites
│   ├── middleware/
│   │   └── validate.middleware.ts # Zod request validation middleware
│   ├── repositories/
│   │   └── product.repository.ts # PostgreSQL database query operations
│   ├── routes/
│   │   ├── api.router.ts       # Root /api router aggregator
│   │   ├── health.route.ts     # /api/health probe router
│   │   └── products.route.ts   # Product catalog and relation routes
│   └── services/
│       └── product.service.ts  # Domain business rules and orchestration
├── package.json
└── tsconfig.json
```
