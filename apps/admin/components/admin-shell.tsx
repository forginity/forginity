"use client"

import * as React from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { AppShell, type AppShellProps } from "@workspace/ui/components/app-shell"
import { ADMIN_NAV_SECTIONS } from "@/constants/admin-nav.constants"
import { useAppDispatch, useAppSelector } from "@/lib/store/index"
import { clearUser, setUser } from "@/lib/store/slices/user-slice"
import {
  useCurrentSession,
  useLogout,
} from "@forginity/sdk/modules/auth/auth.hooks"
import type { UserProfile } from "@workspace/ui/types/navigation.types"

export interface AdminShellProps
  extends Omit<AppShellProps, "sections" | "user" | "linkComponent" | "onLogout"> {
  user?: UserProfile
  onLogout?: () => void
}

export function AdminShell({
  children,
  user: customUser,
  onLogout: customLogout,
  ...restProps
}: AdminShellProps) {
  const router = useRouter()
  const dispatch = useAppDispatch()
  const reduxUser = useAppSelector((state) => state.user.user)

  // Hydrate local cache once mounted on the client to avoid SSR hydration mismatch
  React.useEffect(() => {
    if (!reduxUser && typeof window !== "undefined") {
      try {
        const stored = localStorage.getItem("admin_user")
        if (stored) {
          dispatch(setUser(JSON.parse(stored)))
        }
      } catch {
        // ignore storage errors
      }
    }
  }, [reduxUser, dispatch])

  // Always verify active session with auth microservice (cached for 5m via TanStack Query)
  // so expired or revoked sessions cannot stay masked by stale localStorage data.
  const { data: sessionData } = useCurrentSession()

  React.useEffect(() => {
    if (
      sessionData?.user &&
      (!reduxUser ||
        reduxUser.id !== sessionData.user.id ||
        reduxUser.updatedAt !== sessionData.user.updatedAt)
    ) {
      dispatch(setUser(sessionData.user))
    }
  }, [sessionData, reduxUser, dispatch])

  const logoutMutation = useLogout()

  const handleLogout = async () => {
    if (customLogout) {
      customLogout()
      return
    }

    try {
      await logoutMutation.mutateAsync()
    } catch {
      // Proceed with local revocation even if network logout fails
    } finally {
      dispatch(clearUser())
      if (typeof window !== "undefined") {
        localStorage.removeItem("admin_access_token")
        localStorage.removeItem("admin_user")
        document.cookie = "admin_session=; path=/; max-age=0"
        window.location.replace("/login?logged_out=1")
        return
      }
      router.replace("/login")
    }
  }

  const activeUser: UserProfile | undefined = React.useMemo(() => {
    if (customUser) return customUser

    const current = reduxUser || sessionData?.user
    if (current) {
      const displayName =
        current.firstName && current.lastName
          ? `${current.firstName} ${current.lastName}`
          : current.name ||
            (current.email ? current.email.split("@")[0] : null) ||
            "Administrator"

      const firstInitial = (current.firstName?.[0] || displayName[0] || "A").toUpperCase()
      const secondInitial = (
        current.lastName?.[0] ||
        (displayName.includes(" ") ? displayName.split(" ")[1]?.[0] : "") ||
        ""
      ).toUpperCase()

      const initials = secondInitial ? `${firstInitial}${secondInitial}` : firstInitial

      return {
        name: displayName,
        email: current.email || undefined,
        role:
          current.userType === "admin"
            ? "Organization admin"
            : current.userType || "Administrator",
        initials,
      }
    }

    return undefined
  }, [customUser, reduxUser, sessionData])

  return (
    <AppShell
      sections={ADMIN_NAV_SECTIONS}
      user={activeUser}
      linkComponent={Link}
      onLogout={handleLogout}
      {...restProps}
    >
      {children}
    </AppShell>
  )
}
