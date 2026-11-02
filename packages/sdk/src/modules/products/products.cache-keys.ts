import type { ListProductsParams, GetProductOptions } from "./products.types.js"

/**
 * Stable TanStack Query Cache Key Factory for Product domain queries.
 */
export const productCacheKeys = {
  all: ["products"] as const,
  lists: () => [...productCacheKeys.all, "list"] as const,
  list: (params?: ListProductsParams) =>
    [...productCacheKeys.lists(), params ?? {}] as const,
  details: () => [...productCacheKeys.all, "detail"] as const,
  detail: (id: string, options?: GetProductOptions) =>
    [...productCacheKeys.details(), id, options ?? {}] as const,
  bySlug: (slug: string, options?: GetProductOptions) =>
    [...productCacheKeys.all, "by-slug", slug, options ?? {}] as const,
  versions: (productId: string) =>
    [...productCacheKeys.all, "versions", productId] as const,
  version: (versionId: string) =>
    [...productCacheKeys.all, "version", versionId] as const,
  maintenance: (productId?: string) =>
    [...productCacheKeys.all, "maintenance", productId ?? "active"] as const,
}

/**
 * Semantic alias for backward-compatibility.
 */
export const productKeys = productCacheKeys
