# Forginity Client SDK (`@forginity/sdk`)

Official client SDK for the Forginity monorepo platform. Provides a standardized, type-safe HTTP client, extensible authentication interceptors, centralized API endpoint registries, and reactive TanStack Query hooks across all consumer micro-frontends (`apps/admin`, `apps/web`, and product applications).

---

## What `@forginity/sdk` Is

`@forginity/sdk` is a shared monorepo TypeScript library located at `packages/sdk`. It is **NOT** a standalone server or microservice; it runs with **zero server cost ($0.00)** and bundles directly into frontend Next.js applications at build time.

### Primary Responsibilities

1. **Centralized HTTP Transport:** Houses the core Axios client with pre-configured timeouts, headers, and base URL resolution.
2. **Auth & Error Interceptors:** Injects dynamic Bearer tokens on outgoing requests and normalizes all 4xx/5xx network failures into structured `ApiError` instances.
3. **Domain Decoupled Modules:** Houses domain-specific services, types, cache key factories, and React Query hooks under `src/modules/<domain>/` (e.g., `products`, `auth`, `pikyrider`).
4. **Reactive State & Caching:** Encapsulates TanStack Query hooks with automatic cache invalidation and deduplication, reducing backend database load to near-zero for repeated page transitions.
5. **Direct Source Imports:** Adheres strictly to the Forginity **No Barrel Exports** policy—all modules are imported directly from authoritative sub-paths.

---

## What the SDK Exposes

### 1. Core Network Layer (`@forginity/sdk/core/*`)

- **`http-client.ts`:**
  - `apiClient`: Default pre-configured Axios singleton instance.
  - `createHttpClient(options)`: Factory to instantiate custom HTTP clients.
  - `setAuthTokenProvider(provider)`: Global callback to dynamically supply JWT/SSO tokens.
- **`api-error.ts`:**
  - `ApiError`: Standardized error class with `status: number`, `code?: string`, and `details?: unknown`.
  - `ApiError.isApiError(err)`: Type-guard to safely handle errors in UI boundaries.
- **`query-client.ts`:**
  - `createDefaultQueryClient()`: Factory generating a TanStack `QueryClient` pre-configured with 5-minute `staleTime`, 10-minute cache retention, and smart retry policies (ignores 4xx client errors).

### 2. Constants & Route Registry (`@forginity/sdk/constants/*`)

- **`endpoints.ts`:**
  - `API_ENDPOINTS.PRODUCTS`: Centralized URL dictionary for products, versions, and maintenance windows.

### 3. Product Domain Module (`@forginity/sdk/modules/products/*`)

- **`products.types.ts`:** Authoritative TypeScript contracts (`Product`, `ProductVersion`, `ProductMaintenance`, `ProductWithRelations`, `CreateProductPayload`, `UpdateProductPayload`, etc.).
- **`products.service.ts`:** Pure async methods independent of React:
  - `ProductsService.list(params)`
  - `ProductsService.getById(id, { versionList })` (version history included by default)
  - `ProductsService.getBySlug(slug, { versionList })`
  - `ProductsService.create(payload)` (supports atomic `initialVersion` registration)
  - `ProductsService.update(id, payload)` (supports atomic `newVersion` registration)
  - `ProductsService.delete(id, { confirmation: true })` (guarded against accidental deletion)
  - Sub-resource methods for versions and maintenance.
- **`products.cache-keys.ts`:** Hierarchical query key factory:
  - `productCacheKeys.all`, `productCacheKeys.lists()`, `productCacheKeys.list(params)`, `productCacheKeys.detail(id, options)`, `productCacheKeys.bySlug(slug)`.
  - `productKeys` exported as a backward-compatible alias.
- **`products.hooks.ts`:** Reactive TanStack Query hooks:
  - `useProducts(params)`
  - `useProduct(id, options)`
  - `useProductBySlug(slug, options)`
  - `useCreateProduct()` (automatically invalidates lists)
  - `useUpdateProduct()` (automatically invalidates lists and details)
  - `useDeleteProduct()` (requires confirmation, invalidates lists)
  - Sub-resource hooks: `useProductVersions`, `useCreateProductVersion`, `useProductMaintenance`, `useActiveMaintenance`, `useCreateProductMaintenance`.

