"use client"

import * as React from "react"
import {
  CalendarClock,
  Edit2,
  Loader2,
  Plus,
  Trash2,
  AlertTriangle,
} from "lucide-react"
import { Card } from "@workspace/ui/components/card"
import { Button } from "@workspace/ui/components/button"
import type { ProductMaintenance } from "@forginity/sdk/modules/products/products.types"
import {
  useProductMaintenance,
  useDeleteProductMaintenance,
} from "@forginity/sdk/modules/products/products.hooks"
import { StatusPill } from "@/components/status-pill"
import { formatDisplayDateTime } from "@/lib/date"
import { MaintenanceDialog } from "@/components/maintenance-dialog"
import { MaintenancePanelSkeleton } from "@/components/maintenance-panel-skeleton"

interface MaintenancePanelProps {
  productId: string
  productName: string
}

export function MaintenancePanel({
  productId,
  productName,
}: MaintenancePanelProps) {
  const {
    data: maintenanceData,
    isLoading,
    isError,
    error,
    refetch,
  } = useProductMaintenance(productId)

  const { mutateAsync: deleteMaintenance } =
    useDeleteProductMaintenance(productId)

  const [dialogOpen, setDialogOpen] = React.useState(false)
  const [selectedMaintenance, setSelectedMaintenance] =
    React.useState<ProductMaintenance | null>(null)
  const [deletingId, setDeletingId] = React.useState<string | null>(null)

  const maintenanceItems = maintenanceData?.items || []

  const handleOpenCreate = () => {
    setSelectedMaintenance(null)
    setDialogOpen(true)
  }

  const handleOpenEdit = (item: ProductMaintenance) => {
    setSelectedMaintenance(item)
    setDialogOpen(true)
  }

  const handleDelete = async (item: ProductMaintenance) => {
    const isConfirmed = window.confirm(
      `Are you sure you want to cancel and remove this maintenance window scheduled for ${formatDisplayDateTime(
        item.startsAt
      )}?`
    )
    if (!isConfirmed) return

    setDeletingId(item.id)
    try {
      await deleteMaintenance(item.id)
    } finally {
      setDeletingId(null)
    }
  }

  if (isLoading) {
    return <MaintenancePanelSkeleton />
  }

  return (
    <>
      <Card
        variant="panel"
        className="flex flex-col overflow-hidden rounded-[16px] border border-[#292929] bg-[#141414]"
      >
        {/* Panel Heading */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 border-b border-[#292929]">
          <div className="flex flex-col gap-1">
            <h2 className="text-base font-normal text-[#F6F6F6]">
              Maintenance windows
            </h2>
            <p className="text-xs font-light text-[#838383]">
              Schedule planned downtime, system upgrades, and customer notices for{" "}
              {productName}.
            </p>
          </div>

          <Button
            onClick={handleOpenCreate}
            className="h-9 gap-2 rounded-full bg-gradient-coral px-4 text-xs font-medium text-[#090909] hover:opacity-90 transition-opacity self-start sm:self-auto cursor-pointer shrink-0"
          >
            <Plus className="size-3.5 text-[#090909]" />
            <span>Schedule window</span>
          </Button>
        </div>

        {/* Error State Banner */}
        {isError && (
          <div className="m-6 flex items-center justify-between rounded-lg border border-rose-500/30 bg-rose-950/20 px-4 py-3 text-xs text-rose-400">
            <div className="flex items-center gap-2">
              <AlertTriangle className="size-4 shrink-0" />
              <span>
                Failed to load maintenance schedules:{" "}
                {(error as any)?.message || "Internal error"}
              </span>
            </div>
            <button
              onClick={() => refetch()}
              className="text-xs font-medium text-[#FF967F] underline hover:opacity-80 cursor-pointer"
            >
              Retry
            </button>
          </div>
        )}

        {/* Table Column Headings */}
        <div className="bg-[#0E0E0E] h-10 px-6 flex items-center gap-6 text-xs text-[#838383] font-normal border-b border-[#292929] overflow-x-auto">
          <span className="w-[240px] shrink-0">Time window</span>
          <span className="w-[140px] shrink-0">Status</span>
          <span className="flex-1 min-w-[200px]">Customer notice</span>
          <span className="w-[100px] shrink-0 text-right">Actions</span>
        </div>

        {/* Maintenance Rows */}
        {maintenanceItems.length === 0 ? (
          <div className="flex flex-col items-center justify-center p-12 text-center">
            <CalendarClock className="size-8 text-[#555] mb-2" />
            <p className="text-sm text-[#F6F6F6] font-normal">
              No maintenance windows scheduled
            </p>
            <p className="text-xs text-[#838383] max-w-sm mt-1">
              Active maintenance windows notify customers and provide operational
              transparency during updates.
            </p>
            <Button
              variant="outline"
              onClick={handleOpenCreate}
              className="mt-4 h-8 rounded-full border-[#292929] bg-transparent px-3.5 text-xs text-[#B9B9B9] hover:bg-white/5 hover:text-[#F6F6F6]"
            >
              Schedule first window
            </Button>
          </div>
        ) : (
          <div className="divide-y divide-[#292929] overflow-x-auto">
            {maintenanceItems.map((item) => {
              const isItemDeleting = deletingId === item.id

              return (
                <div
                  key={item.id}
                  className="min-h-[74px] px-6 py-3 flex items-center gap-6 transition-colors hover:bg-white/[0.02]"
                >
                  {/* Timeline Window */}
                  <div className="w-[240px] shrink-0 flex flex-col gap-1">
                    <span className="text-xs font-medium text-[#F6F6F6]">
                      {formatDisplayDateTime(item.startsAt)}
                    </span>
                    <span className="text-[11px] text-[#838383]">
                      until {formatDisplayDateTime(item.endsAt)}
                    </span>
                  </div>

                  {/* Status Pill */}
                  <div className="w-[140px] shrink-0 flex items-center">
                    <StatusPill status={item.status} />
                  </div>

                  {/* Customer Notice Message */}
                  <div className="flex-1 min-w-[200px] text-xs text-[#B9B9B9] leading-relaxed line-clamp-2">
                    {item.message}
                  </div>

                  {/* Actions */}
                  <div className="w-[100px] shrink-0 flex items-center justify-end gap-1.5">
                    <button
                      type="button"
                      onClick={() => handleOpenEdit(item)}
                      title="Edit maintenance window"
                      className="p-1.5 rounded-lg text-[#838383] hover:text-[#F6F6F6] hover:bg-white/5 transition-colors cursor-pointer"
                    >
                      <Edit2 className="size-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDelete(item)}
                      disabled={isItemDeleting}
                      title="Cancel maintenance window"
                      className="p-1.5 rounded-lg text-[#838383] hover:text-rose-400 hover:bg-rose-950/20 transition-colors cursor-pointer disabled:opacity-40"
                    >
                      {isItemDeleting ? (
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
        <div className="px-6 py-4 border-t border-[#292929] flex items-center justify-between">
          <p className="text-xs font-light text-[#838383]">
            Showing {maintenanceItems.length} maintenance window
            {maintenanceItems.length === 1 ? "" : "s"}
          </p>
        </div>
      </Card>

      {/* Schedule / Edit Maintenance Dialog */}
      <MaintenanceDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        productId={productId}
        productName={productName}
        initialData={selectedMaintenance}
      />
    </>
  )
}
