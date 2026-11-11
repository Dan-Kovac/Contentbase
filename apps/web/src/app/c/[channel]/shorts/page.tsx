import type { Metadata } from "next"
import { Suspense } from "react"
import { notFound } from "next/navigation"
import { SITE, publicShorts, shortSourceLabel, videoPath } from "@/components/channel/lib"
import { ShortsFeed, ShortsFeedFromParams, type FeedShort } from "@/components/channel/shorts-feed"
import { ChannelPageSkeleton } from "@/components/channel/skeleton"
import { getChannel, getVideo } from "@/lib/data"

export async function generateMetadata({ params }: { params: Promise<{ channel: string }> }): Promise<Metadata> {
  const { channel: slug } = await params
  const channel = getChannel(slug)
  if (!channel) return {}
  return {
    title: { absolute: `Shorts · ${channel.name}` },
    description: `Short clips and YouTube Shorts from ${channel.name}.`,
    alternates: { canonical: `${SITE}/c/${channel.slug}/shorts` },
  }
}

async function ShortsPageContent({ params }: { params: Promise<{ channel: string }> }) {
  const { channel: slug } = await params
  const channel = getChannel(slug)
  if (!channel) notFound()

  const shorts: FeedShort[] = publicShorts(channel).map((s) => {
    const parent = s.videoId ? getVideo(s.videoId) : undefined
    return {
      id: s.id,
      title: s.title,
      caption: s.caption,
      durationSec: s.durationSec,
      posterTone: s.posterTone,
      source: s.source,
      sourceLabel: shortSourceLabel(s),
      parentHref: parent ? `${videoPath(channel, parent)}${s.startSec ? `?t=${s.startSec}` : ""}` : undefined,
      startSec: s.startSec,
      views: s.views,
    }
  })

  if (!shorts.length) notFound()

  return (
    <Suspense fallback={<ShortsFeed shorts={shorts} channelName={channel.name} />}>
      <ShortsFeedFromParams shorts={shorts} channelName={channel.name} />
    </Suspense>
  )
}

// params are URL data: read them inside Suspense so the shared App Shell stays instant.
export default function ShortsPage({ params }: { params: Promise<{ channel: string }> }) {
  return (
    <Suspense fallback={<ChannelPageSkeleton variant="video" />}>
      <ShortsPageContent params={params} />
    </Suspense>
  )
}
