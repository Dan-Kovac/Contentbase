import Link from "next/link"
import { Play } from "lucide-react"
import { HalftimeBreak, PresentedBy } from "@/components/brand/native-ads"
import { StatusBadge } from "@/components/brand/status-badge"
import { compact, formatDuration } from "@/lib/format"
import { cn } from "@/lib/utils"
import type { Channel, Video } from "@/lib/types"
import { LiveStrip, ShortsList, type HomeData } from "./home-modules"
import { BODY, DISPLAY, sectionLabel, sectionPath, sponsorFor, videoPath, type Story } from "./lib"
import { ModuleHeading, StoryCard, StoryImage, StoryRow } from "./story"

const WRAP = "mx-auto w-full max-w-[1280px] px-4 md:px-8"

/** Editorial: a white magazine. Photographic lead beside a big headline, a story grid, serif reading. */
export function EditorialHome({ data }: { data: HomeData }) {
  const { channel, modules } = data
  return (
    <div className="pb-8">
      {data.live && <LiveStrip channel={channel} live={data.live} />}
      {modules[0] !== "lead" && <h1 className="sr-only">{channel.name}</h1>}
      <div className="flex flex-col gap-16 md:gap-24">
        {modules.map((m) => {
          switch (m) {
            case "lead":
              return data.lead ? <EditorialLead key="lead" channel={channel} video={data.lead} /> : null
            case "shorts":
              return data.shorts.length ? (
                <section key="shorts" aria-labelledby="shorts-title" className={WRAP}>
                  <ModuleHeading id="shorts-title" title="Shorts" href={`/c/${channel.slug}/shorts`} linkLabel="Watch all" />
                  <ShortsList channel={channel} shorts={data.shorts} />
                </section>
              ) : null
            case "sponsor":
              return (
                <div key="sponsor" className={WRAP}>
                  <HalftimeBreak sponsor={sponsorFor("halftime")} />
                </div>
              )
            case "grid":
              return <EditorialGrid key="grid" data={data} />
            case "sections":
              return <EditorialSections key="sections" data={data} />
          }
        })}
      </div>
    </div>
  )
}

