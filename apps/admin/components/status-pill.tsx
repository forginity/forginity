import * as React from "react"

interface StatusPillProps {
  status: string
  className?: string
}

/**
 * Authoritative Status Pill component matching Figma Node 283:3747.
 * Renders consistent lifecycle indicator badges for both Product and Version tracks.
 */
export function StatusPill({ status, className = "" }: StatusPillProps) {
  const normalized = status.toLowerCase()
  let dotColor = "bg-[#9DBCA9]"
  let textColor = "text-[#9DBCA9]"

  if (normalized === "active" || normalized === "latest") {
    dotColor = "bg-[#9DBCA9]"
    textColor = "text-[#9DBCA9]"
  } else if (normalized === "supported") {
    dotColor = "bg-[#B9B9B9]"
    textColor = "text-[#B9B9B9]"
  } else if (normalized === "beta") {
    dotColor = "bg-[#FFB86C]"
    textColor = "text-[#FFB86C]"
  } else if (normalized === "deprecated") {
    dotColor = "bg-[#838383]"
    textColor = "text-[#838383]"
  }

  return (
    <div
      className={`bg-[#1A1A1A] inline-flex items-center gap-1.5 px-[9px] py-[5px] rounded-full shrink-0 ${className}`}
    >
      <div className={`size-[5px] rounded-full shrink-0 ${dotColor}`} />
      <span className={`text-[12px] font-normal lowercase leading-none ${textColor}`}>
        {status}
      </span>
    </div>
  )
}
