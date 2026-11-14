export type ProductStatus = "active" | "beta" | "deprecated"
export type MaintenanceStatus = "scheduled" | "active" | "completed" | "cancelled"
export type VersionStatus = "latest" | "supported" | "deprecated"

export interface Product {
  id: string
  name: string
  slug: string
  status: ProductStatus
  createdAt: string
  updatedAt: string
}

export interface ProductVersion {
  id: string
  productId: string
  version: string
  status: VersionStatus
  changelog: string | null
  releaseDate: string | null
  createdAt: string
  updatedAt: string
}

export interface ProductMaintenance {
  id: string
  productId: string
  startsAt: string
  endsAt: string
  status: MaintenanceStatus
  message: string
  createdAt?: string
}

export interface ProductWithRelations extends Product {
  versions?: ProductVersion[]
  maintenance?: ProductMaintenance[]
}

export interface ListProductsParams {
  status?: ProductStatus
  search?: string
  limit?: number
  offset?: number
}

export interface PaginationMeta {
  total: number
  limit: number
  offset: number
  hasMore: boolean
}

export interface ListProductsResponse {
  items: Product[]
  pagination: PaginationMeta
}

export interface GetProductOptions {
  /**
   * Whether to include version history and relation entities in the response.
   * @default true
   */
  versionList?: boolean
}

export interface CreateProductVersionInput {
  version: string
  status?: VersionStatus
  changelog?: string
  releaseDate?: string
}

export interface CreateProductPayload {
  name: string
  slug: string
  status?: ProductStatus
  /**
   * Optional initial version to create alongside the product.
   */
  initialVersion?: CreateProductVersionInput
}

export interface UpdateProductPayload {
  name?: string
  slug?: string
  status?: ProductStatus
  /**
   * Optional new version to register upon updating the product.
   */
  newVersion?: CreateProductVersionInput
}

export interface DeleteProductOptions {
  /**
   * Explicit confirmation required to execute permanent product deletion.
   * @default false
   */
  confirmation?: boolean
}

export interface CreateProductMaintenanceInput {
  startsAt: string
  endsAt: string
  status?: MaintenanceStatus
  message: string
}

export interface UpdateProductMaintenanceInput {
  startsAt?: string
  endsAt?: string
  status?: MaintenanceStatus
  message?: string
}

export interface UpdateProductVersionInput {
  version?: string
  status?: VersionStatus
  changelog?: string
  releaseDate?: string
}
