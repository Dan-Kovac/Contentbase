"use client"

/**
 * Homestand Native Formats (ADS-01, ADS-07). Advertisers supply a brief (logo/name, one
 * line, an image or loop, a link). Homestand renders it in the channel's own design, so
 * every ad is labelled, fixed in size (no layout shift), fast (no third-party code) and
 * unlike a standard banner. Age-restricted categories carry an 18+ mark and an opt-out.
 */
import { useState } from "react"
import { ArrowUpRight, Volume2 } from "lucide-react"
import { cn } from "@/lib/utils"
import { readableOn } from "@/lib/format"
import type { AgeCategory, Sponsor } from "@/lib/types"

const OPT_OUT: Record<AgeCategory, string> = {
  wagering: "Don't show me betting ads",
  alcohol: "Don't show me alcohol ads",
}

function SponsorMark({ sponsor, size = 20 }: { sponsor: Sponsor; size?: number }) {
  const initials = sponsor.name
    .split(/\s+/)
    .slice(0, 2)
    .map((w) => w[0])
    .join("")
  return (
    <span
      aria-hidden
      className="grid shrink-0 place-items-center rounded-[4px] font-bold leading-none"
      style={{ width: size, height: size, background: sponsor.colour, color: readableOn(sponsor.colour), fontSize: size * 0.42 }}
    >
      {initials}
    </span>
  )
}

function AgeTag({ category }: { category?: AgeCategory }) {
  if (!category) return null
  return (
    <span className="rounded-[2px] border border-current px-1 text-[10px] font-bold leading-[14px] tracking-[0.5px]" title="Shown only to signed-in, age-verified adults">
      18+
    </span>
  )
}

function OptOut({ category, className }: { category?: AgeCategory; className?: string }) {
  const [done, setDone] = useState(false)
  if (!category) return null
  return done ? (
    <span className={cn("text-xs", className)}>Done. You won&apos;t see these on Homestand.</span>
  ) : (
    <button type="button" onClick={() => setDone(true)} className={cn("text-xs font-medium underline underline-offset-2 outline-none focus-visible:ring-2 focus-visible:ring-ring", className)}>
      {OPT_OUT[category]}
    </button>
  )
}

/** 1. Chapter sponsor: a brand owns a moment of the video. Use in the chapter list and under the player. */
export function ChapterSponsorCredit({ sponsor, chapter, className }: { sponsor: Sponsor; chapter: string; className?: string }) {
  return (
    <div className={cn("flex flex-wrap items-center gap-x-3 gap-y-1 text-[13px]", className)}>
      <span className="flex items-center gap-2">
        <SponsorMark sponsor={sponsor} size={18} />
        <span className="text-muted-foreground">
          <span className="font-semibold text-foreground">{chapter}</span> · presented by{" "}
          <a href={sponsor.url} className="font-semibold text-foreground underline-offset-2 hover:underline" rel="sponsored noopener" target="_blank">
            {sponsor.name}
          </a>
        </span>
      </span>
      <span className="flex items-center gap-2 text-muted-foreground">
        <span className="text-[11px] font-bold uppercase tracking-[1px]">Sponsored</span>
        <AgeTag category={sponsor.ageCategory} />
        <OptOut category={sponsor.ageCategory} className="text-muted-foreground" />
      </span>
    </div>
  )
}

/** Where the chapter sponsor sits on the player timeline (fractions of the duration). */
export function ChapterSponsorSegment({ sponsor, from, to }: { sponsor: Sponsor; from: number; to: number }) {
  return (
    <span
      aria-hidden
      className="absolute inset-y-0 rounded-full"
      style={{ left: `${from * 100}%`, width: `${(to - from) * 100}%`, background: sponsor.colour, boxShadow: "0 0 0 1px rgba(255,255,255,.5)" }}
    />
  )
}

/**
 * 2. Half-time break: an editorial pause between article sections, styled like a broadcast
 * break. Breaks out of the reading column to the container width; fixed height.
 */
export function HalftimeBreak({ sponsor, className }: { sponsor: Sponsor; className?: string }) {
  const on = readableOn(sponsor.colour)
  return (
    <aside aria-label={`Sponsored by ${sponsor.name}`} className={cn("relative isolate overflow-hidden rounded-lg text-white", className)} style={{ height: 340 }}>
      {sponsor.image && (
        // eslint-disable-next-line @next/next/no-img-element -- sponsor brief image
        <img src={sponsor.image} alt="" className="absolute inset-0 -z-20 size-full object-cover" />
      )}
      <div className="absolute inset-0 -z-10" style={{ background: `linear-gradient(90deg, ${sponsor.colour} 0%, ${sponsor.colour}e6 38%, ${sponsor.colour}33 100%)` }} />
      <div className="flex h-full flex-col justify-between p-6 md:p-10" style={{ color: on }}>
        <div className="flex items-center justify-between gap-4">
          <span className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-[1.5px]">
            <span className="h-[2px] w-6 bg-current" aria-hidden />
            Half-time · Sponsored
            <AgeTag category={sponsor.ageCategory} />
          </span>
          <span className="hidden items-center gap-1.5 text-xs opacity-80 sm:flex">
            <Volume2 className="size-3.5" aria-hidden /> Muted loop
          </span>
        </div>
        <div className="flex max-w-[34ch] flex-col gap-4">
          <span className="flex items-center gap-2.5">
            <SponsorMark sponsor={{ ...sponsor, colour: on === "#ffffff" ? "#ffffff" : "#0a0a0a" }} size={28} />
            <span className="text-[15px] font-semibold">{sponsor.name}</span>
          </span>
          <p className="text-[30px] font-extrabold leading-[34px] tracking-[-0.6px] md:text-[38px] md:leading-[42px]">{sponsor.line}</p>
          <div className="flex flex-wrap items-center gap-4">
            <a
              href={sponsor.url}
              rel="sponsored noopener"
              target="_blank"
              className="inline-flex h-10 items-center gap-1.5 rounded-md px-4 text-sm font-semibold outline-none focus-visible:ring-2 focus-visible:ring-offset-2"
              style={{ background: on, color: sponsor.colour }}
            >
              {sponsor.cta} <ArrowUpRight className="size-4" aria-hidden />
            </a>
            <OptOut category={sponsor.ageCategory} />
          </div>
        </div>
      </div>
    </aside>
  )
}

