import Link from "next/link"
import { Lock } from "lucide-react"
import { ShortCard, VideoThumb } from "@/components/brand/media"
import { StatusBadge } from "@/components/brand/status-badge"
import { getVideo } from "@/lib/data"
import { formatDuration } from "@/lib/format"
import { cn } from "@/lib/utils"
import type { Block, Channel, Sponsor, Video } from "@/lib/types"
import {
  BODY,
  DISPLAY,
  SITE,
  displayDate,
  isoDate,
  isoDuration,
  sectionLabel,
  sectionPath,
  shortPath,
  videoPath,
  type Related,
} from "./lib"
import { StoryCard } from "./story"
import { SponsorSlot, type Viewer } from "./viewer"

/**
 * Where the one in-article unit goes: before the first subheading that follows at least two
 * paragraphs (a natural break). Never between the headline and the first paragraph.
 * Returns -1 when the article is too short to carry an in-article unit.
 */
export function inArticleAdIndex(blocks: Block[], minParagraphs = 2) {
  let paragraphs = 0
  for (let i = 0; i < blocks.length; i++) {
    const b = blocks[i]
    if (b.type === "heading" && paragraphs >= minParagraphs) return i
    if (b.type === "paragraph") paragraphs++
  }
  // No subheadings: after the third paragraph, if there is more to read after it.
  let seen = 0
  for (let i = 0; i < blocks.length; i++) {
    if (blocks[i].type === "paragraph") seen++
    if (seen === 3 && i < blocks.length - 1) return i + 1
  }
  return -1
}

export interface HeaderData {
  kicker: string
  kickerHref: string
  headline: string
  standfirst: string
  author: string
  date: string
  readMinutes: number
  /** Extra byline item, e.g. "Video 18:06". */
  extra?: string
}

export function ArticleHeaderView({ h, size = "md" }: { h: HeaderData; size?: "md" | "lg" }) {
  return (
    <header className="flex flex-col gap-4 font-sans">
      <Link href={h.kickerHref} className="kicker w-fit text-foreground hover:underline">
        {h.kicker}
      </Link>
      <h1 className={cn(DISPLAY, size === "lg" ? "text-[40px] leading-[1.02] sm:text-[52px] md:text-[64px]" : "text-[36px] leading-[1.04] sm:text-[44px] md:text-[52px]")}>
        {h.headline}
      </h1>
      <p className={cn(BODY, "text-[20px] leading-[30px] text-foreground/80 md:text-[22px] md:leading-[33px]")}>{h.standfirst}</p>
      <div className="flex flex-wrap items-center gap-x-3 gap-y-1 border-y py-3 text-[14px]">
        <span className="font-semibold">By {h.author}</span>
        {h.date && (
          <>
            <span className="text-muted-foreground" aria-hidden>·</span>
            <time dateTime={isoDate(h.date)} className="text-muted-foreground">
              {h.date}
            </time>
          </>
        )}
        <span className="text-muted-foreground" aria-hidden>·</span>
        <span className="text-muted-foreground">{h.readMinutes} min read</span>
        {h.extra && (
          <>
            <span className="text-muted-foreground" aria-hidden>·</span>
            <span className="font-mono text-[13px] text-muted-foreground tabular">{h.extra}</span>
          </>
        )}
      </div>
    </header>
  )
}

export function ArticleHeader({ channel, video }: { channel: Channel; video: Video }) {
  return (
    <ArticleHeaderView
      h={{
        kicker: sectionLabel(channel, video.section),
        kickerHref: sectionPath(channel, video.section),
        headline: video.article.headline,
        standfirst: video.article.standfirst,
        author: video.article.author,
        date: displayDate(video),
        readMinutes: video.article.readMinutes,
        extra: `Video ${formatDuration(video.durationSec)}`,
      }}
    />
  )
}

/** Split blocks around the Half-time break so the break can leave the reading column. */
export function splitAtBreak(blocks: Block[], minParagraphs = 2) {
  const at = inArticleAdIndex(blocks, minParagraphs)
  return at > 0 ? { before: blocks.slice(0, at), after: blocks.slice(at) } : { before: blocks, after: [] as Block[] }
}

