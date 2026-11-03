"use client"

import * as React from "react"
import Link from "next/link"
import { useParams, useRouter } from "next/navigation"
import {
  ArrowLeft,
  Loader2,
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
  useDeleteProduct,
} from "@forginity/sdk/modules/products/products.hooks"
import type { ProductVersion } from "@forginity/sdk/modules/products/products.types"
import { QueryErrorState } from "@/components/query-error-state"
import { StatusPill } from "@/components/status-pill"
import { formatDisplayDate } from "@/lib/date"

export default function DeleteProductPage() {
  const router = useRouter()
  const params = useParams<{ id: string }>()
  const id = params?.id as string

  // Fetch product and version relations
  const {
    data: product,
    isLoading,
    isError,
    error: fetchError,
    refetch,
  } = useProduct(id, { versionList: true })

  // Delete mutation requiring safety confirmation
  const {
    mutateAsync: deleteProduct,
    isPending: isDeleting,
    error: mutationError,
  } = useDeleteProduct()

  const [deleteError, setDeleteError] = React.useState<unknown | null>(null)

  const versions: ProductVersion[] = product?.versions || []

  const handleDelete = async () => {
    setDeleteError(null)
    try {
      await deleteProduct({
        id,
        options: { confirmation: true },
      })
      // Redirect back to products catalog table on success
      router.push("/products")
    } catch (err) {
      setDeleteError(err)
    }
  }

  return (
    <AppShell
      currentPath={`/products/${id}/delete`}
      breadcrumbs={[
        { label: "Workspace" },
        { label: "Product", href: "/products" },
        { label: product?.name || (isLoading ? "Loading..." : "Product"), href: `/products/${id}` },
        { label: "Delete product" },
      ]}
      sections={ADMIN_NAV_SECTIONS}
      user={ADMIN_USER_PROFILE}
      linkComponent={Link}
    >
      <div className="flex flex-col gap-6">
        {/* Back navigation */}
        <div>
          <Link
            href={`/products/${id}`}
            className="inline-flex items-center gap-2 text-xs font-light text-[#B9B9B9] hover:text-[#F6F6F6] transition-colors"
          >
            <ArrowLeft className="size-3.5 text-[#B9B9B9]" />
            <span>Back to product</span>
          </Link>
        </div>

        {/* Global Fetch Error Banner */}
        {isError && (
          <QueryErrorState
            error={fetchError}
            onRetry={() => refetch()}
            title="Failed to load product for deletion"
          />
        )}

        {/* Loading UI-Stream Skeleton (0.00 CLS) */}
        {!product && !isError && <DeleteProductSkeleton />}

        {/* Live Content */}
        {product && (
          <div className="flex flex-col gap-6">
            {/* Page Heading & Introduction */}
            <div className="flex flex-col gap-1">
              <h1 className="text-3xl font-light tracking-tight text-[#F6F6F6]">
                Delete product
              </h1>
              <p className="text-sm font-normal text-[#838383]">
                Confirm the permanent deletion of {product.name} and its associated versions.
              </p>
            </div>

            {/* Mutation Error Banner */}
            {(deleteError || mutationError) && (
              <QueryErrorState
                error={deleteError || mutationError}
                onRetry={handleDelete}
                title="Failed to delete product"
              />
            )}

            {/* 2-Column Responsive Layout */}
            <div className="flex flex-col lg:flex-row gap-6 items-start">
              {/* Left Column: Deletion Confirmation Card (Figma Node 283:4113) */}
              <div className="flex-1 w-full">
                <Card
                  variant="panel"
                  className="flex flex-col overflow-hidden rounded-[16px] border border-[#292929] bg-[#141414]"
                >
                  {/* Panel Heading */}
                  <div className="px-6 py-5 border-b border-[#292929]">
                    <h2 className="text-base font-normal text-[#F6F6F6]">Product details</h2>
                  </div>

                  {/* Body Content */}
                  <div className="p-6 flex flex-col gap-5">
                    <h3 className="text-[22px] font-normal text-[#F6F6F6] leading-tight">
                      {product.name}
                    </h3>

                    <p className="text-sm font-normal text-[#B9B9B9]">
                      Slug: <span className="font-mono text-[#F6F6F6]">{product.slug}</span>
                      {"   ·   "}
                      Product status: <span className="text-[#F6F6F6] capitalize">{product.status}</span>
                    </p>

                    <p className="text-sm font-normal text-[#F6F6F6] leading-relaxed">
                      This will permanently delete {product.name} and all {versions.length} associated{" "}
                      version{versions.length === 1 ? "" : "s"}. This action cannot be undone.
                    </p>

                    <p className="text-sm font-normal text-[#E59B9B] leading-relaxed">
                      Associated versions are deleted automatically with the product. They will not
                      be kept or recoverable.
                    </p>
                  </div>

                  {/* Form Actions Footer */}
                  <div className="flex items-center gap-3 px-6 py-5 border-t border-[#292929]">
                    <Link href={`/products/${id}`}>
                      <Button
                        type="button"
                        variant="secondary"
                        className="h-10 rounded-full border border-[#3A3A3A] bg-[#141414] px-5 text-sm text-[#F6F6F6] hover:bg-[#222222] transition-colors cursor-pointer"
                      >
                        Cancel
                      </Button>
                    </Link>

                    <Button
                      type="button"
                      onClick={handleDelete}
                      disabled={isDeleting}
                      className="h-10 gap-2 rounded-full bg-[#F04242] border border-[#FF6347] px-5 text-sm font-medium text-[#0E0E0E] hover:bg-[#D03030] transition-colors cursor-pointer disabled:opacity-50"
                    >
                      {isDeleting ? (
                        <Loader2 className="size-4 animate-spin text-[#0E0E0E]" />
                      ) : (
                        <Trash2 className="size-4 text-[#0E0E0E]" />
                      )}
                      <span>{isDeleting ? "Deleting..." : "Delete product"}</span>
                    </Button>
                  </div>
                </Card>
              </div>

              {/* Right Column: Context Metadata & Versions List (Figma Node 283:4158) */}
              <div className="w-full lg:w-[344px] shrink-0 flex flex-col gap-6">
                {/* Product Record Card */}
                <Card
                  variant="panel"
                  className="flex flex-col gap-5 rounded-[16px] border border-[#292929] bg-[#141414] p-6"
                >
                  <h3 className="text-base font-normal text-[#F6F6F6]">Product record</h3>

                  <div className="flex flex-col gap-1.5">
                    <span className="text-xs text-[#838383]">Created on · Read-only</span>
                    <span className="text-sm font-normal text-[#F6F6F6]">
                      {formatDisplayDate(product.createdAt)}
                    </span>
                  </div>

                  <p className="text-xs font-light text-[#838383] leading-relaxed">
                    This product and its associated versions will be permanently removed.
                  </p>
                </Card>

                {/* Versions to be Deleted Card */}
                <Card
                  variant="panel"
                  className="flex flex-col overflow-hidden rounded-[16px] border border-[#292929] bg-[#141414]"
                >
                  <div className="flex flex-col gap-1 p-6 border-b border-[#292929]">
                    <h3 className="text-base font-normal text-[#F6F6F6]">
                      Versions to be deleted
                    </h3>
                    <p className="text-xs font-light text-[#838383]">
                      All {versions.length} associated version{versions.length === 1 ? "" : "s"}{" "}
                      below will be permanently deleted.
                    </p>
                  </div>

                  <div className="bg-[#0E0E0E] px-6 py-2.5 flex items-center justify-between text-xs text-[#838383] border-b border-[#292929]">
                    <span>Version</span>
                    <span>Version status</span>
                  </div>

                  {versions.length === 0 ? (
                    <div className="p-6 text-center text-xs text-[#838383]">
                      No associated versions.
                    </div>
                  ) : (
                    <div className="divide-y divide-[#292929]">
                      {versions.map((ver) => (
                        <div
                          key={ver.id || ver.version}
                          className="h-[62px] px-6 flex items-center justify-between"
                        >
                          <span className="font-mono text-sm text-[#F6F6F6]">
                            {ver.version}
                          </span>
                          <StatusPill status={ver.status} />
                        </div>
                      ))}
                    </div>
                  )}
                </Card>
              </div>
            </div>
          </div>
        )}
      </div>
    </AppShell>
  )
}

