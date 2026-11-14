"use client"

import * as React from "react"
import Link from "next/link"
import { AppShell } from "@workspace/ui/components/app-shell"
import { Skeleton } from "@workspace/ui/components/skeleton"
import {
  ADMIN_NAV_SECTIONS,
  ADMIN_USER_PROFILE,
} from "@/constants/admin-nav.constants"
import { ProductTableSkeleton } from "./product-table-skeleton"

/**
 * Next.js App Router instant streaming loading state for /products.
 * Immediately paints AppShell, KPI Metric skeletons, and Table skeleton.
 */
export default function ProductsLoading() {
  return (
    <AppShell
      currentPath="/products"
      breadcrumbs={[{ label: "Workspace" }, { label: "Product" }]}
      sections={ADMIN_NAV_SECTIONS}
      user={ADMIN_USER_PROFILE}
      linkComponent={Link}
    >
      <div className="flex flex-col gap-6 animate-pulse">
        {/* Page Heading & Actions Skeleton */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex flex-col gap-2">
            <Skeleton className="h-9 w-44 rounded-md bg-[#1A1A1A]" />
            <Skeleton className="h-4 w-72 rounded-md bg-[#1A1A1A]" />
          </div>
          <div className="flex items-center gap-3">
            <Skeleton className="h-10 w-36 rounded-full bg-[#1A1A1A]" />
            <Skeleton className="h-10 w-32 rounded-full bg-[#1A1A1A]" />
          </div>
        </div>

        {/* 4 Metric Cards Skeleton (Exact h-[136px], 1/2/4 grid) */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className="h-[136px] rounded-[16px] border border-[#292929] bg-[#141414] p-5 flex flex-col justify-between"
            >
              <Skeleton className="h-3.5 w-24 bg-[#222222]" />
              <Skeleton className="h-8 w-16 bg-[#222222]" />
              <div className="flex items-center justify-between">
                <Skeleton className="h-3 w-16 bg-[#1C1C1C]" />
                <Skeleton className="h-3 w-28 bg-[#1C1C1C]" />
              </div>
            </div>
          ))}
        </div>

        {/* Table Panel Skeleton */}
        <div className="rounded-[16px] border border-[#292929] bg-[#141414] overflow-hidden">
          <div className="flex items-center justify-between px-6 py-5 border-b border-[#292929]">
            <Skeleton className="h-5 w-28 bg-[#222222]" />
            <Skeleton className="h-4 w-20 bg-[#1C1C1C]" />
          </div>
          <div className="p-6 border-b border-[#292929]">
            <Skeleton className="h-11 w-full rounded-[8px] bg-[#0E0E0E]" />
          </div>
          <div className="overflow-x-auto min-w-full">
            <div className="min-w-[920px]">
              <div className="flex h-[42px] items-center bg-[#0E0E0E] px-6 text-xs text-[#838383] font-normal border-b border-[#292929]">
                <div className="w-8 flex items-center">
                  <Skeleton className="size-3.5 rounded-[3px] bg-[#222222]" />
                </div>
                <div className="flex-1 min-w-[200px]">Product</div>
                <div className="w-[120px]">Slug</div>
                <div className="w-[140px]">Registered</div>
                <div className="w-[160px]">Status</div>
                <div className="w-[130px]">Lifecycle</div>
                <div className="w-[120px] text-right pr-2">Actions</div>
              </div>
              <ProductTableSkeleton rowCount={2} />
            </div>
          </div>
        </div>
      </div>
    </AppShell>
  )
}
