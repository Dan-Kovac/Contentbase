"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"

/** Header nav with the active item underlined in the channel accent. */
export function ChannelNavLinks({
  items,
  home,
  variant,
  className,
}: {
  items: { label: string; href: string }[]
  home: string
  variant: "desktop" | "mobile"
  className?: string
}) {
  const path = usePathname()
  const isActive = (href: string) => (href === home ? path === home : path === href || path.startsWith(`${href}/`))
  return (
    <nav aria-label="Sections" className={className}>
      <ul className={cn("flex items-center", variant === "desktop" ? "gap-6" : "gap-5")}>
        {items.map((n) => {
          const active = isActive(n.href)
          return (
            <li key={n.href} className="shrink-0">
              <Link
                href={n.href}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "relative inline-flex items-center whitespace-nowrap rounded-sm outline-none transition-colors hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring",
                  variant === "desktop" ? "h-16" : "h-10",
                  active ? "text-foreground" : "text-muted-foreground",
                  active && "after:absolute after:inset-x-0 after:bottom-0 after:h-[3px] after:bg-[var(--chan)]",
                )}
              >
                {n.label}
              </Link>
            </li>
          )
        })}
      </ul>
    </nav>
  )
}
