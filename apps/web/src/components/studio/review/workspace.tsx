"use client"

import Link from "next/link"
import { useCallback, useEffect, useMemo, useRef, useState } from "react"
import { toast } from "sonner"
import { CalendarClock, ChevronLeft, Eye, Loader2, Lock, TriangleAlert } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { StatusBadge } from "@/components/brand/status-badge"
import { formatDuration } from "@/lib/format"
import type { ContentStatus, Short, Video } from "@/lib/types"
import { ScheduleDialog } from "../schedule-dialog"
import { sectionLabel } from "../lib"
import { ArticleEditor } from "./article-editor"
import { ShortsReview, type Clip } from "./shorts-review"
import { SeoPanel, type SeoState } from "./seo-panel"
import { TranscriptPanel } from "./transcript-panel"
import { ArticlePreview, GatePreview } from "./previews"
import type { ArticleState, ArticleUpdate } from "./types"

interface Channel {
  name: string
  slug: string
  domain: string
}

function initialArticle(v: Video): ArticleState {
  const ids = v.article.blocks.map((_, i) => `b${i}`)
  return {
    headlineOptions: v.article.headlineOptions,
    headline: v.article.headline,
    standfirst: v.article.standfirst,
    blocks: v.article.blocks.map((block, i) => ({ id: ids[i], block })),
    keyPoints: v.article.keyPoints,
    flags: v.article.complianceFlags.map((f) => ({ ...f, blockId: ids[f.blockIndex], state: "open" as const })),
    chapters: v.chapters,
  }
}

