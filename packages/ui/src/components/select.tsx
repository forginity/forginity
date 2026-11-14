"use client"

import * as React from "react"
import { Select as SelectPrimitive } from "@base-ui/react/select"
import { Check, ChevronDown } from "lucide-react"
import { cn } from "@workspace/ui/lib/utils"

function Select<Value = any, Multiple extends boolean | undefined = false>({
  ...props
}: SelectPrimitive.Root.Props<Value, Multiple>) {
  return <SelectPrimitive.Root data-slot="select" {...props} />
}

function SelectGroup({ ...props }: SelectPrimitive.Group.Props) {
  return <SelectPrimitive.Group data-slot="select-group" {...props} />
}

function SelectValue({ className, placeholder, ...props }: SelectPrimitive.Value.Props & { placeholder?: string }) {
  return (
    <SelectPrimitive.Value
      data-slot="select-value"
      placeholder={placeholder}
      className={cn("truncate text-sm font-light text-[#F6F6F6] data-placeholder:text-[#838383]", className)}
      {...props}
    />
  )
}

export interface SelectTriggerProps extends SelectPrimitive.Trigger.Props {
  variant?: "default" | "compact" | "stacked"
  label?: string
}

function SelectTrigger({
  className,
  children,
  variant = "default",
  label,
  ...props
}: SelectTriggerProps) {
  if (variant === "compact") {
    return (
      <SelectPrimitive.Trigger
        data-slot="select-trigger"
        className={cn(
          "flex h-[38px] w-auto items-center justify-between gap-2 rounded-[8px] border border-[#292929] bg-[#0E0E0E] px-3 text-xs font-normal text-[#F6F6F6] outline-none transition-colors hover:border-[#3A3A3A] focus-visible:border-[#FF6347]",
          className
        )}
        {...props}
      >
        {children}
        <ChevronDown className="size-3.5 text-[#838383] shrink-0" />
      </SelectPrimitive.Trigger>
    )
  }

  if (variant === "stacked" || label) {
    return (
      <SelectPrimitive.Trigger
        data-slot="select-trigger"
        className={cn(
          "flex h-[64px] w-full flex-col justify-center rounded-[18px] border border-[#292929] bg-[#141414] px-[18px] text-left outline-none transition-all hover:border-[#3A3A3A] focus-visible:border-[#FF6347] focus-visible:ring-1 focus-visible:ring-[#FF6347]/30",
          className
        )}
        {...props}
      >
        {label && (
          <span className="text-[10px] font-light uppercase tracking-wider text-[#838383]">
            {label}
          </span>
        )}
        <div className="flex w-full items-center justify-between">
          {children}
          <ChevronDown className="size-4 text-[#838383] shrink-0" />
        </div>
      </SelectPrimitive.Trigger>
    )
  }

  return (
    <SelectPrimitive.Trigger
      data-slot="select-trigger"
      className={cn(
        "flex h-[52px] w-full items-center justify-between rounded-[16px] border border-[#292929] bg-[#1A1A1A] px-4 py-2 text-sm font-light text-[#F6F6F6] outline-none transition-colors hover:border-[#3A3A3A] focus-visible:border-[#FF6347] focus-visible:ring-1 focus-visible:ring-[#FF6347]/50 disabled:pointer-events-none disabled:opacity-50",
        className
      )}
      {...props}
    >
      {children}
      <ChevronDown className="size-4 text-[#838383] shrink-0" />
    </SelectPrimitive.Trigger>
  )
}

function SelectContent({
  align = "start",
  alignOffset = 0,
  side = "bottom",
  sideOffset = 6,
  className,
  children,
  ...props
}: SelectPrimitive.Popup.Props &
  Pick<
    SelectPrimitive.Positioner.Props,
    "align" | "alignOffset" | "side" | "sideOffset"
  >) {
  return (
    <SelectPrimitive.Portal>
      <SelectPrimitive.Positioner
        className="isolate z-50 outline-none"
        align={align}
        alignOffset={alignOffset}
        side={side}
        sideOffset={sideOffset}
      >
        <SelectPrimitive.Popup
          data-slot="select-content"
          className={cn(
            "z-50 min-w-36 overflow-hidden rounded-[16px] border border-[#292929] bg-[#141414] p-1.5 text-[#F6F6F6] shadow-xl outline-none duration-100",
            className
          )}
          {...props}
        >
          {children}
        </SelectPrimitive.Popup>
      </SelectPrimitive.Positioner>
    </SelectPrimitive.Portal>
  )
}

