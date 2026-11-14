/**
 * Domain constants for Products service
 */

export const PRODUCT_STATUSES = ["alpha", "beta", "active", "deprecated"] as const
export type ProductStatus = (typeof PRODUCT_STATUSES)[number]

export const MAINTENANCE_STATUSES = [
  "scheduled",
  "active",
  "completed",
  "cancelled",
] as const
export type MaintenanceStatus = (typeof MAINTENANCE_STATUSES)[number]

export const VERSION_STATUSES = ["latest", "supported", "deprecated"] as const
export type VersionStatus = (typeof VERSION_STATUSES)[number]
