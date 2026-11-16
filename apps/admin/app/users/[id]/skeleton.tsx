import * as React from "react"
import { Skeleton } from "@workspace/ui/components/skeleton"

/**
 * High-fidelity User Detail skeleton strictly matching Figma Node 309:404 with CLS = 0.00.
 * Container dimensions, paddings, and column widths mirror the resolved live page.
 */
export function UserDetailSkeleton() {
  return (
    <div className="space-y-6 animate-pulse" data-slot="user-detail-skeleton">
      {/* Top Navigation & Header Skeleton */}
      <div className="space-y-2">
        <Skeleton className="h-4 w-24 bg-[#191919] rounded" />
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-1">
          <div className="space-y-1.5">
            <Skeleton className="h-8 w-44 sm:w-56 bg-[#191919] rounded-md" />
            <Skeleton className="h-4 w-72 sm:w-96 bg-[#191919] rounded" />
          </div>
          <Skeleton className="h-[34px] w-32 bg-[#191919] rounded-[8px] shrink-0" />
        </div>
      </div>

      {/* User Account Summary Hero Card Skeleton */}
      <div className="rounded-[10px] bg-[#141414] border border-[#292929] p-5 sm:p-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-2.5">
          <Skeleton className="h-7 w-48 sm:w-64 bg-[#222222] rounded" />
          <Skeleton className="h-4 w-56 sm:w-72 bg-[#222222] rounded" />
          <Skeleton className="h-3.5 w-36 bg-[#222222] rounded" />
        </div>
        <div className="flex flex-col md:items-end gap-3 shrink-0">
          <div className="flex items-center gap-2">
            <Skeleton className="h-[26px] w-16 bg-[#222222] rounded-[6px]" />
            <Skeleton className="h-[26px] w-20 bg-[#222222] rounded-[6px]" />
          </div>
          <Skeleton className="h-4 w-36 bg-[#222222] rounded" />
        </div>
      </div>

      {/* 2-Column Responsive Layout Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column (lg:col-span-7) */}
        <div className="lg:col-span-7 space-y-6">
          {/* Personal Information Card Skeleton */}
          <div className="rounded-[10px] bg-[#141414] border border-[#292929] overflow-hidden">
            <div className="px-5 py-4 border-b border-[#292929]">
              <Skeleton className="h-5 w-40 bg-[#222222] rounded" />
            </div>
            <div className="p-5 grid grid-cols-1 sm:grid-cols-2 gap-5">
              {Array.from({ length: 6 }).map((_, idx) => (
                <div key={`personal-field-${idx}`} className="space-y-2">
                  <Skeleton className="h-3 w-20 bg-[#222222] rounded" />
                  <Skeleton className="h-5 w-36 bg-[#222222] rounded" />
                </div>
              ))}
            </div>
          </div>

          {/* Contact Information Card Skeleton */}
          <div className="rounded-[10px] bg-[#141414] border border-[#292929] overflow-hidden">
            <div className="px-5 py-4 border-b border-[#292929]">
              <Skeleton className="h-5 w-36 bg-[#222222] rounded" />
            </div>
            <div className="p-5 space-y-5">
              <div className="flex items-center justify-between gap-4">
                <div className="space-y-2">
                  <Skeleton className="h-3 w-24 bg-[#222222] rounded" />
                  <Skeleton className="h-5 w-48 bg-[#222222] rounded" />
                </div>
                <Skeleton className="h-[26px] w-24 bg-[#222222] rounded-[6px]" />
              </div>
              <div className="border-t border-[#292929]" />
              <div className="flex items-center justify-between gap-4">
                <div className="space-y-2">
                  <Skeleton className="h-3 w-24 bg-[#222222] rounded" />
                  <Skeleton className="h-5 w-36 bg-[#222222] rounded" />
                </div>
                <Skeleton className="h-[26px] w-24 bg-[#222222] rounded-[6px]" />
              </div>
            </div>
          </div>

          {/* System Information Card Skeleton */}
          <div className="rounded-[10px] bg-[#141414] border border-[#292929] overflow-hidden">
            <div className="px-5 py-4 border-b border-[#292929]">
              <Skeleton className="h-5 w-36 bg-[#222222] rounded" />
            </div>
            <div className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="space-y-2 flex-1">
                <Skeleton className="h-3 w-16 bg-[#222222] rounded" />
                <Skeleton className="h-5 w-64 bg-[#222222] rounded" />
              </div>
              <Skeleton className="h-[34px] w-24 bg-[#222222] rounded-[8px] shrink-0" />
            </div>
          </div>
        </div>

        {/* Right Column (lg:col-span-5) */}
        <div className="lg:col-span-5 space-y-6">
          {/* Authentication Card Skeleton */}
          <div className="rounded-[10px] bg-[#141414] border border-[#292929] overflow-hidden">
            <div className="px-5 py-4 border-b border-[#292929]">
              <Skeleton className="h-5 w-28 bg-[#222222] rounded" />
            </div>
            <div className="p-5 space-y-4">
              <div className="space-y-2">
                <Skeleton className="h-3 w-28 bg-[#222222] rounded" />
                <Skeleton className="h-5 w-32 bg-[#222222] rounded" />
              </div>
              <div className="border-t border-[#292929]" />
              <div className="space-y-2">
                <Skeleton className="h-3 w-24 bg-[#222222] rounded" />
                <Skeleton className="h-5 w-48 bg-[#222222] rounded" />
              </div>
            </div>
          </div>

          {/* Verification & Onboarding Card Skeleton */}
          <div className="rounded-[10px] bg-[#141414] border border-[#292929] overflow-hidden">
            <div className="px-5 py-4 border-b border-[#292929]">
              <Skeleton className="h-5 w-44 bg-[#222222] rounded" />
            </div>
            <div className="p-5 space-y-3">
              {Array.from({ length: 4 }).map((_, idx) => (
                <React.Fragment key={`verif-skeleton-${idx}`}>
                  {idx > 0 && <div className="border-t border-[#292929]" />}
                  <div className="flex items-center justify-between py-1">
                    <Skeleton className="h-4 w-32 bg-[#222222] rounded" />
                    <Skeleton className="h-4 w-12 bg-[#222222] rounded" />
                  </div>
                </React.Fragment>
              ))}
            </div>
          </div>

          {/* Account Timestamps Card Skeleton */}
          <div className="rounded-[10px] bg-[#141414] border border-[#292929] overflow-hidden">
            <div className="px-5 py-4 border-b border-[#292929]">
              <Skeleton className="h-5 w-36 bg-[#222222] rounded" />
            </div>
            <div className="p-5 space-y-3">
              <div className="flex items-center justify-between">
                <Skeleton className="h-4 w-20 bg-[#222222] rounded" />
                <Skeleton className="h-4 w-36 bg-[#222222] rounded" />
              </div>
              <div className="border-t border-[#292929]" />
              <div className="flex items-center justify-between">
                <Skeleton className="h-4 w-24 bg-[#222222] rounded" />
                <Skeleton className="h-4 w-36 bg-[#222222] rounded" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
