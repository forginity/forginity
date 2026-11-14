import { defineRelations } from "drizzle-orm"
import {
  pgTable,
  uuid,
  varchar,
  text,
  timestamp,
  index,
} from "drizzle-orm/pg-core"

/**
 * Products Table
 */
export const products = pgTable("products", {
  id: uuid("id").primaryKey().defaultRandom(),
  slug: varchar("slug", { length: 100 }).notNull().unique(),
  name: varchar("name", { length: 255 }).notNull(),
  status: varchar("status", { length: 50 }).notNull().default("active"), // 'alpha', 'beta', 'active', 'deprecated'
  createdAt: timestamp("created_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
})

/**
 * Product Maintenance Table
 * Global and product-specific maintenance windows and announcements.
 * Reference: Section 2.C of docs/org/DB.md
 */
export const productMaintenance = pgTable(
  "product_maintenance",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    productId: uuid("product_id")
      .notNull()
      .references(() => products.id, { onDelete: "cascade" }),
    startsAt: timestamp("starts_at", { withTimezone: true }).notNull(),
    endsAt: timestamp("ends_at", { withTimezone: true }).notNull(),
    status: varchar("status", { length: 50 }).notNull().default("scheduled"), // 'scheduled', 'active', 'completed', 'cancelled'
    message: text("message").notNull(),
  },
  (table) => [
    index("product_maintenance_product_id_idx").on(table.productId),
    index("product_maintenance_status_idx").on(table.status),
  ]
)

/**
 * Product Versions Table
 * Version releases and active deployment tags.
 * Reference: Section 2.D of docs/org/DB.md
 */
export const productVersions = pgTable(
  "product_versions",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    productId: uuid("product_id")
      .notNull()
      .references(() => products.id, { onDelete: "cascade" }),
    version: varchar("version", { length: 50 }).notNull(),
    status: varchar("status", { length: 50 }).notNull().default("latest"), // 'latest', 'supported', 'deprecated'
  },
  (table) => [index("product_versions_product_id_idx").on(table.productId)]
)

/**
 * Schema Relations
 */
export const schemaRelations = defineRelations(
  {
    products,
    productMaintenance,
    productVersions,
  },
  (r) => ({
    products: {
      maintenance: r.many.productMaintenance({
        from: r.products.id,
        to: r.productMaintenance.productId,
      }),
      versions: r.many.productVersions({
        from: r.products.id,
        to: r.productVersions.productId,
      }),
    },
    productMaintenance: {
      product: r.one.products({
        from: r.productMaintenance.productId,
        to: r.products.id,
      }),
    },
    productVersions: {
      product: r.one.products({
        from: r.productVersions.productId,
        to: r.products.id,
      }),
    },
  })
)

// Inferred TypeScript Types
export type Product = typeof products.$inferSelect
export type NewProduct = typeof products.$inferInsert

export type ProductMaintenance = typeof productMaintenance.$inferSelect
export type NewProductMaintenance = typeof productMaintenance.$inferInsert

export type ProductVersion = typeof productVersions.$inferSelect
export type NewProductVersion = typeof productVersions.$inferInsert
