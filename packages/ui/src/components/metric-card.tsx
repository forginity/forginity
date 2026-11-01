import * as React from "react"
import { cn } from "@workspace/ui/lib/utils"
import { Card } from "@workspace/ui/components/card"

export interface MetricCardProps extends React.HTMLAttributes<HTMLDivElement> {
  title: string
  value: string | number
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
    <Card
      className={cn(
        "flex flex-col justify-between gap-3 rounded-xl border border-border/50 bg-card/60 p-4.5 transition-colors hover:border-border hover:bg-card/80",
        className
      )}
      {...props}
    >
      <div className="flex items-center justify-between gap-2">
        <span className="text-xs font-medium text-muted-foreground">{title}</span>
        {change && (
          <span
            className={cn(
              "text-[11px] font-semibold",
              changeType === "positive" && "text-[#f95738]",
              changeType === "negative" && "text-rose-400",
              changeType === "neutral" && "text-muted-foreground"
            )}
          >
            {change}
          </span>
        )}
      </div>

      <div className="text-2xl font-semibold tracking-tight text-foreground md:text-3xl">
        {value}
      </div>

      {description && (
        <p className="text-[11px] text-muted-foreground/80 leading-normal">
          {description}
        </p>
      )}
    </Card>
  )
}
