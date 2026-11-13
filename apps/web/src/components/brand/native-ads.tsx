"use client"

/**
 * Homestand Native Formats (ADS-01, ADS-07). Advertisers supply a brief (name, one line, a
 * colour, a link, optionally an image or muted loop). Homestand renders it in the channel's own
 * design.
 *
 * The rule: a sponsor unit never has a size of its own. Each format is the same shape as the
 * content beside it, so it sits in the same grid cell or column as its sibling:
 *
 * - Sponsored short   = a short card (rows) or the feed player (feed)
 * - Sponsored story   = a story card in a grid, or a rail card on Broadcast
 * - Half-time break   = an image block inside the article column (16:9)
 * - Chapter sponsor   = a chapter (row in the chapter list, segment on the timeline)
 * - Presented by      = a byline on a module header
 *
 * Every unit is labelled, fast (no third-party code) and checked in creative review.
 * Age-restricted categories carry an 18+ mark and a one-tap opt-out.
 */
import { useState } from "react"
import { ArrowRight, ArrowUpRight } from "lucide-react"
import { cn } from "@/lib/utils"
import { readableOn } from "@/lib/format"
import type { AgeCategory, Sponsor } from "@/lib/types"
import { BODY, DISPLAY, RAIL_CARD, RAIL_HEADLINE, STORY_HEADLINE, STORY_STANDFIRST, type StorySize } from "@/components/channel/styles"

const OPT_OUT: Record<AgeCategory, string> = {
  wagering: "Don't show me betting ads",
  alcohol: "Don't show me alcohol ads",
}

/** Fired when a viewer opts out from any sponsor unit, so the channel's viewer state can follow. */
export const OPT_OUT_EVENT = "homestand:opt-out"

export function SponsorMark({ sponsor, size = 20, className }: { sponsor: Sponsor; size?: number; className?: string }) {
  const initials = sponsor.name
    .split(/\s+/)
    .slice(0, 2)
    .map((w) => w[0])
    .join("")
  return (
    <span
      aria-hidden
      className={cn("grid shrink-0 place-items-center rounded-[4px] font-bold leading-none", className)}
      style={{ width: size, height: size, background: sponsor.colour, color: readableOn(sponsor.colour), fontSize: size * 0.42 }}
    >
      {initials}
    </span>
  )
}

/** The mark drawn in the text colour that reads on the sponsor's own colour (for use on that colour). */
function MarkOnColour({ sponsor, size }: { sponsor: Sponsor; size: number }) {
  const on = readableOn(sponsor.colour)
  return <SponsorMark sponsor={{ ...sponsor, colour: on }} size={size} />
}

export function AgeTag({ category }: { category?: AgeCategory }) {
  if (!category) return null
  return (
    <span className="rounded-[2px] border border-current px-1 text-[10px] font-bold leading-[14px] tracking-[0.5px]" title="Shown only to signed-in, age-verified adults">
      18+
    </span>
  )
}

export function OptOut({ category, className }: { category?: AgeCategory; className?: string }) {
  const [done, setDone] = useState(false)
  if (!category) return null
  return done ? (
    <span className={cn("text-xs", className)}>Done. You won&apos;t see these on Homestand.</span>
  ) : (
    <button
      type="button"
      onClick={() => {
        setDone(true)
        window.dispatchEvent(new CustomEvent(OPT_OUT_EVENT, { detail: category }))
      }}
      className={cn("text-xs font-medium underline underline-offset-2 outline-none focus-visible:ring-2 focus-visible:ring-ring", className)}
    >
      {OPT_OUT[category]}
    </button>
  )
}

/** The label every unit carries: "Sponsored · Brand", the 18+ tag and the opt-out. */
function SponsorLabel({ sponsor, className }: { sponsor: Sponsor; className?: string }) {
  return (
    <span className={cn("flex flex-wrap items-center gap-x-2 gap-y-1 font-sans text-[13px] text-muted-foreground", className)}>
      <span className="flex items-center gap-1.5">
        <span className="text-[11px] font-bold uppercase tracking-[1px]">Sponsored</span>
        <span aria-hidden>·</span>
        <span className="font-semibold text-foreground">{sponsor.name}</span>
        <AgeTag category={sponsor.ageCategory} />
      </span>
      <OptOut category={sponsor.ageCategory} className="text-muted-foreground" />
    </span>
  )
}

/* ---------------------------------------------------------------------------------------------
 * 1. Chapter sponsor: a brand owns a chapter. A row in the chapter list, a segment on the timeline.
 * ------------------------------------------------------------------------------------------- */

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

/* ---------------------------------------------------------------------------------------------
 * 2. Half-time break: an editorial pause between article sections. It is an image block of the
 * article: the width of the reading column, 16:9, with its label where a caption sits.
 * ------------------------------------------------------------------------------------------- */

