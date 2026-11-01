import type { SystemStatus, WorkspaceInfo } from "@workspace/ui/types/navigation.types"

export const BRAND_NAME = "Forginity" as const
export const ORG_ADMIN_LABEL = "ORGANIZATION ADMIN" as const
export const CONSOLE_VERSION = "0.0.1" as const
export const DEFAULT_ENVIRONMENT = "production" as const
export const COPYRIGHT_TEXT = "© 2026 Forginity" as const

export const DEFAULT_SYSTEM_STATUS: SystemStatus = {
  isOperational: true,
  label: "All systems operational",
  version: `Forginity console · v${CONSOLE_VERSION}`,
}

export const DEFAULT_WORKSPACE: WorkspaceInfo = {
  name: "Forginity",
  type: "Workspace",
  initials: "FG",
}
