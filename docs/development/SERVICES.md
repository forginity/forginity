# FORGINITY ECOSYSTEM SERVICES & PORT ALLOCATION MATRIX (`docs/development/SERVICES.md`)

Authoritative registry of all frontend web applications, backend microservices, workers, shared packages, and backing infrastructure services across the Forginity monorepo platform.

---

## 1. Master Service & Port Allocation Matrix

All applications and microservices are assigned sequential ports in the `3000` series to eliminate collisions and enable predictable local development and production routing:

| Service Name | Path | Package Identifier | Port | Protocol | Tech Stack | Local URL | Health Check / Ping | Swagger / API Docs | CLI Start Command | Status |
| :--- | :--- | :--- | :---: | :---: | :--- | :--- | :--- | :--- | :--- | :---: |
| **Admin Console** | [`apps/admin`](file:///home/vikas/Documents/forginity/apps/admin) | `@web/admin` | **`3000`** | HTTP | Next.js 16 (Turbopack), React 19 | `http://localhost:3000` | `GET /` | N/A (Frontend) | `pnpm --filter @web/admin dev` | `ACTIVE` |
| **Auth & SSO Service** | [`services/auth`](file:///home/vikas/Documents/forginity/services/auth) | `@services/auth` | **`3001`** | HTTP | Node.js, Express 5, TypeScript | `http://localhost:3001` | `GET /api/health` | `GET /api/docs` | `pnpm --filter @services/auth dev` | `ACTIVE` |
| **Products & Catalog** | [`services/products`](file:///home/vikas/Documents/forginity/services/products) | `@services/products` | **`3002`** | HTTP | Node.js, Express 5, Drizzle ORM | `http://localhost:3002` | `GET /api/health` | `GET /api/docs` | `pnpm --filter @services/products dev` | `ACTIVE` |
| **Payment & Billing** | `services/payment` | `@services/payment` | **`3003`** | HTTP | Node.js, Express 5, Stripe SDK | `http://localhost:3003` | `GET /api/health` | `GET /api/docs` | `pnpm --filter @services/payment dev` | `PLANNED` |
| **Marketing & Web** | `apps/web` | `@web/landing` | **`3004`** | HTTP | Next.js 16 (App Router) | `http://localhost:3004` | `GET /` | N/A (Frontend) | `pnpm --filter @web/landing dev` | `PLANNED` |
| **TrackRide Flagship** | `apps/trackride` | `@web/trackride` | **`3005`** | HTTP | Next.js 16 (App Router) | `http://localhost:3005` | `GET /` | N/A (Frontend) | `pnpm --filter @web/trackride dev` | `PLANNED` |
| **AI Processing Worker**| `services/ai` | `@services/ai` | **`3006`** | HTTP | Python 3.11, FastAPI, Gemini SDK | `http://localhost:3006` | `GET /health` | `GET /docs` | `pnpm --filter @services/ai dev` | `PLANNED` |
| **Notifications & WS** | `services/notifications` | `@services/notifications` | **`3007`** | HTTP/WS | Node.js, Express 5, Socket.IO | `http://localhost:3007` | `GET /health` | N/A | `pnpm --filter @services/notifications dev` | `PLANNED` |

---

## 2. Shared Packages & SDKs (Zero Server Cost)

These libraries do not listen on network ports; they compile directly into consuming applications and services with **$0.00** server runtime cost:

| Package Name | Path | Package Identifier | Purpose & Core Capabilities | Exported Modules |
| :--- | :--- | :--- | :--- | :--- |
| **Forginity Client SDK** | [`packages/sdk`](file:///home/vikas/Documents/forginity/packages/sdk) | `@forginity/sdk` | Core Axios client, token interceptors, `ApiError` normalization, reactive TanStack Query hooks (`useProducts`, `useProduct`, `useCreateProduct`, etc.). | `./core/*`, `./constants/*`, `./modules/*` |
| **Design System UI** | [`packages/ui`](file:///home/vikas/Documents/forginity/packages/ui) | `@workspace/ui` | Unified Coral Sunset dark theme tokens, `@base-ui/react` primitives, Shadcn components (`Button`, `MetricCard`, `AppShell`, `Table`). | `./components/*`, `./lib/*`, `./types/*` |
| **TypeScript Config** | [`packages/typescript-config`](file:///home/vikas/Documents/forginity/packages/typescript-config) | `@workspace/typescript-config` | Shared `tsconfig.json` bases (`base.json`, `nextjs.json`, `react-library.json`). | N/A |
| **ESLint Config** | `packages/eslint-config` | `@workspace/eslint-config` | Standardized linting rules across apps and microservices. | N/A |

---

## 3. Backing Infrastructure & Storage Ports

| Engine | Port | Protocol | Purpose / Role | Isolation Model |
| :--- | :---: | :---: | :--- | :--- |
| **PostgreSQL 18** | **`5432`** | TCP | Database-per-service relational persistence | Isolated databases (`forginity_products`, `auth_db`, `payment_db`). No cross-service SQL joins. |
| **Redis 7** | **`6379`** | TCP | In-memory session cache, rate limiter & Socket.IO Pub/Sub | Key namespacing per service domain (`auth:*`, `cache:*`, `events:*`). |
| **Nginx Edge / Local Gateway** | **`8080`** / **`80`** | HTTP | Reverse proxy gateway routing web requests to microservices and apps | Routes `/api/products` -> `3002`, `/api/auth` -> `3001`, `/` -> `3000`. |

---

## 4. Environment Variables & URL Binding Matrix

| Service | Port Config Variable | Default Port | Client URL Target Variable | Default API URL Target | CORS Allowed Origins |
| :--- | :--- | :---: | :--- | :--- | :--- |
| **`apps/admin`** | `PORT` | `3000` | `NEXT_PUBLIC_API_URL` | `http://localhost:3002` | N/A (Client Browser) |
| **`services/auth`** | `PORT` | `3001` | `API_URL` | N/A | `http://localhost:3000` |
| **`services/products`**| `PORT` | `3002` | `API_URL` | N/A | `http://localhost:3000` |
| **`services/payment`** | `PORT` | `3003` | `API_URL` | N/A | `http://localhost:3000` |
| **`apps/web`** | `PORT` | `3004` | `NEXT_PUBLIC_API_URL` | `http://localhost:3002` | N/A (Client Browser) |
| **`apps/trackride`** | `PORT` | `3005` | `NEXT_PUBLIC_API_URL` | `http://localhost:3002` | N/A (Client Browser) |

---

## 5. Network Architecture & Communication Flow

```text
                     ┌────────────────────────────────────────────────────────┐
                     │          Browser Client (http://localhost:3000)        │
                     │          apps/admin (Next.js 16 + @workspace/ui)       │
                     └───────────────────────────┬────────────────────────────┘
                                                 │
                                                 │ HTTP Fetch (CORS Enabled)
                                                 ▼
                     ┌────────────────────────────────────────────────────────┐
                     │         @forginity/sdk (Embedded in apps/admin)        │
                     │         baseURL: http://localhost:3002                 │
                     └───────────────────────────┬────────────────────────────┘
                                                 │
                                                 │ Axios JSON REST Calls
                                                 ▼
                     ┌────────────────────────────────────────────────────────┐
                     │     services/products (Express 5 on Port 3002)         │
                     │     - /api/products                                    │
                     │     - /api/docs (OpenAPI Swagger)                      │
                     └───────────────────────────┬────────────────────────────┘
                                                 │
                                                 │ Drizzle ORM
                                                 ▼
                     ┌────────────────────────────────────────────────────────┐
                     │      PostgreSQL 18 Database (Port 5432)                │
                     │      database: forginity_products                      │
                     └────────────────────────────────────────────────────────┘
```

---

## 6. Concurrent Development Startup Runbook

To run the admin console and products backend together without conflicts:

### Step 1: Start Products Microservice (Port 3002)
```bash
pnpm --filter @services/products dev
# Logs: [products] service listening on port 3002 (API docs: /api/docs)
```

### Step 2: Start Admin Console (Port 3000)
```bash
pnpm --filter @web/admin dev
# Logs: Ready on http://localhost:3000
```

### Step 3: Start Auth Service (Port 3001 - When Needed)
```bash
pnpm --filter @services/auth dev
# Logs: [auth] service listening on port 3001
```

---

## 7. Port Hygiene & Guardrails

1. **Explicit Port Flags:** Next.js development and production startup scripts in `package.json` must explicitly bind ports (e.g. `next dev -p 3000`, `next start -p 3000`) rather than relying on dynamic fallback ports.
2. **Fallback Port Parity:** Express microservice entry points must set fallback defaults matching this registry:
   - `services/auth`: `process.env.PORT ? parseInt(process.env.PORT, 10) : 3001`
   - `services/products`: `process.env.PORT ? parseInt(process.env.PORT, 10) : 3002`
3. **CORS Requirement:** Every backend service accepting direct browser traffic in development must enable CORS with `credentials: true` for `http://localhost:3000`.
4. **Environment File Protection:** Never edit or inspect `.env` files directly. Reference secrets and ports exclusively through `process.env` and `.env.example`.
