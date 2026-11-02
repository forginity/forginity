"use client"

import * as React from "react"
import { AlertTriangle, RefreshCw } from "lucide-react"
import { Button } from "@workspace/ui/components/button"
import { ApiError } from "@forginity/sdk/core/api-error"

interface QueryErrorStateProps {
  error: unknown
  onRetry: () => void
  title?: string
  description?: string
  className?: string
}

export function QueryErrorState({
  error,
  onRetry,
  title = "Failed to load product data",
  description,
  className = "",
}: QueryErrorStateProps) {
  const isApiErr = ApiError.isApiError(error)
  const errorMessage = isApiErr
    ? error.message
    : error instanceof Error
    ? error.message
    : "An unexpected network or service error occurred"
  const statusCode = isApiErr ? error.status : undefined
  const errorCode = isApiErr ? error.code : undefined

  return (
    <div
      role="alert"
      className={`flex flex-col items-center justify-center rounded-[16px] border border-red-500/20 bg-red-500/[0.04] p-8 text-center ${className}`}
    >
      <div className="flex size-12 items-center justify-center rounded-full border border-red-500/30 bg-red-500/10 text-red-400 mb-4">
        <AlertTriangle className="size-6" />
      </div>

      <h3 className="text-base font-normal text-[#F6F6F6] mb-1">{title}</h3>

      <p className="max-w-md text-xs font-light text-[#B9B9B9] mb-3">
        {description || errorMessage}
      </p>

      {(statusCode || errorCode) && (
        <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-[#292929] bg-[#0E0E0E] px-3 py-1 text-[11px] font-mono text-[#838383]">
          {statusCode ? `HTTP ${statusCode}` : null}
          {statusCode && errorCode ? "·" : null}
          {errorCode ? errorCode : null}
        </div>
      )}

      <Button
        variant="secondary"
        size="sm"
        onClick={onRetry}
        className="h-9 gap-2 rounded-full border border-[#3A3A3A] bg-[#1A1A1A] px-4 text-xs font-normal text-[#F6F6F6] hover:bg-[#292929] hover:border-[#FF6347]/50 transition-colors"
      >
        <RefreshCw className="size-3.5" />
        <span>Try again</span>
      </Button>
    </div>
  )
}
