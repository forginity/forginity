"use client"

import * as React from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { AdminShell } from "@/components/admin-shell"
import { DashboardHeader } from "@workspace/ui/components/dashboard-header"
import { Card } from "@workspace/ui/components/card"

export default function HelpPage() {
  const pathname = usePathname()

  return (
    <AdminShell
      currentPath={pathname}
      breadcrumbs={[{ label: "Workspace" }, { label: "Help & documentation" }]}
    >
      <DashboardHeader
        title="Help & documentation"
        description="Guides, architectural specifications, and platform documentation."
      />

      <Card className="rounded-xl border border-border/50 bg-card/60 p-5 space-y-4">
        <h2 className="text-sm font-semibold text-foreground">Documentation portal</h2>
        <div className="flex h-64 items-center justify-center rounded-lg border border-dashed border-border/40 bg-muted/20 text-xs text-muted-foreground">
          Platform runbooks and API references
        </div>
      </Card>
    </AdminShell>
  )
}
