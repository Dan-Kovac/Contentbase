import { Fragment } from "react"
import Link from "next/link"
import { ArrowRight, Clock, Play, Radio } from "lucide-react"
import { StatusBadge } from "@/components/brand/status-badge"
import { formatDuration } from "@/lib/format"
import { cn } from "@/lib/utils"
import type { Channel, Video } from "@/lib/types"
import { LiveStrip, ShortsList, type HomeData } from "./home-modules"
import type { LiveBlog } from "./live-data"
import { BODY, DISPLAY, sectionLabel, sectionPath, videoPath, type Story } from "./lib"
import { RAIL_CARD, RAIL_HEADLINE } from "./styles"
import { SponsorSlot } from "./viewer"
import { RailHeading, StoryImage } from "./story"

const WRAP = "mx-auto w-full max-w-[1280px] px-4 md:px-8"

/** Broadcast: dark and video-led. A full-bleed photographic hero, then streaming-style rails. */
export function BroadcastHome({ data }: { data: HomeData }) {
  const { channel, modules } = data
  return (
    <div className="pb-8">
      {data.live && modules[0] !== "lead" && <LiveStrip channel={channel} live={data.live} tone="dark" />}
      {modules[0] !== "lead" && <h1 className="sr-only">{channel.name}</h1>}
      <div className="flex flex-col gap-14 md:gap-20">
        {modules.map((m) => {
          switch (m) {
            case "lead":
              return data.lead ? <BroadcastHero key="lead" data={data} video={data.lead} /> : null
            case "grid":
              return <LatestRail key="grid" data={data} />
            case "sections":
              return <SectionRails key="sections" data={data} />
            case "shorts":
              return data.shorts.length ? (
                <section key="shorts" aria-labelledby="shorts-title" className={WRAP}>
                  <RailHeading id="shorts-title" title="Shorts" href={`/c/${channel.slug}/shorts`} linkLabel="Watch all" />
                  <ShortsList channel={channel} shorts={data.shorts} sponsor={data.sponsors.short} />
                </section>
              ) : null
          }
        })}
      </div>
    </div>
  )
}

function BroadcastHero({ data, video }: { data: HomeData; video: Video }) {
  const { channel, live } = data
  const href = videoPath(channel, video)
  return (
    <section aria-labelledby="lead-title" className="relative isolate overflow-hidden bg-black text-white">
      {video.poster && (
        // eslint-disable-next-line @next/next/no-img-element -- prototype media; next/image once media is on the CDN
        <img src={video.poster} alt="" className="absolute inset-0 -z-20 size-full object-cover object-center" fetchPriority="high" />
      )}
      <div className="absolute inset-0 -z-10 bg-gradient-to-t from-background via-black/55 to-black/10" aria-hidden />
      <div className="absolute inset-0 -z-10 bg-gradient-to-r from-black/85 via-black/35 to-transparent" aria-hidden />
      {live && (
        <Link
          href={`/c/${channel.slug}/live`}
          className="absolute inset-x-0 top-0 flex items-center gap-3 bg-black/55 px-4 py-2.5 text-[14px] font-medium backdrop-blur outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-white md:px-8"
        >
          <span className="mx-auto flex w-full max-w-[1216px] items-center gap-3">
            <StatusBadge tone="live" />
            <span className="min-w-0 truncate">{live.title}</span>
            <span className="ml-auto hidden shrink-0 items-center gap-1 text-white/70 sm:inline-flex">
              Follow live <ArrowRight className="size-4" aria-hidden />
            </span>
          </span>
        </Link>
      )}
      <div className={cn(WRAP, "flex min-h-[600px] flex-col justify-end pb-12 pt-28 md:min-h-[min(80svh,760px)] md:pb-20")}>
        <div className="flex max-w-[760px] flex-col gap-5">
          <span className="flex flex-wrap items-center gap-3 text-[12px] font-bold uppercase tracking-[1.5px]">
            <span className="rounded-[2px] bg-[var(--chan)] px-2 py-1 text-[var(--chan-on)]">{sectionLabel(channel, video.section)}</span>
            <span className="text-white/80">Latest episode</span>
          </span>
          <h1 id="lead-title" className={cn(DISPLAY, "text-[52px] uppercase leading-[0.9] sm:text-[72px] lg:text-[96px]")}>
            <Link href={href} className="outline-none hover:text-[var(--chan)] focus-visible:underline">
              {video.article.headline}
            </Link>
          </h1>
          <p className={cn(BODY, "max-w-[56ch] text-[18px] leading-[27px] text-white/85 md:text-[21px] md:leading-[31px]")}>{video.article.standfirst}</p>
          <p className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[14px] text-white/70">
            <span className="inline-flex items-center gap-1.5 font-mono tabular">
              <Clock className="size-3.5" aria-hidden /> {formatDuration(video.durationSec)}
            </span>
            <span aria-hidden>·</span>
            <span>{video.article.author}</span>
            <span aria-hidden>·</span>
            <span>{video.publishedAt ?? video.sourcePublishedAt}</span>
          </p>
          <div className="flex flex-wrap items-center gap-3 pt-1">
            <Link
              href={href}
              className="inline-flex h-12 items-center gap-2 rounded-md bg-[var(--chan)] px-6 text-[16px] font-bold text-[var(--chan-on)] outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-black"
            >
              <Play className="size-5 fill-current" aria-hidden />
              Watch now
            </Link>
            <Link
              href={`${href}#article`}
              className="inline-flex h-12 items-center rounded-md border border-white/30 bg-white/10 px-5 text-[15px] font-semibold text-white backdrop-blur outline-none hover:bg-white/20 focus-visible:ring-2 focus-visible:ring-white"
            >
              Read the article
            </Link>
          </div>
          <SponsorSlot format="presented" options={data.sponsors.presented} tone="dark" className="mt-3 max-w-[560px]" />
        </div>
      </div>
    </section>
  )
}

