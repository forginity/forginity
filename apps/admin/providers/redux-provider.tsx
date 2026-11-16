"use client"

import * as React from "react"
import { Provider } from "react-redux"
import { store } from "@/lib/store/index"
import { setAuthTokenProvider } from "@forginity/sdk/core/http-client"

export interface ReduxProviderProps {
  children: React.ReactNode
}

export function ReduxProvider({ children }: ReduxProviderProps) {
  React.useEffect(() => {
    // Connect SDK token provider to client storage
    setAuthTokenProvider(() => {
      if (typeof window === "undefined") return null
      return localStorage.getItem("admin_access_token")
    })
  }, [])

  return <Provider store={store}>{children}</Provider>
}
