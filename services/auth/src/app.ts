import "dotenv/config"
import express, {
  type Express,
  type Request,
  type Response,
  type NextFunction,
} from "express"
import cors from "cors"
import swaggerUi from "swagger-ui-express"
import { apiRouter } from "./routes/api.router.js"
import { healthRouter } from "./routes/health.route.js"
import { openApiDocument } from "./docs/openapi.js"

const app: Express = express()
const port = process.env.PORT ? parseInt(process.env.PORT, 10) : 3001

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
app.use(
  "/api/docs",
  swaggerUi.serve,
  swaggerUi.setup(openApiDocument, {
    swaggerOptions: {
      persistAuthorization: true,
    },
  })
)
app.get("/api/docs.json", (_req: Request, res: Response) => {
  res.setHeader("Content-Type", "application/json")
  res.json(openApiDocument)
})

// Application routes (prefixed with /api/auth)
app.use("/api/auth", apiRouter)

// Direct health check route alias
app.use("/api/health", healthRouter)

// Root fallback / ping
app.get("/", (_req: Request, res: Response) => {
  res.json({
    name: "auth-service",
    api: "/api/auth",
    health: "/api/auth/health",
    docs: "/api/docs",
    openapi: "/api/docs.json",
  })
})

// Centralized error handling
app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
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
  if (statusCode >= 500) {
    console.error("[auth] unhandled internal server error:", err)
  }

  res.status(statusCode).json({
    error: err.message || "Internal Server Error",
  })
})

// Start HTTP listener (in development, staging, or production)
// Automatically skips listening when imported inside Vitest test suites
if (!process.env.VITEST) {
  const server = app.listen(port, () => {
    console.log(`[auth] service listening on port ${port} (API prefix: /api/auth)`)
  })
  server.on("error", (err: NodeJS.ErrnoException) => {
    if (err.code === "EADDRINUSE") {
      console.error(
        `[auth] Error: Port ${port} is already in use by another process. Please free port ${port} (see docs/development/SERVICES.md).`
      )
    } else {
      console.error("[auth] server error:", err)
    }
  })
}

export default app
