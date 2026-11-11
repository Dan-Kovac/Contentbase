"use client"

import { createContext, useContext, useEffect, useMemo, useRef, useState } from "react"
import { MonitorPlay, Pause, Play, Search, SkipForward, SquarePlay } from "lucide-react"
import { toast } from "sonner"
import { AdSlot } from "@/components/brand/ad-slot"
import { VideoThumb } from "@/components/brand/media"
import { Input } from "@/components/ui/input"
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"
import { formatDuration } from "@/lib/format"
import { cn } from "@/lib/utils"
import type { Chapter, ChannelMode, TranscriptLine } from "@/lib/types"

export type PreviewState = "logged_out" | "verified" | "opted_out"

interface Ctx {
  time: number
  playing: boolean
  started: boolean
  seek: (t: number) => void
  toggle: () => void
  preview: PreviewState
  setPreview: (p: PreviewState) => void
}

const VideoCtx = createContext<Ctx | null>(null)

function useVideo() {
  const ctx = useContext(VideoCtx)
  if (!ctx) throw new Error("useVideo must sit inside VideoPageProvider")
  return ctx
}

export function VideoPageProvider({ duration, children }: { duration: number; children: React.ReactNode }) {
  const [time, setTime] = useState(0)
  const [playing, setPlaying] = useState(false)
  const [started, setStarted] = useState(false)
  const [preview, setPreview] = useState<PreviewState>("logged_out")

  useEffect(() => {
    if (!playing) return
    const id = window.setInterval(() => {
      setTime((t) => {
        if (t + 1 >= duration) {
          setPlaying(false)
          return duration
        }
        return t + 1
      })
    }, 1000)
    return () => window.clearInterval(id)
  }, [playing, duration])

  const value = useMemo<Ctx>(
    () => ({
      time,
      playing,
      started,
      seek: (t) => {
        setTime(t)
        setStarted(true)
        setPlaying(true)
      },
      toggle: () => {
        setStarted(true)
        setPlaying((p) => !p)
      },
      preview,
      setPreview,
    }),
    [time, playing, started, preview],
  )
  return <VideoCtx.Provider value={value}>{children}</VideoCtx.Provider>
}

/**
 * Player area. YouTube-sourced videos play in the YouTube embedded player: we may not re-host
 * them, and our own pre-roll cannot run inside a YouTube embed (YouTube's ads apply there).
 * Uploaded videos play in the Homestand player (Mux), which may show one non-wagering
 * pre-roll (ADS-01; wagering pre-roll is not offered in the MVP).
 * Sample YouTube IDs are placeholders, so the prototype simulates playback on the poster.
 */
export function Player({
  title,
  tone,
  duration,
  chapters,
  source,
}: {
  title: string
  tone: string
  duration: number
  chapters: Chapter[]
  source: "youtube" | "upload"
}) {
  const { time, playing, started, toggle, seek } = useVideo()
  const [preroll, setPreroll] = useState<number | null>(null)
  const prerollDone = useRef(false)

  useEffect(() => {
    if (preroll === null) return
    if (preroll <= 0) {
      setPreroll(null)
      prerollDone.current = true
      seek(0)
      return
    }
    const id = window.setTimeout(() => setPreroll((p) => (p === null ? null : p - 1)), 1000)
    return () => window.clearTimeout(id)
  }, [preroll, seek])

  const onPlay = () => {
    if (source === "upload" && !prerollDone.current && !started) {
      setPreroll(5)
      return
    }
    toggle()
  }
  const current = [...chapters].reverse().find((c) => c.start <= time)

  return (
    <div className="flex flex-col gap-2">
      <div className="relative">
        <VideoThumb tone={tone} className="rounded-lg">
          {preroll !== null ? (
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-black/85 p-4 text-white">
              <span className="text-[11px] font-bold uppercase tracking-[1px] text-white/70">Advertisement · Pre-roll</span>
              <span className="text-center text-[15px] font-semibold">Southern Cross Utes</span>
              <span className="text-[13px] text-white/70 tabular" aria-live="polite">Your video starts in {preroll}</span>
              <button
                type="button"
                onClick={() => setPreroll(0)}
                className="mt-1 inline-flex h-8 items-center gap-1.5 rounded-md border border-white/40 px-3 text-[13px] font-semibold hover:bg-white/10 focus-visible:ring-2 focus-visible:ring-white focus-visible:outline-none"
              >
                <SkipForward className="size-4" aria-hidden /> Skip ad
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={onPlay}
              aria-label={playing ? `Pause ${title}` : `Play ${title}`}
              className="absolute inset-0 z-10 grid place-items-center outline-none focus-visible:ring-4 focus-visible:ring-inset focus-visible:ring-white"
            >
              <span
                className={cn(
                  "grid size-16 place-items-center rounded-full text-white backdrop-blur-sm transition-opacity md:size-20",
                  source === "youtube" ? "bg-[#c4302b]/90" : "bg-black/50",
                  playing && "opacity-0 hover:opacity-100",
                )}
              >
                {playing ? <Pause className="size-7 fill-current" /> : <Play className="ml-1 size-7 fill-current md:size-8" />}
              </span>
            </button>
          )}
          {started && preroll === null && (
            <div className="absolute inset-x-0 bottom-0 z-20 bg-gradient-to-t from-black/80 to-transparent px-3 pb-2 pt-8 text-white">
              <div className="mb-1.5 flex items-center justify-between text-[12px] font-medium">
                <span className="truncate">{current?.title}</span>
                <span className="font-mono tabular">
                  {formatDuration(time)} / {formatDuration(duration)}
                </span>
              </div>
              <div className="relative h-1 rounded-full bg-white/30">
                <div className="absolute inset-y-0 left-0 rounded-full bg-[var(--chan)]" style={{ width: `${(time / duration) * 100}%` }} />
                {chapters.slice(1).map((c) => (
                  <span key={c.start} className="absolute top-0 h-1 w-0.5 bg-black/70" style={{ left: `${(c.start / duration) * 100}%` }} aria-hidden />
                ))}
              </div>
            </div>
          )}
          {!started && preroll === null && (
            <span className="absolute bottom-2 right-2 z-20 rounded-[2px] bg-black/80 px-1.5 py-0.5 font-mono text-xs font-medium text-white tabular">
              {formatDuration(duration)}
            </span>
          )}
        </VideoThumb>
      </div>
      <p className="flex items-center gap-1.5 text-[12px] text-muted-foreground">
        {source === "youtube" ? (
          <>
            <SquarePlay className="size-4" aria-hidden /> Plays in the YouTube player. Captions available.
          </>
        ) : (
          <><MonitorPlay className="size-4" aria-hidden /> Plays in the Homestand player. Captions available.</>
        )}
      </p>
    </div>
  )
}

