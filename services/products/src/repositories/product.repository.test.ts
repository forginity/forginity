import { describe, it, expect, beforeAll, afterAll } from "vitest"
import { ProductRepository } from "./product.repository.js"
import { checkDatabaseConnection } from "../db/connection.js"
import type { Product } from "../db/products.schema.js"

describe("ProductRepository Real Database CRUD Operations", () => {
  let createdProduct: Product | null = null
  const uniqueTestSlug = `test-crud-${Date.now()}`

  // 1. Mandatory database connectivity check before any test execution
  beforeAll(async () => {
    // Throws an explicit error if database connection cannot be established
    await ProductRepository.checkConnection()
  })

  // Cleanup after all tests finish
  afterAll(async () => {
    if (createdProduct?.id) {
      await ProductRepository.delete(createdProduct.id).catch(() => {})
    }
  })

  describe("Database Connectivity", () => {
    it("should confirm the database is connected", async () => {
      const isConnected = await ProductRepository.checkConnection()
      expect(isConnected).toBe(true)
    })

    it("should throw an error when database is disconnected or client is invalid", async () => {
      const invalidDb = {
        execute: async () => {
          throw new Error("Connection refused at port 5432")
        },
      }

      await expect(checkDatabaseConnection(invalidDb)).rejects.toThrow(
        "Database connection failed: Connection refused at port 5432"
      )
    })
  })

  describe("Sequential Real Database CRUD Flow: Add -> Get -> Edit -> Delete", () => {
    it("1. ADD (Create) product in the real database", async () => {
      createdProduct = await ProductRepository.create({
        slug: uniqueTestSlug,
        name: "Test CRUD Lifecycle Product",
        status: "active",
      })

      expect(createdProduct).toBeDefined()
      expect(createdProduct.id).toBeDefined()
      expect(createdProduct.slug).toBe(uniqueTestSlug)
      expect(createdProduct.name).toBe("Test CRUD Lifecycle Product")
      expect(createdProduct.status).toBe("active")
      expect(createdProduct.createdAt).toBeInstanceOf(Date)
    })

    it("2. GET (Read) product from the real database by ID and Slug", async () => {
      expect(createdProduct).not.toBeNull()
      const productId = createdProduct!.id

      // Query by ID
      const byId = await ProductRepository.findById(productId)
      expect(byId).not.toBeNull()
      expect(byId?.id).toBe(productId)
      expect(byId?.slug).toBe(uniqueTestSlug)
      expect(byId?.name).toBe("Test CRUD Lifecycle Product")

      // Query by Slug
      const bySlug = await ProductRepository.findBySlug(uniqueTestSlug)
      expect(bySlug).not.toBeNull()
      expect(bySlug?.id).toBe(productId)
      expect(bySlug?.slug).toBe(uniqueTestSlug)
    })

    it("3. EDIT (Update) product in the real database", async () => {
      expect(createdProduct).not.toBeNull()
      const productId = createdProduct!.id

      const updated = await ProductRepository.update(productId, {
        name: "Updated CRUD Lifecycle Product",
        status: "beta",
      })

      expect(updated).not.toBeNull()
      expect(updated?.id).toBe(productId)
      expect(updated?.name).toBe("Updated CRUD Lifecycle Product")
      expect(updated?.status).toBe("beta")

      // Verify persistence by refetching from the real database
      const refetched = await ProductRepository.findById(productId)
      expect(refetched?.name).toBe("Updated CRUD Lifecycle Product")
      expect(refetched?.status).toBe("beta")
    })

    it("4. DELETE (Remove) product from the real database", async () => {
      expect(createdProduct).not.toBeNull()
      const productId = createdProduct!.id

      const isDeleted = await ProductRepository.delete(productId)
      expect(isDeleted).toBe(true)

      // Verify it no longer exists in the real database
      const afterDelete = await ProductRepository.findById(productId)
      expect(afterDelete).toBeNull()

      // Set to null so afterAll does not need to clean it up again
      createdProduct = null
    })
  })
})
