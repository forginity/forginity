"use client"

import * as React from "react"
import Link from "next/link"
import { AlertTriangle, CheckCircle2, Clock } from "lucide-react"
import { useActiveMaintenance } from "@forginity/sdk/modules/products/products.hooks"
import { StatusPill } from "@/components/status-pill"
import { formatDisplayDateTime } from "@/lib/date"

export function WorkspacePulse() {
  const { data, isLoading, isError } = useActiveMaintenance()
  const activeWindows = data?.items || []

  if (isLoading) {
    return (
      <div className="flex h-56 flex-col items-center justify-center gap-2 rounded-lg border border-dashed border-[#292929] bg-[#141414] p-4 text-xs text-[#838383] animate-pulse">
        <Clock className="size-5 text-[#555]" />
        <span>Checking system pulse and active schedules...</span>
      </div>
    )
  }

  if (isError) {
    return (
      <div className="flex h-56 flex-col items-center justify-center gap-2 rounded-lg border border-dashed border-rose-950/40 bg-rose-950/10 p-4 text-center text-xs text-rose-400">
        <AlertTriangle className="size-5 text-rose-400" />
        <span>Unable to fetch platform maintenance schedules</span>
      </div>
    )
  }

  if (activeWindows.length === 0) {
    return (
      <div className="flex h-56 flex-col items-center justify-center gap-2.5 rounded-lg border border-dashed border-[#292929] bg-[#141414] p-6 text-center">
        <div className="flex size-9 items-center justify-center rounded-full bg-[#9DBCA9]/10 text-[#9DBCA9]">
          <CheckCircle2 className="size-5" />
        </div>
        <div className="space-y-1">
          <p className="text-xs font-medium text-[#F6F6F6]">
            All systems operational
          </p>
          <p className="text-[11px] text-[#838383]">
            No active maintenance windows or service outages reported.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex h-56 flex-col overflow-y-auto divide-y divide-[#292929] rounded-lg border border-[#292929] bg-[#141414]">
      {activeWindows.map((window) => (
        <div key={window.id} className="p-3.5 flex flex-col gap-1.5">
          <div className="flex items-center justify-between gap-2">
            <span className="text-xs font-medium text-[#F6F6F6] truncate">
              {window.message}
            </span>
            <StatusPill status={window.status} />
          </div>
          <div className="flex items-center gap-2 text-[11px] text-[#838383]">
            <Clock className="size-3" />
            <span>
              {formatDisplayDateTime(window.startsAt)} –{" "}
              {formatDisplayDateTime(window.endsAt)}
            </span>
          </div>
          {window.productId && (
            <Link
              href={`/products/${window.productId}`}
              className="text-[11px] text-[#FF967F] hover:underline"
            >
              View affected product →
            </Link>
          )}
        </div>
      ))}
    </div>
  )
}
