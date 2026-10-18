import express, { type Express } from "express"
import { apiRouter } from "./routes/index.js"

const app: Express = express()
const port = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000

// Standard middleware
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

// Prefix all application routes with /api
app.use("/api", apiRouter)

// Root fallback / ping
app.get("/", (_req, res) => {
  res.json({
    name: "products-service",
    api: "/api",
    health: "/api/health",
  })
})

app.listen(port, () => {
  console.log(`[products] service listening on port ${port} (API prefix: /api)`)
})

export default app
