import Link from "next/link"
import { Play } from "lucide-react"
import { cn } from "@/lib/utils"
import { formatDuration } from "@/lib/format"
import { StatusBadge } from "./status-badge"

/**
 * Poster placeholder: a tone fill with stepped tiers and a play glyph.
 * Real posters come from the video host (Mux / YouTube thumbnails).
 */
export function VideoThumb({
  tone,
  durationSec,
  ratio = "16/9",
  exclusive,
  live,
  className,
  children,
}: {
  tone?: string
  durationSec?: number
  ratio?: "16/9" | "9/16"
  exclusive?: boolean
  live?: boolean
  className?: string
  children?: React.ReactNode
}) {
  return (
    <div
      className={cn("relative w-full overflow-hidden rounded-lg", className)}
      style={{ aspectRatio: ratio, background: tone ?? "var(--chan, #1a1a1a)" }}
    >
      <svg viewBox="0 0 160 90" preserveAspectRatio="xMidYMax slice" className="absolute inset-0 size-full" aria-hidden>
        <rect x="0" y="70" width="160" height="20" fill="#fff" opacity="0.08" />
        <rect x="20" y="56" width="120" height="14" fill="#fff" opacity="0.08" />
        <rect x="40" y="42" width="80" height="14" fill="#fff" opacity="0.06" />
      </svg>
      <div className="absolute inset-0 grid place-items-center">
        <span className="grid size-11 place-items-center rounded-full bg-black/35 text-white backdrop-blur-sm">
          <Play className="ml-0.5 size-5 fill-current" />
        </span>
      </div>
      {(exclusive || live) && (
        <div className="absolute left-2 top-2 flex gap-1">
          {live && <StatusBadge tone="live" />}
          {exclusive && <StatusBadge tone="exclusive" />}
        </div>
      )}
      {durationSec != null && (
        <span className="absolute bottom-2 right-2 rounded-[2px] bg-black/80 px-1.5 py-0.5 font-mono text-xs font-medium text-white tabular">
          {formatDuration(durationSec)}
        </span>
      )}
      {children}
    </div>
  )
}

export function VideoCard({
  href,
  title,
  kicker,
  meta,
  tone,
  durationSec,
  exclusive,
  live,
  size = "md",
}: {
  href: string
  title: string
  kicker?: string
  meta?: string
  tone?: string
  durationSec?: number
  exclusive?: boolean
  live?: boolean
  size?: "sm" | "md" | "lg"
}) {
  return (
    <Link href={href} className="group flex min-w-0 flex-col gap-2 rounded-lg outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2">
      <VideoThumb tone={tone} durationSec={durationSec} exclusive={exclusive} live={live} />
      {kicker && <span className="kicker mt-1 text-foreground">{kicker}</span>}
      <h3
        className={cn(
          "font-[family-name:var(--chan-display,var(--font-sans))] font-bold tracking-[var(--chan-tracking,-0.01em)] text-foreground group-hover:underline group-hover:decoration-2 group-hover:underline-offset-4",
          size === "sm" && "text-[17px] leading-[22px]",
          size === "md" && "text-xl leading-[26px]",
          size === "lg" && "text-3xl leading-[34px]",
        )}
      >
        {title}
      </h3>
      {meta && <span className="text-[13px] leading-[18px] text-muted-foreground">{meta}</span>}
    </Link>
  )
}

export function ShortCard({
  href,
  title,
  tone,
  durationSec,
  sponsored,
  className,
}: {
  href: string
  title: string
  tone?: string
  durationSec?: number
  sponsored?: boolean
  className?: string
}) {
  return (
    <Link href={href} className={cn("group flex w-[168px] shrink-0 flex-col gap-2 outline-none focus-visible:ring-2 focus-visible:ring-ring", className)}>
      <VideoThumb tone={tone} durationSec={durationSec} ratio="9/16" />
      {sponsored && <span className="text-[11px] font-bold uppercase tracking-[1px] text-muted-foreground">Sponsored</span>}
      <p className="line-clamp-2 text-[15px] font-semibold leading-5 text-foreground group-hover:underline">{title}</p>
    </Link>
  )
}
