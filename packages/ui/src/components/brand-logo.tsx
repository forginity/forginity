import * as React from "react"
import { ForginityLogo, type LogoSize } from "@workspace/ui/components/forginity-logo"
import { ORG_ADMIN_LABEL } from "@workspace/ui/constants/brand.constants"

export interface BrandLogoProps extends React.HTMLAttributes<HTMLDivElement> {
  sublabel?: string
  collapsed?: boolean
  size?: LogoSize
  width?: number | string
  height?: number | string
}

export function BrandLogo({
  sublabel = ORG_ADMIN_LABEL,
  collapsed = false,
  size = "sidebar",
  width = 120,
  height = 32,
  className,
  ...props
}: BrandLogoProps) {
  if (collapsed) {
    return (
      <ForginityLogo
        size="xs"
        className={className}
        {...props}
      />
    )
  }

  return (
    <ForginityLogo
      size={size}
      width={width}
      height={height}
      sublabel={sublabel}
      showSublabel={Boolean(sublabel)}
      className={className}
      {...props}
    />
  )
}
