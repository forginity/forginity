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
import { userRouter } from "./routes/user.route.js"
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

// Request / Response logging middleware (skipped during automated test suites)
if (!process.env.VITEST && process.env.NODE_ENV !== "test") {
  app.use((req: Request, res: Response, next: NextFunction) => {
    const start = Date.now()
    const { method, originalUrl, ip } = req
    const timestamp = new Date().toLocaleTimeString()

    console.log(`[auth] [${timestamp}] --> ${method} ${originalUrl} (from ${ip || "unknown"})`)

    if (req.body && typeof req.body === "object" && Object.keys(req.body).length > 0) {
      const safeBody = { ...req.body }
      if (safeBody.code) safeBody.code = "******"
      if (safeBody.accessToken) safeBody.accessToken = "[REDACTED]"
      if (safeBody.refreshToken) safeBody.refreshToken = "[REDACTED]"
      if (safeBody.idToken) safeBody.idToken = "[REDACTED]"
      console.log(`[auth] [${timestamp}]     Payload:`, JSON.stringify(safeBody))
    }

    res.on("finish", () => {
      const duration = Date.now() - start
      const status = res.statusCode
      const indicator = status >= 500 ? "ERR" : status >= 400 ? "WARN" : "OK"
      console.log(
        `[auth] [${new Date().toLocaleTimeString()}] <-- [${indicator}] ${method} ${originalUrl} ${status} (${duration}ms)`
      )
    })

    next()
  })
}

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

// Direct user profile & emergency contacts route alias
app.use("/api/users", userRouter)

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