/** A streaming-style card: big poster, accent ring on hover, title under. */
function RailCard({ story }: { story: Story }) {
  return (
    <article className={cn("group relative flex flex-col gap-3", RAIL_CARD)}>
      <div className="rounded-lg ring-2 ring-transparent ring-offset-2 ring-offset-background transition-shadow group-hover:ring-[var(--chan)] group-focus-within:ring-[var(--chan)]">
        <StoryImage story={story} ratio={story.kind === "video" ? "16/9" : "3/2"} />
      </div>
      <span className="text-[12px] font-bold uppercase tracking-[1.2px] text-[var(--chan-ink)]">{story.sectionLabel}</span>
      <h3 className={cn(DISPLAY, RAIL_HEADLINE)}>
        <Link href={story.href} className="outline-none after:absolute after:inset-0 group-hover:underline group-hover:underline-offset-4">
          {story.headline}
        </Link>
      </h3>
      <p className="text-[13px] text-muted-foreground">
        {story.date} · {story.kind === "video" ? `${story.readMinutes} min read with the video` : `${story.readMinutes} min read`}
      </p>
    </article>
  )
}

function LiveCard({ channel, live }: { channel: Channel; live: LiveBlog }) {
  const latest = live.updates[0]
  return (
    <article className={cn("group relative flex flex-col gap-3", RAIL_CARD)}>
      <div className="relative flex aspect-video flex-col justify-between overflow-hidden rounded-lg bg-[var(--chan)] p-4 text-[var(--chan-on)] ring-2 ring-transparent ring-offset-2 ring-offset-background group-hover:ring-[var(--chan)]">
        <span className="flex items-center gap-2 text-[12px] font-bold uppercase tracking-[1.5px]">
          <Radio className="size-4" aria-hidden /> Live now
        </span>
        <span className={cn(DISPLAY, "text-[26px] uppercase leading-[0.95] md:text-[32px]")}>{latest?.title ?? live.event}</span>
        <span className="font-mono text-[13px] font-medium tabular">Updated {live.updatedAt}</span>
      </div>
      <span className="text-[12px] font-bold uppercase tracking-[1.2px] text-[var(--chan-ink)]">{live.event}</span>
      <h3 className={cn(DISPLAY, RAIL_HEADLINE)}>
        <Link href={`/c/${channel.slug}/live`} className="outline-none after:absolute after:inset-0 group-hover:underline group-hover:underline-offset-4">
          {live.title}
        </Link>
      </h3>
      <p className="text-[13px] text-muted-foreground">{live.updates.length} updates · Newest first</p>
    </article>
  )
}

