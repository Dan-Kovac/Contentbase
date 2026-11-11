import Link from "next/link"
import { ChevronRight } from "lucide-react"
import { ShortCard } from "@/components/brand/media"
import { SponsoredShortCard } from "@/components/brand/native-ads"
import { StatusBadge } from "@/components/brand/status-badge"
import { cn } from "@/lib/utils"
import type { Channel, HomeModule, Short, Video } from "@/lib/types"
import { getLiveBlog, type LiveBlog } from "./live-data"
import {
  channelStories,
  leadStory,
  publicShorts,
  shortPath,
  sponsorFor,
  videoStory,
  type Story,
} from "./lib"

export { ModuleHeading } from "./story"

export interface HomeData {
  channel: Channel
  lead?: Video
  leadStory?: Story
  /** Every public story (videos and standalone articles), newest first. */
  stories: Story[]
  shorts: Short[]
  live?: LiveBlog
  mostWatched: Story[]
  /** Enabled modules in the creator's order, with the sponsor break placed by the platform. */
  modules: HomeModule[]
}

/**
 * The creator orders and toggles modules; the platform fixes ad positions. The sponsor
 * module is the one Half-time break, and it always sits between two content modules: never
 * first, never last and never straight after the lead story.
 */
export function placeModules(channel: Channel): HomeModule[] {
  const on = channel.modules.filter((m) => m.enabled).map((m) => m.id)
  const content = on.filter((m) => m !== "sponsor")
  if (!on.includes("sponsor") || content.length < 2) return content
  let at = Math.max(1, on.indexOf("sponsor"))
  if (content[at - 1] === "lead") at += 1
  at = Math.min(at, content.length - 1)
  return [...content.slice(0, at), "sponsor", ...content.slice(at)]
}

export function homeData(channel: Channel): HomeData {
  const lead = leadStory(channel)
  const stories = channelStories(channel)
  return {
    channel,
    lead,
    leadStory: lead ? videoStory(channel, lead) : undefined,
    stories,
    shorts: publicShorts(channel),
    live: getLiveBlog(channel.slug),
    mostWatched: stories.filter((s) => s.views > 0).sort((a, b) => b.views - a.views).slice(0, 4),
    modules: placeModules(channel),
  }
}

/** Shorts with one sponsored card at the same size, after the third short (ADS-01). */
export function ShortsList({ channel, shorts, className }: { channel: Channel; shorts: Short[]; className?: string }) {
  const sponsor = sponsorFor("short")
  const sponsorAt = Math.min(3, shorts.length)
  const items: ({ kind: "short"; short: Short } | { kind: "ad" })[] = shorts.map((short) => ({ kind: "short", short }))
  items.splice(sponsorAt, 0, { kind: "ad" })
  return (
    <div className={cn("-mx-4 overflow-x-auto px-4 pb-3 md:-mx-8 md:px-8 [scrollbar-width:thin]", className)}>
      <ul className="flex w-max items-start gap-4">
        {items.map((item) =>
          item.kind === "ad" ? (
            <li key="sponsored" className="shrink-0">
              <SponsoredShortCard sponsor={sponsor} />
            </li>
          ) : (
            <li key={item.short.id} className="shrink-0">
              <ShortCard
                href={shortPath(channel, item.short)}
                title={item.short.title}
                tone={item.short.posterTone}
                src={item.short.poster}
                durationSec={item.short.durationSec}
              />
            </li>
          ),
        )}
      </ul>
    </div>
  )
}

export function LiveStrip({ channel, live, tone = "light" }: { channel: Channel; live: LiveBlog; tone?: "light" | "dark" }) {
  return (
    <div className={cn("border-b", tone === "light" ? "bg-muted/60" : "border-white/10 bg-black")}>
      <Link
        href={`/c/${channel.slug}/live`}
        className="mx-auto flex max-w-[1280px] items-center gap-3 px-4 py-2.5 text-[14px] font-medium outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-ring md:px-8"
      >
        <StatusBadge tone="live" />
        <span className="min-w-0 truncate">{live.title}</span>
        <span className="hidden shrink-0 text-muted-foreground md:inline">· Updated {live.updatedAt}</span>
        <span className="ml-auto hidden shrink-0 items-center gap-1 text-muted-foreground sm:inline-flex">
          Follow live <ChevronRight className="size-4" aria-hidden />
        </span>
      </Link>
    </div>
  )
}
