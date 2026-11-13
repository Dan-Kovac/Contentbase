"use client"

import { useEffect, useState } from "react"
import { Captions, Maximize, Pause, Play, RotateCcw, Settings, Volume2, VolumeX } from "lucide-react"
import { formatDuration } from "@/lib/format"
import { cn } from "@/lib/utils"
import type { Chapter } from "@/lib/types"

/** Index of the chapter that contains `t`. */
export function chapterAt(chapters: Chapter[], t: number) {
  let i = 0
  chapters.forEach((c, j) => {
    if (c.start <= t) i = j
  })
  return i
}

/**
 * A studio preview of the video player: poster photo, chapter-ticked progress
 * and a control bar. Playback is simulated in the prototype; the real build
 * mounts the YouTube or Mux player here with the same chapters.
 */
export function VideoPlayer({
  title,
  poster,
  tone,
  durationSec,
  chapters,
  time,
  onTime,
  className,
}: {
  title: string
  poster?: string
  tone?: string
  durationSec: number
  chapters: Chapter[]
  time: number
  onTime: React.Dispatch<React.SetStateAction<number>>
  className?: string
}) {
  const [wantsPlay, setPlaying] = useState(false)
  // Stops at the end without a state update in an effect.
  const playing = wantsPlay && time < durationSec
  const [muted, setMuted] = useState(false)
  const [captions, setCaptions] = useState(true)

  useEffect(() => {
    if (!playing) return
    const id = window.setInterval(() => onTime((t) => Math.min(durationSec, t + 0.5)), 500)
    return () => window.clearInterval(id)
  }, [playing, onTime, durationSec])

  const pct = Math.min(100, (time / durationSec) * 100)
  const active = chapters.length ? chapterAt(chapters, time) : -1
  const segments = chapters.length ? chapters : [{ start: 0, title }]
  const ctrl =
    "grid size-8 place-items-center rounded-md text-white/90 outline-none transition-colors hover:bg-white/15 hover:text-white focus-visible:ring-2 focus-visible:ring-white"

  return (
    <div
      className={cn("group/player relative aspect-video w-full overflow-hidden rounded-lg bg-black text-white", className)}
      style={{ background: tone }}
      role="region"
      aria-label={`Video player: ${title}`}
    >
      {poster && (
        // eslint-disable-next-line @next/next/no-img-element -- prototype poster; the real player renders its own
        <img src={poster} alt="" className="absolute inset-0 size-full object-cover" />
      )}
      <div className="pointer-events-none absolute inset-x-0 top-0 h-16 bg-gradient-to-b from-black/60 to-transparent" aria-hidden />
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-28 bg-gradient-to-t from-black/85 via-black/45 to-transparent" aria-hidden />

      <p className="absolute inset-x-3 top-2.5 line-clamp-1 text-[13px] font-semibold leading-5 [text-shadow:0_1px_2px_rgba(0,0,0,0.6)]">{title}</p>

      {!playing && (
        <button
          type="button"
          onClick={() => setPlaying(true)}
          className="absolute left-1/2 top-1/2 grid size-14 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full bg-black/45 backdrop-blur-sm outline-none transition-colors hover:bg-black/60 focus-visible:ring-2 focus-visible:ring-white"
          aria-label={time > 0 ? "Resume" : "Play"}
        >
          <Play className="ml-0.5 size-6 fill-current" aria-hidden />
        </button>
      )}

      {captions && playing && (
        <p className="absolute inset-x-6 bottom-[68px] text-center" aria-hidden>
          <span className="rounded-[2px] bg-black/75 px-1.5 py-0.5 text-[12px] font-medium leading-5">{chapters[active]?.title ?? title}</span>
        </p>
      )}

      <div className="absolute inset-x-0 bottom-0 px-2.5 pb-1.5">
        {active >= 0 && (
          <p className="mb-1 line-clamp-1 px-0.5 text-[11px] font-medium text-white/85">
            <span className="tabular">Chapter {active + 1}</span> · {chapters[active].title}
          </p>
        )}
        {/* Progress with chapter ticks */}
        <div className="relative h-3">
          <div className="absolute inset-x-0 top-1/2 flex h-[3px] -translate-y-1/2 gap-[3px] transition-[height] group-hover/player:h-[5px]" aria-hidden>
            {segments.map((c, i) => {
              const end = segments[i + 1]?.start ?? durationSec
              const len = Math.max(1, end - c.start)
              const fill = Math.max(0, Math.min(1, (time - c.start) / len))
              return (
                <span key={i} className="relative h-full overflow-hidden rounded-full bg-white/30" style={{ flexGrow: len, flexBasis: 0 }}>
                  <span className="absolute inset-y-0 left-0 bg-white" style={{ width: `${fill * 100}%` }} />
                </span>
              )
            })}
          </div>
          <span
            className="pointer-events-none absolute top-1/2 size-3 -translate-x-1/2 -translate-y-1/2 rounded-full bg-white shadow"
            style={{ left: `${pct}%` }}
            aria-hidden
          />
          <input
            type="range"
            min={0}
            max={durationSec}
            step={1}
            value={Math.round(time)}
            onChange={(e) => onTime(Number(e.target.value))}
            aria-label="Seek"
            aria-valuetext={`${formatDuration(time)} of ${formatDuration(durationSec)}${active >= 0 ? `, ${chapters[active].title}` : ""}`}
            className="absolute inset-0 size-full cursor-pointer opacity-0"
          />
        </div>
        <div className="mt-0.5 flex items-center gap-0.5">
          <button type="button" className={ctrl} onClick={() => setPlaying(!playing)} aria-label={playing ? "Pause" : "Play"}>
            {playing ? <Pause className="size-4 fill-current" aria-hidden /> : <Play className="size-4 fill-current" aria-hidden />}
          </button>
          <button type="button" className={ctrl} onClick={() => onTime(Math.max(0, time - 10))} aria-label="Back 10 seconds">
            <RotateCcw className="size-4" aria-hidden />
          </button>
          <button type="button" className={ctrl} onClick={() => setMuted((m) => !m)} aria-label={muted ? "Unmute" : "Mute"} aria-pressed={muted}>
            {muted ? <VolumeX className="size-4" aria-hidden /> : <Volume2 className="size-4" aria-hidden />}
          </button>
          <span className="ml-1 font-mono text-[11px] font-medium text-white/90 tabular">
            {formatDuration(time)} <span className="text-white/60">/ {formatDuration(durationSec)}</span>
          </span>
          <span className="flex-1" />
          <button
            type="button"
            className={ctrl}
            onClick={() => setCaptions((c) => !c)}
            aria-label="Captions"
            aria-pressed={captions}
          >
            <Captions className={cn("size-4", captions && "fill-white/20")} aria-hidden />
          </button>
          <button type="button" className={cn(ctrl, "hidden sm:grid")} aria-label="Quality: Auto">
            <Settings className="size-4" aria-hidden />
          </button>
          <button type="button" className={ctrl} aria-label="Full screen">
            <Maximize className="size-4" aria-hidden />
          </button>
        </div>
      </div>
    </div>
  )
}
