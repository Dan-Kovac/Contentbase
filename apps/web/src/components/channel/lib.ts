// Channel-page helpers. Local to the channel screens so shared lib files stay untouched.
import { getVideo, listArticles, listPages, listShorts, listSponsors, listVideos } from "@/lib/data"
import type { AgeCategory, Block, Channel, CustomPage, Short, Sponsor, StandaloneArticle, Video } from "@/lib/types"

export { ACCENT_LINK, BODY, COLUMN, CONTAINER, DISPLAY, WIDE } from "./styles"
import { formatDuration } from "@/lib/format"

export const SITE = "https://homestand.com.au"

/**
 * What the public sees. Only published content is public; the prototype also shows
 * items that are ready to review so pages are not empty.
 */
export function publicVideos(channel: Channel) {
  return listVideos(channel.id, ["published", "ready"])
}
export function publicShorts(channel: Channel) {
  return listShorts(channel.id).filter((s) => s.status === "published" || s.status === "ready")
}

/** The lead story must be published (never a draft), newest first, not exclusive. */
export function leadStory(channel: Channel) {
  const published = listVideos(channel.id, "published")
  return published.find((v) => !v.exclusive) ?? published[0] ?? publicVideos(channel)[0]
}

export const channelPath = (c: Channel) => `/c/${c.slug}`
export const videoPath = (c: Channel, v: Video) => `/c/${c.slug}/v/${v.slug}`
export const shortPath = (c: Channel, s: Short) => `/c/${c.slug}/shorts?s=${s.id}`
export const sectionPath = (c: Channel, section: string) => `/c/${c.slug}/s/${section}`

export function sectionLabel(c: Channel, slug: string) {
  return c.sections.find((s) => s.slug === slug)?.label ?? slug.toUpperCase()
}

export function displayDate(v: Video) {
  return v.publishedAt ?? v.sourcePublishedAt
}

/** Shorts either come from YouTube (embedded) or are clips we cut from an uploaded master (our player). */
export function shortSourceLabel(s: Short) {
  if (s.source === "youtube_short") return "YouTube Short"
  const parent = s.videoId ? getVideo(s.videoId) : undefined
  return parent ? `Clip from “${parent.title}”` : "Clip"
}

const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
]

/** "10 November 2026" -> "2026-11-10". String parsing only: no Date during server render. */
export function isoDate(d: string) {
  const m = d.match(/^(\d{1,2}) ([A-Za-z]+) (\d{4})/)
  if (!m) return undefined
  const month = MONTHS.indexOf(m[2]) + 1
  if (!month) return undefined
  return `${m[3]}-${String(month).padStart(2, "0")}-${m[1].padStart(2, "0")}`
}

/** 1086 -> "PT18M6S" */
export function isoDuration(sec: number) {
  const h = Math.floor(sec / 3600)
  const m = Math.floor((sec % 3600) / 60)
  const s = sec % 60
  return `PT${h ? `${h}H` : ""}${m ? `${m}M` : ""}${s || (!h && !m) ? `${s}S` : ""}`
}

export function blockText(b: Block): string {
  switch (b.type) {
    case "paragraph":
    case "heading":
    case "quote":
      return b.text
    case "list":
      return b.items.join(" ")
    case "image":
      return b.caption
    default:
      return ""
  }
}

/**
 * Blocks safe to show publicly. A block the compliance pre-check flagged as a call to bet
 * (bet_now, bet_cta) is held back until the creator fixes it: copy never encourages betting.
 */
export function publicBlocks(v: Video) {
  const held = new Set(
    v.article.complianceFlags.filter((f) => f.kind === "bet_now" || f.kind === "bet_cta").map((f) => f.blockIndex),
  )
  return v.article.blocks.filter((_, i) => !held.has(i))
}

export function wordCount(blocks: Block[]) {
  return blocks.map(blockText).join(" ").split(/\s+/).filter(Boolean).length
}

export interface Related {
  stories: Story[]
  shorts: Short[]
}

/**
 * SEO-05: 3–5 related items. Same section first (videos and standalone articles), then the rest
 * of the channel, then shorts (the item's own clips first).
 */
export function relatedFor(channel: Channel, item: { id: string; section: string }): Related {
  const others = channelStories(channel, { exclude: [item.id] })
  const ordered = [...others.filter((x) => x.section === item.section), ...others.filter((x) => x.section !== item.section)]
  const stories = ordered.slice(0, 4)
  const all = publicShorts(channel)
  const shorts = [...all.filter((s) => s.videoId === item.id), ...all.filter((s) => s.videoId !== item.id)]
  return { stories, shorts: shorts.slice(0, 5 - stories.length) }
}

