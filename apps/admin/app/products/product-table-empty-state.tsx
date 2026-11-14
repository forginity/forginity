"use client"

import * as React from "react"
import { PackageOpen, X } from "lucide-react"
import { Button } from "@workspace/ui/components/button"

interface ProductTableEmptyStateProps {
  searchTerm?: string
  activeTab?: string
  onResetFilters: () => void
}

export function ProductTableEmptyState({
  searchTerm,
  activeTab,
  onResetFilters,
}: ProductTableEmptyStateProps) {
  const isFiltered = Boolean(searchTerm || (activeTab && activeTab !== "all"))

  return (
    <div className="flex flex-col items-center justify-center p-12 text-center">
      <div className="flex size-14 items-center justify-center rounded-2xl border border-[#292929] bg-[#1A1A1A] text-[#838383] mb-4">
        <PackageOpen className="size-7 text-[#838383]" />
      </div>

      <h3 className="text-base font-normal text-[#F6F6F6] mb-1">
        {isFiltered ? "No matching products found" : "No products available yet"}
      </h3>

      <p className="max-w-md text-xs font-light text-[#838383] mb-5">
        {isFiltered
          ? searchTerm
            ? `No products matched the search term "${searchTerm}". Try checking for typos or resetting your filters.`
            : `There are currently no products under the "${activeTab}" lifecycle category.`
          : "Get started by registering your first digital product in the Forginity ecosystem."}
      </p>

      {isFiltered ? (
        <Button
          variant="secondary"
          size="sm"
          onClick={onResetFilters}
          className="h-9 gap-2 rounded-full border border-[#3A3A3A] bg-[#1A1A1A] px-4 text-xs font-normal text-[#F6F6F6] hover:bg-[#292929] transition-colors"
        >
          <X className="size-3.5" />
          <span>Clear filters</span>
        </Button>
      ) : null}
    </div>
  )
}
