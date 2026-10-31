# TASK LIST: SERVICE_PAYMENT

## 1. SERVICE DETAILS

- **Service Name:** `services/payment-api`
- **Domain:** Payments, Subscriptions, Microtransactions, and Invoicing
- **Purpose:** Centralized billing, payment processing, and checkout engine for the Forginity monorepo ecosystem. Manages Stripe customer accounts, subscription lifecycles, host-paid ride passes, idempotent webhook processing, and transaction records.
- **Key Features & Flows:**
  - Stripe Customer creation and payment method management.
  - Host-paid group tour checkout session creation (one-off ride passes).
  - Subscription tier checkout and renewal webhooks.
  - Webhook signature verification and idempotency ledger.
  - Interactive Swagger / OpenAPI documentation served at `/api/docs` and raw spec at `/api/docs.json`.
- **Tech Stack:** Express 5, TypeScript, PostgreSQL 18, Drizzle ORM, Stripe SDK, Zod, Vitest, Supertest.
- **Reference Specification:** [`./README.md`](./README.md)
- **Implementation Record:** [`./IMPLEMENTATIONS_RECORD.md`](file:///home/vikas/Documents/forginity/docs/development/service_payment/IMPLEMENTATIONS_RECORD.md)

---

## 2. PROGRESSIVE TASK MATRIX

| Task ID | Task Title | Key Deliverable | Guide File | Status |
| :--- | :--- | :--- | :--- | :--- |
| `TASK-01` | Scaffold `services/payment-api` package and configs | Base Express app, tsconfig, drizzle config, Stripe client setup | [`TASK_01_IMPLEMENTATION_GUIDE.md`](./TASK_01_IMPLEMENTATION_GUIDE.md) | `PENDING` |
| `TASK-02` | Build database schemas, relations, and migrations | `src/db/payment.schema.ts` and migrations for `payment_db` | [`TASK_02_IMPLEMENTATION_GUIDE.md`](./TASK_02_IMPLEMENTATION_GUIDE.md) | `PENDING` |
| `TASK-03` | Implement Stripe Customer & Checkout Session APIs | Customer mapping, checkout session generation for rides & plans | [`TASK_03_IMPLEMENTATION_GUIDE.md`](./TASK_03_IMPLEMENTATION_GUIDE.md) | `PENDING` |
| `TASK-04` | Implement Stripe Webhook Ingestion & Idempotent Ledger | Signature validation, idempotent event store, subscription updater | [`TASK_04_IMPLEMENTATION_GUIDE.md`](./TASK_04_IMPLEMENTATION_GUIDE.md) | `PENDING` |
| `TASK-05` | Add Swagger / OpenAPI Documentation with Zod | OpenAPI registry, Zod schemas, `/api/docs` UI, `/api/docs.json` spec | [`TASK_05_IMPLEMENTATION_GUIDE.md`](./TASK_05_IMPLEMENTATION_GUIDE.md) | `PENDING` |
| `TASK-06` | Implement Admin Billing & Refund APIs | Invoice history endpoints, refund processing, usage analytics | [`TASK_06_IMPLEMENTATION_GUIDE.md`](./TASK_06_IMPLEMENTATION_GUIDE.md) | `PENDING` |

---

## 3. TASK LIST

### `TASK-01`: Scaffold `services/payment-api` package and configs
- **Description:** Initialize `@services/payment-api` workspace package with Express 5, TypeScript, Drizzle ORM, Zod, and Vitest.
  Configure `tsconfig.json`, `drizzle.config.ts`, Stripe client initialization from `process.env`, and health route at `GET /api/health`.
- **Guide:** [`TASK_01_IMPLEMENTATION_GUIDE.md`](./TASK_01_IMPLEMENTATION_GUIDE.md) (Covers scope, step-by-step code, test cases, and security gates.)

### `TASK-02`: Build database schemas, relations, and migrations
- **Description:** Define Drizzle ORM tables for `payment_customers`, `payment_subscriptions`, `payment_charges`, and `payment_webhook_events`.
  Generate initial PostgreSQL migration SQL and configure Zod runtime schemas in `src/db/payment.validator.ts`.
- **Guide:** [`TASK_02_IMPLEMENTATION_GUIDE.md`](./TASK_02_IMPLEMENTATION_GUIDE.md) (Covers scope, step-by-step code, test cases, and security gates.)

### `TASK-03`: Implement Stripe Customer & Checkout Session APIs
- **Description:** Build repository and service layer managing Stripe customer creation linked to Forginity user IDs.
  Implement checkout session endpoints for one-off ride passes and recurring subscription plans.
- **Guide:** [`TASK_03_IMPLEMENTATION_GUIDE.md`](./TASK_03_IMPLEMENTATION_GUIDE.md) (Covers scope, step-by-step code, test cases, and security gates.)

### `TASK-04`: Implement Stripe Webhook Ingestion & Idempotent Ledger
- **Description:** Implement raw-body webhook listener verifying Stripe HMAC signatures.
  Process payment events through an idempotent event ledger ensuring zero duplicate side effects.
- **Guide:** [`TASK_04_IMPLEMENTATION_GUIDE.md`](./TASK_04_IMPLEMENTATION_GUIDE.md) (Covers scope, step-by-step code, test cases, and security gates.)

### `TASK-05`: Add Swagger / OpenAPI Documentation with Zod
- **Description:** Register all checkout, customer, and webhook schema contracts with `@asteasolutions/zod-to-openapi`.
  Serve interactive Swagger UI at `GET /api/docs` and raw spec at `GET /api/docs.json`.
- **Guide:** [`TASK_05_IMPLEMENTATION_GUIDE.md`](./TASK_05_IMPLEMENTATION_GUIDE.md) (Covers scope, step-by-step code, test cases, and security gates.)

### `TASK-06`: Implement Admin Billing & Refund APIs
- **Description:** Expose administrative endpoints to query user invoice history, subscription states, and initiate payment refunds.
  Protect administrative routes with RBAC middleware requiring platform admin credentials.
- **Guide:** [`TASK_06_IMPLEMENTATION_GUIDE.md`](./TASK_06_IMPLEMENTATION_GUIDE.md) (Covers scope, step-by-step code, test cases, and security gates.)
