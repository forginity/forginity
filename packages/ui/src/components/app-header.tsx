"use client"

import * as React from "react"
import { Bell, Menu } from "lucide-react"
import { cn } from "@workspace/ui/lib/utils"
import { DEFAULT_ENVIRONMENT } from "@workspace/ui/constants/brand.constants"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@workspace/ui/components/breadcrumb"

export interface BreadcrumbSegment {
  label: string
  href?: string
}

export type EnvironmentMode =
  | "dev"
  | "developer"
  | "development"
  | "eve"
  | "staging"
  | "production"
  | (string & {})

export interface AppHeaderProps extends React.HTMLAttributes<HTMLElement> {
  breadcrumbs?: BreadcrumbSegment[]
  environment?: EnvironmentMode
  searchPlaceholder?: string
  onSearchClick?: () => void
  onMenuToggle?: () => void
  hasNotifications?: boolean
  linkComponent?: React.ElementType
}

function getEnvironmentConfig(env?: string) {
  const normalized = (env || "production").toLowerCase().trim()

  if (normalized === "production" || normalized === "prod") {
    return {
      label: "Production",
      dotClass: "bg-emerald-500",
      badgeClass: "border-emerald-500/30 bg-emerald-500/10 text-emerald-400",
    }
  }

  if (normalized === "staging" || normalized === "stage") {
    return {
      label: "Staging",
      dotClass: "bg-amber-500",
      badgeClass: "border-amber-500/30 bg-amber-500/10 text-amber-400",
    }
  }

  if (
    normalized === "dev" ||
    normalized === "developer" ||
    normalized === "development" ||
    normalized === "eve" ||
    normalized === "local"
  ) {
    return {
      label: normalized === "eve" ? "Eve" : "Developer",
      dotClass: "bg-sky-400",
      badgeClass: "border-sky-500/30 bg-sky-500/10 text-sky-400",
    }
  }

  return {
    label: env || "Production",
    dotClass: "bg-emerald-500",
    badgeClass: "border-border/40 bg-card/60 text-muted-foreground",
  }
}

export function AppHeader({
  breadcrumbs = [{ label: "Workspace" }, { label: "Home" }],
  environment = DEFAULT_ENVIRONMENT,
  searchPlaceholder: _searchPlaceholder,
  onSearchClick: _onSearchClick,
  onMenuToggle,
  hasNotifications = false,
  linkComponent: LinkComp = "a",
  className,
  ...props
}: AppHeaderProps) {
  const envConfig = getEnvironmentConfig(environment)

  return (
    <header
      className={cn(
        "flex h-14 w-full items-center justify-between border-b border-border/40 bg-background/95 px-4 sm:px-6 backdrop-blur supports-[backdrop-filter]:bg-background/60 min-w-0 shrink-0",
        className
      )}
      {...props}
    >
      {/* Left: Mobile Trigger & Responsive Breadcrumbs */}
      <div className="flex items-center gap-2 sm:gap-3.5 min-w-0 flex-1">
        {onMenuToggle && (
          <button
            type="button"
            onClick={onMenuToggle}
            className="flex items-center justify-center rounded-md p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground md:hidden shrink-0"
            aria-label="Toggle navigation menu"
          >
            <Menu className="size-4" />
          </button>
        )}

        <Breadcrumb className="min-w-0 overflow-hidden">
          <BreadcrumbList className="text-xs flex-nowrap overflow-hidden">
            {breadcrumbs.map((segment, index) => {
              const isLast = index === breadcrumbs.length - 1
              return (
                <React.Fragment key={`${segment.label}-${index}`}>
                  <BreadcrumbItem className="min-w-0 shrink truncate">
                    {isLast || !segment.href ? (
                      <BreadcrumbPage className="font-normal text-foreground truncate max-w-[120px] sm:max-w-none">
                        {segment.label}
                      </BreadcrumbPage>
                    ) : (
                      <BreadcrumbLink
                        href={segment.href}
                        render={
                          LinkComp !== "a" ? (
                            <LinkComp href={segment.href!} />
                          ) : undefined
                        }
                        className="text-muted-foreground hover:text-foreground transition-colors truncate max-w-[90px] sm:max-w-none"
                      >
                        {segment.label}
                      </BreadcrumbLink>
                    )}
                  </BreadcrumbItem>
                  {!isLast && <BreadcrumbSeparator className="text-muted-foreground/40 shrink-0" />}
                </React.Fragment>
              )
            })}
          </BreadcrumbList>
        </Breadcrumb>
      </div>

      {/* Right: Notifications & Dynamic Environment Badge */}
      <div className="flex items-center gap-2 sm:gap-3 shrink-0">
        {/* Notifications Icon */}
        <button
          type="button"
          className="relative flex size-8 items-center justify-center rounded-lg border border-border/40 bg-card/40 text-muted-foreground hover:bg-muted hover:text-foreground transition-colors shrink-0"
          aria-label="Notifications"
        >
          <Bell className="size-3.5" />
          {hasNotifications && (
            <span className="absolute top-1.5 right-1.5 size-1.5 rounded-full bg-[#FF6347]" />
          )}
        </button>

        {/* Dynamic Environment Badge Pill */}
        {envConfig && (
          <div
            className={cn(
              "flex h-7 items-center gap-1.5 rounded-full border px-2.5 text-[11px] font-medium transition-colors shrink-0",
              envConfig.badgeClass
            )}
          >
            <span className={cn("size-1.5 rounded-full", envConfig.dotClass)} aria-hidden="true" />
            <span>{envConfig.label}</span>
          </div>
        )}
      </div>
    </header>
  )
}