function SelectLabel({
  className,
  ...props
}: SelectPrimitive.GroupLabel.Props) {
  return (
    <SelectPrimitive.GroupLabel
      data-slot="select-label"
      className={cn("px-3 py-1.5 text-[10px] font-medium uppercase tracking-wider text-[#838383]", className)}
      {...props}
    />
  )
}

function SelectItem({
  className,
  children,
  ...props
}: SelectPrimitive.Item.Props) {
  return (
    <SelectPrimitive.Item
      data-slot="select-item"
      className={cn(
        "relative flex h-10 w-full cursor-pointer select-none items-center justify-between rounded-[8px] px-3 text-sm font-light text-[#F6F6F6] outline-none transition-colors hover:bg-[#202020] hover:text-[#FF967F] data-[selected]:bg-[#FF6347]/[0.07] data-[selected]:text-[#FF967F]",
        className
      )}
      {...props}
    >
      <SelectPrimitive.ItemText>{children}</SelectPrimitive.ItemText>
      <SelectPrimitive.ItemIndicator className="ml-2 flex items-center justify-center">
        <Check className="size-4 text-[#FF6347]" />
      </SelectPrimitive.ItemIndicator>
    </SelectPrimitive.Item>
  )
}

function SelectSeparator({
  className,
  ...props
}: SelectPrimitive.Separator.Props) {
  return (
    <SelectPrimitive.Separator
      data-slot="select-separator"
      className={cn("my-1 h-px bg-[#292929]", className)}
      {...props}
    />
  )
}

/* -------------------------------------------------------------------------- */
/*  Interactive Selection Option Card (Figma Node 179:258 & 179:359)          */
/* -------------------------------------------------------------------------- */

export interface SelectOptionCardProps extends React.HTMLAttributes<HTMLDivElement> {
  selected?: boolean
  label: string
  description?: string
  code?: string
  icon?: React.ReactNode
}

function SelectOptionCard({
  selected = false,
  label,
  description,
  code,
  icon,
  className,
  ...props
}: SelectOptionCardProps) {
  return (
    <div
      role="button"
      tabIndex={0}
      data-selected={selected}
      className={cn(
        "group relative flex h-[62px] w-full cursor-pointer items-center justify-between rounded-[16px] px-4 transition-all select-none outline-none",
        selected
          ? "bg-gradient-coral text-[#0E0E0E]"
          : "bg-[#161616] text-[#DBDBDB] border border-[#292929] hover:bg-[#202020]",
        className
      )}
      {...props}
    >
      <div className="flex items-center gap-3.5 min-w-0">
        {code && (
          <div
            className={cn(
              "flex size-9 shrink-0 items-center justify-center rounded-full text-[11px] font-light",
              selected
                ? "bg-[#0E0E0E] text-[#FF6347]"
                : "bg-[#202020] text-[#DBDBDB]"
            )}
          >
            {code}
          </div>
        )}
        {icon && (
          <div
            className={cn(
              "flex size-9 shrink-0 items-center justify-center rounded-full",
              selected
                ? "bg-[#0E0E0E] text-[#FF6347]"
                : "bg-[#202020] text-[#DBDBDB]"
            )}
          >
            {icon}
          </div>
        )}
        <div className="flex flex-col min-w-0">
          <span
            className={cn(
              "text-sm leading-tight truncate",
              selected ? "font-normal text-[#0E0E0E]" : "font-light text-[#DBDBDB]"
            )}
          >
            {label}
          </span>
          {description && (
            <span
              className={cn(
                "text-[11px] leading-tight truncate",
                selected ? "font-light text-[#0E0E0E]/70" : "font-light text-[#838383]"
              )}
            >
              {description}
            </span>
          )}
        </div>
      </div>

      {selected && <Check className="size-[18px] text-[#0E0E0E] shrink-0 ml-2" />}
    </div>
  )
}

export {
  Select,
  SelectGroup,
  SelectValue,
  SelectTrigger,
  SelectContent,
  SelectLabel,
  SelectItem,
  SelectSeparator,
  SelectOptionCard,
}
