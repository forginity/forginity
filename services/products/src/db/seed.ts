import "dotenv/config"
import { eq } from "drizzle-orm"
import { db } from "../index.js"
import { products, type NewProduct } from "./products.schema.js"
import { checkDatabaseConnection } from "./connection.js"

export const SEED_PRODUCTS: NewProduct[] = [
  {
    slug: "project-1",
    name: "project_1",
    status: "active",
  },
  {
    slug: "project-2",
    name: "project_2",
    status: "active",
  },
]

/**
 * Seeds initial foundational products into the database.
 * Validates database connectivity before running operations and throws if not connected.
 *
 * @param targetDb Drizzle database instance (defaults to exported db)
 * @returns Array of seeded products
 */
export async function seedProducts(targetDb: any = db) {
  // 1. Mandatory database connectivity health check
  await checkDatabaseConnection(targetDb)

  const seeded = []

  for (const item of SEED_PRODUCTS) {
    const existing = await targetDb
      .select()
      .from(products)
      .where(eq(products.slug, item.slug))
      .limit(1)

    if (existing.length > 0) {
      const updateResult = await targetDb
        .update(products)
        .set({
          name: item.name,
          status: item.status,
        })
        .where(eq(products.slug, item.slug))
        .returning()

      const updated = updateResult?.[0]
      if (updated) {
        seeded.push(updated)
      }
      console.log(`[seed] Updated existing product '${item.slug}'`)
    } else {
      const insertResult = await targetDb
        .insert(products)
        .values(item)
        .returning()

      const created = insertResult?.[0]
      if (created) {
        seeded.push(created)
      }
      console.log(`[seed] Created new product '${item.slug}'`)
    }
  }

  return seeded
}

// Auto-run if executed directly as a script
const isDirectExecution =
  process.argv[1] &&
  (process.argv[1].endsWith("seed.ts") || process.argv[1].endsWith("seed.js"))

if (isDirectExecution) {
  seedProducts()
    .then((results) => {
      console.log(`[seed] Successfully seeded ${results.length} products.`)
      process.exit(0)
    })
    .catch((error) => {
      console.error("[seed] Seeding failed:", error.message)
      process.exit(1)
    })
}
