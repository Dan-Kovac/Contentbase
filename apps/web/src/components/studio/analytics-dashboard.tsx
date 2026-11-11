"use client"

import { useEffect, useMemo, useRef, useState } from "react"
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { VideoThumb } from "@/components/brand/media"
import { compact, number } from "@/lib/format"
import { cn } from "@/lib/utils"
import { formatPct, linePoints, niceMax, pathFrom, pctChange, type StudioDay } from "./lib"

type Range = 7 | 30 | 90
type MetricKey = "views" | "watchMinutes" | "verified" | "signUps" | "searchSessions"

const METRICS: { key: MetricKey; label: string; unit?: string; total: "sum" | "last" }[] = [
  { key: "views", label: "Views", total: "sum" },
  { key: "watchMinutes", label: "Watch time", unit: "h", total: "sum" },
  { key: "verified", label: "Verified users", total: "last" },
  { key: "signUps", label: "Sign-ups", total: "sum" },
  { key: "searchSessions", label: "Search traffic", total: "sum" },
]

const SOURCES = [
  { name: "Search", color: "var(--chart-1)" },
  { name: "YouTube", color: "var(--chart-2)" },
  { name: "Direct", color: "var(--chart-3)" },
  { name: "Social", color: "var(--chart-4)" },
] as const
const SHARES: Record<Range, number[]> = { 7: [41, 28, 19, 12], 30: [38, 31, 19, 12], 90: [34, 35, 19, 12] }

export interface TopItem {
  id: string
  title: string
  kind: "Video" | "Short"
  views: number
  watchMinutes: number
  tone: string
}

function valueOf(rows: StudioDay[], m: (typeof METRICS)[number]) {
  if (!rows.length) return 0
  if (m.total === "last") return rows[rows.length - 1][m.key]
  const s = rows.reduce((a, r) => a + r[m.key], 0)
  return m.key === "watchMinutes" ? Math.round(s / 60) : s
}

function display(v: number, m: (typeof METRICS)[number]) {
  if (m.key === "watchMinutes") return `${number(v)} h`
  return v >= 100_000 ? compact(v) : number(v)
}

