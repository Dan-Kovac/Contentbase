import { Film, LayoutGrid, LayoutPanelTop, Newspaper, Smartphone } from "lucide-react"
import { ShortCard, VideoThumb } from "@/components/brand/media"
import {
  ChapterSponsorCredit,
  ChapterSponsorSegment,
  HalftimeBreak,
  PresentedBy,
  SponsoredShortCard,
  SponsoredStoryCard,
} from "@/components/brand/native-ads"
import { videoStory } from "@/components/channel/lib"
import { StoryCard } from "@/components/channel/story"
import { getChannel, getShort, getSponsor, getVideo } from "@/lib/data"
import { channelStyle, formatDuration } from "@/lib/format"
import type { NativeFormat } from "@/lib/types"
import { cn } from "@/lib/utils"

/** The five Homestand Native Formats, in the order we present them. */
export const NATIVE_FORMATS: { id: NativeFormat; name: string; line: string; where: string; Icon: typeof Film }[] = [
  {
    id: "chapter_sponsor",
    name: "Chapter sponsor",
    line: "A brand owns a chapter of the video.",
    where: "One chapter in the chapter list and one segment of the player timeline. The same shape as every other chapter.",
    Icon: Film,
  },
  {
    id: "halftime",
    name: "Half-time break",
    line: "A pause between article sections, the size of a photo in the article.",
    where: "Between two sections, the width of the article column. Never between a headline and its first paragraph.",
    Icon: Newspaper,
  },
  {
    id: "sponsored_story",
    name: "Sponsored story",
    line: "A story card among the stories.",
    where: "One cell of a story grid on the channel home, the same size as the stories beside it.",
    Icon: LayoutGrid,
  },
  {
    id: "sponsored_short",
    name: "Sponsored short",
    line: "A short among the shorts.",
    where: "In the shorts row and the shorts feed, exactly the size of every other short. At most one in every eight.",
    Icon: Smartphone,
  },
  {
    id: "presented_by",
    name: "Presented by",
    line: "A sponsor credit, set like a byline.",
    where: "Under the lead story on a channel home, for the length of a flight. One line, never a box.",
    Icon: LayoutPanelTop,
  },
]

export const FORMAT_LABEL: Record<NativeFormat, string> = Object.fromEntries(NATIVE_FORMATS.map((f) => [f.id, f.name])) as Record<NativeFormat, string>

/** A quiet "page" ground so each format is seen in its setting. */
export function FormatStage({ className, children }: { className?: string; children: React.ReactNode }) {
  const ch = getChannel("footyfix")!
  return (
    <div className={cn("rounded-lg border bg-background p-4 text-foreground sm:p-6", className)} style={channelStyle(ch.accentHex, ch.pairing)}>
      {children}
    </div>
  )
}

/** Paragraph placeholder lines, standing in for article copy around a format. */
function Lines({ n = 3, className }: { n?: number; className?: string }) {
  return (
    <div className={cn("flex flex-col gap-2", className)} aria-hidden>
      {Array.from({ length: n }, (_, i) => (
        <span key={i} className={cn("h-2.5 rounded-full bg-muted", i === n - 1 ? "w-3/5" : "w-full")} />
      ))}
    </div>
  )
}

export function ChapterSponsorExample() {
  const v = getVideo("v_coxplate")!
  const sponsor = getSponsor("sp_harbour")!
  const sponsored = 1
  const from = v.chapters[sponsored].start / v.durationSec
  const to = v.chapters[sponsored + 1].start / v.durationSec
  return (
    <div className="flex flex-col gap-3">
      <VideoThumb src={v.poster} tone={v.posterTone} durationSec={v.durationSec} />
      <div className="relative h-1.5 rounded-full bg-muted" aria-hidden>
        <span className="absolute inset-y-0 left-0 w-[44%] rounded-full bg-foreground/60" />
        <ChapterSponsorSegment sponsor={sponsor} from={from} to={to} />
      </div>
      <ol className="flex flex-col divide-y rounded-md border text-[13px]">
        {v.chapters.map((c, i) => (
          <li key={c.start} className={cn("flex flex-col gap-1.5 px-3 py-2", i === sponsored && "bg-muted/60")}>
            <span className="flex items-center gap-3">
              <span className="font-mono text-muted-foreground">{formatDuration(c.start)}</span>
              <span className="font-semibold">{c.title}</span>
            </span>
            {i === sponsored && <ChapterSponsorCredit sponsor={sponsor} chapter={c.title} />}
          </li>
        ))}
      </ol>
    </div>
  )
}

export function HalftimeExample({ withCopy = true }: { withCopy?: boolean }) {
  const sponsor = getSponsor("sp_ute")!
  return (
    <div className="mx-auto flex max-w-[68ch] flex-col">
      {withCopy && <Lines n={3} />}
      <HalftimeBreak sponsor={sponsor} className="my-6" />
      {withCopy && (
        <div className="flex flex-col gap-3">
          <span className="h-3.5 w-2/5 rounded-full bg-foreground/80" aria-hidden />
          <Lines n={2} />
        </div>
      )}
    </div>
  )
}

export function SponsoredStoryExample({ context = true }: { context?: boolean }) {
  const ch = getChannel("footyfix")!
  const sponsor = getSponsor("sp_boots")!
  const a = videoStory(ch, getVideo("v_blues")!)
  const b = videoStory(ch, getVideo("v_round7")!)
  if (!context) return <SponsoredStoryCard sponsor={sponsor} size="sm" />
  return (
    <div className="grid gap-x-5 gap-y-8 sm:grid-cols-3">
      <StoryCard story={a} size="sm" />
      <SponsoredStoryCard sponsor={sponsor} size="sm" />
      <StoryCard story={b} size="sm" />
    </div>
  )
}

export function SponsoredShortExample({ context = true }: { context?: boolean }) {
  const sponsor = getSponsor("sp_boots")!
  const a = getShort("s_yt1")!
  const b = getShort("s_round7a")!
  if (!context) return <SponsoredShortCard sponsor={sponsor} fill />
  return (
    <div className="mx-auto grid max-w-[540px] grid-cols-3 gap-3">
      <ShortCard href="/c/footyfix/shorts" title={a.title} src={a.poster} tone={a.posterTone} durationSec={a.durationSec} className="w-full" />
      <SponsoredShortCard sponsor={sponsor} fill />
      <ShortCard href="/c/footyfix/shorts" title={b.title} src={b.poster} tone={b.posterTone} durationSec={b.durationSec} className="w-full" />
    </div>
  )
}

export function PresentedByExample() {
  const v = getVideo("v_round7")!
  const sponsor = getSponsor("sp_ute")!
  return (
    <div className="grid gap-4 sm:grid-cols-[1.2fr_1fr] sm:items-center">
      <VideoThumb src={v.poster} tone={v.posterTone} durationSec={v.durationSec} />
      <div className="flex flex-col gap-2">
        <span className="kicker">Lead story</span>
        <p className="text-[20px] font-extrabold leading-[24px] tracking-[-0.02em]">{v.article.headline}</p>
        <p className="line-clamp-2 font-serif text-[14px] leading-[21px] text-muted-foreground">{v.article.standfirst}</p>
        <PresentedBy sponsor={sponsor} className="mt-2" />
      </div>
    </div>
  )
}

export const FORMAT_EXAMPLE: Record<NativeFormat, () => React.ReactNode> = {
  chapter_sponsor: () => <ChapterSponsorExample />,
  halftime: () => <HalftimeExample />,
  sponsored_story: () => <SponsoredStoryExample />,
  sponsored_short: () => <SponsoredShortExample />,
  presented_by: () => <PresentedByExample />,
}