---

## How to Integrate `@forginity/sdk`

### Step 1: Add Workspace Dependency

In your application's `package.json` (e.g. `apps/admin/package.json`):

```json
{
  "dependencies": {
    "@forginity/sdk": "workspace:*"
  }
}
```

Then run `pnpm install` from the repository root.

---

### Step 2: Configure the Query Provider in App Layout

In Next.js App Router, wrap your root layout with a client-side `QueryClientProvider` using the SDK's preset:

```tsx
// apps/admin/providers/query-provider.tsx
"use client"

import * as React from "react"
import { QueryClientProvider } from "@tanstack/react-query"
import { createDefaultQueryClient } from "@forginity/sdk/core/query-client"

export function QueryProvider({ children }: { children: React.ReactNode }) {
  // Ensure QueryClient is instantiated once per client session to prevent SSR state leaks
  const [queryClient] = React.useState(() => createDefaultQueryClient())

  return (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  )
}
```

Then mount it in `app/layout.tsx`:

```tsx
// apps/admin/app/layout.tsx
import { QueryProvider } from "@/providers/query-provider"

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <QueryProvider>
          {children}
        </QueryProvider>
      </body>
    </html>
  )
}
```

---

### Step 3: Wire Authentication Token Provider (When Auth is Active)

Configure the SDK's token provider during app initialization (e.g. in your auth provider or root client component):

```typescript
import { setAuthTokenProvider } from "@forginity/sdk/core/http-client"

// Example: Supply current session token
setAuthTokenProvider(async () => {
  const token = await getSessionToken()
  return token || null
})
```

All subsequent API requests automatically attach the `Authorization: Bearer <token>` header.

---

### Step 4: Consuming Query Hooks in Components

#### A. Fetching and Filtering Products

```tsx
"use client"

import { useState } from "react"
import { useProducts } from "@forginity/sdk/modules/products/products.hooks"
import { ApiError } from "@forginity/sdk/core/api-error"

export function ProductCatalog() {
  const [search, setSearch] = useState("")
  const [status, setStatus] = useState<"active" | "beta" | "deprecated" | undefined>()

  const { data, isLoading, error } = useProducts({ search, status })

  if (isLoading) return <div>Loading products...</div>
  if (error) {
    return <div>Error: {ApiError.isApiError(error) ? error.message : "Failed to load"}</div>
  }

  return (
    <div>
      {data?.items.map((product) => (
        <div key={product.id}>
          <h3>{product.name}</h3>
          <p>Slug: {product.slug}</p>
        </div>
      ))}
    </div>
  )
}
```

#### B. Creating a Product with Initial Version

```tsx
import { useCreateProduct } from "@forginity/sdk/modules/products/products.hooks"

export function CreateProductButton() {
  const { mutateAsync: createProduct, isPending } = useCreateProduct()

  const handleCreate = async () => {
    try {
      const newProduct = await createProduct({
        name: "TrackRide Fleet",
        slug: "trackride-fleet",
        status: "active",
        initialVersion: {
          version: "1.0.0",
          status: "latest",
          changelog: "Initial public launch",
        },
      })
      console.log("Created successfully with version:", newProduct.versions?.[0])
    } catch (err) {
      console.error("Creation failed", err)
    }
  }

  return (
    <button onClick={handleCreate} disabled={isPending}>
      {isPending ? "Creating..." : "Create Product"}
    </button>
  )
}
```

#### C. Deleting a Product (Confirmation Guarded)

```tsx
import { useDeleteProduct } from "@forginity/sdk/modules/products/products.hooks"

export function DeleteProductButton({ productId }: { productId: string }) {
  const { mutateAsync: deleteProduct } = useDeleteProduct()

  const handleDelete = async () => {
    // Requires explicit confirmation: true
    await deleteProduct({
      id: productId,
      options: { confirmation: true },
    })
  }

  return <button onClick={handleDelete}>Delete Permanently</button>
}
```

---

## Testing & Verification

To run tests and type checking inside `@forginity/sdk`:

```bash
# Execute unit test suite (Vitest)
pnpm --filter @forginity/sdk test

# Execute TypeScript typecheck
pnpm --filter @forginity/sdk typecheck
```
