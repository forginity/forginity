import express, {
  type Express,
  type Request,
  type Response,
  type NextFunction,
} from "express"
import { apiRouter } from "./routes/index.js"
import { healthRouter } from "./routes/health.route.js"

const app: Express = express()
const port = process.env.PORT ? parseInt(process.env.PORT, 10) : 3001

// Standard middleware
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

// Prefix all application routes with /api/auth
app.use("/api/auth", apiRouter)

// Direct health check route alias
app.use("/api/health", healthRouter)

// Root fallback / ping
app.get("/", (_req: Request, res: Response) => {
  res.json({
    name: "auth-service",
    api: "/api/auth",
    health: "/api/auth/health",
  })
})

// Centralized error handling
app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
  console.error("[auth] unhandled error:", err)
  res.status(err.status || 500).json({
    error: err.message || "Internal Server Error",
  })
})

if (process.env.NODE_ENV !== "test") {
  app.listen(port, () => {
    console.log(`[auth] service listening on port ${port} (API prefix: /api/auth)`)
  })
}

export default app
