// Studio-only helpers: pipeline steps, fixed calendar maths for the demo's
// "today" (11 November 2026), extended daily stats and small SVG helpers.
// Everything is deterministic so pages prerender (no Date.now or Math.random).
import { dailyStats } from "@/lib/data/sample"
import type { PipelineStep, Video } from "@/lib/types"

export const TODAY_LABEL = "11 November 2026"

/** Steps for a YouTube import (no transcode: the video stays on YouTube). */
export const IMPORT_STEPS: { id: PipelineStep; label: string; detail: string }[] = [
  { id: "imported", label: "Imported", detail: "Found on YouTube" },
  { id: "transcribing", label: "Transcribing", detail: "Reading YouTube captions" },
  { id: "drafting", label: "Drafting article", detail: "Headlines, body, key points" },
  { id: "cutting_shorts", label: "Cutting shorts", detail: "Finding 3 to 5 clips" },
  { id: "ready", label: "Ready", detail: "Waiting for you" },
]

/** Steps for a file upload (adds transcoding to HLS). */
export const UPLOAD_STEPS: { id: PipelineStep | "uploaded"; label: string; detail: string }[] = [
  { id: "uploaded", label: "Uploaded", detail: "File received" },
  { id: "transcoding", label: "Transcoding", detail: "Adaptive streams and poster" },
  { id: "transcribing", label: "Transcribing", detail: "Speech to text with speakers" },
  { id: "drafting", label: "Drafting article", detail: "Headlines, body, key points" },
  { id: "cutting_shorts", label: "Cutting shorts", detail: "Vertical clips with captions" },
  { id: "ready", label: "Ready", detail: "Waiting for you" },
]

export function importStepIndex(step: PipelineStep) {
  const i = IMPORT_STEPS.findIndex((s) => s.id === step)
  return i === -1 ? 1 : i
}

/** Rough minutes left, from the current step and the video length. */
export function etaMinutes(v: Pick<Video, "pipelineStep" | "durationSec">) {
  const base = Math.max(2, Math.round(v.durationSec / 600))
  const left: Record<PipelineStep, number> = {
    imported: 4,
    transcoding: 4,
    transcribing: 3,
    drafting: 2,
    cutting_shorts: 1,
    ready: 0,
  }
  return left[v.pipelineStep] * base
}

export const SECTION_LABELS: Record<string, string> = {
  afl: "AFL",
  aflw: "AFLW",
  draft: "Draft",
  form: "Form",
  trainers: "Trainers",
}
export const sectionLabel = (s: string) => SECTION_LABELS[s] ?? s

// ---------- Calendar (fixed "today" = 11 November 2026) ----------

const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
]
const DAYS_IN = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31]

/** The date `n` days before 11 November 2026. */
export function daysBeforeToday(n: number) {
  let day = 11 - n
  let month = 10
  let year = 2026
  while (day < 1) {
    month -= 1
    if (month < 0) {
      month = 11
      year -= 1
    }
    day += DAYS_IN[month]
  }
  return { day, month, year }
}

export function dateLong(n: number) {
  const d = daysBeforeToday(n)
  return `${d.day} ${MONTHS[d.month]} ${d.year}`
}
export function dateShort(n: number) {
  const d = daysBeforeToday(n)
  return `${d.day} ${MONTHS[d.month].slice(0, 3)}`
}

/** The next `count` days from today, for the schedule dialog. */
export function upcomingDays(count: number) {
  const out: { value: string; label: string }[] = []
  let day = 11
  let month = 10
  let year = 2026
  const weekdays = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"]
  // 11 November 2026 is a Wednesday.
  for (let i = 0; i < count; i++) {
    const wd = weekdays[(3 + i) % 7]
    out.push({
      value: `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`,
      label: `${i === 0 ? "Today" : i === 1 ? "Tomorrow" : wd}, ${day} ${MONTHS[month]} ${year}`,
    })
    day += 1
    if (day > DAYS_IN[month]) {
      day = 1
      month += 1
      if (month > 11) {
        month = 0
        year += 1
      }
    }
  }
  return out
}

export function longDateFromValue(value: string) {
  const [y, m, d] = value.split("-").map(Number)
  return `${d} ${MONTHS[m - 1]} ${y}`
}

