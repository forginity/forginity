"use client"

import * as React from "react"
import { Skeleton } from "@workspace/ui/components/skeleton"

export function ProductTableSkeleton({ rowCount = 5 }: { rowCount?: number }) {
  return (
    <div className="divide-y divide-[#292929]">
      {Array.from({ length: rowCount }).map((_, index) => (
        <div
          key={index}
          className="flex h-[70px] items-center px-6 transition-colors"
          data-slot="skeleton-row"
        >
          {/* Checkbox Skeleton */}
          <div className="w-8 flex items-center">
            <Skeleton className="size-3.5 rounded-[3px] bg-[#222222]" />
          </div>

          {/* Product Identity (Icon + Name + Slug) */}
          <div className="flex-1 min-w-[200px] flex items-center gap-3">
            <Skeleton className="size-9 rounded-[9px] bg-[#222222] shrink-0" />
            <div className="flex flex-col gap-1.5 min-w-0">
              <Skeleton className="h-4 w-28 bg-[#222222]" />
              <Skeleton className="h-3 w-20 bg-[#1C1C1C]" />
            </div>
          </div>

          {/* Total Users */}
          <div className="w-[120px]">
            <Skeleton className="h-4 w-14 bg-[#222222]" />
          </div>

          {/* Total Active Users */}
          <div className="w-[140px]">
            <Skeleton className="h-4 w-14 bg-[#222222]" />
          </div>

          {/* Active User Rate */}
          <div className="w-[160px] flex items-center gap-2.5">
            <Skeleton className="h-1.5 w-[90px] rounded-[2px] bg-[#222222]" />
            <Skeleton className="h-3 w-8 bg-[#1C1C1C]" />
          </div>

          {/* Status Badge */}
          <div className="w-[130px]">
            <Skeleton className="h-[26px] w-20 rounded-full bg-[#222222]" />
          </div>

          {/* Action Button */}
          <div className="w-10 flex justify-end">
            <Skeleton className="size-5 rounded bg-[#222222]" />
          </div>
        </div>
      ))}
    </div>
  )
}
