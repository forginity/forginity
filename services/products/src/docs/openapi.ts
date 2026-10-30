import { z } from "zod"
import {
  OpenAPIRegistry,
  OpenApiGeneratorV3,
} from "@asteasolutions/zod-to-openapi"
import {
  ProductSchema,
  CreateProductSchema,
  UpdateProductSchema,
  IdParamSchema,
  ProductIdParamSchema,
  MaintenanceIdParamSchema,
  VersionIdParamSchema,
  SlugParamSchema,
  ListProductsQuerySchema,
  ProductMaintenanceSchema,
  CreateProductMaintenanceSchema,
  UpdateProductMaintenanceSchema,
  ProductVersionSchema,
  CreateProductVersionSchema,
  UpdateProductVersionSchema,
} from "../db/products.validator.js"

export const HealthResponseSchema = z
  .object({
    status: z.string().openapi({ example: "ok" }),
    service: z.string().openapi({ example: "products" }),
    database: z.string().openapi({ example: "connected" }),
    timestamp: z.string().openapi({ example: "2026-10-30T10:00:00.000Z" }),
    uptime: z.number().openapi({ example: 42.15 }),
  })
  .openapi("HealthResponse", {
    description: "Products microservice operational health status",
  })

export const ErrorResponseSchema = z
  .object({
    error: z.string().openapi({ example: "Resource not found" }),
  })
  .openapi("ErrorResponse", {
    description: "Standard API error response payload",
  })

export const ListProductsResponseSchema = z
  .object({
    items: z.array(ProductSchema),
    pagination: z.object({
      total: z.number().openapi({ example: 42 }),
      limit: z.number().openapi({ example: 20 }),
      offset: z.number().openapi({ example: 0 }),
      hasMore: z.boolean().openapi({ example: true }),
    }),
  })
  .openapi("ListProductsResponse", {
    description: "Paginated list of products response",
  })

export const ListMaintenanceResponseSchema = z
  .object({
    items: z.array(ProductMaintenanceSchema),
  })
  .openapi("ListMaintenanceResponse", {
    description: "List of maintenance windows for a product",
  })

export const ListVersionsResponseSchema = z
  .object({
    items: z.array(ProductVersionSchema),
  })
  .openapi("ListVersionsResponse", {
    description: "List of release versions for a product",
  })

export const registry = new OpenAPIRegistry()

registry.register("Product", ProductSchema)
registry.register("CreateProductInput", CreateProductSchema)
registry.register("UpdateProductInput", UpdateProductSchema)
registry.register("ProductMaintenance", ProductMaintenanceSchema)
registry.register("CreateProductMaintenanceInput", CreateProductMaintenanceSchema)
registry.register("UpdateProductMaintenanceInput", UpdateProductMaintenanceSchema)
registry.register("ProductVersion", ProductVersionSchema)
registry.register("CreateProductVersionInput", CreateProductVersionSchema)
registry.register("UpdateProductVersionInput", UpdateProductVersionSchema)
registry.register("HealthResponse", HealthResponseSchema)
registry.register("ErrorResponse", ErrorResponseSchema)
registry.register("ListProductsResponse", ListProductsResponseSchema)
registry.register("ListMaintenanceResponse", ListMaintenanceResponseSchema)
registry.register("ListVersionsResponse", ListVersionsResponseSchema)

// 1. GET /api/health
registry.registerPath({
  method: "get",
  path: "/api/health",
  tags: ["Health"],
  summary: "Service Health Probe",
  description: "Check liveness of the service and PostgreSQL database connection.",
  responses: {
    200: {
      description: "Service is healthy and database is connected",
      content: {
        "application/json": {
          schema: HealthResponseSchema,
        },
      },
    },
    503: {
      description: "Service or database is unhealthy",
      content: {
        "application/json": {
          schema: ErrorResponseSchema,
        },
      },
    },
  },
})

