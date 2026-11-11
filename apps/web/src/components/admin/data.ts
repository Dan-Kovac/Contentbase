// Admin console sample data that lib/data does not carry yet (pilot KPIs, viewer reports,
// audit log). Fixed values only, so pages prerender. Move into lib/data with the database.
import { listAdDecisions, listCreatives, listImportJobs } from "@/lib/data"

const MONTHS: Record<string, string> = {
  Jan: "January", Feb: "February", Mar: "March", Apr: "April", May: "May", Jun: "June",
  Jul: "July", Aug: "August", Sep: "September", Oct: "October", Nov: "November", Dec: "December",
}

/** "11 Nov 2026 09:41:07" -> "11 November 2026, 9:41:07 am" */
export function longStamp(s: string) {
  const m = s.match(/^(\d{1,2}) (\w{3}) (\d{4}) (\d{2}):(\d{2})(?::(\d{2}))?$/)
  if (!m) return s
  const h = Number(m[4])
  const hh = h % 12 || 12
  return `${m[1]} ${MONTHS[m[2]] ?? m[2]} ${m[3]}, ${hh}:${m[5]}${m[6] ? `:${m[6]}` : ""} ${h < 12 ? "am" : "pm"}`
}

/** "11 Nov 2026 09:41:07" -> "9:41:07 am" */
export function shortTime(s: string) {
  const full = longStamp(s)
  return full.split(", ")[1] ?? full
}

export type KpiStatus = "on_track" | "watch" | "off_track"

export interface Kpi {
  id: string
  label: string
  value: string
  target: string
  status: KpiStatus
  detail: string
}

export function pilotKpis(): Kpi[] {
  const decisions = listAdDecisions()
  // Age-restricted (alcohol, wagering) impressions served without all three locks passing.
  const restricted = decisions.filter((d) => d.outcome === "wagering_served")
  const outside = restricted.filter((d) => !(d.locks.session.pass && d.locks.age.pass && d.locks.optout.pass)).length
  const jobs = ["ch_footyfix", "ch_trackside"].flatMap((id) => listImportJobs(id)).filter((j) => j.status === "done")
  const imported = jobs.reduce((n, j) => n + j.imported, 0)
  const failed = jobs.reduce((n, j) => n + j.failed, 0)
  const migration = ((imported / (imported + failed)) * 100).toFixed(1)

  return [
    { id: "ttp", label: "Time to publish", value: "7 min 40 s", target: "Under 10 min, median", status: "on_track", detail: "Upload finished to draft pack ready. p90 is 14 min 05 s." },
    { id: "volume", label: "Publishing volume", value: "2.3×", target: "2× vs before", status: "on_track", detail: "Published items per channel per week, against each channel's pre-pilot baseline." },
    { id: "search", label: "Organic search sessions", value: "2,670 a day", target: "Growing month on month", status: "on_track", detail: "Up 31% on October. Google 88%, Bing 12%." },
    { id: "signup", label: "Verified sign-up rate", value: "2.7%", target: "3% or more", status: "watch", detail: "Signed-in, age-verified accounts ÷ unique visitors. Trackside is at 1.9%." },
    { id: "migration", label: "Migration success", value: `${migration}%`, target: "99% of items", status: "on_track", detail: `${imported.toLocaleString("en-AU")} imported items live with redirects, ${failed} failed.` },
    { id: "cwv", label: "Core Web Vitals pass rate", value: "93%", target: "90% with ads on", status: "on_track", detail: "Pages with good LCP, INP and CLS at the 75th percentile." },
    {
      id: "compliance",
      label: "Age-restricted impressions outside a valid triple-lock session",
      value: String(outside),
      target: "0",
      status: outside === 0 ? "on_track" : "off_track",
      detail: `Alcohol and wagering impressions served without all three locks passing. ${restricted.length} age-restricted ${restricted.length === 1 ? "impression" : "impressions"} in the sample, each with evidence written before serve.`,
    },
  ]
}

export interface Alert {
  id: string
  severity: "action" | "info"
  title: string
  detail: string
  href: string
  cta: string
}

export function adminAlerts(): Alert[] {
  const pending = listCreatives().filter((c) => c.status === "pending")
  const failing = pending.filter((c) => c.checks.some((k) => k.result === "fail"))
  return [
    {
      id: "a1",
      severity: "action",
      title: `${pending.length} creatives waiting for review`,
      detail: `${failing.map((c) => `${c.advertiser}: ${c.name}`).join(", ")} fails a check. Oldest submitted 10 November 2026, 4:40 pm.`,
      href: "/admin/review",
      cta: "Review creatives",
    },
    {
      id: "a2",
      severity: "action",
      title: "2 viewer reports open, 1 past the 1-hour target",
      detail: "A report on Trackside's Cox Plate article flags a call to bet in the body.",
      href: "/admin/moderation",
      cta: "Open moderation",
    },
    {
      id: "a3",
      severity: "info",
      title: "Riverbank Wagering campaign is in review",
      detail: "It cannot serve until its creative is approved. CPC pricing still needs legal sign-off.",
      href: "/admin/campaigns",
      cta: "See campaigns",
    },
    {
      id: "a4",
      severity: "info",
      title: "Footy Fix import finished with 2 failed items",
      detail: "One video is longer than 3 hours and one is members-only. The creator has been told how to fix both.",
      href: "/admin/channels",
      cta: "See channels",
    },
  ]
}

