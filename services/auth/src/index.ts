import "dotenv/config"
import { drizzle } from "drizzle-orm/node-postgres"
import { schemaRelations } from "./db/auth.schema.js"

export const db = process.env.DATABASE_URL
  ? drizzle(process.env.DATABASE_URL, { relations: schemaRelations })
  : (null as unknown as ReturnType<typeof drizzle>)

export * from "./db/auth.schema.js"
export * from "./db/auth.validator.js"
