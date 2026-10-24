import { ProductRepository } from "../repositories/product.repository.js"
import type {
  Product,
  ProductFeature,
  ProductMaintenance,
  ProductVersion,
} from "../db/products.schema.js"
import type {
  CreateProductInput,
  UpdateProductInput,
  CreateProductFeatureInput,
  UpdateProductFeatureInput,
  CreateProductMaintenanceInput,
  UpdateProductMaintenanceInput,
  CreateProductVersionInput,
  UpdateProductVersionInput,
} from "../db/products.validator.js"

// Helper to determine if identifier is UUID
const UUID_REGEX =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

export class ProductService {
  /**
   * List products with search, status filtering, and pagination
   */
  static async listProducts(options: {
    status?: string
    search?: string
    limit?: number
    offset?: number
  }) {
    const { status, search, limit = 20, offset = 0 } = options
    const { items, total } = await ProductRepository.findMany({
      status,
      search,
      limit,
      offset,
    })

    return {
      items,
      pagination: {
        total,
        limit,
        offset,
        hasMore: offset + items.length < total,
      },
    }
  }

  /**
   * Get single product by UUID or slug, optionally including relations
   */
  static async getProductByIdOrSlug(
    identifier: string,
    includeRelations: boolean = false
  ) {
    const isUuid = UUID_REGEX.test(identifier)

    if (includeRelations) {
      return isUuid
        ? ProductRepository.findByIdWithRelations(identifier)
        : ProductRepository.findBySlugWithRelations(identifier)
    }

    return isUuid
      ? ProductRepository.findById(identifier)
      : ProductRepository.findBySlug(identifier)
  }

  /**
   * Create a new product with duplicate slug check
   */
  static async createProduct(input: CreateProductInput): Promise<Product> {
    const existing = await ProductRepository.findBySlug(input.slug)
    if (existing) {
      throw new Error(`Product with slug '${input.slug}' already exists`)
    }

    return ProductRepository.create({
      slug: input.slug,
      name: input.name,
      status: input.status,
    })
  }

  /**
   * Update product by UUID or slug with slug uniqueness check
   */
  static async updateProduct(
    identifier: string,
    input: UpdateProductInput
  ): Promise<Product | null> {
    const isUuid = UUID_REGEX.test(identifier)
    const product = isUuid
      ? await ProductRepository.findById(identifier)
      : await ProductRepository.findBySlug(identifier)

    if (!product) {
      return null
    }

    // Check if new slug conflicts with another product
    if (input.slug && input.slug !== product.slug) {
      const existing = await ProductRepository.findBySlug(input.slug)
      if (existing) {
        throw new Error(`Product with slug '${input.slug}' already exists`)
      }
    }

    return ProductRepository.update(product.id, input)
  }

  /**
   * Delete product by UUID or slug
   */
  static async deleteProduct(identifier: string): Promise<boolean> {
    const isUuid = UUID_REGEX.test(identifier)
    const product = isUuid
      ? await ProductRepository.findById(identifier)
      : await ProductRepository.findBySlug(identifier)

    if (!product) {
      return false
    }

    return ProductRepository.delete(product.id)
  }

  // Product Features Service Methods

  static async listFeatures(productId: string): Promise<ProductFeature[]> {
    return ProductRepository.findFeaturesByProductId(productId)
  }

  static async createFeature(
    productId: string,
    input: CreateProductFeatureInput
  ): Promise<ProductFeature> {
    const product = await ProductRepository.findById(productId)
    if (!product) {
      throw new Error(`Product with ID '${productId}' not found`)
    }

    return ProductRepository.createFeature({
      productId,
      key: input.key,
      name: input.name,
      status: input.status,
    })
  }

  static async updateFeature(
    featureId: string,
    input: UpdateProductFeatureInput
  ): Promise<ProductFeature | null> {
    return ProductRepository.updateFeature(featureId, input)
  }

  static async deleteFeature(featureId: string): Promise<boolean> {
    return ProductRepository.deleteFeature(featureId)
  }

  // Product Maintenance Service Methods

  static async listMaintenance(
    productId: string
  ): Promise<ProductMaintenance[]> {
    return ProductRepository.findMaintenanceByProductId(productId)
  }

  static async createMaintenance(
    productId: string,
    input: CreateProductMaintenanceInput
  ): Promise<ProductMaintenance> {
    const product = await ProductRepository.findById(productId)
    if (!product) {
      throw new Error(`Product with ID '${productId}' not found`)
    }

    return ProductRepository.createMaintenance({
      productId,
      startsAt: input.startsAt,
      endsAt: input.endsAt,
      status: input.status,
      message: input.message,
    })
  }

  static async updateMaintenance(
    maintenanceId: string,
    input: UpdateProductMaintenanceInput
  ): Promise<ProductMaintenance | null> {
    return ProductRepository.updateMaintenance(maintenanceId, input)
  }

  static async deleteMaintenance(maintenanceId: string): Promise<boolean> {
    return ProductRepository.deleteMaintenance(maintenanceId)
  }

  // Product Versions Service Methods

  static async listVersions(productId: string): Promise<ProductVersion[]> {
    return ProductRepository.findVersionsByProductId(productId)
  }

  static async createVersion(
    productId: string,
    input: CreateProductVersionInput
  ): Promise<ProductVersion> {
    const product = await ProductRepository.findById(productId)
    if (!product) {
      throw new Error(`Product with ID '${productId}' not found`)
    }

    return ProductRepository.createVersion({
      productId,
      version: input.version,
      status: input.status,
    })
  }

  static async updateVersion(
    versionId: string,
    input: UpdateProductVersionInput
  ): Promise<ProductVersion | null> {
    return ProductRepository.updateVersion(versionId, input)
  }

  static async deleteVersion(versionId: string): Promise<boolean> {
    return ProductRepository.deleteVersion(versionId)
  }
}
