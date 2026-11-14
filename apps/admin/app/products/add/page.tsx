"use client"

import * as React from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import {
  ArrowLeft,
  ChevronDown,
  Info,
  Loader2,
  Plus,
} from "lucide-react"
import { AppShell } from "@workspace/ui/components/app-shell"
import { Button } from "@workspace/ui/components/button"
import { Card } from "@workspace/ui/components/card"
import { Input } from "@workspace/ui/components/input"
import {
  ADMIN_NAV_SECTIONS,
  ADMIN_USER_PROFILE,
} from "@/constants/admin-nav.constants"
import { useCreateProduct } from "@forginity/sdk/modules/products/products.hooks"
import type { ProductStatus, VersionStatus } from "@forginity/sdk/modules/products/products.types"
import { ApiError } from "@forginity/sdk/core/api-error"
import { QueryErrorState } from "@/components/query-error-state"
import {
  productFormSchema,
  slugify,
  type ProductFormValues,
} from "@/lib/validators/product-form.validator"

export default function AddProductPage() {
  const router = useRouter()
  const { mutateAsync: createProduct, isPending, error: mutationError } = useCreateProduct()

  // Form states
  const [name, setName] = React.useState("")
  const [slug, setSlug] = React.useState("")
  const [isSlugManual, setIsSlugManual] = React.useState(false)
  const [status, setStatus] = React.useState<ProductStatus>("active")

  // Version states
  const [version, setVersion] = React.useState("1.0.0")
  const [versionStatus, setVersionStatus] = React.useState<VersionStatus>("latest")
  const [changelog, setChangelog] = React.useState("Initial release")

  // Validation errors
  const [formErrors, setFormErrors] = React.useState<Record<string, string>>({})
  const [submitError, setSubmitError] = React.useState<unknown | null>(null)

  // Auto-slug generator: auto-populates slug from product name until manually edited
  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value
    setName(val)
    if (!isSlugManual) {
      setSlug(slugify(val))
    }
  }

  const handleSlugChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setIsSlugManual(true)
    setSlug(e.target.value.toLowerCase().replace(/\s+/g, "-"))
  }

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault()
    setFormErrors({})
    setSubmitError(null)

    const payload: ProductFormValues = {
      name,
      slug,
      status,
      hasVersion: true,
      version,
      versionStatus,
      changelog,
    }

    const validation = productFormSchema.safeParse(payload)
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
      await createProduct({
        name: validation.data.name,
        slug: validation.data.slug,
        status: validation.data.status,
        initialVersion: validation.data.version
          ? {
              version: validation.data.version,
              status: validation.data.versionStatus,
              changelog: validation.data.changelog,
            }
          : undefined,
      })

      // Redirect back to products catalog on success
      router.push("/products")
    } catch (err) {
      setSubmitError(err)
    }
  }

  return (
    <AppShell
      currentPath="/products/add"
      breadcrumbs={[
        { label: "Workspace" },
        { label: "Product", href: "/products" },
        { label: "Add product" },
      ]}
      sections={ADMIN_NAV_SECTIONS}
      user={ADMIN_USER_PROFILE}
      linkComponent={Link}
    >
      <form onSubmit={handleSubmit} className="flex flex-col gap-6">
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

        {/* Page Heading */}
        <div className="flex flex-col gap-1">
          <h1 className="text-3xl font-light tracking-tight text-[#F6F6F6]">
            Add product
          </h1>
          <p className="text-sm font-normal text-[#838383]">
            Create a product and its initial version to start managing releases.
          </p>
        </div>

        {/* Global Error Banner */}
        {(submitError || mutationError) && (
          <QueryErrorState
            error={submitError || mutationError}
            onRetry={() => {
              void handleSubmit()
            }}
          />
        )}

        {/* Unified Product Creation Form Card */}
        <Card
          variant="panel"
          className="flex flex-col overflow-hidden rounded-[16px] border border-[#292929] bg-[#141414]"
        >
          {/* Section 1: Product Details Heading */}
          <div className="flex items-center justify-between px-6 pt-6 pb-1">
            <h2 className="text-base font-normal text-[#F6F6F6]">Product details</h2>
            <span className="text-xs font-light text-[#838383]">* Required</span>
          </div>

          {/* Section 1 Body: Product Details Fields */}
          <div className="flex flex-col gap-5 px-6 pb-6 pt-4">
            {/* Field: Product Name */}
            <div className="flex flex-col gap-2">
              <div className="flex items-center justify-between text-sm">
                <label htmlFor="product-name" className="text-[#F6F6F6]">
                  Product name <span className="text-[#FF6347]">*</span>
                </label>
                <span className="text-xs text-[#838383] font-mono">
                  {name.length} / 255
                </span>
              </div>
              <Input
                id="product-name"
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
                <label htmlFor="product-slug" className="text-[#F6F6F6]">
                  Slug <span className="text-[#FF6347]">*</span>
                </label>
                <span className="text-xs text-[#838383] font-mono">
                  {slug.length} / 100
                </span>
              </div>
              <Input
                id="product-slug"
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
                <label htmlFor="product-status" className="text-[#F6F6F6]">
                  Product status <span className="text-[#FF6347]">*</span>
                </label>
                <span className="text-xs text-[#838383]">Default</span>
              </div>
              <div className="relative">
                <select
                  id="product-status"
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

          {/* Section 2: Initial Version Divider & Heading */}
          <div className="flex flex-col gap-1 px-6 pt-6 pb-1 border-t border-[#292929]">
            <h2 className="text-base font-normal text-[#F6F6F6]">Initial version</h2>
            <p className="text-xs font-light text-[#838383]">
              This version will be created with your product.
            </p>
          </div>

          {/* Section 2 Body: Version Fields Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 px-6 pb-6 pt-4">
            {/* Field: Version String */}
            <div className="flex flex-col gap-2">
              <div className="flex items-center justify-between text-sm">
                <label htmlFor="initial-version" className="text-[#F6F6F6]">
                  Version <span className="text-[#FF6347]">*</span>
                </label>
                <span className="text-xs text-[#838383] font-mono">
                  {version.length} / 50
                </span>
              </div>
              <Input
                id="initial-version"
                type="text"
                value={version}
                onChange={(e) => setVersion(e.target.value)}
                placeholder="1.0.0"
                maxLength={50}
                required
                className="h-11 rounded-[8px] border-[#3A3A3A] bg-[#0E0E0E] text-sm font-mono text-[#F6F6F6] placeholder:text-[#555555] focus-visible:border-[#FF6347]"
              />
              {formErrors.version ? (
                <p className="text-xs text-rose-400">{formErrors.version}</p>
              ) : (
                <p className="text-xs font-light text-[#838383]">
                  A release identifier, e.g. 1.0.0.
                </p>
              )}
            </div>

            {/* Field: Version Status */}
            <div className="flex flex-col gap-2">
              <div className="flex items-center justify-between text-sm">
                <label htmlFor="initial-version-status" className="text-[#F6F6F6]">
                  Version status <span className="text-[#FF6347]">*</span>
                </label>
                <span className="text-xs text-[#838383]">Default</span>
              </div>
              <div className="relative">
                <select
                  id="initial-version-status"
                  value={versionStatus}
                  onChange={(e) => setVersionStatus(e.target.value as VersionStatus)}
                  className="h-11 w-full appearance-none rounded-[8px] border border-[#3A3A3A] bg-[#0E0E0E] px-3 pr-10 text-sm capitalize text-[#F6F6F6] outline-none focus:border-[#FF6347]"
                >
                  <option value="latest">Latest (Active Track)</option>
                  <option value="supported">Supported (Maintained)</option>
                  <option value="deprecated">Deprecated</option>
                </select>
                <ChevronDown className="pointer-events-none absolute right-3 top-3.5 size-4 text-[#838383]" />
              </div>
              <p className="text-xs font-light text-[#838383]">
                Options: latest, supported, deprecated.
              </p>
            </div>

            {/* Optional Changelog Notes (Full Width) */}
            <div className="sm:col-span-2 flex flex-col gap-2">
              <label htmlFor="initial-changelog" className="text-sm text-[#F6F6F6]">
                Changelog / Release notes (optional)
              </label>
              <Input
                id="initial-changelog"
                type="text"
                value={changelog}
                onChange={(e) => setChangelog(e.target.value)}
                placeholder="Initial release notes..."
                maxLength={500}
                className="h-11 rounded-[8px] border-[#3A3A3A] bg-[#0E0E0E] text-sm text-[#F6F6F6] placeholder:text-[#555555] focus-visible:border-[#FF6347]"
              />
            </div>
          </div>

          {/* Form Actions Footer at End of Combined Form */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 px-6 py-5 border-t border-[#292929]">
            <span className="text-xs font-light text-[#838383] order-2 sm:order-1">
              Creating new product
            </span>
            <div className="flex items-center gap-2.5 w-full sm:w-auto justify-end order-1 sm:order-2">
              <Link href="/products">
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
                disabled={isPending}
                className="h-10 gap-2 rounded-full bg-gradient-coral px-5 text-sm font-medium text-[#090909] hover:opacity-90 transition-opacity cursor-pointer disabled:opacity-50"
              >
                {isPending ? (
                  <Loader2 className="size-4 animate-spin text-[#090909]" />
                ) : (
                  <Plus className="size-4 text-[#090909]" />
                )}
                <span>{isPending ? "Adding..." : "Add product"}</span>
              </Button>
            </div>
          </div>
        </Card>
      </form>
    </AppShell>
  )
}
