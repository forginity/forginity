# Forginity Platform Monorepo

The domain-decoupled multi-product digital platform connecting independent applications through centralized identity, client SDKs, design system, and microservices.

---

## 1. Monorepo Structure

```text
forginity/
├── apps/                    # Next.js micro-frontends and web applications
│   ├── admin/               # Admin Console control plane (Port 3000)
│   ├── web/                 # Marketing and landing portal (Port 3004 - Planned)
│   └── trackride/           # Motorcycle group navigation flagship (Port 3005 - Planned)
├── services/                # Backend microservices (Express + TypeScript)
│   ├── auth/                # Centralized Auth & SSO service (Port 3001)
│   ├── products/            # Catalog, versions & maintenance service (Port 3002)
│   └── payment/             # Stripe billing & subscriptions (Port 3003 - Planned)
├── packages/                # Shared libraries & tools (Zero server cost)
│   ├── sdk/                 # Client SDK (@forginity/sdk - HTTP client, React Query hooks)
│   ├── ui/                  # Design system (@workspace/ui - Coral Sunset, Base UI primitives)
│   ├── typescript-config/   # Shared tsconfig bases
│   └── eslint-config/       # Shared linting configs
└── docs/                    # Strategic, technical, and development documentation
```

---

## 2. Service Matrix & Port Registry

All applications, microservices, and backing databases are mapped to predictable ports.
See the authoritative **[`SERVICES.md`](file:///home/vikas/Documents/forginity/SERVICES.md)** (or [`docs/org/PORTS.md`](file:///home/vikas/Documents/forginity/docs/org/PORTS.md)) for the complete matrix:

| Service / App | Port | Protocol | Tech Stack | Status |
| :--- | :---: | :---: | :--- | :---: |
| **Admin Console** ([`apps/admin`](file:///home/vikas/Documents/forginity/apps/admin)) | **`3000`** | HTTP | Next.js 16 (Turbopack) | `ACTIVE` |
| **Auth & SSO Service** ([`services/auth`](file:///home/vikas/Documents/forginity/services/auth)) | **`3001`** | HTTP | Express 5, TypeScript | `ACTIVE` |
| **Products Service** ([`services/products`](file:///home/vikas/Documents/forginity/services/products)) | **`3002`** | HTTP | Express 5, Drizzle ORM | `ACTIVE` |
| **Payment Service** (`services/payment`) | **`3003`** | HTTP | Express 5, Stripe SDK | `PLANNED` |
| **PostgreSQL Database** | **`5432`** | TCP | PostgreSQL 18 | `ACTIVE` |
| **Redis Cache & Broker** | **`6379`** | TCP | Redis 7 | `ACTIVE` |

---

## 3. Quick Start & Verification

### Run Concurrently in Development
```bash
# Terminal 1: Start backend products service
pnpm --filter @services/products dev

# Terminal 2: Start frontend admin console
pnpm --filter @web/admin dev
```

### Run Verification Suite Across Monorepo
```bash
# Typecheck
pnpm run typecheck

# Lint
pnpm run lint

# Build
pnpm run build
```

---

## 4. Key Documentation Links

- **Services & Port Matrix:** [`SERVICES.md`](file:///home/vikas/Documents/forginity/SERVICES.md)
- **Agent Guidelines & Safety Rules:** [`AGENTS.md`](file:///home/vikas/Documents/forginity/AGENTS.md)
- **Technical Architecture Design (TDD):** [`docs/org/TDD.md`](file:///home/vikas/Documents/forginity/docs/org/TDD.md)
- **Central Implementation Record:** [`docs/development/IMPLEMENTATION_RECORD.md`](file:///home/vikas/Documents/forginity/docs/development/IMPLEMENTATION_RECORD.md)
- **Ecosystem Progress Tracker:** [`docs/development/PROGRESS.md`](file:///home/vikas/Documents/forginity/docs/development/PROGRESS.md)
- **Forginity Client SDK Guide:** [`packages/sdk/README.md`](file:///home/vikas/Documents/forginity/packages/sdk/README.md)
