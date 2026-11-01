"use client"

import * as React from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  ArrowUpRight,
  Boxes,
  ChartNoAxesCombined,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Compass,
  Download,
  ListFilter,
  Package,
  Plus,
  Radio,
  Search,
  ShieldCheck,
  Workflow,
} from "lucide-react"
import { AppShell } from "@workspace/ui/components/app-shell"
import { DashboardHeader } from "@workspace/ui/components/dashboard-header"
import { MetricCard } from "@workspace/ui/components/metric-card"
import { Button } from "@workspace/ui/components/button"
import { Card } from "@workspace/ui/components/card"
import { Input } from "@workspace/ui/components/input"
import {
  ADMIN_NAV_SECTIONS,
  ADMIN_USER_PROFILE,
} from "@/constants/admin-nav.constants"

interface ProductItem {
  id: string
  name: string
  category: string
  totalUsers: string
  activeUsers: string
  ratePercent: number
  status: "Live" | "Maintenance" | "Draft"
  icon: React.ElementType
}

const PRODUCTS_DATA: ProductItem[] = [
  {
    id: "prod-flow",
    name: "Flow",
    category: "Workflow automation",
    totalUsers: "18,420",
    activeUsers: "13,260",
    ratePercent: 72,
    status: "Live",
    icon: Workflow,
  },
  {
    id: "prod-pikyrider",
    name: "PikyRider",
    category: "Rider experience platform",
    totalUsers: "24,180",
    activeUsers: "16,800",
    ratePercent: 69.5,
    status: "Live",
    icon: Package,
  },
  {
    id: "prod-atlas",
    name: "Atlas",
    category: "Team knowledge workspace",
    totalUsers: "12,850",
    activeUsers: "8,340",
    ratePercent: 64.9,
    status: "Live",
    icon: Compass,
  },
  {
    id: "prod-relay",
    name: "Relay",
    category: "Messaging infrastructure",
    totalUsers: "6,420",
    activeUsers: "4,040",
    ratePercent: 62.9,
    status: "Maintenance",
    icon: Radio,
  },
  {
    id: "prod-vault",
    name: "Vault",
    category: "Secure asset management",
    totalUsers: "4,910",
    activeUsers: "1,980",
    ratePercent: 40.3,
    status: "Live",
    icon: ShieldCheck,
  },
  {
    id: "prod-forms",
    name: "Forms",
    category: "Intelligent data collection",
    totalUsers: "1,640",
    activeUsers: "—",
    ratePercent: 0,
    status: "Draft",
    icon: Boxes,
  },
]

const TABS = [
  { id: "all", label: "All products", count: 6 },
  { id: "live", label: "Live", count: 4 },
  { id: "maintenance", label: "Maintenance", count: 1 },
  { id: "draft", label: "Draft", count: 1 },
]