function EditorialLead({ channel, video }: { channel: Channel; video: Video }) {
  const href = videoPath(channel, video)
  return (
    <section aria-labelledby="lead-title" className={cn(WRAP, "pt-6 md:pt-12")}>
      <div className="grid gap-6 lg:grid-cols-12 lg:gap-12">
        <Link
          href={href}
          aria-label={`Watch: ${video.title}`}
          className="group relative block overflow-hidden rounded-lg bg-muted outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 lg:col-span-7"
        >
          <div className="relative aspect-[4/3] w-full sm:aspect-[3/2] lg:aspect-[4/3]">
            {video.poster && (
              // eslint-disable-next-line @next/next/no-img-element -- prototype media; next/image once media is on the CDN
              <img
                src={video.poster}
                alt=""
                className="absolute inset-0 size-full object-cover transition-transform duration-500 group-hover:scale-[1.015] motion-reduce:transition-none"
                fetchPriority="high"
              />
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" aria-hidden />
            <span className="absolute bottom-4 left-4 inline-flex h-11 items-center gap-2.5 rounded-full bg-white pl-1.5 pr-4 text-[14px] font-bold text-black shadow-sm md:bottom-6 md:left-6">
              <span className="grid size-8 place-items-center rounded-full bg-[var(--chan)] text-[var(--chan-on)]">
                <Play className="ml-0.5 size-4 fill-current" aria-hidden />
              </span>
              Watch <span className="font-mono text-[13px] font-medium tabular">{formatDuration(video.durationSec)}</span>
            </span>
          </div>
        </Link>
        <div className="flex flex-col gap-5 lg:col-span-5 lg:justify-center">
          <Link href={sectionPath(channel, video.section)} className="kicker w-fit text-foreground hover:underline">
            {sectionLabel(channel, video.section)} · Latest episode
          </Link>
          <h1 id="lead-title" className={cn(DISPLAY, "text-[44px] leading-[0.98] sm:text-[60px] lg:text-[68px] xl:text-[80px]")}>
            <Link href={href} className="outline-none hover:underline hover:decoration-[var(--chan)] hover:decoration-[5px] hover:underline-offset-[8px] focus-visible:underline">
              {video.article.headline}
            </Link>
          </h1>
          <p className={cn(BODY, "text-[19px] leading-[29px] text-foreground/80 md:text-[22px] md:leading-[33px]")}>{video.article.standfirst}</p>
          <p className="text-[14px] text-muted-foreground">
            <span className="font-semibold text-foreground">{video.article.author}</span> · {video.publishedAt ?? video.sourcePublishedAt} ·{" "}
            {video.article.readMinutes} min read
          </p>
          <div className="flex flex-wrap items-center gap-4">
            <Link
              href={href}
              className="inline-flex h-11 items-center gap-2 rounded-md bg-foreground px-5 text-[15px] font-bold text-background outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            >
              <Play className="size-4 fill-current" aria-hidden />
              Watch now
            </Link>
            <Link href={`${href}#article`} className="rounded-sm text-[15px] font-semibold underline decoration-[var(--chan)] decoration-2 underline-offset-4 outline-none hover:decoration-foreground focus-visible:ring-2 focus-visible:ring-ring">
              Read the article
            </Link>
          </div>
          <PresentedBy sponsor={sponsorFor("presented")} className="mt-2" />
        </div>
      </div>
    </section>
  )
}

function EditorialGrid({ data }: { data: HomeData }) {
  const { channel } = data
  const stories = data.stories.filter((s) => s.id !== data.lead?.id)
  if (!stories.length) return null
  const [feature, ...rest] = stories
  return (
    <section aria-labelledby="grid-title" className={WRAP}>
      <ModuleHeading id="grid-title" title="Latest" />
      <div className="grid gap-x-10 gap-y-12 lg:grid-cols-12">
        <div className="flex min-w-0 flex-col gap-10 lg:col-span-8">
          <FeatureStory story={feature} />
          {rest.length > 0 && (
            <div className="grid gap-x-8 gap-y-10 border-t pt-8 sm:grid-cols-2">
              {rest.map((s) => (
                <StoryCard key={s.id} story={s} standfirst ratio="3/2" />
              ))}
            </div>
          )}
        </div>
        {data.mostWatched.length > 0 && (
          <aside aria-labelledby="most-watched" className="lg:col-span-4">
            <h3 id="most-watched" className="kicker mb-4 text-foreground">Most watched</h3>
            <ol className="divide-y border-y">
              {data.mostWatched.map((s, i) => (
                <li key={s.id}>
                  <Link href={s.href} className="group flex gap-4 py-4 outline-none focus-visible:ring-2 focus-visible:ring-ring">
                    <span className={cn(DISPLAY, "w-8 shrink-0 text-[38px] leading-[36px] text-[var(--chan-ink)] tabular")} aria-hidden>
                      {i + 1}
                    </span>
                    <span className="flex min-w-0 flex-1 flex-col gap-1">
                      <span className={cn(DISPLAY, "text-[19px] leading-[23px] group-hover:underline group-hover:underline-offset-4")}>{s.headline}</span>
                      <span className="text-[13px] text-muted-foreground">
                        {compact(s.views)} views{s.durationSec ? ` · ${formatDuration(s.durationSec)}` : ""}
                      </span>
                    </span>
                    {s.poster && (
                      // eslint-disable-next-line @next/next/no-img-element -- prototype media
                      <img src={s.poster} alt="" className="hidden aspect-square w-16 shrink-0 rounded-md object-cover sm:block" loading="lazy" />
                    )}
                  </Link>
                </li>
              ))}
            </ol>
            <p className="mt-6 text-[13px] leading-[19px] text-muted-foreground">{channel.tagline}</p>
          </aside>
        )}
      </div>
    </section>
  )
}

/** The grid's first story: picture beside the text from md, so the grid opens like a magazine spread. */
function FeatureStory({ story }: { story: Story }) {
  return (
    <article className="group relative grid gap-5 md:grid-cols-2 md:gap-8">
      <StoryImage story={story} ratio={story.kind === "video" ? "16/9" : "3/2"} className="md:self-start" />
      <div className="flex flex-col gap-3">
        <span className="kicker text-foreground">
          {story.sectionLabel}
          {story.exclusive && <StatusBadge tone="exclusive" className="ml-1" />}
        </span>
        <h3 className={cn(DISPLAY, "text-[30px] leading-[33px] md:text-[36px] md:leading-[39px]")}>
          <Link href={story.href} className="outline-none after:absolute after:inset-0 after:rounded-lg focus-visible:after:ring-2 focus-visible:after:ring-ring group-hover:underline group-hover:decoration-2 group-hover:underline-offset-4">
            {story.headline}
          </Link>
        </h3>
        <p className={cn(BODY, "text-[17px] leading-[26px] text-foreground/75 md:text-[18px] md:leading-[28px]")}>{story.standfirst}</p>
        <p className="text-[13px] text-muted-foreground">
          {story.author} · {story.date} · {story.readMinutes} min read
        </p>
      </div>
    </article>
  )
}

function EditorialSections({ data }: { data: HomeData }) {
  const { channel } = data
  const rows = channel.sections
    .map((s) => ({ ...s, items: data.stories.filter((x) => x.section === s.slug) }))
    .filter((r) => r.items.length > 0)
  if (!rows.length) return null
  return (
    <div className={cn(WRAP, "flex flex-col gap-16")}>
      {rows.map((row, i) => (
        <section key={row.slug} aria-labelledby={`row-${row.slug}`}>
          <ModuleHeading id={`row-${row.slug}`} title={row.label} href={sectionPath(channel, row.slug)}>
            {/* One section row carries a "Presented by" credit on its header. */}
            {i === 0 && <PresentedBy sponsor={sponsorFor("section")} />}
          </ModuleHeading>
          <div className="grid grid-cols-1 gap-x-6 gap-y-8 sm:grid-cols-2 lg:grid-cols-4">
            {row.items.slice(0, 4).map((s) => (
              <StoryCard key={s.id} story={s} size="sm" />
            ))}
          </div>
          {row.items.length > 4 && (
            <div className="mt-8 flex flex-col gap-6">
              {row.items.slice(4, 7).map((s) => (
                <StoryRow key={s.id} story={s} className="border-t pt-6" />
              ))}
            </div>
          )}
        </section>
      ))}
    </div>
  )
}
