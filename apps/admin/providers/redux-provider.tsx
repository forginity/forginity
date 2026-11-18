"use client"

import * as React from "react"
import { Provider } from "react-redux"
import { store } from "@/lib/store/index"
import { clearUser } from "@/lib/store/slices/user-slice"
import {
  setAuthTokenProvider,
  setUnauthorizedHandler,
} from "@forginity/sdk/core/http-client"

export interface ReduxProviderProps {
  children: React.ReactNode
}

let isRedirectingToLogin = false

function registerClientAuthInterceptors(): void {
  if (typeof window === "undefined") return

  // Connect SDK token provider to client storage
  setAuthTokenProvider(() => {
    if (typeof window === "undefined") return null
    try {
      return localStorage.getItem("admin_access_token")
    } catch {
      return null
    }
  })

  // Redirect to /login whenever a protected request remains unauthorized after silent refresh fails
  setUnauthorizedHandler(() => {
    store.dispatch(clearUser())

    if (typeof window === "undefined") return

    try {
      localStorage.removeItem("admin_access_token")
      localStorage.removeItem("access_token")
      localStorage.removeItem("admin_user")
      document.cookie = "admin_session=; path=/; max-age=0"
    } catch {
      // Ignore storage errors
    }

    if (window.location.pathname !== "/login" && !isRedirectingToLogin) {
      isRedirectingToLogin = true
      window.location.replace("/login?expired=1")
    }
  })
}

// Register immediately on client module evaluation so handlers are ready before initial queries fire
registerClientAuthInterceptors()

export function ReduxProvider({ children }: ReduxProviderProps) {
  React.useEffect(() => {
    isRedirectingToLogin = false
    registerClientAuthInterceptors()
  }, [])

  return <Provider store={store}>{children}</Provider>
}