export default function ProductsPage() {
  const pathname = usePathname()
  const [activeTab, setActiveTab] = React.useState("all")
  const [searchTerm, setSearchTerm] = React.useState("")
  const [selectedIds, setSelectedIds] = React.useState<string[]>([])

  const filteredProducts = PRODUCTS_DATA.filter((item) => {
    const matchesSearch =
      item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.category.toLowerCase().includes(searchTerm.toLowerCase())
    if (!matchesSearch) return false

    if (activeTab === "live") return item.status === "Live"
    if (activeTab === "maintenance") return item.status === "Maintenance"
    if (activeTab === "draft") return item.status === "Draft"
    return true
  })

  const toggleSelectAll = () => {
    if (selectedIds.length === filteredProducts.length) {
      setSelectedIds([])
    } else {
      setSelectedIds(filteredProducts.map((p) => p.id))
    }
  }

  const toggleSelectOne = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    )
  }

  return (
    <AppShell
      currentPath={pathname}
      breadcrumbs={[{ label: "Workspace" }, { label: "Products" }]}
      sections={ADMIN_NAV_SECTIONS}
      user={ADMIN_USER_PROFILE}
      linkComponent={Link}
    >
      {/* Page Heading & Actions */}
      <DashboardHeader
        title="Products"
        description="Monitor product metrics, downloads, and catalog releases."
        actions={
          <>
            <Button
              variant="secondary"
              size="sm"
              className="h-10 gap-2 rounded-full border border-[#3A3A3A] bg-[#141414] px-4 text-sm text-[#F6F6F6] hover:bg-[#292929]"
            >
              <Download className="size-4" />
              <span>Download report</span>
            </Button>
            <Button
              size="sm"
              className="h-10 gap-2 rounded-full bg-gradient-coral px-5 text-sm font-medium text-[#090909]"
            >
              <Plus className="size-4 text-[#090909]" />
              <span>Add product</span>
            </Button>
          </>
        }
      />

      {/* 4 KPI Metric Cards (136px height) */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <MetricCard
          title="Total products"
          value="6"
          change="6 total"
          changeType="neutral"
          description="4 live · 1 maintenance · 1 draft"
        />
        <MetricCard
          title="Total users"
          value="68,420"
          change="+12.4%"
          changeType="positive"
          description="Active accounts across 6 products"
        />
        <MetricCard
          title="Total active users"
          value="48,150"
          change="+8.2%"
          changeType="positive"
          description="30-day active user count"
        />
        <MetricCard
          title="Active user rate"
          value="70.4%"
          change="+3.1%"
          changeType="positive"
          description="Cross-product daily active ratio"
        />
      </div>

      {/* Product Portfolio Panel (Figma Node 261:7622) */}
      <Card variant="panel" className="flex flex-col overflow-hidden rounded-[16px] border border-[#292929] bg-[#141414]">
        {/* Panel Heading */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-[#292929]/60">
          <h2 className="text-base font-normal text-[#F6F6F6]">Product portfolio</h2>
          <span className="text-xs font-light text-[#838383]">Usage for 01–30 Oct 2026</span>
        </div>

        {/* Portfolio Controls: Tabs & Filter Bar */}
        <div className="flex flex-col gap-4 px-6 pt-4 pb-5 sm:flex-row sm:items-center sm:justify-between border-b border-[#292929]">
          {/* Tabs */}
          <div className="flex items-center gap-6 overflow-x-auto">
            {TABS.map((tab) => {
              const isActive = activeTab === tab.id
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveTab(tab.id)}
                  className="group relative pb-2 text-sm transition-colors whitespace-nowrap"
                >
                  <span
                    className={
                      isActive
                        ? "font-normal text-[#FF967F]"
                        : "text-[#838383] group-hover:text-[#F6F6F6]"
                    }
                  >
                    {tab.label} <span className="ml-1 text-xs opacity-80">{tab.count}</span>
                  </span>
                  {isActive && (
                    <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-[#FF6347]" />
                  )}
                </button>
              )
            })}
          </div>

          {/* Search & Filter Pill */}
          <div className="flex items-center gap-2.5">
            <div className="relative w-56">
              <Search className="absolute left-3 top-2.5 size-3.5 text-[#838383]" />
              <Input
                variant="search"
                type="text"
                placeholder="Search products…"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-8"
              />
            </div>

            <button
              type="button"
              className="flex h-10 items-center gap-2 rounded-full border border-[#3A3A3A] bg-[#141414] px-4 text-sm text-[#F6F6F6] hover:bg-[#222222] transition-colors"
            >
              <ListFilter className="size-4 text-[#F6F6F6]" />
              <span>Filters</span>
            </button>
          </div>
        </div>

        {/* Data Table Headings */}
        <div className="overflow-x-auto">
          <div className="min-w-[850px]">
            <div className="flex h-[42px] items-center bg-[#0E0E0E] px-6 text-xs text-[#838383] font-normal border-b border-[#292929]">
              <div className="w-8 flex items-center">
                <input
                  type="checkbox"
                  checked={selectedIds.length === filteredProducts.length && filteredProducts.length > 0}
                  onChange={toggleSelectAll}
                  aria-label="Select all products"
                  className="size-3.5 rounded-[3px] border border-[#3A3A3A] bg-transparent accent-[#FF6347] cursor-pointer"
                />
              </div>
              <div className="flex-1 min-w-[200px]">Product</div>
              <div className="w-[120px]">Total users ↓</div>
              <div className="w-[140px]">Total active users</div>
              <div className="w-[160px]">Active user rate</div>
              <div className="w-[130px]">Status</div>
              <div className="w-10 text-right"></div>
            </div>

            {/* Table Rows (70px height) */}
            <div className="divide-y divide-[#292929]">
              {filteredProducts.map((product) => {
                const Icon = product.icon
                const isSelected = selectedIds.includes(product.id)
                return (
                  <div
                    key={product.id}
                    className="flex h-[70px] items-center px-6 transition-colors hover:bg-white/[0.02]"
                  >
                    <div className="w-8 flex items-center">
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => toggleSelectOne(product.id)}
                        aria-label={`Select product ${product.name}`}
                        className="size-3.5 rounded-[3px] border border-[#3A3A3A] bg-transparent accent-[#FF6347] cursor-pointer"
                      />
                    </div>

                    {/* Product Identity */}
                    <div className="flex-1 min-w-[200px] flex items-center gap-3">
                      <div className="flex size-9 items-center justify-center rounded-[9px] border border-[#292929] bg-[#1A1A1A] text-[#F6F6F6] shrink-0">
                        <Icon className="size-4.5 text-[#F6F6F6]" />
                      </div>
                      <div className="flex flex-col min-w-0">
                        <span className="text-sm font-normal text-[#F6F6F6] leading-tight">
                          {product.name}
                        </span>
                        <span className="text-xs font-light text-[#838383] leading-tight">
                          {product.category}
                        </span>
                      </div>
                    </div>

                    {/* Total Users */}
                    <div className="w-[120px] text-sm font-normal text-[#F6F6F6]">
                      {product.totalUsers}
                    </div>

                    {/* Total Active Users */}
                    <div className="w-[140px] text-sm font-normal text-[#F6F6F6]">
                      {product.activeUsers}
                    </div>

                    {/* Active User Rate */}
                    <div className="w-[160px] flex items-center gap-2.5">
                      {product.ratePercent > 0 ? (
                        <>
                          <div className="h-1 w-[90px] rounded-[2px] bg-[#3A3A3A] overflow-hidden">
                            <div
                              className="h-full rounded-[2px] bg-[#FF6347]"
                              style={{ width: `${product.ratePercent}%` }}
                            />
                          </div>
                          <span className="text-xs font-normal text-[#B9B9B9]">
                            {product.ratePercent}%
                          </span>
                        </>
                      ) : (
                        <span className="text-xs text-[#838383]">—</span>
                      )}
                    </div>

                    {/* Status Pill */}
                    <div className="w-[130px]">
                      <div className="inline-flex h-[26px] items-center gap-1.5 rounded-full border border-[#292929] bg-[#1A1A1A] px-2.5 py-0.5 text-xs font-normal text-[#F6F6F6]">
                        <span
                          className={`size-[5px] rounded-full ${
                            product.status === "Live"
                              ? "bg-emerald-500"
                              : product.status === "Maintenance"
                              ? "bg-amber-500"
                              : "bg-[#838383]"
                          }`}
                        />
                        <span>{product.status}</span>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="w-10 flex justify-end">
                      <button
                        type="button"
                        className="rounded p-1 text-[#838383] hover:text-[#FF6347] transition-colors"
                        title="View product details"
                        aria-label="View product details"
                      >
                        <ArrowUpRight className="size-4.5" />
                      </button>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </div>

        {/* Table Pagination */}
        <div className="flex h-12 items-center justify-between px-6 border-t border-[#292929] text-xs text-[#838383]">
          <span>
            Showing 1–{filteredProducts.length} of {PRODUCTS_DATA.length} products
          </span>

          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1 cursor-pointer hover:text-[#F6F6F6]">
              Rows per page: 10 <ChevronDown className="size-3" />
            </span>
            <span className="h-4 w-px bg-[#292929]" />
            <div className="flex items-center gap-2">
              <button
                type="button"
                className="p-1 hover:text-[#F6F6F6] disabled:opacity-30"
                disabled
                aria-label="Previous page"
              >
                <ChevronLeft className="size-3.5" />
              </button>
              <span className="px-1 text-[#F6F6F6]">1</span>
              <button
                type="button"
                className="p-1 hover:text-[#F6F6F6] disabled:opacity-30"
                disabled
                aria-label="Next page"
              >
                <ChevronRight className="size-3.5" />
              </button>
            </div>
          </div>
        </div>
      </Card>

      {/* Portfolio Insight Callout Card (Figma Node 261:7783) */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-[16px] border border-[#292929] bg-[#141414] p-5">
        <div className="flex items-center gap-4">
          <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-[#FF6347]/10 text-[#FF6347]">
            <ChartNoAxesCombined className="size-5" />
          </div>
          <div className="flex flex-col">
            <h3 className="text-sm font-normal text-[#F6F6F6]">
              Cross-product synergy insight
            </h3>
            <p className="text-xs font-light text-[#838383]">
              Users active across both Flow and PikyRider exhibit a 34% higher retention rate over 90 days.
            </p>
          </div>
        </div>

        <Link
          href="/products/insights"
          className="text-sm font-normal text-[#FF967F] hover:underline shrink-0"
        >
          View synergy report →
        </Link>
      </div>
    </AppShell>
  )
}
