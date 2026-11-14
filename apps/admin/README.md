# Forginity Admin Console (`@web/admin`)

Central administrative dashboard and platform control plane for the Forginity monorepo ecosystem. Provides unified administration across products, releases, maintenance windows, identity federation, and system health metrics.

---

## 1. What This App Is

`@web/admin` is a Next.js 16 (App Router) micro-frontend located in `apps/admin/`. It serves as the primary back-office operating system for platform administrators, product managers, and site reliability engineers across all Forginity digital products.

### Primary Responsibilities

- **Product & Release Governance:** View, create, update, and deprecate products, manage release version tracks, and schedule maintenance windows across the ecosystem.
- **Identity & Access Management:** Administer unified SSO accounts, role assignments, multi-product sessions, and user moderation.
- **System Architecture & Database Topology:** Visualize live service boundaries, PostgreSQL per-service database schemas, and microservice dependencies via interactive canvas views.
- **Telemetry & Metric Aggregation:** Real-time visibility into cross-product synergies, platform active sessions, and catalog status.

### Primary Consumers & Integrations

- **`@forginity/sdk`:** Consumes type-safe client APIs, pure async service methods, and reactive TanStack Query hooks with automatic cache invalidation and zero runtime server cost.
- **`@workspace/ui`:** Consumes unified Coral Sunset dark-mode design system components built on Base UI primitives and styled with Tailwind CSS v4.
- **`services/products` & `services/auth`:** Communicates with backend microservices via REST APIs exposed through reverse proxy gateways.

---

## 2. Architecture & Tech Stack

- **Framework:** Next.js 16.4 (App Router) with Turbopack compilation.
- **UI Library & Primitives:** React 19 (19.3), `@base-ui/react` primitives, Shadcn UI (`@workspace/ui`).
- **Styling & Design System:** Tailwind CSS v4, Coral Sunset dark theme tokens, single-font Lexend typography.
- **Client Data Layer:** `@forginity/sdk` with TanStack Query v5 (`@tanstack/react-query`).
- **Topology & Canvas:** `@xyflow/react` for database and service architecture visualizations.
- **Icons:** Lucide React (`lucide-react`).
- **Language & Runtime:** TypeScript 5+ (Strict mode, `tsc --noEmit`).

---

## 3. Key Design Principles

### A. UI-Stream Psychology & Zero Layout Shift (CLS = 0.00)
- Immediate initial layout paint with high-fidelity skeletons (`ProductTableSkeleton`, skeletonized `MetricCard` values) matching exact rendered pixel dimensions (70px table rows, responsive metric cards).
- Zero Content Layout Shift (`CLS = 0.00`) and optimized Largest Contentful Paint (`LCP`) during asynchronous data streaming.

### B. Universal Responsiveness & Mobile-First Adaptation
- **Mobile (`< 640px`):** Single-column stacked metrics, collapsible drawer sidebar, touch-friendly horizontal scroll table container (`overflow-x-auto min-w-[850px]`).
- **Tablet (`640px - 1024px`):** 2-column KPI grids, responsive header action wrapping.
- **Desktop (`> 1024px`):** Full 4-column metric layout, expanded navigation sidebar, multi-panel catalog views.

### C. Breadcrumb-Driven Navigation
- Clean top-level sidebar navigation exposing high-level domains (`Home`, `Product`, `User`).
- Sub-actions (`Add product`, `Edit product`, `View details`, `Delete`) route via semantic breadcrumb paths (`Workspace > Product > [Action]`) with dedicated back navigation.

### D. Centralized Resilience & Error Handling
- Reusable `QueryErrorState` displays clean, dark-themed feedback on network or API failures, extracting `ApiError` HTTP status codes with a single-click retry action.

---

## 4. Route Structure

| Route | View Description | Data Source |
| :--- | :--- | :--- |
| `/` | Admin Executive Dashboard & High-Level Platform KPIs | `@workspace/ui`, aggregated telemetry |
| `/products` | Product Catalog Table, Lifecycle Filtering & KPI Cards | `@forginity/sdk` (`useProducts`) |
| `/products/add` | Product Creation Form with Initial Version Registration | `@forginity/sdk` (`useCreateProduct`) |
| `/products/[id]` | Product Details, Version Tracks & Maintenance Schedule | `@forginity/sdk` (`useProduct`, `useProductVersions`) |
| `/users` | User Directory, Role Management & Session Auditing | `@workspace/ui`, user management |
| `/arch/db` | Interactive Schema & Database Topology Canvas | `@xyflow/react`, Drizzle schemas |
| `/settings` | Admin Preferences & Environment Configuration | Platform settings |
| `/help` | Operational Runbooks & Architecture Documentation | Internal documentation |

---

## 5. Development & Verification Commands

All commands can be executed from the repository root using `pnpm --filter @web/admin <command>`, or directly inside `apps/admin`.
For full ecosystem port allocations across microservices and applications, see [`docs/development/SERVICES.md`](file:///home/vikas/Documents/forginity/docs/development/SERVICES.md).

### 1. Local Development Server
Starts the Next.js development server with Turbopack on `http://localhost:3000`:

```bash
# From repository root
pnpm --filter @web/admin dev

# Or from apps/admin/
pnpm dev
```

### 2. Strict TypeScript Typecheck
Executes strict TypeScript validation without emitting files:

```bash
# From repository root
pnpm --filter @web/admin typecheck

# Or from apps/admin/
pnpm typecheck
```

### 3. ESLint Code Quality Check
Executes ESLint across all TypeScript and TSX files:

```bash
# From repository root
pnpm --filter @web/admin lint

# Or from apps/admin/
pnpm lint
```

### 4. Code Formatting
Formats code according to Prettier rules and Tailwind CSS class sorting:

```bash
# From repository root
pnpm --filter @web/admin format

# Or from apps/admin/
pnpm format
```

### 5. Production Build & Static Page Generation
Compiles an optimized production build using Turbopack:

```bash
# From repository root
pnpm --filter @web/admin build

# Or from apps/admin/
pnpm build
```

### 6. Production Server Start
Starts the Next.js production server using compiled `.next` artifacts:

```bash
# From repository root
pnpm --filter @web/admin start

# Or from apps/admin/
pnpm start
```

---

## 6. Testing Strategy

`@web/admin` participates in the Forginity monorepo multi-tier testing strategy:

1. **Client SDK & API Contract Tests:** The client data layer consumed by admin is thoroughly tested with Vitest in `@forginity/sdk`:
   ```bash
   pnpm --filter @forginity/sdk test
   ```
2. **Backend Services Integration Tests:** Real database CRUD operations, Drizzle schemas, and REST endpoints are tested with Vitest and Supertest in backend services:
   ```bash
   pnpm --filter @service/products test
   ```
3. **Admin Compilation & Type Safety Suite:** Verified prior to every commit via:
   ```bash
   pnpm --filter @web/admin typecheck && pnpm --filter @web/admin lint && pnpm --filter @web/admin build
   ```

---

## 7. Security & Guardrails

- **Zero `.env` File Access:** Never create, edit, commit, or read `.env` files. Secrets and environment variables are read exclusively from `process.env`.
- **Strict Git Ban:** All git commits and pushes must be made manually by the human operator.
- **Type-First Contracts:** Data models derive directly from authoritative Zod schemas and DTO contracts.
- **No Barrel Exports:** Imports explicitly target source files (e.g. `@forginity/sdk/modules/products/products.hooks`, `@workspace/ui/components/button`).
- **Single Typography:** Uses Lexend font exclusively across the entire UI.
