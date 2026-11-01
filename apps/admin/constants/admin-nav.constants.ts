import {
  Home,
  Package,
  Users,
} from "lucide-react"
import type {
  NavSection,
  UserProfile,
} from "@workspace/ui/types/navigation.types"

export const ADMIN_USER_PROFILE: UserProfile = {
  name: "Alex Morgan",
  role: "Organization owner",
  initials: "AM",
}

export const ADMIN_NAV_SECTIONS: NavSection[] = [
  {
    id: "workspace-section",
    label: "WORKSPACE",
    items: [
      {
        id: "nav-home",
        title: "Home",
        href: "/",
        icon: Home,
        exactMatch: true,
      },
      {
        id: "nav-products",
        title: "Product",
        href: "/products",
        icon: Package,
      },
      {
        id: "nav-users",
        title: "User",
        href: "/users",
        icon: Users,
      },
    ],
  },
]
