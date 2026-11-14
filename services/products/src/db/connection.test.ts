import { describe, it, expect, vi } from "vitest"
import { checkDatabaseConnection } from "./connection.js"

describe("Database Connection Utility", () => {
  it("should return true when database ping succeeds", async () => {
    const mockDb = {
      execute: vi.fn().mockResolvedValueOnce([{ "?column?": 1 }]),
    }

    const isConnected = await checkDatabaseConnection(mockDb)
    expect(isConnected).toBe(true)
    expect(mockDb.execute).toHaveBeenCalledTimes(1)
  })

  it("should throw an explicit error when database connection fails", async () => {
    const mockDb = {
      execute: vi.fn().mockRejectedValueOnce(new Error("Connection refused at localhost:5432")),
    }

    await expect(checkDatabaseConnection(mockDb)).rejects.toThrow(
      "Database connection failed: Connection refused at localhost:5432"
    )
    expect(mockDb.execute).toHaveBeenCalledTimes(1)
  })

  it("should throw error if db instance is null or undefined", async () => {
    await expect(checkDatabaseConnection(null as any)).rejects.toThrow(
      "Database connection failed: Database client is not initialized"
    )
  })
})
