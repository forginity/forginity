"use client"

import * as React from "react"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import {
  Search,
  Download,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ExternalLink,
  X,
  AlertCircle,
  RefreshCw,
  Users as UsersIcon,
} from "lucide-react"
import { AdminShell } from "@/components/admin-shell"
import { useUsers } from "@forginity/sdk/modules/auth/auth.hooks"
import type { UserProfile, UserStatus, AuthProvider, ListUsersParams } from "@forginity/sdk/modules/auth/auth.types"
import { cn } from "@workspace/ui/lib/utils"

function formatJoinedDate(isoString: string): { date: string; time: string } {
  try {
    const d = new Date(isoString)
    if (isNaN(d.getTime())) return { date: "—", time: "—" }
    const day = d.getUTCDate()
    const months = [
      "Jan", "Feb", "Mar", "Apr", "May", "Jun",
      "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
    ]
    const month = months[d.getUTCMonth()]
    const year = d.getUTCFullYear()
    const hours = String(d.getUTCHours()).padStart(2, "0")
    const minutes = String(d.getUTCMinutes()).padStart(2, "0")
    return {
      date: `${day} ${month} ${year}`,
      time: `${hours}:${minutes} UTC`,
    }
  } catch {
    return { date: "—", time: "—" }
  }
}

function formatProvider(provider?: AuthProvider | null): string {
  if (!provider) return "Email OTP"
  if (provider === "google") return "Google"
  if (provider === "email_otp") return "Email OTP"
  if (provider === "password") return "Password"
  return provider
}

function getUserInitials(user: UserProfile): string {
  if (user.firstName && user.lastName) {
    return `${user.firstName[0]}${user.lastName[0]}`.toUpperCase()
  }
  if (user.name) {
    return user.name.substring(0, 2).toUpperCase()
  }
  if (user.email) {
    return user.email.substring(0, 2).toUpperCase()
  }
  return "U"
}

