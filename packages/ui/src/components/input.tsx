"use client"

import * as React from "react"
import { Input as InputPrimitive } from "@base-ui/react/input"
import { cn } from "@workspace/ui/lib/utils"

export interface InputProps extends React.ComponentProps<"input"> {
  variant?: "default" | "search" | "stacked"
  label?: string
  error?: string
  icon?: React.ReactNode
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, variant = "default", label, error, icon, ...props }, ref) => {
    // Figma 64px Stacked Input (node 179:77): Top label, bottom value, 18px radius
    if (variant === "stacked" || label) {
      return (
        <div
          className={cn(
            "group relative flex h-[64px] w-full flex-col justify-center rounded-[18px] border border-[#292929] bg-[#141414] px-[18px] transition-all focus-within:border-[#FF6347] focus-within:ring-1 focus-within:ring-[#FF6347]/30",
            error && "border-[#D94F2E] focus-within:border-[#D94F2E]",
            className
          )}
        >
          {label && (
            <span className="text-[10px] font-light uppercase tracking-wider text-[#838383] transition-colors group-focus-within:text-[#FF967F]">
              {label}
            </span>
          )}
          <div className="flex items-center gap-2">
            {icon && <span className="text-[#838383] shrink-0">{icon}</span>}
            <InputPrimitive
              ref={ref}
              type={type}
              data-slot="input"
              className="w-full bg-transparent text-[14px] font-light leading-tight text-[#F6F6F6] placeholder:text-[#838383] outline-none"
              {...props}
            />
          </div>
          {error && (
            <span className="absolute -bottom-5 left-2 text-[10px] text-[#D94F2E]">
              {error}
            </span>
          )}
        </div>
      )
    }

    // Figma 38px Search Input (node 261:7641): 8px radius, #0E0E0E bg
    if (variant === "search") {
      return (
        <div className={cn("relative flex items-center w-full", className)}>
          {icon && (
            <span className="absolute left-3 text-[#838383] pointer-events-none">
              {icon}
            </span>
          )}
          <InputPrimitive
            ref={ref}
            type={type}
            data-slot="input"
            className={cn(
              "h-[38px] w-full rounded-[8px] border border-[#292929] bg-[#0E0E0E] text-[12px] font-normal text-[#F6F6F6] placeholder:text-[#838383] outline-none transition-colors focus-visible:border-[#FF6347]",
              icon ? "pl-9 pr-3" : "px-3"
            )}
            {...props}
          />
        </div>
      )
    }

    // Standard Form Input: 52px height with 16px radius
    return (
      <InputPrimitive
        ref={ref}
        type={type}
        data-slot="input"
        className={cn(
          "h-[52px] w-full min-w-0 rounded-[16px] border border-[#292929] bg-[#1A1A1A] px-4 py-2 text-base font-light text-[#F6F6F6] placeholder:text-[#838383] transition-colors outline-none focus-visible:border-[#FF6347] focus-visible:ring-1 focus-visible:ring-[#FF6347]/50 disabled:pointer-events-none disabled:opacity-50",
          error && "border-[#D94F2E]",
          className
        )}
        {...props}
      />
    )
  }
)
Input.displayName = "Input"

export { Input }
