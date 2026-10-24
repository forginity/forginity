import { eq, ilike, or, and, sql } from "drizzle-orm"
import { db } from "../index.js"
import {
  products,
  productFeatures,
  productMaintenance,
  productVersions,
  type Product,
  type NewProduct,
  type ProductFeature,
  type NewProductFeature,
  type ProductMaintenance,
  type NewProductMaintenance,
  type ProductVersion,
  type NewProductVersion,
} from "../db/products.schema.js"

export interface ListProductsFilter {
  status?: string
  search?: string
  limit?: number
  offset?: number
}

export class ProductRepository {
  // Products Repository Methods

  static async findMany(filter: ListProductsFilter) {
    const { status, search, limit = 20, offset = 0 } = filter

    const conditions = []
    if (status) {
      conditions.push(eq(products.status, status))
    }
    if (search) {
      conditions.push(
        or(
          ilike(products.name, `%${search}%`),
          ilike(products.slug, `%${search}%`)
        )
      )
    }

    const whereClause = conditions.length > 0 ? and(...conditions) : undefined

    const [items, totalResult] = await Promise.all([
      db
        .select()
        .from(products)
        .where(whereClause)
        .limit(limit)
        .offset(offset)
        .orderBy(products.createdAt),
      db
        .select({ count: sql<number>`count(*)::int` })
        .from(products)
        .where(whereClause),
    ])

    return {
      items,
      total: totalResult[0]?.count ?? 0,
    }
  }

  static async findById(id: string): Promise<Product | null> {
    const result = await db
      .select()
      .from(products)
      .where(eq(products.id, id))
      .limit(1)
    return result[0] || null
  }

  static async findBySlug(slug: string): Promise<Product | null> {
    const result = await db
      .select()
      .from(products)
      .where(eq(products.slug, slug))
      .limit(1)
    return result[0] || null
  }

  static async findByIdWithRelations(id: string) {
    const result = await db.query.products.findFirst({
      where: { id },
      with: {
        features: true,
        maintenance: true,
        versions: true,
      },
    })
    return result || null
  }

  static async findBySlugWithRelations(slug: string) {
    const result = await db.query.products.findFirst({
      where: { slug },
      with: {
        features: true,
        maintenance: true,
        versions: true,
      },
    })
    return result || null
  }

  static async create(data: NewProduct): Promise<Product> {
    const result = await db.insert(products).values(data).returning()
    return result[0]
  }

  static async update(id: string, data: Partial<NewProduct>): Promise<Product | null> {
    const result = await db
      .update(products)
      .set(data)
      .where(eq(products.id, id))
      .returning()
    return result[0] || null
  }

  static async delete(id: string): Promise<boolean> {
    const result = await db
      .delete(products)
      .where(eq(products.id, id))
      .returning({ id: products.id })
    return result.length > 0
  }

  // Product Features Repository Methods

  static async findFeaturesByProductId(productId: string): Promise<ProductFeature[]> {
    return db
      .select()
      .from(productFeatures)
      .where(eq(productFeatures.productId, productId))
  }

  static async createFeature(data: NewProductFeature): Promise<ProductFeature> {
    const result = await db.insert(productFeatures).values(data).returning()
    return result[0]
  }

  static async updateFeature(
    featureId: string,
    data: Partial<NewProductFeature>
  ): Promise<ProductFeature | null> {
    const result = await db
      .update(productFeatures)
      .set(data)
      .where(eq(productFeatures.id, featureId))
      .returning()
    return result[0] || null
  }

  static async deleteFeature(featureId: string): Promise<boolean> {
    const result = await db
      .delete(productFeatures)
      .where(eq(productFeatures.id, featureId))
      .returning({ id: productFeatures.id })
    return result.length > 0
  }

  // Product Maintenance Repository Methods

  static async findMaintenanceByProductId(
    productId: string
  ): Promise<ProductMaintenance[]> {
    return db
      .select()
      .from(productMaintenance)
      .where(eq(productMaintenance.productId, productId))
      .orderBy(productMaintenance.startsAt)
  }

  static async createMaintenance(
    data: NewProductMaintenance
  ): Promise<ProductMaintenance> {
    const result = await db.insert(productMaintenance).values(data).returning()
    return result[0]
  }

  static async updateMaintenance(
    maintenanceId: string,
    data: Partial<NewProductMaintenance>
  ): Promise<ProductMaintenance | null> {
    const result = await db
      .update(productMaintenance)
      .set(data)
      .where(eq(productMaintenance.id, maintenanceId))
      .returning()
    return result[0] || null
  }

  static async deleteMaintenance(maintenanceId: string): Promise<boolean> {
    const result = await db
      .delete(productMaintenance)
      .where(eq(productMaintenance.id, maintenanceId))
      .returning({ id: productMaintenance.id })
    return result.length > 0
  }

  // Product Versions Repository Methods

  static async findVersionsByProductId(productId: string): Promise<ProductVersion[]> {
    return db
      .select()
      .from(productVersions)
      .where(eq(productVersions.productId, productId))
  }

  static async createVersion(data: NewProductVersion): Promise<ProductVersion> {
    const result = await db.insert(productVersions).values(data).returning()
    return result[0]
  }

  static async updateVersion(
    versionId: string,
    data: Partial<NewProductVersion>
  ): Promise<ProductVersion | null> {
    const result = await db
      .update(productVersions)
      .set(data)
      .where(eq(productVersions.id, versionId))
      .returning()
    return result[0] || null
  }

  static async deleteVersion(versionId: string): Promise<boolean> {
    const result = await db
      .delete(productVersions)
      .where(eq(productVersions.id, versionId))
      .returning({ id: productVersions.id })
    return result.length > 0
  }
}
