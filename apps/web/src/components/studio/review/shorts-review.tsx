"use client"

import { useEffect, useRef, useState } from "react"
import { Cloud, FileVideo, Plus, Sparkles, Upload } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Progress } from "@/components/ui/progress"
import { Switch } from "@/components/ui/switch"
import { Textarea } from "@/components/ui/textarea"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { formatDuration } from "@/lib/format"
import { cn } from "@/lib/utils"
import type { Chapter } from "@/lib/types"
import { SegmentPreview, TrimTimeline, VerticalPreview } from "../clip-parts"

export interface Clip {
  id: string
  title: string
  caption: string
  start: number
  end: number
  tone: string
  include: boolean
}

const TONES = ["#1c4fb8", "#0e5a3a", "#8a1c2c", "#5b2a86", "#8a5300"]

/** ING-07, EDT-06: the clips in a draft pack. */
export function ShortsReview({
  clips,
  setClips,
  source,
  slug,
  durationSec,
  chapters,
}: {
  clips: Clip[]
  setClips: (fn: (c: Clip[]) => Clip[]) => void
  source: "youtube" | "upload"
  slug: string
  durationSec: number
  chapters: Chapter[]
}) {
  const [render, setRender] = useState<{ state: "none" } | { state: "uploading"; pct: number } | { state: "done" }>(
    source === "upload" ? { state: "done" } : { state: "none" },
  )
  const [generating, setGenerating] = useState(false)
  const timer = useRef<number | null>(null)
  useEffect(() => () => {
    if (timer.current) window.clearInterval(timer.current)
  }, [])

  const rendered = render.state === "done"

  const startUpload = () => {
    setRender({ state: "uploading", pct: 0 })
    let pct = 0
    timer.current = window.setInterval(() => {
      pct = Math.min(100, pct + 7)
      if (pct >= 100) {
        if (timer.current) window.clearInterval(timer.current)
        setRender({ state: "done" })
      } else setRender({ state: "uploading", pct })
    }, 120)
  }

  const generate = () => {
    setGenerating(true)
    window.setTimeout(() => {
      setClips((c) => {
        const used = new Set(c.map((x) => x.start))
        const fromChapters = chapters.filter((ch) => !used.has(ch.start)).slice(0, Math.max(1, 3 - c.length))
        const add = (fromChapters.length ? fromChapters : [{ start: Math.min(durationSec - 45, 30 * (c.length + 1)), title: "Best moment" }]).map((ch, i) => ({
          id: `gen-${c.length + i}`,
          title: ch.title,
          caption: `${ch.title}. Full breakdown on the channel.`,
          start: ch.start,
          end: Math.min(durationSec, ch.start + 40),
          tone: TONES[(c.length + i) % TONES.length],
          include: true,
        }))
        return [...c, ...add]
      })
      setGenerating(false)
    }, 900)
  }

  const update = (id: string, patch: Partial<Clip>) => setClips((c) => c.map((x) => (x.id === id ? { ...x, ...patch } : x)))
  const included = clips.filter((c) => c.include).length

  return (
    <div className="grid gap-6">
      {source === "youtube" && render.state !== "done" && (
        <div className="flex flex-col gap-4 rounded-lg border bg-card p-4 sm:p-5 md:flex-row md:items-center">
          <span className="grid size-10 shrink-0 place-items-center rounded-md bg-muted">
            <FileVideo className="size-5" aria-hidden />
          </span>
          <div className="min-w-0 flex-1">
            <p className="font-semibold">Add the source file to render these as vertical shorts</p>
            <p className="mt-1 max-w-[62ch] text-sm text-muted-foreground">
              This video lives on YouTube, so we can suggest clips but can&apos;t cut them. Add the original file and we&apos;ll match it
              to the YouTube video, then render each clip at 9:16 with burned-in captions.
            </p>
            {render.state === "uploading" && (
              <div className="mt-3 grid max-w-md gap-1.5">
                <div className="flex justify-between text-xs text-muted-foreground tabular">
                  <span className="font-mono">{slug}-master.mp4</span>
                  <span>{render.pct < 70 ? `Uploading ${render.pct}%` : "Matching and rendering"}</span>
                </div>
                <Progress value={render.pct} className="h-1.5 bg-muted [&>[data-slot=progress-indicator]]:bg-foreground" aria-label="Source file upload" />
              </div>
            )}
          </div>
          {render.state === "none" && (
            <div className="flex flex-wrap gap-2">
              <Tooltip>
                <TooltipTrigger asChild>
                  <span tabIndex={0} className="rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
                    <Button variant="outline" disabled aria-describedby="drive-soon">
                      <Cloud /> Connect Google Drive or Dropbox
                    </Button>
                  </span>
                </TooltipTrigger>
                <TooltipContent id="drive-soon">Coming soon</TooltipContent>
              </Tooltip>
              <Button onClick={startUpload}>
                <Upload /> Upload source file
              </Button>
            </div>
          )}
        </div>
      )}

      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-muted-foreground">
          {rendered ? (
            <>
              <span className="font-semibold text-foreground">{included} of {clips.length}</span> shorts will publish with this pack
            </>
          ) : (
            <>
              <span className="font-semibold text-foreground">{clips.length} clip suggestions</span> · play as YouTube segments until the source file is added
            </>
          )}
        </p>
        <Button variant="outline" size="sm" onClick={generate} disabled={generating || clips.length >= 5}>
          {clips.length ? <Plus /> : <Sparkles />} {generating ? "Finding clips" : clips.length ? "Suggest another clip" : "Generate shorts"}
        </Button>
      </div>

      {clips.length === 0 && !generating && (
        <div className="grid place-items-center rounded-lg border border-dashed px-6 py-12 text-center">
          <p className="font-semibold">No shorts in this pack yet</p>
          <p className="mt-1 max-w-sm text-sm text-muted-foreground">We find three to five moments that work on their own, each with a title and caption.</p>
        </div>
      )}

      <ul className="grid gap-4">
        {clips.map((c, i) => (
          <li key={c.id} className={cn("rounded-lg border bg-card p-4 transition-opacity", rendered && !c.include && "opacity-60")}>
            <div className="grid gap-5 md:grid-cols-[auto_minmax(0,1fr)]">
              <div className={cn("mx-auto", rendered ? "w-[150px]" : "w-full max-w-[300px] md:w-[260px]")}>
                {rendered ? (
                  <VerticalPreview tone={c.tone} caption={c.caption} durationSec={c.end - c.start} />
                ) : (
                  <SegmentPreview tone={c.tone} start={c.start} end={c.end} />
                )}
                <p className="mt-2 text-center text-xs text-muted-foreground">
                  {rendered ? "9:16 · burned-in captions" : "YouTube segment · 16:9"}
                </p>
              </div>
              <div className="grid min-w-0 content-start gap-4">
                <div className="flex items-center justify-between gap-3">
                  <p className="kicker text-muted-foreground">
                    {rendered ? "Short" : "Clip"} {i + 1} · <span className="font-mono tabular">{formatDuration(c.start)}</span>
                  </p>
                  {rendered && (
                    <div className="flex items-center gap-2">
                      <Label htmlFor={`inc-${c.id}`} className="text-[13px] font-medium text-muted-foreground">
                        Include
                      </Label>
                      <Switch id={`inc-${c.id}`} checked={c.include} onCheckedChange={(v) => update(c.id, { include: v })} />
                    </div>
                  )}
                </div>
                <div className="grid gap-1.5">
                  <div className="flex items-center justify-between">
                    <Label htmlFor={`title-${c.id}`}>Title</Label>
                    <TitleIdeas
                      ideas={[c.title, ...chapters.map((ch) => ch.title).slice(0, 2), `${c.title}, explained`].filter((x, j, a) => a.indexOf(x) === j)}
                      onPick={(t) => update(c.id, { title: t })}
                    />
                  </div>
                  <Input id={`title-${c.id}`} value={c.title} onChange={(e) => update(c.id, { title: e.target.value })} />
                </div>
                <div className="grid gap-1.5">
                  <div className="flex items-center justify-between">
                    <Label htmlFor={`cap-${c.id}`}>Caption</Label>
                    <span className="text-xs text-muted-foreground tabular">{c.caption.length} / 150</span>
                  </div>
                  <Textarea
                    id={`cap-${c.id}`}
                    value={c.caption}
                    maxLength={150}
                    rows={2}
                    onChange={(e) => update(c.id, { caption: e.target.value })}
                    className="min-h-0 resize-none"
                  />
                </div>
                <div className="grid gap-1.5">
                  <p className="text-sm font-medium">Trim</p>
                  <TrimTimeline
                    windowStart={Math.max(0, c.start - 30)}
                    windowEnd={Math.min(durationSec, c.end + 30)}
                    value={[c.start, c.end]}
                    onChange={([a, b]) => update(c.id, { start: a, end: b })}
                    label={`Trim clip ${i + 1}`}
                  />
                </div>
              </div>
            </div>
          </li>
        ))}
      </ul>
    </div>
  )
}

function TitleIdeas({ ideas, onPick }: { ideas: string[]; onPick: (t: string) => void }) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="xs" className="text-muted-foreground">
          <Sparkles /> Suggestions
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-64">
        <DropdownMenuLabel className="text-xs font-medium text-muted-foreground">Title suggestions</DropdownMenuLabel>
        {ideas.map((t) => (
          <DropdownMenuItem key={t} onSelect={() => onPick(t)}>
            {t}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
