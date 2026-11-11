import { Suspense } from "react"
import type { Metadata } from "next"
import Link from "next/link"
import { notFound } from "next/navigation"
import { Fragment } from "react"
import { ChevronRight } from "lucide-react"
import { AdSlot } from "@/components/brand/ad-slot"
import {
  BODY,
  SITE,
  publicBlocks,
  publicVideos,
  relatedFor,
  sectionLabel,
  sectionPath,
} from "@/components/channel/lib"
import {
  ChapterList,
  InArticleAd,
  Player,
  PreviewAs,
  Transcript,
  VideoPageProvider,
} from "@/components/channel/video-client"
import {
  ArticleHeader,
  BlockView,
  ExclusiveGate,
  JsonLd,
  KeyPoints,
  RelatedItems,
  inArticleAdIndex,
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
    openGraph: { title: video.seo.ogTitle, description: video.seo.metaDescription, type: "video.other" },
  }
}

async function VideoPageContent({ params }: { params: Params }) {
  const { channel: c, slug } = await params
  const data = load(c, slug)
  if (!data) notFound()
  const { channel, video } = data

  const blocks = publicBlocks(video)
  const adAt = inArticleAdIndex(blocks)
  const related = relatedFor(channel, video)
  const gated = video.exclusive

  return (
    <VideoPageProvider duration={video.durationSec}>
      <JsonLd data={videoJsonLd(channel, video)} />
      <div className="mx-auto max-w-[1280px] px-4 pt-5 md:px-8 md:pt-8">
        <nav aria-label="Breadcrumb" className="mb-4 text-[13px] text-muted-foreground">
          <ol className="flex flex-wrap items-center gap-1">
            <li>
              <Link href={`/c/${channel.slug}`} className="hover:text-foreground hover:underline">
                {channel.name}
              </Link>
            </li>
            <li aria-hidden><ChevronRight className="size-3.5" /></li>
            <li>
              <Link href={sectionPath(channel, video.section)} className="hover:text-foreground hover:underline">
                {sectionLabel(channel, video.section)}
              </Link>
            </li>
            <li aria-hidden><ChevronRight className="size-3.5" /></li>
            <li aria-current="page" className="min-w-0 truncate text-foreground">
              {video.title}
            </li>
          </ol>
        </nav>

        {gated ? (
          <div className="mx-auto flex max-w-[960px] flex-col gap-10">
            <ExclusiveGate channel={channel} video={video} />
            <div className="mx-auto w-full max-w-[68ch]">
              <ArticleHeader channel={channel} video={video} />
            </div>
          </div>
        ) : (
          <>
            <div className="grid gap-6 lg:grid-cols-12 lg:gap-8">
              <div className="lg:col-span-8">
                <Player
                  title={video.title}
                  tone={video.posterTone}
                  duration={video.durationSec}
                  chapters={video.chapters}
                  source={video.source}
                />
              </div>
              <div className="lg:col-span-4">
                <ChapterList chapters={video.chapters} duration={video.durationSec} />
              </div>
            </div>

            <article id="article" className="mx-auto mt-12 w-full max-w-[68ch] scroll-mt-24 md:mt-16">
              <div className="mb-8">
                <PreviewAs mode={channel.mode} isLive={video.isLive} />
              </div>
              <ArticleHeader channel={channel} video={video} />
              <div className={cn(BODY, "text-[18px] leading-[30px] md:text-[19px] md:leading-[32px]")}>
                {blocks.map((b, i) => (
                  <Fragment key={i}>
                    {i === adAt && <InArticleAd mode={channel.mode} isLive={video.isLive} />}
                    <BlockView block={b} channel={channel} />
                  </Fragment>
                ))}
              </div>
              <KeyPoints points={video.article.keyPoints} />
              <div className="mt-10">
                <Transcript lines={video.transcript} />
              </div>
            </article>
          </>
        )}

        <div className="mt-16 flex flex-col gap-16 md:mt-20">
          <RelatedItems channel={channel} items={related} />
          {!gated && (
            <div className="flex justify-center">
              {/* End-of-page unit: non-wagering on the server render. */}
              <AdSlot format="mrec" advertiser="Kick Boots Co." />
            </div>
          )}
        </div>
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
