"use client"

/**
 * The studio has five places (Home, Review, Library, Analytics, Settings). Library and Settings
 * each gather several pages, so a tab bar across the top of those pages takes the place of
 * eleven sidebar items.
 */
import Link from "next/link"
import { usePathname } from "next/navigation"
import { ChevronDown } from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { cn } from "@/lib/utils"

type Tab = { href: string; label: string }

const LIBRARY: Tab[] = [
  { href: "/studio/library", label: "All content" },
  { href: "/studio/articles", label: "Articles" },
  { href: "/studio/shorts", label: "Shorts" },
  { href: "/studio/pages", label: "Pages" },
]

const VIDEO: Tab[] = [
  { href: "/studio/video", label: "Video" },
  { href: "/studio/video/templates", label: "Templates" },
  { href: "/studio/credits", label: "AI credits" },
]

const SETTINGS: Tab[] = [
  { href: "/studio/settings", label: "Channel" },
  { href: "/studio/settings/design", label: "Design" },
  { href: "/studio/settings/monetisation", label: "Monetisation" },
]
const SETTINGS_MORE: Tab[] = [
  { href: "/studio/settings/domain", label: "Domain" },
  { href: "/studio/settings/connections", label: "Connections" },
  { href: "/studio/imports", label: "Imports" },
  { href: "/studio/settings/voice", label: "Brand voice" },
  { href: "/studio/settings/billing", label: "Billing" },
]

export function StudioSectionTabs() {
  const pathname = usePathname() ?? ""
  const library = LIBRARY.some((t) => t.href === pathname)
  const video = VIDEO.some((t) => t.href === pathname)
  const settings = [...SETTINGS, ...SETTINGS_MORE].some((t) => t.href === pathname)
  if (!library && !settings && !video) return null
  const tabs = library ? LIBRARY : video ? VIDEO : SETTINGS
  const moreActive = SETTINGS_MORE.find((t) => t.href === pathname)
  const tabClass = (active: boolean) =>
    cn(
      "-mb-px inline-flex h-10 items-center gap-1 whitespace-nowrap border-b-2 px-1 text-[14px] font-medium outline-none transition-colors focus-visible:ring-2 focus-visible:ring-ring",
      active ? "border-foreground text-foreground" : "border-transparent text-muted-foreground hover:text-foreground",
    )
  return (
    <nav aria-label={library ? "Library" : video ? "Video" : "Settings"} className="mb-8 flex items-center gap-5 overflow-x-auto border-b [scrollbar-width:none]">
      {tabs.map((t) => (
        <Link key={t.href} href={t.href} className={tabClass(t.href === pathname)} aria-current={t.href === pathname ? "page" : undefined}>
          {t.label}
        </Link>
      ))}
      {settings && (
        <DropdownMenu>
          <DropdownMenuTrigger className={tabClass(!!moreActive)}>
            {moreActive ? moreActive.label : "More"} <ChevronDown className="size-3.5" aria-hidden />
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start">
            {SETTINGS_MORE.map((t) => (
              <DropdownMenuItem key={t.href} asChild>
                <Link href={t.href} aria-current={t.href === pathname ? "page" : undefined}>
                  {t.label}
                </Link>
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      )}
    </nav>
  )
}
