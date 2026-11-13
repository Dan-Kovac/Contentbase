// Core domain types. Mirrors the PID data model (Section 9) so the sample data
// can be swapped for the database without touching screens.

/** standard: no age-restricted ads. age_verified: the triple lock is on, so age-restricted
 * categories (alcohol, wagering…) can reach signed-in, 18+ verified viewers who haven't opted out. */
export type ChannelMode = "standard" | "age_verified"
export type Pairing = "grandstand" | "broadcast" | "minimal"
/** Two templates to start. Editorial: magazine, text-led. Broadcast: dark, video-led. */
export type Template = "editorial" | "broadcast"

export type Plan = "starter" | "pro" | "publisher" | "enterprise"

export interface Channel {
  id: string
  slug: string
  name: string
  tagline: string
  owner: string
  customDomain?: string
  template: Template
  pairing: Pairing
  /** The creator's own accent colour (hex). Text on it is picked automatically for contrast. */
  accentHex: string
  logoText?: string
  /** The channel's one call to action, named and pointed by the creator (CHN-02). */
  cta: ChannelCta
  mode: ChannelMode
  plan: Plan
  nav: { label: string; href: string }[]
  /** Homepage modules in display order, with on/off. */
  modules: { id: HomeModule; enabled: boolean }[]
  adCategoryBlocks: string[]
  /** Age-restricted categories the creator has blocked (only meaningful in age_verified mode). */
  blockedAgeCategories: AgeCategory[]
  followers: number
  youtube?: {
    handle: string
    channelId: string
    subscribers: number
    autoImport: boolean
    lastSyncedAt: string
  }
  voice: { tone: string; bannedWords: string[]; houseStyle: string; sources: VoiceSource[] }
  notablePersonFlag: boolean
  sections: { slug: string; label: string }[]
  bio: string
}

export type AgeCategory = "alcohol" | "wagering"

export interface ChannelCta {
  /** Button text, 20 characters at most. */
  label: string
  /** One supporting line, 60 characters at most. */
  line: string
  /** join: a free Homestand account for this channel. link: the creator's own URL. */
  action: "join" | "link"
  href?: string
}

export interface VoiceSource {
  id: string
  kind: "upload" | "url" | "site"
  label: string
  words: number
  status: "learned" | "processing"
}

export type HomeModule =
  | "lead"
  | "shorts"
  | "grid"
  | "sections"

export type ContentStatus =
  | "processing"
  | "ready"
  | "draft"
  | "scheduled"
  | "published"
  | "failed"

export type PipelineStep =
  | "imported"
  | "transcoding"
  | "transcribing"
  | "drafting"
  | "cutting_shorts"
  | "ready"

export interface Chapter {
  start: number
  title: string
}

export interface TranscriptLine {
  start: number
  speaker: string
  text: string
}

export type Block =
  | { type: "paragraph"; text: string }
  | { type: "heading"; text: string }
  | { type: "quote"; text: string; cite?: string }
  | { type: "list"; items: string[] }
  | { type: "video"; videoId: string }
  | { type: "image"; caption: string; src?: string }
  | { type: "divider" }

export interface ComplianceFlag {
  id: string
  kind: "odds" | "bet_cta" | "bookmaker" | "bet_now"
  blockIndex: number
  excerpt: string
  message: string
}

export interface Video {
  id: string
  channelId: string
  slug: string
  title: string
  description: string
  section: string
  durationSec: number
  source: "youtube" | "upload"
  youtubeId?: string
  /** ISO date the video was published on its source. */
  sourcePublishedAt: string
  status: ContentStatus
  pipelineStep: PipelineStep
  publishedAt?: string
  scheduledFor?: string
  exclusive: boolean
  isLive: boolean
  views: number
  watchMinutes: number
  posterTone: string
  /** Poster image under /media. */
  poster?: string
  chapters: Chapter[]
  transcript: TranscriptLine[]
  article: Article
  shorts: string[]
  seo: SeoFields
}

export interface Article {
  headlineOptions: string[]
  headline: string
  standfirst: string
  author: string
  readMinutes: number
  blocks: Block[]
  keyPoints: string[]
  complianceFlags: ComplianceFlag[]
}

export interface SeoFields {
  titleTag: string
  metaDescription: string
  slug: string
  ogTitle: string
}

export interface Short {
  id: string
  channelId: string
  videoId?: string
  title: string
  durationSec: number
  source: "youtube_short" | "clip"
  status: ContentStatus
  views: number
  startSec?: number
  endSec?: number
  posterTone: string
  poster?: string
  caption: string
}

