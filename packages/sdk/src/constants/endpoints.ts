/**
 * Authoritative API Endpoint URL Registry for the Forginity monorepo ecosystem.
 */
export const API_ENDPOINTS = {
  PRODUCTS: {
    ROOT: "/api/products",
    BY_ID: (id: string) => `/api/products/${id}`,
    BY_SLUG: (slug: string) => `/api/products/slug/${slug}`,
    MAINTENANCE: (productId: string) => `/api/products/${productId}/maintenance`,
    ACTIVE_MAINTENANCE: () => `/api/products/maintenance/active`,
    MAINTENANCE_BY_ID: (maintenanceId: string) => `/api/products/maintenance/${maintenanceId}`,
    VERSIONS: (productId: string) => `/api/products/${productId}/versions`,
    VERSION_BY_ID: (versionId: string) => `/api/products/versions/${versionId}`,
  },
} as const
