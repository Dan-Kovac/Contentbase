"use client"

import Link from "next/link"
import { useState } from "react"
import { toast } from "sonner"
import {
  AlignLeft,
  CalendarClock,
  Check,
  ChevronRight,
  ListOrdered,
  Search,
  Smartphone,
  TriangleAlert,
  Undo2,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { VideoThumb } from "@/components/brand/media"
import { StatusBadge } from "@/components/brand/status-badge"
import { cn } from "@/lib/utils"
import { ScheduleDialog } from "./schedule-dialog"
import type { DraftPack } from "./lib"

type Outcome = { kind: "published" } | { kind: "scheduled"; when: string }

function Generated({ pack }: { pack: DraftPack }) {
  const items = [
    { icon: AlignLeft, label: `Article · ${pack.readMinutes} min read` },
    { icon: Smartphone, label: `${pack.shortCount} ${pack.shortCount === 1 ? "short" : "shorts"}` },
    { icon: Search, label: "SEO" },
    { icon: ListOrdered, label: `${pack.chapterCount} chapters` },
  ]
  return (
    <ul className="flex flex-wrap gap-x-4 gap-y-1.5" aria-label="In this draft pack">
      {items.map(({ icon: Icon, label }) => (
        <li key={label} className="flex items-center gap-1.5 text-[13px] text-muted-foreground">
          <Icon className="size-3.5" aria-hidden />
          {label}
        </li>
      ))}
    </ul>
  )
}

/** The Ready to review queue. `compact` is the studio home version (Review only). */
export function ReviewQueue({ packs, compact = false }: { packs: DraftPack[]; compact?: boolean }) {
  const [outcomes, setOutcomes] = useState<Record<string, Outcome>>({})
  const [scheduling, setScheduling] = useState<DraftPack | null>(null)

  const publish = (p: DraftPack) => {
    if (p.flags.length) {
      toast.error(`${p.flags.length} compliance flags to resolve`, {
        description: "Fix or dismiss them in the review before you publish.",
      })
      return
    }
    setOutcomes((o) => ({ ...o, [p.id]: { kind: "published" } }))
    toast.success("Published", { description: `${p.headline} is live with its article, shorts and SEO.` })
  }

  const undo = (id: string) =>
    setOutcomes((o) => {
      const next = { ...o }
      delete next[id]
      return next
    })

  if (!packs.length) {
    return (
      <div className="grid place-items-center rounded-lg border border-dashed px-6 py-14 text-center">
        <span className="grid size-10 place-items-center rounded-full bg-muted">
          <Check className="size-5" aria-hidden />
        </span>
        <p className="mt-3 font-semibold">You&apos;re all caught up</p>
        <p className="mt-1 max-w-sm text-sm text-muted-foreground">
          New YouTube uploads arrive here as draft packs. Nothing goes live until you publish.
        </p>
      </div>
    )
  }

  return (
    <>
      <ul className="grid gap-3">
        {packs.map((p) => {
          const outcome = outcomes[p.id]
          return (
            <li
              key={p.id}
              className={cn(
                "group/pack rounded-lg border bg-card transition-colors",
                outcome && "bg-muted/40",
              )}
            >
              <div className={cn("flex gap-4 p-3 sm:p-4", compact ? "flex-row items-center" : "flex-col sm:flex-row")}>
                <Link
                  href={`/studio/review/${p.id}`}
                  className={cn(
                    "shrink-0 rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
                    compact ? "w-[112px] sm:w-[148px]" : "w-full sm:w-[220px]",
                  )}
                  aria-label={`Review ${p.headline}`}
                  tabIndex={-1}
                >
                  <VideoThumb tone={p.posterTone} src={p.poster} durationSec={p.durationSec} />
                </Link>
                <div className="flex min-w-0 flex-1 flex-col gap-2">
                  <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-muted-foreground">
                    <span className="font-semibold text-foreground">{p.channelName}</span>
                    <span aria-hidden>·</span>
                    <span>{p.section}</span>
                    <span aria-hidden>·</span>
                    <span>{p.source === "youtube" ? "From YouTube" : "Uploaded"} {p.sourcePublishedAt}</span>
                  </div>
                  <Link
                    href={`/studio/review/${p.id}`}
                    className="line-clamp-2 text-[17px] font-semibold leading-[22px] tracking-[-0.2px] hover:underline focus-visible:underline focus-visible:outline-none"
                  >
                    {p.headline}
                  </Link>
                  {!compact && <p className="line-clamp-2 max-w-[68ch] text-sm text-muted-foreground">{p.standfirst}</p>}
                  {!compact && <Generated pack={p} />}
                  {p.flags.length > 0 && !outcome && (
                    <p className="flex items-center gap-1.5 text-[13px] font-medium text-destructive">
                      <TriangleAlert className="size-3.5 shrink-0" aria-hidden />
                      {p.flags.length} compliance flags: {p.flags.map((f) => (f.kind === "odds" ? "odds mentioned" : f.kind === "bet_now" ? "“bet now” language" : f.kind.replace("_", " "))).join(", ")}
                    </p>
                  )}
                  {compact && !p.flags.length && (
                    <p className="hidden text-[13px] text-muted-foreground sm:block">
                      Article, {p.shortCount} shorts, SEO and {p.chapterCount} chapters
                    </p>
                  )}
                </div>
                {compact && (
                  <Button asChild size="sm" variant={outcome ? "outline" : "default"} className="hidden shrink-0 sm:inline-flex">
                    <Link href={`/studio/review/${p.id}`}>
                      Review <ChevronRight />
                    </Link>
                  </Button>
                )}
              </div>

              {!compact && (
                <div className="flex flex-wrap items-center justify-between gap-2 border-t px-3 py-2.5 sm:px-4">
                  <div className="min-h-8 text-[13px]">
                    {outcome?.kind === "published" && (
                      <span className="flex items-center gap-2">
                        <StatusBadge tone="published" /> Live on your channel
                      </span>
                    )}
                    {outcome?.kind === "scheduled" && (
                      <span className="flex items-center gap-2">
                        <StatusBadge tone="scheduled" /> <span className="tabular">{outcome.when}</span>
                      </span>
                    )}
                    {!outcome && (
                      <span className="flex h-8 items-center text-muted-foreground">Nothing goes live until you publish.</span>
                    )}
                  </div>
                  <div className="flex flex-wrap items-center gap-2">
                    {outcome ? (
                      <Button size="sm" variant="ghost" onClick={() => undo(p.id)}>
                        <Undo2 /> Undo
                      </Button>
                    ) : (
                      <>
                        <Button size="sm" variant="ghost" onClick={() => (p.flags.length ? publish(p) : setScheduling(p))}>
                          <CalendarClock /> Schedule
                        </Button>
                        <Button size="sm" variant="outline" onClick={() => publish(p)}>
                          Publish all
                        </Button>
                        <Button size="sm" asChild>
                          <Link href={`/studio/review/${p.id}`}>Review</Link>
                        </Button>
                      </>
                    )}
                  </div>
                </div>
              )}
              {compact && (
                <div className="border-t px-3 py-2 sm:hidden">
                  <Button asChild size="sm" className="w-full">
                    <Link href={`/studio/review/${p.id}`}>Review</Link>
                  </Button>
                </div>
              )}
            </li>
          )
        })}
      </ul>
      {scheduling && (
        <ScheduleDialog
          open={!!scheduling}
          onOpenChange={(o) => !o && setScheduling(null)}
          itemTitle={scheduling.headline}
          onSchedule={(when) => {
            setOutcomes((o) => ({ ...o, [scheduling.id]: { kind: "scheduled", when } }))
            toast.success("Scheduled", { description: `${scheduling.headline} goes live ${when}.` })
          }}
        />
      )}
    </>
  )
}
