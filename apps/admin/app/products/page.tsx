"use client"

import * as React from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  Boxes,
  Download,
  Edit2,
  Package,
  Plus,
  Radio,
  Search,
  Shield,
  Trash2,
  Users as UsersIcon,
  Workflow,
} from "lucide-react"
import { AppShell } from "@workspace/ui/components/app-shell"
import { DashboardHeader } from "@workspace/ui/components/dashboard-header"
import { MetricCard } from "@workspace/ui/components/metric-card"
import { Button } from "@workspace/ui/components/button"
import { Card } from "@workspace/ui/components/card"
import { Badge } from "@workspace/ui/components/badge"
import {
  ADMIN_NAV_SECTIONS,
  ADMIN_USER_PROFILE,
} from "@/constants/admin-nav.constants"

interface ProductRow {
  id: string
  name: string
  category: string
  owner: string
  release: string
  status: "Live" | "Maintenance" | "Draft"
  icon: React.ElementType
}

const PRODUCTS: ProductRow[] = [
  {
    id: "prod-flow",
    name: "Flow",
    category: "Workflow automation",
    owner: "Maya Chen",
    release: "v3.4.0",
    status: "Live",
    icon: Workflow,
  },
  {
    id: "prod-pikyrider",
    name: "PikyRider",
    category: "Rider experience platform",
    owner: "Noah Wilson",
    release: "v2.8.0",
    status: "Live",
    icon: Package,
  },
  {
    id: "prod-atlas",
    name: "Atlas",
    category: "Team knowledge workspace",
    owner: "Olivia Park",
    release: "v1.9.2",
    status: "Live",
    icon: Boxes,
  },
  {
    id: "prod-relay",
    name: "Relay",
    category: "Messaging infrastructure",
    owner: "Liam Patel",
    release: "v2.1.4",
    status: "Maintenance",
    icon: Radio,
  },
  {
    id: "prod-vault",
    name: "Vault",
    category: "Secure asset management",
    owner: "Emma Davis",
    release: "v1.6.0",
    status: "Live",
    icon: Shield,
  },
  {
    id: "prod-forms",
    name: "Forms",
    category: "Intelligent data collection",
    owner: "Maya Chen",
    release: "v0.4.0",
    status: "Draft",
    icon: Package,
  },
]

export default function ProductsPage() {
  const pathname = usePathname()
  const [searchTerm, setSearchTerm] = React.useState("")
  const [statusFilter, setStatusFilter] = React.useState<string>("All")

  const filteredProducts = PRODUCTS.filter((item) => {
    const matchesSearch =
      item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.owner.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.category.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus =
      statusFilter === "All" || item.status === statusFilter
    return matchesSearch && matchesStatus
  })

  return (
    <AppShell
      currentPath={pathname}
      breadcrumbs={[{ label: "Workspace" }, { label: "Product" }]}
      sections={ADMIN_NAV_SECTIONS}
      user={ADMIN_USER_PROFILE}
      linkComponent={Link}
    >
      <DashboardHeader
        title="Products"
        description="Monitor product metrics, downloads, and catalog releases."
        actions={
          <Button
            size="sm"
            className="h-8 gap-1.5 bg-[#f95738] text-white hover:bg-[#e0482b]"
          >
            <Plus className="size-4" />
            <span>Add product</span>
          </Button>
        }
      />

      {/* KPI Metric Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <MetricCard
          title="Total downloads"
          value="148,200"
          change="+14.2%"
          changeType="positive"
          description="Downloads across web & mobile packages"
        />
        <MetricCard
          title="Product active users"
          value="38,420"
          change="+12.8%"
          changeType="positive"
          description="Active across all live products"
        />
        <MetricCard
          title="Active products"
          value="4"
          change="6 total"
          changeType="neutral"
          description="4 live · 1 maintenance · 1 draft"
        />
        <MetricCard
          title="Avg uptime"
          value="99.98%"
          change="+0.05%"
          changeType="positive"
          description="30-day cross-service reliability"
        />
      </div>

      {/* Product Catalog Table */}
      <Card className="overflow-hidden rounded-xl border border-border/50 bg-card/60">
        <div className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between border-b border-border/40">
          <div>
            <h2 className="text-sm font-semibold text-foreground">Product catalog</h2>
            <p className="text-xs text-muted-foreground">
              {filteredProducts.length} products available
            </p>
          </div>

          <div className="flex items-center gap-2.5">
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 size-3.5 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search products..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="h-8 w-48 rounded-lg border border-border/50 bg-background/50 pl-8 pr-3 text-xs text-foreground placeholder:text-muted-foreground/60 focus:border-border focus:outline-none"
              />
            </div>

            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="h-8 rounded-lg border border-border/50 bg-background/50 px-2.5 text-xs text-foreground focus:border-border focus:outline-none"
              aria-label="Filter products by status"
            >
              <option value="All">All statuses</option>
              <option value="Live">Live</option>
              <option value="Maintenance">Maintenance</option>
              <option value="Draft">Draft</option>
            </select>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="border-b border-border/40 bg-muted/20 text-[11px] font-medium text-muted-foreground">
              <tr>
                <th className="py-3 px-4">Product</th>
                <th className="py-3 px-4">Owner</th>
                <th className="py-3 px-4">Release</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/30">
              {filteredProducts.map((product) => {
                const Icon = product.icon
                return (
                  <tr
                    key={product.id}
                    className="transition-colors hover:bg-muted/30"
                  >
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-3">
                        <div className="flex size-8 items-center justify-center rounded-lg border border-border/40 bg-muted/40 text-muted-foreground">
                          <Icon className="size-4" />
                        </div>
                        <div>
                          <span className="font-medium text-foreground">
                            {product.name}
                          </span>
                          <p className="text-[11px] text-muted-foreground">
                            {product.category}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-muted-foreground">
                      {product.owner}
                    </td>
                    <td className="py-3 px-4 font-mono text-[11px] text-muted-foreground">
                      {product.release}
                    </td>
                    <td className="py-3 px-4">
                      <Badge
                        variant="outline"
                        className={
                          product.status === "Live"
                            ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-400"
                            : product.status === "Maintenance"
                              ? "border-amber-500/30 bg-amber-500/10 text-amber-400"
                              : "border-muted-foreground/30 bg-muted/40 text-muted-foreground"
                        }
                      >
                        • {product.status}
                      </Badge>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <Button
                          variant="ghost"
                          size="xs"
                          className="h-7 gap-1 px-2 text-xs text-muted-foreground hover:text-foreground"
                        >
                          <Edit2 className="size-3" />
                          <span>Edit</span>
                        </Button>
                        <Button
                          variant="ghost"
                          size="xs"
                          className="h-7 px-2 text-xs text-muted-foreground hover:text-rose-400"
                        >
                          <Trash2 className="size-3" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>

        <div className="flex items-center justify-between border-t border-border/40 px-4 py-3 text-[11px] text-muted-foreground">
          <span>Showing {filteredProducts.length} of {PRODUCTS.length} products</span>
          <span>Rows per page: 10</span>
        </div>
      </Card>
    </AppShell>
  )
}
