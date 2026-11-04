import { describe, it, expect } from "vitest"
import { productCacheKeys, productKeys } from "./products.cache-keys"
import {
  useProducts,
  useProduct,
  useProductBySlug,
  useCreateProduct,
  useUpdateProduct,
  useDeleteProduct,
  useProductVersions,
  useCreateProductVersion,
  useUpdateProductVersion,
  useDeleteProductVersion,
  useProductMaintenance,
  useActiveMaintenance,
  useCreateProductMaintenance,
  useUpdateProductMaintenance,
  useDeleteProductMaintenance,
} from "./products.hooks"

describe("packages/sdk/src/modules/products/products.cache-keys", () => {
  it("should generate hierarchical query keys correctly", () => {
    expect(productCacheKeys.all).toEqual(["products"])
    expect(productCacheKeys.lists()).toEqual(["products", "list"])
    expect(productCacheKeys.list({ search: "piky", status: "active" })).toEqual([
      "products",
      "list",
      { search: "piky", status: "active" },
    ])
    expect(productCacheKeys.details()).toEqual(["products", "detail"])
    expect(productCacheKeys.detail("prod-123")).toEqual([
      "products",
      "detail",
      "prod-123",
      {},
    ])
    expect(productCacheKeys.detail("prod-123", { versionList: false })).toEqual([
      "products",
      "detail",
      "prod-123",
      { versionList: false },
    ])
    expect(productCacheKeys.bySlug("trackride")).toEqual([
      "products",
      "by-slug",
      "trackride",
      {},
    ])
    expect(productCacheKeys.versions("prod-123")).toEqual([
      "products",
      "versions",
      "prod-123",
    ])
    expect(productCacheKeys.maintenance("prod-123")).toEqual([
      "products",
      "maintenance",
      "prod-123",
    ])
    expect(productCacheKeys.maintenance()).toEqual([
      "products",
      "maintenance",
      "active",
    ])
    expect(productKeys).toBe(productCacheKeys)
  })
})

describe("packages/sdk/src/modules/products/products.hooks", () => {
  it("should export query and mutation hooks as functions", () => {
    expect(typeof useProducts).toBe("function")
    expect(typeof useProduct).toBe("function")
    expect(typeof useProductBySlug).toBe("function")
    expect(typeof useCreateProduct).toBe("function")
    expect(typeof useUpdateProduct).toBe("function")
    expect(typeof useDeleteProduct).toBe("function")
    expect(typeof useProductVersions).toBe("function")
    expect(typeof useCreateProductVersion).toBe("function")
    expect(typeof useUpdateProductVersion).toBe("function")
    expect(typeof useDeleteProductVersion).toBe("function")
    expect(typeof useProductMaintenance).toBe("function")
    expect(typeof useActiveMaintenance).toBe("function")
    expect(typeof useCreateProductMaintenance).toBe("function")
    expect(typeof useUpdateProductMaintenance).toBe("function")
    expect(typeof useDeleteProductMaintenance).toBe("function")
  })
})
