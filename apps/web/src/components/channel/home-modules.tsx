import Link from "next/link"
import { ChevronRight } from "lucide-react"
import { ShortCard } from "@/components/brand/media"
import { StatusBadge } from "@/components/brand/status-badge"
import { cn } from "@/lib/utils"
import type { Channel, HomeModule, Short, Sponsor, Video } from "@/lib/types"
import { getLiveBlog, type LiveBlog } from "./live-data"
import {
  channelStories,
  leadStory,
  publicShorts,
  shortPath,
  slotOptions,
  videoStory,
  type Story,
  type Viewer,
} from "./lib"
import { SponsorSlot } from "./viewer"
import { ScrollRow } from "./scroll-row"

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
  /** Enabled modules in the creator's order. Sponsors have no module of their own. */
  modules: HomeModule[]
  /**
   * The home page carries three sponsor units at most: "Presented by" on the lead, one sponsored
   * short in the shorts row and one sponsored story in a story grid (the first section row, or the
   * Latest grid when there are no sections). Each one is decided per viewer state on the server.
   */
  sponsors: Record<"presented" | "short" | "story", Record<Viewer, Sponsor>>
  /** Which module carries the sponsored story. */
  storyIn: "sections" | "grid"
}

export function placeModules(channel: Channel): HomeModule[] {
  return channel.modules.filter((m) => m.enabled).map((m) => m.id)
}

export function homeData(channel: Channel): HomeData {
  const lead = leadStory(channel)
  const stories = channelStories(channel)
  const modules = placeModules(channel)
  return {
    channel,
    lead,
    leadStory: lead ? videoStory(channel, lead) : undefined,
    stories,
    shorts: publicShorts(channel),
    live: getLiveBlog(channel.slug),
    mostWatched: stories.filter((s) => s.views > 0).sort((a, b) => b.views - a.views).slice(0, 4),
    modules,
    sponsors: {
      presented: slotOptions(channel, "presented"),
      short: slotOptions(channel, "short"),
      story: slotOptions(channel, "story"),
    },
    storyIn: modules.includes("sections") && channel.sections.some((s) => stories.filter((x) => x.section === s.slug).length >= 2) ? "sections" : "grid",
  }
}

/** Shorts with one sponsored short after the third, exactly the size of the others (ADS-01). */
export function ShortsList({
  channel,
  shorts,
  sponsor,
  className,
}: {
  channel: Channel
  shorts: Short[]
  sponsor?: Record<Viewer, Sponsor>
  className?: string
}) {
  const sponsorAt = Math.min(3, shorts.length)
  const items: ({ kind: "short"; short: Short } | { kind: "ad" })[] = shorts.map((short) => ({ kind: "short", short }))
  if (sponsor) items.splice(sponsorAt, 0, { kind: "ad" })
  return (
    <ScrollRow label="shorts" className={cn("-mx-4 overflow-x-auto px-4 pb-3 md:-mx-8 md:px-8 [scrollbar-width:thin]", className)}>
      <ul className="flex w-max items-start gap-4">
        {items.map((item) =>
          item.kind === "ad" ? (
            <li key="sponsored" className="shrink-0">
              {sponsor && <SponsorSlot format="short" options={sponsor} />}
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
    </ScrollRow>
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
