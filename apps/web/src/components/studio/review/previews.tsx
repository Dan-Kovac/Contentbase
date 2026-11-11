"use client"

import { Lock } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet"
import { VideoThumb } from "@/components/brand/media"
import { StatusBadge } from "@/components/brand/status-badge"
import { formatDuration } from "@/lib/format"
import type { Video } from "@/lib/types"
import { sectionLabel } from "../lib"
import type { ArticleState } from "./types"

/** How the video page will read once published. */
export function ArticlePreview({
  open,
  onOpenChange,
  article,
  video,
  channelName,
  exclusive,
}: {
  open: boolean
  onOpenChange: (o: boolean) => void
  article: ArticleState
  video: Video
  channelName: string
  exclusive: boolean
}) {
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-full gap-0 overflow-y-auto sm:max-w-[720px]">
        <SheetHeader className="border-b">
          <SheetTitle>Preview</SheetTitle>
          <SheetDescription>The video page as signed-in visitors will see it on {channelName}.</SheetDescription>
        </SheetHeader>
        <article className="mx-auto w-full max-w-[68ch] px-5 py-8">
          <div className="flex items-center gap-2">
            <span className="kicker">{sectionLabel(video.section)}</span>
            {exclusive && <StatusBadge tone="exclusive" />}
          </div>
          <h1 className="mt-3 text-[32px] font-extrabold leading-[36px] tracking-[-0.8px]">{article.headline}</h1>
          <p className="mt-3 font-serif text-[19px] leading-[28px] text-muted-foreground">{article.standfirst}</p>
          <p className="mt-4 text-[13px] text-muted-foreground">
            By <span className="font-semibold text-foreground">{video.article.author}</span> · {video.article.readMinutes} min read
          </p>
          <div className="mt-6">
            <VideoThumb tone={video.posterTone} src={video.poster} durationSec={video.durationSec} />
            {article.chapters.length > 0 && (
              <ol className="mt-3 flex flex-wrap gap-2">
                {article.chapters.map((c, i) => (
                  <li key={i} className="rounded-sm border px-2 py-1 text-xs">
                    <span className="font-mono text-muted-foreground tabular">{formatDuration(c.start)}</span> {c.title}
                  </li>
                ))}
              </ol>
            )}
          </div>
          {article.keyPoints.filter(Boolean).length > 0 && (
            <div className="mt-8 rounded-lg bg-muted p-4">
              <p className="kicker">Key points</p>
              <ul className="mt-2 grid list-disc gap-1 pl-5 text-[15px] leading-[22px]">
                {article.keyPoints.filter(Boolean).map((k) => (
                  <li key={k}>{k}</li>
                ))}
              </ul>
            </div>
          )}
          <div className="mt-8 grid gap-5 font-serif text-[18px] leading-[30px]">
            {article.blocks.map(({ id, block: b }) => {
              switch (b.type) {
                case "paragraph":
                  return <p key={id}>{b.text}</p>
                case "heading":
                  return (
                    <h2 key={id} className="mt-3 font-sans text-[24px] font-bold leading-[30px] tracking-[-0.4px]">
                      {b.text}
                    </h2>
                  )
                case "quote":
                  return (
                    <blockquote key={id} className="border-l-[3px] border-foreground pl-4 text-[22px] italic leading-[32px]">
                      {b.text}
                      {b.cite && <footer className="mt-2 font-sans text-[13px] font-semibold not-italic text-muted-foreground">{b.cite}</footer>}
                    </blockquote>
                  )
                case "list":
                  return (
                    <ul key={id} className="grid list-disc gap-1 pl-6">
                      {b.items.map((it, i) => (
                        <li key={i}>{it}</li>
                      ))}
                    </ul>
                  )
                case "divider":
                  return <hr key={id} className="my-2" />
                case "image":
                  return b.src ? (
                    <figure key={id} className="grid gap-2">
                      {/* eslint-disable-next-line @next/next/no-img-element -- prototype media */}
                      <img src={b.src} alt={b.caption} className="aspect-[3/2] w-full rounded-lg object-cover" />
                      {b.caption && <figcaption className="font-sans text-[13px] text-muted-foreground">{b.caption}</figcaption>}
                    </figure>
                  ) : null
                default:
                  return null
              }
            })}
          </div>
        </article>
      </SheetContent>
    </Sheet>
  )
}

/** EDT-05: what a logged-out visitor sees on an Exclusive item. No ads on the gate. */
export function GatePreview({
  open,
  onOpenChange,
  headline,
  standfirst,
  tone,
  poster,
  exclusive,
}: {
  open: boolean
  onOpenChange: (o: boolean) => void
  headline: string
  standfirst: string
  tone: string
  poster?: string
  exclusive: boolean
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="gap-0 overflow-hidden p-0 sm:max-w-[560px]">
        <DialogHeader className="border-b px-5 py-4">
          <DialogTitle>What logged-out visitors see</DialogTitle>
          <DialogDescription>
            {exclusive ? "Exclusive is on. Visitors see the headline and a sign-in prompt." : "Exclusive is off, so everyone sees the full page. Turn it on to show this instead."}
          </DialogDescription>
        </DialogHeader>
        <div className="relative px-5 pb-6 pt-5">
          <p className="text-[22px] font-extrabold leading-[28px] tracking-[-0.4px]">{headline}</p>
          <p className="mt-2 font-serif text-[16px] leading-[24px] text-muted-foreground">{standfirst}</p>
          <div className="relative mt-4">
            <div className="blur-[6px]" aria-hidden>
              <VideoThumb tone={tone} src={poster} />
            </div>
            <div className="absolute inset-0 grid place-items-center p-4">
              <div className="w-full max-w-[320px] rounded-lg border bg-background p-5 text-center shadow-popover">
                <span className="mx-auto grid size-9 place-items-center rounded-full bg-muted">
                  <Lock className="size-4" aria-hidden />
                </span>
                <p className="mt-3 text-[17px] font-bold">Sign in to watch</p>
                <p className="mt-1 text-[13px] text-muted-foreground">Free. One account for every Homestand channel.</p>
                <Button className="mt-4 w-full" tabIndex={-1}>
                  Sign in to watch
                </Button>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