export function HalftimeBreak({ sponsor, className }: { sponsor: Sponsor; className?: string }) {
  const on = readableOn(sponsor.colour)
  return (
    <figure aria-label={`Sponsored by ${sponsor.name}`} className={cn("my-10 font-sans not-italic", className)} data-sponsor-unit="halftime">
      <a
        href={sponsor.url}
        rel="sponsored noopener"
        target="_blank"
        className="group @container relative isolate block aspect-video w-full overflow-hidden rounded-lg outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
        style={{ background: sponsor.colour, color: on }}
      >
        {sponsor.image && (
          <>
            {/* eslint-disable-next-line @next/next/no-img-element -- sponsor brief image */}
            <img src={sponsor.image} alt="" className="absolute inset-0 -z-20 size-full object-cover" />
            <div className="absolute inset-0 -z-10" style={{ background: `linear-gradient(90deg, ${sponsor.colour} 0%, ${sponsor.colour}e6 45%, ${sponsor.colour}4d 100%)` }} />
          </>
        )}
        <div className="flex h-full flex-col justify-between p-5 @md:p-8">
          <span className="flex items-center gap-2.5">
            <MarkOnColour sponsor={sponsor} size={28} />
            <span className="text-[15px] font-semibold">{sponsor.name}</span>
          </span>
          <span className="flex max-w-[85%] flex-col items-start gap-4 @md:gap-5">
            <span className="line-clamp-2 text-[22px] font-extrabold leading-[26px] tracking-[-0.4px] @md:line-clamp-3 @md:text-[34px] @md:leading-[38px] @md:tracking-[-0.7px]">
              {sponsor.line}
            </span>
            <span
              className="inline-flex h-9 items-center gap-1.5 rounded-md px-3.5 text-[14px] font-semibold transition-opacity group-hover:opacity-90 @md:h-10 @md:px-4"
              style={{ background: on, color: sponsor.colour }}
            >
              {sponsor.cta} <ArrowUpRight className="size-4" aria-hidden />
            </span>
          </span>
        </div>
      </a>
      <figcaption className="mt-2 flex items-center justify-between gap-3">
        <SponsorLabel sponsor={sponsor} />
        <span className="hidden text-[12px] text-muted-foreground sm:inline">Half-time</span>
      </figcaption>
    </figure>
  )
}

/* ---------------------------------------------------------------------------------------------
 * 3. Sponsored story: a story card in a grid (or a rail card on Broadcast). Same picture box,
 * same headline sizes, the kicker reads "Sponsored · Brand".
 * ------------------------------------------------------------------------------------------- */

export function SponsoredStoryCard({
  sponsor,
  size = "md",
  ratio = "16/9",
  standfirst = false,
  variant = "card",
  className,
}: {
  sponsor: Sponsor
  size?: StorySize
  ratio?: "16/9" | "3/2"
  standfirst?: boolean
  /** card: a StoryCard in a grid. rail: a Broadcast rail card. */
  variant?: "card" | "rail"
  className?: string
}) {
  const on = readableOn(sponsor.colour)
  const rail = variant === "rail"
  return (
    <article
      aria-label={`Sponsored by ${sponsor.name}`}
      data-sponsor-unit="story"
      className={cn("group relative flex min-w-0 flex-col gap-3", rail && RAIL_CARD, className)}
    >
      <div className={cn(rail && "rounded-lg ring-2 ring-transparent ring-offset-2 ring-offset-background transition-shadow group-hover:ring-[var(--chan)]")}>
        <div className="@container relative w-full overflow-hidden rounded-lg" style={{ aspectRatio: ratio, background: sponsor.colour, color: on }}>
          {sponsor.image && (
            // eslint-disable-next-line @next/next/no-img-element -- sponsor brief image
            <img src={sponsor.image} alt="" className="absolute inset-0 size-full object-cover opacity-40" loading="lazy" />
          )}
          <div className="absolute inset-0 flex flex-col justify-between p-4 @sm:p-5">
            <MarkOnColour sponsor={sponsor} size={32} />
            <span className="text-[20px] font-extrabold leading-[22px] tracking-[-0.4px] @sm:text-[26px] @sm:leading-[28px]">{sponsor.name}</span>
          </div>
          <span className="absolute bottom-2 right-2 rounded-[2px] bg-black/70 px-1.5 py-0.5 text-[11px] font-bold uppercase tracking-[0.8px] text-white">
            Sponsored{sponsor.ageCategory ? " · 18+" : ""}
          </span>
        </div>
      </div>
      <span className={cn("mt-1 flex items-center gap-1.5", rail ? "text-[12px] font-bold uppercase tracking-[1.2px] text-muted-foreground" : "kicker text-muted-foreground")}>
        Sponsored · {sponsor.name}
      </span>
      <h3 className={cn(DISPLAY, rail ? RAIL_HEADLINE : STORY_HEADLINE[size])}>
        <a
          href={sponsor.url}
          rel="sponsored noopener"
          target="_blank"
          className="outline-none after:absolute after:inset-0 after:rounded-lg focus-visible:after:ring-2 focus-visible:after:ring-ring focus-visible:after:ring-offset-2 group-hover:underline group-hover:decoration-2 group-hover:underline-offset-4"
        >
          {sponsor.line}
        </a>
      </h3>
      {standfirst && sponsor.body && <p className={cn(BODY, STORY_STANDFIRST)}>{sponsor.body}</p>}
      <p className="relative z-10 flex flex-wrap items-center gap-x-3 gap-y-1 text-[13px] text-muted-foreground">
        <span className="inline-flex items-center gap-1 font-semibold text-foreground">
          {sponsor.cta} <ArrowRight className="size-3.5" aria-hidden />
        </span>
        <OptOut category={sponsor.ageCategory} className="text-muted-foreground" />
      </p>
    </article>
  )
}

