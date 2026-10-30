import type { Request, Response, NextFunction } from "express"
import { ProductService } from "../services/product.service.js"

const getParam = (param: string | string[] | undefined): string => {
  if (Array.isArray(param)) return param[0] ?? ""
  return param ?? ""
}

/**
 * Product Controller
 * Handles HTTP requests for Product catalog lifecycle
 */
export class ProductController {
  static async list(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { status, search, limit, offset } = req.query as any
      const result = await ProductService.listProducts({
        status,
        search,
        limit,
        offset,
      })
      res.status(200).json(result)
    } catch (error) {
      next(error)
    }
  }

  static async getById(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const id = getParam(req.params.id)
      const includeRelations = req.query.includeRelations === "true"
      const product = await ProductService.getProductById(id, includeRelations)

      if (!product) {
        res.status(404).json({ error: `Product with id '${id}' not found` })
        return
      }

      res.status(200).json(product)
    } catch (error) {
      next(error)
    }
  }

  static async getBySlug(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const slug = getParam(req.params.slug)
      const includeRelations = req.query.includeRelations === "true"
      const product = await ProductService.getProductBySlug(slug, includeRelations)

      if (!product) {
        res.status(404).json({ error: `Product with slug '${slug}' not found` })
        return
      }

      res.status(200).json(product)
    } catch (error) {
      next(error)
    }
  }

  static async create(req: Request, res: Response, next: NextFunction): Promise<void> {
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

  static async update(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const id = getParam(req.params.id)
      const updated = await ProductService.updateProduct(id, req.body)

      if (!updated) {
        res.status(404).json({ error: `Product with id '${id}' not found` })
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

  static async delete(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const id = getParam(req.params.id)
      const deleted = await ProductService.deleteProduct(id)

      if (!deleted) {
        res.status(404).json({ error: `Product with id '${id}' not found` })
        return
      }

      res.status(204).send()
    } catch (error) {
      next(error)
    }
  }
}

/**
 * Product Maintenance Controller
 * Handles HTTP requests for maintenance windows
 */
export class ProductMaintenanceController {
  static async list(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const productId = getParam(req.params.id)
      const windows = await ProductService.listMaintenance(productId)
      res.status(200).json({ items: windows })
    } catch (error) {
      next(error)
    }
  }

  static async create(req: Request, res: Response, next: NextFunction): Promise<void> {
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

  static async update(req: Request, res: Response, next: NextFunction): Promise<void> {
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

  static async delete(req: Request, res: Response, next: NextFunction): Promise<void> {
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
}

/**
 * Product Version Controller
 * Handles HTTP requests for product version tracking
 */
export class ProductVersionController {
  static async list(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const productId = getParam(req.params.id)
      const versions = await ProductService.listVersions(productId)
      res.status(200).json({ items: versions })
    } catch (error) {
      next(error)
    }
  }

  static async create(req: Request, res: Response, next: NextFunction): Promise<void> {
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

  static async update(req: Request, res: Response, next: NextFunction): Promise<void> {
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

  static async delete(req: Request, res: Response, next: NextFunction): Promise<void> {
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
}
