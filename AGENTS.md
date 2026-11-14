<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

# Forginity Agent Guidelines and Development Workflow

## 1. Absolute Rules and Safety Guardrails

- **Type-First Architecture.** Always apply a strict Type-First approach. Define data contracts, domain types, Zod schemas, and entity shapes before writing business logic, repositories, or routes. Derive TypeScript types directly from authoritative Zod schemas and Drizzle definitions using `z.infer` and `$inferSelect`. Treat external inputs as untyped until validated at the network boundary. Make invalid domain states unrepresentable.
- **No Barrel Exports.** Never use barrel exports or barrel files (e.g., `index.ts` files that aggregate and re-export modules with `export * from ...` or `export { ... } from ...`). Always import types, schemas, functions, constants, controllers, repositories, and services directly from their specific, authoritative source files (e.g., `import { ProductService } from "./services/product.service.js"`, `import { products } from "./db/products.schema.js"`). Barrel files obscure module boundaries, cause subtle circular dependency hazards, degrade tree-shaking, and slow down compilation and test runners.
- **Mandatory Swagger/OpenAPI Integration.** Every API created and tested must be immediately registered in the service's Swagger/OpenAPI documentation. Follow the strict sequence: `Create API -> Write & Verify Tests -> Integrate Swagger/OpenAPI Documentation`. Re-use authoritative Zod schemas via `@asteasolutions/zod-to-openapi` to keep documentation and runtime validation synchronized without manual duplication. Expose the interactive UI at `/api/docs` and the raw JSON specification at `/api/docs.json`. Never leave an API endpoint undocumented.
- **Unambiguous REST Sub-Resource and Parameter Naming.** In REST route hierarchies involving 1-to-many parent-child relationships (e.g. `/api/products/:productId/maintenance`, `/api/products/:productId/versions`), never use an ambiguous generic `:id` parameter that conflates the parent entity with child records. Express route paths and Swagger/OpenAPI definitions must use explicit semantic parameter names (e.g., `productId`, `maintenanceId`, `versionId`). When creating mutating sub-resource routes (`PATCH /maintenance/:id`, `DELETE /maintenance/:id`), always provide the complementary single-item read route (`GET /maintenance/:id`), and place static sub-routes (such as `/maintenance/active`) before parameterized routes (`/maintenance/:id`) to prevent route masking.
- **Graceful Client Parsing and Error Handling.** Express centralized error handlers must intercept payload syntax errors (such as `entity.parse.failed` or `SyntaxError` with status 400 from `express.json()`), returning a clean 400 Bad Request response without logging full stack traces as unhandled server crashes. Only actual 5xx internal server errors should be logged to `console.error`. Automated route integration tests must explicitly verify malformed raw JSON strings and invalid domain enums.
- **Environment File Protection.** Never touch, read, inspect, create, modify, edit, or commit any `.env` file under any circumstance (including `.env`, `.env.local`, `.env.production`, `.env.development`, `.env.staging`, etc.). Whether an `.env` file is present or absent, you are strictly prohibited from attempting to read, inspect, or interact with it. Read secrets exclusively from `process.env`. Store sample variable keys in `.env.example` with dummy values.
- **Strict Git Ban (No Commits or Pushes).** The agent is strictly prohibited from committing code (`git commit`), pushing code (`git push`), tagging, or performing any mutating git actions anywhere. All git commits and pushes must be made manually by the user. Only read-only git commands such as `git status`, `git diff`, and `git log` are permitted.
- **Root Directory Boundary.** The agent is strictly prohibited from creating, modifying, inspecting, or reading files outside the project root directory (`/home/vikas/Documents/forginity`). All file actions must be strictly bounded within the repository workspace.
- **Documentation Grounding.** Follow the architectural blueprints in [`docs/org/TDD.md`](file:///home/vikas/Documents/forginity/docs/org/TDD.md), [`docs/org/PRD.md`](file:///home/vikas/Documents/forginity/docs/org/PRD.md), and [`docs/org/SMA-PVR.md`](file:///home/vikas/Documents/forginity/docs/org/SMA-PVR.md).
- **Self-Explanatory File and Variable Naming.** The name of any file, variable, constant, type, or function should be self-explanatory whenever possible (e.g., prefer `products.cache-keys.ts` and `productCacheKeys` over generic `products.keys.ts` or `keys`; prefer `fetchProductById` over `getById`). While not dogmatically strict in trivial contexts (such as standard loop indexes `i` or standard callback arguments), always prioritize clarity and cognitive ease across all packages, services, and frontend applications so that any developer or agent instantly understands purpose and context without guessing.
- **Universal Responsiveness and Mobile-First Viewport Adaptation.** Every UI screen, data table, layout shell, modal, and drawer built across Forginity applications (`apps/*`) must be fully responsive across mobile (`< 640px`), tablet (`640px - 1024px`), and desktop (`> 1024px`) viewports. Wide data tables must implement touch-friendly horizontal scroll containers (`overflow-x-auto`) with fixed minimum content widths (`min-w-[850px]`) and boundary clipping protections. Responsive layouts must never allow viewport blowout, unhandled text overflow, or unreadable metric stacking. Loading skeletons must strictly mirror the exact responsive grid (e.g., 1-column mobile, 2-column tablet, 4-column desktop) to ensure zero Content Layout Shift (CLS) across all screen sizes.
- **UI-Streaming Skeleton Principle (Dynamic vs. Static).** Loading skeletons are strictly reserved for views that fetch asynchronous, dynamic data from backend services (e.g. catalog tables, entity detail views, edit views). Static form views with no dynamic data dependencies (such as creation pages like `/products/add`) must NEVER display loading skeletons; they render synchronously and instantly without layout shift. For all dynamic views, loading skeletons must strictly mirror the exact geometry, container paddings, field heights, and column widths of the resolved state to ensure zero Content Layout Shift (CLS = 0.00).

---

## 2. Organization Information, Plan, and Goals

Forginity operates as a multi-product software organization. It builds high-impact B2C and B2B digital applications.

- **Core Vision.** Deploy independent digital products connected by a shared identity, single sign-on, and design system.
- **Platform Advantage.** Centralized core services eliminate redundant code. New products reuse existing authentication, billing, and UI packages.
- **Primary Milestone.** Deploy the first product server infrastructure to production by January 2027 using Hetzner Cloud and Docker.
- **Strategic Documentation.**
  - Strategic assessment: [`docs/org/SMA-PVR.md`](file:///home/vikas/Documents/forginity/docs/org/SMA-PVR.md).
  - Product portfolio requirements: [`docs/org/PRD.md`](file:///home/vikas/Documents/forginity/docs/org/PRD.md).
  - Technical architecture design: [`docs/org/TDD.md`](file:///home/vikas/Documents/forginity/docs/org/TDD.md).

---

## 3. Scope of the Project

Forginity builds a domain-decoupled monorepo platform.

- **What We Build.** A modular monorepo containing frontend applications in `apps/`, shared microservices in `services/`, and reusable libraries in `packages/`.
- **Why We Build It.** Independent software products waste months rebuilding authentication, billing, and UI foundations. Centralizing shared infrastructure lowers development overhead and speeds delivery.
- **How We Build It.** We use Turborepo and pnpm workspaces. Microservices run on Express with TypeScript. Databases follow a strict database-per-service model using PostgreSQL and Drizzle ORM.
- **Active Products.**
  - **TrackRide (Anchor Flagship Product).** Voice-guided motorcycle group navigation, deviation alerts, offline maps, and group ride awareness.
  - **Custom Apparel and AI Print.** Generative AI artwork generation for blank apparel with automated supplier fulfillment.
  - **Automated Candidate Assessment.** Automated interview and technical screening workflows for hiring teams.

---

## 4. Technical Architecture and Implementation

### High-Level Architecture (HLD)

Requests route through Cloudflare Edge into an Nginx reverse proxy gateway. Nginx directs web traffic to Next.js micro-frontends and API requests to Express backend microservices.

```text
               ┌──────────────────────────────────────────────┐
               │           Cloudflare Edge / DNS              │
               └──────────────────────┬───────────────────────┘
                                      │
                                      ▼
               ┌──────────────────────────────────────────────┐
               │          Nginx Reverse Proxy Gateway         │
               └──────┬───────────────────────┬───────────────┘
                      │                       │
                      ▼                       ▼
           ┌──────────────────────┐┌──────────────────────┐
           │ Next.js Frontends    ││ Express Microservices│
           │ (apps/*)             ││ (services/*)         │
           └──────────────────────┘└──────────────────────┘
```

### Tech Stack

- **Monorepo Engine:** Turborepo with pnpm.
- **Frontend Framework:** Next.js 16 (App Router), React 19, Tailwind CSS, Shadcn UI (`@workspace/ui`).
- **Backend Services:** Node.js with Express and TypeScript.
- **Database Engine:** PostgreSQL 18 with Drizzle ORM.
- **Cache and Messaging:** Redis 7 with Socket.IO.
- **AI Processing:** Python 3.11 with FastAPI and Google Gemini API SDK.
- **Automation:** n8n workflow engine.

### Low-Level Design (LLD) and Backend Suffix Conventions

Backend services in `services/*` must follow strict role-based file naming:

| Layer                  | Path                | Suffix Pattern       | Responsibility                                         |
| :--------------------- | :------------------ | :------------------- | :----------------------------------------------------- |
| Database Schema        | `src/db/`           | `*.schema.ts`        | Drizzle ORM table definitions, columns, and relations. |
| Validation             | `src/db/`           | `*.validator.ts`     | Zod runtime schemas and inferred TypeScript types.     |
| Repository Layer       | `src/repositories/` | `*.repository.ts`    | Database queries and Drizzle ORM operations.           |
| Service Layer          | `src/services/`     | `*.service.ts`       | Business logic, domain rules, and orchestration.       |
| Routes and Controllers | `src/routes/`       | `*.route.ts`         | Express HTTP route handlers and validation binding.    |
| Middleware             | `src/middleware/`   | `*.middleware.ts`    | Auth guards, rate limiting, and error handling.        |
| Bootstrap              | `src/`              | `app.ts`, `index.ts` | Express application bootstrap and DB client initialization (no barrel re-exports). |

### Database-per-Service Isolation

Microservices do not share database tables. Microservices never execute cross-service SQL joins. Cross-service communication occurs through REST APIs or Redis events.

---

## 5. Build and Deployment Strategy

- **Launch Target:** January 2027.
- **Hosting Infrastructure:** Hetzner Cloud dedicated instances protected by Cloudflare SSL and proxying.
- **Containerization:** Multi-stage Dockerfiles for backend services and Next.js applications.
- **Local Development:** Docker Compose orchestrates PostgreSQL, Redis, and local services.
- **CI/CD Pipeline:** GitHub Actions runs automated linting, type checking, unit tests, and zero-downtime deployment rollouts.

---

## 6. Test-Driven Development (TDD)

Engineering teams and AI agents must follow Test-Driven Development principles.

- **Test Sequence.** Write test scenarios before or alongside business logic implementation.
- **Unit Testing.** Test Zod schemas, validation edge cases, and service business logic.
- **Integration Testing.** Test Express route handlers against isolated test database containers.
- **Verification Commands.** Every implementation step must pass the verification suite:
  - `pnpm --filter [package] typecheck`
  - `pnpm --filter [package] lint`
  - `pnpm --filter [package] test`

---

## 7. AI Development Workflow

The AI development workflow operates on a clean, streamlined lifecycle:
`Progressive Task List -> Task Implementation Guide -> Verification -> Central Implementation Record & Progress Update`

### Universal Task Statuses

Keep task status definitions here in `AGENTS.md`. Do not repeat this legend inside individual task lists.

| Status | Meaning |
| :--- | :--- |
| `PENDING` | Task is planned. Guide is not yet started. |
| `IN_PROGRESS` | Implementation guide is active. Code or tests are underway. |
| `COMPLETED` | Code written, verified with tests, logged in central `docs/development/IMPLEMENTATION_RECORD.md`, and reflected in `PROGRESS.md`. |
| `BLOCKED` | Dependent on external API, contract, or operator decision. |

### Universal Task Execution Lifecycle

#### Step 1: Discover Task List or Create One

The AI agent checks for an existing task list at:

```text
docs/development/<service_name>/TASK_LIST.md
```

If the file does not exist, the AI agent creates it from [`docs/template/TASK_LIST_TEMPLATE.md`](file:///home/vikas/Documents/forginity/docs/template/TASK_LIST_TEMPLATE.md) with full service/component details.

> [!IMPORTANT]
> **Zero Redundant Documentation in Task Folders:**
> Individual service or component folders under `docs/development/<service_name>/` strictly contain only:
> 1. `TASK_LIST.md` (the progressive task matrix and service/component details)
> 2. `TASK_<NO>_IMPLEMENTATION_GUIDE.md` (step-by-step implementation guides)
> 
> **Do NOT create individual `README.md` or `IMPLEMENTATIONS_RECORD.md` files in task tracking folders.** All status tracking and task completions are consolidated centrally at the root of `docs/development/`.

> [!NOTE]
> **Authoritative `README.md` in Service and Package Codebase Folders:**
> While task tracking folders under `docs/development/` strictly omit local README files, every service, package, and application directory in the codebase root (`services/*`, `packages/*`, `apps/*`) MUST maintain an authoritative `README.md` created from [`docs/template/README_TEMPLATE.md`](file:///home/vikas/Documents/forginity/docs/template/README_TEMPLATE.md). It documents what that service or package is, what contracts/APIs it exposes, and concrete examples on how to consume and integrate it.

All progress tracking and audit logs across the ecosystem are maintained exclusively in two root files:
- **Central Progress Tracker:** [`docs/development/PROGRESS.md`](file:///home/vikas/Documents/forginity/docs/development/PROGRESS.md) containing two tables: **OVERALL DEVELOPMENT PROGRESS** (single summary row tracking total tasks, completed, pending, and progress percentage across the Forginity monorepo ecosystem) and **TASK DEVELOPMENT PROGRESS** (tracking macro components ordered by priority: Service, Total Tasks, Completed, Pending, Disclaimer, Status, Deadline, and Progress).
- **Central Implementation Record:** [`docs/development/IMPLEMENTATION_RECORD.md`](file:///home/vikas/Documents/forginity/docs/development/IMPLEMENTATION_RECORD.md) containing the ecosystem-wide **Last Update** log and the single authoritative **Completed Tasks** table across all services and components.

#### Step 2: Review Task

The AI agent reviews the service/component details in `docs/development/<service_name>/TASK_LIST.md` and selects the next sequential pending task.

#### Step 3: Create Task Implementation Guide

Before writing or modifying any code, the AI agent creates an implementation guide for the selected task:

```text
docs/development/<service_name>/TASK_<NO>_IMPLEMENTATION_GUIDE.md
```

The AI agent creates this file from the template at [`docs/template/TASK_IMPLEMENTATION_GUIDE_TEMPLATE.md`](file:///home/vikas/Documents/forginity/docs/template/TASK_IMPLEMENTATION_GUIDE_TEMPLATE.md).

#### Step 4: Execute Implementation

The AI agent implements code and tests strictly according to the guide. The agent applies a Type-First approach and follows the mandatory API development lifecycle:
1. **Define Contracts & Schemas:** Authoritative Zod schemas, domain constants, and Drizzle definitions.
2. **Implement Logic:** Repositories, domain services, controllers, and Express routes.
3. **Test-Driven Verification:** Unit tests for schemas/services and real database integration tests for CRUD lifecycles.
4. **Swagger/OpenAPI Integration:** Immediately register request/response Zod schemas and route path contracts in the OpenAPI registry (`@asteasolutions/zod-to-openapi`) and verify interactive UI at `/api/docs` and raw spec at `/api/docs.json`. Never skip OpenAPI documentation for newly created endpoints.
5. **REST Route Hygiene & Precedence:** Ensure sub-resources use explicit semantic parameter names (`:productId`, `:maintenanceId`), provide single-item GET lookups for all mutable resources, register static routes before parameterized routes, and verify malformed JSON body handling.

#### Step 5: Post-Implementation Verification

The AI agent executes the full verification suite against the affected package:

- `pnpm --filter [package] typecheck`
- `pnpm --filter [package] lint`
- `pnpm --filter [package] test`

#### Step 6: Update Implementation Records

Once verification succeeds, the AI agent updates records in the following exact sequence:

1. Mark the task as `COMPLETED` in `docs/development/<service_name>/TASK_LIST.md`.
2. Update the central implementation record in [`docs/development/IMPLEMENTATION_RECORD.md`](file:///home/vikas/Documents/forginity/docs/development/IMPLEMENTATION_RECORD.md):
   - Update the **Last Update** section with current timestamp, service/component, completed task ID & title, and a two-line summary.
   - Append a row to the **Completed Tasks** table (Service / Component, Task ID, Task Title, Guide File link, Completed Date, Verified By).
3. Refresh the progress tracker in [`docs/development/PROGRESS.md`](file:///home/vikas/Documents/forginity/docs/development/PROGRESS.md):
   - Update the component row in **TASK DEVELOPMENT PROGRESS** (Total Tasks, Completed, Pending, Disclaimer, Status, Deadline, Progress %).
   - Refresh the summary metrics in **OVERALL DEVELOPMENT PROGRESS** (Total Tasks, Completed, Pending, Progress %).

### Required Sections in Each Implementation Guide

Every `TASK_<NO>_IMPLEMENTATION_GUIDE.md` must contain:

1. **Task Summary.** Goal and business rationale.
2. **Task Scope.** List of files to create and edit, and explicit out-of-scope boundaries.
3. **Implementation Guide.** Step-by-step instructions for schemas, repositories, services, and routes.
4. **Test Scenarios to Cover.** Happy path, input validation failures, duplicate checks, and edge cases.
5. **Security Scenarios to Cover.** OWASP checks, Zod input validation, authentication guards, and query parameterization.
6. **Post-Implementation Workflow.** Exact shell commands for type checking, linting, and testing.
7. **Record Update Instructions.** Instructions to mark the task completed in `TASK_LIST.md`, log the completed task in central `docs/development/IMPLEMENTATION_RECORD.md`, and refresh `docs/development/PROGRESS.md`.

### Templates Reference Directory

The authoritative templates for this workflow live in [`docs/template/`](file:///home/vikas/Documents/forginity/docs/template/):

- Overall Development Progress Template: [`docs/template/PROGRESS_TEMPLATE.md`](file:///home/vikas/Documents/forginity/docs/template/PROGRESS_TEMPLATE.md)
- Central Implementation Record Template: [`docs/template/IMPLEMENTATION_RECORD_TEMPLATE.md`](file:///home/vikas/Documents/forginity/docs/template/IMPLEMENTATION_RECORD_TEMPLATE.md)
- Task List Template: [`docs/template/TASK_LIST_TEMPLATE.md`](file:///home/vikas/Documents/forginity/docs/template/TASK_LIST_TEMPLATE.md)
- Task Implementation Guide Template: [`docs/template/TASK_IMPLEMENTATION_GUIDE_TEMPLATE.md`](file:///home/vikas/Documents/forginity/docs/template/TASK_IMPLEMENTATION_GUIDE_TEMPLATE.md)
