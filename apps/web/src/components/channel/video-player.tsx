"use client"

import { useEffect, useRef, useState } from "react"
import {
  ArrowUpRight,
  Captions,
  Check,
  Maximize,
  Minimize,
  MonitorPlay,
  Pause,
  Play,
  RotateCcw,
  RotateCw,
  Settings,
  SquarePlay,
  Volume2,
  VolumeX,
} from "lucide-react"
import { ChapterSponsorSegment } from "@/components/brand/native-ads"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Slider } from "@/components/ui/slider"
import { formatDuration, readableOn } from "@/lib/format"
import { cn } from "@/lib/utils"
import type { Chapter, Sponsor, TranscriptLine } from "@/lib/types"
import { useVideo } from "./video-client"

const SPEEDS = [0.5, 1, 1.25, 1.5, 2]
const PREROLL_SECONDS = 5

/** Icon button inside the control bar. */
function Ctl({
  label,
  onClick,
  pressed,
  children,
  className,
}: {
  label: string
  onClick?: () => void
  pressed?: boolean
  children: React.ReactNode
  className?: string
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      aria-pressed={pressed}
      title={label}
      className={cn(
        "relative grid size-9 shrink-0 place-items-center rounded-md text-white/90 outline-none transition-colors hover:bg-white/15 hover:text-white focus-visible:ring-2 focus-visible:ring-white md:size-10",
        className,
      )}
    >
      {children}
    </button>
  )
}

/**
 * The channel's video player. Our chrome is the design for both sources: YouTube-sourced videos
 * run inside the YouTube IFrame player in a real build (we may not re-host them, and YouTube's
 * own ads apply there); uploaded videos run in the Homestand player (Mux), which may show one
 * non-wagering "Brought to you by" card before play. The prototype simulates playback on the poster.
 */
