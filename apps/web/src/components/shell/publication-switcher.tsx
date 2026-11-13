"use client"

/**
 * One account, several publications. The switcher sits in the studio header: every publication
 * the account runs, how many drafts each has waiting, the overview of all of them, and adding
 * another. Switching keeps you in the same part of the studio when that makes sense.
 */
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { Check, ChevronsUpDown, LayoutGrid, Plus } from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { readableOn } from "@/lib/format"
import { cn } from "@/lib/utils"

export const PUB_COOKIE = "hs-pub"

export interface PublicationSummary {
  slug: string
  name: string
  accentHex: string
  domain: string
  ready: number
  template: "editorial" | "broadcast"
}

export function PublicationTile({ pub, size = 24, className }: { pub: Pick<PublicationSummary, "name" | "accentHex">; size?: number; className?: string }) {
  return (
    <span
      aria-hidden
      className={cn("grid shrink-0 place-items-center rounded-[5px] font-black leading-none", className)}
      style={{ width: size, height: size, background: pub.accentHex, color: readableOn(pub.accentHex), fontSize: size * 0.5 }}
    >
      {pub.name[0]}
    </span>
  )
}

/** Set the publication and move to the right place: list pages stay put, a single item goes home. */
export function useSwitchPublication() {
  const router = useRouter()
  const pathname = usePathname() ?? "/studio"
  return (slug: string, to?: string) => {
    document.cookie = `${PUB_COOKIE}=${slug}; path=/; max-age=${60 * 60 * 24 * 365}; samesite=lax`
    const parts = pathname.split("/").filter(Boolean)
    // /studio/review/v_blues belongs to one publication; /studio/review is a list every publication has.
    const keep = parts.length <= 2 || parts[1] === "settings"
    const dest = to ?? (keep && pathname !== "/studio/publications" ? pathname : "/studio")
    if (dest === pathname) router.refresh()
    else router.push(dest)
  }
}

export function PublicationSwitcher({ current, publications }: { current: string; publications: PublicationSummary[] }) {
  const pub = publications.find((p) => p.slug === current) ?? publications[0]
  const switchTo = useSwitchPublication()
  const pathname = usePathname()
  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        className="flex min-w-0 items-center gap-2.5 rounded-md py-1.5 pl-1.5 pr-2 text-left outline-none transition-colors hover:bg-accent focus-visible:ring-2 focus-visible:ring-ring data-[state=open]:bg-accent"
        aria-label={`Publication: ${pub.name}. Switch publication`}
      >
        <PublicationTile pub={pub} size={26} />
        <span className="flex min-w-0 flex-col">
          <span className="truncate text-[15px] font-semibold leading-5">{pub.name}</span>
          <span className="hidden truncate font-mono text-[11px] leading-4 text-muted-foreground sm:block">{pub.domain}</span>
        </span>
        <ChevronsUpDown className="size-4 shrink-0 text-muted-foreground" aria-hidden />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="w-[320px] p-1.5">
        <DropdownMenuLabel className="flex items-center justify-between text-[12px] font-semibold text-muted-foreground">
          Your publications <span className="font-normal tabular">{publications.length}</span>
        </DropdownMenuLabel>
        {publications.map((p) => (
          <DropdownMenuItem key={p.slug} onSelect={() => switchTo(p.slug)} className="gap-3 py-2">
            <PublicationTile pub={p} size={32} />
            <span className="flex min-w-0 flex-1 flex-col">
              <span className="truncate text-[14px] font-semibold">{p.name}</span>
              <span className="truncate text-[12px] text-muted-foreground">
                {p.ready > 0 ? `${p.ready} ready to review` : "All caught up"} · {p.template === "editorial" ? "Editorial" : "Broadcast"}
              </span>
            </span>
            {p.slug === pub.slug && <Check className="size-4" aria-label="Current" />}
          </DropdownMenuItem>
        ))}
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild className={cn("gap-3 py-2", pathname === "/studio/publications" && "bg-accent")}>
          <Link href="/studio/publications">
            <span className="grid size-8 place-items-center rounded-[5px] border" aria-hidden>
              <LayoutGrid className="size-4" />
            </span>
            <span className="flex flex-col">
              <span className="text-[14px] font-semibold">All publications</span>
              <span className="text-[12px] text-muted-foreground">Every brand at a glance</span>
            </span>
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild className="gap-3 py-2">
          <Link href="/signup/channel">
            <span className="grid size-8 place-items-center rounded-[5px] border border-dashed" aria-hidden>
              <Plus className="size-4" />
            </span>
            <span className="flex flex-col">
              <span className="text-[14px] font-semibold">Add a publication</span>
              <span className="text-[12px] text-muted-foreground">Another YouTube channel or brand</span>
            </span>
          </Link>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

/** A button that switches publication and goes somewhere, e.g. "Open studio" on the overview. */
export function SwitchLink({ slug, to, className, children }: { slug: string; to: string; className?: string; children: React.ReactNode }) {
  const switchTo = useSwitchPublication()
  return (
    <button type="button" onClick={() => switchTo(slug, to)} className={className}>
      {children}
    </button>
  )
}
