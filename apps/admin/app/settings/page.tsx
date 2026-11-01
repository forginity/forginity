"use client"

import * as React from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { AppShell } from "@workspace/ui/components/app-shell"
import { DashboardHeader } from "@workspace/ui/components/dashboard-header"
import { Card } from "@workspace/ui/components/card"
import {
  ADMIN_NAV_SECTIONS,
  ADMIN_USER_PROFILE,
} from "@/constants/admin-nav.constants"

export default function SettingsPage() {
  const pathname = usePathname()

  return (
    <AppShell
      currentPath={pathname}
      breadcrumbs={[{ label: "Workspace" }, { label: "Settings" }]}
      sections={ADMIN_NAV_SECTIONS}
      user={ADMIN_USER_PROFILE}
      linkComponent={Link}
    >
      <DashboardHeader
        title="Settings"
        description="Manage workspace preferences, access controls, and organization defaults."
      />

      <Card className="rounded-xl border border-border/50 bg-card/60 p-5 space-y-4">
        <h2 className="text-sm font-semibold text-foreground">Workspace settings</h2>
        <div className="flex h-64 items-center justify-center rounded-lg border border-dashed border-border/40 bg-muted/20 text-xs text-muted-foreground">
          Console configuration and security controls
        </div>
      </Card>
    </AppShell>
  )
}
