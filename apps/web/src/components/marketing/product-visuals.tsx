import { ArrowRight, FileText, Film, Globe, Search } from "lucide-react"
import { YouTubeIcon } from "@/components/auth/provider-icons"
import { StatusBadge } from "@/components/brand/status-badge"
import { VideoThumb } from "@/components/brand/media"
import { LockStatus } from "@/components/brand/compliance"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { getVideo, listShorts } from "@/lib/data"
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

/** Footy Fix's channel home, built from the real channel tokens. Used in the landing hero. */
export function ChannelHomeMock() {
  const lead = getVideo("v_blues")!
  const shorts = listShorts("ch_footyfix").slice(0, 4)
  return (
    <BrowserFrame url="footyfix.com.au">
      <div className="bg-background text-foreground" style={channelStyle("pitch", "minimal")}>
        <div className="flex items-center gap-3 border-b px-4 py-3 sm:px-6">
          <span className="grid size-7 place-items-center rounded-[4px] bg-[var(--chan)] text-[13px] font-extrabold text-[var(--chan-on)]" aria-hidden>
            FF
          </span>
          <span className="text-[17px] font-extrabold tracking-[-0.02em]">Footy Fix</span>
          <nav className="ml-4 hidden gap-4 text-[13px] font-medium text-muted-foreground md:flex" aria-hidden>
            <span className="text-foreground underline decoration-[var(--chan)] decoration-2 underline-offset-[18px]">Latest</span>
            <span>AFL</span>
            <span>AFLW</span>
            <span>Shorts</span>
          </nav>
          <span className="ml-auto rounded-full bg-[var(--chan)] px-3 py-1 text-[12px] font-semibold text-[var(--chan-on)]">Follow</span>
        </div>
        <div className="grid gap-4 p-4 sm:grid-cols-[1.4fr_1fr] sm:gap-6 sm:p-6">
          <VideoThumb tone={lead.posterTone} durationSec={lead.durationSec} />
          <div className="flex flex-col justify-center gap-2">
            <span className="kicker">AFL</span>
            <p className="text-[20px] font-extrabold leading-[24px] tracking-[-0.025em] sm:text-[24px] sm:leading-[28px]">{lead.article.headline}</p>
            <p className="line-clamp-3 font-serif text-[14px] leading-[21px] text-muted-foreground">{lead.article.standfirst}</p>
            <p className="text-[12px] text-muted-foreground">Sam Doherty · 6 min read</p>
          </div>
        </div>
        <div className="hidden gap-3 px-6 pb-6 md:flex" aria-hidden>
          <div className="flex w-[180px] shrink-0 flex-col justify-end gap-1 pb-1">
            <span className="kicker">Shorts</span>
            <p className="text-[13px] leading-[18px] text-muted-foreground">Cut from this week&apos;s videos and pulled from YouTube Shorts.</p>
          </div>
          {shorts.map((s) => (
            <div key={s.id} className="flex w-[104px] shrink-0 flex-col gap-1.5">
              <VideoThumb tone={s.posterTone} ratio="9/16" />
              <span className="line-clamp-2 text-[12px] font-semibold leading-4">{s.title}</span>
            </div>
          ))}
        </div>
      </div>
    </BrowserFrame>
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
          <VideoThumb tone={v.posterTone} durationSec={v.durationSec} />
          <div className="grid grid-cols-3 gap-2" aria-label="Shorts drafts">
            {shorts.map((s) => (
              <div key={s.id} className="flex flex-col gap-1">
                <VideoThumb tone={s.posterTone} ratio="9/16" durationSec={s.durationSec} />
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

/** How a channel page shows up in Google. */
export function SearchResultMock() {
  const v = getVideo("v_blues")!
  return (
    <div className="flex flex-col gap-1.5 rounded-lg border bg-card p-4">
      <div className="flex items-center gap-2 text-[12px] text-muted-foreground">
        <span className="grid size-6 place-items-center rounded-full bg-muted text-[10px] font-bold text-foreground" aria-hidden>
          FF
        </span>
        <span className="min-w-0 truncate">
          <span className="text-foreground">Footy Fix</span> · footyfix.com.au › afl › {v.seo.slug}
        </span>
      </div>
      <p className="text-[18px] font-medium leading-6 text-[#1a0dab] dark:text-[#8ab4f8]">{v.seo.titleTag}</p>
      <p className="text-[13px] leading-5 text-muted-foreground">
        <span className="font-mono">{formatDuration(v.durationSec)}</span> · {v.seo.metaDescription}
      </p>
      <div className="mt-1 flex flex-wrap gap-1.5 text-[12px]">
        {v.chapters.slice(0, 3).map((c) => (
          <span key={c.start} className="rounded-full border px-2 py-0.5">
            <span className="font-mono text-muted-foreground">{formatDuration(c.start)}</span> {c.title}
          </span>
        ))}
      </div>
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

/** The triple-lock switch as a creator sees it, with a passing ad decision underneath. */
export function TripleLockPanel({ className }: { className?: string }) {
  return (
    <div className={cn("flex flex-col gap-4 rounded-lg border bg-card p-4 sm:p-5", className)}>
      <div className="flex items-start justify-between gap-4">
        <div className="flex flex-col gap-1">
          <label htmlFor="tl-demo" className="text-[15px] font-semibold">
            Triple lock mode
          </label>
          <p className="text-[13px] leading-5 text-muted-foreground">Footy Fix · on from 1 January 2027</p>
        </div>
        <Switch id="tl-demo" defaultChecked aria-describedby="tl-demo-note" />
      </div>
      <LockStatus
        compact
        locks={{ session: { pass: true }, age: { pass: true }, optout: { pass: true } }}
      />
      <p id="tl-demo-note" className="text-[13px] leading-5 text-muted-foreground">
        All three pass, so a wagering ad can show. If any check fails or times out, a non-wagering ad fills the slot.
      </p>
    </div>
  )
}
