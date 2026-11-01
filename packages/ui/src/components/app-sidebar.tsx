"use client"

import * as React from "react"
import {
  ChevronDown,
  HelpCircle,
  LogOut,
  Settings as SettingsIcon,
} from "lucide-react"
import { cn } from "@workspace/ui/lib/utils"
import type {
  NavItem,
  NavSection,
  SystemStatus,
  UserProfile,
  WorkspaceInfo,
} from "@workspace/ui/types/navigation.types"
import {
  DEFAULT_SYSTEM_STATUS,
  DEFAULT_WORKSPACE,
  ORG_ADMIN_LABEL,
} from "@workspace/ui/constants/brand.constants"
import { BrandLogo } from "@workspace/ui/components/brand-logo"
import { Avatar, AvatarFallback, AvatarImage } from "@workspace/ui/components/avatar"

export interface AppSidebarProps extends React.HTMLAttributes<HTMLElement> {
  currentPath?: string
  sections: NavSection[]
  user?: UserProfile
  workspace?: WorkspaceInfo
  systemStatus?: SystemStatus
  sublabel?: string
  linkComponent?: React.ElementType
  onLogout?: () => void
  onWorkspaceSwitch?: () => void
}

function renderNavIcon(icon: NavItem["icon"]) {
  if (!icon) return null
  if (React.isValidElement(icon)) return icon
  const IconComponent = icon as React.ComponentType<{ className?: string }>
  return <IconComponent className="size-[18px] shrink-0" />
}

