"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  BarChart3,
  CreditCard,
  Download,
  Globe,
  Inbox,
  LayoutDashboard,
  Library,
  Link2,
  Megaphone,
  Mic,
  Palette,
  Settings,
  Smartphone,
  Upload,
} from "lucide-react"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuBadge,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
} from "@/components/ui/sidebar"
import { Monogram, Wordmark } from "@/components/brand/wordmark"

export const STUDIO_NAV = [
  { href: "/studio", label: "Home", icon: LayoutDashboard },
  { href: "/studio/review", label: "Ready to review", icon: Inbox, badge: "2" },
  { href: "/studio/library", label: "Library", icon: Library },
  { href: "/studio/shorts", label: "Shorts", icon: Smartphone },
  { href: "/studio/upload", label: "Upload", icon: Upload },
  { href: "/studio/imports", label: "Imports", icon: Download },
  { href: "/studio/analytics", label: "Analytics", icon: BarChart3 },
]

export const SETTINGS_NAV = [
  { href: "/studio/settings", label: "Channel", icon: Settings },
  { href: "/studio/settings/design", label: "Design", icon: Palette },
  { href: "/studio/settings/connections", label: "Connections", icon: Link2 },
  { href: "/studio/settings/domain", label: "Domain", icon: Globe },
  { href: "/studio/settings/monetisation", label: "Monetisation", icon: Megaphone },
  { href: "/studio/settings/voice", label: "Brand voice", icon: Mic },
  { href: "/studio/settings/billing", label: "Billing", icon: CreditCard },
]

function isActive(pathname: string, href: string) {
  if (href === "/studio" || href === "/studio/settings") return pathname === href
  return pathname === href || pathname.startsWith(href + "/")
}

export function StudioSidebar() {
  const pathname = usePathname() ?? ""
  return (
    <Sidebar collapsible="icon">
      <SidebarHeader className="h-16 justify-center px-4 group-data-[collapsible=icon]:px-2">
        <Link href="/studio" className="flex items-center text-foreground">
          <span className="group-data-[collapsible=icon]:hidden">
            <Wordmark height={20} />
          </span>
          <span className="hidden group-data-[collapsible=icon]:block">
            <Monogram size={28} />
          </span>
        </Link>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {STUDIO_NAV.map((item) => (
                <SidebarMenuItem key={item.href}>
                  <SidebarMenuButton asChild isActive={isActive(pathname, item.href)} tooltip={item.label}>
                    <Link href={item.href}>
                      <item.icon />
                      <span>{item.label}</span>
                    </Link>
                  </SidebarMenuButton>
                  {item.badge && <SidebarMenuBadge className="bg-pitch text-pop-foreground rounded-sm px-1.5 text-[11px] font-bold">{item.badge}</SidebarMenuBadge>}
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
        <SidebarGroup>
          <SidebarGroupLabel>Settings</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {SETTINGS_NAV.map((item) => (
                <SidebarMenuItem key={item.href}>
                  <SidebarMenuButton asChild isActive={isActive(pathname, item.href)} tooltip={item.label}>
                    <Link href={item.href}>
                      <item.icon />
                      <span>{item.label}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter className="group-data-[collapsible=icon]:hidden">
        <div className="rounded-lg border bg-card p-3">
          <p className="text-[13px] font-semibold">Pro trial · 9 days left</p>
          <p className="mt-0.5 text-xs text-muted-foreground">18.5 of 40 video hours used</p>
          <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-muted">
            <div className="h-full w-[46%] rounded-full bg-pitch" />
          </div>
        </div>
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}
