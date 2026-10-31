# SERVICE SPECIFICATION: SERVICE_PAYMENT

## 1. EXECUTIVE SUMMARY

- **Service Name:** `services/payment-api`
- **Folder Reference:** `docs/development/service_payment`
- **Domain:** Payments, Subscriptions, Microtransactions, and Invoicing
- **Owner:** Platform Monetization & Financial Engineering Team
- **Purpose:** Provide a centralized payment processing engine for the Forginity monorepo ecosystem. Manages Stripe customer accounts, SaaS subscription tiers, one-off ride pass checkouts (such as host-paid tours in TrackRide), webhook processing with idempotent event ledgers, and automated receipt generation.
- **Consumers:** `apps/admin`, `apps/project-1` (TrackRide / PikyRider), `apps/project-2` (Custom Apparel), and external Stripe webhook gateways.
- **Development Roadmap:** [`./TASK_LIST.md`](./TASK_LIST.md)
- **Implementation Record:** [`./IMPLEMENTATIONS_RECORD.md`](./IMPLEMENTATIONS_RECORD.md)

---

## 2. BUSINESS & FUNCTIONAL REQUIREMENTS

### Core Capabilities
- **Stripe Customer Management:** Create and synchronize Stripe customer objects mapped to Forginity user accounts in `services/auth`.
- **Checkout Session Creation:** Generate hosted Stripe Checkout sessions for recurring subscription plans and one-time purchases (e.g. ₹300 group tour pass).
- **Idempotent Webhook Processing:** Securely ingest and verify Stripe webhook events (`checkout.session.completed`, `customer.subscription.*`, `invoice.payment_succeeded`) without duplicate side effects.
- **Subscription Lifecycle Management:** Manage active, trialing, past-due, and canceled subscription states with automatic platform access revocation.
- **Invoicing & Receipts:** Store immutable payment transaction records and expose PDF receipt download URLs.

### User Flows & Workflows
1. **Host-Paid Group Tour Purchase:**
   - Rider in PikyRider initiates group ride creation.
   - App requests checkout session from `services/payment-api`.
   - Rider completes checkout via Apple Pay, Google Pay, UPI, or card.
   - Stripe sends `checkout.session.completed` webhook.
   - `services/payment-api` records transaction and activates the ride pass in `trackride_db`.
2. **SaaS Subscription Renewal:**
   - Stripe processes recurring billing cycle and emits `invoice.payment_succeeded`.
   - Webhook processor verifies signature and updates customer subscription validity period.

---

## 3. ARCHITECTURE & TECH STACK

- **Runtime Framework:** Node.js, Express, TypeScript.
- **Database Engine:** PostgreSQL 18 with Drizzle ORM (`payment_db`).
- **External Integration:** Stripe Node SDK with webhook signature verification.
- **Validation Engine:** Zod runtime validation with Type-First contracts.
- **Documentation:** `@asteasolutions/zod-to-openapi` and `swagger-ui-express` served at `/api/docs`.
- **Testing Framework:** Vitest with Supertest and Stripe mock fixtures.
- **Architectural Reference:** [`services/products`](file:///home/vikas/Documents/forginity/services/products)

---

## 4. DOMAIN DATA MODELS

Managed in `payment_db`:

- **Stripe Customers (`payment_customers`):** User UUID, Stripe customer ID, default payment method, currency, created at.
- **Subscriptions (`payment_subscriptions`):** Subscription UUID, customer ID, plan ID, status (`active`, `past_due`, `canceled`), current period end.
- **Invoices & Charges (`payment_charges`):** Charge UUID, customer ID, amount, currency, status (`succeeded`, `failed`, `refunded`), Stripe checkout session ID, idempotent event ID.
- **Webhook Ledger (`payment_webhook_events`):** Event ID, event type, processed at, payload hash, processing status.

---

## 5. API SPECIFICATIONS

| Method | Endpoint | Description | Auth Required |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/v1/checkout/session` | Create Stripe checkout session | Yes (Bearer JWT) |
| `POST` | `/api/v1/webhooks/stripe` | Ingest Stripe webhook events | Stripe Signature |
| `GET` | `/api/v1/customers/me` | Fetch authenticated customer billing status | Yes (Bearer JWT) |
| `GET` | `/api/v1/invoices` | List invoices and transaction history | Yes (Bearer JWT) |
| `GET` | `/api/docs` | Interactive Swagger API documentation | No |
| `GET` | `/api/health` | Live database connectivity health check | No |

---

## 6. SECURITY & COMPLIANCE

- **Zero `.env` Access:** Stripe API keys and webhook signing secrets are read strictly from `process.env`.
- **PCI Compliance:** Zero sensitive cardholder data touches Forginity infrastructure; all payment input is tokenized by Stripe Elements.
- **Webhook Replay Protection:** Timestamp and cryptographic HMAC SHA-256 signature verification prevent replay attacks.
