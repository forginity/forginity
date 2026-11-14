"use client"

import * as React from "react"
import Link from "next/link"
import { AppShell } from "@workspace/ui/components/app-shell"
import {
  ADMIN_NAV_SECTIONS,
  ADMIN_USER_PROFILE,
} from "@/constants/admin-nav.constants"
import { ViewProductSkeleton } from "./skeleton"

/**
 * Next.js App Router instant streaming loading state for /products/[id].
 * Mounts synchronously with AppShell on link click before client query resolution.
 */
export default function ProductDetailLoading() {
  return (
    <AppShell
      currentPath="/products"
      breadcrumbs={[
        { label: "Workspace" },
        { label: "Product", href: "/products" },
        { label: "Loading..." },
      ]}
      sections={ADMIN_NAV_SECTIONS}
      user={ADMIN_USER_PROFILE}
      linkComponent={Link}
    >
      <ViewProductSkeleton />
    </AppShell>
  )
}
