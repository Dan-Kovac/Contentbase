"use client"

import { SquarePlay } from "lucide-react"
import { Slider } from "@/components/ui/slider"
import { VideoThumb } from "@/components/brand/media"
import { formatDuration } from "@/lib/format"
import { cn } from "@/lib/utils"

/**
 * Trim timeline: a waveform strip over a window of the source video with two
 * handles (the clip's in and out points). Keyboard: arrow keys move a handle by 1 s.
 */
export function TrimTimeline({
  windowStart,
  windowEnd,
  value,
  onChange,
  label = "Trim",
  maxLength = 180,
}: {
  windowStart: number
  windowEnd: number
  value: [number, number]
  onChange: (v: [number, number]) => void
  label?: string
  maxLength?: number
}) {
  const span = windowEnd - windowStart
  const bars = 64
  const left = ((value[0] - windowStart) / span) * 100
  const width = ((value[1] - value[0]) / span) * 100
  return (
    <div className="grid gap-2">
      <div className="relative h-12 overflow-hidden rounded-md border bg-muted">
        <div className="absolute inset-0 flex items-center gap-[2px] px-1" aria-hidden>
          {Array.from({ length: bars }, (_, i) => {
            const t = windowStart + (i / bars) * span
            const h = 28 + Math.abs(Math.sin(t / 3.1) * 50 + Math.sin(t / 1.3) * 25)
            const inside = t >= value[0] && t <= value[1]
            return <span key={i} className={cn("flex-1 rounded-[1px]", inside ? "bg-foreground/70" : "bg-foreground/15")} style={{ height: `${Math.round(Math.min(90, h))}%` }} />
          })}
        </div>
        <div
          className="pointer-events-none absolute inset-y-0 rounded-[3px] border-2 border-foreground"
          style={{ left: `${left}%`, width: `${width}%` }}
          aria-hidden
        />
      </div>
      <Slider
        min={windowStart}
        max={windowEnd}
        step={1}
        minStepsBetweenThumbs={5}
        value={value}
        onValueChange={(v) => {
          const [a, b] = v as [number, number]
          if (b - a > maxLength) return
          onChange([a, b])
        }}
        aria-label={label}
      />
      <div className="flex items-center justify-between font-mono text-xs text-muted-foreground tabular">
        <span>In {formatDuration(value[0])}</span>
        <span className="font-semibold text-foreground">{value[1] - value[0]} s</span>
        <span>Out {formatDuration(value[1])}</span>
      </div>
    </div>
  )
}

export type Reframe = "centre" | "left" | "right" | "auto"

/** A 9:16 short with burned-in captions. */
export function VerticalPreview({
  tone,
  src,
  caption,
  durationSec,
  reframe = "centre",
  offset = 50,
  className,
}: {
  tone: string
  src?: string
  caption: string
  durationSec?: number
  reframe?: Reframe
  offset?: number
  className?: string
}) {
  const pos = reframe === "left" ? 20 : reframe === "right" ? 80 : reframe === "auto" ? 42 : offset
  return (
    <div className={cn("relative", className)} style={{ ["--x" as string]: `${pos}%` }}>
      <VideoThumb
        tone={tone}
        src={src}
        ratio="9/16"
        durationSec={durationSec}
        className="[&>img]:[object-position:var(--x)_50%] [&>img]:transition-[object-position] [&>img]:duration-200 motion-reduce:[&>img]:transition-none"
      >
        <div
          className="pointer-events-none absolute inset-0 transition-[background-position] duration-200"
          style={{ backgroundImage: "radial-gradient(60% 40% at var(--x) 40%, rgba(255,255,255,0.18), transparent 70%)" }}
          aria-hidden
        />
        {caption && (
          <p className="absolute inset-x-3 bottom-[13%] text-center text-[13px] font-extrabold leading-[17px] text-white [text-shadow:0_1px_2px_rgba(0,0,0,0.9),0_0_8px_rgba(0,0,0,0.6)]">
            {caption}
          </p>
        )}
      </VideoThumb>
    </div>
  )
}

/** A 16:9 preview of a segment that plays in the YouTube player. */
export function SegmentPreview({ tone, src, start, end, className }: { tone: string; src?: string; start: number; end: number; className?: string }) {
  return (
    <div className={cn("relative", className)}>
      <VideoThumb tone={tone} src={src}>
        <span className="absolute bottom-2 left-2 flex items-center gap-1 rounded-[2px] bg-black/80 px-1.5 py-0.5 font-mono text-[11px] font-medium text-white tabular">
          <SquarePlay className="size-3" aria-hidden />
          {formatDuration(start)}–{formatDuration(end)}
        </span>
      </VideoThumb>
    </div>
  )
}