// ---------- Stats ----------

export interface StudioDay {
  label: string
  long: string
  views: number
  watchMinutes: number
  searchSessions: number
  signUps: number
  verified: number
}

/**
 * 90 days of stats ending 11 November 2026. The last 30 are the shared sample
 * (getDailyStats); the 60 before are a slower, deterministic lead-in.
 */
export function studioDays(): StudioDay[] {
  const rows: Omit<StudioDay, "verified">[] = []
  for (let j = 0; j < 60; j++) {
    const k = j - 60
    const wave = Math.round(1000 * Math.sin(k / 3))
    rows.push({
      label: dateShort(89 - j),
      long: dateLong(89 - j),
      views: 5400 + j * 15 + wave,
      watchMinutes: 18500 + j * 40 + wave * 3,
      searchSessions: 640 + j * 4 + Math.round(wave / 5),
      signUps: 30 + Math.round(j * 0.12) + (j % 4),
    })
  }
  dailyStats.forEach((d, i) => {
    rows.push({
      label: dateShort(29 - i),
      long: dateLong(29 - i),
      views: d.views,
      watchMinutes: d.watchMinutes,
      searchSessions: d.searchSessions,
      signUps: d.signUps,
    })
  })
  let verified = 2380
  return rows.map((r) => {
    verified += Math.round(r.signUps * 0.72)
    return { ...r, verified }
  })
}

export function sum(rows: StudioDay[], key: keyof Omit<StudioDay, "label" | "long">) {
  return rows.reduce((a, r) => a + r[key], 0)
}

export function pctChange(now: number, before: number) {
  if (!before) return 0
  return ((now - before) / before) * 100
}

export function formatPct(p: number) {
  const r = Math.round(p * 10) / 10
  return `${r > 0 ? "+" : r < 0 ? "−" : ""}${Math.abs(r).toFixed(1)}%`
}

export function hours(minutes: number) {
  return Math.round(minutes / 60)
}

/** Points for an SVG polyline scaled into w × h with padding. */
export function linePoints(values: number[], w: number, h: number, pad = 2, min?: number, max?: number) {
  const lo = min ?? Math.min(...values)
  const hi = max ?? Math.max(...values)
  const span = hi - lo || 1
  return values.map((v, i) => {
    const x = values.length === 1 ? w / 2 : (i / (values.length - 1)) * (w - pad * 2) + pad
    const y = h - pad - ((v - lo) / span) * (h - pad * 2)
    return [x, y] as const
  })
}

export function pathFrom(points: readonly (readonly [number, number])[]) {
  return points.map(([x, y], i) => `${i ? "L" : "M"}${x.toFixed(1)},${y.toFixed(1)}`).join(" ")
}

/** Rounded "nice" upper bound for a chart axis. */
export function niceMax(v: number) {
  const mag = Math.pow(10, Math.floor(Math.log10(v)))
  const n = v / mag
  const step = n <= 1 ? 1 : n <= 2 ? 2 : n <= 2.5 ? 2.5 : n <= 5 ? 5 : 10
  return step * mag
}

// ---------- Draft packs ----------

export interface DraftPack {
  id: string
  title: string
  headline: string
  standfirst: string
  channelName: string
  section: string
  durationSec: number
  posterTone: string
  sourcePublishedAt: string
  source: Video["source"]
  readMinutes: number
  headlineCount: number
  shortCount: number
  chapterCount: number
  flags: { id: string; kind: string; message: string; excerpt: string }[]
}

export function toPack(v: Video, channelName: string): DraftPack {
  return {
    id: v.id,
    title: v.title,
    headline: v.article.headline,
    standfirst: v.article.standfirst,
    channelName,
    section: sectionLabel(v.section),
    durationSec: v.durationSec,
    posterTone: v.posterTone,
    sourcePublishedAt: v.sourcePublishedAt,
    source: v.source,
    readMinutes: v.article.readMinutes,
    headlineCount: v.article.headlineOptions.length,
    shortCount: v.shorts.length,
    chapterCount: v.chapters.length,
    flags: v.article.complianceFlags.map(({ id, kind, message, excerpt }) => ({ id, kind, message, excerpt })),
  }
}
