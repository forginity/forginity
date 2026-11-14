"use client"

import * as React from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  ArrowUpRight,
  Boxes,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Compass,
  Download,
  ListFilter,
  Package,
  Pencil,
  Plus,
  Radio,
  Search,
  ShieldCheck,
  Trash2,
  Workflow,
} from "lucide-react"
import { AppShell } from "@workspace/ui/components/app-shell"
import { DashboardHeader } from "@workspace/ui/components/dashboard-header"
import { MetricCard } from "@workspace/ui/components/metric-card"
import { Button } from "@workspace/ui/components/button"
import { Card } from "@workspace/ui/components/card"
import { Input } from "@workspace/ui/components/input"
import { Skeleton } from "@workspace/ui/components/skeleton"
import {
  ADMIN_NAV_SECTIONS,
  ADMIN_USER_PROFILE,
} from "@/constants/admin-nav.constants"
import { useProducts } from "@forginity/sdk/modules/products/products.hooks"
import type { Product } from "@forginity/sdk/modules/products/products.types"
import { QueryErrorState } from "@/components/query-error-state"
import { ProductTableSkeleton } from "./product-table-skeleton"
import { ProductTableEmptyState } from "./product-table-empty-state"

function getProductIcon(slug: string): React.ElementType {
  const normalized = slug.toLowerCase()
  if (normalized.includes("flow")) return Workflow
  if (normalized.includes("piky") || normalized.includes("track") || normalized.includes("ride")) return Package
  if (normalized.includes("atlas")) return Compass
  if (normalized.includes("relay")) return Radio
  if (normalized.includes("vault")) return ShieldCheck
  return Boxes
}

