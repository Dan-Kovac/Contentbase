import Link from "next/link"
import { ArrowRight, Play } from "lucide-react"
import { AdSlot } from "@/components/brand/ad-slot"
import { ShortCard, VideoCard, VideoThumb } from "@/components/brand/media"
import { compact, formatDuration } from "@/lib/format"
import { cn } from "@/lib/utils"
import type { Channel, Short, Video } from "@/lib/types"
import {
  BODY,
  DISPLAY,
  displayDate,
  sectionLabel,
  sectionPath,
  shortPath,
  videoPath,
} from "./lib"

/** Module heading: a heavy rule, the title in the display face and an optional "See all". */
export function ModuleHeading({
  id,
  title,
  href,
  linkLabel = "See all",
}: {
  id?: string
  title: string
  href?: string
  linkLabel?: string
}) {
  return (
    <div className="mb-6 flex items-end justify-between gap-4 border-t-2 border-foreground pt-3">
      <h2 id={id} className={cn(DISPLAY, "text-[26px] leading-[30px] md:text-[30px] md:leading-[34px]")}>
        {title}
      </h2>
      {href && (
        <Link
          href={href}
          className="inline-flex shrink-0 items-center gap-1.5 text-[14px] font-semibold text-foreground hover:underline hover:underline-offset-4"
        >
          {linkLabel}
          <ArrowRight className="size-4" aria-hidden />
        </Link>
      )}
    </div>
  )
}

export function LeadStory({ channel, video }: { channel: Channel; video: Video }) {
  const href = videoPath(channel, video)
  return (
    <section aria-labelledby="lead-title" className="mx-auto w-full max-w-[1280px] px-4 pt-6 md:px-8 md:pt-10">
      <div className="grid items-center gap-6 lg:grid-cols-12 lg:gap-10">
        <Link
          href={href}
          className="group block rounded-lg outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 lg:col-span-8"
          aria-label={`Watch: ${video.title}`}
        >
          <VideoThumb tone={video.posterTone} durationSec={video.durationSec} exclusive={video.exclusive} className="shadow-none" />
        </Link>
        <div className="flex flex-col gap-4 lg:col-span-4">
          <span className="kicker text-foreground">
            {sectionLabel(channel, video.section)} · Latest episode
          </span>
          <h1
            id="lead-title"
            className={cn(DISPLAY, "text-[36px] leading-[1.02] sm:text-[44px] lg:text-[52px]")}
          >
            <Link href={href} className="hover:underline hover:decoration-[var(--chan)] hover:decoration-4 hover:underline-offset-[6px]">
              {video.article.headline}
            </Link>
          </h1>
          <p className={cn(BODY, "text-[19px] leading-[28px] text-foreground/80 md:text-[20px] md:leading-[30px]")}>
            {video.article.standfirst}
          </p>
          <p className="text-[13px] text-muted-foreground">
            {video.article.author} · <time dateTime={displayDate(video)}>{displayDate(video)}</time> ·{" "}
            <span className="tabular">{formatDuration(video.durationSec)}</span>
          </p>
          <div className="flex flex-wrap items-center gap-3 pt-1">
            <Link
              href={href}
              className="inline-flex h-11 items-center gap-2 rounded-md bg-[var(--chan)] px-5 text-[15px] font-bold text-[var(--chan-on)] outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            >
              <Play className="size-4 fill-current" aria-hidden />
              Watch now
            </Link>
            <Link href={`${href}#article`} className="text-[14px] font-semibold underline-offset-4 hover:underline">
              Read the article
            </Link>
          </div>
        </div>
      </div>
    </section>
  )
}

/** Side-scrolling shorts with at most one sponsored card (ADS-01). */
export function ShortsRow({ channel, shorts }: { channel: Channel; shorts: Short[] }) {
  if (!shorts.length) return null
  // One sponsored card, after the third short (or at the end of a shorter row).
  const sponsorAt = Math.min(3, shorts.length)
  const items: ({ kind: "short"; short: Short } | { kind: "ad" })[] = shorts.map((short) => ({ kind: "short", short }))
  items.splice(sponsorAt, 0, { kind: "ad" })
  return (
    <section aria-labelledby="shorts-title" className="mx-auto w-full max-w-[1280px] px-4 md:px-8">
      <ModuleHeading id="shorts-title" title="Shorts" href={`/c/${channel.slug}/shorts`} linkLabel="Watch all" />
      <div className="-mx-4 overflow-x-auto px-4 pb-2 md:-mx-8 md:px-8 [scrollbar-width:thin]">
        <ul className="flex w-max items-start gap-4">
          {items.map((item) =>
            item.kind === "ad" ? (
              <li key="sponsored" className="shrink-0">
                <AdSlot format="short-card" advertiser="Southern Cross Utes" />
              </li>
            ) : (
              <li key={item.short.id} className="shrink-0">
                <ShortCard
                  href={shortPath(channel, item.short)}
                  title={item.short.title}
                  tone={item.short.posterTone}
                  durationSec={item.short.durationSec}
                />
              </li>
            ),
          )}
        </ul>
      </div>
    </section>
  )
}

export function SponsorBand() {
  return (
    <section aria-label="Sponsor" className="mx-auto w-full max-w-[1280px] px-4 md:px-8">
      {/* Fixed sizes: 970×250 from md, 320×100 below. Non-wagering on the public, logged-out render. */}
      <AdSlot format="band" responsiveBand label="Presented by" advertiser="Southern Cross Utes" />
    </section>
  )
}