export function BlockView({ block, channel }: { block: Block; channel: Channel }) {
  switch (block.type) {
    case "paragraph":
      return <p className="my-6">{block.text}</p>
    case "heading":
      return (
        <h2 className={cn(DISPLAY, "mb-4 mt-12 font-[family-name:var(--chan-display)] text-[26px] leading-[31px] md:text-[30px] md:leading-[35px]")}>
          {block.text}
        </h2>
      )
    case "quote":
      return (
        <figure className="my-10 border-l-4 border-[var(--chan)] pl-5 md:-ml-6 md:pl-6">
          <blockquote className={cn(DISPLAY, "text-[28px] leading-[34px] md:text-[34px] md:leading-[40px]")}>
            <p>“{block.text}”</p>
          </blockquote>
          {block.cite && (
            <figcaption className="mt-3 font-sans text-[14px] font-semibold text-muted-foreground">{block.cite}</figcaption>
          )}
        </figure>
      )
    case "list":
      return (
        <ul className="my-6 flex flex-col gap-2 pl-0">
          {block.items.map((item) => (
            <li key={item} className="flex gap-3">
              <span className="mt-[11px] size-[7px] shrink-0 bg-[var(--chan)] ring-1 ring-foreground/15" aria-hidden />
              <span>{item}</span>
            </li>
          ))}
        </ul>
      )
    case "image":
      return (
        <figure className="my-8">
          {block.src ? (
            // eslint-disable-next-line @next/next/no-img-element -- prototype media; next/image once media is on the CDN
            <img src={block.src} alt={block.caption} className="aspect-[3/2] w-full rounded-lg object-cover" loading="lazy" />
          ) : (
            <div className="aspect-[3/2] w-full rounded-lg bg-muted" role="img" aria-label={block.caption} />
          )}
          <figcaption className="mt-2 font-sans text-[13px] text-muted-foreground">{block.caption}</figcaption>
        </figure>
      )
    case "video": {
      const v = getVideo(block.videoId)
      if (!v) return null
      return (
        <figure className="my-8">
          <Link href={videoPath(channel, v)}>
            <VideoThumb tone={v.posterTone} src={v.poster} durationSec={v.durationSec} />
          </Link>
          <figcaption className="mt-2 font-sans text-[13px] text-muted-foreground">{v.title}</figcaption>
        </figure>
      )
    }
    case "divider":
      return <hr className="my-10 border-border" />
  }
}

export function KeyPoints({ points }: { points: string[] }) {
  if (!points.length) return null
  return (
    <aside aria-labelledby="key-points" className="h-full rounded-lg border bg-card p-5 md:p-6">
      <h2 id="key-points" className="kicker mb-4 text-foreground">Key points</h2>
      <ol className="flex flex-col gap-3 font-sans text-[16px] leading-[23px]">
        {points.map((p, i) => (
          <li key={p} className="flex gap-3">
            <span className="w-5 shrink-0 font-mono text-[13px] leading-[23px] text-muted-foreground tabular">{i + 1}</span>
            <span className="font-medium">{p}</span>
          </li>
        ))}
      </ol>
    </aside>
  )
}

/** AUD-03: logged-out visitors get a tasteful teaser and one clear action. No ads. */
export function ExclusiveGate({ channel, video }: { channel: Channel; video: Video }) {
  return (
    <section aria-labelledby="gate-title" className="relative overflow-hidden rounded-lg bg-brand-black text-brand-white">
      <div className="absolute inset-0 scale-105 blur-md" aria-hidden>
        <VideoThumb tone={video.posterTone} src={video.poster} className="h-full rounded-none" />
      </div>
      <div className="absolute inset-0 bg-gradient-to-t from-brand-black/95 via-brand-black/60 to-brand-black/10" aria-hidden />
      <div className="relative flex aspect-auto min-h-[360px] flex-col items-center justify-center gap-4 px-6 py-12 text-center md:aspect-video md:min-h-0">
        <StatusBadge tone="exclusive" />
        <h2 id="gate-title" className={cn(DISPLAY, "max-w-[20ch] text-[30px] leading-[34px] md:text-[40px] md:leading-[44px]")}>
          Members of {channel.name} watch this free
        </h2>
        <p className="max-w-[46ch] text-[15px] leading-[22px] text-brand-muted">
          {formatDuration(video.durationSec)} · {video.description}
        </p>
        <Link
          href={`/account/signin?next=${encodeURIComponent(videoPath(channel, video))}`}
          className="mt-2 inline-flex h-12 items-center gap-2 rounded-md bg-brand-white px-6 text-[16px] font-bold text-brand-black outline-none focus-visible:ring-2 focus-visible:ring-brand-white focus-visible:ring-offset-2 focus-visible:ring-offset-brand-black"
        >
          <Lock className="size-4" aria-hidden />
          Sign in to watch
        </Link>
        <p className="text-[13px] text-brand-muted">Free. One account for every Homestand channel.</p>
      </div>
    </section>
  )
}

