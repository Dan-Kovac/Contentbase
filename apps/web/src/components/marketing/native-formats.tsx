import { Film, LayoutPanelTop, Newspaper, Smartphone, Trophy } from "lucide-react"
import { ShortCard, VideoThumb } from "@/components/brand/media"
import {
  ChapterSponsorCredit,
  ChapterSponsorSegment,
  HalftimeBreak,
  PresentedBy,
  SponsoredShortCard,
  StatCard,
} from "@/components/brand/native-ads"
import { getChannel, getShort, getSponsor, getVideo } from "@/lib/data"
import { channelStyle, formatDuration } from "@/lib/format"
import type { NativeFormat } from "@/lib/types"
import { cn } from "@/lib/utils"

/** The five Homestand Native Formats, in the order we present them. */
export const NATIVE_FORMATS: { id: NativeFormat; name: string; line: string; where: string; Icon: typeof Film }[] = [
  {
    id: "chapter_sponsor",
    name: "Chapter sponsor",
    line: "A brand owns a moment of the video.",
    where: "On the player timeline, in the chapter list and under the player while that chapter plays.",
    Icon: Film,
  },
  {
    id: "halftime",
    name: "Half-time break",
    line: "An editorial pause between article sections.",
    where: "Between two sections of an article, after a natural break. Never between a headline and its first paragraph.",
    Icon: Newspaper,
  },
  {
    id: "stat_card",
    name: "Stat card",
    line: "A sponsor message set as a scoreboard tile.",
    where: "In a row of key numbers, the same size as the editorial stat tiles beside it.",
    Icon: Trophy,
  },
  {
    id: "sponsored_short",
    name: "Sponsored short",
    line: "The same size as any other short.",
    where: "In the shorts row on a channel home and in the shorts feed, at most one in every eight.",
    Icon: Smartphone,
  },
  {
    id: "presented_by",
    name: "Presented by",
    line: "A sponsor credit on a lead story or section.",
    where: "Under the lead story on a channel home, or across the top of a section, for the length of a flight.",
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
    <div className="flex flex-col gap-5">
      {withCopy && <Lines n={3} />}
      <HalftimeBreak sponsor={sponsor} />
      {withCopy && (
        <div className="flex flex-col gap-3">
          <span className="h-3.5 w-2/5 rounded-full bg-foreground/80" aria-hidden />
          <Lines n={2} />
        </div>
      )}
    </div>
  )
}

export function StatCardExample({ editorial = true }: { editorial?: boolean }) {
  const sponsor = getSponsor("sp_brew")!
  return (
    <div className={cn("grid gap-3", editorial && "sm:grid-cols-2")}>
      {editorial && (
        <div className="flex min-h-[188px] flex-col justify-between gap-4 rounded-lg border p-5" style={{ borderTop: "4px solid var(--chan)" }}>
          <span className="text-[11px] font-bold uppercase tracking-[1px] text-muted-foreground">Key number</span>
          <div>
            <p className="text-[48px] font-extrabold leading-none tracking-[-1.5px]">14–6</p>
            <p className="mt-1.5 text-[14px] leading-5 text-muted-foreground">Centre bounces lost by Carlton in Round 7</p>
          </div>
          <span className="text-[13px] text-muted-foreground">Footy Fix analysis</span>
        </div>
      )}
      <StatCard sponsor={sponsor} />
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
  stat_card: () => <StatCardExample />,
  sponsored_short: () => <SponsoredShortExample />,
  presented_by: () => <PresentedByExample />,
}
