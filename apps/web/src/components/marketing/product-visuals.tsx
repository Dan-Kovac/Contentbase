import { ArrowRight, FileText, Film, Globe, Search } from "lucide-react"
import { YouTubeIcon } from "@/components/auth/provider-icons"
import { StatusBadge } from "@/components/brand/status-badge"
import { VideoThumb } from "@/components/brand/media"
import { LockStatus } from "@/components/brand/compliance"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { getChannel, getVideo, listShorts } from "@/lib/data"
import { channelStyle, formatDuration } from "@/lib/format"
import { cn } from "@/lib/utils"

/** A browser window frame for product shots. */
export function BrowserFrame({ url, children, className }: { url: string; children: React.ReactNode; className?: string }) {
  return (
    <div className={cn("overflow-hidden rounded-lg border border-white/10 bg-brand-grey", className)}>
      <div className="flex items-center gap-3 px-3 py-2.5">
        <div className="flex gap-1.5" aria-hidden>
          <span className="size-2.5 rounded-full bg-white/20" />
          <span className="size-2.5 rounded-full bg-white/20" />
          <span className="size-2.5 rounded-full bg-white/20" />
        </div>
        <div className="flex min-w-0 flex-1 items-center gap-1.5 rounded-[4px] bg-black/40 px-2.5 py-1 text-[12px] text-brand-muted">
          <Globe className="size-3 shrink-0" aria-hidden />
          <span className="truncate">{url}</span>
        </div>
      </div>
      {children}
    </div>
  )
}

/** The draft pack a creator reviews: video page, article, shorts and SEO. */
export function ReviewCardMock({ className }: { className?: string }) {
  const v = getVideo("v_blues")!
  const shorts = listShorts("ch_footyfix").filter((s) => v.shorts.includes(s.id))
  return (
    <div className={cn("rounded-lg border bg-card text-card-foreground", className)}>
      <div className="flex flex-wrap items-center justify-between gap-2 border-b px-4 py-3 sm:px-5">
        <span className="flex items-center gap-2 text-[13px] text-muted-foreground">
          <YouTubeIcon className="size-4" />
          New upload · {v.sourcePublishedAt}
        </span>
        <StatusBadge tone="ready" />
      </div>
      <div className="grid gap-5 p-4 sm:grid-cols-[1fr_1.1fr] sm:p-5">
        <div className="flex flex-col gap-3">
          <VideoThumb tone={v.posterTone} src={v.poster} durationSec={v.durationSec} />
          <div className="grid grid-cols-3 gap-2" aria-label="Shorts drafts">
            {shorts.map((s) => (
              <div key={s.id} className="flex flex-col gap-1">
                <VideoThumb tone={s.posterTone} src={s.poster} ratio="9/16" durationSec={s.durationSec} />
              </div>
            ))}
          </div>
        </div>
        <div className="flex min-w-0 flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <p className="text-[11px] font-bold uppercase tracking-[0.8px] text-muted-foreground">Headline options</p>
            <ul className="flex flex-col gap-1.5 text-[14px] leading-5">
              {v.article.headlineOptions.map((h, i) => (
                <li key={h} className={cn("rounded-[4px] border px-2.5 py-2", i === 0 ? "border-foreground font-semibold" : "text-muted-foreground")}>
                  {h}
                </li>
              ))}
            </ul>
          </div>
          <ul className="flex flex-col gap-2 text-[13px]">
            <li className="flex items-center gap-2">
              <Film className="size-4 text-muted-foreground" aria-hidden />
              Video page with {v.chapters.length} chapters and captions
            </li>
            <li className="flex items-center gap-2">
              <FileText className="size-4 text-muted-foreground" aria-hidden />
              Article draft · {v.article.readMinutes} min read
            </li>
            <li className="flex items-center gap-2">
              <Search className="size-4 text-muted-foreground" aria-hidden />
              Title tag, meta description and slug
            </li>
          </ul>
          <div className="mt-auto flex flex-wrap items-center gap-2">
            <Button size="sm" tabIndex={-1}>Publish</Button>
            <Button size="sm" variant="outline" tabIndex={-1}>
              Edit draft
            </Button>
          </div>
        </div>
      </div>
      <p className="border-t px-4 py-3 text-[13px] text-muted-foreground sm:px-5">
        Your article draft is ready to review. Nothing goes live until you publish.
      </p>
    </div>
  )
}