export function VideoPlayer({
  title,
  channelName,
  poster,
  tone,
  duration,
  chapters,
  transcript,
  source,
  preroll,
}: {
  title: string
  channelName: string
  poster?: string
  tone: string
  duration: number
  chapters: Chapter[]
  transcript: TranscriptLine[]
  source: "youtube" | "upload"
  /** Non-restricted sponsor for the pre-roll card (uploaded videos only). */
  preroll?: Sponsor
}) {
  const { time, playing, started, toggle, seek, speed, setSpeed, plan, sponsoredChapter } = useVideo()
  const rootRef = useRef<HTMLDivElement>(null)
  const [captions, setCaptions] = useState(false)
  const [muted, setMuted] = useState(false)
  const [volume, setVolume] = useState(80)
  const [fullscreen, setFullscreen] = useState(false)
  const [quality, setQuality] = useState("auto")
  const [prerollLeft, setPrerollLeft] = useState<number | null>(null)
  const [prerollDone, setPrerollDone] = useState(false)

  useEffect(() => {
    const onChange = () => setFullscreen(document.fullscreenElement === rootRef.current)
    document.addEventListener("fullscreenchange", onChange)
    return () => document.removeEventListener("fullscreenchange", onChange)
  }, [])

  const finishPreroll = () => {
    setPrerollLeft(null)
    setPrerollDone(true)
    seek(0)
  }

  useEffect(() => {
    if (prerollLeft === null) return
    const id = window.setTimeout(() => {
      if (prerollLeft <= 1) {
        setPrerollLeft(null)
        setPrerollDone(true)
        seek(0)
      } else setPrerollLeft(prerollLeft - 1)
    }, 1000)
    return () => window.clearTimeout(id)
  }, [prerollLeft, seek])

  const onPlay = () => {
    if (source === "upload" && preroll && !prerollDone && !started) {
      setPrerollLeft(PREROLL_SECONDS)
      return
    }
    toggle()
  }

  const toggleFullscreen = () => {
    const el = rootRef.current
    if (!el) return
    if (document.fullscreenElement) void document.exitFullscreen()
    else void el.requestFullscreen?.()
  }

  const onKeyDown = (e: React.KeyboardEvent) => {
    if ((e.target as HTMLElement).closest("[role=menu],[role=slider]")) return
    const k = e.key.toLowerCase()
    if (k === "k") onPlay()
    else if (k === "c") setCaptions((c) => !c)
    else if (k === "m") setMuted((m) => !m)
    else if (k === "f") toggleFullscreen()
    else return
    e.preventDefault()
  }

  const inPreroll = prerollLeft !== null
  const pct = (time / duration) * 100
  const chapterIdx = chapters.reduce((acc, c, i) => (c.start <= time ? i : acc), 0)
  const current = chapters[chapterIdx]
  const caption = [...transcript].reverse().find((l) => l.start <= time)
  const showCaption = captions && started && caption && time - caption.start < 20
  const sponsor = sponsoredChapter >= 0 ? plan.chapter : undefined
  const sFrom = sponsoredChapter >= 0 ? chapters[sponsoredChapter].start / duration : 0
  const sTo = sponsoredChapter >= 0 ? (chapters[sponsoredChapter + 1]?.start ?? duration) / duration : 0
  const vol = muted ? 0 : volume

  return (
    <div className="flex flex-col gap-2">
      <div
        ref={rootRef}
        onKeyDown={onKeyDown}
        data-playing={playing || undefined}
        className="group/player relative isolate aspect-video w-full overflow-hidden rounded-lg bg-black text-white [&:fullscreen]:rounded-none"
        style={{ background: tone }}
        aria-label={`Video player: ${title}`}
        role="region"
      >
        {poster && (
          // eslint-disable-next-line @next/next/no-img-element -- poster frame
          <img src={poster} alt="" className="absolute inset-0 -z-10 size-full object-cover" fetchPriority="high" />
        )}

        {inPreroll && preroll ? (
          <PrerollCard sponsor={preroll} left={prerollLeft} onSkip={finishPreroll} />
        ) : (
          <>
            {/* Scrims: heavier before play so the title reads, lighter once playing. */}
            <div
              className={cn(
                "pointer-events-none absolute inset-0 -z-[5] bg-gradient-to-t from-black/85 via-black/10 to-black/50 transition-opacity duration-200",
                playing && "opacity-60",
              )}
              aria-hidden
            />

            {/* Click anywhere on the picture to play or pause. */}
            <button
              type="button"
              onClick={onPlay}
              aria-label={playing ? `Pause ${title}` : `Play ${title}`}
              className="absolute inset-0 z-10 grid place-items-center outline-none focus-visible:ring-4 focus-visible:ring-inset focus-visible:ring-white"
            >
              <span
                className={cn(
                  "grid place-items-center rounded-full bg-white text-black shadow-[0_8px_30px_rgba(0,0,0,0.35)] transition-[opacity,transform] duration-200",
                  started ? "size-14 md:size-16" : "size-16 md:size-20",
                  playing && "scale-90 opacity-0",
                )}
              >
                {playing ? <Pause className="size-6 fill-current md:size-7" /> : <Play className="ml-1 size-7 fill-current md:size-8" />}
              </span>
            </button>

            {/* Top bar: channel and title. */}
            <div
              className={cn(
                "pointer-events-none absolute inset-x-0 top-0 z-20 flex items-start justify-between gap-4 p-3 transition-opacity duration-200 md:p-5",
                playing && "opacity-0 group-hover/player:opacity-100",
              )}
            >
              <div className="min-w-0">
                <p className="text-[11px] font-bold uppercase tracking-[1.2px] text-white/75">{channelName}</p>
                <p className="mt-0.5 truncate text-[15px] font-semibold md:text-[18px]">{title}</p>
              </div>
              {!started && (
                <span className="shrink-0 rounded-[2px] bg-black/70 px-1.5 py-0.5 font-mono text-[12px] font-medium tabular">{formatDuration(duration)}</span>
              )}
            </div>

            {showCaption && (
              <p
                className={cn(
                  "pointer-events-none absolute inset-x-4 z-20 text-center transition-[bottom] duration-200",
                  playing ? "bottom-6 group-hover/player:bottom-[92px] md:bottom-8 md:group-hover/player:bottom-[104px]" : "bottom-[92px] md:bottom-[104px]",
                )}
                aria-live="off"
              >
                <span className="box-decoration-clone rounded-[2px] bg-black/80 px-2 py-0.5 text-[14px] font-medium leading-[24px] md:text-[20px] md:leading-[32px]">
                  {caption.text}
                </span>
              </p>
            )}

            {/* Bottom control bar. */}
            <div
              className={cn(
                "absolute inset-x-0 bottom-0 z-20 px-2 pb-1.5 pt-6 transition-opacity duration-200 md:px-4 md:pb-2.5",
                playing && "opacity-0 focus-within:opacity-100 group-hover/player:opacity-100",
              )}
            >
              <Timeline
                time={time}
                duration={duration}
                chapters={chapters}
                onSeek={seek}
                sponsor={sponsor}
                sponsorFrom={sFrom}
                sponsorTo={sTo}
                pct={pct}
              />
              <div className="mt-1 flex items-center gap-0.5 md:gap-1">
                <Ctl label={playing ? "Pause (k)" : "Play (k)"} onClick={onPlay}>
                  {playing ? <Pause className="size-5 fill-current" /> : <Play className="size-5 fill-current" />}
                </Ctl>
                <Ctl label="Back 10 seconds" onClick={() => seek(time - 10)} className="hidden sm:grid">
                  <RotateCcw className="size-[18px]" />
                </Ctl>
                <Ctl label="Forward 10 seconds" onClick={() => seek(time + 10)} className="hidden sm:grid">
                  <RotateCw className="size-[18px]" />
                </Ctl>
                <div className="group/vol flex items-center">
                  <Ctl label={muted || volume === 0 ? "Unmute (m)" : "Mute (m)"} onClick={() => setMuted((m) => !m)} pressed={muted}>
                    {vol === 0 ? <VolumeX className="size-5" /> : <Volume2 className="size-5" />}
                  </Ctl>
                  <Slider
                    value={[vol]}
                    max={100}
                    step={5}
                    aria-label="Volume"
                    onValueChange={([v]) => {
                      setVolume(v)
                      setMuted(v === 0)
                    }}
                    className="hidden w-20 md:flex [&_[data-slot=slider-range]]:bg-white [&_[data-slot=slider-thumb]]:size-3 [&_[data-slot=slider-thumb]]:border-white [&_[data-slot=slider-track]]:bg-white/30"
                  />
                </div>
                <span className="ml-1.5 shrink-0 font-mono text-[12px] font-medium tabular md:ml-3 md:text-[13px]">
                  {formatDuration(time)} <span className="text-white/60">/ {formatDuration(duration)}</span>
                </span>
                {current && (
                  <span className="ml-3 hidden min-w-0 truncate text-[13px] text-white/80 lg:inline">
                    <span aria-hidden>· </span>
                    {current.title}
                    {sponsor && chapterIdx === sponsoredChapter && <span className="text-white/60"> · presented by {sponsor.name}</span>}
                  </span>
                )}
                <div className="ml-auto flex items-center gap-0.5 md:gap-1">
                  <Ctl label={captions ? "Turn captions off (c)" : "Turn captions on (c)"} onClick={() => setCaptions((c) => !c)} pressed={captions}>
                    <Captions className="size-5" />
                    {captions && <span className="absolute inset-x-2.5 bottom-1.5 h-[2px] rounded-full bg-[var(--chan)]" aria-hidden />}
                  </Ctl>
                  <DropdownMenu modal={false}>
                    <DropdownMenuTrigger asChild>
                      <button
                        type="button"
                        aria-label="Settings"
                        title="Settings"
                        className="grid size-9 shrink-0 place-items-center rounded-md text-white/90 outline-none hover:bg-white/15 focus-visible:ring-2 focus-visible:ring-white md:size-10"
                      >
                        <Settings className="size-5" />
                      </button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" side="top" className="dark w-56 border-white/10 bg-[#141414] text-[#f5f5f5]">
                      <DropdownMenuLabel className="text-[11px] uppercase tracking-[1px] text-white/60">Playback speed</DropdownMenuLabel>
                      <DropdownMenuRadioGroup value={String(speed)} onValueChange={(v) => setSpeed(Number(v))}>
                        {SPEEDS.map((s) => (
                          <DropdownMenuRadioItem key={s} value={String(s)}>
                            {s === 1 ? "Normal" : `${s}×`}
                          </DropdownMenuRadioItem>
                        ))}
                      </DropdownMenuRadioGroup>
                      <DropdownMenuSeparator />
                      <DropdownMenuLabel className="text-[11px] uppercase tracking-[1px] text-white/60">Quality</DropdownMenuLabel>
                      <DropdownMenuRadioGroup value={quality} onValueChange={setQuality}>
                        <DropdownMenuRadioItem value="auto">Auto (1080p)</DropdownMenuRadioItem>
                        <DropdownMenuRadioItem value="720">720p</DropdownMenuRadioItem>
                        <DropdownMenuRadioItem value="480">480p</DropdownMenuRadioItem>
                      </DropdownMenuRadioGroup>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem onSelect={() => setCaptions((c) => !c)}>
                        Captions: English {captions && <Check className="ml-auto size-4" aria-hidden />}
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                  <Ctl label={fullscreen ? "Exit full screen (f)" : "Full screen (f)"} onClick={toggleFullscreen}>
                    {fullscreen ? <Minimize className="size-5" /> : <Maximize className="size-5" />}
                  </Ctl>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
      <p className="flex items-center gap-1.5 text-[12px] text-muted-foreground">
        {source === "youtube" ? (
          <>
            <SquarePlay className="size-3.5" aria-hidden /> Plays in the YouTube player · Captions in English
          </>
        ) : (
          <>
            <MonitorPlay className="size-3.5" aria-hidden /> Plays in the Homestand player · Captions in English
          </>
        )}
      </p>
    </div>
  )
}

function Timeline({
  time,
  duration,
  chapters,
  onSeek,
  sponsor,
  sponsorFrom,
  sponsorTo,
  pct,
}: {
  time: number
  duration: number
  chapters: Chapter[]
  onSeek: (t: number) => void
  sponsor?: Sponsor
  sponsorFrom: number
  sponsorTo: number
  pct: number
}) {
  const ref = useRef<HTMLDivElement>(null)
  const [hover, setHover] = useState<number | null>(null)
  const at = (clientX: number) => {
    const r = ref.current?.getBoundingClientRect()
    if (!r) return 0
    return Math.max(0, Math.min(1, (clientX - r.left) / r.width))
  }
  const hoverChapter = hover === null ? undefined : [...chapters].reverse().find((c) => c.start <= hover * duration)
  return (
    <div
      ref={ref}
      role="slider"
      tabIndex={0}
      aria-label="Seek"
      aria-valuemin={0}
      aria-valuemax={duration}
      aria-valuenow={time}
      aria-valuetext={`${formatDuration(time)} of ${formatDuration(duration)}`}
      onClick={(e) => onSeek(at(e.clientX) * duration)}
      onMouseMove={(e) => setHover(at(e.clientX))}
      onMouseLeave={() => setHover(null)}
      onKeyDown={(e) => {
        if (e.key === "ArrowRight") onSeek(time + 5)
        else if (e.key === "ArrowLeft") onSeek(time - 5)
        else if (e.key === "Home") onSeek(0)
        else if (e.key === "End") onSeek(duration - 1)
        else return
        e.preventDefault()
      }}
      className="group/tl relative flex h-5 cursor-pointer items-center rounded-sm outline-none focus-visible:ring-2 focus-visible:ring-white"
    >
      {hover !== null && (
        <span
          className="pointer-events-none absolute bottom-6 -translate-x-1/2 whitespace-nowrap rounded-[3px] bg-black/90 px-2 py-1 text-[12px] font-medium"
          style={{ left: `${Math.min(92, Math.max(8, hover * 100))}%` }}
        >
          <span className="font-mono tabular">{formatDuration(Math.floor(hover * duration))}</span>
          {hoverChapter && <span className="text-white/75"> · {hoverChapter.title}</span>}
        </span>
      )}
      <div className="relative h-1 w-full rounded-full bg-white/25 transition-[height] group-hover/tl:h-1.5 group-focus-visible/tl:h-1.5">
        {hover !== null && <div className="absolute inset-y-0 left-0 rounded-full bg-white/25" style={{ width: `${hover * 100}%` }} aria-hidden />}
        <div className="absolute inset-y-0 left-0 rounded-full bg-[var(--chan)]" style={{ width: `${pct}%` }} aria-hidden />
        {sponsor && (
          <span className="absolute inset-0 opacity-90" aria-hidden>
            <ChapterSponsorSegment sponsor={sponsor} from={sponsorFrom} to={sponsorTo} />
          </span>
        )}
        {chapters.slice(1).map((c) => (
          <span key={c.start} className="absolute -inset-y-px w-[3px] -translate-x-1/2 bg-black" style={{ left: `${(c.start / duration) * 100}%` }} aria-hidden />
        ))}
        <span
          className="absolute top-1/2 size-3.5 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-white bg-[var(--chan)] shadow transition-transform group-hover/tl:scale-110"
          style={{ left: `${pct}%` }}
          aria-hidden
        />
      </div>
      {sponsor && (
        <span
          className="pointer-events-none absolute -top-3.5 hidden -translate-x-0 whitespace-nowrap text-[10px] font-bold uppercase tracking-[0.8px] text-white/80 md:block"
          style={{ left: `${sponsorFrom * 100}%` }}
          aria-hidden
        >
          Presented by {sponsor.name}
        </span>
      )}
    </div>
  )
}

/** "Brought to you by": a native-style card in the sponsor's colours before an uploaded video plays. Never wagering. */
function PrerollCard({ sponsor, left, onSkip }: { sponsor: Sponsor; left: number | null; onSkip: () => void }) {
  const on = readableOn(sponsor.colour)
  const done = left !== null && left <= 0
  return (
    <div className="absolute inset-0 z-30 grid md:grid-cols-[1.1fr_1fr]" style={{ background: sponsor.colour, color: on }}>
      <div className="flex flex-col justify-between gap-3 p-4 md:p-8">
        <span className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-[1.5px]">
          <span className="h-[2px] w-6 bg-current" aria-hidden /> Brought to you by · Sponsored
        </span>
        <div className="flex flex-col gap-2 md:gap-3">
          <span className="text-[14px] font-semibold opacity-90">{sponsor.name}</span>
          <p className="text-[22px] font-extrabold leading-[26px] tracking-[-0.4px] md:text-[34px] md:leading-[38px]">{sponsor.line}</p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <a
            href={sponsor.url}
            rel="sponsored noopener"
            target="_blank"
            className="inline-flex h-9 items-center gap-1.5 rounded-md px-3.5 text-[13px] font-semibold outline-none focus-visible:ring-2 focus-visible:ring-current focus-visible:ring-offset-2"
            style={{ background: on, color: sponsor.colour }}
          >
            {sponsor.cta} <ArrowUpRight className="size-4" aria-hidden />
          </a>
          <button
            type="button"
            onClick={onSkip}
            className="inline-flex h-9 items-center gap-1.5 rounded-md border border-current/40 px-3.5 text-[13px] font-semibold outline-none hover:bg-white/10 focus-visible:ring-2 focus-visible:ring-current"
          >
            {done ? "Play video" : "Skip"}
          </button>
          <span className="font-mono text-[12px] opacity-80 tabular" aria-live="polite">
            {done ? "Ready" : `Your video starts in ${left}`}
          </span>
        </div>
      </div>
      {sponsor.image && (
        <div className="relative hidden md:block">
          {/* eslint-disable-next-line @next/next/no-img-element -- sponsor brief image */}
          <img src={sponsor.image} alt="" className="absolute inset-0 size-full object-cover" />
          <div className="absolute inset-0" style={{ background: `linear-gradient(90deg, ${sponsor.colour} 0%, transparent 40%)` }} aria-hidden />
        </div>
      )}
    </div>
  )
}