export function RelatedItems({ channel, related, sponsor }: { channel: Channel; related: Related; sponsor?: Record<Viewer, Sponsor> }) {
  const { stories, shorts } = related
  if (!stories.length && !shorts.length) return null
  return (
    <section aria-labelledby="related-title">
      <div className="mb-6 border-t-2 border-foreground pt-3">
        <h2 id="related-title" className={cn(DISPLAY, "text-[26px] leading-[30px] md:text-[30px] md:leading-[34px]")}>
          Watch and read next
        </h2>
      </div>
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
        {stories.length > 0 && (
          <ul className={cn("grid min-w-0 gap-x-6 gap-y-10 sm:grid-cols-2", shorts.length ? "lg:col-span-8" : "lg:col-span-12 lg:grid-cols-4")}>
            {stories.map((s) => (
              <li key={s.id}>
                <StoryCard story={s} size="sm" ratio={s.kind === "video" ? "16/9" : "3/2"} />
              </li>
            ))}
          </ul>
        )}
        {shorts.length > 0 && (
          <div className="min-w-0 lg:col-span-4">
            <h3 className="kicker mb-4 text-foreground">Shorts</h3>
            <ul className="-mx-4 flex gap-4 overflow-x-auto px-4 pb-2 lg:mx-0 lg:px-0">
              {shorts.map((x) => (
                <li key={x.id}>
                  <ShortCard href={shortPath(channel, x)} title={x.title} tone={x.posterTone} src={x.poster} durationSec={x.durationSec} className="w-[150px]" />
                </li>
              ))}
              {/* One sponsored short, the same size as the shorts beside it. */}
              {sponsor && (
                <li>
                  <SponsorSlot format="short" options={sponsor} className="w-[150px]" />
                </li>
              )}
            </ul>
          </div>
        )}
      </div>
    </section>
  )
}

export function videoJsonLd(channel: Channel, video: Video) {
  const origin = `${SITE}/c/${channel.slug}`
  const url = `${origin}/v/${video.slug}`
  const published = isoDate(displayDate(video))
  const thumbnail = video.poster ? `${SITE}${video.poster}` : video.youtubeId ? `https://i.ytimg.com/vi/${video.youtubeId}/maxresdefault.jpg` : `${url}/poster.jpg`
  const publisher = { "@type": "Organization", name: channel.name, url: origin }
  const videoObject = {
    "@type": "VideoObject",
    "@id": `${url}#video`,
    name: video.title,
    description: video.description,
    thumbnailUrl: [thumbnail],
    uploadDate: published,
    duration: isoDuration(video.durationSec),
    ...(video.youtubeId ? { embedUrl: `https://www.youtube.com/embed/${video.youtubeId}` } : { contentUrl: `${url}/video.m3u8` }),
    publisher,
    hasPart: video.chapters.map((c, i) => ({
      "@type": "Clip",
      name: c.title,
      startOffset: c.start,
      endOffset: video.chapters[i + 1]?.start ?? video.durationSec,
      url: `${url}?t=${c.start}`,
    })),
  }
  const article = {
    "@type": "Article",
    "@id": `${url}#article`,
    headline: video.article.headline,
    description: video.article.standfirst,
    datePublished: published,
    author: { "@type": "Person", name: video.article.author },
    publisher,
    mainEntityOfPage: url,
    video: { "@id": `${url}#video` },
    isAccessibleForFree: !video.exclusive,
  }
  const breadcrumbs = {
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: channel.name, item: origin },
      { "@type": "ListItem", position: 2, name: sectionLabel(channel, video.section), item: `${origin}/s/${video.section}` },
      { "@type": "ListItem", position: 3, name: video.title, item: url },
    ],
  }
  return { "@context": "https://schema.org", "@graph": [videoObject, article, breadcrumbs] }
}

export function JsonLd({ data }: { data: unknown }) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data).replace(/</g, "\\u003c") }}
    />
  )
}