/** A few lines of the 301 redirect map from an import. */
export function RedirectMock({ className }: { className?: string }) {
  const rows = [
    ["/2025/03/14/blues-midfield-woes/", "/afl/blues-midfield-woes"],
    ["/category/aflw/", "/s/aflw"],
    ["/?p=4182", "/afl/round-7-in-five-minutes"],
    ["/podcast/mailbag-42/", "/v/mailbag-42"],
  ]
  return (
    <div className={cn("overflow-hidden rounded-lg border bg-card", className)}>
      <div className="flex items-center justify-between gap-2 border-b px-4 py-3">
        <p className="text-[13px] font-semibold">Redirect map</p>
        <span className="text-[12px] text-muted-foreground tabular">1,284 URLs</span>
      </div>
      <ul className="divide-y font-mono text-[12px] leading-5">
        {rows.map(([from, to]) => (
          <li key={from} className="flex flex-wrap items-center gap-x-2 gap-y-0.5 px-4 py-2.5">
            <span className="min-w-0 break-all text-muted-foreground">{from}</span>
            <ArrowRight className="size-3.5 shrink-0 text-muted-foreground" aria-label="redirects to" />
            <span className="min-w-0 break-all">{to}</span>
            <span className="ml-auto rounded-[2px] border px-1.5 text-[11px] font-semibold">301</span>
          </li>
        ))}
      </ul>
      <p className="border-t px-4 py-3 text-[13px] text-muted-foreground">214 imported · 6 skipped · 2 failed. Retry failed items</p>
    </div>
  )
}

/** The age-verified advertising switch as a creator sees it, with a passing decision underneath. */
export function AgeVerifiedPanel({ className }: { className?: string }) {
  return (
    <div className={cn("flex flex-col gap-4 rounded-lg border bg-card p-4 sm:p-5", className)}>
      <div className="flex items-start justify-between gap-4">
        <div className="flex flex-col gap-1">
          <label htmlFor="av-demo" className="text-[15px] font-semibold">
            Age-verified advertising
          </label>
          <p className="text-[13px] leading-5 text-muted-foreground">Footy Fix · alcohol and wagering allowed</p>
        </div>
        <Switch id="av-demo" defaultChecked aria-describedby="av-demo-note" />
      </div>
      <LockStatus compact locks={{ session: { pass: true }, age: { pass: true }, optout: { pass: true } }} />
      <p id="av-demo-note" className="text-[13px] leading-5 text-muted-foreground">
        All three checks pass, so an age-restricted ad can show to this viewer. If any check fails or times out, an everyday ad fills the same space.
      </p>
    </div>
  )
}

/* ---------------------------------------------------------------------------------------------
 * Landing hero: one video in, a publication out.
 * ------------------------------------------------------------------------------------------- */

function OutputCard({ label, children, className }: { label: string; children: React.ReactNode; className?: string }) {
  return (
    <figure className={cn("flex min-w-0 flex-col overflow-hidden rounded-lg bg-white text-neutral-950 shadow-[0_1px_0_rgba(255,255,255,0.08)]", className)}>
      <div className="min-h-0 flex-1 p-3">{children}</div>
      <figcaption className="flex items-center gap-1.5 border-t border-neutral-200 px-3 py-2 text-[12px] font-semibold">
        <span className="size-1.5 rounded-full bg-pop-ink" aria-hidden />
        {label}
      </figcaption>
    </figure>
  )
}

