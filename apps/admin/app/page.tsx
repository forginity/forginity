"use client"

import * as React from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Calendar, Download, Info } from "lucide-react"
import { AppShell } from "@workspace/ui/components/app-shell"
import { DashboardHeader } from "@workspace/ui/components/dashboard-header"
import { MetricCard } from "@workspace/ui/components/metric-card"
import { Button } from "@workspace/ui/components/button"
import { Card } from "@workspace/ui/components/card"
import {
  ADMIN_NAV_SECTIONS,
  ADMIN_USER_PROFILE,
} from "@/constants/admin-nav.constants"
import { WorkspacePulse } from "@/components/workspace-pulse"

export default function AdminHomePage() {
  const pathname = usePathname()

  return (
    <AppShell
      currentPath={pathname}
      breadcrumbs={[{ label: "Workspace" }, { label: "Home" }]}
      sections={ADMIN_NAV_SECTIONS}
      user={ADMIN_USER_PROFILE}
      linkComponent={Link}
    >
      {/* Page Header with Action Buttons */}
      <DashboardHeader
        title="Organization overview"
        description="A clear view of your users, products, and what needs attention."
        actions={
          <>
            <Button
              variant="outline"
              size="sm"
              className="h-8 gap-2 border-border/50 bg-card/60 text-xs text-muted-foreground hover:text-foreground"
            >
              <Calendar className="size-3.5" />
              <span>01 – 30 Oct 2026</span>
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="h-8 gap-2 border-border/50 bg-card/60 text-xs text-muted-foreground hover:text-foreground"
            >
              <Download className="size-3.5" />
              <span>Export report</span>
            </Button>
          </>
        }
      />

      {/* Top 4 KPI Metric Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <MetricCard
          title="Total users"
          value="48,260"
          change="+8.2%"
          changeType="positive"
          description="Unique users across all products"
        />
        <MetricCard
          title="Monthly active users"
          value="32,184"
          change="+12.8%"
          changeType="positive"
          description="Active in the last 30 days"
        />
        <MetricCard
          title="New users"
          value="3,680"
          change="+16.4%"
          changeType="positive"
          description="Joined during October"
        />
        <MetricCard
          title="Active user rate"
          value="66.7%"
          change="+2.7 pp"
          changeType="positive"
          description="Monthly active / total users"
        />
      </div>

      {/* Main Dashboard Section Overview */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Activity & Performance Canvas */}
        <Card className="rounded-xl border border-border/50 bg-card/60 p-5 lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-sm font-semibold text-foreground">User activity</h2>
              <p className="text-xs text-muted-foreground">
                Daily active user trajectories across products
              </p>
            </div>
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <span className="flex items-center gap-1.5">
                <span className="size-2 rounded-full bg-[#f95738]" />
                Current period
              </span>
            </div>
          </div>

          <div className="flex h-56 items-center justify-center rounded-lg border border-dashed border-border/40 bg-muted/20 text-xs text-muted-foreground">
            Activity telemetry and real-time event analytics
          </div>
        </Card>

        {/* Workspace Health & Queue */}
        <Card className="rounded-xl border border-border/50 bg-card/60 p-5 space-y-4">
          <div>
            <h2 className="text-sm font-semibold text-foreground">Workspace pulse</h2>
            <p className="text-xs text-muted-foreground">Latest operational updates</p>
          </div>

          <WorkspacePulse />
        </Card>
      </div>

      {/* Explanatory Notice */}
      <div className="flex items-center gap-2 text-[11px] text-muted-foreground/80">
        <Info className="size-3.5 shrink-0" />
        <span>
          Users are deduplicated by organization ID. Active users completed at least
          one meaningful action in the selected period.
        </span>
      </div>

      {/* Footer */}
      <div className="flex flex-col items-center justify-between gap-2 border-t border-border/30 pt-4 text-[11px] text-muted-foreground/70 sm:flex-row">
        <span>© 2026 Forginity</span>
        <span>Last synced 30 Oct 2026, 09:30 UTC</span>
      </div>
    </AppShell>
  )
}
