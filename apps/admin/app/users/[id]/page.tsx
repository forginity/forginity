"use client"

import * as React from "react"
import Link from "next/link"
import { useParams, useRouter } from "next/navigation"
import {
  ArrowLeft,
  Download,
  Copy,
  Check,
  AlertCircle,
  RefreshCw,
  Shield,
  ShieldAlert,
  ShieldCheck,
  Trash2,
  UserCheck,
  UserX,
  AlertTriangle,
  HeartHandshake,
  Loader2,
} from "lucide-react"
import { AdminShell } from "@/components/admin-shell"
import { useUser, useUpdateUserStatus } from "@forginity/sdk/modules/auth/auth.hooks"
import type {
  UserDetailsResponse,
  UserStatus,
  AuthProvider,
} from "@forginity/sdk/modules/auth/auth.types"
import { QueryErrorState } from "@/components/query-error-state"
import { UserDetailSkeleton } from "./skeleton"
import { cn } from "@workspace/ui/lib/utils"

function formatUtcTimestamp(isoString?: string): string {
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

function formatSinceDate(isoString?: string): string {
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
    return `${day} ${month} ${year}`
  } catch {
    return "—"
  }
}

function formatProviderLabel(provider?: AuthProvider | null): string {
  if (!provider) return "Email OTP"
  if (provider === "google") return "Google"
  if (provider === "email_otp") return "Email OTP"
  if (provider === "password") return "Password"
  return provider
}