export function OneVideoInMock({ className }: { className?: string }) {
  const channel = getChannel("footyfix")!
  const v = getVideo("v_blues")!
  const shorts = listShorts("ch_footyfix").filter((s) => v.shorts.includes(s.id)).slice(0, 3)
  return (
    <div className={cn("flex flex-col gap-3", className)} style={channelStyle(channel.accentHex, channel.pairing)}>
      {/* In: one YouTube upload */}
      <div className="flex items-center gap-3 rounded-lg border border-white/10 bg-white/[0.06] p-3">
        <div className="w-[120px] shrink-0">
          <VideoThumb tone={v.posterTone} src={v.poster} durationSec={v.durationSec} />
        </div>
        <div className="flex min-w-0 flex-col gap-1">
          <span className="flex items-center gap-1.5 text-[12px] font-semibold text-brand-muted">
            <YouTubeIcon className="size-3.5" /> New upload on YouTube
          </span>
          <span className="truncate text-[15px] font-semibold text-brand-white">{v.title}</span>
          <span className="text-[12px] text-brand-muted">Arrives in Ready to review as a draft pack. You press Publish.</span>
        </div>
      </div>
      <div className="flex items-center gap-2 pl-3 text-[12px] font-semibold uppercase tracking-[1px] text-brand-muted" aria-hidden>
        <ArrowRight className="size-4 rotate-90 text-pop" /> On your own site, minutes later
      </div>
      {/* Out: four things a publication needs */}
      <div className="grid grid-cols-2 gap-3">
        <OutputCard label="Video page with chapters">
          <VideoThumb tone={v.posterTone} src={v.poster} durationSec={v.durationSec} />
          <div className="mt-2 flex flex-col gap-1" aria-hidden>
            {v.chapters.slice(0, 2).map((c) => (
              <span key={c.start} className="flex gap-2 text-[11px]">
                <span className="font-mono text-neutral-500">{formatDuration(c.start)}</span> {c.title}
              </span>
            ))}
          </div>
        </OutputCard>
        <OutputCard label="Article in your voice">
          <span className="kicker text-[10px]">AFL</span>
          <p className="mt-1 text-[16px] font-extrabold leading-[19px] tracking-[-0.02em]">{v.article.headline}</p>
          <p className="mt-1.5 line-clamp-3 font-serif text-[12px] leading-[17px] text-neutral-600">{v.article.standfirst}</p>
        </OutputCard>
        <OutputCard label="Shorts from the best moments">
          <div className="grid grid-cols-3 gap-1.5">
            {shorts.map((s) => (
              <VideoThumb key={s.id} tone={s.posterTone} src={s.poster} ratio="9/16" durationSec={s.durationSec} />
            ))}
          </div>
        </OutputCard>
        <OutputCard label="A page that ranks">
          <div className="flex flex-col gap-1">
            <span className="truncate text-[11px] text-neutral-500">footyfix.com.au › afl</span>
            <span className="text-[14px] font-medium leading-[18px] text-[#1a0dab]">{v.seo.titleTag}</span>
            <span className="line-clamp-2 text-[11px] leading-[15px] text-neutral-600">{v.seo.metaDescription}</span>
            <span className="mt-1 flex flex-wrap gap-1">
              {v.chapters.slice(0, 2).map((c) => (
                <span key={c.start} className="rounded-full border border-neutral-200 px-1.5 text-[10px]">
                  {formatDuration(c.start)} {c.title}
                </span>
              ))}
            </span>
          </div>
        </OutputCard>
      </div>
    </div>
  )
}

/* ---------------------------------------------------------------------------------------------
 * "The page, rethought": a typical ad-heavy page beside a Homestand page, as plain wireframes.
 * No real publisher is shown.
 * ------------------------------------------------------------------------------------------- */

const bar = (w: string, tone = "bg-neutral-200") => <span className={cn("block h-2 rounded-full", tone)} style={{ width: w }} />

function AdBox({ label, className }: { label: string; className?: string }) {
  return (
    <span className={cn("grid place-items-center rounded-[3px] border border-dashed border-neutral-400 bg-neutral-300/70 text-[10px] font-bold uppercase tracking-[0.8px] text-neutral-600", className)}>
      {label}
    </span>
  )
}

function Sponsor({ className, children }: { className?: string; children?: React.ReactNode }) {
  return <span className={cn("relative block rounded-[4px] bg-pop-ink/85", className)}>{children}</span>
}

/** Both sketches share one frame: a narrow page, cropped at the bottom like a scroll. */
function SketchFrame({ children, footer }: { children: React.ReactNode; footer?: React.ReactNode }) {
  return (
    <div className="relative mx-auto h-[440px] w-full max-w-[360px] overflow-hidden rounded-lg border bg-white p-3 text-neutral-950" aria-hidden>
      <div className="flex flex-col gap-2.5">{children}</div>
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-16 bg-gradient-to-b from-transparent to-white" />
      {footer}
    </div>
  )
}

export function TypicalPageSketch() {
  return (
    <SketchFrame footer={<AdBox label="Sticky footer 320 × 50" className="absolute inset-x-3 bottom-3 z-10 h-8" />}>
      <AdBox label="Leaderboard 728 × 90" className="h-10" />
      <div className="flex items-center justify-between border-b border-neutral-200 pb-2">
        {bar("30%", "bg-neutral-800")}
        {bar("40%")}
      </div>
      <div className="grid grid-cols-[1fr_88px] gap-3">
        <div className="flex flex-col gap-2">
          {bar("90%", "bg-neutral-800")}
          {bar("60%", "bg-neutral-800")}
          <span className="block aspect-video rounded-[4px] bg-neutral-200" />
          {bar("100%")}
          {bar("94%")}
          <AdBox label="300 × 250" className="h-16" />
          {bar("100%")}
          {bar("80%")}
          <AdBox label="Autoplay video" className="h-12" />
          {bar("96%")}
        </div>
        <div className="flex flex-col gap-2">
          <AdBox label="300 × 600" className="h-40" />
          <AdBox label="Promo" className="h-16" />
          <AdBox label="Pop-up" className="h-12" />
        </div>
      </div>
    </SketchFrame>
  )
}

