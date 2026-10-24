import { Router, type Request, type Response, type NextFunction } from "express"
import { ProductService } from "../services/product.service.js"
import { validateRequest } from "../middleware/validate.middleware.js"
import {
  CreateProductSchema,
  UpdateProductSchema,
  ListProductsQuerySchema,
  SlugOrIdParamSchema,
  UuidParamSchema,
  CreateProductFeatureSchema,
  UpdateProductFeatureSchema,
  CreateProductMaintenanceSchema,
  UpdateProductMaintenanceSchema,
  CreateProductVersionSchema,
  UpdateProductVersionSchema,
} from "../db/products.validator.js"

export const productsRouter = Router()

const getParam = (param: string | string[] | undefined): string => {
  if (Array.isArray(param)) return param[0] ?? ""
  return param ?? ""
}

// Products Routes

/**
 * GET /api/products
 * List all products with optional filters (?status=active&search=track&limit=20&offset=0)
 */
productsRouter.get(
  "/",
  validateRequest({ query: ListProductsQuerySchema }),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { status, search, limit, offset } = req.query as any
      const result = await ProductService.listProducts({ status, search, limit, offset })
      res.status(200).json(result)
    } catch (error) {
      next(error)
    }
  }
)

/**
 * GET /api/products/:identifier
 * Get product by UUID or slug (optional ?includeRelations=true)
 */
productsRouter.get(
  "/:identifier",
  validateRequest({ params: SlugOrIdParamSchema }),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const identifier = getParam(req.params.identifier)
      const includeRelations = req.query.includeRelations === "true"
      const product = await ProductService.getProductByIdOrSlug(identifier, includeRelations)

      if (!product) {
        res.status(404).json({ error: `Product '${identifier}' not found` })
        return
      }

      res.status(200).json(product)
    } catch (error) {
      next(error)
    }
  }
)

/**
 * POST /api/products
 * Create a new product
 */
productsRouter.post(
  "/",
  validateRequest({ body: CreateProductSchema }),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const product = await ProductService.createProduct(req.body)
      res.status(201).json(product)
    } catch (error: any) {
      if (error?.message?.includes("already exists")) {
        res.status(409).json({ error: error.message })
        return
      }
      next(error)
    }
  }
)

/**
 * PATCH /api/products/:identifier
 * Update product by UUID or slug
 */
productsRouter.patch(
  "/:identifier",
  validateRequest({
    params: SlugOrIdParamSchema,
    body: UpdateProductSchema,
  }),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const identifier = getParam(req.params.identifier)
      const updated = await ProductService.updateProduct(identifier, req.body)

      if (!updated) {
        res.status(404).json({ error: `Product '${identifier}' not found` })
        return
      }

      res.status(200).json(updated)
    } catch (error: any) {
      if (error?.message?.includes("already exists")) {
        res.status(409).json({ error: error.message })
        return
      }
      next(error)
    }
  }
)

/**
 * DELETE /api/products/:identifier
 * Delete product by UUID or slug
 */
productsRouter.delete(
  "/:identifier",
  validateRequest({ params: SlugOrIdParamSchema }),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const identifier = getParam(req.params.identifier)
      const deleted = await ProductService.deleteProduct(identifier)

      if (!deleted) {
        res.status(404).json({ error: `Product '${identifier}' not found` })
        return
      }

      res.status(204).send()
    } catch (error) {
      next(error)
    }
  }
)

// Product Features Sub-Routes

/**
 * GET /api/products/:id/features
 */
productsRouter.get(
  "/:id/features",
  validateRequest({ params: UuidParamSchema }),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const productId = getParam(req.params.id)
      const features = await ProductService.listFeatures(productId)
      res.status(200).json({ items: features })
    } catch (error) {
      next(error)
    }
  }
)

/**
 * POST /api/products/:id/features
 */
productsRouter.post(
  "/:id/features",
  validateRequest({
    params: UuidParamSchema,
    body: CreateProductFeatureSchema,
  }),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const productId = getParam(req.params.id)
      const feature = await ProductService.createFeature(productId, req.body)
      res.status(201).json(feature)
    } catch (error: any) {
      if (error?.message?.includes("not found")) {
        res.status(404).json({ error: error.message })
        return
      }
      next(error)
    }
  }
)

/**
 * PATCH /api/products/features/:id
 */
