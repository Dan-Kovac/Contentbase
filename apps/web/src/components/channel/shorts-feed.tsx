"use client"

import { useEffect, useEffectEvent, useRef, useState } from "react"
import Link from "next/link"
import { useSearchParams } from "next/navigation"
import { ChevronDown, ChevronUp, MonitorPlay, Pause, Play, SquarePlay } from "lucide-react"
import { AgeTag, OptOut, SponsoredShortCard } from "@/components/brand/native-ads"
import { VideoThumb } from "@/components/brand/media"
import { Button } from "@/components/ui/button"
import { compact, formatDuration } from "@/lib/format"
import { cn } from "@/lib/utils"
import type { Sponsor } from "@/lib/types"
import { useViewer, type Viewer } from "./viewer"

export interface FeedShort {
  id: string
  title: string
  caption: string
  durationSec: number
  posterTone: string
  poster?: string
  /** YouTube Shorts play in the vertical YouTube embed; clips cut from uploaded masters play in our player. */
  source: "youtube_short" | "clip"
  sourceLabel: string
  parentHref?: string
  startSec?: number
  views: number
}

type FeedItem = { kind: "short"; short: FeedShort } | { kind: "ad"; key: string }

/** Every 8th card in the sequence may be sponsored, never more often (page anatomy: short page). */
export function buildFeed(shorts: FeedShort[]): FeedItem[] {
  const out: FeedItem[] = []
  shorts.forEach((short, i) => {
    out.push({ kind: "short", short })
    if ((i + 1) % 7 === 0) out.push({ kind: "ad", key: `ad-${i}` })
  })
  return out
}

export function ShortsFeedFromParams(props: { shorts: FeedShort[]; channelName: string; sponsor: Record<Viewer, Sponsor> }) {
  const params = useSearchParams()
  return <ShortsFeed {...props} initialId={params.get("s") ?? undefined} />
}