// 2. GET /api/products
registry.registerPath({
  method: "get",
  path: "/api/products",
  tags: ["Products"],
  summary: "List Products",
  description: "Retrieve a paginated list of products with optional status and name search filtering.",
  request: {
    query: ListProductsQuerySchema,
  },
  responses: {
    200: {
      description: "Successfully retrieved list of products",
      content: {
        "application/json": {
          schema: ListProductsResponseSchema,
        },
      },
    },
  },
})

// 3. POST /api/products
registry.registerPath({
  method: "post",
  path: "/api/products",
  tags: ["Products"],
  summary: "Create Product",
  description: "Register a new product in the catalog.",
  request: {
    body: {
      description: "Product creation payload",
      content: {
        "application/json": {
          schema: CreateProductSchema,
        },
      },
      required: true,
    },
  },
  responses: {
    201: {
      description: "Product created successfully",
      content: {
        "application/json": {
          schema: ProductSchema,
        },
      },
    },
    400: {
      description: "Invalid input or validation error",
      content: {
        "application/json": {
          schema: ErrorResponseSchema,
        },
      },
    },
    409: {
      description: "Product with duplicate slug already exists",
      content: {
        "application/json": {
          schema: ErrorResponseSchema,
        },
      },
    },
  },
})

// 4. GET /api/products/slug/{slug}
registry.registerPath({
  method: "get",
  path: "/api/products/slug/{slug}",
  tags: ["Products"],
  summary: "Get Product by Slug",
  description: "Lookup a product by its unique URL slug identifier.",
  request: {
    params: SlugParamSchema,
    query: z.object({
      includeRelations: z.enum(["true", "false"]).optional().openapi({
        description: "Include maintenance windows and versions in response",
        example: "true",
      }),
    }),
  },
  responses: {
    200: {
      description: "Product retrieved successfully",
      content: {
        "application/json": {
          schema: ProductSchema,
        },
      },
    },
    404: {
      description: "Product with the specified slug was not found",
      content: {
        "application/json": {
          schema: ErrorResponseSchema,
        },
      },
    },
  },
})

// 5. GET /api/products/{id}
registry.registerPath({
  method: "get",
  path: "/api/products/{id}",
  tags: ["Products"],
  summary: "Get Product by ID",
  description: "Retrieve a product record by its UUID identifier.",
  request: {
    params: ProductIdParamSchema,
    query: z.object({
      includeRelations: z.enum(["true", "false"]).optional().openapi({
        description: "Include maintenance windows and versions in response",
        example: "true",
      }),
    }),
  },
  responses: {
    200: {
      description: "Product retrieved successfully",
      content: {
        "application/json": {
          schema: ProductSchema,
        },
      },
    },
    404: {
      description: "Product with the specified ID was not found",
      content: {
        "application/json": {
          schema: ErrorResponseSchema,
        },
      },
    },
  },
})

// 6. PATCH /api/products/{id}
registry.registerPath({
  method: "patch",
  path: "/api/products/{id}",
  tags: ["Products"],
  summary: "Update Product",
  description: "Update fields of an existing product record.",
  request: {
    params: ProductIdParamSchema,
    body: {
      description: "Product fields to update",
      content: {
        "application/json": {
          schema: UpdateProductSchema,
        },
      },
      required: true,
    },
  },
  responses: {
    200: {
      description: "Product updated successfully",
      content: {
        "application/json": {
          schema: ProductSchema,
        },
      },
    },
    400: {
      description: "Validation error",
      content: {
        "application/json": {
          schema: ErrorResponseSchema,
        },
      },
    },
    404: {
      description: "Product not found",
      content: {
        "application/json": {
          schema: ErrorResponseSchema,
        },
      },
    },
    409: {
      description: "Slug already exists on another product",
      content: {
        "application/json": {
          schema: ErrorResponseSchema,
        },
      },
    },
  },
})

// 7. DELETE /api/products/{id}
registry.registerPath({
  method: "delete",
  path: "/api/products/{id}",
  tags: ["Products"],
  summary: "Delete Product",
  description: "Delete an existing product and its cascading relationships.",
  request: {
    params: ProductIdParamSchema,
  },
  responses: {
    204: {
      description: "Product deleted successfully",
    },
    404: {
      description: "Product not found",
      content: {
        "application/json": {
          schema: ErrorResponseSchema,
        },
      },
    },
  },
})