/**
 * 3. Stat card: a sponsor message set like a scoreboard tile. Sits beside key points or
 * in a stat row, the same size as editorial stat tiles.
 */
export function StatCard({ sponsor, className }: { sponsor: Sponsor; className?: string }) {
  const stat = sponsor.stat ?? { value: "—", label: sponsor.line }
  return (
    <aside aria-label={`Sponsored by ${sponsor.name}`} className={cn("flex min-h-[188px] flex-col justify-between gap-4 rounded-lg border p-5", className)} style={{ borderTop: `4px solid ${sponsor.colour}` }}>
      <div className="flex items-center justify-between gap-2">
        <span className="flex items-center gap-2 text-[13px] font-semibold">
          <SponsorMark sponsor={sponsor} />
          {sponsor.name}
        </span>
        <span className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-[1px] text-muted-foreground">
          Sponsored <AgeTag category={sponsor.ageCategory} />
        </span>
      </div>
      <div>
        <p className="text-[48px] font-extrabold leading-none tracking-[-1.5px]">{stat.value}</p>
        <p className="mt-1.5 text-[14px] leading-5 text-muted-foreground">{stat.label}</p>
      </div>
      <div className="flex flex-wrap items-center justify-between gap-2">
        <a href={sponsor.url} rel="sponsored noopener" target="_blank" className="inline-flex items-center gap-1 text-[13px] font-semibold underline-offset-2 hover:underline">
          {sponsor.cta} <ArrowUpRight className="size-3.5" aria-hidden />
        </a>
        <OptOut category={sponsor.ageCategory} className="text-muted-foreground" />
      </div>
    </aside>
  )
}

/** 4. Sponsored short: exactly the size of a ShortCard (168 × 9:16) in rows and feeds. */
export function SponsoredShortCard({ sponsor, className, fill = false }: { sponsor: Sponsor; className?: string; fill?: boolean }) {
  const on = readableOn(sponsor.colour)
  return (
    <a
      href={sponsor.url}
      rel="sponsored noopener"
      target="_blank"
      aria-label={`Sponsored short from ${sponsor.name}: ${sponsor.line}`}
      className={cn("group flex shrink-0 flex-col gap-2 outline-none focus-visible:ring-2 focus-visible:ring-ring", fill ? "w-full" : "w-[168px]", className)}
    >
      <div className="relative w-full overflow-hidden rounded-lg" style={{ aspectRatio: "9/16", background: sponsor.colour }}>
        {sponsor.image && (
          // eslint-disable-next-line @next/next/no-img-element -- sponsor brief image
          <img src={sponsor.image} alt="" className="absolute inset-0 size-full object-cover" />
        )}
        <div className="absolute inset-0" style={{ background: `linear-gradient(180deg, transparent 40%, ${sponsor.colour} 100%)` }} />
        <span className="absolute left-2 top-2 flex items-center gap-1 rounded-[2px] bg-black/70 px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-[0.8px] text-white">
          Sponsored {sponsor.ageCategory && <span>· 18+</span>}
        </span>
        <div className="absolute inset-x-0 bottom-0 flex flex-col gap-2 p-3" style={{ color: on }}>
          <span className="flex items-center gap-1.5 text-[12px] font-semibold">
            <SponsorMark sponsor={{ ...sponsor, colour: on }} size={16} />
            {sponsor.name}
          </span>
          <span className="w-fit rounded-full px-2.5 py-1 text-[11px] font-bold" style={{ background: on, color: sponsor.colour }}>
            {sponsor.cta}
          </span>
        </div>
      </div>
      <p className="line-clamp-2 text-[15px] font-semibold leading-5 text-foreground group-hover:underline">{sponsor.line}</p>
    </a>
  )
}

/**
 * 5. Presented by: a sponsor credit attached to a module header or the lead story,
 * the way a broadcast is "brought to you by". Full width of its module, never a box.
 */
export function PresentedBy({ sponsor, className, tone = "light" }: { sponsor: Sponsor; className?: string; tone?: "light" | "dark" }) {
  return (
    <div
      className={cn(
        "flex flex-wrap items-center justify-between gap-x-4 gap-y-1 border-t-2 pt-2 text-[13px]",
        tone === "dark" ? "text-white/80" : "text-muted-foreground",
        className,
      )}
      style={{ borderColor: sponsor.colour }}
    >
      <span className="flex items-center gap-2">
        <span className="text-[11px] font-bold uppercase tracking-[1px]">Presented by</span>
        <SponsorMark sponsor={sponsor} size={18} />
        <a href={sponsor.url} rel="sponsored noopener" target="_blank" className={cn("font-semibold hover:underline", tone === "dark" ? "text-white" : "text-foreground")}>
          {sponsor.name}
        </a>
        <AgeTag category={sponsor.ageCategory} />
      </span>
      <span className="truncate">{sponsor.line}</span>
    </div>
  )
}
