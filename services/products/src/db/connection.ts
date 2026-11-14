import { sql } from "drizzle-orm"
import { db } from "../index.js"

/**
 * Validates database connectivity by executing a ping query (SELECT 1).
 * Throws an explicit error if the database connection fails or cannot be established.
 *
 * @param targetDb Drizzle database instance (defaults to exported db)
 * @returns Promise<boolean> resolves true if connection is healthy
 * @throws Error if connection is unreachable or query rejects
 */
export async function checkDatabaseConnection(targetDb: any = db): Promise<boolean> {
  if (!targetDb) {
    throw new Error("Database connection failed: Database client is not initialized")
  }

  try {
    await targetDb.execute(sql`SELECT 1`)
    return true
  } catch (error: any) {
    const reason = error?.message || "Unknown database connectivity failure"
    throw new Error(`Database connection failed: ${reason}`)
  }
}