// 8. GET /api/products/maintenance/active
registry.registerPath({
  method: "get",
  path: "/api/products/maintenance/active",
  tags: ["Product Maintenance"],
  summary: "List Active Maintenance Schedules",
  description: "Retrieve all maintenance schedules currently active across the platform.",
  responses: {
    200: {
      description: "List of active maintenance windows",
      content: {
        "application/json": {
          schema: ListMaintenanceResponseSchema,
        },
      },
    },
  },
})

// 9. GET /api/products/maintenance/{id}
registry.registerPath({
  method: "get",
  path: "/api/products/maintenance/{id}",
  tags: ["Product Maintenance"],
  summary: "Get Maintenance Schedule by ID",
  description: "Retrieve a single maintenance window record by its unique maintenance schedule UUID.",
  request: {
    params: MaintenanceIdParamSchema,
  },
  responses: {
    200: {
      description: "Maintenance window details retrieved successfully",
      content: {
        "application/json": {
          schema: ProductMaintenanceSchema,
        },
      },
    },
    404: {
      description: "Maintenance window not found",
      content: {
        "application/json": {
          schema: ErrorResponseSchema,
        },
      },
    },
  },
})

// 10. GET /api/products/{id}/maintenance
registry.registerPath({
  method: "get",
  path: "/api/products/{id}/maintenance",
  tags: ["Product Maintenance"],
  summary: "List Maintenance Schedules for Product",
  description: "Retrieve all maintenance schedules registered for a specific product by product UUID.",
  request: {
    params: ProductIdParamSchema,
  },
  responses: {
    200: {
      description: "List of maintenance windows",
      content: {
        "application/json": {
          schema: ListMaintenanceResponseSchema,
        },
      },
    },
    404: {
      description: "Product not found",
      content: {
        "application/json": {
          schema: ErrorResponseSchema,
        },
      },
    },
  },
})

// 11. POST /api/products/{id}/maintenance
registry.registerPath({
  method: "post",
  path: "/api/products/{id}/maintenance",
  tags: ["Product Maintenance"],
  summary: "Create Maintenance Schedule for Product",
  description: "Schedule a new maintenance period for a product by product UUID.",
  request: {
    params: ProductIdParamSchema,
    body: {
      description: "Maintenance schedule payload",
      content: {
        "application/json": {
          schema: CreateProductMaintenanceSchema,
        },
      },
      required: true,
    },
  },
  responses: {
    201: {
      description: "Maintenance window scheduled successfully",
      content: {
        "application/json": {
          schema: ProductMaintenanceSchema,
        },
      },
    },
    400: {
      description: "Validation failure",
      content: {
        "application/json": {
          schema: ErrorResponseSchema,
        },
      },
    },
    404: {
      description: "Product not found",
      content: {
        "application/json": {
          schema: ErrorResponseSchema,
        },
      },
    },
  },
})

// 12. PATCH /api/products/maintenance/{id}
registry.registerPath({
  method: "patch",
  path: "/api/products/maintenance/{id}",
  tags: ["Product Maintenance"],
  summary: "Update Maintenance Schedule",
  description: "Update details or status of a maintenance window by maintenance UUID.",
  request: {
    params: MaintenanceIdParamSchema,
    body: {
      description: "Updated maintenance window fields",
      content: {
        "application/json": {
          schema: UpdateProductMaintenanceSchema,
        },
      },
      required: true,
    },
  },
  responses: {
    200: {
      description: "Maintenance window updated successfully",
      content: {
        "application/json": {
          schema: ProductMaintenanceSchema,
        },
      },
    },
    404: {
      description: "Maintenance window not found",
      content: {
        "application/json": {
          schema: ErrorResponseSchema,
        },
      },
    },
  },
})

// 13. DELETE /api/products/maintenance/{id}
registry.registerPath({
  method: "delete",
  path: "/api/products/maintenance/{id}",
  tags: ["Product Maintenance"],
  summary: "Delete Maintenance Schedule",
  description: "Remove a maintenance schedule by maintenance UUID.",
  request: {
    params: MaintenanceIdParamSchema,
  },
  responses: {
    204: {
      description: "Maintenance schedule removed successfully",
    },
    404: {
      description: "Maintenance schedule not found",
      content: {
        "application/json": {
          schema: ErrorResponseSchema,
        },
      },
    },
  },
})

