"use client"

import * as React from "react"
import {
  ArrowLeft,
  Shield,
  ShieldAlert,
  ShieldCheck,
  Mail,
  Phone,
  Globe,
  Calendar,
  KeyRound,
  UserCheck,
  UserX,
  AlertTriangle,
  HeartHandshake,
  Laptop,
  CheckCircle2,
  Clock,
  Loader2,
} from "lucide-react"
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@workspace/ui/components/sheet"
import { useUser, useUpdateUserStatus } from "@forginity/sdk/modules/auth/auth.hooks"
import type { UserStatus, AuthProvider } from "@forginity/sdk/modules/auth/auth.types"
import { cn } from "@workspace/ui/lib/utils"

export interface UserDetailSheetProps {
  userId: string | null
  isOpen: boolean
  onClose: () => void
}

function formatDetailDate(isoString?: string): string {
  if (!isoString) return "—"
  try {
    const d = new Date(isoString)
    if (isNaN(d.getTime())) return "—"
    const day = d.getUTCDate()
    const months = [
      "Jan", "Feb", "Mar", "Apr", "May", "Jun",
      "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
    ]
    const month = months[d.getUTCMonth()]
    const year = d.getUTCFullYear()
    const hours = String(d.getUTCHours()).padStart(2, "0")
    const minutes = String(d.getUTCMinutes()).padStart(2, "0")
    return `${day} ${month} ${year}, ${hours}:${minutes} UTC`
  } catch {
    return "—"
  }
}

function formatProviderLabel(provider?: AuthProvider | null): string {
  if (!provider) return "Email OTP"
  if (provider === "google") return "Google OAuth"
  if (provider === "email_otp") return "Email OTP"
  if (provider === "password") return "Password"
  return provider
}

