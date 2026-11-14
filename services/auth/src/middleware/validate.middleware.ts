import type { Request, Response, NextFunction } from "express"
import { z, ZodError } from "zod"

interface RequestValidators {
  params?: z.ZodType
  query?: z.ZodType
  body?: z.ZodType
}

export function validateRequest(validators: RequestValidators) {
  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (validators.params) {
        const parsedParams = await validators.params.parseAsync(req.params)
        Object.assign(req.params, parsedParams)
      }
      if (validators.query) {
        const parsedQuery = (await validators.query.parseAsync(req.query)) as Record<string, any>
        for (const key of Object.keys(req.query)) {
          delete req.query[key]
        }
        Object.assign(req.query, parsedQuery)
      }
      if (validators.body) {
        req.body = await validators.body.parseAsync(req.body)
      }
      next()
    } catch (error) {
      if (error instanceof ZodError) {
        res.status(400).json({
          error: "Validation Error",
          issues: error.issues.map((issue) => ({
            field: issue.path.join("."),
            message: issue.message,
          })),
        })
        return
      }
      next(error)
    }
  }
}
