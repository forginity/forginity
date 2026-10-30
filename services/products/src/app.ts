import express, { type Express } from "express"
import swaggerUi from "swagger-ui-express"
import { apiRouter } from "./routes/api.router.js"
import { openApiDocument } from "./docs/openapi.js"

const app: Express = express()
const port = process.env.PORT ? parseInt(process.env.PORT, 10) : 4000

// Standard middleware
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

// OpenAPI / Swagger Documentation
app.use("/api/docs", swaggerUi.serve, swaggerUi.setup(openApiDocument))
app.get("/api/docs.json", (_req, res) => {
  res.setHeader("Content-Type", "application/json")
  res.json(openApiDocument)
})

// Prefix all application routes with /api
app.use("/api", apiRouter)

// Root fallback / ping
app.get("/", (_req, res) => {
  res.json({
    name: "products-service",
    api: "/api",
    health: "/api/health",
    docs: "/api/docs",
    openapi: "/api/docs.json",
  })
})

// Centralized error handling
app.use(
  (
    err: any,
    _req: express.Request,
    res: express.Response,
    _next: express.NextFunction
  ) => {
    // Handle malformed JSON body from body-parser (express.json)
    if (
      err.type === "entity.parse.failed" ||
      (err instanceof SyntaxError && "status" in err && (err as any).status === 400)
    ) {
      res.status(400).json({
        error: "Malformed JSON payload in request body",
      })
      return
    }

    const statusCode = err.status || err.statusCode || 500
    if (statusCode >= 500 && process.env.NODE_ENV !== "test") {
      console.error("[products] unhandled error:", err)
    }

    res.status(statusCode).json({
      error: err.message || "Internal Server Error",
    })
  }
)

if (process.env.NODE_ENV !== "test") {
  app.listen(port, () => {
    console.log(
      `[products] service listening on port ${port} (API docs: /api/docs)`
    )
  })
}

export default app
