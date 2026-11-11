"use client"

import { useState } from "react"
import { Play, Plus, X, SquarePlay } from "lucide-react"
import { Button } from "@/components/ui/button"
import { formatDuration } from "@/lib/format"
import { cn } from "@/lib/utils"
import type { Chapter } from "@/lib/types"
import { parseTimecode } from "./types"
import { chapterAt, VideoPlayer } from "./player"

/** Embedded video with editable chapters (ING-05). */
export function ChaptersEditor({
  chapters,
  onChange,
  tone,
  poster,
  title,
  durationSec,
  source,
}: {
  chapters: Chapter[]
  onChange: (c: Chapter[]) => void
  tone: string
  poster?: string
  title: string
  durationSec: number
  source: "youtube" | "upload"
}) {
  const [time, setTime] = useState(0)
  const active = chapters.length ? chapterAt(chapters, time) : -1
  const setActive = (i: number) => setTime(chapters[i]?.start ?? 0)
  const [drafts, setDrafts] = useState<Record<number, string>>({})
  const [error, setError] = useState<string | null>(null)

  const commitTime = (i: number) => {
    const raw = drafts[i]
    if (raw == null) return
    const sec = parseTimecode(raw)
    setDrafts((d) => {
      const n = { ...d }
      delete n[i]
      return n
    })
    if (sec == null || sec >= durationSec) {
      setError(`Use minutes and seconds inside the video, e.g. 1:45. The video is ${formatDuration(durationSec)} long.`)
      return
    }
    setError(null)
    onChange(chapters.map((c, j) => (j === i ? { ...c, start: sec } : c)).sort((a, b) => a.start - b.start))
  }

  const add = () => {
    const last = chapters[chapters.length - 1]?.start ?? 0
    const start = Math.min(durationSec - 1, last + 60)
    onChange([...chapters, { start, title: "New chapter" }])
  }

  return (
    <div className="overflow-hidden rounded-lg border bg-card">
      <div className="p-3 pb-0">
        <VideoPlayer title={title} poster={poster} tone={tone} durationSec={durationSec} chapters={chapters} time={time} onTime={setTime} />
        <p className="mt-2 flex items-center gap-1.5 text-xs text-muted-foreground">
          {source === "youtube" ? (
            <>
              <SquarePlay className="size-3.5" aria-hidden /> Plays in the YouTube player on your page
            </>
          ) : (
            "Streams from Homestand"
          )}
        </p>
      </div>
      <div className="p-3">
        <div className="mb-2 flex items-center justify-between">
          <p className="text-sm font-semibold">Chapters</p>
          <Button variant="ghost" size="xs" onClick={add}>
            <Plus /> Add
          </Button>
        </div>
        {chapters.length === 0 && <p className="text-[13px] text-muted-foreground">No chapters yet. Add one to help viewers skip ahead.</p>}
        <ol className="grid gap-1">
          {chapters.map((c, i) => (
            <li
              key={i}
              className={cn("group/ch flex items-center gap-1 rounded-md pr-1 transition-colors", i === active ? "bg-accent" : "hover:bg-accent/60")}
            >
              <Button
                variant="ghost"
                size="icon-xs"
                onClick={() => setActive(i)}
                aria-label={`Play from ${formatDuration(c.start)}, ${c.title}`}
                className={cn("ml-0.5 text-muted-foreground", i === active && "text-foreground")}
              >
                <Play className="fill-current" />
              </Button>
              <input
                value={drafts[i] ?? formatDuration(c.start)}
                onChange={(e) => setDrafts((d) => ({ ...d, [i]: e.target.value }))}
                onBlur={() => commitTime(i)}
                onKeyDown={(e) => e.key === "Enter" && (e.currentTarget as HTMLInputElement).blur()}
                aria-label={`Chapter ${i + 1} start time`}
                className="w-[58px] shrink-0 rounded-sm bg-transparent px-1.5 py-1.5 font-mono text-xs font-medium tabular outline-none focus-visible:bg-background focus-visible:ring-1 focus-visible:ring-input"
              />
              <input
                value={c.title}
                onChange={(e) => onChange(chapters.map((x, j) => (j === i ? { ...x, title: e.target.value } : x)))}
                aria-label={`Chapter ${i + 1} title`}
                className="min-w-0 flex-1 rounded-sm bg-transparent px-1.5 py-1.5 text-[13px] outline-none focus-visible:bg-background focus-visible:ring-1 focus-visible:ring-input"
              />
              <Button
                variant="ghost"
                size="icon-xs"
                aria-label={`Remove chapter ${c.title}`}
                className="opacity-0 group-hover/ch:opacity-100 focus-visible:opacity-100"
                onClick={() => {
                  onChange(chapters.filter((_, j) => j !== i))
                }}
              >
                <X />
              </Button>
            </li>
          ))}
        </ol>
        {error && (
          <p className="mt-2 text-xs text-destructive" role="alert">
            {error}
          </p>
        )}
      </div>
    </div>
  )
}
