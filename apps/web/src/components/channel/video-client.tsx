"use client"

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react"
import { Search } from "lucide-react"
import { ChapterSponsorCredit, HalftimeBreak } from "@/components/brand/native-ads"
import { Input } from "@/components/ui/input"
import { formatDuration } from "@/lib/format"
import { cn } from "@/lib/utils"
import type { Chapter, TranscriptLine } from "@/lib/types"
import type { SlotPlan, Viewer } from "./lib"
import { useViewer } from "./viewer"

interface Ctx {
  time: number
  playing: boolean
  started: boolean
  speed: number
  setSpeed: (s: number) => void
  seek: (t: number) => void
  toggle: () => void
  viewer: Viewer
  setViewer: (v: Viewer) => void
  plan: SlotPlan
  /** Index of the sponsored chapter, or -1. */
  sponsoredChapter: number
}

const VideoCtx = createContext<Ctx | null>(null)

export function useVideo() {
  const ctx = useContext(VideoCtx)
  if (!ctx) throw new Error("useVideo must sit inside VideoPageProvider")
  return ctx
}

export function VideoPageProvider({
  duration,
  plans,
  sponsoredChapter,
  children,
}: {
  duration: number
  plans: Record<Viewer, SlotPlan>
  sponsoredChapter: number
  children: React.ReactNode
}) {
  const [time, setTime] = useState(0)
  const [playing, setPlaying] = useState(false)
  const [started, setStarted] = useState(false)
  const [speed, setSpeed] = useState(1)
  const { viewer, setViewer } = useViewer()

  useEffect(() => {
    if (!playing) return
    const id = window.setInterval(() => {
      setTime((t) => {
        const next = t + speed
        if (next >= duration) {
          setPlaying(false)
          return duration
        }
        return next
      })
    }, 1000)
    return () => window.clearInterval(id)
  }, [playing, duration, speed])

  const seek = useCallback(
    (t: number) => {
      setTime(Math.max(0, Math.min(duration, Math.round(t))))
      setStarted(true)
      setPlaying(true)
    },
    [duration],
  )
  const toggle = useCallback(() => {
    setStarted(true)
    setPlaying((p) => !p)
  }, [])

  const value = useMemo<Ctx>(
    () => ({ time: Math.floor(time), playing, started, speed, setSpeed, seek, toggle, viewer, setViewer, plan: plans[viewer], sponsoredChapter }),
    [time, playing, started, speed, seek, toggle, viewer, setViewer, plans, sponsoredChapter],
  )
  return <VideoCtx.Provider value={value}>{children}</VideoCtx.Provider>
}

export function ChapterList({ chapters, duration }: { chapters: Chapter[]; duration: number }) {
  const { time, seek, started, plan, sponsoredChapter } = useVideo()
  if (!chapters.length) return null
  return (
    <nav aria-label="Chapters" className="flex flex-col">
      <h2 className="kicker mb-3 text-foreground">
        Chapters <span className="font-medium normal-case tracking-normal text-muted-foreground">· {chapters.length}</span>
      </h2>
      <ol className="flex flex-col border-t">
        {chapters.map((c, i) => {
          const end = chapters[i + 1]?.start ?? duration
          const active = started && time >= c.start && time < end
          const progress = active ? ((time - c.start) / (end - c.start)) * 100 : started && time >= end ? 100 : 0
          return (
            <li key={c.start} className={cn("relative border-b", active && "bg-accent")}>
              <button
                type="button"
                onClick={() => seek(c.start)}
                aria-current={active ? "true" : undefined}
                className="flex w-full items-baseline gap-3 px-2 py-3 text-left text-[15px] font-medium outline-none hover:bg-accent focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-ring"
              >
                <span className="w-14 shrink-0 font-mono text-[13px] text-muted-foreground tabular">{formatDuration(c.start)}</span>
                <span className="min-w-0 flex-1">{c.title}</span>
                <span className="shrink-0 font-mono text-[12px] text-muted-foreground tabular">{formatDuration(end - c.start)}</span>
              </button>
              {i === sponsoredChapter && (
                <ChapterSponsorCredit key={plan.chapter.id} sponsor={plan.chapter} chapter="This chapter" className="px-2 pb-3 pl-[76px] text-[12px]" />
              )}
              <span className="absolute bottom-0 left-0 h-[2px] bg-[var(--chan)]" style={{ width: `${progress}%` }} aria-hidden />
            </li>
          )
        })}
      </ol>
    </nav>
  )
}

/** The Half-time break: an image block in the article column, so it is exactly the column's width. */
export function HalftimeSlot() {
  const { plan } = useVideo()
  return <HalftimeBreak key={plan.halftime.id} sponsor={plan.halftime} />
}

function highlight(text: string, q: string) {
  if (!q) return text
  const i = text.toLowerCase().indexOf(q.toLowerCase())
  if (i < 0) return text
  return (
    <>
      {text.slice(0, i)}
      <mark className="rounded-[2px] bg-[var(--chan)] px-0.5 text-[var(--chan-on)]">{text.slice(i, i + q.length)}</mark>
      {text.slice(i + q.length)}
    </>
  )
}

/**
 * SEO-06: the whole transcript is in the server HTML inside a closed <details>, so it is
 * indexed but collapsed. Search filters lines; timestamps jump the player.
 */
export function Transcript({ lines }: { lines: TranscriptLine[] }) {
  const { seek } = useVideo()
  const [q, setQ] = useState("")
  const query = q.trim()
  const shown = query ? lines.filter((l) => l.text.toLowerCase().includes(query.toLowerCase())) : lines
  if (!lines.length) return null
  return (
    <details className="group rounded-lg border bg-card font-sans">
      <summary className="flex cursor-pointer list-none items-center justify-between gap-4 px-4 py-4 text-[15px] font-semibold outline-none focus-visible:ring-2 focus-visible:ring-ring md:px-5 [&::-webkit-details-marker]:hidden">
        <span>Transcript</span>
        <span className="text-[13px] font-medium text-muted-foreground group-open:hidden">Show transcript</span>
        <span className="hidden text-[13px] font-medium text-muted-foreground group-open:inline">Hide</span>
      </summary>
      <div className="border-t px-4 pb-4 pt-4 md:px-5">
        <div className="relative mb-4">
          <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" aria-hidden />
          <Input
            type="search"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search the transcript"
            aria-label="Search the transcript"
            className="pl-9"
          />
        </div>
        {query && (
          <p className="mb-3 text-[13px] text-muted-foreground" aria-live="polite">
            {shown.length === 1 ? "1 line" : `${shown.length} lines`} match “{query}”
          </p>
        )}
        <ol className="flex flex-col gap-3">
          {shown.map((l) => (
            <li key={l.start} className="grid grid-cols-[64px_1fr] gap-3">
              <button
                type="button"
                onClick={() => seek(l.start)}
                className="h-fit rounded-[2px] text-left font-mono text-[13px] text-muted-foreground underline-offset-2 outline-none hover:text-foreground hover:underline focus-visible:ring-2 focus-visible:ring-ring tabular"
                aria-label={`Play from ${formatDuration(l.start)}`}
              >
                {formatDuration(l.start)}
              </button>
              <p className="font-[family-name:var(--chan-body)] text-[16px] leading-[25px]">
                <span className="font-sans text-[13px] font-semibold">{l.speaker} </span>
                {highlight(l.text, query)}
              </p>
            </li>
          ))}
        </ol>
      </div>
    </details>
  )
}
