import { Router } from "express"
import { healthRouter } from "./health.js"

export const apiRouter = Router()

// Mount sub-routers under /api
apiRouter.use("/health", healthRouter)