/* ---------------------------------------------------------------------------------------------
 * 4. Sponsored short: exactly a short card (168 wide, 9:16, two caption lines) in rows, or the
 * feed player's frame in the feed.
 * ------------------------------------------------------------------------------------------- */

export function SponsoredShortCard({
  sponsor,
  className,
  fill = false,
  variant = "row",
}: {
  sponsor: Sponsor
  className?: string
  /** Take the parent's width instead of 168px. */
  fill?: boolean
  /** row: a card in a shorts row. feed: fills the feed player's 9:16 frame (no caption under it). */
  variant?: "row" | "feed"
}) {
  const on = readableOn(sponsor.colour)
  const feed = variant === "feed"
  const frame = (
    <div
      className={cn("@container relative w-full overflow-hidden", feed ? "h-full" : "rounded-lg")}
      style={{ aspectRatio: feed ? undefined : "9/16", background: sponsor.colour, color: on }}
    >
      {sponsor.image && (
        // eslint-disable-next-line @next/next/no-img-element -- sponsor brief image
        <img src={sponsor.image} alt="" className="absolute inset-0 size-full object-cover opacity-40" />
      )}
      <span className="absolute left-2 top-2 flex items-center gap-1 rounded-[2px] bg-black/70 px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-[0.8px] text-white @xs:left-3 @xs:top-3 @xs:text-[12px]">
        Sponsored {sponsor.ageCategory && <span>· 18+</span>}
      </span>
      <div className="absolute inset-0 flex flex-col justify-end gap-3 p-3 @xs:gap-5 @xs:p-6">
        <span className="flex items-center gap-1.5 text-[12px] font-semibold @xs:text-[15px]">
          <MarkOnColour sponsor={sponsor} size={feed ? 24 : 16} />
          {sponsor.name}
        </span>
        <span className="text-[17px] font-extrabold leading-[20px] tracking-[-0.3px] @xs:text-[28px] @xs:leading-[32px]">{sponsor.line}</span>
        <span className="w-fit rounded-full px-2.5 py-1 text-[11px] font-bold @xs:px-4 @xs:py-2 @xs:text-[14px]" style={{ background: on, color: sponsor.colour }}>
          {sponsor.cta}
        </span>
      </div>
    </div>
  )
  if (feed) {
    return (
      <a
        href={sponsor.url}
        rel="sponsored noopener"
        target="_blank"
        data-sponsor-unit="short"
        aria-label={`Sponsored short from ${sponsor.name}: ${sponsor.line}`}
        className={cn("block size-full outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-ring", className)}
      >
        {frame}
      </a>
    )
  }
  return (
    <a
      href={sponsor.url}
      rel="sponsored noopener"
      target="_blank"
      data-sponsor-unit="short"
      aria-label={`Sponsored short from ${sponsor.name}: ${sponsor.line}`}
      className={cn("group flex shrink-0 flex-col gap-2 outline-none focus-visible:ring-2 focus-visible:ring-ring", fill ? "w-full" : "w-[168px]", className)}
    >
      {frame}
      <p className="line-clamp-2 min-h-10 text-[15px] font-semibold leading-5 text-foreground group-hover:underline">{sponsor.line}</p>
    </a>
  )
}

/* ---------------------------------------------------------------------------------------------
 * 5. Presented by: a sponsor credit on a module header or the lead story, like a byline.
 * Full width of its module, never a box.
 * ------------------------------------------------------------------------------------------- */

export function PresentedBy({ sponsor, className, tone = "light" }: { sponsor: Sponsor; className?: string; tone?: "light" | "dark" }) {
  return (
    <div
      data-sponsor-unit="presented"
      className={cn(
        "flex flex-wrap items-center justify-between gap-x-4 gap-y-1 border-t-2 pt-2 text-[13px]",
        tone === "dark" ? "text-white/80" : "text-muted-foreground",
        className,
      )}
      style={{ borderColor: sponsor.colour === "#111111" && tone === "dark" ? "rgba(255,255,255,.5)" : sponsor.colour }}
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
