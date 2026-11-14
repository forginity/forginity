import "dotenv/config"
import { drizzle } from "drizzle-orm/node-postgres"
import { schemaRelations } from "./db/products.schema.js"

export const db = drizzle(process.env.DATABASE_URL!, {
  relations: schemaRelations,
})
