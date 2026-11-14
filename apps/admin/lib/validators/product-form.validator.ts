import { z } from "zod"

/**
 * Authoritative Zod schema for client-side Product creation and editing.
 * Derived from backend domain contracts in services/products.
 */
export const productFormSchema = z.object({
  name: z
    .string()
    .min(2, "Product name must be at least 2 characters")
    .max(255, "Product name cannot exceed 255 characters"),
  slug: z
    .string()
    .min(2, "Slug must be at least 2 characters")
    .max(100, "Slug cannot exceed 100 characters")
    .regex(
      /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
      "Slug must be lowercase alphanumeric with hyphens (e.g. 'trackride', 'piky-rider')"
    ),
  status: z.enum(["active", "beta", "deprecated"]),

  // Initial / New Version Track Specification
  hasVersion: z.boolean().default(true),
  version: z
    .string()
    .regex(
      /^\d+\.\d+\.\d+.*$/,
      "Version must follow semantic format (e.g. '1.0.0')"
    )
    .optional()
    .or(z.literal("")),
  versionStatus: z.enum(["latest", "supported", "deprecated"]).default("latest"),
  changelog: z.string().max(500, "Changelog cannot exceed 500 characters").optional(),
})

export type ProductFormValues = z.infer<typeof productFormSchema>

/**
 * Utility helper to convert a readable name into an authoritative URL slug.
 */
export function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_-]+/g, "-")
    .replace(/^-+|-+$/g, "")
}
