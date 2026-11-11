import { Suspense } from "react"
import type { Metadata } from "next"
import Link from "next/link"
import { notFound } from "next/navigation"
import { ChevronRight } from "lucide-react"
import {
  BODY,
  SITE,
  publicBlocks,
  publicVideos,
  relatedFor,
  sectionLabel,
  sectionPath,
  slotPlans,
  sponsorFor,
  sponsoredChapterIndex,
} from "@/components/channel/lib"
import {
  ChapterList,
  ChapterSponsorUnderPlayer,
  HalftimeSlot,
  PreviewAs,
  StatSlot,
  Transcript,
  VideoPageProvider,
} from "@/components/channel/video-client"
import { VideoPlayer } from "@/components/channel/video-player"
import {
  ArticleHeader,
  BlockView,
  ExclusiveGate,
  JsonLd,
  KeyPoints,
  RelatedItems,
  splitAtBreak,
  videoJsonLd,
} from "@/components/channel/video-page"
import { ChannelPageSkeleton } from "@/components/channel/skeleton"
import { getChannel, getVideoBySlug, listChannels } from "@/lib/data"
import { cn } from "@/lib/utils"

type Params = Promise<{ channel: string; slug: string }>

export function generateStaticParams() {
  return listChannels().flatMap((c) => publicVideos(c).map((v) => ({ channel: c.slug, slug: v.slug })))
}

function load(channelSlug: string, slug: string) {
  const channel = getChannel(channelSlug)
  if (!channel) return null
  const video = getVideoBySlug(channel.id, slug)
  if (!video || !(video.status === "published" || video.status === "ready")) return null
  return { channel, video }
}

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { channel: c, slug } = await params
  const data = load(c, slug)
  if (!data) return {}
  const { channel, video } = data
  return {
    title: { absolute: video.seo.titleTag },
    description: video.seo.metaDescription,
    alternates: { canonical: `${SITE}/c/${channel.slug}/v/${video.slug}` },
    openGraph: { title: video.seo.ogTitle, description: video.seo.metaDescription, type: "video.other", images: video.poster ? [video.poster] : undefined },
  }
}

const READING = cn(BODY, "mx-auto w-full max-w-[68ch] text-[18px] leading-[30px] md:text-[19px] md:leading-[32px]")

async function VideoPageContent({ params }: { params: Params }) {
  const { channel: c, slug } = await params
  const data = load(c, slug)
  if (!data) notFound()
  const { channel, video } = data

  const { before, after } = splitAtBreak(publicBlocks(video))
  const related = relatedFor(channel, video)
  const gated = video.exclusive
  const broadcast = channel.template === "broadcast"

  const breadcrumb = (
    <nav aria-label="Breadcrumb" className="mb-4 text-[13px] text-muted-foreground">
      <ol className="flex flex-wrap items-center gap-1">
        <li>
          <Link href={`/c/${channel.slug}`} className="hover:text-foreground hover:underline">
            {channel.name}
          </Link>
        </li>
        <li aria-hidden>
          <ChevronRight className="size-3.5" />
        </li>
        <li>
          <Link href={sectionPath(channel, video.section)} className="hover:text-foreground hover:underline">
            {sectionLabel(channel, video.section)}
          </Link>
        </li>
        <li aria-hidden>
          <ChevronRight className="size-3.5" />
        </li>
        <li aria-current="page" className="min-w-0 truncate text-foreground">
          {video.title}
        </li>
      </ol>
    </nav>
  )

  return (
    <VideoPageProvider duration={video.durationSec} plans={slotPlans(channel, video.isLive)} sponsoredChapter={sponsoredChapterIndex(video.chapters)}>
      <JsonLd data={videoJsonLd(channel, video)} />
      {gated ? (
        <div className="mx-auto max-w-[1280px] px-4 pt-5 md:px-8 md:pt-8">
          {breadcrumb}
          <div className="mx-auto flex max-w-[960px] flex-col gap-10">
            <ExclusiveGate channel={channel} video={video} />
            <div className="mx-auto w-full max-w-[68ch]">
              <ArticleHeader channel={channel} video={video} />
            </div>
          </div>
        </div>
      ) : (
        <>
          {/* The player stage. Broadcast sets it in a black theatre band; Editorial keeps it on the page. */}
          <div className={cn(broadcast && "border-b bg-black")}>
            <div className={cn("mx-auto max-w-[1280px] px-4 pt-5 md:px-8 md:pt-8", broadcast && "pb-8 md:pb-10")}>
              {breadcrumb}
              <div className="grid gap-6 lg:grid-cols-12 lg:gap-8">
                <div className="flex flex-col gap-3 lg:col-span-8">
                  <VideoPlayer
                    title={video.title}
                    channelName={channel.name}
                    poster={video.poster}
                    tone={video.posterTone}
                    duration={video.durationSec}
                    chapters={video.chapters}
                    transcript={video.transcript}
                    source={video.source}
                    preroll={video.source === "upload" ? sponsorFor("presented") : undefined}
                  />
                  <ChapterSponsorUnderPlayer chapters={video.chapters} />
                </div>
                <div className="lg:col-span-4">
                  <ChapterList chapters={video.chapters} duration={video.durationSec} />
                </div>
              </div>
            </div>
          </div>

          <article id="article" className="mx-auto mt-12 max-w-[1280px] scroll-mt-24 px-4 md:mt-16 md:px-8">
            <div className={READING}>
              <div className="mb-8">
                <PreviewAs />
              </div>
              <ArticleHeader channel={channel} video={video} />
              {before.map((b, i) => (
                <BlockView key={i} block={b} channel={channel} />
              ))}
            </div>
            {after.length > 0 && (
              <>
                {/* Half-time: between sections, out of the reading column to the container width. */}
                <div className="my-12 md:my-16">
                  <HalftimeSlot />
                </div>
                <div className={READING}>
                  {after.map((b, i) => (
                    <BlockView key={i} block={b} channel={channel} />
                  ))}
                </div>
              </>
            )}
            <div className={cn(BODY, "mx-auto mt-10 grid w-full max-w-[68ch] gap-5 text-[18px] md:text-[19px] sm:grid-cols-[1fr_minmax(0,240px)]")}>
              {video.article.keyPoints.length ? <KeyPoints points={video.article.keyPoints} /> : <div className="hidden sm:block" />}
              <StatSlot className="font-sans" />
            </div>
            <div className={cn(READING, "mt-10")}>
              <Transcript lines={video.transcript} />
            </div>
          </article>
        </>
      )}

      <div className="mx-auto mt-16 max-w-[1280px] px-4 md:mt-24 md:px-8">
        <RelatedItems channel={channel} related={related} />
      </div>
    </VideoPageProvider>
  )
}

// params are URL data: read them inside Suspense so the shared App Shell stays instant.
export default function VideoPage({ params }: { params: Params }) {
  return (
    <Suspense fallback={<ChannelPageSkeleton variant="video" />}>
      <VideoPageContent params={params} />
    </Suspense>
  )
}
