import { describe, it, expect } from "vitest"
import request from "supertest"
import app from "../app.js"
import { openApiDocument } from "./openapi.js"

describe("OpenAPI / Swagger Integration", () => {
  describe("GET /api/docs", () => {
    it("should serve Swagger UI HTML documentation page or redirect", async () => {
      const res = await request(app).get("/api/docs")
      expect([200, 301]).toContain(res.status)
      if (res.status === 200) {
        expect(res.headers["content-type"]).toMatch(/html/)
      }
    })

    it("should serve Swagger UI HTML when trailing slash is supplied", async () => {
      const res = await request(app).get("/api/docs/")
      expect(res.status).toBe(200)
      expect(res.headers["content-type"]).toMatch(/html/)
      expect(res.text).toContain("swagger-ui")
    })
  })

  describe("GET /api/docs.json", () => {
    it("should return 200 with valid OpenAPI 3.0 specification", async () => {
      const res = await request(app).get("/api/docs.json")
      expect(res.status).toBe(200)
      expect(res.headers["content-type"]).toMatch(/json/)
      expect(res.body.openapi).toBe("3.0.0")
      expect(res.body.info.title).toBe("Forginity Products Service API")
      expect(res.body.info.version).toBe("1.0.0")
    })

    it("should contain all expected component schemas", async () => {
      const res = await request(app).get("/api/docs.json")
      const schemas = res.body.components.schemas
      expect(schemas).toHaveProperty("Product")
      expect(schemas).toHaveProperty("CreateProductInput")
      expect(schemas).toHaveProperty("UpdateProductInput")
      expect(schemas).toHaveProperty("ProductMaintenance")
      expect(schemas).toHaveProperty("CreateProductMaintenanceInput")
      expect(schemas).toHaveProperty("UpdateProductMaintenanceInput")
      expect(schemas).toHaveProperty("ProductVersion")
      expect(schemas).toHaveProperty("CreateProductVersionInput")
      expect(schemas).toHaveProperty("UpdateProductVersionInput")
      expect(schemas).toHaveProperty("HealthResponse")
      expect(schemas).toHaveProperty("ErrorResponse")
    })

    it("should contain all route paths and operations", async () => {
      const res = await request(app).get("/api/docs.json")
      const paths = res.body.paths

      expect(paths).toHaveProperty("/api/health")
      expect(paths["/api/health"]).toHaveProperty("get")

      expect(paths).toHaveProperty("/api/products")
      expect(paths["/api/products"]).toHaveProperty("get")
      expect(paths["/api/products"]).toHaveProperty("post")

      expect(paths).toHaveProperty("/api/products/{id}")
      expect(paths["/api/products/{id}"]).toHaveProperty("get")
      expect(paths["/api/products/{id}"]).toHaveProperty("patch")
      expect(paths["/api/products/{id}"]).toHaveProperty("delete")

      expect(paths).toHaveProperty("/api/products/slug/{slug}")
      expect(paths["/api/products/slug/{slug}"]).toHaveProperty("get")

      expect(paths).toHaveProperty("/api/products/{id}/maintenance")
      expect(paths["/api/products/{id}/maintenance"]).toHaveProperty("get")
      expect(paths["/api/products/{id}/maintenance"]).toHaveProperty("post")

      expect(paths).toHaveProperty("/api/products/maintenance/active")
      expect(paths["/api/products/maintenance/active"]).toHaveProperty("get")

      expect(paths).toHaveProperty("/api/products/maintenance/{id}")
      expect(paths["/api/products/maintenance/{id}"]).toHaveProperty("get")
      expect(paths["/api/products/maintenance/{id}"]).toHaveProperty("patch")
      expect(paths["/api/products/maintenance/{id}"]).toHaveProperty("delete")

      expect(paths).toHaveProperty("/api/products/{id}/versions")
      expect(paths["/api/products/{id}/versions"]).toHaveProperty("get")
      expect(paths["/api/products/{id}/versions"]).toHaveProperty("post")

      expect(paths).toHaveProperty("/api/products/versions/{id}")
      expect(paths["/api/products/versions/{id}"]).toHaveProperty("get")
      expect(paths["/api/products/versions/{id}"]).toHaveProperty("patch")
      expect(paths["/api/products/versions/{id}"]).toHaveProperty("delete")
    })
  })

  describe("In-Memory Document Export", () => {
    it("should match generated openApiDocument directly", () => {
      expect(openApiDocument.openapi).toBe("3.0.0")
      expect(openApiDocument.info.title).toBe("Forginity Products Service API")
      expect(Object.keys(openApiDocument.paths)).toHaveLength(9)
    })
  })
})
