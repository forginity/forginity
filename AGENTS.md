<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

# Forginity Agent Guidelines and Development Workflow

## 1. Absolute Rules and Safety Guardrails

- **Type-First Architecture.** Always apply a strict Type-First approach. Define data contracts, domain types, Zod schemas, and entity shapes before writing business logic, repositories, or routes. Derive TypeScript types directly from authoritative Zod schemas and Drizzle definitions using `z.infer` and `$inferSelect`. Treat external inputs as untyped until validated at the network boundary. Make invalid domain states unrepresentable.
- **Environment File Protection.** Never touch any `.env` file under any circumstance. Do not read, inspect, create, modify, edit, or commit `.env`, `.env.local`, `.env.production`, `.env.development`, or `.env.staging`. Read secrets exclusively from `process.env`. Store sample variable keys in `.env.example` with dummy values.
- **Git Mutation Guard.** Read-only git commands such as `git status`, `git diff`, and `git log` are permitted. State-changing git commands such as `git pull`, `git rebase`, `git commit`, `git push`, `git checkout`, `git merge`, and `git reset` require explicit user confirmation.
- **Documentation Grounding.** Follow the architectural blueprints in [`docs/org/TDD.md`](file:///home/vikas/Documents/forginity/docs/org/TDD.md), [`docs/org/PRD.md`](file:///home/vikas/Documents/forginity/docs/org/PRD.md), and [`docs/org/SMA-PVR.md`](file:///home/vikas/Documents/forginity/docs/org/SMA-PVR.md).

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
| Bootstrap              | `src/`              | `app.ts`, `index.ts` | Express application setup and public exports.          |

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

The AI development workflow operates on a clean, four-stage lifecycle:
`Service Details -> Progressive Task List -> Task Implementation Guide -> Implementation Record`

### Universal Task Statuses

Keep task status definitions here in `AGENTS.md`. Do not repeat this legend inside individual task lists.

| Status | Meaning |
| :--- | :--- |
| `PENDING` | Task is planned. Guide is not yet started. |
| `IN_PROGRESS` | Implementation guide is active. Code or tests are underway. |
| `COMPLETED` | Code written, verified with tests, and logged in `IMPLEMENTATIONS_RECORD.md`. |
| `BLOCKED` | Dependent on external API, contract, or operator decision. |

### Universal Task Execution Lifecycle

#### Step 1: Discover Task List or Create One

The AI agent checks for an existing task list at:

```text
docs/development/<service_name>/TASK_LIST.md
```

If the file does not exist, the AI agent creates it from [`docs/template/TASK_LIST_TEMPLATE.md`](file:///home/vikas/Documents/forginity/docs/template/TASK_LIST_TEMPLATE.md) with full service details. It also generates the service specification overview at `docs/development/<service_name>/README.md` from [`docs/template/README_TEMPLATE.md`](file:///home/vikas/Documents/forginity/docs/template/README_TEMPLATE.md), and initializes the implementation tracking log at `docs/development/<service_name>/IMPLEMENTATIONS_RECORD.md` using [`docs/template/IMPLEMENTATIONS_RECORD_TEMPLATE.md`](file:///home/vikas/Documents/forginity/docs/template/IMPLEMENTATIONS_RECORD_TEMPLATE.md).

#### Step 2: Review Task

The AI agent reviews the service details and selects the next sequential pending task from `docs/development/<service_name>/TASK_LIST.md`.

#### Step 3: Create Task Implementation Guide

Before writing or modifying any code, the AI agent creates an implementation guide for the selected task:

```text
docs/development/<service_name>/TASK_<NO>_IMPLEMENTATION_GUIDE.md
```

The AI agent creates this file from the template at [`docs/template/TASK_IMPLEMENTATION_GUIDE_TEMPLATE.md`](file:///home/vikas/Documents/forginity/docs/template/TASK_IMPLEMENTATION_GUIDE_TEMPLATE.md).

#### Step 4: Execute Implementation

The AI agent implements code and tests strictly according to the guide. The agent applies a Type-First approach, defining Zod schemas and TypeScript types before writing logic. The agent follows Test-Driven Development principles. The agent does not skip test or security scenarios.

#### Step 5: Post-Implementation Verification

The AI agent executes the full verification suite against the affected package:

- `pnpm --filter [package] typecheck`
- `pnpm --filter [package] lint`
- `pnpm --filter [package] test`

#### Step 6: Update Implementation Records

Once verification succeeds, the AI agent updates service records:

1. Update the **Last Update Record** (date, completed task, two-line change summary) in `docs/development/<service_name>/IMPLEMENTATIONS_RECORD.md`.
2. Append a row to the **Completed Tasks** table in `docs/development/<service_name>/IMPLEMENTATIONS_RECORD.md`.
3. Mark the task as `COMPLETED` in `docs/development/<service_name>/TASK_LIST.md`.

### Required Sections in Each Implementation Guide

Every `TASK_<NO>_IMPLEMENTATION_GUIDE.md` must contain:

1. **Task Summary.** Goal and business rationale.
2. **Task Scope.** List of files to create and edit, and explicit out-of-scope boundaries.
3. **Implementation Guide.** Step-by-step instructions for schemas, repositories, services, and routes.
4. **Test Scenarios to Cover.** Happy path, input validation failures, duplicate checks, and edge cases.
5. **Security Scenarios to Cover.** OWASP checks, Zod input validation, authentication guards, and query parameterization.
6. **Post-Implementation Workflow.** Exact shell commands for type checking, linting, and testing.
7. **Record Update Instructions.** Instructions to log the completed task in `IMPLEMENTATIONS_RECORD.md` and refresh the Last Update Record.

### Templates Reference Directory

The authoritative templates for this workflow live in [`docs/template/`](file:///home/vikas/Documents/forginity/docs/template/):

- Task List Template: [`docs/template/TASK_LIST_TEMPLATE.md`](file:///home/vikas/Documents/forginity/docs/template/TASK_LIST_TEMPLATE.md)
- Task Implementation Guide Template: [`docs/template/TASK_IMPLEMENTATION_GUIDE_TEMPLATE.md`](file:///home/vikas/Documents/forginity/docs/template/TASK_IMPLEMENTATION_GUIDE_TEMPLATE.md)
- Implementation Record Template: [`docs/template/IMPLEMENTATIONS_RECORD_TEMPLATE.md`](file:///home/vikas/Documents/forginity/docs/template/IMPLEMENTATIONS_RECORD_TEMPLATE.md)
