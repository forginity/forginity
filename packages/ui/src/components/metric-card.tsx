import * as React from "react"
import { cn } from "@workspace/ui/lib/utils"

export interface MetricCardProps extends React.HTMLAttributes<HTMLDivElement> {
  title: string
  value: React.ReactNode
  change?: string
  changeType?: "positive" | "negative" | "neutral"
  description?: string
}

export function MetricCard({
  title,
  value,
  change,
  changeType = "positive",
  description,
  className,
  ...props
}: MetricCardProps) {
  return (
    <div
      className={cn(
        "flex min-h-[136px] flex-col justify-between rounded-[16px] border border-[#292929] bg-[#141414] p-5 transition-colors hover:border-[#3A3A3A]",
        className
      )}
      {...props}
    >
      <div className="flex items-center justify-between gap-2">
        <span className="text-xs font-normal text-[#838383]">{title}</span>
        {change && (
          <span
            className={cn(
              "text-[12px] font-normal",
              changeType === "positive" && "text-[#FF967F]",
              changeType === "negative" && "text-rose-400",
              changeType === "neutral" && "text-[#838383]"
            )}
          >
            {change}
          </span>
        )}
      </div>

      <div className="text-[32px] font-normal leading-none tracking-tight text-[#F6F6F6]">
        {value}
      </div>

      {description && (
        <p className="text-[12px] font-light leading-normal text-[#838383]">
          {description}
        </p>
      )}
    </div>
  )
}
