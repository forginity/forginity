import * as React from "react"
import { Card } from "@workspace/ui/components/card"
import { Skeleton } from "@workspace/ui/components/skeleton"

/**
 * MaintenancePanelSkeleton
 * Zero Content Layout Shift (CLS = 0.00) loading skeleton mirroring the exact geometry
 * of the MaintenancePanel component.
 */
export function MaintenancePanelSkeleton() {
  return (
    <Card
      variant="panel"
      className="flex flex-col overflow-hidden rounded-[16px] border border-[#292929] bg-[#141414]"
    >
      {/* Panel Heading Skeleton */}
      <div className="flex items-center justify-between p-6 border-b border-[#292929]">
        <div className="flex flex-col gap-2">
          <Skeleton className="h-5 w-44 rounded-md bg-white/5" />
          <Skeleton className="h-3.5 w-72 rounded-md bg-white/5" />
        </div>
        <Skeleton className="h-9 w-40 rounded-full bg-white/5" />
      </div>

      {/* Table Column Headings Skeleton */}
      <div className="bg-[#0E0E0E] h-10 px-6 flex items-center gap-6 border-b border-[#292929]">
        <Skeleton className="h-3.5 w-[200px] rounded-md bg-white/5" />
        <Skeleton className="h-3.5 w-[140px] rounded-md bg-white/5" />
        <Skeleton className="h-3.5 flex-1 rounded-md bg-white/5" />
        <Skeleton className="h-3.5 w-[80px] rounded-md bg-white/5" />
      </div>

      {/* Row Skeletons */}
      <div className="divide-y divide-[#292929]">
        {[1, 2].map((idx) => (
          <div
            key={idx}
            className="h-[74px] px-6 flex items-center gap-6"
          >
            <div className="w-[200px] shrink-0 flex flex-col gap-1.5">
              <Skeleton className="h-4 w-32 rounded-md bg-white/5" />
              <Skeleton className="h-3 w-24 rounded-md bg-white/5" />
            </div>
            <div className="w-[140px] shrink-0">
              <Skeleton className="h-6 w-20 rounded-full bg-white/5" />
            </div>
            <div className="flex-1 min-w-[200px] flex flex-col gap-1.5">
              <Skeleton className="h-3.5 w-4/5 rounded-md bg-white/5" />
            </div>
            <div className="w-[80px] shrink-0 flex justify-end">
              <Skeleton className="h-8 w-16 rounded-full bg-white/5" />
            </div>
          </div>
        ))}
      </div>

      {/* Table Footer Skeleton */}
      <div className="px-6 py-4 border-t border-[#292929]">
        <Skeleton className="h-3.5 w-36 rounded-md bg-white/5" />
      </div>
    </Card>
  )
}
