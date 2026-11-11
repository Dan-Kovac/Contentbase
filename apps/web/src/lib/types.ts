// Core domain types. Mirrors the PID data model (Section 9) so the sample data
// can be swapped for the database without touching screens.

export type ChannelMode = "standard" | "triple_lock" | "racing_only"
export type Pairing = "grandstand" | "broadcast" | "minimal"
export type Template = "editorial" | "broadcast" | "minimal"
export type AccentName =
  | "pitch"
  | "turf"
  | "harbour"
  | "maroon"
  | "navy"
  | "gold"
  | "violet"
  | "mono"

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
  accent: AccentName
  mode: ChannelMode
  plan: Plan
  nav: { label: string; href: string }[]
  /** Homepage modules in display order, with on/off. */
  modules: { id: HomeModule; enabled: boolean }[]
  adCategoryBlocks: string[]
  adsenseEnabled: boolean
  followers: number
  youtube?: {
    handle: string
    channelId: string
    subscribers: number
    autoImport: boolean
    lastSyncedAt: string
  }
  voice: { tone: string; bannedWords: string[]; houseStyle: string }
  notablePersonFlag: boolean
  sections: { slug: string; label: string }[]
}

export type HomeModule =
  | "lead"
  | "shorts"
  | "grid"
  | "sections"
  | "sponsor"

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
  | { type: "image"; caption: string }
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
  size: "300x250" | "970x250" | "320x100"
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
