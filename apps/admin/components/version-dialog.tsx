"use client"

import * as React from "react"
import { AlertCircle, GitBranch, Loader2 } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@workspace/ui/components/dialog"
import { Button } from "@workspace/ui/components/button"
import { Input } from "@workspace/ui/components/input"
import type {
  ProductVersion,
  VersionStatus,
} from "@forginity/sdk/modules/products/products.types"
import {
  useCreateProductVersion,
  useUpdateProductVersion,
} from "@forginity/sdk/modules/products/products.hooks"
import {
  versionFormSchema,
  type VersionFormValues,
} from "@/lib/validators/version-form.validator"

interface VersionDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  productId: string
  productName: string
  initialData?: ProductVersion | null
}

const VERSION_STATUS_OPTIONS: { label: string; value: VersionStatus; desc: string }[] = [
  { label: "Latest", value: "latest", desc: "Current primary production release" },
  { label: "Supported", value: "supported", desc: "Previous release, still supported" },
  { label: "Deprecated", value: "deprecated", desc: "No longer recommended for use" },
]

export function VersionDialog({
  open,
  onOpenChange,
  productId,
  productName,
  initialData,
}: VersionDialogProps) {
  const isEditing = Boolean(initialData)

  const { mutateAsync: createVersion, isPending: isCreating } =
    useCreateProductVersion(productId)
  const { mutateAsync: updateVersion, isPending: isUpdating } =
    useUpdateProductVersion(productId)

  const isPending = isCreating || isUpdating

  // Form states
  const [version, setVersion] = React.useState("")
  const [status, setStatus] = React.useState<VersionStatus>("latest")
  const [changelog, setChangelog] = React.useState("")
  const [errors, setErrors] = React.useState<Record<string, string>>({})
  const [submitError, setSubmitError] = React.useState<string | null>(null)

  // Populate or reset form when dialog opens
  React.useEffect(() => {
    if (!open) return

    setErrors({})
    setSubmitError(null)

    if (initialData) {
      setVersion(initialData.version)
      setStatus(initialData.status)
      setChangelog(initialData.changelog || "")
    } else {
      setVersion("")
      setStatus("latest")
      setChangelog("")
    }
  }, [open, initialData])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setErrors({})
    setSubmitError(null)

    const result = versionFormSchema.safeParse({
      version: version.trim(),
      status,
      changelog: changelog.trim() || undefined,
    })

    if (!result.success) {
      const fieldErrors: Record<string, string> = {}
      for (const issue of result.error.issues) {
        const key = issue.path[0] ? String(issue.path[0]) : "global"
        fieldErrors[key] = issue.message
      }
      setErrors(fieldErrors)
      return
    }

    try {
      if (isEditing && initialData) {
        await updateVersion({
          versionId: initialData.id,
          payload: {
            version: result.data.version,
            status: result.data.status,
            changelog: result.data.changelog,
          },
        })
      } else {
        await createVersion({
          version: result.data.version,
          status: result.data.status,
          changelog: result.data.changelog,
        })
      }

      onOpenChange(false)
    } catch (err: any) {
      setSubmitError(
        err?.message ||
          "Failed to save version release. Please verify version number uniqueness and retry."
      )
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[540px] rounded-[16px] border border-[#292929] bg-[#141414] p-6 text-[#F6F6F6] shadow-2xl">
        <DialogHeader className="gap-1.5">
          <DialogTitle className="text-xl font-normal tracking-tight text-[#F6F6F6]">
            {isEditing ? "Edit release version" : "Register new release version"}
          </DialogTitle>
          <DialogDescription className="text-xs font-normal text-[#838383]">
            {isEditing
              ? `Update release tag and lifecycle status for ${productName}.`
              : `Deploy and publish a new semantic release track for ${productName}.`}
          </DialogDescription>
        </DialogHeader>

        {submitError && (
          <div className="flex items-center gap-2.5 rounded-lg border border-rose-500/30 bg-rose-950/20 px-3.5 py-2.5 text-xs text-rose-400">
            <AlertCircle className="size-4 shrink-0" />
            <span>{submitError}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col gap-4 py-2">
          {/* Version Identifier */}
          <div className="flex flex-col gap-1.5">
            <label
              htmlFor="version"
              className="text-xs font-normal text-[#838383] flex items-center gap-1.5"
            >
              <GitBranch className="size-3.5 text-[#838383]" />
              <span>Semantic version tag</span>
            </label>
            <Input
              id="version"
              type="text"
              placeholder="e.g. 1.2.0 or v2.0.0"
              value={version}
              onChange={(e) => setVersion(e.target.value)}
              className={`h-10 rounded-lg border bg-[#1A1A1A] font-mono px-3.5 text-xs text-[#F6F6F6] transition-colors focus:border-[#FF967F] focus:outline-none ${
                errors.version ? "border-rose-500" : "border-[#292929]"
              }`}
            />
            {errors.version ? (
              <span className="text-[11px] text-rose-400">{errors.version}</span>
            ) : (
              <span className="text-[11px] text-[#838383]">
                Follows Semantic Versioning: major.minor.patch
              </span>
            )}
          </div>

          {/* Release Track Status */}
          <div className="flex flex-col gap-1.5">
            <label htmlFor="status" className="text-xs font-normal text-[#838383]">
              Release track status
            </label>
            <select
              id="status"
              value={status}
              onChange={(e) => setStatus(e.target.value as VersionStatus)}
              className="h-10 rounded-lg border border-[#292929] bg-[#1A1A1A] px-3 text-xs text-[#F6F6F6] transition-colors focus:border-[#FF967F] focus:outline-none"
            >
              {VERSION_STATUS_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value} className="bg-[#141414]">
                  {opt.label} — {opt.desc}
                </option>
              ))}
            </select>
          </div>

          {/* Release Notes / Availability */}
          <div className="flex flex-col gap-1.5">
            <div className="flex items-center justify-between">
              <label htmlFor="changelog" className="text-xs font-normal text-[#838383]">
                Release availability / changelog notes
              </label>
              <span className="text-[11px] text-[#838383]">
                {changelog.length}/500
              </span>
            </div>
            <textarea
              id="changelog"
              rows={3}
              value={changelog}
              maxLength={500}
              placeholder="e.g. Production release with latency optimizations and enhanced route calculations."
              onChange={(e) => setChangelog(e.target.value)}
              className={`rounded-lg border bg-[#1A1A1A] p-3 text-xs text-[#F6F6F6] transition-colors placeholder:text-[#555] focus:border-[#FF967F] focus:outline-none ${
                errors.changelog ? "border-rose-500" : "border-[#292929]"
              }`}
            />
            {errors.changelog && (
              <span className="text-[11px] text-rose-400">{errors.changelog}</span>
            )}
          </div>

          <DialogFooter className="mt-4 flex flex-row items-center justify-end gap-3 border-t border-[#292929] pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isPending}
              className="h-9 rounded-full border-[#292929] bg-transparent px-4 text-xs font-normal text-[#B9B9B9] hover:bg-white/5 hover:text-[#F6F6F6]"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isPending}
              className="h-9 gap-2 rounded-full bg-gradient-coral px-5 text-xs font-medium text-[#090909] hover:opacity-90 transition-opacity"
            >
              {isPending && <Loader2 className="size-3.5 animate-spin" />}
              <span>{isEditing ? "Save changes" : "Register version"}</span>
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
