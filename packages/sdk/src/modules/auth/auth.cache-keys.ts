import type { ListUsersParams } from "./auth.types"

export const authCacheKeys = {
  all: () => ["auth"] as const,
  session: () => ["auth", "session"] as const,
  users: (params?: ListUsersParams) => ["auth", "users", params ?? {}] as const,
  user: (userId: string) => ["auth", "user", userId] as const,
} as const