export function AppSidebar({
  currentPath = "/",
  sections,
  user,
  systemStatus = DEFAULT_SYSTEM_STATUS,
  sublabel = ORG_ADMIN_LABEL,
  linkComponent: LinkComp = "a",
  onLogout,
  className,
  ...props
}: AppSidebarProps) {
  // Track open state for collapsible nav items
  const [openItems, setOpenItems] = React.useState<Record<string, boolean>>(() => {
    const initial: Record<string, boolean> = {}
    sections.forEach((section: NavSection) => {
      section.items.forEach((item: NavItem) => {
        if (item.items && item.items.length > 0) {
          const hasActiveChild = item.items.some(
            (sub: NavItem) => sub.href === currentPath || currentPath.startsWith(sub.href)
          )
          initial[item.id] = hasActiveChild || true
        }
      })
    })
    return initial
  })

  const toggleItem = (id: string) => {
    setOpenItems((prev) => ({ ...prev, [id]: !prev[id] }))
  }

  const isItemActive = (item: NavItem): boolean => {
    if (item.exactMatch) {
      return currentPath === item.href
    }
    if (item.href === "/" && currentPath !== "/") {
      return false
    }
    return currentPath === item.href || currentPath.startsWith(`${item.href}/`)
  }

  return (
    <aside
      className={cn(
        "flex h-screen w-[236px] flex-col justify-between border-r border-border/40 bg-sidebar text-sidebar-foreground px-[8px] pt-[28px] pb-[20px] shrink-0 select-none",
        className
      )}
      {...props}
    >
      {/* Top Section: Logo & Navigation */}
      <div className="flex flex-col flex-1 min-h-0">
        {/* Brand Logo: width 120, height 32, sublabel 10px with mt-10px */}
        <div className="px-2">
          <BrandLogo width={120} height={32} sublabel={sublabel} />
        </div>

        {/* Main Navigation Scroll Area: mt-28px */}
        <div className="flex-1 overflow-y-auto mt-[28px] space-y-4 pr-0.5">
          {sections.map((section: NavSection) => (
            <div key={section.id} className="space-y-1">
              {/* WORKSPACE Label: 10px font size with margin-top 10px */}
              {section.label && (
                <h3 className="px-2 text-[10px] mt-[10px] mb-2 font-semibold tracking-wider uppercase text-muted-foreground/70">
                  {section.label}
                </h3>
              )}

              <nav className="space-y-1.5 flex flex-col items-center">
                {section.items.map((item: NavItem) => {
                  const active = isItemActive(item)
                  const hasChildren = item.items && item.items.length > 0
                  const isOpen = openItems[item.id] ?? false

                  if (hasChildren) {
                    return (
                      <div key={item.id} className="w-full flex flex-col items-center space-y-1">
                        <button
                          type="button"
                          onClick={() => toggleItem(item.id)}
                          className={cn(
                            "group flex h-[44px] w-[200px] items-center justify-between rounded-lg px-3 text-[16px] font-medium transition-colors",
                            active
                              ? "bg-[#FF6347]/60 text-[#FF967F]"
                              : "text-muted-foreground hover:bg-muted/40 hover:text-foreground"
                          )}
                        >
                          <div className="flex items-center gap-3">
                            {renderNavIcon(item.icon)}
                            <span>{item.title}</span>
                          </div>
                          <ChevronDown
                            className={cn(
                              "size-4 text-muted-foreground transition-transform duration-200",
                              isOpen && "rotate-180"
                            )}
                          />
                        </button>

                        {isOpen && (
                          <div className="w-[200px] pl-6 space-y-1">
                            {item.items?.map((subItem: NavItem) => {
                              const subActive = isItemActive(subItem)
                              return (
                                <LinkComp
                                  key={subItem.id}
                                  href={subItem.href}
                                  className={cn(
                                    "flex h-[38px] items-center gap-2 rounded-lg px-2.5 text-sm transition-colors",
                                    subActive
                                      ? "bg-[#FF6347]/60 font-medium text-[#FF967F]"
                                      : "text-muted-foreground hover:bg-muted/30 hover:text-foreground"
                                  )}
                                >
                                  <span>{subItem.title}</span>
                                  {subItem.badge && (
                                    <span className="ml-auto rounded bg-muted px-1.5 py-0.5 text-[10px] text-muted-foreground">
                                      {subItem.badge}
                                    </span>
                                  )}
                                </LinkComp>
                              )
                            })}
                          </div>
                        )}
                      </div>
                    )
                  }

                  return (
                    <LinkComp
                      key={item.id}
                      href={item.href}
                      className={cn(
                        "flex h-[44px] w-[200px] items-center justify-between rounded-lg px-3 text-[16px] font-medium transition-colors",
                        active
                          ? "bg-[#FF6347]/60 text-[#FF967F]"
                          : "text-muted-foreground hover:bg-muted/40 hover:text-foreground"
                      )}
                    >
                      <div className="flex items-center gap-3">
                        {renderNavIcon(item.icon)}
                        <span>{item.title}</span>
                      </div>
                      {item.badge && (
                        <span className="rounded bg-muted px-1.5 py-0.5 text-[10px] text-muted-foreground">
                          {item.badge}
                        </span>
                      )}
                    </LinkComp>
                  )
                })}
              </nav>
            </div>
          ))}
        </div>
      </div>

      {/* Footer Area: Settings, Operational Status, User Profile */}
      <div className="flex flex-col gap-2.5 border-t border-border/40 pt-3 mt-2 shrink-0">
        {/* Secondary Links: 44px height, 200px width, 16px font, 18px icons */}
        <div className="flex flex-col items-center space-y-1">
          <LinkComp
            href="/settings"
            className="flex h-[44px] w-[200px] items-center gap-3 rounded-lg px-3 text-[16px] text-muted-foreground hover:bg-muted/40 hover:text-foreground transition-colors"
          >
            <SettingsIcon className="size-[18px] text-muted-foreground" />
            <span>Settings</span>
          </LinkComp>
          <LinkComp
            href="/help"
            className="flex h-[44px] w-[200px] items-center gap-3 rounded-lg px-3 text-[16px] text-muted-foreground hover:bg-muted/40 hover:text-foreground transition-colors"
          >
            <HelpCircle className="size-[18px] text-muted-foreground" />
            <span>Help & docs</span>
          </LinkComp>
        </div>

        {/* Operational System Status */}
        {systemStatus && (
          <div className="flex flex-col gap-0.5 px-3 py-1">
            <div className="flex items-center gap-2">
              <span
                className={cn(
                  "size-1.5 rounded-full",
                  systemStatus.isOperational ? "bg-emerald-500" : "bg-amber-500"
                )}
                aria-hidden="true"
              />
              <span className="text-[11px] font-medium text-foreground">
                {systemStatus.label}
              </span>
            </div>
            <span className="text-[10px] text-muted-foreground/80 pl-3.5">
              {systemStatus.version}
            </span>
          </div>
        )}

        {/* User Profile Card */}
        {user && (
          <div className="flex h-[46px] w-[200px] mx-auto items-center justify-between rounded-lg border border-border/40 bg-card/40 p-2">
            <div className="flex items-center gap-2">
              <Avatar className="size-6">
                {user.avatarUrl && <AvatarImage src={user.avatarUrl} alt={user.name} />}
                <AvatarFallback className="text-[10px] bg-muted font-medium">
                  {user.initials}
                </AvatarFallback>
              </Avatar>
              <div className="flex flex-col min-w-0">
                <span className="text-xs font-medium text-foreground leading-tight truncate max-w-[110px]">
                  {user.name}
                </span>
                <span className="text-[10px] text-muted-foreground leading-tight truncate max-w-[110px]">
                  {user.role}
                </span>
              </div>
            </div>

            {onLogout && (
              <button
                type="button"
                onClick={onLogout}
                className="rounded p-1 text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
                title="Log out"
                aria-label="Log out"
              >
                <LogOut className="size-3.5" />
              </button>
            )}
          </div>
        )}
      </div>
    </aside>
  )
}
