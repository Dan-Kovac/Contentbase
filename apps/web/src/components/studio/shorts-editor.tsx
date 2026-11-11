"use client"

import Link from "next/link"
import { useEffect, useMemo, useRef, useState } from "react"
import { toast } from "sonner"
import { ChevronLeft, Cloud, FileVideo, Loader2, SquarePlay, Upload } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Progress } from "@/components/ui/progress"
import { Slider } from "@/components/ui/slider"
import { Textarea } from "@/components/ui/textarea"
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"
import { StatusBadge } from "@/components/brand/status-badge"
import { VideoThumb } from "@/components/brand/media"
import { formatDuration } from "@/lib/format"
import { cn } from "@/lib/utils"
import type { ContentStatus, Short, TranscriptLine } from "@/lib/types"
import { type Reframe, SegmentPreview, TrimTimeline, VerticalPreview } from "./clip-parts"

export interface ParentVideo {
  id: string
  title: string
  slug: string
  source: "youtube" | "upload"
  durationSec: number
  posterTone: string
  transcript: TranscriptLine[]
}

/** EDT-06: trim, reframe and caption a short, then publish. */
export function ShortsEditor({ short, parent }: { short: Short; parent?: ParentVideo }) {
  const isImported = short.source === "youtube_short"
  const [status, setStatus] = useState<ContentStatus>(short.status)
  const [title, setTitle] = useState(short.title)
  const [caption, setCaption] = useState(short.caption)
  const [range, setRange] = useState<[number, number]>([short.startSec ?? 0, short.endSec ?? (short.startSec ?? 0) + short.durationSec])
  const [reframe, setReframe] = useState<Reframe>("auto")
  const [offset, setOffset] = useState(50)
  const [render, setRender] = useState<"none" | number | "done">(
    !isImported && parent?.source === "youtube" && short.status !== "published" ? "none" : "done",
  )
  const [saving, setSaving] = useState(false)
  const timer = useRef<number | null>(null)
  useEffect(() => () => {
    if (timer.current) window.clearInterval(timer.current)
  }, [])

  // On-screen caption lines from the transcript inside the trimmed range.
  const initialLines = useMemo(() => {
    const src = parent?.transcript.filter((l) => l.start >= range[0] - 1 && l.start < range[1]) ?? []
    return src.length ? src.map((l) => ({ start: l.start, text: l.text })) : [{ start: range[0], text: short.caption }]
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])
  const [lines, setLines] = useState(initialLines)
  const [activeLine, setActiveLine] = useState(0)

  const first = useRef(true)
  useEffect(() => {
    if (first.current) {
      first.current = false
      return
    }
    setSaving(true)
    const t = window.setTimeout(() => setSaving(false), 600)
    return () => window.clearTimeout(t)
  }, [title, caption, range, reframe, offset, lines])

  const rendered = render === "done"
  const windowStart = Math.max(0, range[0] - 30)
  const windowEnd = Math.min(parent?.durationSec ?? short.durationSec, range[1] + 30)
  const tone = short.posterTone
  const live = status === "published"

  const upload = () => {
    let pct = 0
    setRender(0)
    timer.current = window.setInterval(() => {
      pct += 8
      if (pct >= 100) {
        if (timer.current) window.clearInterval(timer.current)
        setRender("done")
        toast.success("Rendered", { description: "Your short is ready at 9:16 with burned-in captions." })
      } else setRender(pct)
    }, 110)
  }

  const publish = () => {
    setStatus("published")
    toast.success(live ? "Updated" : "Published", { description: `${title} is in the shorts row on your channel.` })
  }

  const previewCaption = isImported ? "" : lines[activeLine]?.text ?? caption

  return (
    <div className="flex min-h-[calc(100svh-8rem)] flex-col">
      <Link
        href="/studio/shorts"
        className="-ml-1 inline-flex w-fit items-center gap-1 rounded-sm text-[13px] font-medium text-muted-foreground hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
      >
        <ChevronLeft className="size-4" aria-hidden /> Shorts
      </Link>
      <div className="mt-3 flex flex-wrap items-center gap-2">
        <StatusBadge tone={status} className={status === "ready" ? "border-input bg-background text-foreground" : undefined}>
          {status === "ready" ? (rendered ? "Ready" : "Clip suggestion") : undefined}
        </StatusBadge>
        <span className="text-[13px] text-muted-foreground">
          {isImported ? "From your YouTube Shorts" : parent ? `Cut from ${parent.title}` : "Clip"}
        </span>
      </div>
      <h1 className="mt-2 text-[28px] font-bold leading-[34px] tracking-[-0.6px]">{title || "Untitled short"}</h1>

      <div className="mt-8 grid gap-10 md:grid-cols-[260px_minmax(0,1fr)] lg:grid-cols-[300px_minmax(0,1fr)]">
        {/* Preview */}
        <div className="md:sticky md:top-20 md:self-start">
          <div className="mx-auto w-[220px] md:w-full">
            {rendered || isImported ? (
              <VerticalPreview tone={tone} caption={previewCaption} durationSec={isImported ? short.durationSec : range[1] - range[0]} reframe={reframe} offset={offset} />
            ) : (
              <div className="grid gap-2">
                <SegmentPreview tone={parent?.posterTone ?? tone} start={range[0]} end={range[1]} />
                <div className="grid aspect-[9/16] w-full place-items-center rounded-lg border border-dashed p-6 text-center">
                  <div>
                    <FileVideo className="mx-auto size-6 text-muted-foreground" aria-hidden />
                    <p className="mt-2 text-[13px] font-semibold">9:16 preview</p>
                    <p className="mt-1 text-xs text-muted-foreground">Appears once the source file is added</p>
                  </div>
                </div>
              </div>
            )}
          </div>
          <p className="mt-3 flex items-center justify-center gap-1.5 text-center text-xs text-muted-foreground">
            {isImported ? (
              <>
                <SquarePlay className="size-3.5" aria-hidden /> Plays in the YouTube player
              </>
            ) : rendered ? (
              "9:16 · 1080 × 1920 · burned-in captions"
            ) : (
              "Plays as a YouTube segment until rendered"
            )}
          </p>
        </div>

        {/* Controls */}
        <div className="grid min-w-0 max-w-[720px] content-start gap-8">
          {!isImported && !rendered && (
            <div className="rounded-lg border bg-card p-4">
              <p className="font-semibold">Add the source file to render this as a vertical short</p>
              <p className="mt-1 text-sm text-muted-foreground">
                {parent?.title} is on YouTube, so we can suggest the clip but can&apos;t cut it. Add the original and we&apos;ll match it to the YouTube video.
              </p>
              {typeof render === "number" ? (
                <div className="mt-3 grid gap-1.5">
                  <div className="flex justify-between text-xs text-muted-foreground tabular">
                    <span className="font-mono">{parent?.slug}-master.mp4</span>
                    <span>{render < 70 ? `Uploading ${render}%` : "Matching and rendering"}</span>
                  </div>
                  <Progress value={render} className="h-1.5 bg-muted [&>[data-slot=progress-indicator]]:bg-foreground" aria-label="Source file upload" />
                </div>
              ) : (
                <div className="mt-4 flex flex-wrap gap-2">
                  <Button onClick={upload}>
                    <Upload /> Upload source file
                  </Button>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <span tabIndex={0} className="rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
                        <Button variant="outline" disabled>
                          <Cloud /> Connect Google Drive or Dropbox
                        </Button>
                      </span>
                    </TooltipTrigger>
                    <TooltipContent>Coming soon</TooltipContent>
                  </Tooltip>
                </div>
              )}
            </div>
          )}

          <section className="grid gap-4" aria-labelledby="details-h">
            <h2 id="details-h" className="kicker text-foreground">
              Details
            </h2>
            <div className="grid gap-1.5">
              <div className="flex items-center justify-between">
                <Label htmlFor="short-title">Title</Label>
                <span className="text-xs text-muted-foreground tabular">{title.length} / 100</span>
              </div>
              <Input id="short-title" value={title} maxLength={100} onChange={(e) => setTitle(e.target.value)} />
            </div>
            <div className="grid gap-1.5">
              <div className="flex items-center justify-between">
                <Label htmlFor="short-caption">Post caption</Label>
                <span className="text-xs text-muted-foreground tabular">{caption.length} / 150</span>
              </div>
              <Textarea id="short-caption" rows={2} maxLength={150} value={caption} onChange={(e) => setCaption(e.target.value)} className="resize-none" />
              <p className="text-xs text-muted-foreground">Shown under the short on your channel.</p>
            </div>
          </section>

          {isImported ? (
            <div className="rounded-lg border bg-muted/40 p-4 text-sm text-muted-foreground">
              This short plays from YouTube, so the video itself can&apos;t be trimmed or reframed here. To change it, edit it on YouTube and
              we&apos;ll pick up the new version on the next sync.
            </div>
          ) : (
            <>
              <section className="grid gap-3" aria-labelledby="trim-h">
                <div className="flex items-baseline justify-between gap-2">
                  <h2 id="trim-h" className="kicker text-foreground">
                    Trim
                  </h2>
                  <span className="text-xs text-muted-foreground">Drag the handles, or use the arrow keys</span>
                </div>
                <TrimTimeline windowStart={windowStart} windowEnd={windowEnd} value={range} onChange={setRange} label="Trim the short" />
              </section>

              <section className={cn("grid gap-3", !rendered && "opacity-60")} aria-labelledby="reframe-h" data-disabled={!rendered || undefined}>
                <div className="flex items-baseline justify-between gap-2">
                  <h2 id="reframe-h" className="kicker text-foreground">
                    Reframe
                  </h2>
                  {!rendered && <span className="text-xs text-muted-foreground">Available once rendered</span>}
                </div>
                <ToggleGroup
                  type="single"
                  variant="outline"
                  value={reframe}
                  onValueChange={(v) => v && setReframe(v as Reframe)}
                  disabled={!rendered}
                  aria-label="Reframe"
                  className="w-full flex-wrap sm:w-fit"
                >
                  <ToggleGroupItem value="auto" className="px-3">Follow speaker</ToggleGroupItem>
                  <ToggleGroupItem value="left" className="px-3">Left</ToggleGroupItem>
                  <ToggleGroupItem value="centre" className="px-3">Centre</ToggleGroupItem>
                  <ToggleGroupItem value="right" className="px-3">Right</ToggleGroupItem>
                </ToggleGroup>
                <div className="grid gap-3 sm:grid-cols-[minmax(0,260px)_1fr] sm:items-center">
                  <div className="relative overflow-hidden rounded-md" aria-hidden>
                    <VideoThumb tone={parent?.posterTone ?? tone} className="rounded-md [&_span.rounded-full]:hidden" />
                    <div className="absolute inset-0 bg-black/45" />
                    <div
                      className="absolute inset-y-0 border-2 border-white bg-white/10 transition-[left] duration-200"
                      style={{
                        width: "31.6%",
                        left: `calc(${reframe === "left" ? 10 : reframe === "right" ? 90 : reframe === "auto" ? 42 : offset}% - 15.8%)`,
                      }}
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="reframe-pos" className="text-[13px] text-muted-foreground">
                      Fine-tune position
                    </Label>
                    <Slider
                      id="reframe-pos"
                      min={16}
                      max={84}
                      step={1}
                      value={[offset]}
                      disabled={!rendered || reframe !== "centre"}
                      onValueChange={([v]) => setOffset(v)}
                      aria-label="Crop position"
                    />
                    <p className="text-xs text-muted-foreground">
                      {reframe === "auto" ? "We keep whoever is speaking in frame." : reframe === "centre" ? "Slide to move the crop." : "Fixed crop."}
                    </p>
                  </div>
                </div>
              </section>

              <section className="grid gap-3" aria-labelledby="caps-h">
                <div className="flex items-baseline justify-between gap-2">
                  <h2 id="caps-h" className="kicker text-foreground">
                    On-screen captions
                  </h2>
                  <span className="text-xs text-muted-foreground">Burned in when rendered</span>
                </div>
                <ol className="divide-y rounded-lg border bg-card">
                  {lines.map((l, i) => (
                    <li key={i} className={cn("flex items-center gap-3 px-3 py-1.5", i === activeLine && "bg-accent/60")}>
                      <span className="w-12 shrink-0 font-mono text-xs text-muted-foreground tabular">{formatDuration(l.start)}</span>
                      <input
                        value={l.text}
                        onFocus={() => setActiveLine(i)}
                        onChange={(e) => setLines((ls) => ls.map((x, j) => (j === i ? { ...x, text: e.target.value } : x)))}
                        aria-label={`Caption at ${formatDuration(l.start)}`}
                        className="min-w-0 flex-1 rounded-sm bg-transparent px-1 py-1.5 text-sm outline-none focus-visible:bg-background focus-visible:ring-1 focus-visible:ring-input"
                      />
                    </li>
                  ))}
                </ol>
              </section>
            </>
          )}
        </div>
      </div>

      <div className="sticky bottom-0 z-10 -mx-4 mt-12 border-t bg-background/95 px-4 py-3 backdrop-blur md:-mx-8 md:px-8">
        <div className="flex flex-wrap items-center gap-3">
          <p className="flex items-center gap-1.5 text-[13px] text-muted-foreground" aria-live="polite">
            {saving ? (
              <>
                <Loader2 className="size-3.5 animate-spin" aria-hidden /> Saving
              </>
            ) : (
              <>
                <span className="size-1.5 rounded-full bg-pop-ink" aria-hidden /> Saved
              </>
            )}
          </p>
          {!rendered && !isImported && <p className="text-[13px] text-muted-foreground">Add the source file to publish this short.</p>}
          <div className="ml-auto flex gap-2">
            <Button variant="pop" onClick={publish} disabled={!rendered && !isImported}>
              {live ? "Update" : "Publish"}
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
