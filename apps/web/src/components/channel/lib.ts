// Channel-page helpers. Local to the channel screens so shared lib files stay untouched.
import { getVideo, listShorts, listVideos } from "@/lib/data"
import type { Block, Channel, Short, Video } from "@/lib/types"

/** Display face for the channel's pairing (weight and tracking come from the pairing too). */
export const DISPLAY =
  "font-[family-name:var(--chan-display)] [font-weight:var(--chan-weight)] tracking-[var(--chan-tracking)]"
/** Reading face: Source Serif 4 for Grandstand and Minimal, Archivo for Broadcast. */
export const BODY = "font-[family-name:var(--chan-body)]"
/** Accent-underlined link that stays readable whatever the accent (pale accents fail as text). */
export const ACCENT_LINK =
  "underline decoration-[var(--chan)] decoration-2 underline-offset-4 hover:decoration-foreground"

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

export type RelatedItem =
  | { kind: "video"; video: Video }
  | { kind: "short"; short: Short }

/** SEO-05: 3–5 related items. Same section first, then the rest of the channel, then shorts. */
export function relatedFor(channel: Channel, v: Video): RelatedItem[] {
  const others = publicVideos(channel).filter((x) => x.id !== v.id)
  const sameSection = others.filter((x) => x.section === v.section)
  const rest = others.filter((x) => x.section !== v.section)
  const items: RelatedItem[] = [...sameSection, ...rest].map((video) => ({ kind: "video", video }))
  const shorts = publicShorts(channel)
  const ownShorts = shorts.filter((s) => s.videoId === v.id)
  const otherShorts = shorts.filter((s) => s.videoId !== v.id)
  for (const short of [...ownShorts, ...otherShorts]) {
    if (items.length >= 5) break
    if (items.length >= 3 && items.filter((i) => i.kind === "short").length >= 2) break
    items.push({ kind: "short", short })
  }
  return items.slice(0, 5)
}
