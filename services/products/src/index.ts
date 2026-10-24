import "dotenv/config"
import { drizzle } from "drizzle-orm/node-postgres"
import { schemaRelations } from "./db/schema.js"

export const db = drizzle(process.env.DATABASE_URL!, {
  relations: schemaRelations,
})

export * from "./db/schema.js"
