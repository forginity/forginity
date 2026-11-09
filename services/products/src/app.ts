import express, { type Express } from "express"
import cors from "cors"
import swaggerUi from "swagger-ui-express"
import { apiRouter } from "./routes/api.router.js"
import { openApiDocument } from "./docs/openapi.js"

const app: Express = express()
const port = process.env.PORT ? parseInt(process.env.PORT, 10) : 3002

// Standard middleware
app.use(
  cors({
    origin: process.env.CORS_ORIGIN ? process.env.CORS_ORIGIN.split(",") : true,
    credentials: true,
  })
)
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
      (err instanceof SyntaxError &&
        "status" in err &&
        (err as any).status === 400)
    ) {
      res.status(400).json({
        error: "Malformed JSON payload in request body",
      })
      return
    }

    const statusCode = err.status || err.statusCode || 500
    if (statusCode >= 500 && !process.env.VITEST) {
      console.error("[products] unhandled error:", err)
    }

    res.status(statusCode).json({
      error: err.message || "Internal Server Error",
    })
  }
)

if (!process.env.VITEST) {
  const server = app.listen(port, () => {
    console.log(
      `[products] service listening on port ${port} (API docs: /api/docs)`
    )
  })
  server.on("error", (err: NodeJS.ErrnoException) => {
    if (err.code === "EADDRINUSE") {
      console.error(
        `[products] Error: Port ${port} is already in use by another process. Please free port ${port} (see docs/development/SERVICES.md).`
      )
    } else {
      console.error("[products] server error:", err)
    }
  })
}

export default app