export function ReviewWorkspace({ video, channel, shorts }: { video: Video; channel: Channel; shorts: Short[] }) {
  // ----- Article with undo history -----
  const [hist, setHist] = useState(() => ({ past: [] as ArticleState[], present: initialArticle(video), future: [] as ArticleState[] }))
  const lastPush = useRef(0)
  const update: ArticleUpdate = useCallback((fn, opts) => {
    // Typing is grouped into undo steps at most every 2 s; structural edits always record one.
    const now = performance.now()
    const record = !!opts?.history || now - lastPush.current > 2000
    if (record) lastPush.current = now
    setHist((h) => {
      const next = fn(h.present)
      if (next === h.present) return h
      if (!record) return { ...h, present: next }
      return { past: [...h.past.slice(-49), h.present], present: next, future: [] }
    })
  }, [])
  const undo = () => setHist((h) => (h.past.length ? { past: h.past.slice(0, -1), present: h.past[h.past.length - 1], future: [h.present, ...h.future] } : h))
  const redo = () => setHist((h) => (h.future.length ? { past: [...h.past, h.present], present: h.future[0], future: h.future.slice(1) } : h))
  const article = hist.present

  // ----- Shorts, SEO, flags -----
  const [clips, setClipsState] = useState<Clip[]>(() =>
    shorts.map((s) => ({
      id: s.id,
      title: s.title,
      caption: s.caption,
      start: s.startSec ?? 0,
      end: s.endSec ?? (s.startSec ?? 0) + s.durationSec,
      tone: s.posterTone,
      poster: s.poster,
      include: true,
    })),
  )
  const setClips = (fn: (c: Clip[]) => Clip[]) => setClipsState(fn)
  const [seo, setSeoState] = useState<SeoState>({
    titleTag: video.seo.titleTag,
    metaDescription: video.seo.metaDescription,
    slug: video.seo.slug,
    altText: `${video.title}: still from the video`,
    thumb: 0,
    customThumb: null,
  })
  const setSeo = (fn: (s: SeoState) => SeoState) => setSeoState(fn)

  const frames = useMemo(() => {
    const at = video.chapters.length >= 3 ? video.chapters.slice(0, 3).map((c) => c.start + 8) : [12, Math.round(video.durationSec / 3), Math.round((video.durationSec * 2) / 3)]
    const tones = [video.posterTone, shorts[1]?.posterTone ?? "#262626", shorts[2]?.posterTone ?? "#0e5a3a"]
    const srcs = [video.poster, shorts[1]?.poster, shorts[2]?.poster]
    return at.map((a, i) => ({ at: a, tone: tones[i], src: srcs[i] ?? video.poster }))
  }, [video, shorts])

  // ----- Status -----
  const [status, setStatus] = useState<ContentStatus>(video.status)
  const [scheduledFor, setScheduledFor] = useState(video.scheduledFor)
  const [exclusive, setExclusive] = useState(video.exclusive)
  const [tab, setTab] = useState("article")
  const [scheduleOpen, setScheduleOpen] = useState(false)
  const [previewOpen, setPreviewOpen] = useState(false)
  const [gateOpen, setGateOpen] = useState(false)
  const [blocked, setBlocked] = useState(false)

  // ----- Autosave indicator (EDT-01) -----
  const [saving, setSaving] = useState(false)
  const first = useRef(true)
  useEffect(() => {
    if (first.current) {
      first.current = false
      return
    }
    setSaving(true)
    const t = window.setTimeout(() => setSaving(false), 700)
    return () => window.clearTimeout(t)
  }, [article, clips, seo, exclusive])

  const openFlags = article.flags.filter((f) => f.state === "open")
  const live = status === "published"

  const publish = () => {
    if (openFlags.length) {
      setBlocked(true)
      return
    }
    const wasLive = live
    setStatus("published")
    setScheduledFor(undefined)
    toast.success(wasLive ? "Updated" : "Published", {
      description: wasLive ? "Your changes are live." : `${article.headline} is live on ${channel.domain}.`,
      action: { label: "View", onClick: () => window.open(`/c/${channel.slug}`, "_blank") },
    })
  }

  const schedule = () => {
    if (openFlags.length) {
      setBlocked(true)
      return
    }
    setScheduleOpen(true)
  }

  const includedShorts = clips.filter((c) => c.include).length

  return (
    <div className="flex min-h-[calc(100svh-8rem)] flex-col">
      <div className="mb-6">
        <Link
          href="/studio/review"
          className="-ml-1 inline-flex items-center gap-1 rounded-sm text-[13px] font-medium text-muted-foreground hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          <ChevronLeft className="size-4" aria-hidden /> Ready to review
        </Link>
        <div className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-2">
          <StatusBadge tone={status} />
          {exclusive && <StatusBadge tone="exclusive" />}
          {status === "scheduled" && scheduledFor && <span className="text-[13px] text-muted-foreground tabular">{scheduledFor}</span>}
        </div>
        <h1 className="mt-2 max-w-[40ch] text-[28px] font-bold leading-[34px] tracking-[-0.6px] sm:text-[30px]">{article.headline}</h1>
        <p className="mt-1.5 text-[14px] text-muted-foreground">
          {channel.name} · {sectionLabel(video.section)} · {video.source === "youtube" ? "From YouTube" : "Uploaded"} {video.sourcePublishedAt} ·{" "}
          <span className="font-mono text-[13px] tabular">{formatDuration(video.durationSec)}</span>
        </p>
      </div>

      <Tabs value={tab} onValueChange={setTab} className="flex-1 gap-6">
        <div className="-mx-4 overflow-x-auto border-b px-4 md:mx-0 md:px-0">
          <TabsList variant="line" className="h-10 gap-4 p-0">
            <TabsTrigger value="article" className="flex-none px-0.5">
              Article
              {openFlags.length > 0 && (
                <span className="grid h-[18px] min-w-[18px] place-items-center rounded-full bg-destructive px-1 text-[11px] font-bold text-destructive-foreground tabular" aria-label={`${openFlags.length} flags`}>
                  {openFlags.length}
                </span>
              )}
            </TabsTrigger>
            <TabsTrigger value="shorts" className="flex-none px-0.5">
              Shorts <span className="text-muted-foreground tabular">{clips.length}</span>
            </TabsTrigger>
            <TabsTrigger value="seo" className="flex-none px-0.5">
              SEO &amp; thumbnail
            </TabsTrigger>
            <TabsTrigger value="transcript" className="flex-none px-0.5">
              Transcript
            </TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="article" className="pt-2">
          <ArticleEditor
            article={article}
            update={update}
            title={video.title}
            videoTone={video.posterTone}
            poster={video.poster}
            durationSec={video.durationSec}
            source={video.source}
            canUndo={hist.past.length > 0}
            canRedo={hist.future.length > 0}
            onUndo={undo}
            onRedo={redo}
          />
        </TabsContent>
        <TabsContent value="shorts" className="pt-2">
          <ShortsReview
            clips={clips}
            setClips={setClips}
            source={video.source}
            slug={video.slug}
            durationSec={video.durationSec}
            chapters={article.chapters}
            poster={video.poster}
          />
        </TabsContent>
        <TabsContent value="seo" className="pt-2">
          <SeoPanel seo={seo} setSeo={setSeo} domain={channel.domain} channelName={channel.name} headline={article.headline} frames={frames} />
        </TabsContent>
        <TabsContent value="transcript" className="pt-2">
          <TranscriptPanel lines={video.transcript} source={video.source} durationSec={video.durationSec} />
        </TabsContent>
      </Tabs>

      {/* Sticky action bar */}
      <div className="sticky bottom-0 z-10 -mx-4 mt-12 border-t bg-background/95 px-4 py-3 backdrop-blur md:-mx-8 md:px-8">
        <div className="flex flex-wrap items-center gap-x-6 gap-y-3">
          <p className="flex min-w-[88px] items-center gap-1.5 text-[13px] text-muted-foreground" aria-live="polite">
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
          <div className="flex items-center gap-2.5">
            <Switch id="exclusive" checked={exclusive} onCheckedChange={setExclusive} aria-describedby="exclusive-help" />
            <Label htmlFor="exclusive" className="flex items-center gap-1.5 text-[13px] font-medium">
              <Lock className="size-3.5" aria-hidden /> Exclusive
              <span id="exclusive-help" className="hidden font-normal text-muted-foreground lg:inline">
                (signed-in only)
              </span>
            </Label>
            <button
              type="button"
              onClick={() => setGateOpen(true)}
              className="hidden rounded-sm text-[13px] font-medium text-muted-foreground underline underline-offset-4 hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring md:inline"
            >
              See what logged-out visitors see
            </button>
          </div>
          {openFlags.length > 0 && (
            <button
              type="button"
              onClick={() => setTab("article")}
              className="flex items-center gap-1.5 rounded-sm text-[13px] font-medium text-destructive hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              <TriangleAlert className="size-3.5" aria-hidden /> {openFlags.length} {openFlags.length === 1 ? "flag" : "flags"} to resolve
            </button>
          )}
          <div className="ml-auto flex items-center gap-2">
            <Button variant="ghost" onClick={() => setPreviewOpen(true)}>
              <Eye /> <span className="hidden sm:inline">Preview</span>
              <span className="sr-only sm:hidden">Preview</span>
            </Button>
            {!live && (
              <Button variant="outline" onClick={schedule}>
                <CalendarClock /> Schedule
              </Button>
            )}
            <Button variant="pop" onClick={publish}>
              {live ? "Update" : "Publish"}
            </Button>
          </div>
        </div>
        <button
          type="button"
          onClick={() => setGateOpen(true)}
          className="mt-2 rounded-sm text-[13px] font-medium text-muted-foreground underline underline-offset-4 md:hidden"
        >
          See what logged-out visitors see
        </button>
      </div>

      <ScheduleDialog
        open={scheduleOpen}
        onOpenChange={setScheduleOpen}
        itemTitle={article.headline}
        onSchedule={(when) => {
          setStatus("scheduled")
          setScheduledFor(when)
          toast.success("Scheduled", { description: `Goes live ${when}, Melbourne time, with ${includedShorts} shorts.` })
        }}
      />

      <ArticlePreview
        open={previewOpen}
        onOpenChange={setPreviewOpen}
        article={article}
        video={video}
        channelName={channel.name}
        exclusive={exclusive}
      />
      <GatePreview open={gateOpen} onOpenChange={setGateOpen} headline={article.headline} standfirst={article.standfirst} tone={video.posterTone} poster={video.poster} exclusive={exclusive} />

      <AlertDialog open={blocked} onOpenChange={setBlocked}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Resolve {openFlags.length === 1 ? "one flag" : `${openFlags.length} flags`} first</AlertDialogTitle>
            <AlertDialogDescription>
              The compliance pre-check found betting language in this draft. Fix or dismiss each flag, then publish.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <ul className="grid gap-2 text-[13px]">
            {openFlags.map((f) => (
              <li key={f.id} className="rounded-md bg-muted px-3 py-2">
                <span className="font-serif italic">&ldquo;{f.excerpt}&rdquo;</span>
              </li>
            ))}
          </ul>
          <AlertDialogFooter>
            <AlertDialogCancel>Close</AlertDialogCancel>
            <AlertDialogAction onClick={() => setTab("article")}>Show flags</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
