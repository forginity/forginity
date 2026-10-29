# SERVICE SPECIFICATION: [SERVICE_NAME]

## 1. EXECUTIVE SUMMARY

- **Service Name:** `[services/service-name | apps/app-name]`
- **Domain:** `[Auth | Payments | Products | TrackRide | etc.]`
- **Owner:** `[Team / Engineer / AI Agent]`
- **Purpose:** [Explain the primary goal of this service, what problem it solves, and why it exists.]
- **Consumers:** [List the client applications or backend services that consume this service.]
- **Development Roadmap:** [`./TASK_LIST.md`](./TASK_LIST.md)
- **Implementation Record:** [`./IMPLEMENTATIONS_RECORD.md`](./IMPLEMENTATIONS_RECORD.md)

---

## 2. BUSINESS & FUNCTIONAL REQUIREMENTS

- **Core Capabilities:**
  - [Capability 1: Clear description of expected behavior]
  - [Capability 2: Clear description of expected behavior]
- **User Flows & Workflows:**
  - [Workflow 1: Trigger -> Steps -> Outcome]
  - [Workflow 2: Trigger -> Steps -> Outcome]
- **Edge Cases & Failure Modes:**
  - [Handling invalid inputs, duplicate resources, network retries, and rate limits]

---

## 3. ARCHITECTURE & TECH STACK

- **Runtime Framework:** Node.js, Express, TypeScript.
- **Database Architecture:** PostgreSQL 18 with Drizzle ORM (Database-per-Service isolation).
- **Caching & Ephemeral State:** Redis 7.
- **Validation Engine:** Zod runtime validation with Type-First inferred contracts.
- **Testing Framework:** Vitest with Supertest.
- **Architectural Reference:** [`services/products`](file:///home/vikas/Documents/forginity/services/products)

---

## 4. DOMAIN DATA MODELS

Outline the primary entities and relations managed by this service database:

- **Entity 1 (`table_name`):** [Description of fields, constraints, and indexes.]
- **Entity 2 (`table_name`):** [Description of fields, constraints, and indexes.]

---

## 5. API SPECIFICATIONS

Summary of public and internal endpoints exposed by this service:

| Method | Endpoint | Description | Auth Required |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/v1/[resource]` | Create resource | Yes / No |
| `GET` | `/api/v1/[resource]/:id` | Read resource | Yes / No |
| `PUT` | `/api/v1/[resource]/:id` | Update resource | Yes / No |
| `DELETE` | `/api/v1/[resource]/:id` | Delete resource | Yes / No |

---

## 6. SECURITY & COMPLIANCE

- **Zero `.env` Access:** Never inspect, create, or modify `.env` files. Read from `process.env`.
- **Input Sanitization:** Parse all HTTP payloads strictly through Zod schemas.
- **Data Protection:** Enforce encryption, hashing, and parameterization across all storage layers.