function DeleteProductSkeleton() {
  return (
    <div className="flex flex-col gap-6 animate-pulse" data-slot="delete-product-skeleton">
      <div className="flex flex-col gap-1">
        <Skeleton className="h-9 w-48 rounded-md bg-[#1A1A1A]" />
        <Skeleton className="h-5 w-96 max-w-full rounded-md bg-[#1A1A1A]" />
      </div>

      <div className="flex flex-col lg:flex-row gap-6 items-start">
        {/* Left Deletion Confirmation Skeleton */}
        <div className="flex-1 w-full rounded-[16px] border border-[#292929] bg-[#141414] overflow-hidden">
          <div className="px-6 py-5 border-b border-[#292929]">
            <h2 className="text-base font-normal text-[#F6F6F6]">Product details</h2>
          </div>
          <div className="p-6 flex flex-col gap-5">
            <Skeleton className="h-7 w-48 rounded bg-[#222222]" />
            <Skeleton className="h-5 w-64 rounded bg-[#1C1C1C]" />
            <Skeleton className="h-5 w-full rounded bg-[#222222]" />
            <Skeleton className="h-5 w-4/5 rounded bg-[#222222]" />
          </div>
          <div className="flex items-center gap-3 px-6 py-5 border-t border-[#292929]">
            <Skeleton className="h-10 w-20 rounded-full bg-[#222222]" />
            <Skeleton className="h-10 w-32 rounded-full bg-[#222222]" />
          </div>
        </div>

        {/* Right Sidebar Skeleton */}
        <div className="w-full lg:w-[344px] shrink-0 flex flex-col gap-6">
          <div className="flex flex-col gap-5 rounded-[16px] border border-[#292929] bg-[#141414] p-6">
            <h3 className="text-base font-normal text-[#F6F6F6]">Product record</h3>
            <div className="flex flex-col gap-1.5">
              <span className="text-xs text-[#838383]">Created on · Read-only</span>
              <Skeleton className="h-5 w-24 bg-[#222222]" />
            </div>
            <p className="text-xs font-light text-[#838383] leading-relaxed">
              This product and its associated versions will be permanently removed.
            </p>
          </div>

          <div className="flex flex-col overflow-hidden rounded-[16px] border border-[#292929] bg-[#141414]">
            <div className="flex flex-col gap-1 p-6 border-b border-[#292929]">
              <h3 className="text-base font-normal text-[#F6F6F6]">Versions to be deleted</h3>
              <Skeleton className="h-4 w-56 bg-[#1C1C1C]" />
            </div>

            <div className="bg-[#0E0E0E] px-6 py-2.5 flex items-center justify-between text-xs text-[#838383] border-b border-[#292929]">
              <span>Version</span>
              <span>Version status</span>
            </div>

            <div className="divide-y divide-[#292929]">
              {[1, 2].map((i) => (
                <div key={i} className="h-[62px] px-6 flex items-center justify-between">
                  <Skeleton className="h-4 w-16 bg-[#222222]" />
                  <Skeleton className="h-[26px] w-18 rounded-full bg-[#222222]" />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
