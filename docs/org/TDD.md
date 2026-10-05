# TECHNICAL DESIGN DOCUMENT (TDD) — FORGINITY ORG ARCHITECTURE

## DOCUMENT CONTROL

- **System Title:** Forginity Monorepo Platform, Module Federation & Shared Services Engine
- **AI Engine Profile:** CTO Skill Persona v1.0 (Technical Architecture & Systems Engineering)
- **Date Updated:** 2026-10-01
- **Associated Strategy & Product Sources:** [docs/org/SMA-PVR.md](file:///home/vikas/Documents/forginity/docs/org/SMA-PVR.md), [docs/org/PRD.md](file:///home/vikas/Documents/forginity/docs/org/PRD.md), [docs/org/UIUX_SPEC.md](file:///home/vikas/Documents/forginity/docs/org/UIUX_SPEC.md), [docs_old/TAD/Architecture.md](file:///home/vikas/Documents/forginity/docs_old/TAD/Architecture.md)
- **Primary Milestone:** 1st Product Server Live in **January 2027** (Hetzner Cloud + Docker)

---

## 1. HIGH-LEVEL SYSTEM ARCHITECTURE (HLD) & MODULE FEDERATION

Forginity is engineered as a domain-decoupled, modular monorepo platform. It utilizes **Turborepo** to orchestrate frontend micro-applications and backend microservices, enabling independent deployments while sharing a single authentication, billing, and UI design system.

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
           ┌──────────────────────────┴────────┐     ┌────────┴──────────────────────────┐
           │ Micro-Frontend Apps (Next.js)     │     │ Backend Microservices (Fastify)   │
           │  - apps/shell (Container Host)    │     │  - services/auth                  │
           │  - apps/auth (SSO Remote)         │     │  - services/payment-api           │
           │  - apps/project-* (Remote Apps)   │     │  - services/notification-api      │
           │  - apps/admin & apps/docs         │     │  - services/ai-api (Python)       │
           └───────────────────────────────────┘     └──────────────────┬────────────────┘
                                                                        │
                                                     ┌──────────────────┴────────────────┐
                                                     │ Data & Real-Time Infrastructure   │
                                                     │  - Isolated DB per Service (Pg)   │
                                                     │  - Redis (Session Cache & Pub/Sub)│
                                                     └───────────────────────────────────┘
```

### Tech Stack Specifications

| Layer | Technology | Primary Function |
| :--- | :--- | :--- |
| **Monorepo Build System** | Turborepo + pnpm Workspaces | Task caching, parallel builds, monorepo dependency graph. |
| **Frontend & Federation** | React / Next.js + `@module-federation/nextjs-mf` | Dynamic micro-frontend mounting, zero-page-reload app switching. |
| **Design System** | Tailwind CSS + Shadcn UI + Lexend Font | `@forginity/ui` package with Powder Dark theme tokens. |
| **Backend Framework** | Node.js + Fastify (TypeScript) | High-performance REST & GraphQL microservice endpoints. |
| **Database Architecture** | PostgreSQL 16 (Database-per-Service) | Type-safe SQL migrations via Drizzle ORM; domain-isolated databases. |
| **Caching & Messaging** | Redis 7 + Socket.IO | Session storage, rate limiting, real-time WebSocket pub/sub. |
| **AI Processing** | Python 3.11 + FastAPI + Gemini API SDK | Generative image creation, ML vector processing, automation. |
| **DevOps & Hosting** | Docker / K8s / GitHub Actions / Hetzner Cloud | Containerized deployments targeting January 2027 server launch. |
| **Payment Gateway** | Stripe API | Usage-based SaaS billing, host-paid subscriptions, checkout webhooks. |

---

## 2. MASTER MICROSERVICES & APPS ARCHITECTURE TABLE

### A. Backend Microservices (`services/`)

| Microservice Name | Tech Stack | Primary Responsibilities | Data Layer & External APIs |
| :--- | :--- | :--- | :--- |
| **`services/auth`** | Fastify (Node.js/TS) | Centralized SSO, User Accounts, Organizations, Memberships, Sessions, RBAC. | `auth_db` (PostgreSQL), Redis Cache. |
| **`services/payment-api`** | Fastify (Node.js/TS) | Stripe subscription lifecycle, checkout sessions, invoice webhooks, usage metering. | `payment_db` (PostgreSQL), Stripe SDK. |
| **`services/notification-api`** | Fastify + Socket.IO | Real-time WebSocket event dispatch, Email alerts, SMS dispatch, Push notifications. | `notification_db`, Redis Pub/Sub, Resend / SendGrid API, Twilio / Kaleyra SMS API. |
| **`services/ai-api`** | Python 3.11 + FastAPI | Generative AI prompt pipeline (Custom Apparel artwork generation), smart data analysis. | Google Gemini API SDK, Local Image Processing. |
| **`services/n8n`** | n8n Workflow Engine | Automated third-party partner integrations, e-commerce print supplier webhooks, batch jobs. | External Webhooks, Partner APIs. |

---

### B. Micro-Frontend Applications (`apps/`)

| Application Name | Framework | Federation Role | Mount Route / Domain |
| :--- | :--- | :--- | :--- |
| **`apps/shell`** | Next.js App Router | **Host Container** (Renders Header, App Switcher, Shell Layout, and Remote Viewports) | `forginity.com /` |
| **`apps/auth`** | Next.js App Router | **Remote App** (Exposes SSO Login, Registration, Passkey Auth, Account Settings Modals) | `auth.forginity.com` |
| **`apps/admin`** | Next.js App Router | **Remote App** (Exposes Platform Analytics, User Management, Billing Dashboard) | `admin.forginity.com` |
| **`apps/docs`** | Next.js / Fumadocs | **Standalone App** (Developer API Documentation, Platform Specs, Help Center) | `docs.forginity.com` |
| **`apps/project-1`** *(e.g. trackride)* | Next.js / React Native | **Remote App** (First Product Micro-Frontend plugged into Module Federation Shell) | `trackride.forginity.com` |

---

### C. Shared Packages & SDKs (`packages/`)

| Package Name | Scope Identifier | Core Capabilities & Exported Utilities |
| :--- | :--- | :--- |
| **`packages/ui`** | `@forginity/ui` | Powder Dark Theme tokens, Lexend font configuration, Shadcn UI component primitives, Global `ForginityHeader`, `AppLauncher`, `AuthModal`. |
| **`packages/sdk`** | `@forginity/sdk` | Official Forginity Client SDK: Handles SSO token storage, API HTTP client wrappers, Socket.IO reconnect logic, Telemetry reporting. |
| **`packages/config`** | `@forginity/config` | Shared configuration files for Tailwind CSS, PostCSS, ESLint, Prettier, and base TypeScript `tsconfig.json`. |
| **`packages/types`** | `@forginity/types` | Centralized TypeScript interfaces, DTO definitions, User/Org entity types, and API contract request/response payloads. |
| **`packages/validation`** | `@forginity/validation` | Shared Zod validation schemas for backend Fastify API inputs and client-side form validation. |
| **`packages/eslint-config`**| `@forginity/eslint-config` | Standardized linting rules for Next.js, Fastify microservices, and React components. |

---

## 3. DATABASE ARCHITECTURE & MICROSERVICE DOMAIN ISOLATION

Forginity strictly enforces the **Database-per-Service** architectural pattern. Microservices do not share database tables or execute cross-service SQL joins; all cross-service data communication occurs via defined Fastify REST/gRPC API contracts or Redis Pub/Sub events.

Detailed Drizzle schemas, migrations, and indexing strategies will be specified in `docs/org/DB.md`.

### Core Database Mapping Table

| Database Identifier | Owner Microservice | Primary Domain Entities & Storage Scope |
| :--- | :--- | :--- |
| **`forginity_db`** | Forginity Platform Core | Central product registry, product feature toggles, platform maintenance states, global configuration flags. |
| **`auth_db`** | `services/auth` | User accounts, credentials, OAuth providers, organizations/workspaces, memberships (RBAC), SSO session tokens. |
| **`payment_db`** | `services/payment-api` | Subscriptions, plan tiers, Stripe customer IDs, payment invoices, metering logs, usage records. |
| **`notification_db`** | `services/notification-api` | Notification templates, dispatch history logs, user channel preferences, device push tokens. |
| **`trackride_db`** | `apps/project-1` (TrackRide) | Rides, planned routes, waypoints, location history pings, danger reports, group ride sessions. |
| **`cloth_db`** | `apps/project-2` (Custom Apparel) | Blank apparel inventory, AI art generation job history, customer orders, print seller fulfillment status. |

---

## 4. MONOREPO REPOSITORY TREE

```text
forginity/
├── apps/
│   ├── auth/                  # Next.js - Identity & SSO Remote Micro-Frontend
│   ├── shell/                 # Next.js - Main Container Shell & App Launcher
│   ├── admin/                 # Next.js - Platform Administration Portal
│   └── docs/                  # Next.js - Developer Documentation Portal
│
├── services/
│   ├── auth/                  # Fastify - Centralized SSO, Users & Org Management
│   ├── payment-api/           # Fastify - Stripe Payments & Subscriptions Service
│   ├── notification-api/     # Fastify - Email/SMS/Push Notification Dispatcher
│   ├── ai-api/                # Python - Shared AI Pipeline Service (FastAPI)
│   └── n8n/                   # n8n Engine - Supplier & Workflow Automation
│
├── packages/
│   ├── ui/                    # Shared Tailwind/Shadcn Powder UI (`@forginity/ui`)
│   ├── sdk/                   # Shared Client SDK (`@forginity/sdk`)
│   ├── config/                # Shared ESLint, Prettier, Tailwind & TS configs
│   ├── types/                 # Shared TypeScript Interfaces & DTOs
│   ├── validation/            # Shared Zod Validation Schemas
│   └── eslint-config/         # Standardized Linting Rules
│
├── infrastructure/
│   ├── docker/                # Service Dockerfiles
│   ├── nginx/                 # Reverse proxy & gateway configurations
│   └── compose/               # Docker Compose environments (dev & prod)
│
├── docs/                      # Platform Documentation
│   └── org/                   # SMA-PVR.md, PRD.md, UIUX_SPEC.md, TDD.md
│
├── package.json               # Monorepo root manifest
├── turbo.json                 # Turborepo task pipeline configuration
└── tsconfig.json              # Base TypeScript configuration
```

---

## 5. INFRASTRUCTURE & DEPLOYMENT STRATEGY

- **Target Deployment Date:** **January 2027**
- **Hosting Provider:** Hetzner Cloud (Dedicated AX/CX instance) + Cloudflare Proxy & SSL.
- **Containerization:** Multi-stage Dockerfiles for Fastify backend services and static/SSR Next.js builds.
- **CI/CD Pipeline:** GitHub Actions triggering automated linting, Zod schema validation, unit tests, and zero-downtime Docker Compose rollouts.

---
