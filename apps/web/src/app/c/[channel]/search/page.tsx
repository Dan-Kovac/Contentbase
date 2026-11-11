import type { Metadata } from "next"
import { Suspense } from "react"
import { notFound } from "next/navigation"
import {
  DISPLAY,
  blockText,
  displayDate,
  publicBlocks,
  publicShorts,
  publicVideos,
  sectionLabel,
  shortPath,
  shortSourceLabel,
  videoPath,
} from "@/components/channel/lib"
import { ChannelSearch, SearchFromParams, type SearchDoc } from "@/components/channel/search-client"
import { ChannelPageSkeleton } from "@/components/channel/skeleton"
import { getChannel } from "@/lib/data"
import { formatDuration } from "@/lib/format"
import { cn } from "@/lib/utils"

const SUGGESTIONS: Record<string, string[]> = {
  footyfix: ["Carlton", "centre bounce", "Round 7", "Cripps", "pre-season"],
  trackside: ["Cox Plate", "barrier", "Flemington", "trainer", "Moonee Valley"],
}

export async function generateMetadata({ params }: { params: Promise<{ channel: string }> }): Promise<Metadata> {
  const { channel: slug } = await params
  const channel = getChannel(slug)
  if (!channel) return {}
  // Search results are not indexed.
  return { title: { absolute: `Search · ${channel.name}` }, robots: { index: false, follow: true } }
}

async function SearchPageContent({ params }: { params: Promise<{ channel: string }> }) {
  const { channel: slug } = await params
  const channel = getChannel(slug)
  if (!channel) notFound()

  const docs: SearchDoc[] = []
  for (const v of publicVideos(channel)) {
    const meta = `${sectionLabel(channel, v.section)} · ${displayDate(v)}`
    docs.push({
      id: v.id,
      type: "video",
      title: v.title,
      snippet: v.description,
      meta,
      href: videoPath(channel, v),
      tone: v.posterTone,
      durationLabel: formatDuration(v.durationSec),
      haystack: [v.title, v.description, ...(v.exclusive ? [] : v.transcript.map((l) => l.text))].join(" "),
    })
    docs.push({
      id: v.id,
      type: "article",
      title: v.article.headline,
      snippet: v.article.standfirst,
      meta: `${v.article.author} · ${meta} · ${v.article.readMinutes} min read`,
      href: `${videoPath(channel, v)}#article`,
      tone: v.posterTone,
      haystack: [v.article.headline, v.article.standfirst, ...(v.exclusive ? [] : publicBlocks(v).map(blockText))].join(" "),
    })
  }
  for (const s of publicShorts(channel)) {
    docs.push({
      id: s.id,
      type: "short",
      title: s.title,
      snippet: s.caption,
      meta: shortSourceLabel(s),
      href: shortPath(channel, s),
      tone: s.posterTone,
      durationLabel: formatDuration(s.durationSec),
      haystack: [s.title, s.caption].join(" "),
    })
  }
  const suggestions = SUGGESTIONS[channel.slug] ?? channel.sections.map((s) => s.label)

  return (
    <div className="mx-auto max-w-[920px] px-4 pt-10 md:px-8 md:pt-14">
      <h1 className={cn(DISPLAY, "mb-6 text-[40px] leading-[1.05] md:text-[56px]")}>Search</h1>
      <Suspense fallback={<ChannelSearch docs={docs} channelName={channel.name} suggestions={suggestions} />}>
        <SearchFromParams docs={docs} channelName={channel.name} suggestions={suggestions} />
      </Suspense>
    </div>
  )
}

// params are URL data: read them inside Suspense so the shared App Shell stays instant.
export default function SearchPage({ params }: { params: Promise<{ channel: string }> }) {
  return (
    <Suspense fallback={<ChannelPageSkeleton variant="page" />}>
      <SearchPageContent params={params} />
    </Suspense>
  )
}
