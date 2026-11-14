import { apiClient } from "../../core/http-client"
import { ApiError } from "../../core/api-error"
import { API_ENDPOINTS } from "../../constants/endpoints"
import type {
  ProductWithRelations,
  ProductVersion,
  ProductMaintenance,
  ListProductsParams,
  ListProductsResponse,
  GetProductOptions,
  CreateProductPayload,
  UpdateProductPayload,
  DeleteProductOptions,
  CreateProductVersionInput,
  UpdateProductVersionInput,
  CreateProductMaintenanceInput,
  UpdateProductMaintenanceInput,
} from "./products.types"

export const ProductsService = {
  /**
   * List products with optional search, status filtering, and pagination.
   */
  async list(params?: ListProductsParams): Promise<ListProductsResponse> {
    const { data } = await apiClient.get<ListProductsResponse>(
      API_ENDPOINTS.PRODUCTS.ROOT,
      { params }
    )
    return data
  },

  /**
   * Get a single product by UUID.
   * By default, includes version history (versionList: true).
   */
  async getById(
    id: string,
    options?: GetProductOptions
  ): Promise<ProductWithRelations> {
    const includeRelations = options?.versionList !== false
    const { data } = await apiClient.get<ProductWithRelations>(
      API_ENDPOINTS.PRODUCTS.BY_ID(id),
      {
        params: { includeRelations },
      }
    )
    return data
  },

  /**
   * Get a single product by its unique URL slug.
   * By default, includes version history (versionList: true).
   */
  async getBySlug(
    slug: string,
    options?: GetProductOptions
  ): Promise<ProductWithRelations> {
    const includeRelations = options?.versionList !== false
    const { data } = await apiClient.get<ProductWithRelations>(
      API_ENDPOINTS.PRODUCTS.BY_SLUG(slug),
      {
        params: { includeRelations },
      }
    )
    return data
  },

  /**
   * Create a new product. If initialVersion is provided, registers the initial version
   * atomically in sequence and returns the product with its initial version.
   */
  async create(payload: CreateProductPayload): Promise<ProductWithRelations> {
    const { initialVersion, ...productData } = payload

    const { data: createdProduct } = await apiClient.post<ProductWithRelations>(
      API_ENDPOINTS.PRODUCTS.ROOT,
      productData
    )

    if (initialVersion) {
      try {
        const { data: version } = await apiClient.post<ProductVersion>(
          API_ENDPOINTS.PRODUCTS.VERSIONS(createdProduct.id),
          initialVersion
        )
        return {
          ...createdProduct,
          versions: [version],
        }
      } catch (error) {
        // Return created product with empty versions if version creation fails
        return {
          ...createdProduct,
          versions: [],
        }
      }
    }

    return createdProduct
  },

  /**
   * Update a product by UUID. If newVersion is provided, registers the new version
   * and returns the refreshed product with relation history.
   */
  async update(
    id: string,
    payload: UpdateProductPayload
  ): Promise<ProductWithRelations> {
    const { newVersion, ...productData } = payload

    if (Object.keys(productData).length > 0) {
      await apiClient.patch(API_ENDPOINTS.PRODUCTS.BY_ID(id), productData)
    }

    if (newVersion) {
      await apiClient.post<ProductVersion>(
        API_ENDPOINTS.PRODUCTS.VERSIONS(id),
        newVersion
      )
    }

    return this.getById(id, { versionList: true })
  },

  /**
   * Delete a product permanently by UUID.
   * Requires explicit confirmation: true to prevent accidental data loss.
   */
  async delete(
    id: string,
    options?: DeleteProductOptions
  ): Promise<{ success: boolean }> {
    if (options?.confirmation !== true) {
      throw new ApiError({
        message:
          "Deletion confirmation required. Pass { confirmation: true } to confirm permanent deletion.",
        status: 400,
        code: "CONFIRMATION_REQUIRED",
      })
    }

    await apiClient.delete(API_ENDPOINTS.PRODUCTS.BY_ID(id))
    return { success: true }
  },

  // ==========================================
  // Version Sub-Resource Methods
  // ==========================================

  async listVersions(productId: string): Promise<{ items: ProductVersion[] }> {
    const { data } = await apiClient.get<{ items: ProductVersion[] }>(
      API_ENDPOINTS.PRODUCTS.VERSIONS(productId)
    )
    return data
  },

  async getVersionById(versionId: string): Promise<ProductVersion> {
    const { data } = await apiClient.get<ProductVersion>(
      API_ENDPOINTS.PRODUCTS.VERSION_BY_ID(versionId)
    )
    return data
  },

  async createVersion(
    productId: string,
    payload: CreateProductVersionInput
  ): Promise<ProductVersion> {
    const { data } = await apiClient.post<ProductVersion>(
      API_ENDPOINTS.PRODUCTS.VERSIONS(productId),
      payload
    )
    return data
  },

  async updateVersion(
    versionId: string,
    payload: UpdateProductVersionInput
  ): Promise<ProductVersion> {
    const { data } = await apiClient.patch<ProductVersion>(
      API_ENDPOINTS.PRODUCTS.VERSION_BY_ID(versionId),
      payload
    )
    return data
  },

  async deleteVersion(versionId: string): Promise<{ success: boolean }> {
    await apiClient.delete(API_ENDPOINTS.PRODUCTS.VERSION_BY_ID(versionId))
    return { success: true }
  },

  // ==========================================
  // Maintenance Sub-Resource Methods
  // ==========================================

  async listMaintenance(
    productId: string
  ): Promise<{ items: ProductMaintenance[] }> {
    const { data } = await apiClient.get<{ items: ProductMaintenance[] }>(
      API_ENDPOINTS.PRODUCTS.MAINTENANCE(productId)
    )
    return data
  },

  async listActiveMaintenance(): Promise<{ items: ProductMaintenance[] }> {
    const { data } = await apiClient.get<{ items: ProductMaintenance[] }>(
      API_ENDPOINTS.PRODUCTS.ACTIVE_MAINTENANCE()
    )
    return data
  },

  async createMaintenance(
    productId: string,
    payload: CreateProductMaintenanceInput
  ): Promise<ProductMaintenance> {
    const { data } = await apiClient.post<ProductMaintenance>(
      API_ENDPOINTS.PRODUCTS.MAINTENANCE(productId),
      payload
    )
    return data
  },

  async updateMaintenance(
    maintenanceId: string,
    payload: UpdateProductMaintenanceInput
  ): Promise<ProductMaintenance> {
    const { data } = await apiClient.patch<ProductMaintenance>(
      API_ENDPOINTS.PRODUCTS.MAINTENANCE_BY_ID(maintenanceId),
      payload
    )
    return data
  },

  async deleteMaintenance(maintenanceId: string): Promise<{ success: boolean }> {
    await apiClient.delete(API_ENDPOINTS.PRODUCTS.MAINTENANCE_BY_ID(maintenanceId))
    return { success: true }
  },
}
