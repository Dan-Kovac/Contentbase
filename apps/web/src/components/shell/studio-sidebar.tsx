"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { BarChart3, Inbox, LayoutDashboard, LayoutGrid, Library, Settings } from "lucide-react"
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
  { href: "/studio/review", label: "Review", icon: Inbox, badge: true },
  { href: "/studio/library", label: "Library", icon: Library, also: ["/studio/articles", "/studio/shorts", "/studio/pages", "/studio/upload"] },
  { href: "/studio/analytics", label: "Analytics", icon: BarChart3 },
  { href: "/studio/settings", label: "Settings", icon: Settings, also: ["/studio/imports"] },
]

function isActive(pathname: string, item: { href: string; also?: string[] }) {
  if (item.href === "/studio") return pathname === "/studio"
  return [item.href, ...(item.also ?? [])].some((h) => pathname === h || pathname.startsWith(h + "/"))
}

export function StudioSidebar({ reviewCount = 0, publications = 1 }: { reviewCount?: number; publications?: number }) {
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
                  <SidebarMenuButton asChild isActive={isActive(pathname, item)} tooltip={item.label}>
                    <Link href={item.href}>
                      <item.icon />
                      <span>{item.label}</span>
                    </Link>
                  </SidebarMenuButton>
                  {item.badge && reviewCount > 0 && <SidebarMenuBadge className="bg-pitch text-pop-foreground rounded-sm px-1.5 text-[11px] font-bold">{reviewCount}</SidebarMenuBadge>}
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
        <SidebarGroup>
          <SidebarGroupLabel>Your account</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton asChild isActive={pathname === "/studio/publications"} tooltip="All publications">
                  <Link href="/studio/publications">
                    <LayoutGrid />
                    <span>All publications</span>
                  </Link>
                </SidebarMenuButton>
                <SidebarMenuBadge className="rounded-sm px-1.5 text-[11px] font-semibold text-muted-foreground">{publications}</SidebarMenuBadge>
              </SidebarMenuItem>
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
