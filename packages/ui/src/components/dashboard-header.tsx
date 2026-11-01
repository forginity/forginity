import * as React from "react"
import { cn } from "@workspace/ui/lib/utils"

export interface DashboardHeaderProps extends React.HTMLAttributes<HTMLDivElement> {
  title: string
  description?: string
  actions?: React.ReactNode
}

export function DashboardHeader({
  title,
  description,
  actions,
  className,
  ...props
}: DashboardHeaderProps) {
  return (
    <div
      className={cn(
        "flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between",
        className
      )}
      {...props}
    >
      <div className="space-y-1.5">
        <h1 className="text-[32px] font-normal tracking-tight text-[#F6F6F6] leading-tight">
          {title}
        </h1>
        {description && (
          <p className="text-[14px] font-light text-[#838383] leading-normal">{description}</p>
        )}
      </div>

      {actions && <div className="flex items-center gap-2.5 shrink-0">{actions}</div>}
    </div>
  )
}
