"use client"

import * as React from "react"
import { QueryClientProvider } from "@tanstack/react-query"
import { createDefaultQueryClient } from "@forginity/sdk/core/query-client"

export function QueryProvider({ children }: { children: React.ReactNode }) {
  // Ensure a stable QueryClient per browser session without leaking across SSR requests
  const [queryClient] = React.useState(() => createDefaultQueryClient())

  return (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  )
}
