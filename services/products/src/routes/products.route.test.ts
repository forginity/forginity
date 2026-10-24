import { describe, it, expect, vi, beforeEach } from "vitest"
import request from "supertest"
import app from "../app.js"
import { ProductService } from "../services/product.service.js"

describe("Products API Endpoints", () => {
  beforeEach(() => {
    vi.restoreAllMocks()
  })

  describe("GET /api/health", () => {
    it("should return 200 with service health info", async () => {
      const res = await request(app).get("/api/health")
      expect(res.status).toBe(200)
      expect(res.body.status).toBe("ok")
      expect(res.body.service).toBe("products")
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

  describe("GET /api/products/:identifier", () => {
    it("should return 404 when product is not found", async () => {
      vi.spyOn(ProductService, "getProductByIdOrSlug").mockResolvedValueOnce(null)

      const res = await request(app).get("/api/products/missing-slug")
      expect(res.status).toBe(404)
      expect(res.body.error).toContain("not found")
    })
  })
})
