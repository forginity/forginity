import { describe, it, expect } from "vitest"
import request from "supertest"
import app from "../app.js"

describe("Auth OpenAPI / Swagger Integration", () => {
  it("should serve Swagger UI HTML", async () => {
    const res = await request(app).get("/api/docs/")
    expect(res.status).toBe(200)
    expect(res.text).toContain("swagger-ui")
  })

  it("should return valid OpenAPI spec with securitySchemes and onboarding path", async () => {
    const res = await request(app).get("/api/docs.json")
    expect(res.status).toBe(200)
    expect(res.body.components.securitySchemes).toHaveProperty("BearerAuth")
    expect(res.body.paths["/api/auth/onboarding"].post.security).toEqual([{ BearerAuth: [] }])
    expect(res.body.paths["/api/auth/google"].post).toBeDefined()
    expect(res.body.paths["/api/users/me"].get).toBeDefined()
    expect(res.body.paths["/api/users/me"].put).toBeDefined()
    expect(res.body.paths["/api/users/me"].delete).toBeDefined()
    expect(res.body.paths["/api/users/me/emergency-contacts"].get).toBeDefined()
    expect(res.body.paths["/api/users/me/emergency-contacts"].post).toBeDefined()
    expect(res.body.paths["/api/users/{userId}/restore"].post).toBeDefined()
    expect(res.body.paths["/api/users"].get).toBeDefined()
    expect(res.body.paths["/api/users/{userId}"].get).toBeDefined()
    expect(res.body.paths["/api/users/{userId}/status"].patch).toBeDefined()
  })
})