export interface ImportJob {
  id: string
  channelId: string
  source: "youtube" | "wordpress" | "ghost" | "substack" | "rss"
  label: string
  status: "running" | "done" | "failed"
  startedAt: string
  imported: number
  skipped: number
  failed: number
  total: number
  problems: { item: string; reason: string }[]
}

export interface DailyStat {
  date: string
  views: number
  watchMinutes: number
  searchSessions: number
  signUps: number
}

export interface Campaign {
  id: string
  advertiser: string
  isWagering: boolean
  ageCategory?: AgeCategory
  format: NativeFormat
  pricing: "cpm" | "flat" | "cpc"
  status: "live" | "scheduled" | "ended" | "in_review"
  budget: number
  spent: number
  impressions: number
  clicks: number
  flight: string
  channels: string[]
}

export interface Creative {
  id: string
  campaignId: string
  advertiser: string
  name: string
  format: NativeFormat
  isWagering: boolean
  status: "pending" | "approved" | "rejected"
  submittedAt: string
  checks: { label: string; result: "pass" | "fail" | "check" }[]
}

export interface AdDecision {
  id: string
  at: string
  channel: string
  slot: string
  outcome: "wagering_served" | "non_wagering_served" | "house"
  reason: string
  locks: {
    session: { pass: boolean; ref?: string }
    age: { pass: boolean; ref?: string }
    optout: { pass: boolean; ref?: string }
  }
}

/** A channel's share of sponsor revenue for a period (sample data until billing is wired in). */
export interface Earnings {
  channelId: string
  period: string
  /** The creator's share, AUD inc. GST. */
  total: number
  /** Of the total, what came from age-restricted sponsors behind the triple lock. */
  ageVerified: number
  previousTotal: number
  byFormat: { format: NativeFormat; amount: number }[]
  bySponsor: { name: string; amount: number; ageCategory?: AgeCategory }[]
  byViewer: { state: string; impressions: number; amount: number }[]
}

/** Words to video. A template is a motion style; the publication's brand kit and voice are applied to it. */
export type VideoFormat = "long" | "short" | "inapp"

export interface VideoTemplate {
  id: string
  name: string
  tagline: string
  /** How scenes are drawn. */
  style: "explainer" | "report" | "countdown" | "datadesk" | "racecard" | "chalkboard"
  /** Included with every plan, or bought once for the account. */
  owned: boolean
  /** One-off price in AUD inc. GST, for templates not yet owned. */
  price?: number
  by: string
  formats: VideoFormat[]
  bestFor: string
}

export interface CreditEntry {
  id: string
  at: string
  description: string
  /** Negative for usage, positive for allowances and top-ups. */
  credits: number
  publication?: string
}

/** The account's AI credits (sample). Shared by every publication on the account. */
export interface CreditAccount {
  balance: number
  monthlyIncluded: number
  usedThisMonth: number
  /** Monthly spend cap in credits; usage stops and asks first beyond it. */
  cap: number
  renewsOn: string
  ledger: CreditEntry[]
}

export interface MadeVideo {
  id: string
  channelId: string
  title: string
  templateId: string
  format: VideoFormat
  seconds: number
  status: "ready" | "published"
  credits: number
  createdAt: string
  sourceArticleId?: string
}

/** Homestand Native Formats: advertisers supply a brief; we render it in the channel's design. */
export type NativeFormat = "chapter_sponsor" | "halftime" | "sponsored_story" | "sponsored_short" | "presented_by"

export interface Sponsor {
  id: string
  name: string
  /** Brand colour used in the format (contrast-checked like channel accents). */
  colour: string
  /** The one line the advertiser writes. */
  line: string
  /** Optional supporting sentence, shown where a story card shows its standfirst. */
  body?: string
  /** Optional image or muted loop. Without one, the unit is type on the sponsor's colour. */
  image?: string
  cta: string
  url: string
  ageCategory?: AgeCategory
}

/** Standalone article written in the studio (not generated from a video). */
export interface StandaloneArticle {
  id: string
  channelId: string
  slug: string
  status: ContentStatus
  headline: string
  standfirst: string
  author: string
  section: string
  hero?: string
  publishedAt?: string
  readMinutes: number
  blocks: Block[]
}

/** A custom page, e.g. About, Contact, Partners. */
export interface CustomPage {
  id: string
  channelId: string
  slug: string
  title: string
  status: "draft" | "published"
  inNav: boolean
  blocks: Block[]
}
