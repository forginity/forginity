# TASK LIST: SERVICE_PRODUCTS

## 1. SERVICE DETAILS

- **Service Name:** `services/products`
- **Domain:** Centralized Product Catalog, Feature Flags, Maintenance Windows, and Version Registry
- **Purpose:** Authoritative product registry for the Forginity monorepo ecosystem. Manages platform products, dynamic feature flag toggles, maintenance window notices, and version compatibility tracking across all microservices and apps.
- **Key Features & Flows:**
  - Product catalog management with unique URL-safe slugs and operational lifecycles (`alpha`, `beta`, `active`, `deprecated`).
  - Maintenance window scheduling with start/end time validation and client messaging.
  - Software version release registry (`latest`, `supported`, `deprecated`).
  - Database seeding utility providing default platform projects (`project_1` and `project_2`).
  - Real database CRUD test suite with mandatory database connectivity check that throws an error if disconnected.
  - Interactive Swagger / OpenAPI documentation served at `/api/docs` and raw specification at `/api/docs.json`.
- **Tech Stack:** Express 5, TypeScript, PostgreSQL 18, Drizzle ORM, Zod, `@asteasolutions/zod-to-openapi`, `swagger-ui-express`, Vitest, Supertest.
- **Reference Service:** [`services/products`](file:///home/vikas/Documents/forginity/services/products)
- **Service Specification:** [`./README.md`](./README.md)
- **Implementation Record:** [`./IMPLEMENTATIONS_RECORD.md`](file:///home/vikas/Documents/forginity/docs/development/service_products/IMPLEMENTATIONS_RECORD.md)

---

## 2. PROGRESSIVE TASK MATRIX

| Task ID | Task Title | Key Deliverable | Guide File | Status |
| :--- | :--- | :--- | :--- | :--- |
| `TASK-01` | Scaffold `services/products` package and configs | Base Express app, tsconfig, drizzle config | [`TASK_01_IMPLEMENTATION_GUIDE.md`](./TASK_01_IMPLEMENTATION_GUIDE.md) | `COMPLETED` |
| `TASK-02` | Build database schemas, relations, and migrations | `src/db/products.schema.ts` and migrations | [`TASK_02_IMPLEMENTATION_GUIDE.md`](./TASK_02_IMPLEMENTATION_GUIDE.md) | `COMPLETED` |
| `TASK-03` | Implement Product, Feature, Maintenance, and Version CRUD APIs & Service Layer | Repositories, services, routes, and unit tests | [`TASK_03_IMPLEMENTATION_GUIDE.md`](./TASK_03_IMPLEMENTATION_GUIDE.md) | `COMPLETED` |
| `TASK-04` | Database Seeding, DB-Backed Health Checks, and Live Database CRUD Tests | `src/db/seed.ts`, `/api/health` connectivity check, live CRUD integration suite | [`TASK_04_IMPLEMENTATION_GUIDE.md`](./TASK_04_IMPLEMENTATION_GUIDE.md) | `COMPLETED` |
| `TASK-05` | Add Swagger / OpenAPI Documentation with Zod | OpenAPI registry, Zod schema extensions, `/api/docs` UI, `/api/docs.json` endpoint | [`TASK_05_IMPLEMENTATION_GUIDE.md`](./TASK_05_IMPLEMENTATION_GUIDE.md) | `COMPLETED` |
| `TASK-06` | Add Redis caching layer for product metadata and maintenance | Redis cache middleware, TTL invalidation hooks, unit & integration tests | [`TASK_06_IMPLEMENTATION_GUIDE.md`](./TASK_06_IMPLEMENTATION_GUIDE.md) | `PENDING` |
| `TASK-07` | Implement Admin RBAC guards on mutating endpoints | JWT verification middleware, role validation guards, route test suites | [`TASK_07_IMPLEMENTATION_GUIDE.md`](./TASK_07_IMPLEMENTATION_GUIDE.md) | `PENDING` |

---

## 3. TASK LIST

### `TASK-01`: Scaffold `services/products` package and configs
- **Description:** Initialize `@services/products` workspace package with Express 5, TypeScript, Drizzle ORM, Zod, Vitest, and nodemon.
  Configure `tsconfig.json`, `drizzle.config.ts`, base Express routing with `/api` prefix, and health check route at `GET /api/health`.
- **Guide:** [`TASK_01_IMPLEMENTATION_GUIDE.md`](./TASK_01_IMPLEMENTATION_GUIDE.md) (Covers scope, step-by-step code, test cases, and security gates.)

### `TASK-02`: Build database schemas, relations, and migrations
- **Description:** Define Drizzle ORM tables for `products`, `product_maintenance`, and `product_versions` with foreign keys and cascade rules.
  Generate initial PostgreSQL migration SQL and configure Zod runtime schemas in `src/db/products.validator.ts`.
- **Guide:** [`TASK_02_IMPLEMENTATION_GUIDE.md`](./TASK_02_IMPLEMENTATION_GUIDE.md) (Covers scope, step-by-step code, test cases, and security gates.)

### `TASK-03`: Implement Product, Maintenance, and Version CRUD APIs & Service Layer
- **Description:** Implement `ProductRepository` and `ProductService` handling business rules, slug uniqueness, and relational lookups.
  Create Express HTTP route controllers for products, maintenance windows, and versions, with full Vitest unit and route coverage.
- **Guide:** [`TASK_03_IMPLEMENTATION_GUIDE.md`](./TASK_03_IMPLEMENTATION_GUIDE.md) (Covers scope, step-by-step code, test cases, and security gates.)

### `TASK-04`: Database Seeding, DB-Backed Health Checks, and Live Database CRUD Tests
- **Description:** Provide independent seed script `src/db/seed.ts` inserting default products (`project_1` and `project_2`), decoupled from tests.
  Connect `GET /api/health` to live DB connectivity (returns 200/503), and implement real database CRUD integration tests (Add -> Get -> Edit -> Delete) with connectivity verification.
- **Guide:** [`TASK_04_IMPLEMENTATION_GUIDE.md`](./TASK_04_IMPLEMENTATION_GUIDE.md) (Covers scope, step-by-step code, test cases, and security gates.)

### `TASK-05`: Add Swagger / OpenAPI Documentation with Zod
- **Description:** Set up `@asteasolutions/zod-to-openapi` and `swagger-ui-express` to automatically generate OpenAPI 3.0 specifications from authoritative Zod schemas.
  Register all product catalog, maintenance window, and version endpoints, serving the interactive Swagger UI at `GET /api/docs` and raw JSON spec at `GET /api/docs.json`.
- **Guide:** [`TASK_05_IMPLEMENTATION_GUIDE.md`](./TASK_05_IMPLEMENTATION_GUIDE.md) (Covers scope, step-by-step code, test cases, and security gates.)

### `TASK-06`: Add Redis caching layer for product metadata and maintenance
- **Description:** Integrate Redis cache for high-frequency queries like product catalog lookups, active version tags, and maintenance notices.
  Add cache invalidation triggers on update/delete mutations and verify cache hit/miss behavior with automated tests.
- **Guide:** [`TASK_06_IMPLEMENTATION_GUIDE.md`](./TASK_06_IMPLEMENTATION_GUIDE.md) (Covers scope, step-by-step code, test cases, and security gates.)

### `TASK-07`: Implement Admin RBAC guards on mutating endpoints
- **Description:** Protect `POST`, `PATCH`, and `DELETE` endpoints with Bearer token authentication and role-based access control.
  Ensure read-only endpoints remain publicly accessible while administrative mutations require valid administrative credentials.
- **Guide:** [`TASK_07_IMPLEMENTATION_GUIDE.md`](./TASK_07_IMPLEMENTATION_GUIDE.md) (Covers scope, step-by-step code, test cases, and security gates.)
