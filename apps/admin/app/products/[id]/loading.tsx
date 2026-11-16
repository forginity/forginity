"use client"

import * as React from "react"
import Link from "next/link"
import { AdminShell } from "@/components/admin-shell"
import { ViewProductSkeleton } from "./skeleton"

/**
 * Next.js App Router instant streaming loading state for /products/[id].
 * Mounts synchronously with AdminShell on link click before client query resolution.
 */
export default function ProductDetailLoading() {
  return (
    <AdminShell
      currentPath="/products"
      breadcrumbs={[
        { label: "Workspace" },
        { label: "Product", href: "/products" },
        { label: "Loading..." },
      ]}
    >
      <ViewProductSkeleton />
    </AdminShell>
  )
}
