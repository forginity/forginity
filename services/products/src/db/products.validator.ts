import { z } from "zod"
import { extendZodWithOpenApi } from "@asteasolutions/zod-to-openapi"
import {
  PRODUCT_STATUSES,
  MAINTENANCE_STATUSES,
  VERSION_STATUSES,
  type ProductStatus,
  type MaintenanceStatus,
  type VersionStatus,
} from "../constants/products.constants.js"

extendZodWithOpenApi(z)

export {
  PRODUCT_STATUSES,
  MAINTENANCE_STATUSES,
  VERSION_STATUSES,
  type ProductStatus,
  type MaintenanceStatus,
  type VersionStatus,
}

export const ProductStatusEnum = z
  .enum(PRODUCT_STATUSES)
  .openapi({
    description: "Product lifecycle status",
    example: "active",
  })

export const MaintenanceStatusEnum = z
  .enum(MAINTENANCE_STATUSES)
  .openapi({
    description: "Maintenance schedule status",
    example: "scheduled",
  })

export const VersionStatusEnum = z
  .enum(VERSION_STATUSES)
  .openapi({
    description: "Product release version status",
    example: "latest",
  })

export const IdParamSchema = z
  .object({
    id: z
      .string()
      .uuid("Invalid UUID format")
      .openapi({
        description: "Resource UUID identifier",
        example: "11111111-1111-1111-1111-111111111111",
      }),
  })
  .openapi("IdParam", {
    description: "Standard UUID resource identifier parameter",
  })

export const ProductIdParamSchema = z
  .object({
    id: z
      .string()
      .uuid("Invalid UUID format")
      .openapi({
        description: "Product UUID identifier",
        example: "11111111-1111-1111-1111-111111111111",
      }),
  })
  .openapi("ProductIdParam", {
    description: "Product UUID identifier parameter",
  })

export const MaintenanceIdParamSchema = z
  .object({
    id: z
      .string()
      .uuid("Invalid UUID format")
      .openapi({
        description: "Maintenance window UUID identifier",
        example: "77777777-7777-4777-a777-777777777777",
      }),
  })
  .openapi("MaintenanceIdParam", {
    description: "Maintenance schedule UUID identifier parameter",
  })

export const VersionIdParamSchema = z
  .object({
    id: z
      .string()
      .uuid("Invalid UUID format")
      .openapi({
        description: "Product version UUID identifier",
        example: "88888888-8888-8888-8888-888888888888",
      }),
  })
  .openapi("VersionIdParam", {
    description: "Product version UUID identifier parameter",
  })

export const UuidParamSchema = IdParamSchema

export const SlugParamSchema = z
  .object({
    slug: z
      .string()
      .min(2, "Slug must be at least 2 characters")
      .max(100, "Slug cannot exceed 100 characters")
      .regex(
        /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
        "Slug must be lowercase alphanumeric with hyphens"
      )
      .openapi({
        description: "Unique URL slug identifier",
        example: "trackride",
      }),
  })
  .openapi("SlugParam", {
    description: "Product URL slug parameter",
  })

export const ListProductsQuerySchema = z
  .object({
    status: ProductStatusEnum.optional().openapi({
      description: "Filter products by status",
      example: "active",
    }),
    search: z
      .string()
      .optional()
      .openapi({
        description: "Case-insensitive search query matching name or slug",
        example: "track",
      }),
    limit: z.coerce
      .number()
      .int()
      .min(1)
      .max(100)
      .default(20)
      .openapi({
        description: "Maximum records to return",
        example: 20,
      }),
    offset: z.coerce
      .number()
      .int()
      .min(0)
      .default(0)
      .openapi({
        description: "Pagination offset count",
        example: 0,
      }),
  })
  .openapi("ListProductsQuery", {
    description: "Query parameters for listing and filtering products",
  })

