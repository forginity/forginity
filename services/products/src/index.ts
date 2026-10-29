import "dotenv/config"
import { drizzle } from "drizzle-orm/node-postgres"
import { schemaRelations } from "./db/products.schema.js"

export const db = drizzle(process.env.DATABASE_URL!, {
  relations: schemaRelations,
})

export * from "./db/products.schema.js"
export * from "./db/products.validator.js"
export * from "./repositories/product.repository.js"
export * from "./services/product.service.js"
