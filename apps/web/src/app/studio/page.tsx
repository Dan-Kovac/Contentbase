import Link from "next/link"
import { ArrowRight, Clock, Eye, PenLine, Search, UserCheck, SquarePlay, Wallet } from "lucide-react"
import { PageHeader } from "@/components/shell/page-header"
import { VideoThumb } from "@/components/brand/media"
import { StatusBadge } from "@/components/brand/status-badge"
import { Button } from "@/components/ui/button"
import { allShorts, getEarnings, listArticles, listVideos } from "@/lib/data"
import { currentPublication } from "@/lib/publication"
import { compact, formatDuration, number } from "@/lib/format"
import { PipelineSteps } from "@/components/studio/pipeline"
import { ReviewQueue } from "@/components/studio/review-queue"
import { Sparkline } from "@/components/studio/sparkline"
import {
  etaMinutes,
  formatPct,
  hours,
  IMPORT_STEPS,
  importStepIndex,
  pctChange,
  pubScale,
  sectionLabel,
  studioDays,
  sum,
  toPack,
} from "@/components/studio/lib"

export const metadata = { title: "Home" }

export default async function StudioHome() {
  const channel = (await currentPublication())
  const packs = listVideos(channel.id, "ready").map((v) => toPack(v, channel.name))
  const earn = getEarnings(channel.id)
  const inFlight = listVideos(channel.id, "processing")
  const published = listVideos(channel.id, "published")
  const scheduled = listVideos(channel.id, "scheduled")
  const writtenLive = listArticles(channel.id).filter((a) => a.status === "published")
  const recentShorts = allShorts().filter((s) => s.channelId === channel.id && s.status === "published").slice(0, 2)

  const days = studioDays(pubScale(channel.slug))
  const now = days.slice(-30)
  const before = days.slice(-60, -30)
  const kpis = [
    { label: "Views", icon: Eye, value: compact(sum(now, "views")), change: pctChange(sum(now, "views"), sum(before, "views")), series: now.map((d) => d.views) },
    { label: "Watch time", icon: Clock, value: `${number(hours(sum(now, "watchMinutes")))} h`, change: pctChange(sum(now, "watchMinutes"), sum(before, "watchMinutes")), series: now.map((d) => d.watchMinutes) },
    { label: "Verified sign-ups", icon: UserCheck, value: number(sum(now, "signUps")), change: pctChange(sum(now, "signUps"), sum(before, "signUps")), series: now.map((d) => d.signUps) },
    { label: "Search sessions", icon: Search, value: compact(sum(now, "searchSessions")), change: pctChange(sum(now, "searchSessions"), sum(before, "searchSessions")), series: now.map((d) => d.searchSessions) },
  ]

  return (
    <div className="grid grid-cols-1 gap-10">
      <PageHeader
        title="Welcome back, Sam"
        description={
          packs.length
            ? `${channel.name}: ${packs.length === 1 ? "one draft pack is" : `${packs.length} draft packs are`} ready to review${inFlight.length ? ` and ${inFlight.length} more ${inFlight.length === 1 ? "is" : "are"} on the way` : ""}. Nothing goes live until you publish.`
            : "You're all caught up. New YouTube uploads arrive here as draft packs."
        }
        className="pb-0"
        actions={
          <>
            <Button variant="outline" asChild className="hidden sm:inline-flex">
              <Link href="/studio/analytics">View analytics</Link>
            </Button>
            <Button asChild>
              <Link href="/studio/articles/new">
                <PenLine /> Write an article
              </Link>
            </Button>
          </>
        }
      />

      <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_320px]">
        <section aria-labelledby="queue-h" className="min-w-0">
          <div className="mb-3 flex items-center justify-between gap-3">
            <h2 id="queue-h" className="flex items-center gap-2 text-lg font-semibold tracking-[-0.2px]">
              Ready to review
              <span className="rounded-sm bg-muted px-1.5 text-[13px] font-semibold tabular text-muted-foreground">{packs.length}</span>
            </h2>
            <Button variant="link" size="sm" asChild className="px-0">
              <Link href="/studio/review">
                Open queue <ArrowRight />
              </Link>
            </Button>
          </div>
          <ReviewQueue packs={packs} compact />
        </section>

        <aside className="grid content-start gap-4" aria-label="Earnings and connections">

          {earn && (
            <Link
              href="/studio/analytics#earnings"
              className="group flex flex-col gap-2 rounded-lg border bg-card p-4 outline-none transition-colors hover:bg-accent/50 focus-visible:ring-2 focus-visible:ring-ring"
            >
              <span className="flex items-center justify-between text-[13px] font-medium text-muted-foreground">
                <span className="flex items-center gap-2">
                  <Wallet className="size-4" aria-hidden /> Sponsor earnings, 30 days
                </span>
                <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" aria-hidden />
              </span>
              <span className="text-[30px] font-bold leading-9 tracking-[-0.6px]">${earn.total.toLocaleString("en-AU")}</span>
              <span className="text-xs leading-[18px] text-muted-foreground">
                <span className="font-semibold text-foreground">{formatPct(pctChange(earn.total, earn.previousTotal))}</span> vs previous 30 days.{" "}
                ${earn.ageVerified.toLocaleString("en-AU")} from age-verified sponsors. Sample data.
              </span>
            </Link>
          )}

          <p className="flex items-start gap-2 rounded-lg border bg-card p-3 text-[13px] leading-5 text-muted-foreground">
            <SquarePlay className="mt-0.5 size-4 shrink-0 text-foreground" aria-hidden />
            <span>
              <span className="font-semibold text-foreground">YouTube connected</span> · {channel.youtube?.handle} · auto-import on, last checked{" "}
              {channel.youtube?.lastSyncedAt.split(", ")[1]}.{" "}
              <Link href="/studio/settings/connections" className="font-medium text-foreground underline-offset-4 hover:underline">
                Connections
              </Link>
            </span>
          </p>

          {scheduled.length > 0 && (
            <div className="rounded-lg border bg-card p-4">
              <p className="kicker text-muted-foreground">Up next</p>
              {scheduled.map((v) => (
                <Link key={v.id} href={`/studio/review/${v.id}`} className="mt-3 block rounded-sm hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
                  <p className="text-sm font-semibold leading-5">{v.title}</p>
                  <p className="mt-1 flex items-center gap-2 text-xs text-muted-foreground">
                    <StatusBadge tone="scheduled" /> <span className="tabular">{v.scheduledFor}</span>
                  </p>
                </Link>
              ))}
            </div>
          )}
        </aside>
      </div>

      <section aria-labelledby="pipeline-h">
        <div className="mb-3 flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1">
          <h2 id="pipeline-h" className="text-lg font-semibold tracking-[-0.2px]">On the way</h2>
          <p className="text-[13px] text-muted-foreground">New uploads become draft packs automatically</p>
        </div>
        <ul className="divide-y rounded-lg border bg-card">
          {inFlight.map((v) => {
            const step = importStepIndex(v.pipelineStep)
            return (
              <li key={v.id} className="grid gap-4 p-4 md:grid-cols-[minmax(0,280px)_minmax(0,1fr)] md:items-center md:gap-8">
                <div className="flex min-w-0 items-center gap-3">
                  <div className="w-[96px] shrink-0">
                    <VideoThumb tone={v.posterTone} src={v.poster} />
                  </div>
                  <div className="min-w-0">
                    <p className="line-clamp-2 text-sm font-semibold leading-5">{v.title}</p>
                    <p className="mt-0.5 text-xs text-muted-foreground tabular">
                      {formatDuration(v.durationSec)} · {sectionLabel(v.section)} · about {etaMinutes(v)} min left
                    </p>
                  </div>
                </div>
                <PipelineSteps steps={IMPORT_STEPS} current={step} />
              </li>
            )
          })}
        </ul>
      </section>

      <section aria-labelledby="numbers-h">
        <div className="mb-3 flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1">
          <h2 id="numbers-h" className="text-lg font-semibold tracking-[-0.2px]">Last 30 days</h2>
          <Link href="/studio/analytics" className="text-[13px] font-medium text-muted-foreground hover:text-foreground hover:underline">
            Compared with the 30 days before
          </Link>
        </div>
        <div className="grid grid-cols-1 gap-px overflow-hidden rounded-lg border bg-border sm:grid-cols-2 xl:grid-cols-4">
          {kpis.map((k) => (
            <div key={k.label} className="flex flex-col gap-3 bg-card p-4">
              <p className="flex items-center gap-2 text-[13px] font-medium text-muted-foreground">
                <k.icon className="size-4" aria-hidden /> {k.label}
              </p>
              <div className="flex items-end justify-between gap-3">
                <div className="min-w-0">
                  <p className="whitespace-nowrap text-[28px] font-bold leading-8 tracking-[-0.6px] tabular">{k.value}</p>
                  <p className="mt-1 text-xs text-muted-foreground tabular">
                    <span className="font-semibold text-foreground">{formatPct(k.change)}</span> vs previous 30 days
                  </p>
                </div>
                <Sparkline values={k.series} width={96} className="shrink-0" />
              </div>
            </div>
          ))}
        </div>
      </section>

      <section aria-labelledby="recent-h">
        <div className="mb-3 flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1">
          <h2 id="recent-h" className="text-lg font-semibold tracking-[-0.2px]">Recently published</h2>
          <Button variant="link" size="sm" asChild className="px-0">
            <Link href="/studio/library">
              Library <ArrowRight />
            </Link>
          </Button>
        </div>
        <ul className="divide-y rounded-lg border bg-card">
          {published.map((v) => (
            <li key={v.id}>
              <Link href={`/studio/review/${v.id}`} className="flex items-center gap-4 p-3 hover:bg-accent/60 focus-visible:bg-accent focus-visible:outline-none sm:px-4">
                <div className="w-[88px] shrink-0">
                  <VideoThumb tone={v.posterTone} src={v.poster} />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold">{v.title}</p>
                  <p className="mt-0.5 text-xs text-muted-foreground">
                    Video and article · {sectionLabel(v.section)} · {v.publishedAt}
                  </p>
                </div>
                <div className="hidden items-center gap-2 sm:flex">{v.exclusive && <StatusBadge tone="exclusive" />}</div>
                <div className="text-right">
                  <p className="text-sm font-semibold tabular">{compact(v.views)}</p>
                  <p className="text-xs text-muted-foreground">views</p>
                </div>
              </Link>
            </li>
          ))}
          {writtenLive.map((a) => (
            <li key={a.id}>
              <Link href={`/studio/articles/${a.id}`} className="flex items-center gap-4 p-3 hover:bg-accent/60 focus-visible:bg-accent focus-visible:outline-none sm:px-4">
                <div className="w-[88px] shrink-0">
                  <VideoThumb tone="#262626" src={a.hero} className="[&_span.rounded-full]:hidden" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold">{a.headline}</p>
                  <p className="mt-0.5 text-xs text-muted-foreground">
                    Written article · {sectionLabel(a.section)} · {a.publishedAt}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-semibold tabular">{a.readMinutes} min</p>
                  <p className="text-xs text-muted-foreground">read</p>
                </div>
              </Link>
            </li>
          ))}
          {recentShorts.map((s) => (
            <li key={s.id}>
              <Link href={`/studio/shorts/${s.id}`} className="flex items-center gap-4 p-3 hover:bg-accent/60 focus-visible:bg-accent focus-visible:outline-none sm:px-4">
                <div className="flex w-[88px] shrink-0 justify-center">
                  <div className="w-[28px]">
                    <VideoThumb tone={s.posterTone} src={s.poster} ratio="9/16" className="[&_span]:hidden" />
                  </div>
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold">{s.title}</p>
                  <p className="mt-0.5 text-xs text-muted-foreground">
                    Short · {s.source === "youtube_short" ? "From your YouTube Shorts" : "Cut from a video"}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-semibold tabular">{compact(s.views)}</p>
                  <p className="text-xs text-muted-foreground">views</p>
                </div>
              </Link>
            </li>
          ))}
        </ul>
      </section>
    </div>
  )
}
