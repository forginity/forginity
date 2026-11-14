import { Router, type Request, type Response } from "express"
import { checkDatabaseConnection } from "../db/connection.js"

export const healthRouter = Router()

healthRouter.get("/", async (_req: Request, res: Response) => {
  try {
    await checkDatabaseConnection()
    res.status(200).json({
      status: "ok",
      service: "products",
      database: "connected",
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
    })
  } catch (error: any) {
    res.status(503).json({
      status: "error",
      service: "products",
      database: "disconnected",
      error: error?.message || "Database connection failed",
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
    })
  }
})