/* ---------------------------------------------------------------------------------------------
 * Standalone articles and custom pages
 * ------------------------------------------------------------------------------------------- */

export function publicArticles(channel: Channel) {
  return listArticles(channel.id).filter((a) => a.status === "published")
}
export function publicPages(channel: Channel) {
  return listPages(channel.id).filter((p) => p.status === "published")
}
export function publishedPage(channel: Channel, slug: string) {
  return publicPages(channel).find((p) => p.slug === slug)
}
export const articlePath = (c: Channel, a: StandaloneArticle) => `/c/${c.slug}/a/${a.slug}`
export const pagePath = (c: Channel, p: CustomPage) => (p.slug === "about" ? `/c/${c.slug}/about` : `/c/${c.slug}/p/${p.slug}`)

/** Header nav: the creator's items, plus published custom pages marked "in nav" that aren't already there. */
export function channelNav(channel: Channel) {
  const items = channel.nav.map((n) => ({ label: n.label, href: `/c/${channel.slug}${n.href ? `/${n.href}` : ""}` }))
  for (const p of publicPages(channel).filter((x) => x.inNav)) {
    const href = pagePath(channel, p)
    if (!items.some((i) => i.href === href || i.href === `/c/${channel.slug}/p/${p.slug}`)) items.push({ label: p.title, href })
  }
  return items.slice(0, 8)
}

/** One shape for anything that can sit in a story grid: a video (with its article) or a standalone article. */
export interface Story {
  id: string
  kind: "video" | "article"
  href: string
  headline: string
  standfirst: string
  section: string
  sectionLabel: string
  poster?: string
  tone: string
  author: string
  date: string
  iso?: string
  readMinutes: number
  durationSec?: number
  exclusive?: boolean
  views: number
}

export function videoStory(c: Channel, v: Video): Story {
  return {
    id: v.id,
    kind: "video",
    href: videoPath(c, v),
    headline: v.article.headline,
    standfirst: v.article.standfirst,
    section: v.section,
    sectionLabel: sectionLabel(c, v.section),
    poster: v.poster,
    tone: v.posterTone,
    author: v.article.author,
    date: displayDate(v),
    iso: isoDate(displayDate(v)),
    readMinutes: v.article.readMinutes,
    durationSec: v.durationSec,
    exclusive: v.exclusive,
    views: v.views,
  }
}

export function articleStory(c: Channel, a: StandaloneArticle): Story {
  const date = a.publishedAt ?? ""
  return {
    id: a.id,
    kind: "article",
    href: articlePath(c, a),
    headline: a.headline,
    standfirst: a.standfirst,
    section: a.section,
    sectionLabel: sectionLabel(c, a.section),
    poster: a.hero,
    tone: "var(--chan)",
    author: a.author,
    date,
    iso: isoDate(date),
    readMinutes: a.readMinutes,
    views: 0,
  }
}

/** Videos and standalone articles together, newest first. */
export function channelStories(c: Channel, opts: { section?: string; exclude?: string[] } = {}) {
  const all = [...publicVideos(c).map((v) => videoStory(c, v)), ...publicArticles(c).map((a) => articleStory(c, a))]
  return all
    .filter((s) => (!opts.section || s.section === opts.section) && !opts.exclude?.includes(s.id))
    .sort((a, b) => (b.iso ?? "").localeCompare(a.iso ?? ""))
}

/* ---------------------------------------------------------------------------------------------
 * Native ad selection (fail closed)
 * ------------------------------------------------------------------------------------------- */

export type Viewer = "logged_out" | "signed_in" | "verified" | "opted_out"

/**
 * Which age-restricted categories this viewer may see on this page. Every condition must pass:
 * signed in and 18+ verified, the channel is in age_verified mode, the creator hasn't blocked
 * the category, the page isn't live, and (for wagering) the viewer hasn't opted out.
 */
export function allowedAgeCategories(viewer: Viewer, channel: Channel, isLive: boolean): AgeCategory[] {
  if (viewer !== "verified" && viewer !== "opted_out") return []
  if (channel.mode !== "age_verified" || isLive) return []
  const cats: AgeCategory[] = ["wagering", "alcohol"]
  return cats.filter((c) => !channel.blockedAgeCategories.includes(c) && !(viewer === "opted_out" && c === "wagering"))
}

/** Slot plans: the age-restricted sponsors a slot prefers, and the non-restricted fill. */
export const SLOT_PLANS = {
  chapter: { restricted: ["sp_harbour"], fill: "sp_ute" },
  halftime: { restricted: ["sp_harbour", "sp_brew"], fill: "sp_ute" },
  story: { restricted: ["sp_brew", "sp_harbour"], fill: "sp_boots" },
  presented: { restricted: [], fill: "sp_ute" },
  short: { restricted: [], fill: "sp_boots" },
} as const satisfies Record<string, { restricted: readonly string[]; fill: string }>