export default function ProductsPage() {
  const pathname = usePathname()
  const [searchInput, setSearchInput] = React.useState("")
  const [debouncedSearch, setDebouncedSearch] = React.useState("")
  const [selectedIds, setSelectedIds] = React.useState<string[]>([])

  // 300ms Debounce to prevent query thrashing while typing
  React.useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(searchInput.trim())
    }, 300)
    return () => clearTimeout(handler)
  }, [searchInput])

  // Fetch live products via @forginity/sdk
  const { data, isLoading, isError, error, refetch } = useProducts({
    search: debouncedSearch || undefined,
  })

  const products: Product[] = data?.items || []

  // Dynamic KPI Metrics calculations
  const totalCount = data?.pagination.total ?? products.length
  const activeCount = products.filter((p) => p.status === "active").length
  const betaCount = products.filter((p) => p.status === "beta").length
  const deprecatedCount = products.filter((p) => p.status === "deprecated").length

  const toggleSelectAll = () => {
    if (selectedIds.length === products.length) {
      setSelectedIds([])
    } else {
      setSelectedIds(products.map((p) => p.id))
    }
  }

  const toggleSelectOne = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    )
  }

  const resetFilters = () => {
    setSearchInput("")
    setDebouncedSearch("")
  }

  return (
    <AppShell
      currentPath={pathname}
      breadcrumbs={[{ label: "Workspace" }, { label: "Product" }]}
      sections={ADMIN_NAV_SECTIONS}
      user={ADMIN_USER_PROFILE}
      linkComponent={Link}
    >
      {/* Page Heading & Actions - Responsive wrap */}
      <DashboardHeader
        title="Products"
        description="Monitor product metrics, downloads, and catalog releases."
        actions={
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 w-full sm:w-auto">
            <Button
              variant="secondary"
              size="sm"
              className="h-10 gap-2 rounded-full border border-[#3A3A3A] bg-[#141414] px-4 text-sm text-[#F6F6F6] hover:bg-[#292929] transition-colors"
            >
              <Download className="size-4" />
              <span>Download report</span>
            </Button>
            <Link href="/products/add">
              <Button
                size="sm"
                className="h-10 gap-2 rounded-full bg-gradient-coral px-5 text-sm font-medium text-[#090909] hover:opacity-90 transition-opacity cursor-pointer"
              >
                <Plus className="size-4 text-[#090909]" />
                <span>Add product</span>
              </Button>
            </Link>
          </div>
        }
      />

      {/* 4 KPI Metric Cards (Responsive Grid: 1-col mobile, 2-col tablet, 4-col desktop, 136px height) */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <MetricCard
          title="Total products"
          value={isLoading ? <Skeleton className="h-8 w-16 bg-[#222222]" /> : String(totalCount)}
          change={`${totalCount} total`}
          changeType="neutral"
          description={`${activeCount} live · ${betaCount} beta · ${deprecatedCount} deprecated`}
        />
        <MetricCard
          title="Live products"
          value={isLoading ? <Skeleton className="h-8 w-16 bg-[#222222]" /> : String(activeCount)}
          change="Catalog status"
          changeType="positive"
          description="Operational in production"
        />
        <MetricCard
          title="Beta tracks"
          value={isLoading ? <Skeleton className="h-8 w-16 bg-[#222222]" /> : String(betaCount)}
          change="Preview stage"
          changeType="neutral"
          description="Pre-release validation"
        />
        <MetricCard
          title="Deprecated"
          value={isLoading ? <Skeleton className="h-8 w-16 bg-[#222222]" /> : String(deprecatedCount)}
          change="Phase out"
          changeType={deprecatedCount > 0 ? "negative" : "neutral"}
          description="Legacy product records"
        />
      </div>

      {/* Product Portfolio Panel (Figma Node 261:7622) */}
      <Card
        variant="panel"
        className="flex flex-col overflow-hidden rounded-[16px] border border-[#292929] bg-[#141414]"
      >
        {/* Panel Heading */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-[#292929]/60">
          <h2 className="text-base font-normal text-[#F6F6F6]">Product portfolio</h2>
          <span className="text-xs font-light text-[#838383]">
            {isLoading ? "Fetching catalog..." : `${products.length} products listed`}
          </span>
        </div>

        {/* Portfolio Controls: Search & Filter Bar (Responsive vertical stack on mobile) */}
        <div className="flex flex-col gap-4 px-6 pt-4 pb-5 sm:flex-row sm:items-center sm:justify-between border-b border-[#292929]">
          <div className="flex items-center gap-2.5">
            <span className="text-sm font-normal text-[#F6F6F6]">All products</span>
            <span className="inline-flex h-5 items-center rounded-full bg-[#1F1F1F] px-2 text-xs font-light text-[#838383]">
              {isLoading ? "…" : totalCount}
            </span>
          </div>

          {/* Search & Filter Pill */}
          <div className="flex items-center gap-2.5 w-full sm:w-auto">
            <div className="relative flex-1 sm:w-64">
              <Search className="absolute left-3 top-2.5 size-3.5 text-[#838383]" />
              <Input
                variant="search"
                type="text"
                placeholder="Search products…"
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                className="pl-8 w-full"
              />
            </div>

            <button
              type="button"
              className="flex h-10 items-center gap-2 rounded-full border border-[#3A3A3A] bg-[#141414] px-4 text-sm text-[#F6F6F6] hover:bg-[#222222] transition-colors shrink-0"
            >
              <ListFilter className="size-4 text-[#F6F6F6]" />
              <span className="hidden sm:inline">Filters</span>
            </button>
          </div>
        </div>

        {/* Data Table Headings & Rows - Touch-friendly horizontal scroll container */}
        <div className="overflow-x-auto min-w-full">
          <div className="min-w-[920px]">
            <div className="flex h-[42px] items-center bg-[#0E0E0E] px-6 text-xs text-[#838383] font-normal border-b border-[#292929]">
              <div className="w-8 flex items-center">
                <input
                  type="checkbox"
                  checked={selectedIds.length === products.length && products.length > 0}
                  onChange={toggleSelectAll}
                  aria-label="Select all products"
                  disabled={isLoading || products.length === 0}
                  className="size-3.5 rounded-[3px] border border-[#3A3A3A] bg-transparent accent-[#FF6347] cursor-pointer"
                />
              </div>
              <div className="flex-1 min-w-[200px]">Product</div>
              <div className="w-[120px]">Slug</div>
              <div className="w-[140px]">Registered</div>
              <div className="w-[160px]">Status</div>
              <div className="w-[130px]">Lifecycle</div>
              <div className="w-[120px] text-right pr-2">Actions</div>
            </div>

            {/* Viewport Content: Loading Skeleton / Error State / Empty State / Live Rows */}
            {isLoading ? (
              <ProductTableSkeleton rowCount={2} />
            ) : isError ? (
              <div className="p-6">
                <QueryErrorState
                  error={error}
                  onRetry={() => refetch()}
                />
              </div>
            ) : products.length === 0 ? (
              <ProductTableEmptyState
                searchTerm={debouncedSearch}
                onResetFilters={resetFilters}
              />
            ) : (
              <div className="divide-y divide-[#292929]">
                {products.map((product) => {
                  const Icon = getProductIcon(product.slug)
                  const isSelected = selectedIds.includes(product.id)
                  const formattedDate = new Date(product.createdAt).toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                    year: "numeric",
                  })

                  return (
                    <div
                      key={product.id}
                      className="flex h-[70px] items-center px-6 transition-colors hover:bg-white/[0.02]"
                    >
                      {/* Checkbox */}
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
                          <Link
                            href={`/products/${product.id}`}
                            className="text-sm font-normal text-[#F6F6F6] hover:text-[#FF967F] transition-colors leading-tight truncate"
                          >
                            {product.name}
                          </Link>
                          <span className="text-xs font-light text-[#838383] leading-tight truncate">
                            /{product.slug}
                          </span>
                        </div>
                      </div>

                      {/* Slug identifier */}
                      <div className="w-[120px] text-xs font-mono text-[#838383] truncate">
                        {product.slug}
                      </div>

                      {/* Registered Date */}
                      <div className="w-[140px] text-xs font-light text-[#B9B9B9]">
                        {formattedDate}
                      </div>

                      {/* Status indicator bar */}
                      <div className="w-[160px] flex items-center gap-2.5">
                        <div className="h-1.5 w-[90px] rounded-[2px] bg-[#3A3A3A] overflow-hidden">
                          <div
                            className={`h-full rounded-[2px] ${
                              product.status === "active"
                                ? "bg-emerald-500 w-full"
                                : product.status === "beta"
                                ? "bg-amber-500 w-2/3"
                                : "bg-[#838383] w-1/3"
                            }`}
                          />
                        </div>
                        <span className="text-xs font-light text-[#838383] capitalize">
                          {product.status}
                        </span>
                      </div>

                      {/* Status Pill Badge */}
                      <div className="w-[130px]">
                        <div className="inline-flex h-[26px] items-center gap-1.5 rounded-full border border-[#292929] bg-[#1A1A1A] px-2.5 py-0.5 text-xs font-normal text-[#F6F6F6]">
                          <span
                            className={`size-[5px] rounded-full ${
                              product.status === "active"
                                ? "bg-emerald-500"
                                : product.status === "beta"
                                ? "bg-amber-500"
                                : "bg-[#838383]"
                            }`}
                          />
                          <span className="capitalize">
                            {product.status === "active" ? "Live" : product.status}
                          </span>
                        </div>
                      </div>

                      {/* Direct Row Actions (Edit, Delete, View) */}
                      <div className="w-[120px] flex items-center justify-end gap-1.5">
                        <Link
                          href={`/products/${product.id}/edit`}
                          className="flex size-8 items-center justify-center rounded-lg border border-transparent text-[#838383] hover:border-[#3A3A3A] hover:bg-[#1A1A1A] hover:text-[#F6F6F6] transition-colors"
                          title={`Edit ${product.name}`}
                          aria-label={`Edit ${product.name}`}
                        >
                          <Pencil className="size-3.5" />
                        </Link>
                        <Link
                          href={`/products/${product.id}/delete`}
                          className="flex size-8 items-center justify-center rounded-lg border border-transparent text-[#838383] hover:border-[#643333] hover:bg-[#201010] hover:text-[#E59B9B] transition-colors"
                          title={`Delete ${product.name}`}
                          aria-label={`Delete ${product.name}`}
                        >
                          <Trash2 className="size-3.5" />
                        </Link>
                        <Link
                          href={`/products/${product.id}`}
                          className="flex size-8 items-center justify-center rounded-lg border border-transparent text-[#838383] hover:border-[#3A3A3A] hover:bg-[#1A1A1A] hover:text-[#FF6347] transition-colors"
                          title={`View details for ${product.name}`}
                          aria-label={`View details for ${product.name}`}
                        >
                          <ArrowUpRight className="size-4" />
                        </Link>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        </div>

        {/* Table Pagination */}
        <div className="flex flex-col sm:flex-row h-auto sm:h-12 items-center justify-between gap-3 px-6 py-3 sm:py-0 border-t border-[#292929] text-xs text-[#838383]">
          <span>
            Showing 1–{products.length} of {totalCount} products
          </span>

          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1 cursor-pointer hover:text-[#F6F6F6]">
              Rows per page: {data?.pagination.limit ?? 20} <ChevronDown className="size-3" />
            </span>
            <span className="h-4 w-px bg-[#292929]" />
            <div className="flex items-center gap-2">
              <button
                type="button"
                className="p-1 hover:text-[#F6F6F6] disabled:opacity-30 cursor-pointer disabled:cursor-not-allowed"
                disabled
                aria-label="Previous page"
              >
                <ChevronLeft className="size-3.5" />
              </button>
              <span className="px-1 text-[#F6F6F6]">1</span>
              <button
                type="button"
                className="p-1 hover:text-[#F6F6F6] disabled:opacity-30 cursor-pointer disabled:cursor-not-allowed"
                disabled={!(data?.pagination.hasMore ?? false)}
                aria-label="Next page"
              >
                <ChevronRight className="size-3.5" />
              </button>
            </div>
          </div>
        </div>
      </Card>
    </AppShell>
  )
}
