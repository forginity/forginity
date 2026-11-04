import { describe, it, expect, vi, beforeEach } from "vitest"
import { ProductsService } from "./products.service"
import { apiClient } from "../../core/http-client"
import { ApiError } from "../../core/api-error"

describe("packages/sdk/src/modules/products/products.service", () => {
  beforeEach(() => {
    vi.restoreAllMocks()
  })

  it("should list products with query parameters", async () => {
    const mockResponse = {
      data: {
        items: [{ id: "1", name: "Flow", slug: "flow", status: "active" }],
        pagination: { total: 1, limit: 10, offset: 0, hasMore: false },
      },
    }
    vi.spyOn(apiClient, "get").mockResolvedValueOnce(mockResponse)

    const result = await ProductsService.list({ search: "flow", status: "active" })

    expect(apiClient.get).toHaveBeenCalledWith("/api/products", {
      params: { search: "flow", status: "active" },
    })
    expect(result.items).toHaveLength(1)
  })

  it("should get product by id with versionList=true by default", async () => {
    const mockProduct = {
      data: {
        id: "prod-1",
        name: "PikyRider",
        slug: "pikyrider",
        status: "active",
        versions: [{ id: "v-1", version: "1.0.0", status: "latest" }],
      },
    }
    vi.spyOn(apiClient, "get").mockResolvedValueOnce(mockProduct)

    const result = await ProductsService.getById("prod-1")

    expect(apiClient.get).toHaveBeenCalledWith("/api/products/prod-1", {
      params: { includeRelations: true },
    })
    expect(result.versions).toHaveLength(1)
  })

  it("should get product by id with versionList=false when explicitly specified", async () => {
    const mockProduct = {
      data: {
        id: "prod-1",
        name: "PikyRider",
        slug: "pikyrider",
        status: "active",
      },
    }
    vi.spyOn(apiClient, "get").mockResolvedValueOnce(mockProduct)

    await ProductsService.getById("prod-1", { versionList: false })

    expect(apiClient.get).toHaveBeenCalledWith("/api/products/prod-1", {
      params: { includeRelations: false },
    })
  })

  it("should get product by slug with versionList=true by default", async () => {
    const mockProduct = {
      data: {
        id: "prod-2",
        name: "Atlas",
        slug: "atlas",
        status: "active",
        versions: [],
      },
    }
    vi.spyOn(apiClient, "get").mockResolvedValueOnce(mockProduct)

    const result = await ProductsService.getBySlug("atlas")

    expect(apiClient.get).toHaveBeenCalledWith("/api/products/slug/atlas", {
      params: { includeRelations: true },
    })
    expect(result.slug).toBe("atlas")
  })

  it("should create a product without initialVersion", async () => {
    const mockCreated = {
      data: { id: "prod-new", name: "Vault", slug: "vault", status: "active" },
    }
    vi.spyOn(apiClient, "post").mockResolvedValueOnce(mockCreated)

    const result = await ProductsService.create({
      name: "Vault",
      slug: "vault",
      status: "active",
    })

    expect(apiClient.post).toHaveBeenCalledWith("/api/products", {
      name: "Vault",
      slug: "vault",
      status: "active",
    })
    expect(result.id).toBe("prod-new")
  })

  it("should create a product with atomic initialVersion registration", async () => {
    const mockCreatedProduct = {
      data: { id: "prod-10", name: "Echo", slug: "echo", status: "active" },
    }
    const mockCreatedVersion = {
      data: { id: "ver-10", productId: "prod-10", version: "1.0.0", status: "latest" },
    }
    vi.spyOn(apiClient, "post")
      .mockResolvedValueOnce(mockCreatedProduct)
      .mockResolvedValueOnce(mockCreatedVersion)

    const result = await ProductsService.create({
      name: "Echo",
      slug: "echo",
      status: "active",
      initialVersion: {
        version: "1.0.0",
        status: "latest",
        changelog: "Initial release",
      },
    })

    expect(apiClient.post).toHaveBeenNthCalledWith(1, "/api/products", {
      name: "Echo",
      slug: "echo",
      status: "active",
    })
    expect(apiClient.post).toHaveBeenNthCalledWith(
      2,
      "/api/products/prod-10/versions",
      {
        version: "1.0.0",
        status: "latest",
        changelog: "Initial release",
      }
    )
    expect(result.versions).toEqual([mockCreatedVersion.data])
  })

  it("should update a product and add a newVersion when provided", async () => {
    vi.spyOn(apiClient, "patch").mockResolvedValueOnce({ data: {} })
    vi.spyOn(apiClient, "post").mockResolvedValueOnce({ data: {} })
    const mockRefreshed = {
      data: {
        id: "prod-1",
        name: "Echo v2",
        slug: "echo",
        versions: [{ version: "2.0.0", status: "latest" }],
      },
    }
    vi.spyOn(apiClient, "get").mockResolvedValueOnce(mockRefreshed)

    const result = await ProductsService.update("prod-1", {
      name: "Echo v2",
      newVersion: { version: "2.0.0", status: "latest" },
    })

    expect(apiClient.patch).toHaveBeenCalledWith("/api/products/prod-1", {
      name: "Echo v2",
    })
    expect(apiClient.post).toHaveBeenCalledWith("/api/products/prod-1/versions", {
      version: "2.0.0",
      status: "latest",
    })
    expect(result.name).toBe("Echo v2")
  })

  it("should throw ApiError when delete is called without confirmation: true", async () => {
    const deleteSpy = vi.spyOn(apiClient, "delete")

    await expect(ProductsService.delete("prod-1")).rejects.toSatisfy((err: unknown) => {
      expect(ApiError.isApiError(err)).toBe(true)
      const apiErr = err as ApiError
      expect(apiErr.code).toBe("CONFIRMATION_REQUIRED")
      expect(apiErr.status).toBe(400)
      return true
    })

    await expect(
      ProductsService.delete("prod-1", { confirmation: false })
    ).rejects.toSatisfy((err: unknown) => {
      expect(ApiError.isApiError(err)).toBe(true)
      return true
    })

    expect(deleteSpy).not.toHaveBeenCalled()
  })

  it("should execute DELETE when confirmation: true is explicitly provided", async () => {
    vi.spyOn(apiClient, "delete").mockResolvedValueOnce({ data: {} })

    const result = await ProductsService.delete("prod-1", { confirmation: true })

    expect(apiClient.delete).toHaveBeenCalledWith("/api/products/prod-1")
    expect(result.success).toBe(true)
  })

  it("should manage versions through sub-resource methods", async () => {
    vi.spyOn(apiClient, "get").mockResolvedValueOnce({
      data: { items: [{ id: "v1", version: "1.0.0" }] },
    })
    const listResult = await ProductsService.listVersions("prod-1")
    expect(apiClient.get).toHaveBeenCalledWith("/api/products/prod-1/versions")
    expect(listResult.items).toHaveLength(1)

    vi.spyOn(apiClient, "post").mockResolvedValueOnce({
      data: { id: "v2", version: "1.1.0" },
    })
    const createResult = await ProductsService.createVersion("prod-1", {
      version: "1.1.0",
    })
    expect(apiClient.post).toHaveBeenCalledWith(
      "/api/products/prod-1/versions",
      { version: "1.1.0" }
    )
    expect(createResult.version).toBe("1.1.0")
  })

  it("should manage maintenance windows through sub-resource methods", async () => {
    vi.spyOn(apiClient, "get").mockResolvedValueOnce({
      data: { items: [{ id: "m1", message: "DB migration", startsAt: "2026-11-03T00:00:00Z", endsAt: "2026-11-03T04:00:00Z", status: "scheduled" }] },
    })
    const activeResult = await ProductsService.listActiveMaintenance()
    expect(apiClient.get).toHaveBeenCalledWith("/api/products/maintenance/active")
    expect(activeResult.items).toHaveLength(1)

    vi.spyOn(apiClient, "post").mockResolvedValueOnce({
      data: { id: "m2", message: "Network patch", startsAt: "2026-11-03T00:00:00Z", endsAt: "2026-11-03T04:00:00Z", status: "scheduled" },
    })
    const createResult = await ProductsService.createMaintenance("prod-1", {
      message: "Network patch",
      startsAt: "2026-11-03T00:00:00Z",
      endsAt: "2026-11-03T04:00:00Z",
    })
    expect(apiClient.post).toHaveBeenCalledWith(
      "/api/products/prod-1/maintenance",
      {
        message: "Network patch",
        startsAt: "2026-11-03T00:00:00Z",
        endsAt: "2026-11-03T04:00:00Z",
      }
    )
    expect(createResult.message).toBe("Network patch")

    vi.spyOn(apiClient, "patch").mockResolvedValueOnce({
      data: { id: "m2", message: "Network patch extended", startsAt: "2026-11-03T00:00:00Z", endsAt: "2026-11-03T06:00:00Z", status: "scheduled" },
    })
    const updateResult = await ProductsService.updateMaintenance("m2", {
      message: "Network patch extended",
    })
    expect(apiClient.patch).toHaveBeenCalledWith(
      "/api/products/maintenance/m2",
      { message: "Network patch extended" }
    )
    expect(updateResult.message).toBe("Network patch extended")

    vi.spyOn(apiClient, "delete").mockResolvedValueOnce({ data: {} })
    const deleteResult = await ProductsService.deleteMaintenance("m2")
    expect(apiClient.delete).toHaveBeenCalledWith("/api/products/maintenance/m2")
    expect(deleteResult.success).toBe(true)
  })
})
