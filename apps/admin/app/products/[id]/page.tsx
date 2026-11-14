"use client"

import * as React from "react"
import Link from "next/link"
import { useParams } from "next/navigation"
import {
  ArrowLeft,
  Edit2,
  GitBranch,
  Loader2,
  Pencil,
  Plus,
  Trash2,
} from "lucide-react"
import { AppShell } from "@workspace/ui/components/app-shell"
import { Button } from "@workspace/ui/components/button"
import { Card } from "@workspace/ui/components/card"
import { Skeleton } from "@workspace/ui/components/skeleton"
import {
  ADMIN_NAV_SECTIONS,
  ADMIN_USER_PROFILE,
} from "@/constants/admin-nav.constants"
import {
  useProduct,
  useDeleteProductVersion,
} from "@forginity/sdk/modules/products/products.hooks"
import type {
  ProductVersion,
  ProductWithRelations,
} from "@forginity/sdk/modules/products/products.types"
import { QueryErrorState } from "@/components/query-error-state"
import { StatusPill } from "@/components/status-pill"
import { formatDisplayDate } from "@/lib/date"
import { MaintenancePanel } from "@/components/maintenance-panel"
import { VersionDialog } from "@/components/version-dialog"
import { ViewProductSkeleton } from "./skeleton"

export default function ViewProductPage() {
  const params = useParams<{ id: string }>()
  const id = params?.id as string

  // Fetch product with full version history
  const {
    data: product,
    isLoading,
    isError,
    error,
    refetch,
  } = useProduct(id, { versionList: true })

  const versions: ProductVersion[] = product?.versions || []
  const latestVersion = versions.find((v) => v.status === "latest") || versions[0]
  const supportedCount = versions.filter((v) => v.status === "supported").length

  // Version management states
  const [versionDialogOpen, setVersionDialogOpen] = React.useState(false)
  const [selectedVersion, setSelectedVersion] =
    React.useState<ProductVersion | null>(null)
  const [deletingVersionId, setDeletingVersionId] = React.useState<string | null>(null)

  const { mutateAsync: deleteVersion } = useDeleteProductVersion(id)

  const handleRegisterVersion = () => {
    setSelectedVersion(null)
    setVersionDialogOpen(true)
  }

  const handleEditVersion = (ver: ProductVersion) => {
    setSelectedVersion(ver)
    setVersionDialogOpen(true)
  }

  const handleDeleteVersion = async (ver: ProductVersion) => {
    const isConfirmed = window.confirm(
      `Are you sure you want to delete version ${ver.version}?`
    )
    if (!isConfirmed) return

    setDeletingVersionId(ver.id)
    try {
      await deleteVersion(ver.id)
    } finally {
      setDeletingVersionId(null)
    }
  }

  return (
    <AppShell
      currentPath={`/products/${id}`}
      breadcrumbs={[
        { label: "Workspace" },
        { label: "Product", href: "/products" },
        { label: product?.name || (isLoading ? "Loading..." : "Product") },
      ]}
      sections={ADMIN_NAV_SECTIONS}
      user={ADMIN_USER_PROFILE}
      linkComponent={Link}
    >
      <div className="flex flex-col gap-6">
        {/* Back navigation */}
        <div>
          <Link
            href="/products"
            className="inline-flex items-center gap-2 text-xs font-light text-[#B9B9B9] hover:text-[#F6F6F6] transition-colors"
          >
            <ArrowLeft className="size-3.5 text-[#B9B9B9]" />
            <span>Back to products</span>
          </Link>
        </div>

        {/* Global Error Banner */}
        {isError && (
          <QueryErrorState
            error={error}
            onRetry={() => refetch()}
            title="Failed to load product details"
          />
        )}

        {/* Loading UI-Stream Skeleton (0.00 CLS) */}
        {!product && !isError && <ViewProductSkeleton />}

        {/* Live Content */}
        {product && (
          <>
            {/* Page Heading & Edit Action */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex flex-col gap-1">
                <h1 className="text-3xl font-light tracking-tight text-[#F6F6F6]">
                  {product.name}
                </h1>
                <p className="text-sm font-normal text-[#838383]">
                  View product details and manage its release versions.
                </p>
              </div>

              <Link href={`/products/${id}/edit`}>
                <Button className="h-10 gap-2 rounded-full bg-gradient-coral px-5 text-sm font-medium text-[#090909] hover:opacity-90 transition-opacity cursor-pointer shrink-0">
                  <Pencil className="size-4 text-[#090909]" />
                  <span>Edit product</span>
                </Button>
              </Link>
            </div>

            {/* Product Overview: Details & Latest Version Cards */}
            <div className="flex flex-col lg:flex-row gap-6 items-stretch">
              {/* Product Details Panel (Figma Node 283:3742) */}
              <Card
                variant="panel"
                className="flex-1 rounded-[16px] border border-[#292929] bg-[#141414] p-6 flex flex-col justify-between gap-6"
              >
                <div className="flex items-center justify-between">
                  <h2 className="text-base font-normal text-[#F6F6F6]">
                    Product details
                  </h2>
                  <div className="flex items-center gap-2.5">
                    <span className="text-xs text-[#838383]">Product status</span>
                    <StatusPill status={product.status} />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                  <div className="flex flex-col gap-2">
                    <span className="text-xs text-[#838383]">Product name</span>
                    <span className="text-sm text-[#F6F6F6] font-normal">
                      {product.name}
                    </span>
                  </div>

                  <div className="flex flex-col gap-2">
                    <span className="text-xs text-[#838383]">Slug</span>
                    <span className="text-sm font-mono text-[#F6F6F6]">
                      {product.slug}
                    </span>
                  </div>

                  <div className="flex flex-col gap-2">
                    <span className="text-xs text-[#838383]">Created on</span>
                    <span className="text-sm text-[#F6F6F6]">
                      {formatDisplayDate(product.createdAt)}
                    </span>
                  </div>
                </div>

                <p className="text-xs font-light text-[#838383]">
                  Product status describes the product lifecycle, independently of its versions.
                </p>
              </Card>

              {/* Latest Version Panel (Figma Node 283:3761) */}
              <Card
                variant="panel"
                className="w-full lg:w-[300px] shrink-0 rounded-[16px] border border-[#292929] bg-[#141414] p-6 flex flex-col justify-between gap-4"
              >
                <span className="text-xs text-[#838383]">Latest version</span>

                <div className="flex items-center justify-between gap-3">
                  <span className="text-[28px] font-light font-mono text-[#F6F6F6] leading-none">
                    {latestVersion?.version || "—"}
                  </span>
                  {latestVersion && (
                    <StatusPill status={latestVersion.status} />
                  )}
                </div>

                <p className="text-xs font-light text-[#838383]">
                  {versions.length} version{versions.length === 1 ? "" : "s"} in total ·{" "}
                  {supportedCount} supported previous release{supportedCount === 1 ? "" : "s"}
                </p>
              </Card>
            </div>

            {/* Product Versions Table (Figma Node 283:3769) */}
            <Card
              variant="panel"
              className="flex flex-col overflow-hidden rounded-[16px] border border-[#292929] bg-[#141414]"
            >
              {/* Panel Heading */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 border-b border-[#292929]">
                <div className="flex flex-col gap-1">
                  <div className="flex items-center gap-2.5">
                    <h2 className="text-base font-normal text-[#F6F6F6]">Versions</h2>
                    <span className="text-xs font-light text-[#838383]">
                      ({versions.length} release{versions.length === 1 ? "" : "s"})
                    </span>
                  </div>
                  <p className="text-xs font-light text-[#838383]">
                    Release identifiers and support status for {product.name}.
                  </p>
                </div>

                <Button
                  onClick={handleRegisterVersion}
                  className="h-9 gap-2 rounded-full bg-gradient-coral px-4 text-xs font-medium text-[#090909] hover:opacity-90 transition-opacity self-start sm:self-auto cursor-pointer shrink-0"
                >
                  <Plus className="size-3.5 text-[#090909]" />
                  <span>Register version</span>
                </Button>
              </div>

              {/* Table Column Headings */}
              <div className="bg-[#0E0E0E] h-10 px-6 flex items-center gap-6 text-xs text-[#838383] font-normal border-b border-[#292929] overflow-x-auto">
                <span className="w-[180px] shrink-0">Version</span>
                <span className="w-[160px] shrink-0">Version status</span>
                <span className="flex-1 min-w-[200px]">Release availability</span>
                <span className="w-[90px] shrink-0 text-right">Actions</span>
              </div>

              {/* Version Rows */}
              {versions.length === 0 ? (
                <div className="p-8 text-center text-xs text-[#838383]">
                  No versions registered for this product yet.
                </div>
              ) : (
                <div className="divide-y divide-[#292929] overflow-x-auto">
                  {versions.map((ver) => {
                    const availabilityNote =
                      ver.changelog ||
                      (ver.status === "latest"
                        ? "Current release"
                        : ver.status === "supported"
                        ? "Previous release, still supported"
                        : "No longer recommended for use")
                    const isVerDeleting = deletingVersionId === ver.id

                    return (
                      <div
                        key={ver.id || ver.version}
                        className="h-[70px] px-6 flex items-center gap-6 transition-colors hover:bg-white/[0.02]"
                      >
                        {/* Version Identifier */}
                        <div className="w-[180px] shrink-0 flex items-center gap-2.5">
                          <GitBranch className="size-4 text-[#838383] shrink-0" />
                          <span className="font-mono text-sm text-[#F6F6F6]">
                            {ver.version}
                          </span>
                        </div>

                        {/* Version Lifecycle Pill */}
                        <div className="w-[160px] shrink-0 flex items-center">
                          <StatusPill status={ver.status} />
                        </div>

                        {/* Availability / Changelog */}
                        <div className="flex-1 min-w-[200px] text-sm text-[#B9B9B9] truncate">
                          {availabilityNote}
                        </div>

                        {/* Actions */}
                        <div className="w-[90px] shrink-0 flex items-center justify-end gap-1.5">
                          <button
                            type="button"
                            onClick={() => handleEditVersion(ver)}
                            title="Edit version"
                            className="p-1.5 rounded-lg text-[#838383] hover:text-[#F6F6F6] hover:bg-white/5 transition-colors cursor-pointer"
                          >
                            <Edit2 className="size-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDeleteVersion(ver)}
                            disabled={isVerDeleting}
                            title="Delete version"
                            className="p-1.5 rounded-lg text-[#838383] hover:text-rose-400 hover:bg-rose-950/20 transition-colors cursor-pointer disabled:opacity-40"
                          >
                            {isVerDeleting ? (
                              <Loader2 className="size-3.5 animate-spin text-rose-400" />
                            ) : (
                              <Trash2 className="size-3.5" />
                            )}
                          </button>
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}

              {/* Table Footer */}
              <div className="px-6 py-4 border-t border-[#292929]">
                <p className="text-xs font-light text-[#838383]">
                  Showing all {versions.length} version{versions.length === 1 ? "" : "s"}
                </p>
              </div>
            </Card>

            {/* Version Dialog Modal */}
            <VersionDialog
              open={versionDialogOpen}
              onOpenChange={setVersionDialogOpen}
              productId={id}
              productName={product.name}
              initialData={selectedVersion}
            />

            {/* Maintenance Windows Panel */}
            <MaintenancePanel productId={id} productName={product.name} />
          </>
        )}
      </div>
    </AppShell>
  )
}
