import { describe, it, expect, vi, beforeEach } from "vitest"
import { ProductService } from "./product.service.js"
import { ProductRepository } from "../repositories/product.repository.js"

describe("ProductService", () => {
  beforeEach(() => {
    vi.restoreAllMocks()
  })

  describe("listProducts", () => {
    it("should return paginated list of products with hasMore flag", async () => {
      const mockProducts = [
        {
          id: "11111111-1111-1111-1111-111111111111",
          slug: "trackride",
          name: "TrackRide",
          status: "active",
          createdAt: new Date(),
        },
      ]

      vi.spyOn(ProductRepository, "findMany").mockResolvedValueOnce({
        items: mockProducts,
        total: 10,
      })

      const result = await ProductService.listProducts({
        limit: 1,
        offset: 0,
      })

      expect(ProductRepository.findMany).toHaveBeenCalledWith({
        limit: 1,
        offset: 0,
        status: undefined,
        search: undefined,
      })
      expect(result.items).toHaveLength(1)
      expect(result.pagination).toEqual({
        total: 10,
        limit: 1,
        offset: 0,
        hasMore: true,
      })
    })
  })

  describe("getProductById", () => {
    it("should query by UUID id", async () => {
      const id = "aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee"
      const mockProduct = {
        id,
        slug: "raksha",
        name: "Raksha",
        status: "active",
        createdAt: new Date(),
      }

      const findByIdSpy = vi
        .spyOn(ProductRepository, "findById")
        .mockResolvedValueOnce(mockProduct)

      const product = await ProductService.getProductById(id)

      expect(findByIdSpy).toHaveBeenCalledWith(id)
      expect(product).toEqual(mockProduct)
    })

    it("should call findByIdWithRelations when includeRelations is true", async () => {
      const id = "aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee"
      const mockWithRelations = {
        id,
        slug: "raksha",
        name: "Raksha",
        status: "active",
        createdAt: new Date(),
        maintenance: [],
        versions: [],
      }

      const spy = vi
        .spyOn(ProductRepository, "findByIdWithRelations")
        .mockResolvedValueOnce(mockWithRelations as any)

      const result = await ProductService.getProductById(id, true)

      expect(spy).toHaveBeenCalledWith(id)
      expect(result).toEqual(mockWithRelations)
    })
  })

  describe("getProductBySlug", () => {
    it("should query by slug string", async () => {
      const slug = "trackride"
      const mockProduct = {
        id: "11111111-1111-1111-1111-111111111111",
        slug,
        name: "TrackRide",
        status: "active",
        createdAt: new Date(),
      }

      const findBySlugSpy = vi
        .spyOn(ProductRepository, "findBySlug")
        .mockResolvedValueOnce(mockProduct)

      const product = await ProductService.getProductBySlug(slug)

      expect(findBySlugSpy).toHaveBeenCalledWith(slug)
      expect(product).toEqual(mockProduct)
    })
  })

  describe("createProduct", () => {
    it("should successfully create a product if slug is unique", async () => {
      vi.spyOn(ProductRepository, "findBySlug").mockResolvedValueOnce(null)
      const createdMock = {
        id: "22222222-2222-2222-2222-222222222222",
        slug: "custom-cloth",
        name: "Custom Cloth",
        status: "active",
        createdAt: new Date(),
      }
      vi.spyOn(ProductRepository, "create").mockResolvedValueOnce(createdMock)

      const result = await ProductService.createProduct({
        slug: "custom-cloth",
        name: "Custom Cloth",
        status: "active",
      })

      expect(result).toEqual(createdMock)
      expect(ProductRepository.create).toHaveBeenCalledWith({
        slug: "custom-cloth",
        name: "Custom Cloth",
        status: "active",
      })
    })

    it("should throw error if product slug already exists", async () => {
      vi.spyOn(ProductRepository, "findBySlug").mockResolvedValueOnce({
        id: "33333333-3333-3333-3333-333333333333",
        slug: "trackride",
        name: "TrackRide",
        status: "active",
        createdAt: new Date(),
      })

      await expect(
        ProductService.createProduct({
          slug: "trackride",
          name: "TrackRide Copy",
          status: "active",
        })
      ).rejects.toThrow("Product with slug 'trackride' already exists")
    })
  })

  describe("updateProduct", () => {
    it("should return null if product does not exist", async () => {
      vi.spyOn(ProductRepository, "findById").mockResolvedValueOnce(null)

      const result = await ProductService.updateProduct(
        "11111111-1111-1111-1111-111111111111",
        { name: "Updated Name" }
      )

      expect(result).toBeNull()
    })

    it("should reject slug updates if the new slug is taken by another product", async () => {
      const existingProduct = {
        id: "11111111-1111-1111-1111-111111111111",
        slug: "trackride",
        name: "TrackRide",
        status: "active",
        createdAt: new Date(),
      }

      vi.spyOn(ProductRepository, "findById").mockResolvedValueOnce(existingProduct)
      vi.spyOn(ProductRepository, "findBySlug").mockResolvedValueOnce({
        id: "99999999-9999-9999-9999-999999999999",
        slug: "taken-slug",
        name: "Taken Product",
        status: "active",
        createdAt: new Date(),
      })

      await expect(
        ProductService.updateProduct("11111111-1111-1111-1111-111111111111", {
          slug: "taken-slug",
        })
      ).rejects.toThrow("Product with slug 'taken-slug' already exists")
    })
  })

  describe("deleteProduct", () => {
    it("should delete product by id", async () => {
      vi.spyOn(ProductRepository, "delete").mockResolvedValueOnce(true)

      const result = await ProductService.deleteProduct(
        "11111111-1111-1111-1111-111111111111"
      )
      expect(result).toBe(true)
      expect(ProductRepository.delete).toHaveBeenCalledWith(
        "11111111-1111-1111-1111-111111111111"
      )
    })
  })
})
