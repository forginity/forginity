# TASK LIST: V2 VISION & EXPANSION ROADMAP

## 1. COMPONENT DETAILS

- **Component Name:** `docs/development/v2_vision` (Forginity Ecosystem V2 Vision)
- **Domain:** Global Expansion, International Telephony, High-Scale Infrastructure, Observability & Enterprise Governance
- **Purpose:** Tracks architectural expansions and capabilities planned for Version 2 rollout across the Forginity monorepo ecosystem. Centralizes features deferred from V1 for cost optimization, regulatory lead-time (e.g. telecom DLT compliance), advanced carrier integrations, or enterprise-grade observability and monitoring infrastructure.
- **Key Features & Flows:**
  - Unified International Phone Number authentication (sign-in & sign-up) via SMS and WhatsApp OTP with automated carrier delivery and anti-pumping fraud defense.
  - End-to-End Role-Based Access Control (RBAC) protecting mutating operations across `services/products`, `services/auth`, and `apps/admin`.
  - Centralized API structured JSON logging (Pino), distributed correlation ID tracing (`X-Correlation-Id`), request/response auditing, and Prometheus `/metrics` telemetry.
  - Admin Console system health and API live inspection monitoring dashboards.
- **Strategic Context:** V1 focuses on zero-cost, high-deliverability **Email OTP (Resend Free Tier)** and **Google SSO** for global reach. Phone/SMS OTP and high-scale observability pipelines are deferred to V2 to eliminate premature infrastructure and carrier costs while launching cleanly.
- **Central Implementation Record:** [`../IMPLEMENTATION_RECORD.md`](../IMPLEMENTATION_RECORD.md)
- **Overall Progress:** [`../PROGRESS.md`](../PROGRESS.md)

---

## 2. PROGRESSIVE TASK MATRIX

| Task ID | Task Title | Key Deliverable | Guide File | Status |
| :--- | :--- | :--- | :--- | :--- |
| `TASK-01` | Phone Number & SMS/WhatsApp OTP Authentication Flow | Unified international E.164 phone sign-in & sign-up, SMS/WhatsApp delivery, toll-fraud protection, and session issuance | [`TASK_01_IMPLEMENTATION_GUIDE.md`](./TASK_01_IMPLEMENTATION_GUIDE.md) | `PENDING` |
| `TASK-02` | End-to-End RBAC & Administrative Mutation Guards | Cross-service RBAC tokens, route guards for product mutations and account moderation (`services/products`, `services/auth`), and Admin UI conditional action guards | [`TASK_02_IMPLEMENTATION_GUIDE.md`](./TASK_02_IMPLEMENTATION_GUIDE.md) | `PENDING` |
| `TASK-03` | API Logs and Monitoring System | Centralized structured JSON logging (Pino), correlation ID middleware (`X-Correlation-Id`), Prometheus `/metrics`, error alerting, and Admin monitoring UI | [`TASK_03_IMPLEMENTATION_GUIDE.md`](./TASK_03_IMPLEMENTATION_GUIDE.md) | `PENDING` |

---

## 3. TASK LIST

### `TASK-01`: Phone Number & SMS/WhatsApp OTP Authentication Flow (Unified Sign-in / Sign-up)
- **Description:** Implement end-to-end international telephone number authentication supporting passwordless sign-in and first-time registration:
  - **Phone Formatting & Validation:** Client and server-side Zod validation for E.164 international numbers with country dial-code resolution.
  - **Multi-Channel OTP Delivery:** Integrated SMS and WhatsApp OTP dispatch (with pluggable carrier selection for Twilio, AWS SNS, Fast2SMS/MSG91, or Meta WhatsApp Business API).
  - **Toll-Fraud Defense & Rate Limits:** Guard against SMS pumping attacks, automated bot verification bursts, destination range blocklists, and per-carrier spend caps.
  - **Session Issuance & Redirection:** Verification of 6-digit OTP code, issuance of hybrid SSO access & refresh tokens for returning users, and redirection to onboarding flow for newly registered phone numbers.
- **Guide:** [`TASK_01_IMPLEMENTATION_GUIDE.md`](./TASK_01_IMPLEMENTATION_GUIDE.md)

### `TASK-02`: End-to-End RBAC & Administrative Mutation Guards (Moved from V1)
- **Description:** Enforce comprehensive role-based access control and administrative action guards across the monorepo:
  - **Backend Route Guards:** Enforce administrative role verification on mutating product operations (create, edit, delete, maintenance scheduling) in `services/products` and account moderation operations (block, unblock, soft-delete, restoration) in `services/auth`.
  - **Admin Console UI Guards:** Conditionally disable or hide mutation actions in `apps/admin` for read-only / support operators, returning clean authorization error toasts when non-admin tokens attempt mutating actions.
- **Guide:** [`TASK_02_IMPLEMENTATION_GUIDE.md`](./TASK_02_IMPLEMENTATION_GUIDE.md)

### `TASK-03`: API Logs and Monitoring System
- **Description:** Implement enterprise-grade observability, telemetry, and monitoring across all backend microservices (`services/*`) and the Admin Console (`apps/admin`):
  - **Structured JSON Logging:** Deploy high-performance asynchronous logger (`pino` / `pino-http`) across Express microservices with strict log-level filtering (`info`, `warn`, `error`, `debug`), ISO timestamps, and automatic PII/secret redaction (passwords, JWTs, cookies, OTPs, email salts).
  - **Correlation ID Middleware & Request Tracing:** Mount `correlation-id.middleware.ts` generating UUIDv4 `X-Correlation-Id` or propagating incoming gateway `X-Request-Id` across reverse proxy headers, Express request lifecycle, outgoing HTTP calls (`@forginity/sdk`), and Redis Pub/Sub events.
  - **Request/Response Audit Middleware:** Log method, route path, status code, latency (ms), caller IP, user agent, caller user ID/role, and sanitized request body summary for all mutating API routes.
  - **Metrics & Telemetry (`/metrics` Endpoint):** Expose Prometheus-compatible `/metrics` scrape endpoint collecting HTTP request counts by status code, latency distributions (P50, P90, P95, P99 histograms), active connection gauges, event loop lag, and Drizzle ORM query timings.
  - **Admin Observability & Audit Dashboard:** Build system monitoring views in `apps/admin` (`/system/logs` & `/system/health`) displaying live microservice availability, real-time error rates, slow query alerts, and administrative security audit trails.
  - **Error Tracking & Alert Webhooks:** Centralized error interceptor capturing unhandled promise rejections, 5xx server exceptions, and critical service failure webhooks (Discord / Slack / PagerDuty / Sentry integration).
- **Guide:** [`TASK_03_IMPLEMENTATION_GUIDE.md`](./TASK_03_IMPLEMENTATION_GUIDE.md)
