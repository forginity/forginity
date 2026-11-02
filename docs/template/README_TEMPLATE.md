# [SERVICE / PACKAGE / APP NAME] (`@[scope]/[name]`)

[One-line summary describing the primary purpose and role of this service, package, or application in the Forginity monorepo platform.]

---

## 1. What This [Service / Package / App] Is

[Provide a clear 2-3 paragraph explanation of the component, why it exists, what problem it solves, and its high-level responsibilities.]

### Primary Responsibilities
- **[Responsibility 1]:** [Description]
- **[Responsibility 2]:** [Description]
- **[Responsibility 3]:** [Description]

### Primary Consumers & Integrations
- **[Consumer 1]:** [How it interacts]
- **[Consumer 2]:** [How it interacts]

---

## 2. Architecture & Tech Stack

- **Runtime / Framework:** [e.g. Node.js + Express 5 / Next.js 16 / TypeScript]
- **Database / Storage:** [e.g. PostgreSQL 18 with Drizzle ORM (Database-per-Service isolation)]
- **State & Caching:** [e.g. Redis 7 / TanStack Query v5]
- **Validation Engine:** [e.g. Zod runtime schemas with Type-First inference]
- **Testing Framework:** [e.g. Vitest with Supertest]
- **Zero Runtime Server Cost:** [Yes/No - e.g. for packages, state that it is compiled/bundled into client assets]

---

## 3. What It Exposes

### [For Backend Services: Endpoints & Routes]
| Method | Endpoint | Description | Auth Required |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/[resource]` | List resources with pagination and filters | No |
| `GET` | `/api/[resource]/:id` | Retrieve single resource by UUID | No |
| `POST` | `/api/[resource]` | Create resource with validation payload | Yes |
| `PATCH` | `/api/[resource]/:id` | Update resource fields | Yes |
| `DELETE` | `/api/[resource]/:id` | Delete resource | Yes |

### [For Shared Packages: Exported Modules, Hooks & Contracts]
- **`[module-path]`:** [Description of exported classes, services, or utilities]
- **`[hooks-path]`:** [Description of React Query hooks and mutation functions]
- **`[types-path]`:** [Description of exported domain contracts and DTOs]

---

## 4. How to Use & Integrate

### 1. Installation / Dependency Linking
[Explain how to link or depend on this package/service within the monorepo workspace.]

```json
{
  "dependencies": {
    "@[scope]/[name]": "workspace:*"
  }
}
```

### 2. Configuration & Environment Variables
[List required configuration variables read from `process.env`. Never create or touch `.env` files directly.]

```bash
[VAR_NAME]=[default_or_example_value]
```

### 3. Usage Examples
[Provide clear, copy-pasteable code snippets demonstrating how to initialize, call, or consume this component.]

```typescript
// Example usage
```

---

## 5. Development & Testing Commands

Execute verification commands from the repository root:

```bash
# Run unit and integration tests
pnpm --filter @[scope]/[name] test

# Run strict TypeScript typecheck
pnpm --filter @[scope]/[name] typecheck

# Run linter
pnpm --filter @[scope]/[name] lint
```

---

## 6. Security & Guardrails

- **Zero `.env` File Access:** Secrets are read strictly from `process.env`.
- **Type-First Contracts:** All external payloads validated through authoritative Zod schemas.
- **No Barrel Exports:** Import symbols directly from their authoritative source files.