productsRouter.patch(
  "/features/:id",
  validateRequest({
    params: UuidParamSchema,
    body: UpdateProductFeatureSchema,
  }),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const featureId = getParam(req.params.id)
      const feature = await ProductService.updateFeature(featureId, req.body)
      if (!feature) {
        res.status(404).json({ error: "Feature not found" })
        return
      }
      res.status(200).json(feature)
    } catch (error) {
      next(error)
    }
  }
)

/**
 * DELETE /api/products/features/:id
 */
productsRouter.delete(
  "/features/:id",
  validateRequest({ params: UuidParamSchema }),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const featureId = getParam(req.params.id)
      const deleted = await ProductService.deleteFeature(featureId)
      if (!deleted) {
        res.status(404).json({ error: "Feature not found" })
        return
      }
      res.status(204).send()
    } catch (error) {
      next(error)
    }
  }
)

// Product Maintenance Sub-Routes

/**
 * GET /api/products/:id/maintenance
 */
productsRouter.get(
  "/:id/maintenance",
  validateRequest({ params: UuidParamSchema }),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const productId = getParam(req.params.id)
      const windows = await ProductService.listMaintenance(productId)
      res.status(200).json({ items: windows })
    } catch (error) {
      next(error)
    }
  }
)

/**
 * POST /api/products/:id/maintenance
 */
productsRouter.post(
  "/:id/maintenance",
  validateRequest({
    params: UuidParamSchema,
    body: CreateProductMaintenanceSchema,
  }),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const productId = getParam(req.params.id)
      const maintenance = await ProductService.createMaintenance(productId, req.body)
      res.status(201).json(maintenance)
    } catch (error: any) {
      if (error?.message?.includes("not found")) {
        res.status(404).json({ error: error.message })
        return
      }
      next(error)
    }
  }
)

/**
 * PATCH /api/products/maintenance/:id
 */
productsRouter.patch(
  "/maintenance/:id",
  validateRequest({
    params: UuidParamSchema,
    body: UpdateProductMaintenanceSchema,
  }),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const maintenanceId = getParam(req.params.id)
      const maintenance = await ProductService.updateMaintenance(maintenanceId, req.body)
      if (!maintenance) {
        res.status(404).json({ error: "Maintenance window not found" })
        return
      }
      res.status(200).json(maintenance)
    } catch (error) {
      next(error)
    }
  }
)

/**
 * DELETE /api/products/maintenance/:id
 */
productsRouter.delete(
  "/maintenance/:id",
  validateRequest({ params: UuidParamSchema }),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const maintenanceId = getParam(req.params.id)
      const deleted = await ProductService.deleteMaintenance(maintenanceId)
      if (!deleted) {
        res.status(404).json({ error: "Maintenance window not found" })
        return
      }
      res.status(204).send()
    } catch (error) {
      next(error)
    }
  }
)

// Product Versions Sub-Routes

/**
 * GET /api/products/:id/versions
 */
productsRouter.get(
  "/:id/versions",
  validateRequest({ params: UuidParamSchema }),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const productId = getParam(req.params.id)
      const versions = await ProductService.listVersions(productId)
      res.status(200).json({ items: versions })
    } catch (error) {
      next(error)
    }
  }
)

/**
 * POST /api/products/:id/versions
 */
productsRouter.post(
  "/:id/versions",
  validateRequest({
    params: UuidParamSchema,
    body: CreateProductVersionSchema,
  }),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const productId = getParam(req.params.id)
      const version = await ProductService.createVersion(productId, req.body)
      res.status(201).json(version)
    } catch (error: any) {
      if (error?.message?.includes("not found")) {
        res.status(404).json({ error: error.message })
        return
      }
      next(error)
    }
  }
)

/**
 * PATCH /api/products/versions/:id
 */
productsRouter.patch(
  "/versions/:id",
  validateRequest({
    params: UuidParamSchema,
    body: UpdateProductVersionSchema,
  }),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const versionId = getParam(req.params.id)
      const version = await ProductService.updateVersion(versionId, req.body)
      if (!version) {
        res.status(404).json({ error: "Version not found" })
        return
      }
      res.status(200).json(version)
    } catch (error) {
      next(error)
    }
  }
)

/**
 * DELETE /api/products/versions/:id
 */
productsRouter.delete(
  "/versions/:id",
  validateRequest({ params: UuidParamSchema }),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const versionId = getParam(req.params.id)
      const deleted = await ProductService.deleteVersion(versionId)
      if (!deleted) {
        res.status(404).json({ error: "Version not found" })
        return
      }
      res.status(204).send()
    } catch (error) {
      next(error)
    }
  }
)