// 14. GET /api/products/versions/{id}
registry.registerPath({
  method: "get",
  path: "/api/products/versions/{id}",
  tags: ["Product Versions"],
  summary: "Get Product Version by ID",
  description: "Retrieve a single product release version record by its unique version UUID.",
  request: {
    params: VersionIdParamSchema,
  },
  responses: {
    200: {
      description: "Product version details retrieved successfully",
      content: {
        "application/json": {
          schema: ProductVersionSchema,
        },
      },
    },
    404: {
      description: "Product version not found",
      content: {
        "application/json": {
          schema: ErrorResponseSchema,
        },
      },
    },
  },
})

// 15. GET /api/products/{id}/versions
registry.registerPath({
  method: "get",
  path: "/api/products/{id}/versions",
  tags: ["Product Versions"],
  summary: "List Versions for Product",
  description: "Retrieve all release versions registered for a product by product UUID.",
  request: {
    params: ProductIdParamSchema,
  },
  responses: {
    200: {
      description: "List of product versions",
      content: {
        "application/json": {
          schema: ListVersionsResponseSchema,
        },
      },
    },
    404: {
      description: "Product not found",
      content: {
        "application/json": {
          schema: ErrorResponseSchema,
        },
      },
    },
  },
})

// 16. POST /api/products/{id}/versions
registry.registerPath({
  method: "post",
  path: "/api/products/{id}/versions",
  tags: ["Product Versions"],
  summary: "Create Product Version",
  description: "Publish a new release version for a product by product UUID.",
  request: {
    params: ProductIdParamSchema,
    body: {
      description: "Version release payload",
      content: {
        "application/json": {
          schema: CreateProductVersionSchema,
        },
      },
      required: true,
    },
  },
  responses: {
    201: {
      description: "Product version published successfully",
      content: {
        "application/json": {
          schema: ProductVersionSchema,
        },
      },
    },
    400: {
      description: "Validation failure",
      content: {
        "application/json": {
          schema: ErrorResponseSchema,
        },
      },
    },
    404: {
      description: "Product not found",
      content: {
        "application/json": {
          schema: ErrorResponseSchema,
        },
      },
    },
  },
})

// 17. PATCH /api/products/versions/{id}
registry.registerPath({
  method: "patch",
  path: "/api/products/versions/{id}",
  tags: ["Product Versions"],
  summary: "Update Product Version",
  description: "Update status or attributes of a product version release by version UUID.",
  request: {
    params: VersionIdParamSchema,
    body: {
      description: "Updated product version fields",
      content: {
        "application/json": {
          schema: UpdateProductVersionSchema,
        },
      },
      required: true,
    },
  },
  responses: {
    200: {
      description: "Product version updated successfully",
      content: {
        "application/json": {
          schema: ProductVersionSchema,
        },
      },
    },
    404: {
      description: "Product version not found",
      content: {
        "application/json": {
          schema: ErrorResponseSchema,
        },
      },
    },
  },
})

// 18. DELETE /api/products/versions/{id}
registry.registerPath({
  method: "delete",
  path: "/api/products/versions/{id}",
  tags: ["Product Versions"],
  summary: "Delete Product Version",
  description: "Remove a registered product version by version UUID.",
  request: {
    params: VersionIdParamSchema,
  },
  responses: {
    204: {
      description: "Product version deleted successfully",
    },
    404: {
      description: "Product version not found",
      content: {
        "application/json": {
          schema: ErrorResponseSchema,
        },
      },
    },
  },
})

const generator = new OpenApiGeneratorV3(registry.definitions)

export const openApiDocument = generator.generateDocument({
  openapi: "3.0.0",
  info: {
    title: "Forginity Products Service API",
    version: "1.0.0",
    description: "Authoritative Product Registry, Maintenance, and Version Management API",
  },
})