export const ProductSchema = z
  .object({
    id: z
      .string()
      .uuid()
      .openapi({
        description: "Unique product identifier",
        example: "11111111-1111-1111-1111-111111111111",
      }),
    slug: z
      .string()
      .min(2, "Slug must be at least 2 characters")
      .max(100, "Slug cannot exceed 100 characters")
      .regex(
        /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
        "Slug must be lowercase alphanumeric with hyphens"
      )
      .openapi({
        description: "Unique URL slug identifier",
        example: "trackride",
      }),
    name: z
      .string()
      .min(1, "Name is required")
      .max(255)
      .openapi({
        description: "Display name of the product",
        example: "TrackRide Motorcycle Navigation",
      }),
    status: ProductStatusEnum.default("active").openapi({
      description: "Lifecycle status of the product",
      example: "active",
    }),
    createdAt: z
      .date()
      .openapi({
        description: "Timestamp when the product record was created",
        example: "2026-10-01T00:00:00.000Z",
      }),
  })
  .openapi("Product", {
    description: "Product catalog entity",
  })

export const CreateProductSchema = z
  .object({
    slug: z
      .string()
      .min(2, "Slug must be at least 2 characters")
      .max(100, "Slug cannot exceed 100 characters")
      .regex(
        /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
        "Slug must be lowercase alphanumeric with hyphens"
      )
      .openapi({
        description: "Unique URL slug identifier",
        example: "custom-apparel",
      }),
    name: z
      .string()
      .min(1, "Name is required")
      .max(255)
      .openapi({
        description: "Display name of the product",
        example: "Custom Apparel & AI Print",
      }),
    status: ProductStatusEnum.default("active").openapi({
      description: "Initial product status",
      example: "active",
    }),
  })
  .openapi("CreateProductInput", {
    description: "Payload for creating a new product",
  })

export const UpdateProductSchema = z
  .object({
    slug: z
      .string()
      .min(2, "Slug must be at least 2 characters")
      .max(100, "Slug cannot exceed 100 characters")
      .regex(
        /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
        "Slug must be lowercase alphanumeric with hyphens"
      )
      .optional()
      .openapi({
        description: "Updated URL slug",
        example: "custom-apparel-v2",
      }),
    name: z
      .string()
      .min(1, "Name is required")
      .max(255)
      .optional()
      .openapi({
        description: "Updated product display name",
        example: "Custom Apparel Studio",
      }),
    status: ProductStatusEnum.optional().openapi({
      description: "Updated product status",
      example: "beta",
    }),
  })
  .openapi("UpdateProductInput", {
    description: "Payload for updating an existing product",
  })

export type CreateProductInput = z.infer<typeof CreateProductSchema>
export type UpdateProductInput = z.infer<typeof UpdateProductSchema>

export const ProductMaintenanceSchema = z
  .object({
    id: z
      .string()
      .uuid()
      .openapi({
        description: "Unique maintenance window identifier",
        example: "77777777-7777-4777-a777-777777777777",
      }),
    productId: z
      .string()
      .uuid()
      .openapi({
        description: "UUID of the product under maintenance",
        example: "11111111-1111-1111-1111-111111111111",
      }),
    startsAt: z.coerce
      .date()
      .openapi({
        description: "Start timestamp of the maintenance window",
        example: "2026-11-01T00:00:00.000Z",
      }),
    endsAt: z.coerce
      .date()
      .openapi({
        description: "End timestamp of the maintenance window",
        example: "2026-11-01T04:00:00.000Z",
      }),
    status: MaintenanceStatusEnum.default("scheduled").openapi({
      description: "Status of the maintenance window",
      example: "scheduled",
    }),
    message: z
      .string()
      .openapi({
        description: "Customer-facing maintenance description message",
        example: "Scheduled database migrations and performance optimizations.",
      }),
  })
  .openapi("ProductMaintenance", {
    description: "Product maintenance window entity",
  })

