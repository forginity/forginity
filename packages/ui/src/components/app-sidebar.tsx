"use client"

import * as React from "react"
import {
  ChevronDown,
  HelpCircle,
  LogOut,
  Settings as SettingsIcon,
  X,
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
  onClose?: () => void
}

function renderNavIcon(icon: NavItem["icon"], active: boolean) {
  if (!icon) return null
  if (React.isValidElement(icon)) return icon
  const IconComponent = icon as React.ComponentType<{ className?: string }>
  return (
    <IconComponent
      className={cn(
        "size-[18px] shrink-0 transition-colors",
        active ? "text-[#FF6347]" : "text-[#838383] group-hover:text-[#F6F6F6]"
      )}
    />
  )
}

export function AppSidebar({
  currentPath = "/",
  sections,
  user,
  workspace,
  systemStatus = DEFAULT_SYSTEM_STATUS,
  sublabel = ORG_ADMIN_LABEL,
  linkComponent: LinkComp = "a",
  onLogout,
  onWorkspaceSwitch,
  onClose,
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
        "flex h-screen w-[236px] flex-col justify-between border-r border-border/40 bg-[#0E0E0E] text-sidebar-foreground px-[8px] pt-[28px] pb-[20px] shrink-0 select-none",
        className
      )}
      {...props}
    >
      {/* Top Section: Logo & Navigation */}
      <div className="flex flex-col flex-1 min-h-0">
        {/* Brand Logo & Mobile Close Trigger */}
        <div className="flex items-start justify-between px-3">
          <BrandLogo width={120} height={32} sublabel={sublabel} />
          {onClose && (
            <button
              type="button"
              onClick={onClose}
              className="flex size-7 items-center justify-center rounded-md text-[#838383] hover:bg-white/[0.06] hover:text-[#F6F6F6] transition-colors"
              aria-label="Close navigation menu"
            >
              <X className="size-4" />
            </button>
          )}
        </div>

        {/* Main Navigation Scroll Area: mt-28px */}
        <div className="flex-1 overflow-y-auto mt-[28px] space-y-4 pr-0.5">
          {sections.map((section: NavSection) => (
            <div key={section.id} className="space-y-1">
              {/* WORKSPACE Label: 10px font size with margin-top 10px */}
              {section.label && (
                <h3 className="px-3 text-[10px] mt-[10px] mb-2 font-semibold tracking-wider uppercase text-muted-foreground/70">
                  {section.label}
                </h3>
              )}

              <nav className="space-y-1.5 flex flex-col w-full">
                {section.items.map((item: NavItem) => {
                  const active = isItemActive(item)
                  const hasChildren = item.items && item.items.length > 0
                  const isOpen = openItems[item.id] ?? false

                  if (hasChildren) {
                    return (
                      <div key={item.id} className="w-full flex flex-col space-y-1">
                        <button
                          type="button"
                          onClick={() => toggleItem(item.id)}
                          className={cn(
                            "group flex h-[44px] w-full items-center justify-between rounded-[8px] px-3 text-[14px] font-normal transition-colors",
                            active
                              ? "bg-[#FF6347]/[0.07] text-[#FF967F]"
                              : "text-[#B9B9B9] hover:bg-white/[0.04] hover:text-[#F6F6F6]"
                          )}
                        >
                          <div className="flex items-center gap-3">
                            {renderNavIcon(item.icon, active)}
                            <span>{item.title}</span>
                          </div>
                          <ChevronDown
                            className={cn(
                              "size-4 transition-transform duration-200",
                              active
                                ? "text-[#FF967F]"
                                : "text-[#838383] group-hover:text-[#B9B9B9]",
                              isOpen && "rotate-180"
                            )}
                          />
                        </button>

                        {isOpen && (
                          <div className="w-full pl-6 space-y-1">
                            {item.items?.map((subItem: NavItem) => {
                              const subActive = isItemActive(subItem)
                              return (
                                <LinkComp
                                  key={subItem.id}
                                  href={subItem.href}
                                  className={cn(
                                    "flex h-[38px] items-center gap-2 rounded-[8px] px-2.5 text-[14px] transition-colors",
                                    subActive
                                      ? "bg-[#FF6347]/[0.07] font-medium text-[#FF967F]"
                                      : "text-[#B9B9B9] hover:bg-white/[0.04] hover:text-[#F6F6F6]"
                                  )}
                                >
                                  <span>{subItem.title}</span>
                                  {subItem.badge && (
                                    <span className="ml-auto rounded bg-[#1A1A1A] px-1.5 py-0.5 text-[10px] text-[#838383]">
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
                        "group flex h-[44px] w-full items-center justify-between rounded-[8px] px-3 text-[14px] font-normal transition-colors",
                        active
                          ? "bg-[#FF6347]/[0.07] text-[#FF967F]"
                          : "text-[#B9B9B9] hover:bg-white/[0.04] hover:text-[#F6F6F6]"
                      )}
                    >
                      <div className="flex items-center gap-3">
                        {renderNavIcon(item.icon, active)}
                        <span>{item.title}</span>
                      </div>
                      {item.badge && (
                        <span
                          className={cn(
                            "rounded px-1.5 py-0.5 text-[10px] font-medium",
                            active
                              ? "bg-[#FF6347]/20 text-[#FF967F]"
                              : "bg-[#1A1A1A] text-[#838383]"
                          )}
                        >
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
      <div className="flex flex-col border-t border-border/40 pt-3 mt-2 shrink-0 w-full">
        {/* Secondary Links: 44px height, full width, 16px font, 18px icons, 8px radius */}
        <div className="flex flex-col space-y-1 w-full">
          <LinkComp
            href="/settings"
            className={cn(
              "group flex h-[44px] w-full items-center gap-3 rounded-[8px] px-3 text-[14px] font-normal transition-colors",
              currentPath === "/settings"
                ? "bg-[#FF6347]/[0.07] text-[#FF967F]"
                : "text-[#B9B9B9] hover:bg-white/[0.04] hover:text-[#F6F6F6]"
            )}
          >
            <SettingsIcon
              className={cn(
                "size-[18px] shrink-0 transition-colors",
                currentPath === "/settings"
                  ? "text-[#FF6347]"
                  : "text-[#838383] group-hover:text-[#F6F6F6]"
              )}
            />
            <span>Settings</span>
          </LinkComp>
          <LinkComp
            href="/help"
            className={cn(
              "group flex h-[44px] w-full items-center gap-3 rounded-[8px] px-3 text-[14px] font-normal transition-colors",
              currentPath === "/help"
                ? "bg-[#FF6347]/[0.07] text-[#FF967F]"
                : "text-[#B9B9B9] hover:bg-white/[0.04] hover:text-[#F6F6F6]"
            )}
          >
            <HelpCircle
              className={cn(
                "size-[18px] shrink-0 transition-colors",
                currentPath === "/help"
                  ? "text-[#FF6347]"
                  : "text-[#838383] group-hover:text-[#F6F6F6]"
              )}
            />
            <span>Help & docs</span>
          </LinkComp>
        </div>

        {/* Operational System Status */}
        {systemStatus && (
          <div className="flex flex-col gap-0.5 px-3 pt-2.5">
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

        {/* User Profile Card: Exact 24px spacing above it */}
        {user && (
          <div className="mt-[24px] flex h-[52px] w-full items-center justify-between rounded-[6px] border border-border/40 bg-[#141414] px-2.5 py-1.5">
            <div className="flex items-center gap-2.5 min-w-0">
              <Avatar className="size-[34px] shrink-0 rounded-full">
                {user.avatarUrl && <AvatarImage src={user.avatarUrl} alt={user.name} />}
                <AvatarFallback className="text-xs bg-[#1A1A1A] text-[#F6F6F6] font-medium">
                  {user.initials}
                </AvatarFallback>
              </Avatar>
              <div className="flex flex-col min-w-0">
                <span className="text-[16px] font-normal text-[#F6F6F6] leading-tight truncate">
                  {user.name}
                </span>
                <span className="text-[12px] font-light text-[#838383] leading-tight truncate">
                  {user.role}
                </span>
              </div>
            </div>

            {onLogout && (
              <button
                type="button"
                onClick={onLogout}
                className="rounded p-1 text-[#838383] hover:bg-[#1A1A1A] hover:text-[#F6F6F6] transition-colors shrink-0"
                title="Log out"
                aria-label="Log out"
              >
                <LogOut className="size-4" />
              </button>
            )}
          </div>
        )}
      </div>
    </aside>
  )
}
