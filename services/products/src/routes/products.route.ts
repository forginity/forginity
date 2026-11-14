import { Router } from "express"
import { validateRequest } from "../middleware/validate.middleware.js"
import {
  ProductController,
  ProductMaintenanceController,
  ProductVersionController,
} from "../controllers/product.controller.js"
import {
  CreateProductSchema,
  UpdateProductSchema,
  ListProductsQuerySchema,
  IdParamSchema,
  SlugParamSchema,
  CreateProductMaintenanceSchema,
  UpdateProductMaintenanceSchema,
  CreateProductVersionSchema,
  UpdateProductVersionSchema,
} from "../db/products.validator.js"

export const productsRouter = Router()

// ==========================================
// Products Routes
// ==========================================

/**
 * GET /api/products
 * List all products with optional filters (?status=active&search=track&limit=20&offset=0)
 */
productsRouter.get(
  "/",
  validateRequest({ query: ListProductsQuerySchema }),
  ProductController.list
)

/**
 * GET /api/products/slug/:slug
 * Get product by unique slug (optional ?includeRelations=true)
 */
productsRouter.get(
  "/slug/:slug",
  validateRequest({ params: SlugParamSchema }),
  ProductController.getBySlug
)

/**
 * GET /api/products/:id
 * Get product by UUID id (optional ?includeRelations=true)
 */
productsRouter.get(
  "/:id",
  validateRequest({ params: IdParamSchema }),
  ProductController.getById
)

/**
 * POST /api/products
 * Create a new product
 */
productsRouter.post(
  "/",
  validateRequest({ body: CreateProductSchema }),
  ProductController.create
)

/**
 * PATCH /api/products/:id
 * Update product by UUID id
 */
productsRouter.patch(
  "/:id",
  validateRequest({
    params: IdParamSchema,
    body: UpdateProductSchema,
  }),
  ProductController.update
)

/**
 * DELETE /api/products/:id
 * Delete product by UUID id
 */
productsRouter.delete(
  "/:id",
  validateRequest({ params: IdParamSchema }),
  ProductController.delete
)

// ==========================================
// Product Maintenance Sub-Routes
// ==========================================

/**
 * GET /api/products/maintenance/active
 * List all active maintenance schedules across the platform
 */
productsRouter.get(
  "/maintenance/active",
  ProductMaintenanceController.listActive
)

/**
 * GET /api/products/maintenance/:id
 * Get a single maintenance window by its maintenance UUID
 */
productsRouter.get(
  "/maintenance/:id",
  validateRequest({ params: IdParamSchema }),
  ProductMaintenanceController.getById
)

/**
 * PATCH /api/products/maintenance/:id
 * Update maintenance window by maintenance UUID
 */
productsRouter.patch(
  "/maintenance/:id",
  validateRequest({
    params: IdParamSchema,
    body: UpdateProductMaintenanceSchema,
  }),
  ProductMaintenanceController.update
)

/**
 * DELETE /api/products/maintenance/:id
 * Delete maintenance window by maintenance UUID
 */
productsRouter.delete(
  "/maintenance/:id",
  validateRequest({ params: IdParamSchema }),
  ProductMaintenanceController.delete
)

/**
 * GET /api/products/:id/maintenance
 * List maintenance schedules for a specific product by product UUID
 */
productsRouter.get(
  "/:id/maintenance",
  validateRequest({ params: IdParamSchema }),
  ProductMaintenanceController.list
)

/**
 * POST /api/products/:id/maintenance
 * Create a maintenance window for a product by product UUID
 */
productsRouter.post(
  "/:id/maintenance",
  validateRequest({
    params: IdParamSchema,
    body: CreateProductMaintenanceSchema,
  }),
  ProductMaintenanceController.create
)

// ==========================================
// Product Versions Sub-Routes
// ==========================================

/**
 * GET /api/products/versions/:id
 * Get a single product version by its version UUID
 */
productsRouter.get(
  "/versions/:id",
  validateRequest({ params: IdParamSchema }),
  ProductVersionController.getById
)

/**
 * PATCH /api/products/versions/:id
 * Update a product version by version UUID
 */
productsRouter.patch(
  "/versions/:id",
  validateRequest({
    params: IdParamSchema,
    body: UpdateProductVersionSchema,
  }),
  ProductVersionController.update
)

/**
 * DELETE /api/products/versions/:id
 * Delete a product version by version UUID
 */
productsRouter.delete(
  "/versions/:id",
  validateRequest({ params: IdParamSchema }),
  ProductVersionController.delete
)

/**
 * GET /api/products/:id/versions
 * List versions for a product by product UUID
 */
productsRouter.get(
  "/:id/versions",
  validateRequest({ params: IdParamSchema }),
  ProductVersionController.list
)

/**
 * POST /api/products/:id/versions
 * Register a new version for a product by product UUID
 */
productsRouter.post(
  "/:id/versions",
  validateRequest({
    params: IdParamSchema,
    body: CreateProductVersionSchema,
  }),
  ProductVersionController.create
)
