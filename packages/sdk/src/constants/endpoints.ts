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
  AUTH: {
    INITIATE: "/api/auth/email/initiate",
    VERIFY: "/api/auth/email/verify",
    GOOGLE: "/api/auth/google",
    ONBOARDING: "/api/auth/onboarding",
    ME: "/api/auth/session/me",
    REFRESH: "/api/auth/session/refresh",
    LOGOUT: "/api/auth/session/logout",
    REVOKE: "/api/auth/session/revoke",
    REVOKE_ALL: "/api/auth/session/revoke-all",
    SWITCH_PRODUCT: "/api/auth/session/switch-product",
    USERS: "/api/users",
    USER_BY_ID: (userId: string) => `/api/users/${userId}`,
    USER_STATUS: (userId: string) => `/api/users/${userId}/status`,
  },
} as const
