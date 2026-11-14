"use client"

import * as React from "react"
import { cn } from "@workspace/ui/lib/utils"
import type {
  NavSection,
  SystemStatus,
  UserProfile,
  WorkspaceInfo,
} from "@workspace/ui/types/navigation.types"
import { AppSidebar } from "@workspace/ui/components/app-sidebar"
import { AppHeader, type BreadcrumbSegment, type EnvironmentMode } from "@workspace/ui/components/app-header"
import { Sheet, SheetContent, SheetTitle } from "@workspace/ui/components/sheet"

export interface AppShellProps {
  children: React.ReactNode
  currentPath?: string
  breadcrumbs?: BreadcrumbSegment[]
  sections: NavSection[]
  user?: UserProfile
  workspace?: WorkspaceInfo
  systemStatus?: SystemStatus
  sublabel?: string
  linkComponent?: React.ElementType
  environment?: EnvironmentMode
  searchPlaceholder?: string
  onLogout?: () => void
  onWorkspaceSwitch?: () => void
  className?: string
}

export function AppShell({
  children,
  currentPath = "/",
  breadcrumbs,
  sections,
  user,
  workspace,
  systemStatus,
  sublabel,
  linkComponent,
  environment,
  searchPlaceholder,
  onLogout,
  onWorkspaceSwitch,
  className,
}: AppShellProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false)

  return (
    <div className={cn("flex h-screen max-h-screen w-full overflow-hidden bg-background font-sans", className)}>
      {/* Desktop Persistent Sidebar */}
      <div className="hidden md:flex shrink-0 h-screen">
        <AppSidebar
          currentPath={currentPath}
          sections={sections}
          user={user}
          workspace={workspace}
          systemStatus={systemStatus}
          sublabel={sublabel}
          linkComponent={linkComponent}
          onLogout={onLogout}
          onWorkspaceSwitch={onWorkspaceSwitch}
        />
      </div>

      {/* Mobile Slide-out Drawer */}
      <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
        <SheetContent side="left" showCloseButton={false} className="p-0 w-[236px] border-r border-border/40">
          <SheetTitle className="sr-only">Navigation Menu</SheetTitle>
          <AppSidebar
            currentPath={currentPath}
            sections={sections}
            user={user}
            workspace={workspace}
            systemStatus={systemStatus}
            sublabel={sublabel}
            linkComponent={linkComponent}
            onLogout={onLogout}
            onWorkspaceSwitch={onWorkspaceSwitch}
            onClose={() => setMobileMenuOpen(false)}
            className="w-full border-r-0"
          />
        </SheetContent>
      </Sheet>

      {/* Right Content Area (Header + Main Dashboard Canvas) */}
      <div className="flex flex-1 flex-col h-screen max-h-screen min-w-0 overflow-hidden">
        <AppHeader
          breadcrumbs={breadcrumbs}
          environment={environment}
          onMenuToggle={() => setMobileMenuOpen(true)}
          linkComponent={linkComponent}
          className="shrink-0"
        />

        <main className="flex-1 overflow-y-auto px-6 py-6 md:px-8 md:py-7">
          <div className="mx-auto max-w-7xl space-y-6 pb-12">{children}</div>
        </main>
      </div>
    </div>
  )
}