export type SlotName = keyof typeof SLOT_PLANS

/** Pick the sponsor for a slot. Anything that isn't explicitly allowed falls back to a non-restricted sponsor. */
export function sponsorFor(slot: SlotName, allowed: AgeCategory[] = []): Sponsor {
  const all = listSponsors()
  const plan = SLOT_PLANS[slot]
  for (const id of plan.restricted as readonly string[]) {
    const s = all.find((x) => x.id === id)
    if (s?.ageCategory && allowed.includes(s.ageCategory)) return s
  }
  const fill = all.find((x) => x.id === plan.fill && !x.ageCategory) ?? all.find((x) => !x.ageCategory)
  if (!fill) throw new Error("No non-restricted sponsor to fill the slot")
  return fill
}

export const VIEWERS: Viewer[] = ["logged_out", "signed_in", "verified", "opted_out"]

/**
 * The sponsor a slot shows for every viewer state, decided on the server. The client only picks
 * one of the four, so no ad decision is ever made in the browser (fail closed).
 */
export function slotOptions(channel: Channel, slot: SlotName, isLive = false): Record<Viewer, Sponsor> {
  const out = {} as Record<Viewer, Sponsor>
  for (const viewer of VIEWERS) out[viewer] = sponsorFor(slot, allowedAgeCategories(viewer, channel, isLive))
  return out
}

/** The sponsors each native slot on a video or article page shows for one viewer state. */
export interface SlotPlan {
  chapter: Sponsor
  halftime: Sponsor
  story: Sponsor
  /** Why: which checks passed and what the creator blocked. */
  note: string
  restricted: boolean
}

const list = (xs: string[]) => (xs.length > 1 ? `${xs.slice(0, -1).join(", ")} and ${xs[xs.length - 1]}` : xs[0] ?? "")

/** Plain-English reason for what a viewer sees, for the demo bar. */
export function viewerNote(viewer: Viewer, channel: Channel, isLive = false): string {
  if (viewer === "logged_out") return "Not signed in, so age-restricted sponsors never show. Everyday sponsors fill every slot."
  if (viewer === "signed_in") return "Signed in but not confirmed 18+, so everyday sponsors only."
  if (channel.mode !== "age_verified") return `${channel.name} runs in Standard mode, so no age-restricted ads.`
  if (isLive) return "Live pages never carry age-restricted ads."
  const allowed = allowedAgeCategories(viewer, channel, isLive)
  const blocked = channel.blockedAgeCategories
  return [
    allowed.length ? `All three checks pass, so ${list(allowed)} sponsors can show.` : "No age-restricted category is eligible.",
    blocked.length ? `${channel.name} blocks ${list(blocked)} ads.` : "",
    viewer === "opted_out" ? "This viewer opted out of betting ads, so everyday sponsors fill those slots." : "",
  ]
    .filter(Boolean)
    .join(" ")
}

export function viewerNotes(channel: Channel, isLive = false): Record<Viewer, string> {
  const out = {} as Record<Viewer, string>
  for (const viewer of VIEWERS) out[viewer] = viewerNote(viewer, channel, isLive)
  return out
}

/** Decided on the server for every viewer state, so the client only switches between plans. */
export function slotPlans(channel: Channel, isLive: boolean): Record<Viewer, SlotPlan> {
  const out = {} as Record<Viewer, SlotPlan>
  for (const viewer of VIEWERS) {
    const allowed = allowedAgeCategories(viewer, channel, isLive)
    const chapter = sponsorFor("chapter", allowed)
    const halftime = sponsorFor("halftime", allowed)
    const story = sponsorFor("story", allowed)
    const restricted = [chapter, halftime, story].some((s) => s.ageCategory)
    out[viewer] = { chapter, halftime, story, note: viewerNote(viewer, channel, isLive), restricted }
  }
  return out
}

/** The chapter a sponsor owns: the second chapter when there is one. */
export function sponsoredChapterIndex(chapters: { start: number }[]) {
  return chapters.length > 1 ? 1 : chapters.length - 1
}

/** A publication's real lead story, shaped for the small homepage previews. */
export function previewLead(c: Channel) {
  const v = leadStory(c)
  if (!v) return undefined
  return {
    kicker: sectionLabel(c, v.section),
    headline: v.article.headline,
    standfirst: v.article.standfirst,
    byline: `${v.article.author} · ${v.article.readMinutes} min read`,
    photo: v.poster ?? "/media/mcg-night.jpg",
    duration: formatDuration(v.durationSec),
  }
}
