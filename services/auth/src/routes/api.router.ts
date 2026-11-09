import { Router } from "express"
import { healthRouter } from "./health.route.js"
import { otpRouter } from "./otp.route.js"

export const apiRouter = Router()

// Mount sub-routers under /api/auth
apiRouter.use("/health", healthRouter)
apiRouter.use("/otp", otpRouter)
