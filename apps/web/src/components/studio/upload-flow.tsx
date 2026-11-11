"use client"

import Link from "next/link"
import { useEffect, useRef, useState } from "react"
import { toast } from "sonner"
import { CheckCircle2, FileVideo, Pause, Play, RefreshCw, UploadCloud, WifiOff, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { VideoThumb } from "@/components/brand/media"
import { cn } from "@/lib/utils"
import { PipelineSteps } from "./pipeline"
import { UPLOAD_STEPS } from "./lib"

const MAX_BYTES = 4 * 1024 ** 3
/** The poster we pull from the upload once transcoding finishes (a sample frame in the prototype). */
const SAMPLE_POSTER = "/media/broadcast-control-room.jpg"
const GB = 1024 ** 3

type Phase =
  | { kind: "idle"; error?: string }
  | { kind: "uploading"; name: string; size: number; loaded: number; paused: boolean; dropped: boolean; hasDropped: boolean; resumedAt?: number }
  | { kind: "processing"; name: string; size: number; step: number }
  | { kind: "done"; name: string }

function bytes(n: number) {
  if (n >= GB) return `${(n / GB).toFixed(2)} GB`
  return `${Math.round(n / 1024 ** 2)} MB`
}

/** ING-01: resumable upload, then the pipeline (ING-02, ING-03). */
export function UploadFlow() {
  const [phase, setPhase] = useState<Phase>({ kind: "idle" })
  const [dragging, setDragging] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  // Simulated chunked upload. Chunks resume from the last confirmed byte.
  useEffect(() => {
    if (phase.kind !== "uploading" || phase.paused || phase.dropped) return
    const t = window.setInterval(() => {
      setPhase((p) => {
        if (p.kind !== "uploading" || p.paused || p.dropped) return p
        const loaded = Math.min(p.size, p.loaded + p.size * 0.018)
        if (!p.hasDropped && loaded / p.size > 0.42) return { ...p, loaded, dropped: true, hasDropped: true }
        if (loaded >= p.size) return { kind: "processing", name: p.name, size: p.size, step: 1 }
        return { ...p, loaded }
      })
    }, 120)
    return () => window.clearInterval(t)
  }, [phase])

  // Reconnect after a dropped connection.
  useEffect(() => {
    if (phase.kind !== "uploading" || !phase.dropped) return
    const t = window.setTimeout(() => {
      setPhase((p) => (p.kind === "uploading" ? { ...p, dropped: false, resumedAt: p.loaded } : p))
    }, 1800)
    return () => window.clearTimeout(t)
  }, [phase])

  // Pipeline steps.
  useEffect(() => {
    if (phase.kind !== "processing") return
    const t = window.setTimeout(() => {
      setPhase((p) => {
        if (p.kind !== "processing") return p
        if (p.step >= UPLOAD_STEPS.length - 1) {
          toast.success("Draft pack ready", { description: "Your article draft is ready to review. Nothing goes live until you publish." })
          return { kind: "done", name: p.name }
        }
        return { ...p, step: p.step + 1 }
      })
    }, 1400)
    return () => window.clearTimeout(t)
  }, [phase])

  const start = (name: string, size: number, type: string) => {
    const okType = /\.(mp4|mov)$/i.test(name) || type === "video/mp4" || type === "video/quicktime"
    if (!okType) return setPhase({ kind: "idle", error: `${name} isn't an MP4 or MOV file. Export it as MP4 (H.264) and try again.` })
    if (size > MAX_BYTES) return setPhase({ kind: "idle", error: `${name} is ${bytes(size)}. The limit is 4 GB, so trim it or export at a lower bitrate.` })
    setPhase({ kind: "uploading", name, size, loaded: 0, paused: false, dropped: false, hasDropped: false })
  }

  if (phase.kind === "idle") {
    return (
      <div className="grid gap-3">
        <div
          onDragOver={(e) => {
            e.preventDefault()
            setDragging(true)
          }}
          onDragLeave={() => setDragging(false)}
          onDrop={(e) => {
            e.preventDefault()
            setDragging(false)
            const f = e.dataTransfer.files?.[0]
            if (f) start(f.name, f.size, f.type)
          }}
          className={cn(
            "grid place-items-center rounded-lg border-2 border-dashed px-6 py-14 text-center transition-colors sm:py-20",
            dragging ? "border-foreground bg-accent" : "border-border bg-card",
          )}
        >
          <span className="grid size-12 place-items-center rounded-full bg-muted">
            <UploadCloud className="size-6" aria-hidden />
          </span>
          <p className="mt-4 text-lg font-semibold tracking-[-0.2px]">Drag a video here</p>
          <p className="mt-1 text-sm text-muted-foreground">MP4 or MOV, up to 4 GB and 3 hours</p>
          <div className="mt-5 flex flex-wrap justify-center gap-2">
            <Button onClick={() => inputRef.current?.click()}>Choose a file</Button>
            <Button variant="outline" onClick={() => start("mailbag-43-studio-cut.mp4", 2.14 * GB, "video/mp4")}>
              Use a sample file
            </Button>
          </div>
          <input
            ref={inputRef}
            type="file"
            accept="video/mp4,video/quicktime,.mp4,.mov"
            className="sr-only"
            tabIndex={-1}
            aria-label="Choose a video file"
            onChange={(e) => {
              const f = e.target.files?.[0]
              if (f) start(f.name, f.size, f.type)
              e.target.value = ""
            }}
          />
        </div>
        {phase.error && (
          <p className="rounded-md border border-destructive/50 px-3 py-2 text-sm text-destructive" role="alert">
            {phase.error}
          </p>
        )}
      </div>
    )
  }

  if (phase.kind === "uploading") {
    const pct = Math.round((phase.loaded / phase.size) * 100)
    const left = Math.max(1, Math.round(((phase.size - phase.loaded) / (48 * 1024 ** 2))))
    return (
      <div className="rounded-lg border bg-card p-5">
        <div className="flex items-start gap-3">
          <span className="grid size-10 shrink-0 place-items-center rounded-md bg-muted">
            <FileVideo className="size-5" aria-hidden />
          </span>
          <div className="min-w-0 flex-1">
            <p className="truncate font-mono text-[13px] font-medium">{phase.name}</p>
            <p className="mt-0.5 text-[13px] text-muted-foreground tabular">
              {bytes(phase.loaded)} of {bytes(phase.size)}
              {phase.dropped ? "" : phase.paused ? " · paused" : ` · 48 MB/s · about ${left} s left`}
            </p>
          </div>
          <div className="flex gap-1">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPhase((p) => (p.kind === "uploading" ? { ...p, paused: !p.paused } : p))}
              disabled={phase.dropped}
            >
              {phase.paused ? <Play /> : <Pause />} {phase.paused ? "Resume" : "Pause"}
            </Button>
            <Button variant="ghost" size="icon-sm" aria-label="Cancel upload" onClick={() => setPhase({ kind: "idle" })}>
              <X />
            </Button>
          </div>
        </div>
        <Progress value={pct} className="mt-4 h-2 bg-muted [&>[data-slot=progress-indicator]]:bg-pitch" aria-label="Upload progress" />
        <div className="mt-2 flex items-center justify-between text-xs tabular">
          <span className="font-semibold">{pct}%</span>
          <span className="text-muted-foreground">Uploading in 16 MB chunks</span>
        </div>
        <div aria-live="polite" className="mt-4">
          {phase.dropped ? (
            <p className="flex items-center gap-2 rounded-md bg-muted px-3 py-2 text-[13px]">
              <WifiOff className="size-4 shrink-0" aria-hidden /> Connection dropped at {bytes(phase.loaded)}. Reconnecting. Nothing is lost.
            </p>
          ) : phase.resumedAt ? (
            <p className="flex items-center gap-2 rounded-md bg-muted px-3 py-2 text-[13px]">
              <RefreshCw className="size-4 shrink-0" aria-hidden /> Back online. Resumed from {bytes(phase.resumedAt)}.
            </p>
          ) : (
            <p className="text-[13px] text-muted-foreground">
              Uploads survive a dropped connection. If your wi-fi cuts out or you close the tab, we pick up from the last chunk.
            </p>
          )}
        </div>
      </div>
    )
  }

  if (phase.kind === "processing") {
    return (
      <div className="rounded-lg border bg-card p-5">
        <div className="flex items-center gap-4">
          <div className="w-[120px] shrink-0 sm:w-[160px]">
            <VideoThumb tone="#262626" src={phase.step >= 2 ? SAMPLE_POSTER : undefined} className="rounded-md [&_span.rounded-full]:hidden" />
          </div>
          <div className="min-w-0">
            <p className="truncate font-mono text-[13px] font-medium">{phase.name}</p>
            <p className="mt-0.5 text-[13px] text-muted-foreground">
              Uploaded {bytes(phase.size)} · about {Math.max(1, (UPLOAD_STEPS.length - 1 - phase.step) * 2)} min left
            </p>
            <p className="mt-1 text-xs text-muted-foreground">{phase.step >= 2 ? "Poster picked from the video" : "Picking a poster frame"}</p>
          </div>
        </div>
        <div className="mt-6" aria-live="polite">
          <PipelineSteps steps={UPLOAD_STEPS} current={phase.step} />
        </div>
        <p className="mt-6 text-[13px] text-muted-foreground">You can leave this page. We&apos;ll add the draft pack to Ready to review when it&apos;s done.</p>
      </div>
    )
  }

  return (
    <div className="rounded-lg border bg-card p-5">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
        <div className="relative w-[160px] shrink-0">
          <VideoThumb tone="#262626" src={SAMPLE_POSTER} className="rounded-md" />
          <CheckCircle2 className="absolute -right-2 -top-2 size-6 rounded-full bg-card text-pop-ink" aria-hidden />
        </div>
        <div className="min-w-0 flex-1">
          <p className="font-semibold">Your draft pack is ready to review</p>
          <p className="mt-0.5 text-sm text-muted-foreground">
            Article, shorts, SEO and chapters from <span className="font-mono text-[13px]">{phase.name}</span>. Nothing goes live until you publish.
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => setPhase({ kind: "idle" })}>
            Upload another
          </Button>
          <Button asChild>
            <Link href="/studio/review">Review</Link>
          </Button>
        </div>
      </div>
      <div className="mt-6">
        <PipelineSteps steps={UPLOAD_STEPS} current={UPLOAD_STEPS.length} />
      </div>
    </div>
  )
}
