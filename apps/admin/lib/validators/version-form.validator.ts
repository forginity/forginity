import { z } from "zod"

/**
 * Authoritative Zod schema for client-side Product Version registration & updating.
 * Aligned with domain contracts in services/products.
 */
export const versionFormSchema = z.object({
  version: z
    .string()
    .min(1, "Version tag is required")
    .max(50, "Version cannot exceed 50 characters")
    .regex(
      /^v?[0-9]+(\.[0-9]+)*(-[a-zA-Z0-9.]+)?$/,
      "Version must follow semantic format (e.g. '1.0.0' or 'v2.1.0')"
    ),
  status: z.enum(["latest", "supported", "deprecated"]).default("latest"),
  changelog: z
    .string()
    .max(500, "Release notes cannot exceed 500 characters")
    .optional(),
})

export type VersionFormValues = z.infer<typeof versionFormSchema>
