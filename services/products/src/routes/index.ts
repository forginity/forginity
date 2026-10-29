import { Router } from "express"
import { healthRouter } from "./health.route.js"
import { productsRouter } from "./products.route.js"

export const apiRouter = Router()

// Mount sub-routers under /api
apiRouter.use("/health", healthRouter)
apiRouter.use("/products", productsRouter)