export default function UserDetailPage() {
  const params = useParams<{ id: string }>()
  const router = useRouter()
  const userId = params?.id as string

  // Fetch full user details from services/auth via SDK
  const {
    data: userDetails,
    isLoading,
    isError,
    error,
    refetch,
  } = useUser(userId)

  const user = userDetails?.user
  const emergencyContacts = userDetails?.emergencyContacts || []
  const activeSessionsCount = userDetails?.activeSessionsCount ?? 0

  // Status mutation hook
  const updateStatusMutation = useUpdateUserStatus()

  // Copy ID state
  const [copiedId, setCopiedId] = React.useState(false)

  // Moderation action modal states
  const [confirmingStatus, setConfirmingStatus] = React.useState<UserStatus | null>(null)
  const [moderationReason, setModerationReason] = React.useState("")
  const [actionError, setActionError] = React.useState<string | null>(null)
  const [actionSuccess, setActionSuccess] = React.useState<string | null>(null)

  const handleCopyId = () => {
    if (!userId) return
    navigator.clipboard.writeText(userId)
    setCopiedId(true)
    setTimeout(() => setCopiedId(false), 2000)
  }

  const handleExportDetails = () => {
    if (!userDetails) return
    const jsonStr = JSON.stringify(userDetails, null, 2)
    const blob = new Blob([jsonStr], { type: "application/json" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `user-${user?.id || userId}-${Date.now()}.json`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  const handleExecuteStatusChange = async () => {
    if (!confirmingStatus || !userId) return
    setActionError(null)
    setActionSuccess(null)

    try {
      await updateStatusMutation.mutateAsync({
        userId,
        payload: {
          status: confirmingStatus,
          reason: moderationReason.trim() || `Administrative update to ${confirmingStatus}`,
        },
      })
      setActionSuccess(`Account status has been successfully updated to "${confirmingStatus}".`)
      setConfirmingStatus(null)
      setModerationReason("")
      refetch()
    } catch (err: any) {
      setActionError(err?.message || `Failed to update status to ${confirmingStatus}.`)
    }
  }

  const fullName =
    user?.firstName && user?.lastName
      ? `${user.firstName} ${user.lastName}`
      : user?.name || "Unnamed user"

  const isVerified = Boolean(user?.isEmailVerified || user?.isVerified)

  return (
    <AdminShell>
      <div className="max-w-[1200px] mx-auto p-4 sm:p-6 lg:p-8 space-y-6">
        {isLoading ? (
          <UserDetailSkeleton />
        ) : isError ? (
          <div className="space-y-6">
            <Link
              href="/users"
              className="inline-flex items-center gap-1.5 text-xs text-[#b9b9b9] hover:text-[#f6f6f6] transition-colors"
            >
              <ArrowLeft className="size-3.5" />
              <span>All users</span>
            </Link>
            <QueryErrorState
              error={error}
              onRetry={() => refetch()}
              title="Failed to load user account"
              description="Could not retrieve the requested user record from the authentication service."
            />
          </div>
        ) : !user ? (
          <div className="space-y-6">
            <Link
              href="/users"
              className="inline-flex items-center gap-1.5 text-xs text-[#b9b9b9] hover:text-[#f6f6f6] transition-colors"
            >
              <ArrowLeft className="size-3.5" />
              <span>All users</span>
            </Link>
            <div className="rounded-[10px] bg-[#141414] border border-[#292929] p-12 text-center">
              <AlertCircle className="size-8 text-[#ff6347] mx-auto mb-2" />
              <p className="text-sm font-medium text-[#f6f6f6]">User not found</p>
              <p className="text-xs text-[#929292] mt-1 mb-4">
                The requested account does not exist or may have been permanently purged.
              </p>
              <Link
                href="/users"
                className="inline-flex items-center gap-2 rounded-lg bg-[#252525] px-4 py-2 text-xs text-[#f6f6f6] hover:bg-[#2f2f2f] transition-colors"
              >
                <span>Back to Users Directory</span>
              </Link>
            </div>
          </div>
        ) : (
          <div className="space-y-6" data-node-id="309:404">
            {/* Top Back Navigation (Figma Node 310:506) */}
            <div>
              <Link
                href="/users"
                className="inline-flex items-center gap-1.5 text-xs text-[#b9b9b9] hover:text-[#f6f6f6] transition-colors group"
              >
                <ArrowLeft className="size-3.5 transition-transform group-hover:-translate-x-0.5" />
                <span>All users</span>
              </Link>
            </div>

            {/* Page Title & Utility Actions Bar (Figma Node 310:507 - 310:510) */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h1 className="text-[28px] sm:text-[30px] font-light leading-tight text-[#f6f6f6] tracking-tight">
                  User details
                </h1>
                <p className="text-xs sm:text-sm text-[#929292] mt-1">
                  View profile information, sign-in method and account verification.
                </p>
              </div>

              <button
                type="button"
                onClick={handleExportDetails}
                className="inline-flex h-[34px] items-center gap-2 self-start sm:self-auto rounded-[8px] bg-[#191919] border border-[#292929] px-3.5 text-xs font-normal text-[#f6f6f6] hover:bg-[#252525] hover:border-[#383838] transition-colors cursor-pointer shrink-0"
              >
                <Download className="size-3.5 text-[#b9b9b9]" />
                <span>Export details</span>
              </button>
            </div>

            {/* User Account Summary Hero Card (Figma Node 310:511 - 310:519) */}
            <div className="rounded-[10px] bg-[#141414] border border-[#292929] p-5 sm:p-6 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-sm">
              <div className="space-y-1">
                <h2 className="text-xl sm:text-2xl font-light text-[#f6f6f6] leading-snug">
                  {fullName}
                </h2>
                <p className="text-sm text-[#b9b9b9]">
                  {user.email || "No email on record"}
                </p>
                <p className="text-xs text-[#929292] font-mono pt-0.5">
                  User since {formatSinceDate(user.createdAt)}
                </p>
              </div>

              <div className="flex flex-col md:items-end gap-2.5 shrink-0">
                <div className="flex items-center gap-2">
                  {/* Status Badge */}
                  {user.status === "active" ? (
                    <span className="inline-flex h-[26px] items-center rounded-[6px] bg-[#1c2820] px-2.5 text-xs font-normal text-[#a2c7ad]">
                      Active
                    </span>
                  ) : user.status === "blocked" ? (
                    <span className="inline-flex h-[26px] items-center rounded-[6px] bg-[#2a1b18] px-2.5 text-xs font-normal text-[#ff967f]">
                      Blocked
                    </span>
                  ) : (
                    <span className="inline-flex h-[26px] items-center rounded-[6px] bg-[#252525] px-2.5 text-xs font-normal text-[#929292]">
                      Deleted
                    </span>
                  )}

                  {/* Verification Badge */}
                  {isVerified ? (
                    <span className="inline-flex h-[26px] items-center rounded-[6px] bg-[#1c2820] px-2.5 text-xs font-normal text-[#a2c7ad]">
                      Verified
                    </span>
                  ) : (
                    <span className="inline-flex h-[26px] items-center rounded-[6px] bg-[#29251c] px-2.5 text-xs font-normal text-[#dfc38c]">
                      Unverified
                    </span>
                  )}
                </div>

                {/* Onboarding Status Line */}
                <p
                  className={cn(
                    "text-xs font-normal md:text-right",
                    user.isOnboarded ? "text-[#a2c7ad]" : "text-[#dfc38c]"
                  )}
                >
                  {user.isOnboarded ? "Onboarding complete" : "Onboarding pending"}
                </p>
              </div>
            </div>

            {/* Notification Banner for Successful Status Changes */}
            {actionSuccess && (
              <div className="flex items-center gap-2.5 rounded-[8px] border border-[#a2c7ad]/30 bg-[#1c2820]/60 p-3.5 text-xs text-[#a2c7ad]">
                <ShieldCheck className="size-4 shrink-0" />
                <span>{actionSuccess}</span>
              </div>
            )}

            {/* Notification Banner for Failed Status Changes */}
            {actionError && (
              <div className="flex items-center gap-2.5 rounded-[8px] border border-[#ff6347]/30 bg-[#2a1b18]/60 p-3.5 text-xs text-[#ff967f]">
                <AlertCircle className="size-4 shrink-0" />
                <span>{actionError}</span>
              </div>
            )}

            {/* 2-Column Responsive Content Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
              {/* Left Column (lg:col-span-7) */}
              <div className="lg:col-span-7 space-y-6">
                {/* 1. Personal Information Card (Figma Node 310:520 - 310:540) */}
                <div className="rounded-[10px] bg-[#141414] border border-[#292929] overflow-hidden shadow-sm">
                  <div className="px-5 py-4 border-b border-[#292929]">
                    <h3 className="text-base font-light text-[#f6f6f6]">
                      Personal information
                    </h3>
                  </div>

                  <div className="p-5 grid grid-cols-1 sm:grid-cols-2 gap-5">
                    {/* Display name */}
                    <div>
                      <p className="text-xs text-[#929292]">Display name</p>
                      <p className="text-sm text-[#f6f6f6] mt-1 font-medium">{fullName}</p>
                    </div>

                    {/* Gender */}
                    <div>
                      <p className="text-xs text-[#929292]">Gender</p>
                      <p className="text-sm text-[#f6f6f6] mt-1 capitalize">
                        {user.gender || "Not specified"}
                      </p>
                    </div>

                    {/* First name */}
                    <div>
                      <p className="text-xs text-[#929292]">First name</p>
                      <p className="text-sm text-[#f6f6f6] mt-1">
                        {user.firstName || "—"}
                      </p>
                    </div>

                    {/* Last name */}
                    <div>
                      <p className="text-xs text-[#929292]">Last name</p>
                      <p className="text-sm text-[#f6f6f6] mt-1">
                        {user.lastName || "—"}
                      </p>
                    </div>

                    {/* Country */}
                    <div>
                      <p className="text-xs text-[#929292]">Country</p>
                      <p className="text-sm text-[#f6f6f6] mt-1 font-mono">
                        {user.country ? `${user.country}` : "Not provided"}
                      </p>
                    </div>

                    {/* Avatar URL */}
                    <div>
                      <p className="text-xs text-[#929292]">Avatar URL</p>
                      <p className="text-sm text-[#f6f6f6] mt-1 truncate max-w-[280px]">
                        {user.avatarUrl || "Not provided"}
                      </p>
                    </div>
                  </div>
                </div>

                {/* 2. Contact Information Card (Figma Node 310:541 - 310:554) */}
                <div className="rounded-[10px] bg-[#141414] border border-[#292929] overflow-hidden shadow-sm">
                  <div className="px-5 py-4 border-b border-[#292929]">
                    <h3 className="text-base font-light text-[#f6f6f6]">
                      Contact information
                    </h3>
                  </div>

                  <div className="p-5 space-y-4">
                    {/* Email Row */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <div>
                        <p className="text-xs text-[#929292]">Email address</p>
                        <p className="text-sm text-[#f6f6f6] mt-1">
                          {user.email || "No email"}
                        </p>
                      </div>
                      {user.isEmailVerified || user.isVerified ? (
                        <span className="inline-flex h-[26px] self-start sm:self-auto items-center rounded-[6px] bg-[#1c2820] px-2.5 text-xs font-normal text-[#a2c7ad]">
                          Email verified
                        </span>
                      ) : (
                        <span className="inline-flex h-[26px] self-start sm:self-auto items-center rounded-[6px] bg-[#29251c] px-2.5 text-xs font-normal text-[#dfc38c]">
                          Email unverified
                        </span>
                      )}
                    </div>

                    <div className="border-t border-[#292929]" />

                    {/* Phone Row */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <div>
                        <p className="text-xs text-[#929292]">Phone number</p>
                        <p className="text-sm text-[#f6f6f6] font-mono mt-1">
                          {user.phone || "Not provided"}
                        </p>
                      </div>
                      {user.isPhoneVerified ? (
                        <span className="inline-flex h-[26px] self-start sm:self-auto items-center rounded-[6px] bg-[#1c2820] px-2.5 text-xs font-normal text-[#a2c7ad]">
                          Phone verified
                        </span>
                      ) : (
                        <span className="inline-flex h-[26px] self-start sm:self-auto items-center rounded-[6px] bg-[#29251c] px-2.5 text-xs font-normal text-[#dfc38c]">
                          Phone unverified
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* 3. System Information Card (Figma Node 310:555 - 310:561) */}
                <div className="rounded-[10px] bg-[#141414] border border-[#292929] overflow-hidden shadow-sm">
                  <div className="px-5 py-4 border-b border-[#292929]">
                    <h3 className="text-base font-light text-[#f6f6f6]">
                      System information
                    </h3>
                  </div>

                  <div className="p-5">
                    <p className="text-xs text-[#929292]">User ID</p>
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mt-1.5">
                      <p className="text-xs sm:text-sm text-[#f6f6f6] font-mono break-all">
                        {user.id}
                      </p>
                      <button
                        type="button"
                        onClick={handleCopyId}
                        className="inline-flex h-[34px] items-center gap-1.5 self-start sm:self-auto rounded-[8px] bg-[#191919] border border-[#292929] px-3 text-xs font-normal text-[#f6f6f6] hover:bg-[#252525] hover:border-[#383838] transition-colors cursor-pointer shrink-0"
                      >
                        {copiedId ? (
                          <>
                            <Check className="size-3.5 text-[#a2c7ad]" />
                            <span className="text-[#a2c7ad]">Copied</span>
                          </>
                        ) : (
                          <>
                            <Copy className="size-3.5 text-[#b9b9b9]" />
                            <span>Copy ID</span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                </div>

                {/* 4. Emergency Contacts Card (Forginity Domain Integration) */}
                <div className="rounded-[10px] bg-[#141414] border border-[#292929] overflow-hidden shadow-sm">
                  <div className="px-5 py-4 border-b border-[#292929] flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <HeartHandshake className="size-4 text-[#ff967f]" />
                      <h3 className="text-base font-light text-[#f6f6f6]">
                        Emergency contacts
                      </h3>
                    </div>
                    <span className="text-xs text-[#929292] font-mono">
                      {emergencyContacts.length} linked
                    </span>
                  </div>

                  <div className="p-5">
                    {emergencyContacts.length > 0 ? (
                      <div className="space-y-3">
                        {emergencyContacts.map((contact, index) => (
                          <div
                            key={contact.id || `contact-${index}`}
                            className="rounded-[8px] border border-[#292929] bg-[#191919] p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-2"
                          >
                            <div className="space-y-0.5">
                              <div className="flex items-center gap-2">
                                <p className="text-sm font-medium text-[#f6f6f6]">
                                  {contact.contactName}
                                </p>
                                {contact.isPrimary && (
                                  <span className="rounded bg-[#ff6347]/10 px-1.5 py-0.5 text-[10px] font-medium text-[#ff967f]">
                                    Primary
                                  </span>
                                )}
                              </div>
                              <p className="text-xs text-[#929292]">
                                Relationship: {contact.relationship || "Not specified"}
                              </p>
                            </div>
                            <div className="text-xs font-mono text-[#b9b9b9] sm:text-right">
                              {contact.contactPhone}
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-xs text-[#929292] py-2">
                        No emergency contacts have been configured for this account.
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {/* Right Column (lg:col-span-5) */}
              <div className="lg:col-span-5 space-y-6">
                {/* 1. Authentication Card (Figma Node 310:562 - 310:569) */}
                <div className="rounded-[10px] bg-[#141414] border border-[#292929] overflow-hidden shadow-sm">
                  <div className="px-5 py-4 border-b border-[#292929]">
                    <h3 className="text-base font-light text-[#f6f6f6]">
                      Authentication
                    </h3>
                  </div>

                  <div className="p-5 space-y-4">
                    <div>
                      <p className="text-xs text-[#929292]">Sign-in provider</p>
                      <p className="text-sm text-[#f6f6f6] mt-1 font-medium">
                        {formatProviderLabel(user.authProvider)}
                      </p>
                    </div>

                    <div className="border-t border-[#292929]" />

                    <div>
                      <p className="text-xs text-[#929292]">Provider ID</p>
                      <p className="text-xs sm:text-sm text-[#f6f6f6] font-mono break-all mt-1">
                        {user.googleId || (user.authProvider === "email_otp" ? user.email : "—")}
                      </p>
                    </div>
                  </div>
                </div>

                {/* 2. Verification & Onboarding Card (Figma Node 310:570 - 310:583) */}
                <div className="rounded-[10px] bg-[#141414] border border-[#292929] overflow-hidden shadow-sm">
                  <div className="px-5 py-4 border-b border-[#292929]">
                    <h3 className="text-base font-light text-[#f6f6f6]">
                      Verification & onboarding
                    </h3>
                  </div>

                  <div className="p-5 space-y-3 text-sm">
                    {/* Account verified */}
                    <div className="flex items-center justify-between">
                      <span className="text-[#b9b9b9]">Account verified</span>
                      <span
                        className={cn(
                          "text-xs font-normal",
                          isVerified ? "text-[#a2c7ad]" : "text-[#dfc38c]"
                        )}
                      >
                        {isVerified ? "Yes" : "No"}
                      </span>
                    </div>

                    <div className="border-t border-[#292929]" />

                    {/* Email verified */}
                    <div className="flex items-center justify-between">
                      <span className="text-[#b9b9b9]">Email verified</span>
                      <span
                        className={cn(
                          "text-xs font-normal",
                          user.isEmailVerified ? "text-[#a2c7ad]" : "text-[#dfc38c]"
                        )}
                      >
                        {user.isEmailVerified ? "Yes" : "No"}
                      </span>
                    </div>

                    <div className="border-t border-[#292929]" />

                    {/* Phone verified */}
                    <div className="flex items-center justify-between">
                      <span className="text-[#b9b9b9]">Phone verified</span>
                      <span
                        className={cn(
                          "text-xs font-normal",
                          user.isPhoneVerified ? "text-[#a2c7ad]" : "text-[#dfc38c]"
                        )}
                      >
                        {user.isPhoneVerified ? "Yes" : "No"}
                      </span>
                    </div>

                    <div className="border-t border-[#292929]" />

                    {/* Onboarding */}
                    <div className="flex items-center justify-between">
                      <span className="text-[#b9b9b9]">Onboarding</span>
                      <span
                        className={cn(
                          "text-xs font-normal",
                          user.isOnboarded ? "text-[#a2c7ad]" : "text-[#dfc38c]"
                        )}
                      >
                        {user.isOnboarded ? "Complete" : "Pending"}
                      </span>
                    </div>
                  </div>
                </div>

                {/* 3. Account Timestamps Card (Figma Node 310:584 - 310:590) */}
                <div className="rounded-[10px] bg-[#141414] border border-[#292929] overflow-hidden shadow-sm">
                  <div className="px-5 py-4 border-b border-[#292929]">
                    <h3 className="text-base font-light text-[#f6f6f6]">
                      Account timestamps
                    </h3>
                  </div>

                  <div className="p-5 space-y-3 text-xs">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                      <span className="text-[#929292]">Created</span>
                      <span className="text-[#b9b9b9] font-mono">
                        {formatUtcTimestamp(user.createdAt)}
                      </span>
                    </div>

                    <div className="border-t border-[#292929]" />

                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                      <span className="text-[#929292]">Last updated</span>
                      <span className="text-[#b9b9b9] font-mono">
                        {formatUtcTimestamp(user.updatedAt || user.createdAt)}
                      </span>
                    </div>
                  </div>
                </div>

                {/* 4. Account Moderation & Safety Card */}
                <div className="rounded-[10px] bg-[#141414] border border-[#292929] overflow-hidden shadow-sm">
                  <div className="px-5 py-4 border-b border-[#292929] flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Shield className="size-4 text-[#b9b9b9]" />
                      <h3 className="text-base font-light text-[#f6f6f6]">
                        Account moderation
                      </h3>
                    </div>
                  </div>

                  <div className="p-5 space-y-3">
                    {/* Status change actions */}
                    {user.status === "active" ? (
                      <button
                        type="button"
                        onClick={() => {
                          setConfirmingStatus("blocked")
                          setModerationReason("")
                        }}
                        className="w-full h-[36px] flex items-center justify-center gap-2 rounded-[8px] border border-[#ff6347]/40 bg-[#ff6347]/10 text-xs font-medium text-[#ff967f] hover:bg-[#ff6347]/20 transition-colors cursor-pointer"
                      >
                        <UserX className="size-3.5" />
                        <span>Block user account</span>
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={() => {
                          setConfirmingStatus("active")
                          setModerationReason("")
                        }}
                        className="w-full h-[36px] flex items-center justify-center gap-2 rounded-[8px] border border-[#a2c7ad]/40 bg-[#1c2820] text-xs font-medium text-[#a2c7ad] hover:bg-[#1c2820]/80 transition-colors cursor-pointer"
                      >
                        <UserCheck className="size-3.5" />
                        <span>Unblock user account</span>
                      </button>
                    )}

                    {user.status !== "deleted" && (
                      <button
                        type="button"
                        onClick={() => {
                          setConfirmingStatus("deleted")
                          setModerationReason("")
                        }}
                        className="w-full h-[36px] flex items-center justify-center gap-2 rounded-[8px] border border-[#292929] bg-[#191919] text-xs font-medium text-[#929292] hover:text-[#ff967f] hover:border-[#ff6347]/40 transition-colors cursor-pointer"
                      >
                        <Trash2 className="size-3.5" />
                        <span>Soft delete account</span>
                      </button>
                    )}

                    <p className="text-[11px] text-[#838383] pt-1">
                      Blocking revokes all active auth sessions immediately.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Bottom Footer Note (Figma Node 310:591) */}
            <div className="pt-2">
              <p className="text-xs text-[#929292]">
                All timestamps are shown in UTC. Sensitive authentication credentials are not displayed.
              </p>
            </div>
          </div>
        )}

        {/* Confirmation Modal for Moderation Status Actions */}
        {confirmingStatus && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-xs p-4">
            <div className="w-full max-w-md rounded-[12px] border border-[#292929] bg-[#141414] p-6 shadow-2xl space-y-4">
              <div className="flex items-center gap-3">
                <div className="size-9 rounded-full bg-[#ff6347]/10 flex items-center justify-center text-[#ff967f]">
                  <AlertTriangle className="size-5" />
                </div>
                <div>
                  <h4 className="text-base font-light text-[#f6f6f6]">
                    Confirm account status change
                  </h4>
                  <p className="text-xs text-[#929292]">
                    Updating account to <strong className="text-[#f6f6f6]">{confirmingStatus}</strong>
                  </p>
                </div>
              </div>

              <p className="text-xs text-[#b9b9b9] leading-relaxed">
                {confirmingStatus === "blocked"
                  ? "Blocking this user will immediately revoke all active sessions across all devices and prevent any future sign-in attempts."
                  : confirmingStatus === "deleted"
                  ? "Soft deleting this user marks the account as deleted and purges active tokens. Contact data remains archived."
                  : "Unblocking this user restores access and allows subsequent email/Google authentication."}
              </p>

              <div>
                <label className="text-xs text-[#929292] block mb-1.5">
                  Audit log reason (optional)
                </label>
                <input
                  type="text"
                  placeholder="e.g. Terms of service violation, admin request"
                  value={moderationReason}
                  onChange={(e) => setModerationReason(e.target.value)}
                  className="h-[36px] w-full rounded-lg border border-[#292929] bg-[#090909] px-3 text-xs text-[#f6f6f6] placeholder:text-[#838383] outline-none focus:border-[#ff6347]/60"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setConfirmingStatus(null)}
                  disabled={updateStatusMutation.isPending}
                  className="h-[34px] px-3.5 rounded-[8px] border border-[#292929] bg-[#191919] text-xs text-[#b9b9b9] hover:bg-[#222222] hover:text-[#f6f6f6] transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleExecuteStatusChange}
                  disabled={updateStatusMutation.isPending}
                  className={cn(
                    "h-[34px] px-4 rounded-[8px] text-xs font-medium transition-colors flex items-center gap-1.5 cursor-pointer",
                    confirmingStatus === "active"
                      ? "bg-[#1c2820] text-[#a2c7ad] hover:bg-[#25392d]"
                      : "bg-[#ff6347] text-[#090909] hover:bg-[#ff795c]"
                  )}
                >
                  {updateStatusMutation.isPending && (
                    <Loader2 className="size-3 animate-spin" />
                  )}
                  <span>Confirm {confirmingStatus}</span>
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </AdminShell>
  )
}
