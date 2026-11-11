import { Suspense } from "react"
import type { Metadata } from "next"
import Link from "next/link"
import { notFound } from "next/navigation"
import { ChevronLeft, ChevronRight, Film } from "lucide-react"
import { ShortCard } from "@/components/brand/media"
import { DISPLAY, SITE, channelStories, publicShorts, shortPath } from "@/components/channel/lib"
import { ModuleHeading, StoryCard } from "@/components/channel/story"
import { Empty, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from "@/components/ui/empty"
import { ChannelPageSkeleton } from "@/components/channel/skeleton"
import { getChannel, listChannels } from "@/lib/data"
import { cn } from "@/lib/utils"

type Params = Promise<{ channel: string; section: string }>

export function generateStaticParams() {
  return listChannels().flatMap((c) => c.sections.map((s) => ({ channel: c.slug, section: s.slug })))
}

function load(c: string, s: string) {
  const channel = getChannel(c)
  const section = channel?.sections.find((x) => x.slug === s)
  if (!channel || !section) return null
  return { channel, section }
}

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { channel: c, section: s } = await params
  const data = load(c, s)
  if (!data) return {}
  return {
    title: { absolute: `${data.section.label} · ${data.channel.name}` },
    description: `${data.section.label} videos and articles from ${data.channel.name}. ${data.channel.tagline}`,
    alternates: { canonical: `${SITE}/c/${data.channel.slug}/s/${data.section.slug}` },
  }
}

async function SectionPageContent({ params }: { params: Params }) {
  const { channel: c, section: s } = await params
  const data = load(c, s)
  if (!data) notFound()
  const { channel, section } = data

  const stories = channelStories(channel, { section: section.slug })
  const videoCount = stories.filter((x) => x.kind === "video").length
  const articleCount = stories.length - videoCount
  const ids = new Set(stories.map((v) => v.id))
  const shorts = publicShorts(channel).filter((x) => x.videoId && ids.has(x.videoId))
  const [first, ...rest] = stories

  return (
    <div className="mx-auto max-w-[1280px] px-4 pt-10 md:px-8 md:pt-14">
      <header className="mb-10 flex flex-col gap-3 md:mb-14">
        <span className="kicker text-foreground">{channel.name}</span>
        <h1 className={cn(DISPLAY, "text-[56px] leading-[0.95] md:text-[96px]", channel.template === "broadcast" && "uppercase")}>{section.label}</h1>
        <p className="text-[15px] text-muted-foreground">
          {videoCount === 1 ? "1 video" : `${videoCount} videos`}, each with an article
          {articleCount ? ` · ${articleCount === 1 ? "1 article" : `${articleCount} articles`}` : ""}
          {shorts.length ? ` · ${shorts.length} shorts` : ""}
        </p>
      </header>

      {first ? (
        <>
          <div className="mb-12 border-b pb-12">
            <StoryCard story={first} size="lg" standfirst />
          </div>
          {rest.length > 0 && (
            <ul className="grid grid-cols-1 gap-x-6 gap-y-10 sm:grid-cols-2 lg:grid-cols-3">
              {rest.map((x) => (
                <li key={x.id}>
                  <StoryCard story={x} standfirst ratio={x.kind === "video" ? "16/9" : "3/2"} />
                </li>
              ))}
            </ul>
          )}
          <nav aria-label="Pagination" className="mt-12 flex items-center justify-between border-t pt-4 text-[14px]">
            <span className="inline-flex items-center gap-1 text-muted-foreground opacity-50" aria-disabled>
              <ChevronLeft className="size-4" aria-hidden /> Newer
            </span>
            <span className="text-muted-foreground tabular">Page 1 of 1</span>
            <span className="inline-flex items-center gap-1 text-muted-foreground opacity-50" aria-disabled>
              Older <ChevronRight className="size-4" aria-hidden />
            </span>
          </nav>
        </>
      ) : (
        <Empty className="border">
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <Film />
            </EmptyMedia>
            <EmptyTitle>Nothing in {section.label} yet</EmptyTitle>
            <EmptyDescription>
              New episodes land here as soon as they are published. <Link href={`/c/${channel.slug}`} className="underline underline-offset-4">Back to {channel.name}</Link>
            </EmptyDescription>
          </EmptyHeader>
        </Empty>
      )}

      {shorts.length > 0 && (
        <section aria-labelledby="section-shorts" className="mt-16">
          <ModuleHeading id="section-shorts" title={`${section.label} shorts`} href={`/c/${channel.slug}/shorts`} linkLabel="Watch all" />
          <ul className="-mx-4 flex gap-4 overflow-x-auto px-4 pb-2 md:mx-0 md:px-0">
            {shorts.map((x) => (
              <li key={x.id}>
                <ShortCard href={shortPath(channel, x)} title={x.title} tone={x.posterTone} src={x.poster} durationSec={x.durationSec} />
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  )
}

// params are URL data: read them inside Suspense so the shared App Shell stays instant.
export default function SectionPage({ params }: { params: Params }) {
  return (
    <Suspense fallback={<ChannelPageSkeleton variant="page" />}>
      <SectionPageContent params={params} />
    </Suspense>
  )
}
