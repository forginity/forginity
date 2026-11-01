import type { ReactNode } from "react"
import type { LucideIcon } from "lucide-react"

export interface NavItem {
  id: string
  title: string
  href: string
  icon?: LucideIcon | ReactNode
  badge?: string | number
  items?: NavItem[]
  exactMatch?: boolean
  isExternal?: boolean
}

export interface NavSection {
  id: string
  label?: string
  items: NavItem[]
}

export interface UserProfile {
  name: string
  role: string
  email?: string
  initials: string
  avatarUrl?: string
}

export interface WorkspaceInfo {
  name: string
  type: string
  initials: string
  badge?: string
}

export interface SystemStatus {
  isOperational: boolean
  label: string
  version: string
}
