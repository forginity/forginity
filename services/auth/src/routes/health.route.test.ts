import { describe, it, expect, vi, beforeEach } from "vitest"
import request from "supertest"
import app from "../app.js"

describe("Auth Service Scaffolding & Health Endpoints", () => {
  beforeEach(() => {
    vi.restoreAllMocks()
  })

  describe("GET /api/auth/health", () => {
    it("should return 200 with service health info", async () => {
      const res = await request(app).get("/api/auth/health")
      expect(res.status).toBe(200)
      expect(res.body.status).toBe("ok")
      expect(res.body.service).toBe("auth")
      expect(res.body.timestamp).toBeDefined()
      expect(typeof res.body.uptime).toBe("number")
    })
  })

  describe("GET /api/health", () => {
    it("should return 200 with service health info via alias", async () => {
      const res = await request(app).get("/api/health")
      expect(res.status).toBe(200)
      expect(res.body.status).toBe("ok")
      expect(res.body.service).toBe("auth")
      expect(res.body.timestamp).toBeDefined()
      expect(typeof res.body.uptime).toBe("number")
    })
  })

  describe("GET /", () => {
    it("should return 200 with service root metadata", async () => {
      const res = await request(app).get("/")
      expect(res.status).toBe(200)
      expect(res.body.name).toBe("auth-service")
      expect(res.body.api).toBe("/api/auth")
      expect(res.body.health).toBe("/api/auth/health")
    })
  })

  describe("404 Route Handling", () => {
    it("should return 404 for unmatched /api/auth/unknown-endpoint", async () => {
      const res = await request(app).get("/api/auth/unknown-endpoint")
      expect(res.status).toBe(404)
    })

    it("should return 404 for unmatched /api/unknown-endpoint", async () => {
      const res = await request(app).get("/api/unknown-endpoint")
      expect(res.status).toBe(404)
    })
  })
})