export function HomestandPageSketch() {
  return (
    <SketchFrame>
      <div className="flex items-center justify-between border-b border-neutral-200 pb-2">
        <span className="flex items-center gap-1.5">
          <span className="size-4 rounded-[3px] bg-[#1c4fb8]" />
          {bar("56px", "bg-neutral-800")}
        </span>
        <span className="h-4 w-12 rounded-full bg-[#1c4fb8]" />
      </div>
      <div className="grid grid-cols-[1.6fr_1fr] gap-2">
        <span className="block aspect-video rounded-[4px] bg-neutral-300" />
        <div className="flex flex-col gap-1.5">
          {[0, 1, 2, 3].map((i) => (
            <span key={i} className={cn("flex h-3 items-center rounded-[2px] px-1", i === 1 ? "bg-pop-ink/85" : "bg-neutral-100")}>
              {bar(i === 1 ? "70%" : "60%", i === 1 ? "bg-white/80" : "bg-neutral-300")}
            </span>
          ))}
        </div>
      </div>
      <div className="mx-auto flex w-[64%] flex-col gap-2">
        {bar("90%", "bg-neutral-800")}
        {bar("100%")}
        {bar("96%")}
        <Sponsor className="aspect-video w-full" />
        {bar("100%")}
        {bar("70%")}
      </div>
      <div className="grid grid-cols-6 gap-1.5">
        {[0, 1, 2, 3, 4, 5].map((i) => (i === 3 ? <Sponsor key={i} className="aspect-[9/16]" /> : <span key={i} className="block aspect-[9/16] rounded-[4px] bg-neutral-300" />))}
      </div>
    </SketchFrame>
  )
}

/** The five formats as wireframes, each beside the content it takes the shape of. */
export function FormatShapes() {
  const items: { name: string; shape: string; draw: React.ReactNode }[] = [
    {
      name: "Chapter sponsor",
      shape: "A chapter among chapters",
      draw: (
        <div className="flex flex-col gap-1.5">
          {[0, 1, 2, 3].map((i) => (
            <span key={i} className={cn("flex h-4 items-center gap-2 rounded-[2px] px-1.5", i === 1 ? "bg-pop-ink/85" : "bg-neutral-100")}>
              {bar("18%", i === 1 ? "bg-white/70" : "bg-neutral-300")}
              {bar("50%", i === 1 ? "bg-white/90" : "bg-neutral-300")}
            </span>
          ))}
        </div>
      ),
    },
    {
      name: "Half-time break",
      shape: "A photo in the article, the column's width",
      draw: (
        <div className="flex flex-col gap-1.5">
          {bar("100%")}
          {bar("90%")}
          <Sponsor className="aspect-video w-full" />
          {bar("96%")}
        </div>
      ),
    },
    {
      name: "Sponsored story",
      shape: "A story among stories",
      draw: (
        <div className="grid grid-cols-3 gap-1.5">
          {[0, 1, 2].map((i) => (
            <span key={i} className="flex flex-col gap-1">
              {i === 1 ? <Sponsor className="aspect-video" /> : <span className="block aspect-video rounded-[4px] bg-neutral-300" />}
              {bar("90%", "bg-neutral-700")}
              {bar("60%")}
            </span>
          ))}
        </div>
      ),
    },
    {
      name: "Sponsored short",
      shape: "A short among shorts",
      draw: (
        <div className="grid grid-cols-4 gap-1.5">
          {[0, 1, 2, 3].map((i) => (i === 2 ? <Sponsor key={i} className="aspect-[9/16]" /> : <span key={i} className="block aspect-[9/16] rounded-[4px] bg-neutral-300" />))}
        </div>
      ),
    },
    {
      name: "Presented by",
      shape: "A credit, set like a byline",
      draw: (
        <div className="flex flex-col gap-1.5">
          {bar("90%", "bg-neutral-800")}
          {bar("70%", "bg-neutral-800")}
          {bar("100%")}
          <span className="mt-1 flex items-center gap-1.5 border-t-2 border-pop-ink pt-1.5">
            {bar("22%", "bg-neutral-500")}
            <span className="size-2.5 rounded-[2px] bg-pop-ink" />
            {bar("30%", "bg-neutral-700")}
          </span>
        </div>
      ),
    },
  ]
  return (
    <ul className="grid grid-cols-1 items-start gap-3 sm:grid-cols-2 lg:grid-cols-5">
      {items.map((it) => (
        <li key={it.name} className="flex flex-col gap-3 rounded-lg border bg-card p-4">
          <div className="flex min-h-[96px] flex-col justify-center rounded-md bg-white p-3" aria-hidden>
            {it.draw}
          </div>
          <div className="flex flex-col gap-0.5">
            <span className="text-[14px] font-semibold">{it.name}</span>
            <span className="text-[13px] leading-[18px] text-muted-foreground">{it.shape}</span>
          </div>
        </li>
      ))}
    </ul>
  )
}
