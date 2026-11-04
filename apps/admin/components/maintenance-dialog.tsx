"use client"

import * as React from "react"
import { AlertCircle, Calendar, Clock, Loader2 } from "lucide-react"
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
  ProductMaintenance,
  MaintenanceStatus,
} from "@forginity/sdk/modules/products/products.types"
import {
  useCreateProductMaintenance,
  useUpdateProductMaintenance,
} from "@forginity/sdk/modules/products/products.hooks"
import {
  maintenanceFormSchema,
  type MaintenanceFormValues,
} from "@/lib/validators/maintenance-form.validator"
import { toInputDateTime } from "@/lib/date"

interface MaintenanceDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  productId: string
  productName: string
  initialData?: ProductMaintenance | null
}

const MAINTENANCE_STATUS_OPTIONS: { label: string; value: MaintenanceStatus }[] = [
  { label: "Scheduled", value: "scheduled" },
  { label: "Active", value: "active" },
  { label: "Completed", value: "completed" },
  { label: "Cancelled", value: "cancelled" },
]

export function MaintenanceDialog({
  open,
  onOpenChange,
  productId,
  productName,
  initialData,
}: MaintenanceDialogProps) {
  const isEditing = Boolean(initialData)

  const { mutateAsync: createMaintenance, isPending: isCreating } =
    useCreateProductMaintenance(productId)
  const { mutateAsync: updateMaintenance, isPending: isUpdating } =
    useUpdateProductMaintenance(productId)

  const isPending = isCreating || isUpdating

  // Form states
  const [startsAt, setStartsAt] = React.useState("")
  const [endsAt, setEndsAt] = React.useState("")
  const [status, setStatus] = React.useState<MaintenanceStatus>("scheduled")
  const [message, setMessage] = React.useState("")
  const [errors, setErrors] = React.useState<Record<string, string>>({})
  const [submitError, setSubmitError] = React.useState<string | null>(null)

  // Populate or reset form when dialog opens or initialData changes
  React.useEffect(() => {
    if (!open) return

    setErrors({})
    setSubmitError(null)

    if (initialData) {
      setStartsAt(toInputDateTime(initialData.startsAt))
      setEndsAt(toInputDateTime(initialData.endsAt))
      setStatus(initialData.status)
      setMessage(initialData.message)
    } else {
      const now = new Date()
      // Default start: 1 hour in future
      const start = new Date(now.getTime() + 60 * 60 * 1000)
      start.setMinutes(0, 0, 0)
      // Default end: 3 hours in future
      const end = new Date(start.getTime() + 2 * 60 * 60 * 1000)

      setStartsAt(toInputDateTime(start))
      setEndsAt(toInputDateTime(end))
      setStatus("scheduled")
      setMessage("")
    }
  }, [open, initialData])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setErrors({})
    setSubmitError(null)

    const result = maintenanceFormSchema.safeParse({
      startsAt,
      endsAt,
      status,
      message: message.trim(),
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
      const payload = {
        startsAt: new Date(result.data.startsAt).toISOString(),
        endsAt: new Date(result.data.endsAt).toISOString(),
        status: result.data.status,
        message: result.data.message,
      }

      if (isEditing && initialData) {
        await updateMaintenance({
          maintenanceId: initialData.id,
          payload,
        })
      } else {
        await createMaintenance(payload)
      }

      onOpenChange(false)
    } catch (err: any) {
      setSubmitError(
        err?.message ||
          "Failed to save maintenance window. Please check parameters and try again."
      )
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[620px] rounded-[16px] border border-[#292929] bg-[#141414] p-6 text-[#F6F6F6] shadow-2xl">
        <DialogHeader className="gap-1.5">
          <DialogTitle className="text-xl font-normal tracking-tight text-[#F6F6F6]">
            {isEditing ? "Edit maintenance window" : "Schedule maintenance window"}
          </DialogTitle>
          <DialogDescription className="text-xs font-normal text-[#838383]">
            {isEditing
              ? `Update maintenance window parameters for ${productName}.`
              : `Schedule a planned downtime or upgrade window for ${productName}.`}
          </DialogDescription>
        </DialogHeader>

        {submitError && (
          <div className="flex items-center gap-2.5 rounded-lg border border-rose-500/30 bg-rose-950/20 px-3.5 py-2.5 text-xs text-rose-400">
            <AlertCircle className="size-4 shrink-0" />
            <span>{submitError}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col gap-4 py-2">
          {/* Start Time & End Time */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <label
                htmlFor="startsAt"
                className="text-xs font-normal text-[#838383] flex items-center gap-1.5"
              >
                <Calendar className="size-3.5 text-[#838383]" />
                <span>Starts at</span>
              </label>
              <Input
                id="startsAt"
                type="datetime-local"
                value={startsAt}
                onChange={(e) => setStartsAt(e.target.value)}
                className={`h-10 rounded-lg border bg-[#1A1A1A] px-3.5 text-xs text-[#F6F6F6] [color-scheme:dark] transition-colors focus:border-[#FF967F] focus:outline-none ${
                  errors.startsAt ? "border-rose-500" : "border-[#292929]"
                }`}
              />
              {errors.startsAt && (
                <span className="text-[11px] text-rose-400">{errors.startsAt}</span>
              )}
            </div>

            <div className="flex flex-col gap-1.5">
              <label
                htmlFor="endsAt"
                className="text-xs font-normal text-[#838383] flex items-center gap-1.5"
              >
                <Clock className="size-3.5 text-[#838383]" />
                <span>Ends at</span>
              </label>
              <Input
                id="endsAt"
                type="datetime-local"
                value={endsAt}
                onChange={(e) => setEndsAt(e.target.value)}
                className={`h-10 rounded-lg border bg-[#1A1A1A] px-3.5 text-xs text-[#F6F6F6] [color-scheme:dark] transition-colors focus:border-[#FF967F] focus:outline-none ${
                  errors.endsAt ? "border-rose-500" : "border-[#292929]"
                }`}
              />
              {errors.endsAt && (
                <span className="text-[11px] text-rose-400">{errors.endsAt}</span>
              )}
            </div>
          </div>

          {/* Lifecycle Status */}
          <div className="flex flex-col gap-1.5">
            <label htmlFor="status" className="text-xs font-normal text-[#838383]">
              Maintenance status
            </label>
            <select
              id="status"
              value={status}
              onChange={(e) => setStatus(e.target.value as MaintenanceStatus)}
              className="h-10 rounded-lg border border-[#292929] bg-[#1A1A1A] px-3 text-xs text-[#F6F6F6] transition-colors focus:border-[#FF967F] focus:outline-none"
            >
              {MAINTENANCE_STATUS_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value} className="bg-[#141414]">
                  {opt.label}
                </option>
              ))}
            </select>
          </div>

          {/* Announcement Message */}
          <div className="flex flex-col gap-1.5">
            <div className="flex items-center justify-between">
              <label htmlFor="message" className="text-xs font-normal text-[#838383]">
                Customer announcement message
              </label>
              <span className="text-[11px] text-[#838383]">
                {message.length}/500
              </span>
            </div>
            <textarea
              id="message"
              rows={3}
              value={message}
              maxLength={500}
              placeholder="e.g. Scheduled database maintenance and platform upgrades. Service may experience brief latency."
              onChange={(e) => setMessage(e.target.value)}
              className={`rounded-lg border bg-[#1A1A1A] p-3 text-xs text-[#F6F6F6] transition-colors placeholder:text-[#555] focus:border-[#FF967F] focus:outline-none ${
                errors.message ? "border-rose-500" : "border-[#292929]"
              }`}
            />
            {errors.message && (
              <span className="text-[11px] text-rose-400">{errors.message}</span>
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
              <span>{isEditing ? "Save changes" : "Schedule window"}</span>
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
