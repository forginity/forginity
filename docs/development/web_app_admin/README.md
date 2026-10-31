# APP SPECIFICATION: WEB_APP_ADMIN

## 1. EXECUTIVE SUMMARY

- **Application Name:** `apps/admin` (Portal Foundation & Shell)
- **Folder Reference:** `docs/development/web_app_admin`
- **Domain:** Forginity Centralized Administration Portal Foundation
- **Owner:** Forginity Core Platform Team
- **Purpose:** `web_app_admin` defines the foundational setup of the unified web-based administration console (`apps/admin`). It configures the Shadcn UI design system, dark/light theme switching, responsive collapsible sidebar layout, top header bar, and route structure with empty placeholder pages prior to feature integrations.
- **Consumers:** Internal platform administrators, product managers, and support engineers.
- **Development Roadmap:** [`./TASK_LIST.md`](./TASK_LIST.md)
- **Implementation Record:** [`./IMPLEMENTATIONS_RECORD.md`](./IMPLEMENTATIONS_RECORD.md)

---

## 2. BUSINESS & FUNCTIONAL REQUIREMENTS

### Core Capabilities
- **Shadcn UI Component Architecture:** Standardize UI primitives (Button, Card, Sidebar, Sheet, Dropdown, Avatar, Breadcrumb, Separator, Tooltip) powered by `@workspace/ui` and Tailwind CSS v4.
- **Dark/Light Theme System:** System-aware theme toggling with zero flash on hydration using `next-themes`.
- **Responsive Admin Shell:** Collapsible desktop sidebar and mobile slide-out drawer with active route highlighting.
- **Portal Navigation & Route Hierarchy:** Scaffolded routing with empty placeholder cards and breadcrumbs for:
  - `/` - Dashboard Overview
  - `/products` - Product Catalog (Target for Priority 3: `web_admin_product_crud`)
  - `/maintenance` - Maintenance Operations
  - `/users` - User & Organization Moderation
  - `/automation` - Workflow Automation Builder (`@xyflow/react`)
  - `/settings` - Platform Settings
- **Empty State Views:** Informative placeholder UI cards on each route indicating upcoming feature capabilities.

---

## 3. ARCHITECTURE & TECH STACK

- **Framework:** Next.js 16 (App Router), React 19, TypeScript.
- **Styling & UI Components:** Tailwind CSS v4, Shadcn UI (`@workspace/ui`), Lucide React icons.
- **State Management & Theming:** `next-themes` (Dark/Light mode) and React Server Components.
- **Workflow Visualization:** `@xyflow/react` integrated for node-based automation.
- **Architectural Reference:** [`apps/admin`](file:///home/vikas/Documents/forginity/apps/admin)

---

## 4. APPLICATION ROUTE STRUCTURE

Managed within `apps/admin/app`:

- `/` - Admin dashboard landing page with stat cards and activity feed placeholder
- `/products` - Empty placeholder for product catalog and creation drawer
- `/maintenance` - Empty placeholder for maintenance window calendar
- `/users` - Empty placeholder for user directory and moderation
- `/automation` - Empty placeholder for workflow canvas editor
- `/settings` - Empty placeholder for admin settings

---

## 5. SECURITY & COMPLIANCE

- **Zero `.env` Access:** Never inspect, create, or commit `.env` files. Secrets are read strictly from `process.env`.
- **Strict Network Isolation:** Empty pages operate without external data mutations until integrated with authenticated backend services.