/** Article-led cards: the article headline and standfirst carry the card, video as the image. */
function FeatureCard({ channel, video }: { channel: Channel; video: Video }) {
  const href = videoPath(channel, video)
  return (
    <article className="group flex min-w-0 flex-col gap-3">
      <Link href={href} tabIndex={-1} aria-hidden className="block">
        <VideoThumb tone={video.posterTone} durationSec={video.durationSec} exclusive={video.exclusive} />
      </Link>
      <span className="kicker mt-1 text-foreground">{sectionLabel(channel, video.section)}</span>
      <h3 className={cn(DISPLAY, "text-[28px] leading-[32px] md:text-[34px] md:leading-[38px]")}>
        <Link href={href} className="outline-none group-hover:underline group-hover:decoration-2 group-hover:underline-offset-4 focus-visible:underline">
          {video.article.headline}
        </Link>
      </h3>
      <p className={cn(BODY, "text-[17px] leading-[26px] text-foreground/75")}>{video.article.standfirst}</p>
      <p className="text-[13px] text-muted-foreground">
        {video.article.author} · {displayDate(video)} · {video.article.readMinutes} min read
      </p>
    </article>
  )
}

/** Secondary stories: a row with the video on the left, so any number of items fills the column. */
function StoryRow({ channel, video }: { channel: Channel; video: Video }) {
  const href = videoPath(channel, video)
  return (
    <article className="group grid grid-cols-[120px_1fr] gap-4 border-t pt-6 sm:grid-cols-[240px_1fr] sm:gap-6">
      <Link href={href} tabIndex={-1} aria-hidden className="block">
        <VideoThumb tone={video.posterTone} durationSec={video.durationSec} exclusive={video.exclusive} />
      </Link>
      <div className="flex min-w-0 flex-col gap-2">
        <span className="kicker text-foreground">{sectionLabel(channel, video.section)}</span>
        <h3 className={cn(DISPLAY, "text-[19px] leading-[23px] sm:text-[24px] sm:leading-[28px]")}>
          <Link href={href} className="outline-none group-hover:underline group-hover:decoration-2 group-hover:underline-offset-4 focus-visible:underline">
            {video.article.headline}
          </Link>
        </h3>
        <p className={cn(BODY, "hidden text-[16px] leading-[24px] text-foreground/75 sm:line-clamp-2")}>{video.article.standfirst}</p>
        <p className="text-[13px] text-muted-foreground">
          {displayDate(video)} · {video.article.readMinutes} min read
        </p>
      </div>
    </article>
  )
}

export function ArticleGrid({ channel, videos, mostWatched }: { channel: Channel; videos: Video[]; mostWatched: Video[] }) {
  if (!videos.length) return null
  const [first, ...rest] = videos
  return (
    <section aria-labelledby="grid-title" className="mx-auto w-full max-w-[1280px] px-4 md:px-8">
      <ModuleHeading id="grid-title" title="Latest" />
      <div className="grid gap-10 lg:grid-cols-12">
        <div className="flex min-w-0 flex-col gap-8 lg:col-span-8">
          <FeatureCard channel={channel} video={first} />
          {rest.map((v) => (
            <StoryRow key={v.id} channel={channel} video={v} />
          ))}
        </div>
        {mostWatched.length > 0 && (
          <aside aria-labelledby="most-watched" className="lg:col-span-4">
            <h3 id="most-watched" className="kicker mb-4 text-foreground">Most watched</h3>
            <ol className="divide-y border-y">
              {mostWatched.map((v, i) => (
                <li key={v.id}>
                  <Link href={videoPath(channel, v)} className="group flex gap-4 py-4 outline-none focus-visible:ring-2 focus-visible:ring-ring">
                    <span className={cn(DISPLAY, "w-8 shrink-0 text-[34px] leading-[34px] text-muted-foreground tabular")} aria-hidden>
                      {i + 1}
                    </span>
                    <span className="flex min-w-0 flex-col gap-1">
                      <span className={cn(DISPLAY, "text-[19px] leading-[23px] group-hover:underline group-hover:underline-offset-4")}>
                        {v.title}
                      </span>
                      <span className="text-[13px] text-muted-foreground">
                        {compact(v.views)} views · {formatDuration(v.durationSec)}
                      </span>
                    </span>
                  </Link>
                </li>
              ))}
            </ol>
          </aside>
        )}
      </div>
    </section>
  )
}

export function SectionRows({ channel, videos }: { channel: Channel; videos: Video[] }) {
  const rows = channel.sections
    .map((s) => ({ ...s, items: videos.filter((v) => v.section === s.slug) }))
    .filter((r) => r.items.length > 0)
  if (!rows.length) return null
  return (
    <div className="mx-auto flex w-full max-w-[1280px] flex-col gap-16 px-4 md:px-8">
      {rows.map((row) => (
        <section key={row.slug} aria-labelledby={`row-${row.slug}`}>
          <ModuleHeading id={`row-${row.slug}`} title={row.label} href={sectionPath(channel, row.slug)} />
          <div className="grid grid-cols-1 gap-x-6 gap-y-8 sm:grid-cols-2 lg:grid-cols-4">
            {row.items.slice(0, 4).map((v) => (
              <VideoCard
                key={v.id}
                href={videoPath(channel, v)}
                title={v.title}
                tone={v.posterTone}
                durationSec={v.durationSec}
                exclusive={v.exclusive}
                size="sm"
                meta={`${displayDate(v)} · ${v.article.readMinutes} min read`}
              />
            ))}
          </div>
        </section>
      ))}
    </div>
  )
}