export function UserDetailSheet({
  userId,
  isOpen,
  onClose,
}: UserDetailSheetProps) {
  const { data, isLoading, isError, error, refetch } = useUser(userId, {
    enabled: Boolean(userId) && isOpen,
  })

  const updateStatusMutation = useUpdateUserStatus()
  const [actionError, setActionError] = React.useState<string | null>(null)
  const [actionSuccess, setActionSuccess] = React.useState<string | null>(null)
  const [confirmingStatus, setConfirmingStatus] = React.useState<UserStatus | null>(null)

  // Reset state when opening/closing
  React.useEffect(() => {
    if (!isOpen) {
      setActionError(null)
      setActionSuccess(null)
      setConfirmingStatus(null)
    }
  }, [isOpen])

  const user = data?.user
  const contacts = data?.emergencyContacts || []
  const activeSessionsCount = data?.activeSessionsCount ?? 0

  const handleUpdateStatus = async (newStatus: UserStatus) => {
    if (!userId) return
    setActionError(null)
    setActionSuccess(null)

    try {
      await updateStatusMutation.mutateAsync({
        userId,
        payload: {
          status: newStatus,
          reason: `Admin manual update to ${newStatus}`,
        },
      })
      setActionSuccess(`User status successfully updated to ${newStatus}.`)
      setConfirmingStatus(null)
      refetch()
    } catch (err: any) {
      setActionError(err?.message || `Failed to update status to ${newStatus}.`)
    }
  }

  const fullName =
    user?.firstName && user?.lastName
      ? `${user.firstName} ${user.lastName}`
      : user?.name || "Unnamed User"

  const initials = (() => {
    if (user?.firstName && user?.lastName) {
      return `${user.firstName.charAt(0)}${user.lastName.charAt(0)}`.toUpperCase()
    }
    if (user?.name) {
      return user.name.slice(0, 2).toUpperCase()
    }
    if (user?.email) {
      return user.email.slice(0, 2).toUpperCase()
    }
    return "U"
  })()

  return (
    <Sheet open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <SheetContent
        side="right"
        className="w-full sm:max-w-xl md:max-w-2xl bg-[#090909] border-l border-[#292929] text-[#f6f6f6] p-0 flex flex-col h-full shadow-2xl overflow-hidden"
      >
        {/* Top Navigation Bar */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#292929] bg-[#0e0e0e] shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="inline-flex items-center gap-2 text-xs font-medium text-[#b9b9b9] hover:text-[#f6f6f6] transition-colors cursor-pointer"
          >
            <ArrowLeft className="size-3.5" />
            <span>All users</span>
          </button>

          <span className="text-xs text-[#838383] font-mono">
            {userId ? `ID: ${userId.slice(0, 8)}...` : ""}
          </span>
        </div>

        {/* Scrollable Content Area */}
        <div className="flex-1 overflow-y-auto px-6 py-6 space-y-6">
          {/* Header Title Section */}
          <SheetHeader className="p-0 space-y-1">
            <SheetTitle className="text-2xl font-light text-[#f6f6f6] tracking-tight">
              User details
            </SheetTitle>
            <SheetDescription className="text-xs text-[#929292]">
              View profile information, sign-in method, verification, and moderation controls.
            </SheetDescription>
          </SheetHeader>

          {/* Feedback Messages */}
          {actionSuccess && (
            <div className="rounded-lg border border-emerald-500/30 bg-emerald-500/10 p-3 text-xs text-emerald-400 flex items-center gap-2">
              <CheckCircle2 className="size-4 shrink-0" />
              <span>{actionSuccess}</span>
            </div>
          )}

          {actionError && (
            <div className="rounded-lg border border-[#d94f2e]/30 bg-[#d94f2e]/10 p-3 text-xs text-[#ff967f] flex items-center gap-2">
              <AlertTriangle className="size-4 shrink-0" />
              <span>{actionError}</span>
            </div>
          )}

          {isLoading ? (
            // Skeleton while fetching user details
            <div className="space-y-4 animate-pulse">
              <div className="h-[120px] rounded-[10px] bg-[#141414] border border-[#292929] p-5" />
              <div className="h-[180px] rounded-[10px] bg-[#141414] border border-[#292929] p-5" />
              <div className="h-[160px] rounded-[10px] bg-[#141414] border border-[#292929] p-5" />
            </div>
          ) : isError || !user ? (
            // Error State
            <div className="rounded-xl border border-[#292929] bg-[#141414] p-8 text-center">
              <AlertTriangle className="size-8 text-[#ff6347] mx-auto mb-2" />
              <p className="text-sm font-medium text-[#f6f6f6]">
                Unable to load user profile
              </p>
              <p className="text-xs text-[#929292] mt-1 mb-4">
                {error?.message || "User account not found or access was restricted."}
              </p>
              <button
                type="button"
                onClick={() => refetch()}
                className="rounded-lg bg-[#252525] px-3.5 py-1.5 text-xs text-[#f6f6f6] hover:bg-[#333333] transition-colors"
              >
                Retry
              </button>
            </div>
          ) : (
            <>
              {/* Account Summary Hero Card (Matching Figma Node 310:511 - 310:516) */}
              <div className="rounded-[10px] bg-[#141414] border border-[#292929] p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  <div className="size-14 rounded-full bg-[#1e1e1e] border border-[#2e2e2e] text-[#f6f6f6] font-mono text-lg font-semibold flex items-center justify-center shrink-0">
                    {initials.toUpperCase()}
                  </div>
                  <div>
                    <h3 className="text-xl font-light text-[#f6f6f6] leading-tight">
                      {fullName}
                    </h3>
                    <p className="text-xs text-[#b9b9b9] font-mono mt-0.5">
                      {user.email || "No email linked"}
                    </p>
                    <p className="text-[11px] text-[#838383] mt-1.5 flex items-center gap-1.5">
                      <Calendar className="size-3" />
                      <span>User since {formatDetailDate(user.createdAt)}</span>
                    </p>
                  </div>
                </div>

                <div className="shrink-0">
                  {user.status === "active" ? (
                    <span className="inline-flex h-[26px] items-center rounded-[6px] bg-[#1c2820] border border-[#23382b] px-3 text-xs font-medium text-[#a2c7ad]">
                      Active
                    </span>
                  ) : user.status === "blocked" ? (
                    <span className="inline-flex h-[26px] items-center rounded-[6px] bg-[#2a1b18] border border-[#3d2420] px-3 text-xs font-medium text-[#ff967f]">
                      Blocked
                    </span>
                  ) : (
                    <span className="inline-flex h-[26px] items-center rounded-[6px] bg-[#252525] border border-[#333333] px-3 text-xs font-medium text-[#929292]">
                      Deleted
                    </span>
                  )}
                </div>
              </div>

              {/* Profile & Contact Details Section */}
              <div className="rounded-[10px] bg-[#141414] border border-[#292929] p-5 space-y-4">
                <h4 className="text-xs font-semibold text-[#838383] uppercase tracking-wider">
                  Profile & Contact Information
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                  <div>
                    <span className="text-[#838383] block mb-1">First Name</span>
                    <span className="text-[#f6f6f6] font-medium">{user.firstName || "—"}</span>
                  </div>
                  <div>
                    <span className="text-[#838383] block mb-1">Last Name</span>
                    <span className="text-[#f6f6f6] font-medium">{user.lastName || "—"}</span>
                  </div>
                  <div>
                    <span className="text-[#838383] block mb-1">Primary Email</span>
                    <span className="text-[#f6f6f6] font-mono">{user.email || "—"}</span>
                  </div>
                  <div>
                    <span className="text-[#838383] block mb-1">Phone Number</span>
                    <span className="text-[#f6f6f6] font-mono">{user.phone || "Not provided"}</span>
                  </div>
                  <div>
                    <span className="text-[#838383] block mb-1">Country</span>
                    <span className="text-[#f6f6f6] font-mono uppercase">{user.country || "—"}</span>
                  </div>
                  <div>
                    <span className="text-[#838383] block mb-1">Gender</span>
                    <span className="text-[#f6f6f6] capitalize">{user.gender || "—"}</span>
                  </div>
                </div>
              </div>

              {/* Authentication & Security Section */}
              <div className="rounded-[10px] bg-[#141414] border border-[#292929] p-5 space-y-4">
                <h4 className="text-xs font-semibold text-[#838383] uppercase tracking-wider">
                  Authentication & Security
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                  <div>
                    <span className="text-[#838383] block mb-1">Authentication Provider</span>
                    <span className="text-[#f6f6f6] font-medium flex items-center gap-1.5">
                      <KeyRound className="size-3.5 text-[#ff967f]" />
                      {formatProviderLabel(user.authProvider)}
                    </span>
                  </div>
                  <div>
                    <span className="text-[#838383] block mb-1">Email Verification</span>
                    {user.isEmailVerified || user.isVerified ? (
                      <span className="text-[#a2c7ad] font-medium flex items-center gap-1">
                        <CheckCircle2 className="size-3.5" />
                        Verified
                      </span>
                    ) : (
                      <span className="text-[#dfc38c] font-medium flex items-center gap-1">
                        <Clock className="size-3.5" />
                        Unverified
                      </span>
                    )}
                  </div>
                  <div>
                    <span className="text-[#838383] block mb-1">Profile Onboarding</span>
                    <span className={user.isOnboarded ? "text-[#b9b9b9]" : "text-[#dfc38c] font-medium"}>
                      {user.isOnboarded ? "Complete" : "Pending setup"}
                    </span>
                  </div>
                  <div>
                    <span className="text-[#838383] block mb-1">Account Role</span>
                    <span className="text-[#f6f6f6] font-mono capitalize">
                      {user.userType === "admin" ? "Organization admin" : "Platform member"}
                    </span>
                  </div>
                  <div>
                    <span className="text-[#838383] block mb-1">Active Sessions</span>
                    <span className="text-[#f6f6f6] flex items-center gap-1.5">
                      <Laptop className="size-3.5 text-[#b9b9b9]" />
                      {activeSessionsCount} active device{activeSessionsCount === 1 ? "" : "s"}
                    </span>
                  </div>
                  <div>
                    <span className="text-[#838383] block mb-1">User Identifier</span>
                    <span className="text-[#838383] font-mono text-[10px] break-all select-all">
                      {user.id}
                    </span>
                  </div>
                </div>
              </div>

              {/* Linked Emergency Contacts Section */}
              <div className="rounded-[10px] bg-[#141414] border border-[#292929] p-5 space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-semibold text-[#838383] uppercase tracking-wider flex items-center gap-1.5">
                    <HeartHandshake className="size-3.5 text-[#ff967f]" />
                    <span>Emergency Contacts ({contacts.length})</span>
                  </h4>
                </div>

                {contacts.length === 0 ? (
                  <p className="text-xs text-[#838383] italic py-2">
                    No emergency contacts registered for this user account.
                  </p>
                ) : (
                  <div className="space-y-2 pt-1">
                    {contacts.map((contact) => (
                      <div
                        key={contact.id}
                        className="rounded-lg border border-[#292929]/70 bg-[#0e0e0e] p-3 flex items-center justify-between text-xs"
                      >
                        <div>
                          <p className="font-medium text-[#f6f6f6]">{contact.contactName}</p>
                          <p className="text-[11px] text-[#838383] font-mono">{contact.contactPhone}</p>
                        </div>
                        <div className="flex items-center gap-2">
                          {contact.relationship && (
                            <span className="text-[11px] text-[#b9b9b9] bg-[#191919] px-2 py-0.5 rounded">
                              {contact.relationship}
                            </span>
                          )}
                          {contact.isPrimary && (
                            <span className="text-[10px] text-[#a2c7ad] bg-[#1c2820] border border-[#23382b] px-1.5 py-0.5 rounded">
                              Primary
                            </span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Account Moderation Actions */}
              <div className="rounded-[10px] bg-[#141414] border border-[#292929] p-5 space-y-4">
                <h4 className="text-xs font-semibold text-[#838383] uppercase tracking-wider flex items-center gap-1.5">
                  <Shield className="size-3.5 text-[#ff6347]" />
                  <span>Account Moderation</span>
                </h4>

                {confirmingStatus ? (
                  <div className="rounded-lg border border-[#ff6347]/30 bg-[#ff6347]/10 p-4 space-y-3">
                    <div className="flex items-start gap-2.5">
                      <AlertTriangle className="size-4 text-[#ff6347] shrink-0 mt-0.5" />
                      <div>
                        <p className="text-xs font-medium text-[#f6f6f6]">
                          Confirm {confirmingStatus} action
                        </p>
                        <p className="text-[11px] text-[#b9b9b9] mt-0.5">
                          {confirmingStatus === "blocked"
                            ? "Blocking will immediately terminate all active sessions across all devices and prevent sign-in."
                            : confirmingStatus === "deleted"
                              ? "Account will be soft-deleted and removed from the active directory."
                              : "User access will be restored to active status."}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center justify-end gap-2 pt-1">
                      <button
                        type="button"
                        onClick={() => setConfirmingStatus(null)}
                        disabled={updateStatusMutation.isPending}
                        className="rounded-lg border border-[#292929] bg-[#191919] px-3 py-1.5 text-xs text-[#f6f6f6] hover:bg-[#252525] transition-colors"
                      >
                        Cancel
                      </button>
                      <button
                        type="button"
                        onClick={() => handleUpdateStatus(confirmingStatus)}
                        disabled={updateStatusMutation.isPending}
                        className={cn(
                          "rounded-lg px-3 py-1.5 text-xs font-medium text-white transition-all flex items-center gap-1.5 cursor-pointer",
                          confirmingStatus === "active"
                            ? "bg-emerald-600 hover:bg-emerald-500"
                            : "bg-[#d94f2e] hover:bg-[#ff6347]"
                        )}
                      >
                        {updateStatusMutation.isPending && (
                          <Loader2 className="size-3 animate-spin" />
                        )}
                        <span>Confirm {confirmingStatus}</span>
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-wrap items-center gap-2.5">
                    {user.status === "active" ? (
                      <button
                        type="button"
                        onClick={() => setConfirmingStatus("blocked")}
                        disabled={updateStatusMutation.isPending}
                        className="inline-flex h-[34px] items-center gap-1.5 rounded-lg border border-[#292929] bg-[#191919] px-3.5 text-xs text-[#ff967f] hover:bg-[#2a1b18] hover:border-[#ff6347]/50 transition-all cursor-pointer"
                      >
                        <ShieldAlert className="size-3.5" />
                        <span>Block user</span>
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={() => setConfirmingStatus("active")}
                        disabled={updateStatusMutation.isPending}
                        className="inline-flex h-[34px] items-center gap-1.5 rounded-lg border border-[#292929] bg-[#191919] px-3.5 text-xs text-[#a2c7ad] hover:bg-[#1c2820] hover:border-emerald-500/50 transition-all cursor-pointer"
                      >
                        <ShieldCheck className="size-3.5" />
                        <span>Unblock user</span>
                      </button>
                    )}

                    {user.status !== "deleted" && (
                      <button
                        type="button"
                        onClick={() => setConfirmingStatus("deleted")}
                        disabled={updateStatusMutation.isPending}
                        className="inline-flex h-[34px] items-center gap-1.5 rounded-lg border border-[#292929] bg-[#191919] px-3.5 text-xs text-[#838383] hover:bg-[#252525] hover:text-[#f6f6f6] transition-all cursor-pointer"
                      >
                        <UserX className="size-3.5" />
                        <span>Delete account</span>
                      </button>
                    )}
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      </SheetContent>
    </Sheet>
  )
}
