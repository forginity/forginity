import * as React from "react"
import { Skeleton } from "@workspace/ui/components/skeleton"

/**
 * High-fidelity View Product skeleton matching Figma Node 283:3630 with CLS = 0.00.
 * Layout, paddings, and column widths strictly match the live resolved view.
 */
export function ViewProductSkeleton() {
  return (
    <div className="flex flex-col gap-6 animate-pulse" data-slot="view-product-skeleton">
      {/* Page Heading & Action Button Skeleton */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex flex-col gap-1">
          <Skeleton className="h-9 w-48 rounded-md bg-[#1A1A1A]" />
          <Skeleton className="h-5 w-80 max-w-full rounded-md bg-[#1A1A1A]" />
        </div>
        <Skeleton className="h-10 w-32 rounded-full bg-[#1A1A1A] shrink-0" />
      </div>

      {/* Product Overview Cards Skeleton */}
      <div className="flex flex-col lg:flex-row gap-6 items-stretch">
        {/* Product Details Card Skeleton (Exact geometry as live Card) */}
        <div className="flex-1 rounded-[16px] border border-[#292929] bg-[#141414] p-6 flex flex-col justify-between gap-6">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-normal text-[#F6F6F6]">Product details</h2>
            <div className="flex items-center gap-2.5">
              <span className="text-xs text-[#838383]">Product status</span>
              <Skeleton className="h-[26px] w-18 rounded-full bg-[#222222]" />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            <div className="flex flex-col gap-2">
              <span className="text-xs text-[#838383]">Product name</span>
              <Skeleton className="h-5 w-28 bg-[#222222]" />
            </div>
            <div className="flex flex-col gap-2">
              <span className="text-xs text-[#838383]">Slug</span>
              <Skeleton className="h-5 w-24 bg-[#222222]" />
            </div>
            <div className="flex flex-col gap-2">
              <span className="text-xs text-[#838383]">Created on</span>
              <Skeleton className="h-5 w-24 bg-[#222222]" />
            </div>
          </div>

          <p className="text-xs font-light text-[#838383]">
            Product status describes the product lifecycle, independently of its versions.
          </p>
        </div>

        {/* Latest Version Card Skeleton */}
        <div className="w-full lg:w-[300px] shrink-0 rounded-[16px] border border-[#292929] bg-[#141414] p-6 flex flex-col justify-between gap-4">
          <span className="text-xs text-[#838383]">Latest version</span>

          <div className="flex items-center justify-between gap-3">
            <Skeleton className="h-7 w-20 bg-[#222222]" />
            <Skeleton className="h-[26px] w-16 rounded-full bg-[#222222]" />
          </div>

          <Skeleton className="h-4 w-44 bg-[#1C1C1C]" />
        </div>
      </div>

      {/* Product Versions Table Skeleton */}
      <div className="flex flex-col overflow-hidden rounded-[16px] border border-[#292929] bg-[#141414]">
        <div className="flex items-center justify-between p-6 border-b border-[#292929]">
          <div className="flex flex-col gap-1">
            <h2 className="text-base font-normal text-[#F6F6F6]">Versions</h2>
            <Skeleton className="h-4 w-64 bg-[#1C1C1C]" />
          </div>
          <Skeleton className="h-4 w-16 bg-[#1C1C1C]" />
        </div>

        <div className="bg-[#0E0E0E] h-10 px-6 flex items-center gap-6 border-b border-[#292929] text-xs text-[#838383] font-normal">
          <span className="w-[220px] shrink-0">Version</span>
          <span className="w-[220px] shrink-0">Version status</span>
          <span className="flex-1 min-w-[200px]">Release availability</span>
        </div>

        <div className="divide-y divide-[#292929]">
          {[1, 2].map((i) => (
            <div key={i} className="h-[70px] px-6 flex items-center gap-6">
              <div className="w-[220px] shrink-0 flex items-center gap-2.5">
                <Skeleton className="size-4 rounded bg-[#222222]" />
                <Skeleton className="h-4 w-16 bg-[#222222]" />
              </div>
              <div className="w-[220px] shrink-0 flex items-center">
                <Skeleton className="h-[26px] w-18 rounded-full bg-[#222222]" />
              </div>
              <div className="flex-1 min-w-[200px]">
                <Skeleton className="h-4 w-48 bg-[#222222]" />
              </div>
            </div>
          ))}
        </div>

        <div className="px-6 py-4 border-t border-[#292929]">
          <Skeleton className="h-4 w-36 bg-[#1C1C1C]" />
        </div>
      </div>
    </div>
  )
}