export function ShortsFeed({
  shorts,
  channelName,
  initialId,
  sponsor: sponsorOptions,
}: {
  shorts: FeedShort[]
  channelName: string
  initialId?: string
  /** The sponsored short for each viewer state, decided on the server. */
  sponsor: Record<Viewer, Sponsor>
}) {
  const { viewer } = useViewer()
  const sponsor = sponsorOptions[viewer]
  const feed = buildFeed(shorts)
  const start = Math.max(0, feed.findIndex((f) => f.kind === "short" && f.short.id === initialId))
  const [index, setIndex] = useState(start)
  const [playing, setPlaying] = useState(false)
  const [t, setT] = useState(0)
  const touchY = useRef<number | null>(null)
  const item = feed[index]

  const go = (d: number) => {
    setIndex((i) => Math.min(feed.length - 1, Math.max(0, i + d)))
    setT(0)
    setPlaying(false)
  }

  const onKey = useEffectEvent((e: KeyboardEvent) => {
    const tag = (e.target as HTMLElement)?.tagName
    if (tag === "INPUT" || tag === "TEXTAREA") return
    if (e.key === "ArrowDown" || e.key === "j") {
      e.preventDefault()
      go(1)
    } else if (e.key === "ArrowUp" || e.key === "k") {
      e.preventDefault()
      go(-1)
    }
  })

  useEffect(() => {
    const handler = (e: KeyboardEvent) => onKey(e)
    window.addEventListener("keydown", handler)
    return () => window.removeEventListener("keydown", handler)
  }, [])

  useEffect(() => {
    if (!playing || item.kind !== "short") return
    const id = window.setInterval(() => {
      setT((x) => {
        if (x + 1 >= item.short.durationSec) {
          setPlaying(false)
          return item.short.durationSec
        }
        return x + 1
      })
    }, 1000)
    return () => window.clearInterval(id)
  }, [playing, item])

  const upNext = feed.slice(index + 1, index + 4)

  return (
    <div className="mx-auto grid max-w-[1080px] gap-6 px-4 py-6 md:px-8 lg:grid-cols-[1fr_auto_1fr] lg:items-start">
      <div className="hidden lg:block" />
      <div className="flex flex-col items-center">
        <div
          className="relative aspect-[9/16] h-[calc(100svh-240px)] max-h-[780px] min-h-[440px] max-w-full overflow-hidden rounded-lg bg-brand-black"
          onTouchStart={(e) => (touchY.current = e.touches[0].clientY)}
          onTouchEnd={(e) => {
            if (touchY.current === null) return
            const dy = touchY.current - e.changedTouches[0].clientY
            if (Math.abs(dy) > 50) go(dy > 0 ? 1 : -1)
            touchY.current = null
          }}
          aria-roledescription="carousel"
          aria-label={`${channelName} shorts`}
        >
          {item.kind === "short" ? (
            <>
              <VideoThumb tone={item.short.posterTone} src={item.short.poster} ratio="9/16" className="h-full rounded-none" />
              <button
                type="button"
                onClick={() => setPlaying((p) => !p)}
                aria-label={playing ? `Pause ${item.short.title}` : `Play ${item.short.title}`}
                className="absolute inset-0 z-10 grid place-items-center outline-none focus-visible:ring-4 focus-visible:ring-inset focus-visible:ring-white"
              >
                <span
                  className={cn(
                    "grid size-16 place-items-center rounded-full text-white backdrop-blur-sm",
                    item.short.source === "youtube_short" ? "bg-[#c4302b]/90" : "bg-black/50",
                    playing && "opacity-0",
                  )}
                >
                  {playing ? <Pause className="size-7 fill-current" /> : <Play className="ml-1 size-7 fill-current" />}
                </span>
              </button>
              <span className="absolute left-3 top-3 z-20 inline-flex items-center gap-1.5 rounded-[2px] bg-black/70 px-2 py-1 text-[11px] font-bold uppercase tracking-[0.8px] text-white">
                {item.short.source === "youtube_short" ? <SquarePlay className="size-3.5" aria-hidden /> : <MonitorPlay className="size-3.5" aria-hidden />}
                {item.short.source === "youtube_short" ? "YouTube player" : "Clip"}
              </span>
              {/* Clips we render carry burned-in captions. YouTube Shorts show their own, inside the embed. */}
              {item.short.source === "clip" && <p className="pointer-events-none absolute inset-x-4 bottom-[22%] z-20 text-center text-[19px] font-extrabold leading-[26px] text-white [text-shadow:0_2px_8px_rgba(0,0,0,0.7)]">
                <span className="box-decoration-clone bg-black/55 px-1.5">{item.short.caption}</span>
              </p>}
              <div className="absolute inset-x-0 bottom-0 z-20 h-1 bg-white/25">
                <div className="h-full bg-[var(--chan)]" style={{ width: `${(t / item.short.durationSec) * 100}%` }} />
              </div>
            </>
          ) : (
            // A sponsored short fills the same 9:16 frame as every short in the feed.
            <SponsoredShortCard key={sponsor.id} sponsor={sponsor} variant="feed" />
          )}
        </div>

        <div className="mt-4 w-full max-w-[440px]" aria-live="polite">
          {item.kind === "short" ? (
            <>
              <h1 className="text-[20px] font-bold leading-[26px]">{item.short.title}</h1>
              <p className="mt-1 text-[15px] leading-[22px] text-foreground/80">{item.short.caption}</p>
              <p className="mt-2 text-[13px] text-muted-foreground">
                {item.short.parentHref ? (
                  <Link href={item.short.parentHref} className="underline decoration-[var(--chan)] decoration-2 underline-offset-4 hover:decoration-foreground">
                    {item.short.sourceLabel}
                  </Link>
                ) : (
                  item.short.sourceLabel
                )}
                {item.short.views > 0 && <> · {compact(item.short.views)} views</>}
                {" · "}
                <span className="font-mono tabular">{formatDuration(item.short.durationSec)}</span>
              </p>
            </>
          ) : (
            <>
              <h1 className="text-[20px] font-bold leading-[26px]">{sponsor.line}</h1>
              <p className="mt-1 flex flex-wrap items-center gap-2 text-[13px] text-muted-foreground">
                <span className="text-[11px] font-bold uppercase tracking-[1px]">Sponsored</span> · <span className="font-semibold text-foreground">{sponsor.name}</span>
                <AgeTag category={sponsor.ageCategory} />
                <OptOut category={sponsor.ageCategory} className="text-muted-foreground" />
              </p>
            </>
          )}
        </div>

        <div className="mt-5 flex w-full max-w-[440px] items-center justify-between gap-3 lg:hidden">
          <Button variant="outline" onClick={() => go(-1)} disabled={index === 0}>
            <ChevronUp aria-hidden /> Previous
          </Button>
          <span className="text-[13px] text-muted-foreground tabular">
            {index + 1} of {feed.length}
          </span>
          <Button onClick={() => go(1)} disabled={index === feed.length - 1}>
            Next <ChevronDown aria-hidden />
          </Button>
        </div>
        <p className="mt-3 text-[12px] text-muted-foreground lg:hidden">Swipe up for the next short</p>
      </div>

      <aside className="hidden flex-col gap-6 lg:flex" aria-label="Feed controls">
        <div className="flex flex-col gap-2">
          <Button variant="outline" size="icon-lg" onClick={() => go(-1)} disabled={index === 0} aria-label="Previous short">
            <ChevronUp />
          </Button>
          <Button size="icon-lg" onClick={() => go(1)} disabled={index === feed.length - 1} aria-label="Next short">
            <ChevronDown />
          </Button>
          <span className="mt-1 text-[13px] text-muted-foreground tabular">
            {index + 1} of {feed.length}
          </span>
          <span className="text-[12px] text-muted-foreground">Use the arrow keys too</span>
        </div>
        {upNext.length > 0 && (
          <div>
            <h2 className="kicker mb-3 text-foreground">Up next</h2>
            <ol className="flex flex-col gap-3">
              {upNext.map((f, i) => (
                <li key={f.kind === "short" ? f.short.id : f.key}>
                  <button
                    type="button"
                    onClick={() => go(i + 1)}
                    className="flex w-[220px] items-center gap-3 rounded-md p-1 text-left outline-none hover:bg-accent focus-visible:ring-2 focus-visible:ring-ring"
                  >
                    <span className="w-10 shrink-0">
                      {f.kind === "short" ? (
                        f.short.poster ? (
                          // eslint-disable-next-line @next/next/no-img-element -- prototype media
                          <img src={f.short.poster} alt="" className="block aspect-[9/16] w-10 rounded-[3px] object-cover" loading="lazy" />
                        ) : (
                          <span className="block aspect-[9/16] w-10 rounded-[3px]" style={{ background: f.short.posterTone }} />
                        )
                      ) : (
                        <span className="block aspect-[9/16] w-10 rounded-[3px]" style={{ background: sponsor.colour }} />
                      )}
                    </span>
                    <span className="line-clamp-2 text-[14px] font-medium leading-[19px]">
                      {f.kind === "short" ? f.short.title : `Sponsored · ${sponsor.name}`}
                    </span>
                  </button>
                </li>
              ))}
            </ol>
          </div>
        )}
      </aside>
    </div>
  )
}
