import { Suspense } from "react"
import type { Metadata } from "next"
import Link from "next/link"
import { notFound } from "next/navigation"
import { ChevronRight } from "lucide-react"
import { StatusBadge } from "@/components/brand/status-badge"
import {
  ArticleGrid,
  LeadStory,
  SectionRows,
  ShortsRow,
  SponsorBand,
} from "@/components/channel/home-modules"
import { getLiveBlog } from "@/components/channel/live-data"
import { SITE, leadStory, publicShorts, publicVideos } from "@/components/channel/lib"
import { ChannelPageSkeleton } from "@/components/channel/skeleton"
import { getChannel } from "@/lib/data"

export async function generateMetadata({ params }: { params: Promise<{ channel: string }> }): Promise<Metadata> {
  const { channel: slug } = await params
  const channel = getChannel(slug)
  if (!channel) return {}
  return {
    title: { absolute: `${channel.name} · ${channel.tagline}` },
    description: channel.tagline,
    alternates: { canonical: `${SITE}/c/${channel.slug}` },
    openGraph: { title: channel.name, description: channel.tagline, type: "website" },
  }
}

async function ChannelHomeContent({ params }: { params: Promise<{ channel: string }> }) {
  const { channel: slug } = await params
  const channel = getChannel(slug)
  if (!channel) notFound()

  const videos = publicVideos(channel)
  const lead = leadStory(channel)
  const rest = videos.filter((v) => v.id !== lead?.id)
  const mostWatched = [...videos].filter((v) => v.views > 0).sort((a, b) => b.views - a.views).slice(0, 4)
  const shorts = publicShorts(channel)
  const live = getLiveBlog(channel.slug)

  const modules = channel.modules.filter((m) => m.enabled)

  return (
    <div className="pb-8">
      <div className="flex flex-col">
        {live && (
          <div className="border-b bg-muted/60">
            <Link
              href={`/c/${channel.slug}/live`}
              className="mx-auto flex max-w-[1280px] items-center gap-3 px-4 py-2.5 text-[14px] font-medium md:px-8"
            >
              <StatusBadge tone="live" />
              <span className="min-w-0 truncate">{live.title}</span>
              <span className="ml-auto hidden shrink-0 items-center gap-1 text-muted-foreground sm:inline-flex">
                Follow live <ChevronRight className="size-4" aria-hidden />
              </span>
            </Link>
          </div>
        )}
        {modules[0]?.id !== "lead" && <h1 className="sr-only">{channel.name}</h1>}
      </div>
      <div className="flex flex-col gap-16 md:gap-20">
      {modules.map((m) => {
        switch (m.id) {
          case "lead":
            return lead ? <LeadStory key="lead" channel={channel} video={lead} /> : null
          case "shorts":
            return <ShortsRow key="shorts" channel={channel} shorts={shorts} />
          case "sponsor":
            return <SponsorBand key="sponsor" />
          case "grid":
            return <ArticleGrid key="grid" channel={channel} videos={rest} mostWatched={mostWatched} />
          case "sections":
            return <SectionRows key="sections" channel={channel} videos={videos} />
        }
      })}
      </div>
    </div>
  )
}

// params are URL data: read them inside Suspense so the shared App Shell stays instant.
export default function ChannelHome({ params }: { params: Promise<{ channel: string }> }) {
  return (
    <Suspense fallback={<ChannelPageSkeleton variant="home" />}>
      <ChannelHomeContent params={params} />
    </Suspense>
  )
}