function Rail({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="-mx-4 overflow-x-auto px-4 pb-3 md:-mx-8 md:px-8 [scrollbar-width:thin]">
      <ul aria-label={label} className="flex w-max snap-x snap-mandatory gap-5">
        {children}
      </ul>
    </div>
  )
}

function LatestRail({ data }: { data: HomeData }) {
  const { channel } = data
  const stories = data.stories
  if (!stories.length) return null
  const reads = stories.slice(0, 4)
  return (
    <div className={cn(WRAP, "flex flex-col gap-14 md:gap-20")}>
      <section aria-labelledby="latest-title">
        <RailHeading id="latest-title" title="Latest" href={`/c/${channel.slug}/search`} linkLabel="Browse" />
        <Rail label="Latest videos">
          {data.live && (
            <li className="flex">
              <LiveCard channel={channel} live={data.live} />
            </li>
          )}
          {stories.map((s, i) => (
            <Fragment key={s.id}>
              {/* The page's one sponsored story: a rail card like the rest, third in the rail. */}
              {data.storyIn === "grid" && i === Math.min(2, stories.length - 1) && (
                <li className="flex">
                  <SponsorSlot format="story" variant="rail" options={data.sponsors.story} />
                </li>
              )}
              <li className="flex">
                <RailCard story={s} />
              </li>
            </Fragment>
          ))}
        </Rail>
      </section>

      <section aria-labelledby="read-title">
        <RailHeading id="read-title" title="Read the form" />
        <ol className="grid gap-px overflow-hidden rounded-lg border bg-border md:grid-cols-2">
          {reads.map((s, i) => (
            <li key={s.id} className="bg-card">
              <Link href={s.kind === "video" ? `${s.href}#article` : s.href} className="group flex h-full gap-4 p-5 outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-ring md:p-6">
                <span className={cn(DISPLAY, "w-10 shrink-0 text-[48px] leading-[44px] text-[var(--chan-ink)] tabular")} aria-hidden>
                  {String(i + 1).padStart(2, "0")}
                </span>
                <span className="flex min-w-0 flex-col gap-2">
                  <span className="text-[12px] font-bold uppercase tracking-[1.2px] text-muted-foreground">
                    {s.sectionLabel} · {s.readMinutes} min read
                  </span>
                  <span className={cn(DISPLAY, "text-[24px] leading-[27px] group-hover:underline group-hover:underline-offset-4")}>{s.headline}</span>
                  <span className={cn(BODY, "line-clamp-2 text-[16px] leading-[24px] text-foreground/75")}>{s.standfirst}</span>
                </span>
              </Link>
            </li>
          ))}
        </ol>
      </section>
    </div>
  )
}

function SectionRails({ data }: { data: HomeData }) {
  const { channel } = data
  const rows = channel.sections
    .map((s) => ({ ...s, items: data.stories.filter((x) => x.section === s.slug) }))
    .filter((r) => r.items.length > 0)
  if (!rows.length) return null
  const sponsoredRow = rows.findIndex((r) => r.items.length >= 2)
  return (
    <div className={cn(WRAP, "flex flex-col gap-14")}>
      {rows.map((row, i) => (
        <section key={row.slug} aria-labelledby={`row-${row.slug}`}>
          <RailHeading id={`row-${row.slug}`} title={row.label} href={sectionPath(channel, row.slug)} />
          <Rail label={`${row.label} videos`}>
            {row.items.map((s, j) => (
              <Fragment key={s.id}>
                {data.storyIn === "sections" && i === sponsoredRow && j === 2 && (
                  <li className="flex">
                    <SponsorSlot format="story" variant="rail" options={data.sponsors.story} />
                  </li>
                )}
                <li className="flex">
                  <RailCard story={s} />
                </li>
              </Fragment>
            ))}
          </Rail>
        </section>
      ))}
    </div>
  )
}