export function ChapterList({ chapters, duration }: { chapters: Chapter[]; duration: number }) {
  const { time, seek, started } = useVideo()
  if (!chapters.length) return null
  return (
    <nav aria-label="Chapters" className="flex flex-col">
      <h2 className="kicker mb-3 text-foreground">Chapters</h2>
      <ol className="flex flex-col border-t">
        {chapters.map((c, i) => {
          const end = chapters[i + 1]?.start ?? duration
          const active = started && time >= c.start && time < end
          return (
            <li key={c.start} className="border-b">
              <button
                type="button"
                onClick={() => seek(c.start)}
                aria-current={active ? "true" : undefined}
                className={cn(
                  "flex w-full items-baseline gap-3 px-2 py-3 text-left text-[15px] font-medium outline-none hover:bg-accent focus-visible:ring-2 focus-visible:ring-ring",
                  active && "bg-accent",
                )}
              >
                <span className="w-14 shrink-0 font-mono text-[13px] text-muted-foreground tabular">{formatDuration(c.start)}</span>
                <span className="min-w-0 flex-1">{c.title}</span>
                {active && <span className="size-2 shrink-0 self-center rounded-full bg-[var(--chan)] ring-1 ring-foreground/20" aria-hidden />}
              </button>
            </li>
          )
        })}
      </ol>
    </nav>
  )
}

const PREVIEW_LABELS: Record<PreviewState, string> = {
  logged_out: "Logged out",
  verified: "Signed in, 18+ verified",
  opted_out: "Opted out of betting ads",
}

/** Prototype-only control so the ad states (screens B10) can be shown on one page. */
export function PreviewAs({ mode, isLive }: { mode: ChannelMode; isLive: boolean }) {
  const { preview, setPreview } = useVideo()
  const eligible = wageringEligible(preview, mode, isLive)
  return (
    <div className="rounded-md border border-dashed border-input bg-muted/50 px-3 py-2.5">
      <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
        <span id="preview-as" className="text-[11px] font-bold uppercase tracking-[1px] text-muted-foreground">
          Preview as
        </span>
        <ToggleGroup
          type="single"
          variant="outline"
          size="sm"
          value={preview}
          aria-labelledby="preview-as"
          className="flex-wrap bg-background"
          onValueChange={(v) => {
            if (!v) return
            setPreview(v as PreviewState)
            if (v === "opted_out") toast("You won't see betting ads on Homestand")
          }}
        >
          {(Object.keys(PREVIEW_LABELS) as PreviewState[]).map((k) => (
            <ToggleGroupItem key={k} value={k} className="text-[12px]">
              {PREVIEW_LABELS[k]}
            </ToggleGroupItem>
          ))}
        </ToggleGroup>
        <span className="text-[12px] text-muted-foreground" aria-live="polite">
          In-article slot: {eligible ? "wagering eligible (all three locks pass)" : "non-wagering"}
          {!eligible && mode === "standard" ? " · channel mode is Standard" : ""}
        </span>
      </div>
    </div>
  )
}

function wageringEligible(p: PreviewState, mode: ChannelMode, isLive: boolean) {
  return p === "verified" && (mode === "triple_lock" || mode === "racing_only") && !isLive
}

/** The single in-article unit. Wagering only when every lock passes; otherwise fail closed. */
export function InArticleAd({ mode, isLive }: { mode: ChannelMode; isLive: boolean }) {
  const { preview } = useVideo()
  const wagering = wageringEligible(preview, mode, isLive)
  return (
    <div className="my-10 flex justify-center font-sans">
      <AdSlot
        key={preview}
        format="mrec"
        wagering={wagering}
        advertiser={wagering ? "Harbour Bet (licensed)" : "Southern Cross Utes"}
      />
    </div>
  )
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
    <details className="group rounded-lg border bg-card">
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
