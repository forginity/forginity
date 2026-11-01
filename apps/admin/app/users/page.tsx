"use client"

import * as React from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  Edit2,
  Mail,
  MoreVertical,
  Plus,
  Search,
  ShieldCheck,
  UserCheck,
  Users as UsersIcon,
  UserX,
} from "lucide-react"
import { AppShell } from "@workspace/ui/components/app-shell"
import { DashboardHeader } from "@workspace/ui/components/dashboard-header"
import { MetricCard } from "@workspace/ui/components/metric-card"
import { Button } from "@workspace/ui/components/button"
import { Card } from "@workspace/ui/components/card"
import { Badge } from "@workspace/ui/components/badge"
import { Avatar, AvatarFallback } from "@workspace/ui/components/avatar"
import {
  ADMIN_NAV_SECTIONS,
  ADMIN_USER_PROFILE,
} from "@/constants/admin-nav.constants"

interface UserRow {
  id: string
  name: string
  email: string
  role: string
  status: "Active" | "Pending" | "Suspended"
  initials: string
  lastActive: string
}

const USERS: UserRow[] = [
  {
    id: "usr-1",
    name: "Alex Morgan",
    email: "alex.morgan@forginity.com",
    role: "Organization owner",
    status: "Active",
    initials: "AM",
    lastActive: "Just now",
  },
  {
    id: "usr-2",
    name: "Maya Chen",
    email: "maya.chen@forginity.com",
    role: "Lead Architect",
    status: "Active",
    initials: "MC",
    lastActive: "12m ago",
  },
  {
    id: "usr-3",
    name: "Noah Wilson",
    email: "noah.wilson@forginity.com",
    role: "Product Manager",
    status: "Active",
    initials: "NW",
    lastActive: "1h ago",
  },
  {
    id: "usr-4",
    name: "Olivia Park",
    email: "olivia.park@forginity.com",
    role: "Security Engineer",
    status: "Active",
    initials: "OP",
    lastActive: "3h ago",
  },
  {
    id: "usr-5",
    name: "Liam Patel",
    email: "liam.patel@forginity.com",
    role: "DevOps Engineer",
    status: "Active",
    initials: "LP",
    lastActive: "5h ago",
  },
  {
    id: "usr-6",
    name: "Emma Davis",
    email: "emma.davis@forginity.com",
    role: "Frontend Developer",
    status: "Pending",
    initials: "ED",
    lastActive: "Invited yesterday",
  },
]

export default function UsersPage() {
  const pathname = usePathname()
  const [searchTerm, setSearchTerm] = React.useState("")
  const [roleFilter, setRoleFilter] = React.useState<string>("All")

  const filteredUsers = USERS.filter((user) => {
    const matchesSearch =
      user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.role.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesRole = roleFilter === "All" || user.role.includes(roleFilter)
    return matchesSearch && matchesRole
  })

  return (
    <AppShell
      currentPath={pathname}
      breadcrumbs={[{ label: "Workspace" }, { label: "User" }]}
      sections={ADMIN_NAV_SECTIONS}
      user={ADMIN_USER_PROFILE}
      linkComponent={Link}
    >
      <DashboardHeader
        title="Users"
        description="Manage organization members, access permissions, and session lifecycles."
        actions={
          <Button
            size="sm"
            className="h-8 gap-1.5 bg-[#f95738] text-white hover:bg-[#e0482b]"
          >
            <Plus className="size-4" />
            <span>Invite user</span>
          </Button>
        }
      />

      {/* KPI Metric Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <MetricCard
          title="Total users"
          value="48,260"
          change="+8.2%"
          changeType="positive"
          description="Registered across all products"
        />
        <MetricCard
          title="Daily active users"
          value="12,840"
          change="+18.6%"
          changeType="positive"
          description="Active within the last 24 hours"
        />
        <MetricCard
          title="Administrators"
          value="14"
          change="Full RBAC"
          changeType="neutral"
          description="Global administrative access"
        />
        <MetricCard
          title="Pending invites"
          value="6"
          change="Requires review"
          changeType="neutral"
          description="Awaiting email / SMS verification"
        />
      </div>

      {/* Users Table Card */}
      <Card className="overflow-hidden rounded-xl border border-border/50 bg-card/60">
        <div className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between border-b border-border/40">
          <div>
            <h2 className="text-sm font-semibold text-foreground">User directory</h2>
            <p className="text-xs text-muted-foreground">
              {filteredUsers.length} members found
            </p>
          </div>

          <div className="flex items-center gap-2.5">
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 size-3.5 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search users..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="h-8 w-48 rounded-lg border border-border/50 bg-background/50 pl-8 pr-3 text-xs text-foreground placeholder:text-muted-foreground/60 focus:border-border focus:outline-none"
              />
            </div>

            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              className="h-8 rounded-lg border border-border/50 bg-background/50 px-2.5 text-xs text-foreground focus:border-border focus:outline-none"
              aria-label="Filter users by role"
            >
              <option value="All">All roles</option>
              <option value="owner">Owner</option>
              <option value="Architect">Architect</option>
              <option value="Engineer">Engineer</option>
              <option value="Manager">Manager</option>
            </select>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="border-b border-border/40 bg-muted/20 text-[11px] font-medium text-muted-foreground">
              <tr>
                <th className="py-3 px-4">User</th>
                <th className="py-3 px-4">Role</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4">Last active</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/30">
              {filteredUsers.map((user) => (
                <tr
                  key={user.id}
                  className="transition-colors hover:bg-muted/30"
                >
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-3">
                      <Avatar className="size-8">
                        <AvatarFallback className="text-[11px] bg-muted font-medium">
                          {user.initials}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <span className="font-medium text-foreground">
                          {user.name}
                        </span>
                        <p className="text-[11px] text-muted-foreground">
                          {user.email}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="py-3 px-4 text-muted-foreground">
                    {user.role}
                  </td>
                  <td className="py-3 px-4">
                    <Badge
                      variant="outline"
                      className={
                        user.status === "Active"
                          ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-400"
                          : user.status === "Pending"
                            ? "border-amber-500/30 bg-amber-500/10 text-amber-400"
                            : "border-rose-500/30 bg-rose-500/10 text-rose-400"
                      }
                    >
                      • {user.status}
                    </Badge>
                  </td>
                  <td className="py-3 px-4 text-muted-foreground">
                    {user.lastActive}
                  </td>
                  <td className="py-3 px-4 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      <Button
                        variant="ghost"
                        size="xs"
                        className="h-7 gap-1 px-2 text-xs text-muted-foreground hover:text-foreground"
                      >
                        <Edit2 className="size-3" />
                        <span>Edit</span>
                      </Button>
                      <Button
                        variant="ghost"
                        size="xs"
                        className="h-7 px-2 text-xs text-muted-foreground hover:text-foreground"
                      >
                        <MoreVertical className="size-3.5" />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="flex items-center justify-between border-t border-border/40 px-4 py-3 text-[11px] text-muted-foreground">
          <span>Showing {filteredUsers.length} of {USERS.length} users</span>
          <span>Rows per page: 10</span>
        </div>
      </Card>
    </AppShell>
  )
}