/** ANL-01: the creator dashboard. */
export function AnalyticsDashboard({ days, top }: { days: StudioDay[]; top: TopItem[] }) {
  const [range, setRange] = useState<Range>(30)
  const [metric, setMetric] = useState<MetricKey>("views")
  const m = METRICS.find((x) => x.key === metric)!

  const now = days.slice(-range)
  const prev = days.length >= range * 2 ? days.slice(-range * 2, -range) : null

  const total = valueOf(now, m)
  const totalViews = now.reduce((a, r) => a + r.views, 0)
  const shares = SHARES[range]
  const factor = range === 7 ? 0.62 : 1

  return (
    <div className="grid gap-8">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <ToggleGroup
          type="single"
          variant="outline"
          value={String(range)}
          onValueChange={(v) => v && setRange(Number(v) as Range)}
          aria-label="Date range"
        >
          <ToggleGroupItem value="7" className="px-3">Last 7 days</ToggleGroupItem>
          <ToggleGroupItem value="30" className="px-3">Last 30 days</ToggleGroupItem>
          <ToggleGroupItem value="90" className="px-3">Last 90 days</ToggleGroupItem>
        </ToggleGroup>
        <p className="text-[13px] text-muted-foreground tabular">
          {now[0].long} to {now[now.length - 1].long} · updated hourly
        </p>
      </div>

      {/* KPI tiles double as the chart's metric picker */}
      <div role="tablist" aria-label="Metric" className="grid grid-cols-2 gap-px overflow-hidden rounded-lg border bg-border md:grid-cols-3 xl:grid-cols-5">
        {METRICS.map((x) => {
          const v = valueOf(now, x)
          const p = prev ? valueOf(prev, x) : null
          const change = x.total === "last" && prev ? pctChange(v - prev[prev.length - 1][x.key], prev[prev.length - 1][x.key] - prev[0][x.key]) : p != null ? pctChange(v, p) : null
          const on = x.key === metric
          return (
            <button
              key={x.key}
              role="tab"
              aria-selected={on}
              onClick={() => setMetric(x.key)}
              className={cn(
                "relative flex flex-col items-start gap-1 bg-card p-4 text-left last:col-span-2 xl:last:col-span-1 outline-none transition-colors hover:bg-accent/50 focus-visible:z-10 focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-ring",
                on && "bg-accent/60",
              )}
            >
              {on && <span className="absolute inset-x-0 top-0 h-0.5 bg-foreground" aria-hidden />}
              <span className="text-[13px] font-medium text-muted-foreground">{x.label}</span>
              <span className="text-[26px] font-bold leading-8 tracking-[-0.6px] tabular">{display(v, x)}</span>
              <span className="text-xs text-muted-foreground tabular">
                {change == null ? "No earlier period" : (
                  <>
                    <span className="font-semibold text-foreground">{formatPct(change)}</span> {x.total === "last" ? "growth vs before" : "vs previous"}
                  </>
                )}
              </span>
            </button>
          )
        })}
      </div>

      <section className="min-w-0 rounded-lg border bg-card p-4 sm:p-5" aria-labelledby="chart-h">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h2 id="chart-h" className="text-[15px] font-semibold">
              {m.label}
              {m.total === "last" ? ", total" : ", daily"}
            </h2>
            <p className="mt-0.5 text-2xl font-bold tracking-[-0.4px] tabular">{display(total, m)}</p>
          </div>
          <div className="flex items-center gap-4 text-xs text-muted-foreground" aria-hidden={!prev}>
            <span className="flex items-center gap-1.5">
              <span className="h-0.5 w-4 rounded-full bg-chart-1" /> This period
            </span>
            {prev && (
              <span className="flex items-center gap-1.5">
                <span className="w-4 border-t-2 border-dashed border-chart-4" /> Previous {range} days
              </span>
            )}
          </div>
        </div>
        <LineChart
          labels={now.map((d) => d.label)}
          longLabels={now.map((d) => d.long)}
          series={now.map((d) => (m.key === "watchMinutes" ? Math.round(d[m.key] / 60) : d[m.key]))}
          compare={prev?.map((d) => (m.key === "watchMinutes" ? Math.round(d[m.key] / 60) : d[m.key]))}
          format={(v) => (m.key === "watchMinutes" ? `${number(v)} h` : number(v))}
          name={m.label}
        />
        <details className="mt-3 text-[13px]">
          <summary className="cursor-pointer text-muted-foreground hover:text-foreground">View as a table</summary>
          <div className="mt-2 max-h-64 overflow-auto rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead className="text-right">{m.label}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {now.map((d) => (
                  <TableRow key={d.long}>
                    <TableCell>{d.long}</TableCell>
                    <TableCell className="text-right tabular">{m.key === "watchMinutes" ? `${number(Math.round(d.watchMinutes / 60))} h` : number(d[m.key])}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </details>
      </section>

      <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(0,380px)]">
        <section aria-labelledby="top-h" className="min-w-0">
          <h2 id="top-h" className="mb-3 text-lg font-semibold tracking-[-0.2px]">
            Top content
          </h2>
          <div className="overflow-x-auto rounded-lg border bg-card">
            <Table className="min-w-[520px]">
              <TableHeader>
                <TableRow className="hover:bg-transparent">
                  <TableHead className="w-8 pl-4">#</TableHead>
                  <TableHead>Title</TableHead>
                  <TableHead className="text-right">Views</TableHead>
                  <TableHead className="pr-4 text-right">Watch time</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {top.map((t, i) => (
                  <TableRow key={t.id}>
                    <TableCell className="pl-4 text-muted-foreground tabular">{i + 1}</TableCell>
                    <TableCell className="py-2.5">
                      <div className="flex items-center gap-3">
                        <div className={cn("shrink-0", t.kind === "Short" ? "w-[27px] mx-[19px]" : "w-[64px]")}>
                          <VideoThumb tone={t.tone} src={t.src} ratio={t.kind === "Short" ? "9/16" : "16/9"} className="rounded-sm [&_span.rounded-full]:hidden" />
                        </div>
                        <div className="min-w-0">
                          <p className="line-clamp-1 whitespace-normal font-semibold">{t.title}</p>
                          <p className="text-xs text-muted-foreground">{t.kind}</p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="text-right font-medium tabular">{compact(Math.round(t.views * factor))}</TableCell>
                    <TableCell className="pr-4 text-right text-muted-foreground tabular">{number(Math.round((t.watchMinutes * factor) / 60))} h</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </section>

        <section aria-labelledby="sources-h">
          <h2 id="sources-h" className="mb-3 text-lg font-semibold tracking-[-0.2px]">
            Traffic sources
          </h2>
          <div className="rounded-lg border bg-card p-4">
            <div className="flex h-3 gap-[2px] overflow-hidden rounded-[3px]" role="img" aria-label={SOURCES.map((s, i) => `${s.name} ${shares[i]}%`).join(", ")}>
              {SOURCES.map((s, i) => (
                <span key={s.name} style={{ width: `${shares[i]}%`, background: s.color }} />
              ))}
            </div>
            <ul className="mt-4 grid gap-3">
              {SOURCES.map((s, i) => (
                <li key={s.name} className="grid grid-cols-[auto_1fr_auto_auto] items-center gap-x-3 text-sm">
                  <span className="size-2.5 rounded-[2px]" style={{ background: s.color }} aria-hidden />
                  <span className="font-medium">{s.name}</span>
                  <span className="text-muted-foreground tabular">{compact(Math.round((totalViews * shares[i]) / 100))}</span>
                  <span className="w-10 text-right font-semibold tabular">{shares[i]}%</span>
                </li>
              ))}
            </ul>
            <p className="mt-4 border-t pt-3 text-xs leading-[18px] text-muted-foreground">
              Search is people finding your pages on Google and other engines. YouTube is clicks from your video descriptions and end screens.
            </p>
          </div>
        </section>
      </div>
      <p className="text-xs text-muted-foreground">First-party analytics. No third-party trackers.</p>
    </div>
  )
}

function useWidth<T extends HTMLElement>() {
  const ref = useRef<T>(null)
  const [w, setW] = useState(320)
  useEffect(() => {
    const el = ref.current
    if (!el) return
    const ro = new ResizeObserver(([e]) => setW(Math.max(280, Math.round(e.contentRect.width))))
    ro.observe(el)
    return () => ro.disconnect()
  }, [])
  return [ref, w] as const
}

function LineChart({
  labels,
  longLabels,
  series,
  compare,
  format,
  name,
}: {
  labels: string[]
  longLabels: string[]
  series: number[]
  compare?: number[]
  format: (v: number) => string
  name: string
}) {
  const [ref, width] = useWidth<HTMLDivElement>()
  const [hover, setHover] = useState<number | null>(null)
  const H = 240
  const padL = 48
  const padB = 24
  const padT = 8
  const plotW = width - padL - 8
  const plotH = H - padB - padT
  const max = niceMax((Math.max(...series, ...(compare ?? [])) * 1.05) / 4) * 4
  const ticks = [0, max / 4, max / 2, (max * 3) / 4, max]

  const pts = useMemo(() => linePoints(series, plotW, plotH, 0, 0, max).map(([x, y]) => [x + padL, y + padT] as const), [series, plotW, plotH, max])
  const cmp = useMemo(
    () => (compare ? linePoints(compare, plotW, plotH, 0, 0, max).map(([x, y]) => [x + padL, y + padT] as const) : null),
    [compare, plotW, plotH, max],
  )
  const area = `${pathFrom(pts)} L${pts[pts.length - 1][0]},${padT + plotH} L${pts[0][0]},${padT + plotH} Z`
  const xTicks = labels.length <= 7 ? labels.map((_, i) => i) : [0, 1, 2, 3, 4].map((k) => Math.round((k * (labels.length - 1)) / 4))

  const pick = (clientX: number, rect: DOMRect) => {
    const x = clientX - rect.left - padL
    const i = Math.round((x / plotW) * (series.length - 1))
    setHover(Math.max(0, Math.min(series.length - 1, i)))
  }

  const hp = hover != null ? pts[hover] : null

  return (
    <div ref={ref} className="relative mt-4 w-full min-w-0">
      <svg
        width={width}
        height={H}
        className="block touch-none outline-none focus-visible:ring-2 focus-visible:ring-ring"
        role="img"
        aria-label={`${name} by day, ${labels[0]} to ${labels[labels.length - 1]}. Use the arrow keys to read values.`}
        tabIndex={0}
        onPointerMove={(e) => pick(e.clientX, e.currentTarget.getBoundingClientRect())}
        onPointerLeave={() => setHover(null)}
        onKeyDown={(e) => {
          if (e.key === "ArrowRight") setHover((h) => Math.min(series.length - 1, (h ?? -1) + 1))
          if (e.key === "ArrowLeft") setHover((h) => Math.max(0, (h ?? series.length) - 1))
        }}
        onBlur={() => setHover(null)}
      >
        {ticks.map((t) => {
          const y = padT + plotH - (t / max) * plotH
          return (
            <g key={t}>
              <line x1={padL} x2={width - 8} y1={y} y2={y} stroke="var(--border)" strokeWidth={1} />
              <text x={padL - 8} y={y + 4} textAnchor="end" className="fill-muted-foreground text-[11px] tabular">
                {compact(Math.round(t))}
              </text>
            </g>
          )
        })}
        {xTicks.map((i) => (
          <text
            key={i}
            x={pts[i][0]}
            y={H - 6}
            textAnchor={i === 0 ? "start" : i === labels.length - 1 ? "end" : "middle"}
            className="fill-muted-foreground text-[11px]"
          >
            {labels[i]}
          </text>
        ))}
        {cmp && <path d={pathFrom(cmp)} fill="none" stroke="var(--chart-4)" strokeWidth={1.5} strokeDasharray="4 4" />}
        <path d={area} fill="var(--chart-1)" opacity={0.08} />
        <path d={pathFrom(pts)} fill="none" stroke="var(--chart-1)" strokeWidth={2} strokeLinejoin="round" strokeLinecap="round" />
        {hp && (
          <g>
            <line x1={hp[0]} x2={hp[0]} y1={padT} y2={padT + plotH} stroke="var(--foreground)" strokeOpacity={0.25} />
            {cmp && <circle cx={cmp[hover!][0]} cy={cmp[hover!][1]} r={4} fill="var(--chart-4)" stroke="var(--card)" strokeWidth={2} />}
            <circle cx={hp[0]} cy={hp[1]} r={5} fill="var(--chart-1)" stroke="var(--card)" strokeWidth={2} />
          </g>
        )}
      </svg>
      {hp && hover != null && (
        <div
          className="pointer-events-none absolute top-0 z-10 min-w-[150px] rounded-md border bg-popover px-3 py-2 text-xs shadow-popover"
          style={{ left: Math.min(Math.max(hp[0] - 75, 0), width - 160) }}
          role="status"
        >
          <p className="font-semibold">{longLabels[hover]}</p>
          <p className="mt-1 flex items-center justify-between gap-3">
            <span className="flex items-center gap-1.5 text-muted-foreground">
              <span className="h-0.5 w-3 bg-chart-1" /> {name}
            </span>
            <span className="font-semibold tabular">{format(series[hover])}</span>
          </p>
          {compare && (
            <p className="mt-0.5 flex items-center justify-between gap-3">
              <span className="flex items-center gap-1.5 text-muted-foreground">
                <span className="w-3 border-t-2 border-dashed border-chart-4" /> Previous
              </span>
              <span className="tabular text-muted-foreground">{format(compare[hover])}</span>
            </p>
          )}
        </div>
      )}
    </div>
  )
}
