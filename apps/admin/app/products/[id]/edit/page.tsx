"use client"

import * as React from "react"
import Link from "next/link"
import { useParams, useRouter } from "next/navigation"
import {
  ArrowLeft,
  ChevronDown,
  Info,
  Loader2,
  Trash2,
  TriangleAlert,
} from "lucide-react"
import { AppShell } from "@workspace/ui/components/app-shell"
import { Button } from "@workspace/ui/components/button"
import { Card } from "@workspace/ui/components/card"
import { Input } from "@workspace/ui/components/input"
import { Skeleton } from "@workspace/ui/components/skeleton"
import {
  ADMIN_NAV_SECTIONS,
  ADMIN_USER_PROFILE,
} from "@/constants/admin-nav.constants"
import {
  useProduct,
  useUpdateProduct,
} from "@forginity/sdk/modules/products/products.hooks"
import type {
  ProductStatus,
  ProductVersion,
} from "@forginity/sdk/modules/products/products.types"
import { QueryErrorState } from "@/components/query-error-state"
import { StatusPill } from "@/components/status-pill"
import { formatDisplayDate } from "@/lib/date"
import {
  productFormSchema,
  slugify,
} from "@/lib/validators/product-form.validator"

export default function EditProductPage() {
  const router = useRouter()
  const params = useParams<{ id: string }>()
  const id = params?.id as string

  // Fetch product data
  const {
    data: product,
    isLoading,
    isError,
    error: fetchError,
    refetch,
  } = useProduct(id, { versionList: true })

  // Mutation
  const {
    mutateAsync: updateProduct,
    isPending: isSaving,
    error: mutationError,
  } = useUpdateProduct()

  // Form states
  const [name, setName] = React.useState("")
  const [slug, setSlug] = React.useState("")
  const [status, setStatus] = React.useState<ProductStatus>("active")
  const [hasInitialized, setHasInitialized] = React.useState(false)

  // Validation & Submit errors
  const [formErrors, setFormErrors] = React.useState<Record<string, string>>({})
  const [submitError, setSubmitError] = React.useState<unknown | null>(null)

  // Initialize form values from fetched product
  React.useEffect(() => {
    if (product && !hasInitialized) {
      setName(product.name)
      setSlug(product.slug)
      setStatus(product.status)
      setHasInitialized(true)
    }
  }, [product, hasInitialized])

  const versions: ProductVersion[] = product?.versions || []

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setName(e.target.value)
  }

  const handleSlugChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSlug(e.target.value.toLowerCase().replace(/\s+/g, "-"))
  }

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault()
    setFormErrors({})
    setSubmitError(null)

    // Validate inputs using base fields of productFormSchema
    const validation = productFormSchema.pick({ name: true, slug: true, status: true }).safeParse({
      name,
      slug,
      status,
    })

    if (!validation.success) {
      const fieldErrors: Record<string, string> = {}
      validation.error.issues.forEach((issue) => {
        const path = issue.path[0] as string
        if (path && !fieldErrors[path]) {
          fieldErrors[path] = issue.message
        }
      })
      setFormErrors(fieldErrors)
      return
    }

    try {
      await updateProduct({
        id,
        payload: {
          name: validation.data.name,
          slug: validation.data.slug,
          status: validation.data.status,
        },
      })

      // Redirect back to product view on successful save
      router.push(`/products/${id}`)
    } catch (err) {
      setSubmitError(err)
    }
  }

  return (
    <AppShell
      currentPath={`/products/${id}/edit`}
      breadcrumbs={[
        { label: "Workspace" },
        { label: "Product", href: "/products" },
        { label: product?.name || (isLoading ? "Loading..." : "Product"), href: `/products/${id}` },
        { label: "Edit product" },
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
            title="Failed to load product for editing"
          />
        )}

        {/* Loading UI-Stream Skeleton (0.00 CLS) */}
        {!product && !isError && <EditProductSkeleton />}

        {/* Live Content */}
        {product && (
          <form onSubmit={handleSubmit} className="flex flex-col gap-6">
            {/* Page Heading & Introduction */}
            <div className="flex flex-col gap-1">
              <h1 className="text-3xl font-light tracking-tight text-[#F6F6F6]">
                Edit product
              </h1>
              <p className="text-sm font-normal text-[#838383]">
                Update {product.name}’s details and product lifecycle status.
              </p>
            </div>

            {/* Mutation Error Banner */}
            {(submitError || mutationError) && (
              <QueryErrorState
                error={submitError || mutationError}
                onRetry={() => {
                  void handleSubmit()
                }}
                title="Failed to update product"
              />
            )}

            {/* 2-Column Responsive Layout */}
            <div className="flex flex-col lg:flex-row gap-6 items-start">
              {/* Left Column: Form + Danger Zone */}
              <div className="flex-1 w-full flex flex-col gap-6">
                {/* Product Details Form Panel (Figma Node 283:3926) */}
                <Card
                  variant="panel"
                  className="flex flex-col overflow-hidden rounded-[16px] border border-[#292929] bg-[#141414]"
                >
                  {/* Panel Heading */}
                  <div className="flex items-center justify-between px-6 py-5 border-b border-[#292929]">
                    <h2 className="text-base font-normal text-[#F6F6F6]">Product details</h2>
                    <span className="text-xs font-light text-[#838383]">* Required</span>
                  </div>

                  {/* Form Body */}
                  <div className="flex flex-col gap-5 p-6">
                    {/* Field: Product Name */}
                    <div className="flex flex-col gap-2">
                      <div className="flex items-center justify-between text-sm">
                        <label htmlFor="edit-product-name" className="text-[#F6F6F6]">
                          Product name <span className="text-[#FF6347]">*</span>
                        </label>
                        <span className="text-xs text-[#838383] font-mono">
                          {name.length} / 255
                        </span>
                      </div>
                      <Input
                        id="edit-product-name"
                        type="text"
                        value={name}
                        onChange={handleNameChange}
                        placeholder="e.g. PikyRider"
                        maxLength={255}
                        required
                        className="h-11 rounded-[8px] border-[#3A3A3A] bg-[#0E0E0E] text-sm text-[#F6F6F6] placeholder:text-[#555555] focus-visible:border-[#FF6347]"
                      />
                      {formErrors.name && (
                        <p className="text-xs text-rose-400">{formErrors.name}</p>
                      )}
                    </div>

                    {/* Field: Slug */}
                    <div className="flex flex-col gap-2">
                      <div className="flex items-center justify-between text-sm">
                        <label htmlFor="edit-product-slug" className="text-[#F6F6F6]">
                          Slug <span className="text-[#FF6347]">*</span>
                        </label>
                        <span className="text-xs text-[#838383] font-mono">
                          {slug.length} / 100
                        </span>
                      </div>
                      <Input
                        id="edit-product-slug"
                        type="text"
                        value={slug}
                        onChange={handleSlugChange}
                        placeholder="e.g. pikyrider"
                        maxLength={100}
                        required
                        className="h-11 rounded-[8px] border-[#3A3A3A] bg-[#0E0E0E] text-sm font-mono text-[#F6F6F6] placeholder:text-[#555555] focus-visible:border-[#FF6347]"
                      />
                      {formErrors.slug ? (
                        <p className="text-xs text-rose-400">{formErrors.slug}</p>
                      ) : (
                        <p className="text-xs font-light text-[#838383]">
                          Must be unique across products. Use a short, recognizable identifier.
                        </p>
                      )}
                    </div>

                    {/* Field: Product Status */}
                    <div className="flex flex-col gap-2">
                      <div className="flex items-center justify-between text-sm">
                        <label htmlFor="edit-product-status" className="text-[#F6F6F6]">
                          Product status <span className="text-[#FF6347]">*</span>
                        </label>
                      </div>
                      <div className="relative">
                        <select
                          id="edit-product-status"
                          value={status}
                          onChange={(e) => setStatus(e.target.value as ProductStatus)}
                          className="h-11 w-full appearance-none rounded-[8px] border border-[#3A3A3A] bg-[#0E0E0E] px-3 pr-10 text-sm capitalize text-[#F6F6F6] outline-none focus:border-[#FF6347]"
                        >
                          <option value="active">Active (Production Ready)</option>
                          <option value="beta">Beta (Preview Track)</option>
                          <option value="deprecated">Deprecated (Phase Out)</option>
                        </select>
                        <ChevronDown className="pointer-events-none absolute right-3 top-3.5 size-4 text-[#838383]" />
                      </div>
                      <p className="text-xs font-light text-[#838383]">
                        Options: active, beta, deprecated.
                      </p>
                    </div>

                    {/* Status Guidance Callout */}
                    <div className="flex items-start gap-2.5 rounded-[8px] bg-[#0E0E0E] p-3 border border-[#292929]">
                      <Info className="size-4 text-[#838383] shrink-0 mt-0.5" />
                      <p className="text-xs font-light text-[#838383] leading-relaxed">
                        Changing product status does not change the status of its associated versions.
                      </p>
                    </div>
                  </div>

                  {/* Form Actions Footer */}
                  <div className="flex flex-col sm:flex-row items-center justify-between gap-4 px-6 py-5 border-t border-[#292929]">
                    <span className="text-xs font-light text-[#838383] order-2 sm:order-1">
                      Editing {product.name}
                    </span>
                    <div className="flex items-center gap-2.5 w-full sm:w-auto justify-end order-1 sm:order-2">
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
                        type="submit"
                        disabled={isSaving}
                        className="h-10 gap-2 rounded-full bg-gradient-coral px-5 text-sm font-medium text-[#090909] hover:opacity-90 transition-opacity cursor-pointer disabled:opacity-50"
                      >
                        {isSaving ? (
                          <Loader2 className="size-4 animate-spin text-[#090909]" />
                        ) : null}
                        <span>{isSaving ? "Saving..." : "Save changes"}</span>
                      </Button>
                    </div>
                  </div>
                </Card>

                {/* Danger Zone Panel (Figma Node 283:3962) */}
                <div className="flex flex-col gap-5 rounded-[16px] border border-[#643333] bg-[#141414] p-6">
                  <div className="flex items-center gap-2.5">
                    <TriangleAlert className="size-4.5 text-[#E59B9B]" />
                    <h3 className="text-base font-normal text-[#F6F6F6]">Delete product</h3>
                  </div>

                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
                    <p className="text-sm font-normal text-[#B9B9B9] leading-relaxed max-w-xl">
                      Permanently delete {product.name} and all {versions.length} associated
                      version{versions.length === 1 ? "" : "s"}. This action cannot be undone.
                    </p>

                    <Link href={`/products/${id}/delete`} className="shrink-0">
                      <Button
                        type="button"
                        variant="secondary"
                        className="h-10 gap-2 rounded-full border border-[#643333] bg-[#141414] px-5 text-sm font-normal text-[#E59B9B] hover:bg-[#221010] hover:text-red-300 transition-colors cursor-pointer"
                      >
                        <Trash2 className="size-4 text-[#E59B9B]" />
                        <span>Delete product</span>
                      </Button>
                    </Link>
                  </div>
                </div>
              </div>

              {/* Right Column: Read-Only Context (Figma Node 283:3971) */}
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
                    The creation date is set automatically and cannot be edited.
                  </p>
                </Card>

                {/* Associated Versions Card */}
                <Card
                  variant="panel"
                  className="flex flex-col overflow-hidden rounded-[16px] border border-[#292929] bg-[#141414]"
                >
                  <div className="flex flex-col gap-1 p-6 border-b border-[#292929]">
                    <h3 className="text-base font-normal text-[#F6F6F6]">Versions</h3>
                    <p className="text-xs font-light text-[#838383]">
                      {versions.length} associated version{versions.length === 1 ? "" : "s"}.
                      Version statuses are shown for reference.
                    </p>
                  </div>

                  <div className="bg-[#0E0E0E] px-6 py-2.5 flex items-center justify-between text-xs text-[#838383] border-b border-[#292929]">
                    <span>Version</span>
                    <span>Version status</span>
                  </div>

                  {versions.length === 0 ? (
                    <div className="p-6 text-center text-xs text-[#838383]">
                      No versions registered.
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
          </form>
        )}
      </div>
    </AppShell>
  )
}

function EditProductSkeleton() {
  return (
    <div className="flex flex-col gap-6 animate-pulse" data-slot="edit-product-skeleton">
      <div className="flex flex-col gap-1">
        <Skeleton className="h-9 w-48 rounded-md bg-[#1A1A1A]" />
        <Skeleton className="h-5 w-80 max-w-full rounded-md bg-[#1A1A1A]" />
      </div>

      <div className="flex flex-col lg:flex-row gap-6 items-start">
        {/* Left Form Skeleton */}
        <div className="flex-1 w-full flex flex-col gap-6">
          <div className="flex flex-col overflow-hidden rounded-[16px] border border-[#292929] bg-[#141414]">
            <div className="flex items-center justify-between px-6 py-5 border-b border-[#292929]">
              <h2 className="text-base font-normal text-[#F6F6F6]">Product details</h2>
              <span className="text-xs font-light text-[#838383]">* Required</span>
            </div>

            <div className="flex flex-col gap-5 p-6">
              <div className="flex flex-col gap-2">
                <span className="text-sm text-[#F6F6F6]">Product name *</span>
                <Skeleton className="h-11 w-full rounded-[8px] bg-[#0E0E0E] border border-[#3A3A3A]" />
              </div>

              <div className="flex flex-col gap-2">
                <span className="text-sm text-[#F6F6F6]">Slug *</span>
                <Skeleton className="h-11 w-full rounded-[8px] bg-[#0E0E0E] border border-[#3A3A3A]" />
              </div>

              <div className="flex flex-col gap-2">
                <span className="text-sm text-[#F6F6F6]">Product status *</span>
                <Skeleton className="h-11 w-full rounded-[8px] bg-[#0E0E0E] border border-[#3A3A3A]" />
              </div>

              <div className="flex items-start gap-2.5 rounded-[8px] bg-[#0E0E0E] p-3 border border-[#292929]">
                <div className="size-4 rounded-full bg-[#222222] shrink-0 mt-0.5" />
                <p className="text-xs font-light text-[#838383]">
                  Changing product status does not change the status of its associated versions.
                </p>
              </div>
            </div>

            <div className="flex items-center justify-between px-6 py-5 border-t border-[#292929]">
              <Skeleton className="h-4 w-32 bg-[#1C1C1C]" />
              <div className="flex items-center gap-2.5">
                <Skeleton className="h-10 w-20 rounded-full bg-[#222222]" />
                <Skeleton className="h-10 w-32 rounded-full bg-[#222222]" />
              </div>
            </div>
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
              The creation date is set automatically and cannot be edited.
            </p>
          </div>

          <div className="flex flex-col overflow-hidden rounded-[16px] border border-[#292929] bg-[#141414]">
            <div className="flex flex-col gap-1 p-6 border-b border-[#292929]">
              <h3 className="text-base font-normal text-[#F6F6F6]">Versions</h3>
              <Skeleton className="h-4 w-52 bg-[#1C1C1C]" />
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
