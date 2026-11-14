import { ProductRepository } from "../repositories/product.repository.js"
import type {
  Product,
  ProductMaintenance,
  ProductVersion,
} from "../db/products.schema.js"
import type {
  CreateProductInput,
  UpdateProductInput,
  CreateProductMaintenanceInput,
  UpdateProductMaintenanceInput,
  CreateProductVersionInput,
  UpdateProductVersionInput,
} from "../db/products.validator.js"

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
   * Get single product by UUID id, optionally including maintenance and version relations
   */
  static async getProductById(id: string, includeRelations: boolean = false) {
    if (includeRelations) {
      return ProductRepository.findByIdWithRelations(id)
    }
    return ProductRepository.findById(id)
  }

  /**
   * Get single product by slug, optionally including maintenance and version relations
   */
  static async getProductBySlug(slug: string, includeRelations: boolean = false) {
    if (includeRelations) {
      return ProductRepository.findBySlugWithRelations(slug)
    }
    return ProductRepository.findBySlug(slug)
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
   * Update product by UUID id with slug uniqueness check
   */
  static async updateProduct(
    id: string,
    input: UpdateProductInput
  ): Promise<Product | null> {
    const product = await ProductRepository.findById(id)

    if (!product) {
      return null
    }

    // Check if new slug conflicts with another product
    if (input.slug && input.slug !== product.slug) {
      const existing = await ProductRepository.findBySlug(input.slug)
      if (existing && existing.id !== id) {
        throw new Error(`Product with slug '${input.slug}' already exists`)
      }
    }

    return ProductRepository.update(id, input)
  }

  /**
   * Delete product by UUID id
   */
  static async deleteProduct(id: string): Promise<boolean> {
    return ProductRepository.delete(id)
  }

  // Product Maintenance Service Methods

  static async getMaintenanceById(
    maintenanceId: string
  ): Promise<ProductMaintenance | null> {
    return ProductRepository.findMaintenanceById(maintenanceId)
  }

  static async listActiveMaintenance(): Promise<ProductMaintenance[]> {
    return ProductRepository.findActiveMaintenance()
  }

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

  static async getVersionById(
    versionId: string
  ): Promise<ProductVersion | null> {
    return ProductRepository.findVersionById(versionId)
  }

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