export interface Report {
  id: string
  receivedAt: string
  channel: string
  channelSlug: string
  contentTitle: string
  contentHref: string
  contentType: "Article" | "Video" | "Short"
  reason: "Encourages betting" | "Misleading" | "Harassment" | "Copyright" | "Other"
  reports: number
  excerpt: string
  note: string
  status: "open" | "taken_down" | "dismissed"
  minutesLeft: number
}

export const reports: Report[] = [
  {
    id: "rep_0193",
    receivedAt: "11 November 2026, 9:12 am",
    channel: "Trackside",
    channelSlug: "trackside",
    contentTitle: "Why the Cox Plate draw matters more than ever",
    contentHref: "/c/trackside/v/cox-plate-draw",
    contentType: "Article",
    reason: "Encourages betting",
    reports: 3,
    excerpt: "The favourite is at $2.10 after the draw, and punters should bet now before the price shortens.",
    note: "Article tells readers to bet now. Not okay on a page my kid reads.",
    status: "open",
    minutesLeft: 22,
  },
  {
    id: "rep_0192",
    receivedAt: "11 November 2026, 8:03 am",
    channel: "Footy Fix",
    channelSlug: "footyfix",
    contentTitle: "Coach reacts to the umpiring",
    contentHref: "/c/footyfix/shorts?s=s_yt2",
    contentType: "Short",
    reason: "Misleading",
    reports: 1,
    excerpt: "Caption: He wasn't happy.",
    note: "The clip is cut so it looks like he's talking about the umpires. He wasn't.",
    status: "open",
    minutesLeft: 0,
  },
  {
    id: "rep_0188",
    receivedAt: "10 November 2026, 7:41 pm",
    channel: "Footy Fix",
    channelSlug: "footyfix",
    contentTitle: "Round 7 in five minutes",
    contentHref: "/c/footyfix/v/round-7-in-five-minutes",
    contentType: "Video",
    reason: "Copyright",
    reports: 1,
    excerpt: "Broadcast footage, 0:42 to 0:51.",
    note: "Contains our broadcast footage without a licence.",
    status: "dismissed",
    minutesLeft: 0,
  },
]

export interface AuditEntry {
  id: string
  at: string
  actor: string
  action: string
  target: string
  before?: string
  after?: string
  reason?: string
}

export const auditLog: AuditEntry[] = [
  { id: "aud_5521", at: "11 November 2026, 9:30 am", actor: "System", action: "evidence.export", target: "Harbour Bet (licensed) · 1–10 November 2026", after: "csv · 41,209 rows · ready" },
  { id: "aud_5520", at: "11 November 2026, 9:02 am", actor: "System", action: "import.run", target: "Footy Fix · YouTube new uploads", after: "1 imported · 0 failed" },
  { id: "aud_5519", at: "11 November 2026, 8:15 am", actor: "System", action: "creative.submit", target: "Riverbank Wagering · Spring Carnival stat card", after: "status: pending · automated checks: 1 fail, 1 to check" },
  { id: "aud_5518", at: "10 November 2026, 5:18 pm", actor: "Tom Ellis", action: "channel.mode_change", target: "Trackside", before: "mode: standard", after: "mode: age_verified", reason: "Owner asked to switch on age-verified advertising. Notable-person check done; alcohol and wagering both allowed." },
  { id: "aud_5517", at: "10 November 2026, 4:55 pm", actor: "Tom Ellis", action: "channel.impersonate", target: "Footy Fix (studio)", reason: "Support ticket 2231: custom domain stuck on SSL." },
  { id: "aud_5516", at: "10 November 2026, 2:10 pm", actor: "Priya Raman", action: "creative.approve", target: "Kick Boots Co. · Summer boots sponsored short", before: "status: pending", after: "status: approved", reason: "Brand-safe. Not an age-restricted category." },
  { id: "aud_5515", at: "10 November 2026, 11:47 am", actor: "Priya Raman", action: "moderation.dismiss", target: "Report rep_0188 · Round 7 in five minutes", before: "status: open", after: "status: dismissed", reason: "Footage licensed via the club media pool. Licence on file." },
  { id: "aud_5514", at: "9 November 2026, 3:22 pm", actor: "Tom Ellis", action: "campaign.create", target: "Riverbank Wagering · cmp_tab", after: "pricing: cpc · status: in_review" },
  { id: "aud_5513", at: "9 November 2026, 10:05 am", actor: "Priya Raman", action: "channel.flag", target: "Footy Fix", before: "notable_person: unset", after: "notable_person: false", reason: "Owner checked against the notable-person register. Not listed." },
]

export const ADMIN_USER = "Priya Raman"