export const CreateProductMaintenanceSchema = z
  .object({
    startsAt: z.coerce
      .date()
      .openapi({
        description: "Maintenance window start timestamp",
        example: "2026-11-01T00:00:00.000Z",
      }),
    endsAt: z.coerce
      .date()
      .openapi({
        description: "Maintenance window end timestamp",
        example: "2026-11-01T04:00:00.000Z",
      }),
    status: MaintenanceStatusEnum.default("scheduled").openapi({
      description: "Initial status of the maintenance window",
      example: "scheduled",
    }),
    message: z
      .string()
      .min(1, "Maintenance message is required")
      .openapi({
        description: "Public notification explanation",
        example: "Scheduled database migrations and performance optimizations.",
      }),
  })
  .refine((data) => data.endsAt > data.startsAt, {
    message: "endsAt must be after startsAt",
    path: ["endsAt"],
  })
  .openapi("CreateProductMaintenanceInput", {
    description: "Payload for creating a product maintenance schedule",
  })

export const UpdateProductMaintenanceSchema = z
  .object({
    startsAt: z.coerce
      .date()
      .optional()
      .openapi({
        description: "Updated start timestamp",
        example: "2026-11-01T01:00:00.000Z",
      }),
    endsAt: z.coerce
      .date()
      .optional()
      .openapi({
        description: "Updated end timestamp",
        example: "2026-11-01T05:00:00.000Z",
      }),
    status: MaintenanceStatusEnum.optional().openapi({
      description: "Updated maintenance status",
      example: "active",
    }),
    message: z
      .string()
      .min(1)
      .optional()
      .openapi({
        description: "Updated maintenance message",
        example: "Maintenance window extended by one hour.",
      }),
  })
  .openapi("UpdateProductMaintenanceInput", {
    description: "Payload for updating a product maintenance schedule",
  })

export type CreateProductMaintenanceInput = z.infer<
  typeof CreateProductMaintenanceSchema
>
export type UpdateProductMaintenanceInput = z.infer<
  typeof UpdateProductMaintenanceSchema
>

export const ProductVersionSchema = z
  .object({
    id: z
      .string()
      .uuid()
      .openapi({
        description: "Unique product version identifier",
        example: "88888888-8888-8888-8888-888888888888",
      }),
    productId: z
      .string()
      .uuid()
      .openapi({
        description: "UUID of the associated product",
        example: "11111111-1111-1111-1111-111111111111",
      }),
    version: z
      .string()
      .openapi({
        description: "Semantic version tag",
        example: "v1.0.0",
      }),
    status: VersionStatusEnum.default("latest").openapi({
      description: "Lifecycle status of the version",
      example: "latest",
    }),
  })
  .openapi("ProductVersion", {
    description: "Product release version entity",
  })

export const CreateProductVersionSchema = z
  .object({
    version: z
      .string()
      .min(1, "Version is required")
      .max(50)
      .regex(
        /^v?[0-9]+(\.[0-9]+)*(-[a-zA-Z0-9.]+)?$/,
        "Version must follow semver format (e.g. v1.0.0 or 1.0.0)"
      )
      .openapi({
        description: "Semantic version release string",
        example: "v1.2.0",
      }),
    status: VersionStatusEnum.default("latest").openapi({
      description: "Initial status of the product version",
      example: "latest",
    }),
  })
  .openapi("CreateProductVersionInput", {
    description: "Payload for creating a new product version release",
  })

export const UpdateProductVersionSchema = z
  .object({
    version: z
      .string()
      .min(1, "Version is required")
      .max(50)
      .regex(
        /^v?[0-9]+(\.[0-9]+)*(-[a-zA-Z0-9.]+)?$/,
        "Version must follow semver format (e.g. v1.0.0 or 1.0.0)"
      )
      .optional()
      .openapi({
        description: "Updated semantic version string",
        example: "v1.2.1",
      }),
    status: VersionStatusEnum.optional().openapi({
      description: "Updated version status",
      example: "supported",
    }),
  })
  .openapi("UpdateProductVersionInput", {
    description: "Payload for updating a product version",
  })

export type CreateProductVersionInput = z.infer<
  typeof CreateProductVersionSchema
>
export type UpdateProductVersionInput = z.infer<
  typeof UpdateProductVersionSchema
>
