import { z } from "zod"

/**
 * Authoritative Zod schema for client-side Product Maintenance scheduling & updating.
 * Derived from backend domain contracts in services/products.
 */
export const maintenanceFormSchema = z
  .object({
    startsAt: z
      .string()
      .min(1, "Start time is required")
      .refine(
        (val) => !isNaN(new Date(val).getTime()),
        "Start time must be a valid date"
      ),
    endsAt: z
      .string()
      .min(1, "End time is required")
      .refine(
        (val) => !isNaN(new Date(val).getTime()),
        "End time must be a valid date"
      ),
    status: z
      .enum(["scheduled", "active", "completed", "cancelled"])
      .default("scheduled"),
    message: z
      .string()
      .min(5, "Maintenance message must be at least 5 characters")
      .max(500, "Maintenance message cannot exceed 500 characters"),
  })
  .refine(
    (data) => {
      const start = new Date(data.startsAt).getTime()
      const end = new Date(data.endsAt).getTime()
      return end > start
    },
    {
      message: "End time must be after start time",
      path: ["endsAt"],
    }
  )

export type MaintenanceFormValues = z.infer<typeof maintenanceFormSchema>
