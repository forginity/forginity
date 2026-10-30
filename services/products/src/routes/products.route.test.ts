import { describe, it, expect, vi, beforeEach } from "vitest"
import request from "supertest"
import app from "../app.js"
import { ProductService } from "../services/product.service.js"
import * as connectionModule from "../db/connection.js"

describe("Products API Endpoints", () => {
  beforeEach(() => {
    vi.restoreAllMocks()
  })

  describe("GET /api/health", () => {
    it("should return 200 with service health and database connected", async () => {
      vi.spyOn(connectionModule, "checkDatabaseConnection").mockResolvedValueOnce(true)
      const res = await request(app).get("/api/health")
      expect(res.status).toBe(200)
      expect(res.body.status).toBe("ok")
      expect(res.body.service).toBe("products")
      expect(res.body.database).toBe("connected")
    })

    it("should return 503 when database connectivity fails", async () => {
      vi.spyOn(connectionModule, "checkDatabaseConnection").mockRejectedValueOnce(
        new Error("Connection to database lost")
      )
      const res = await request(app).get("/api/health")
      expect(res.status).toBe(503)
      expect(res.body.status).toBe("error")
      expect(res.body.service).toBe("products")
      expect(res.body.database).toBe("disconnected")
      expect(res.body.error).toContain("Connection to database lost")
    })
  })

  describe("GET /api/products", () => {
    it("should return 200 with product list", async () => {
      vi.spyOn(ProductService, "listProducts").mockResolvedValueOnce({
        items: [
          {
            id: "11111111-1111-1111-1111-111111111111",
            slug: "trackride",
            name: "TrackRide",
            status: "active",
            createdAt: new Date(),
          },
        ],
        pagination: {
          total: 1,
          limit: 20,
          offset: 0,
          hasMore: false,
        },
      })

      const res = await request(app).get("/api/products")
      expect(res.status).toBe(200)
      expect(res.body.items).toHaveLength(1)
      expect(res.body.items[0].slug).toBe("trackride")
    })

    it("should return 400 when invalid query parameters are provided", async () => {
      const res = await request(app).get("/api/products?status=invalid_status")
      expect(res.status).toBe(400)
      expect(res.body.error).toBe("Validation Error")
      expect(res.body.issues).toBeDefined()
    })
  })

  describe("POST /api/products", () => {
    it("should return 201 on valid product creation", async () => {
      const payload = {
        slug: "brand-new-saas",
        name: "Brand New SaaS",
        status: "active",
      }

      vi.spyOn(ProductService, "createProduct").mockResolvedValueOnce({
        id: "22222222-2222-2222-2222-222222222222",
        ...payload,
        createdAt: new Date(),
      })

      const res = await request(app)
        .post("/api/products")
        .send(payload)

      expect(res.status).toBe(201)
      expect(res.body.slug).toBe("brand-new-saas")
    })

    it("should return 400 when validation fails for malformed slug", async () => {
      const res = await request(app)
        .post("/api/products")
        .send({
          slug: "INVALID SLUG WITH SPACES!",
          name: "Invalid Product",
        })

      expect(res.status).toBe(400)
      expect(res.body.error).toBe("Validation Error")
    })

    it("should return 409 when slug already exists", async () => {
      vi.spyOn(ProductService, "createProduct").mockRejectedValueOnce(
        new Error("Product with slug 'duplicate' already exists")
      )

      const res = await request(app)
        .post("/api/products")
        .send({
          slug: "duplicate",
          name: "Duplicate Product",
        })

      expect(res.status).toBe(409)
      expect(res.body.error).toContain("already exists")
    })
  })

  describe("GET /api/products/:id", () => {
    const validUuid = "11111111-1111-4111-a111-111111111111"

    it("should return 400 when id is not a valid UUID", async () => {
      const res = await request(app).get("/api/products/not-a-uuid")
      expect(res.status).toBe(400)
      expect(res.body.error).toBe("Validation Error")
    })

    it("should return 404 when product is not found", async () => {
      vi.spyOn(ProductService, "getProductById").mockResolvedValueOnce(null)

      const res = await request(app).get(`/api/products/${validUuid}`)
      expect(res.status).toBe(404)
      expect(res.body.error).toContain("not found")
    })

    it("should return 200 with product details when found", async () => {
      vi.spyOn(ProductService, "getProductById").mockResolvedValueOnce({
        id: validUuid,
        slug: "project-1",
        name: "project_1",
        status: "active",
        createdAt: new Date(),
      })

      const res = await request(app).get(`/api/products/${validUuid}`)
      expect(res.status).toBe(200)
      expect(res.body.id).toBe(validUuid)
      expect(res.body.slug).toBe("project-1")
    })
  })

  describe("GET /api/products/slug/:slug", () => {
    it("should return 200 when product is found by slug", async () => {
      vi.spyOn(ProductService, "getProductBySlug").mockResolvedValueOnce({
        id: "11111111-1111-1111-1111-111111111111",
        slug: "project-1",
        name: "project_1",
        status: "active",
        createdAt: new Date(),
      })

      const res = await request(app).get("/api/products/slug/project-1")
      expect(res.status).toBe(200)
      expect(res.body.slug).toBe("project-1")
    })

    it("should return 404 when product slug is not found", async () => {
      vi.spyOn(ProductService, "getProductBySlug").mockResolvedValueOnce(null)

      const res = await request(app).get("/api/products/slug/nonexistent-slug")
      expect(res.status).toBe(404)
      expect(res.body.error).toContain("not found")
    })
  })

  describe("PATCH /api/products/:id", () => {
    const validUuid = "11111111-1111-4111-a111-111111111111"

    it("should return 200 with updated product on valid update", async () => {
      vi.spyOn(ProductService, "updateProduct").mockResolvedValueOnce({
        id: validUuid,
        slug: "project-1",
        name: "Updated Project 1",
        status: "active",
        createdAt: new Date(),
      })

      const res = await request(app)
        .patch(`/api/products/${validUuid}`)
        .send({ name: "Updated Project 1" })

      expect(res.status).toBe(200)
      expect(res.body.name).toBe("Updated Project 1")
    })

    it("should return 404 if product to update does not exist", async () => {
      vi.spyOn(ProductService, "updateProduct").mockResolvedValueOnce(null)

      const res = await request(app)
        .patch(`/api/products/${validUuid}`)
        .send({ name: "New Name" })

      expect(res.status).toBe(404)
    })
  })

  describe("DELETE /api/products/:id", () => {
    const validUuid = "11111111-1111-4111-a111-111111111111"

    it("should return 204 when product is successfully deleted", async () => {
      vi.spyOn(ProductService, "deleteProduct").mockResolvedValueOnce(true)

      const res = await request(app).delete(`/api/products/${validUuid}`)
      expect(res.status).toBe(204)
    })

    it("should return 404 when product to delete is not found", async () => {
      vi.spyOn(ProductService, "deleteProduct").mockResolvedValueOnce(false)

      const res = await request(app).delete(`/api/products/${validUuid}`)
      expect(res.status).toBe(404)
    })
  })

  describe("Database Connectivity Guard in CRUD Endpoints", () => {
    it("should return 500 when database connectivity failure triggers unhandled error", async () => {
      vi.spyOn(ProductService, "listProducts").mockRejectedValueOnce(
        new Error("Database connection failed: Connection terminated unexpectedly")
      )

      const res = await request(app).get("/api/products")
      expect(res.status).toBe(500)
      expect(res.body.error).toContain("Database connection failed")
    })
  })
})