export default function AdminUsersPage() {
  const pathname = usePathname()
  const router = useRouter()

  // Search & Filter state
  const [searchInput, setSearchInput] = React.useState("")
  const [debouncedSearch, setDebouncedSearch] = React.useState("")
  const [statusFilter, setStatusFilter] = React.useState<"all" | UserStatus>("all")
  const [providerFilter, setProviderFilter] = React.useState<"all" | AuthProvider>("all")
  const [verificationFilter, setVerificationFilter] = React.useState<"all" | "verified" | "unverified">("all")

  // Pagination state
  const [page, setPage] = React.useState(1)
  const [pageSize, setPageSize] = React.useState(10)

  // Debounce search input by 300ms
  React.useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchInput.trim())
      setPage(1)
    }, 300)
    return () => clearTimeout(timer)
  }, [searchInput])

  // Build query params
  const queryParams = React.useMemo<ListUsersParams>(() => {
    return {
      search: debouncedSearch || undefined,
      status: statusFilter !== "all" ? statusFilter : undefined,
      authProvider: providerFilter !== "all" ? providerFilter : undefined,
      page,
      limit: pageSize,
    }
  }, [debouncedSearch, statusFilter, providerFilter, page, pageSize])

  // Fetch users from services/auth via SDK
  const { data, isLoading, isError, error, refetch, isFetching } = useUsers(queryParams)

  const users = data?.users || []
  const totalCount = data?.pagination?.total || 0
  const totalPages = Math.max(1, Math.ceil(totalCount / pageSize))

  // Client-side verification filter if selected
  const displayedUsers = React.useMemo(() => {
    if (verificationFilter === "all") return users
    if (verificationFilter === "verified") {
      return users.filter((u) => u.isEmailVerified || u.isVerified)
    }
    return users.filter((u) => !u.isEmailVerified && !u.isVerified)
  }, [users, verificationFilter])

  // KPI Calculations
  const activeCount = users.filter((u) => u.status === "active").length
  const verifiedCount = users.filter((u) => u.isEmailVerified || u.isVerified).length
  const pendingOnboardCount = users.filter((u) => !u.isOnboarded).length

  const activePercent = users.length ? ((activeCount / users.length) * 100).toFixed(1) : "0"
  const verifiedPercent = users.length ? ((verifiedCount / users.length) * 100).toFixed(1) : "0"
  const pendingPercent = users.length ? ((pendingOnboardCount / users.length) * 100).toFixed(1) : "0"

  // Export users to CSV
  const handleExportCsv = () => {
    if (!displayedUsers.length) return
    const headers = [
      "User ID",
      "Full Name",
      "Email",
      "Phone",
      "Country",
      "Auth Provider",
      "Verification",
      "Onboarding",
      "Status",
      "Created At",
    ]

    const rows = displayedUsers.map((u) => {
      const name =
        u.firstName && u.lastName
          ? `${u.firstName} ${u.lastName}`
          : u.name || ""
      return [
        u.id,
        `"${name.replace(/"/g, '""')}"`,
        u.email || "",
        u.phone || "",
        u.country || "",
        formatProvider(u.authProvider),
        u.isEmailVerified || u.isVerified ? "Verified" : "Unverified",
        u.isOnboarded ? "Complete" : "Pending",
        u.status,
        u.createdAt,
      ]
    })

    const csvContent =
      "data:text/csv;charset=utf-8," +
      [headers.join(","), ...rows.map((e) => e.join(","))].join("\n")
    const encodedUri = encodeURI(csvContent)
    const link = document.createElement("a")
    link.setAttribute("href", encodedUri)
    link.setAttribute(
      "download",
      `forginity-users-${new Date().toISOString().slice(0, 10)}.csv`
    )
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  // Handle page navigation
  const handlePrevPage = () => {
    if (page > 1) setPage((prev) => prev - 1)
  }

  const handleNextPage = () => {
    if (page < totalPages) setPage((prev) => prev + 1)
  }

  const startRecord = totalCount === 0 ? 0 : (page - 1) * pageSize + 1
  const endRecord = Math.min(page * pageSize, totalCount)

  return (
    <AdminShell
      currentPath={pathname}
      breadcrumbs={[
        { label: "Workspace" },
        { label: "Users" },
        { label: "Overview" },
      ]}
    >
      <div className="space-y-6">
        {/* Page Header (Matching Figma Node 310:350 - 310:353) */}
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl sm:text-3xl font-light text-[#f6f6f6] tracking-tight">
              Users
            </h1>
            <p className="text-xs sm:text-sm text-[#929292] mt-1">
              Monitor accounts, verification and onboarding in one place.
            </p>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              type="button"
              onClick={handleExportCsv}
              disabled={isLoading || displayedUsers.length === 0}
              className="inline-flex h-[34px] items-center gap-2 rounded-lg border border-[#292929] bg-[#191919] px-3.5 text-xs font-normal text-[#f6f6f6] transition-colors hover:bg-[#252525] active:bg-[#1f1f1f] disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
            >
              <Download className="size-3.5 text-[#b9b9b9]" />
              <span>Export users</span>
            </button>
          </div>
        </div>

        {/* 4 KPI Metric Cards (Matching Figma Node 310:354 - 310:369) */}
        <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-2 lg:grid-cols-4">
          {/* Card 1: Total Users */}
          <div className="h-[120px] rounded-[10px] bg-[#141414] border border-[#292929]/50 p-[18px] flex flex-col justify-between transition-colors">
            <span className="text-xs font-normal text-[#b9b9b9]">
              Total users
            </span>
            <span className="text-2xl sm:text-[30px] font-light text-[#f6f6f6] leading-none">
              {isLoading ? (
                <span className="inline-block h-8 w-24 bg-[#252525] animate-pulse rounded" />
              ) : (
                totalCount.toLocaleString()
              )}
            </span>
            <span className="text-xs text-[#929292]">
              All registered accounts
            </span>
          </div>

          {/* Card 2: Active Users */}
          <div className="h-[120px] rounded-[10px] bg-[#141414] border border-[#292929]/50 p-[18px] flex flex-col justify-between transition-colors">
            <span className="text-xs font-normal text-[#b9b9b9]">
              Active users
            </span>
            <span className="text-2xl sm:text-[30px] font-light text-[#f6f6f6] leading-none">
              {isLoading ? (
                <span className="inline-block h-8 w-24 bg-[#252525] animate-pulse rounded" />
              ) : (
                activeCount.toLocaleString()
              )}
            </span>
            <span className="text-xs text-[#a2c7ad] font-medium">
              {activePercent}% of directory
            </span>
          </div>

          {/* Card 3: Verified Users */}
          <div className="h-[120px] rounded-[10px] bg-[#141414] border border-[#292929]/50 p-[18px] flex flex-col justify-between transition-colors">
            <span className="text-xs font-normal text-[#b9b9b9]">
              Verified users
            </span>
            <span className="text-2xl sm:text-[30px] font-light text-[#f6f6f6] leading-none">
              {isLoading ? (
                <span className="inline-block h-8 w-24 bg-[#252525] animate-pulse rounded" />
              ) : (
                verifiedCount.toLocaleString()
              )}
            </span>
            <span className="text-xs text-[#a2c7ad] font-medium">
              {verifiedPercent}% verification rate
            </span>
          </div>

          {/* Card 4: Pending Onboarding */}
          <div className="h-[120px] rounded-[10px] bg-[#141414] border border-[#292929]/50 p-[18px] flex flex-col justify-between transition-colors">
            <span className="text-xs font-normal text-[#b9b9b9]">
              Pending onboarding
            </span>
            <span className="text-2xl sm:text-[30px] font-light text-[#f6f6f6] leading-none">
              {isLoading ? (
                <span className="inline-block h-8 w-24 bg-[#252525] animate-pulse rounded" />
              ) : (
                pendingOnboardCount.toLocaleString()
              )}
            </span>
            <span className="text-xs text-[#dfc38c] font-medium">
              {pendingPercent}% need to complete setup
            </span>
          </div>
        </div>

        {/* Users List Container (Matching Figma Node 310:370 - 310:505) */}
        <div className="rounded-[10px] bg-[#141414] border border-[#292929] overflow-hidden shadow-sm">
          {/* Card Top Title Bar */}
          <div className="flex items-center justify-between px-5 py-4 border-b border-[#292929]">
            <div className="flex items-center gap-3">
              <h2 className="text-base font-light text-[#f6f6f6]">
                All users
              </h2>
            </div>
            <span className="text-xs text-[#929292] hidden sm:inline-block">
              Account directory
            </span>
          </div>

          {/* Toolbar: Search & Filter Controls (Matching Figma Node 310:376 - 310:386) */}
          <div className="p-4 sm:p-5 flex flex-wrap items-center justify-between gap-3 border-b border-[#292929]/60">
            {/* Search Input */}
            <div className="relative w-full sm:w-[320px] md:w-[370px]">
              <Search className="absolute left-3 top-2.5 size-3.5 text-[#929292]" />
              <input
                type="text"
                placeholder="Search by name, email or phone"
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                className="h-[36px] w-full rounded-lg border border-[#292929] bg-[#090909] pl-9 pr-8 text-xs text-[#f6f6f6] placeholder:text-[#929292] outline-none transition-colors focus:border-[#ff6347]/60"
              />
              {searchInput && (
                <button
                  type="button"
                  onClick={() => setSearchInput("")}
                  className="absolute right-2.5 top-2.5 text-[#929292] hover:text-[#f6f6f6]"
                  aria-label="Clear search"
                >
                  <X className="size-3.5" />
                </button>
              )}
            </div>

            {/* Filter Dropdowns */}
            <div className="flex flex-wrap items-center gap-2 sm:gap-2.5">
              {/* Status Filter */}
              <div className="relative">
                <select
                  value={statusFilter}
                  onChange={(e) => {
                    setStatusFilter(e.target.value as "all" | UserStatus)
                    setPage(1)
                  }}
                  className="h-[34px] appearance-none rounded-lg border border-[#292929] bg-[#191919] pl-3 pr-8 text-xs font-normal text-[#f6f6f6] outline-none hover:bg-[#222222] transition-colors cursor-pointer"
                  aria-label="Filter users by status"
                >
                  <option value="all">Status: All</option>
                  <option value="active">Status: Active</option>
                  <option value="blocked">Status: Blocked</option>
                  <option value="deleted">Status: Deleted</option>
                </select>
                <ChevronDown className="pointer-events-none absolute right-2.5 top-2.5 size-3 text-[#b9b9b9]" />
              </div>

              {/* Provider Filter */}
              <div className="relative">
                <select
                  value={providerFilter}
                  onChange={(e) => {
                    setProviderFilter(e.target.value as "all" | AuthProvider)
                    setPage(1)
                  }}
                  className="h-[34px] appearance-none rounded-lg border border-[#292929] bg-[#191919] pl-3 pr-8 text-xs font-normal text-[#f6f6f6] outline-none hover:bg-[#222222] transition-colors cursor-pointer"
                  aria-label="Filter users by authentication provider"
                >
                  <option value="all">Provider: All</option>
                  <option value="email_otp">Provider: Email OTP</option>
                  <option value="google">Provider: Google</option>
                  <option value="password">Provider: Password</option>
                </select>
                <ChevronDown className="pointer-events-none absolute right-2.5 top-2.5 size-3 text-[#b9b9b9]" />
              </div>

              {/* Verification Filter */}
              <div className="relative">
                <select
                  value={verificationFilter}
                  onChange={(e) => {
                    setVerificationFilter(e.target.value as "all" | "verified" | "unverified")
                    setPage(1)
                  }}
                  className="h-[34px] appearance-none rounded-lg border border-[#292929] bg-[#191919] pl-3 pr-8 text-xs font-normal text-[#f6f6f6] outline-none hover:bg-[#222222] transition-colors cursor-pointer"
                  aria-label="Filter users by verification state"
                >
                  <option value="all">Verification: All</option>
                  <option value="verified">Verification: Verified</option>
                  <option value="unverified">Verification: Unverified</option>
                </select>
                <ChevronDown className="pointer-events-none absolute right-2.5 top-2.5 size-3 text-[#b9b9b9]" />
              </div>

              {/* Active Records Indicator */}
              <span className="text-xs text-[#929292] pl-1">
                {displayedUsers.length} shown
              </span>
            </div>
          </div>

          {/* Table Container with Horizontal Scroll Guarantee */}
          <div className="overflow-x-auto">
            <table className="w-full min-w-[950px] border-collapse text-left text-xs">
              {/* Table Header (Matching Figma Node 310:387 - 310:396) */}
              <thead>
                <tr className="h-[40px] border-b border-[#292929] bg-[#191919] text-[12px] font-normal text-[#b9b9b9]">
                  <th className="py-2 px-4 w-[240px]">User</th>
                  <th className="py-2 px-4 w-[140px]">Phone</th>
                  <th className="py-2 px-4 w-[70px]">Country</th>
                  <th className="py-2 px-4 w-[110px]">Auth provider</th>
                  <th className="py-2 px-4 w-[100px]">Verification</th>
                  <th className="py-2 px-4 w-[100px]">Onboarding</th>
                  <th className="py-2 px-4 w-[90px]">Status</th>
                  <th className="py-2 px-4 w-[130px]">Joined ↓</th>
                  <th className="py-2 px-4 w-[80px] text-right">Action</th>
                </tr>
              </thead>

              {/* Table Body */}
              <tbody className="divide-y divide-[#292929]/70">
                {isLoading ? (
                  // Zero-CLS Loading Skeletons: Exact row height 72px
                  Array.from({ length: pageSize }).map((_, idx) => (
                    <tr key={`skeleton-${idx}`} className="h-[72px] animate-pulse">
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-3">
                          <div className="size-8 rounded-full bg-[#252525]" />
                          <div className="space-y-1.5">
                            <div className="h-3.5 w-28 rounded bg-[#252525]" />
                            <div className="h-3 w-36 rounded bg-[#252525]/70" />
                          </div>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <div className="h-3.5 w-24 rounded bg-[#252525]" />
                      </td>
                      <td className="py-3 px-4">
                        <div className="h-3.5 w-8 rounded bg-[#252525]" />
                      </td>
                      <td className="py-3 px-4">
                        <div className="h-3.5 w-16 rounded bg-[#252525]" />
                      </td>
                      <td className="py-3 px-4">
                        <div className="h-6 w-16 rounded bg-[#252525]" />
                      </td>
                      <td className="py-3 px-4">
                        <div className="h-3.5 w-14 rounded bg-[#252525]" />
                      </td>
                      <td className="py-3 px-4">
                        <div className="h-6 w-14 rounded bg-[#252525]" />
                      </td>
                      <td className="py-3 px-4">
                        <div className="h-3.5 w-20 rounded bg-[#252525]" />
                      </td>
                      <td className="py-3 px-4 text-right">
                        <div className="h-7 w-14 rounded bg-[#252525] ml-auto" />
                      </td>
                    </tr>
                  ))
                ) : isError ? (
                  // Error State
                  <tr>
                    <td colSpan={9} className="py-12 text-center">
                      <div className="mx-auto flex max-w-sm flex-col items-center justify-center text-center">
                        <AlertCircle className="size-8 text-[#ff6347] mb-2" />
                        <p className="text-sm font-medium text-[#f6f6f6]">
                          Failed to load user directory
                        </p>
                        <p className="text-xs text-[#929292] mt-1 mb-4">
                          {error?.message || "An unexpected error occurred while communicating with the authentication service."}
                        </p>
                        <button
                          type="button"
                          onClick={() => refetch()}
                          className="inline-flex items-center gap-1.5 rounded-lg bg-[#252525] px-3 py-1.5 text-xs text-[#f6f6f6] hover:bg-[#2f2f2f] transition-colors"
                        >
                          <RefreshCw className="size-3.5" />
                          <span>Retry connection</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                ) : displayedUsers.length === 0 ? (
                  // Empty State
                  <tr>
                    <td colSpan={9} className="py-16 text-center">
                      <div className="mx-auto flex max-w-sm flex-col items-center justify-center text-center">
                        <UsersIcon className="size-8 text-[#838383] mb-2" />
                        <p className="text-sm font-medium text-[#f6f6f6]">
                          No users found
                        </p>
                        <p className="text-xs text-[#929292] mt-1 mb-4">
                          {searchInput || statusFilter !== "all" || providerFilter !== "all" || verificationFilter !== "all"
                            ? "No account records matched your active query and filter criteria."
                            : "There are currently no registered users in the organization."}
                        </p>
                        {(searchInput || statusFilter !== "all" || providerFilter !== "all" || verificationFilter !== "all") && (
                          <button
                            type="button"
                            onClick={() => {
                              setSearchInput("")
                              setStatusFilter("all")
                              setProviderFilter("all")
                              setVerificationFilter("all")
                              setPage(1)
                            }}
                            className="inline-flex items-center gap-1.5 rounded-lg border border-[#292929] bg-[#191919] px-3.5 py-1.5 text-xs text-[#ff967f] hover:bg-[#222222] transition-colors"
                          >
                            <span>Clear all filters</span>
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ) : (
                  // Resolved Users Rows (Matching Figma Node 310:397 - 310:492)
                  displayedUsers.map((user) => {
                    const fullName =
                      user.firstName && user.lastName
                        ? `${user.firstName} ${user.lastName}`
                        : user.name || "Unnamed user"
                    const isVerified = user.isEmailVerified || user.isVerified
                    const joined = formatJoinedDate(user.createdAt)
                    const initials = getUserInitials(user)

                    return (
                      <tr
                        key={user.id}
                        onClick={() => router.push(`/users/${user.id}`)}
                        className="h-[72px] transition-colors hover:bg-[#1a1715]/60 group cursor-pointer"
                      >
                        {/* User Column */}
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-3">
                            <div className="size-8 shrink-0 rounded-full bg-[#1e1e1e] border border-[#2e2e2e] text-[#f6f6f6] font-mono text-[11px] font-medium flex items-center justify-center">
                              {initials}
                            </div>
                            <div className="min-w-0">
                              <p className="font-medium text-[#f6f6f6] text-[14px] truncate leading-tight">
                                {fullName}
                              </p>
                              <p className="text-[12px] text-[#929292] truncate leading-normal">
                                {user.email || "No email"}
                              </p>
                            </div>
                          </div>
                        </td>

                        {/* Phone Column */}
                        <td className="py-3 px-4 text-[#b9b9b9] text-[12px]">
                          {user.phone ? (
                            <span className="font-mono">{user.phone}</span>
                          ) : (
                            <span className="text-[#929292]">Not provided</span>
                          )}
                        </td>

                        {/* Country Column */}
                        <td className="py-3 px-4 text-[#b9b9b9] text-[12px] font-mono">
                          {user.country || "—"}
                        </td>

                        {/* Auth Provider Column */}
                        <td className="py-3 px-4 text-[#b9b9b9] text-[12px]">
                          {formatProvider(user.authProvider)}
                        </td>

                        {/* Verification Column */}
                        <td className="py-3 px-4">
                          {isVerified ? (
                            <span className="inline-flex h-[26px] items-center rounded-[6px] bg-[#1c2820] px-2 text-[12px] font-normal text-[#a2c7ad]">
                              Verified
                            </span>
                          ) : (
                            <span className="inline-flex h-[26px] items-center rounded-[6px] bg-[#29251c] px-2 text-[12px] font-normal text-[#dfc38c]">
                              Unverified
                            </span>
                          )}
                        </td>

                        {/* Onboarding Column */}
                        <td className="py-3 px-4 text-[12px]">
                          {user.isOnboarded ? (
                            <span className="text-[#b9b9b9]">Complete</span>
                          ) : (
                            <span className="text-[#dfc38c]">Pending</span>
                          )}
                        </td>

                        {/* Status Column */}
                        <td className="py-3 px-4">
                          {user.status === "active" ? (
                            <span className="inline-flex h-[26px] items-center rounded-[6px] bg-[#1c2820] px-2 text-[12px] font-normal text-[#a2c7ad]">
                              Active
                            </span>
                          ) : user.status === "blocked" ? (
                            <span className="inline-flex h-[26px] items-center rounded-[6px] bg-[#2a1b18] px-2 text-[12px] font-normal text-[#ff967f]">
                              Blocked
                            </span>
                          ) : (
                            <span className="inline-flex h-[26px] items-center rounded-[6px] bg-[#252525] px-2 text-[12px] font-normal text-[#929292]">
                              Deleted
                            </span>
                          )}
                        </td>

                        {/* Joined Column */}
                        <td className="py-3 px-4">
                          <p className="text-[12px] text-[#b9b9b9] leading-tight font-mono">
                            {joined.date}
                          </p>
                          <p className="text-[12px] text-[#929292] leading-normal font-mono">
                            {joined.time}
                          </p>
                        </td>

                        {/* Action Column */}
                        <td className="py-3 px-4 text-right">
                          <Link
                            href={`/users/${user.id}`}
                            onClick={(e) => e.stopPropagation()}
                            className="inline-flex h-[34px] items-center justify-center rounded-[8px] bg-[#191919] border border-[#292929] px-3 text-[12px] font-normal text-[#f6f6f6] transition-all hover:bg-[#ff795c] hover:text-[#090909] hover:border-[#ff795c] cursor-pointer"
                          >
                            <span>View ↗</span>
                          </Link>
                        </td>
                      </tr>
                    )
                  })
                )}
              </tbody>
            </table>
          </div>

          {/* Table Footer & Pagination (Matching Figma Node 310:493 - 310:505) */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 px-5 py-4 border-t border-[#292929] bg-[#141414] text-xs">
            {/* Showing Count */}
            <p className="text-[#929292]">
              Showing {startRecord}–{endRecord} of {totalCount.toLocaleString()} users
            </p>

            {/* Pagination Controls */}
            <div className="flex items-center gap-2">
              {/* Rows per page selector */}
              <div className="relative mr-2 hidden sm:block">
                <select
                  value={pageSize}
                  onChange={(e) => {
                    setPageSize(Number(e.target.value))
                    setPage(1)
                  }}
                  className="h-[34px] appearance-none rounded-lg border border-[#292929] bg-[#191919] pl-2.5 pr-7 text-xs text-[#b9b9b9] outline-none hover:bg-[#222222] transition-colors cursor-pointer"
                  aria-label="Rows per page"
                >
                  <option value={6}>Rows: 6</option>
                  <option value={10}>Rows: 10</option>
                  <option value={20}>Rows: 20</option>
                  <option value={50}>Rows: 50</option>
                </select>
                <ChevronDown className="pointer-events-none absolute right-2 top-2.5 size-3 text-[#b9b9b9]" />
              </div>

              {/* Previous Button */}
              <button
                type="button"
                onClick={handlePrevPage}
                disabled={page <= 1 || isLoading}
                className="h-[34px] rounded-[8px] border border-[#292929] bg-[#191919] px-3 text-xs text-[#f6f6f6] transition-colors hover:bg-[#252525] disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
              >
                Previous
              </button>

              {/* Page Number Buttons (Show first 3-5 pages) */}
              {Array.from({ length: Math.min(totalPages, 5) }).map((_, idx) => {
                const pageNumber = idx + 1
                const isActive = pageNumber === page
                return (
                  <button
                    key={`page-${pageNumber}`}
                    type="button"
                    onClick={() => setPage(pageNumber)}
                    disabled={isLoading}
                    className={cn(
                      "size-[34px] rounded-[8px] text-xs transition-colors cursor-pointer flex items-center justify-center font-medium",
                      isActive
                        ? "bg-[#ff795c] text-[#090909]"
                        : "border border-[#292929] bg-[#191919] text-[#f6f6f6] hover:bg-[#252525]"
                    )}
                  >
                    {pageNumber}
                  </button>
                )
              })}

              {/* Next Button */}
              <button
                type="button"
                onClick={handleNextPage}
                disabled={page >= totalPages || isLoading}
                className="h-[34px] rounded-[8px] border border-[#292929] bg-[#191919] px-3 text-xs text-[#f6f6f6] transition-colors hover:bg-[#252525] disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
              >
                Next
              </button>
            </div>
          </div>
        </div>
      </div>
    </AdminShell>
  )
}
