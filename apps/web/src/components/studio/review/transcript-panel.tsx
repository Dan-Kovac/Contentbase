"use client"

import { useMemo, useState } from "react"
import { Captions, Download, Search, SquarePlay } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { formatDuration } from "@/lib/format"
import { cn } from "@/lib/utils"
import type { TranscriptLine } from "@/lib/types"

/** ING-03: timestamped, speaker-labelled transcript. */
export function TranscriptPanel({
  lines,
  source,
  durationSec,
}: {
  lines: TranscriptLine[]
  source: "youtube" | "upload"
  durationSec: number
}) {
  const [q, setQ] = useState("")
  const speakers = useMemo(() => Array.from(new Set(lines.map((l) => l.speaker))), [lines])
  const shown = q ? lines.filter((l) => l.text.toLowerCase().includes(q.toLowerCase())) : lines

  return (
    <div className="grid max-w-[820px] gap-5">
      <div className="flex flex-col gap-3 rounded-lg border bg-card p-4 sm:flex-row sm:items-center">
        <span className="grid size-9 shrink-0 place-items-center rounded-md bg-muted">
          {source === "youtube" ? <SquarePlay className="size-[18px]" aria-hidden /> : <Captions className="size-[18px]" aria-hidden />}
        </span>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-semibold">{source === "youtube" ? "From YouTube captions" : "From Homestand speech-to-text"}</p>
          <p className="text-[13px] text-muted-foreground">
            {source === "youtube"
              ? "Read from your channel's captions with your permission. Speaker labels added by us."
              : "Transcribed from your upload with speaker labels and word timings."}{" "}
            {speakers.length} speakers · {formatDuration(durationSec)}
          </p>
        </div>
        <Button variant="outline" size="sm">
          <Download /> Download .vtt
        </Button>
      </div>

      <div className="relative">
        <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" aria-hidden />
        <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search the transcript" aria-label="Search the transcript" className="pl-9" />
      </div>

      {lines.length === 0 ? (
        <p className="rounded-lg border border-dashed px-4 py-10 text-center text-sm text-muted-foreground">
          The transcript appears here once captions are read.
        </p>
      ) : (
        <ol className="divide-y rounded-lg border bg-card">
          {shown.map((l, i) => (
            <li key={i} className="grid grid-cols-[56px_minmax(0,1fr)] gap-x-4 gap-y-1 px-4 py-3 sm:grid-cols-[64px_88px_minmax(0,1fr)]">
              <span className="font-mono text-xs font-medium leading-6 text-muted-foreground tabular">{formatDuration(l.start)}</span>
              <span className={cn("text-[13px] font-semibold leading-6", speakers.indexOf(l.speaker) === 1 && "text-muted-foreground")}>{l.speaker}</span>
              <p className="col-span-2 font-serif text-[16px] leading-[26px] sm:col-span-1">{highlight(l.text, q)}</p>
            </li>
          ))}
          {shown.length === 0 && <li className="px-4 py-8 text-center text-sm text-muted-foreground">No lines match &ldquo;{q}&rdquo;.</li>}
        </ol>
      )}
    </div>
  )
}

function highlight(text: string, q: string) {
  if (!q) return text
  const i = text.toLowerCase().indexOf(q.toLowerCase())
  if (i === -1) return text
  return (
    <>
      {text.slice(0, i)}
      <mark className="rounded-[2px] bg-secondary px-0.5 text-foreground">{text.slice(i, i + q.length)}</mark>
      {text.slice(i + q.length)}
    </>
  )
}
