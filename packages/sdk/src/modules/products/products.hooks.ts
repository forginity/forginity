import {
  useQuery,
  useMutation,
  useQueryClient,
  type UseQueryOptions,
  type UseMutationOptions,
} from "@tanstack/react-query"
import { ProductsService } from "./products.service"
import { productCacheKeys } from "./products.cache-keys"
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
import type { ApiError } from "../../core/api-error"

/**
 * React Query hook to list products with filtering and pagination.
 */
export function useProducts(
  params?: ListProductsParams,
  options?: Omit<
    UseQueryOptions<ListProductsResponse, ApiError, ListProductsResponse, ReturnType<typeof productCacheKeys.list>>,
    "queryKey" | "queryFn"
  >
) {
  return useQuery({
    queryKey: productCacheKeys.list(params),
    queryFn: () => ProductsService.list(params),
    ...options,
  })
}

/**
 * React Query hook to get a single product by UUID id with optional version history.
 */
export function useProduct(
  id: string,
  getOptions?: GetProductOptions,
  options?: Omit<
    UseQueryOptions<ProductWithRelations, ApiError, ProductWithRelations, ReturnType<typeof productCacheKeys.detail>>,
    "queryKey" | "queryFn"
  >
) {
  return useQuery({
    queryKey: productCacheKeys.detail(id, getOptions),
    queryFn: () => ProductsService.getById(id, getOptions),
    enabled: Boolean(id) && (options?.enabled ?? true),
    ...options,
  })
}

/**
 * React Query hook to get a single product by slug with optional version history.
 */
export function useProductBySlug(
  slug: string,
  getOptions?: GetProductOptions,
  options?: Omit<
    UseQueryOptions<ProductWithRelations, ApiError, ProductWithRelations, ReturnType<typeof productCacheKeys.bySlug>>,
    "queryKey" | "queryFn"
  >
) {
  return useQuery({
    queryKey: productCacheKeys.bySlug(slug, getOptions),
    queryFn: () => ProductsService.getBySlug(slug, getOptions),
    enabled: Boolean(slug) && (options?.enabled ?? true),
    ...options,
  })
}

/**
 * React Query mutation hook to create a product (with optional initialVersion).
 * Automatically invalidates product lists on success.
 */
export function useCreateProduct(
  options?: UseMutationOptions<ProductWithRelations, ApiError, CreateProductPayload>
) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (payload: CreateProductPayload) => ProductsService.create(payload),
    onSuccess: (...args) => {
      queryClient.invalidateQueries({ queryKey: productCacheKeys.lists() })
      options?.onSuccess?.(...args)
    },
    ...options,
  })
}

/**
 * React Query mutation hook to update a product (with optional newVersion).
 * Automatically invalidates product lists and product detail queries on success.
 */
export function useUpdateProduct(
  options?: UseMutationOptions<
    ProductWithRelations,
    ApiError,
    { id: string; payload: UpdateProductPayload }
  >
) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: UpdateProductPayload }) =>
      ProductsService.update(id, payload),
    onSuccess: (data, variables, ...rest) => {
      queryClient.invalidateQueries({ queryKey: productCacheKeys.lists() })
      queryClient.invalidateQueries({ queryKey: productCacheKeys.detail(variables.id) })
      queryClient.invalidateQueries({ queryKey: productCacheKeys.bySlug(data.slug) })
      options?.onSuccess?.(data, variables, ...rest)
    },
    ...options,
  })
}

/**
 * React Query mutation hook to delete a product.
 * Requires { confirmation: true } to prevent accidental deletion.
 * Automatically invalidates product lists on success.
 */
export function useDeleteProduct(
  options?: UseMutationOptions<
    { success: boolean },
    ApiError,
    { id: string; options?: DeleteProductOptions }
  >
) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, options: deleteOptions }: { id: string; options?: DeleteProductOptions }) =>
      ProductsService.delete(id, deleteOptions),
    onSuccess: (data, variables, ...rest) => {
      queryClient.invalidateQueries({ queryKey: productCacheKeys.lists() })
      queryClient.invalidateQueries({ queryKey: productCacheKeys.detail(variables.id) })
      options?.onSuccess?.(data, variables, ...rest)
    },
    ...options,
  })
}

/**
 * React Query hook to list versions for a product.
 */
export function useProductVersions(productId: string) {
  return useQuery({
    queryKey: productCacheKeys.versions(productId),
    queryFn: () => ProductsService.listVersions(productId),
    enabled: Boolean(productId),
  })
}

/**
 * React Query mutation hook to register a new version for a product.
 */
export function useCreateProductVersion(productId: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (payload: CreateProductVersionInput) =>
      ProductsService.createVersion(productId, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: productCacheKeys.versions(productId) })
      queryClient.invalidateQueries({ queryKey: productCacheKeys.detail(productId) })
    },
  })
}

/**
 * React Query mutation hook to update an existing version for a product.
 */
export function useUpdateProductVersion(productId: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({
      versionId,
      payload,
    }: {
      versionId: string
      payload: UpdateProductVersionInput
    }) => ProductsService.updateVersion(versionId, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: productCacheKeys.versions(productId) })
      queryClient.invalidateQueries({ queryKey: productCacheKeys.detail(productId) })
    },
  })
}

/**
 * React Query mutation hook to delete a product version.
 */
export function useDeleteProductVersion(productId: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (versionId: string) => ProductsService.deleteVersion(versionId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: productCacheKeys.versions(productId) })
      queryClient.invalidateQueries({ queryKey: productCacheKeys.detail(productId) })
    },
  })
}

/**
 * React Query hook to list maintenance windows for a product.
 */
export function useProductMaintenance(productId: string) {
  return useQuery({
    queryKey: productCacheKeys.maintenance(productId),
    queryFn: () => ProductsService.listMaintenance(productId),
    enabled: Boolean(productId),
  })
}

/**
 * React Query hook to list active platform maintenance windows.
 */
export function useActiveMaintenance() {
  return useQuery({
    queryKey: productCacheKeys.maintenance(),
    queryFn: () => ProductsService.listActiveMaintenance(),
  })
}

/**
 * React Query mutation hook to create a maintenance window.
 */
export function useCreateProductMaintenance(productId: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (payload: CreateProductMaintenanceInput) =>
      ProductsService.createMaintenance(productId, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: productCacheKeys.maintenance(productId) })
      queryClient.invalidateQueries({ queryKey: productCacheKeys.maintenance() })
      queryClient.invalidateQueries({ queryKey: productCacheKeys.detail(productId) })
    },
  })
}

/**
 * React Query mutation hook to update a maintenance window.
 */
export function useUpdateProductMaintenance(productId: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({
      maintenanceId,
      payload,
    }: {
      maintenanceId: string
      payload: UpdateProductMaintenanceInput
    }) => ProductsService.updateMaintenance(maintenanceId, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: productCacheKeys.maintenance(productId) })
      queryClient.invalidateQueries({ queryKey: productCacheKeys.maintenance() })
      queryClient.invalidateQueries({ queryKey: productCacheKeys.detail(productId) })
    },
  })
}

/**
 * React Query mutation hook to delete a maintenance window.
 */
export function useDeleteProductMaintenance(productId: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (maintenanceId: string) =>
      ProductsService.deleteMaintenance(maintenanceId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: productCacheKeys.maintenance(productId) })
      queryClient.invalidateQueries({ queryKey: productCacheKeys.maintenance() })
      queryClient.invalidateQueries({ queryKey: productCacheKeys.detail(productId) })
    },
  })
}
