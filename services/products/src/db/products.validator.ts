import { z } from "zod"
import {
  PRODUCT_STATUSES,
  MAINTENANCE_STATUSES,
  VERSION_STATUSES,
  type ProductStatus,
  type MaintenanceStatus,
  type VersionStatus,
} from "../constants/products.constants.js"

export {
  PRODUCT_STATUSES,
  MAINTENANCE_STATUSES,
  VERSION_STATUSES,
  type ProductStatus,
  type MaintenanceStatus,
  type VersionStatus,
}

/**
 * Status Enums derived from domain constants
 */
export const ProductStatusEnum = z.enum(PRODUCT_STATUSES)
export const MaintenanceStatusEnum = z.enum(MAINTENANCE_STATUSES)
export const VersionStatusEnum = z.enum(VERSION_STATUSES)

/**
 * Common Params & Query Validation
 */
export const IdParamSchema = z.object({
  id: z.string().uuid("Invalid UUID format"),
})

// Alias for explicit UUID naming
export const UuidParamSchema = IdParamSchema

export const SlugParamSchema = z.object({
  slug: z
    .string()
    .min(2, "Slug must be at least 2 characters")
    .max(100, "Slug cannot exceed 100 characters")
    .regex(
      /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
      "Slug must be lowercase alphanumeric with hyphens"
    ),
})

export const ListProductsQuerySchema = z.object({
  status: ProductStatusEnum.optional(),
  search: z.string().optional(),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  offset: z.coerce.number().int().min(0).default(0),
})

/**
 * Product Schemas
 */
export const ProductSchema = z.object({
  id: z.string().uuid(),
  slug: z
    .string()
    .min(2, "Slug must be at least 2 characters")
    .max(100, "Slug cannot exceed 100 characters")
    .regex(
      /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
      "Slug must be lowercase alphanumeric with hyphens"
    ),
  name: z.string().min(1, "Name is required").max(255),
  status: ProductStatusEnum.default("active"),
  createdAt: z.date(),
})

export const CreateProductSchema = z.object({
  slug: z
    .string()
    .min(2, "Slug must be at least 2 characters")
    .max(100, "Slug cannot exceed 100 characters")
    .regex(
      /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
      "Slug must be lowercase alphanumeric with hyphens"
    ),
  name: z.string().min(1, "Name is required").max(255),
  status: ProductStatusEnum.default("active"),
})

export const UpdateProductSchema = CreateProductSchema.partial()

export type CreateProductInput = z.infer<typeof CreateProductSchema>
export type UpdateProductInput = z.infer<typeof UpdateProductSchema>

/**
 * Product Maintenance Schemas
 */
export const CreateProductMaintenanceSchema = z
  .object({
    startsAt: z.coerce.date(),
    endsAt: z.coerce.date(),
    status: MaintenanceStatusEnum.default("scheduled"),
    message: z.string().min(1, "Maintenance message is required"),
  })
  .refine((data) => data.endsAt > data.startsAt, {
    message: "endsAt must be after startsAt",
    path: ["endsAt"],
  })

export const UpdateProductMaintenanceSchema = z.object({
  startsAt: z.coerce.date().optional(),
  endsAt: z.coerce.date().optional(),
  status: MaintenanceStatusEnum.optional(),
  message: z.string().min(1).optional(),
})

export type CreateProductMaintenanceInput = z.infer<
  typeof CreateProductMaintenanceSchema
>
export type UpdateProductMaintenanceInput = z.infer<
  typeof UpdateProductMaintenanceSchema
>

/**
 * Product Version Schemas
 */
export const CreateProductVersionSchema = z.object({
  version: z
    .string()
    .min(1, "Version is required")
    .max(50)
    .regex(
      /^v?[0-9]+(\.[0-9]+)*(-[a-zA-Z0-9.]+)?$/,
      "Version must follow semver format (e.g. v1.0.0 or 1.0.0)"
    ),
  status: VersionStatusEnum.default("latest"),
})

export const UpdateProductVersionSchema = CreateProductVersionSchema.partial()

export type CreateProductVersionInput = z.infer<
  typeof CreateProductVersionSchema
>
export type UpdateProductVersionInput = z.infer<
  typeof UpdateProductVersionSchema
>
