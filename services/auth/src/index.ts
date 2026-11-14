import "dotenv/config"
import dotenv from "dotenv"
import path from "node:path"
import { fileURLToPath } from "node:url"
import { drizzle } from "drizzle-orm/node-postgres"
import { schemaRelations } from "./db/auth.schema.js"

const __dirname = path.dirname(fileURLToPath(import.meta.url))
dotenv.config({ path: path.resolve(__dirname, "../.env") })
dotenv.config({ path: path.resolve(process.cwd(), ".env") })

const connectionString =
  process.env.DATABASE_URL ||
  "postgresql://dummy:dummy@123@localhost:5432/auth_db"

export const db = drizzle(connectionString, { relations: schemaRelations })
