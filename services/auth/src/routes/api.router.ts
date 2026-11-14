import { Router } from "express"
import { healthRouter } from "./health.route.js"
import { otpRouter } from "./otp.route.js"
import { authRouter } from "./auth.route.js"
import { sessionRouter } from "./session.route.js"
import { onboardingRouter } from "./onboarding.route.js"
import { googleAuthRouter } from "./google-auth.route.js"
import { userRouter } from "./user.route.js"

export const apiRouter = Router()

// Mount sub-routers under /api/auth
apiRouter.use("/health", healthRouter)
apiRouter.use("/otp", otpRouter)
apiRouter.use("/email", authRouter)
apiRouter.use("/google", googleAuthRouter)
apiRouter.use("/session", sessionRouter)
apiRouter.use("/onboarding", onboardingRouter)
apiRouter.use("/users", userRouter)
