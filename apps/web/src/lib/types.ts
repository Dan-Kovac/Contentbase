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
  /**
   * Google AdSense, connected with the publisher's own account. It only fills story and half-time
   * slots that Homestand hasn't sold, inside the same box, with gambling and alcohol blocked.
   */
  adsense?: AdSenseSettings
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
/**
 * A publication's ad earnings. Half of net Native Format revenue goes into a monthly creator pool,
 * split by verified minutes: minutes from signed-in viewers count in full, logged-out minutes count
 * a fifth. Pay never depends on which ads ran, so no one has a reason to favour an advertiser.
 */
export interface Earnings {
  channelId: string
  period: string
  /** The publication's pool share, AUD inc. GST. */
  total: number
  previousTotal: number
  /** Watch and reading minutes this period. */
  minutes: { signedIn: number; loggedOut: number }
  pool: {
    /** The creator pool across every publication this period. */
    size: number
    /** AUD per 1,000 weighted minutes. */
    ratePer1000: number
    /** Share of the pool paid by age-verified sponsors, who only buy behind the triple lock. */
    ageVerifiedShare: number
  }
  /** AdSense earnings, paid by Google straight to the publisher's own account. */
  adsense: number
}

/**
 * Email: each publication has its own streams (a weekly summary, big news, tips), sent from its
 * own domain. Viewers subscribe once they're signed in. No third-party newsletter tool.
 */
export interface EmailStream {
  id: string
  channelId: string
  name: string
  description: string
  cadence: string
  subscribers: number
  /** Share of delivered emails opened and clicked, last 90 days. */
  openRate: number
  clickRate: number
  /** Ticked for new members when they join. */
  defaultOn: boolean
  /** Drafted automatically from the week's published stories. */
  autoDraft: boolean
  /** Only for members (signed in); every stream needs an account to subscribe. */
  membersOnly: boolean
  lastSent?: string
}

export interface EmailCampaign {
  id: string
  channelId: string
  streamId: string
  subject: string
  previewText: string
  status: "sent" | "scheduled" | "draft"
  date: string
  recipients: number
  opens: number
  clicks: number
  unsubscribes: number
}

export interface SendingDomain {
  channelId: string
  /** The domain mail is sent from; Homestand's shared domain until the publication adds its own. */
  domain: string
  managed: boolean
  fromName: string
  fromAddress: string
  replyTo: string
  /** The Spam Act wants senders identified; we show this in every footer. */
  postalAddress: string
  status: "verified" | "pending"
  records: { type: "TXT" | "CNAME" | "MX"; host: string; value: string; purpose: string; status: "verified" | "pending" }[]
  bounceRate: number
  complaintRate: number
}

export interface SubscriberImport {
  id: string
  channelId: string
  file: string
  at: string
  rows: number
  imported: number
  duplicates: number
  invalid: number
  suppressed: number
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

/**
 * One line of the AI usage ledger. Append-only: a render places a hold, then the hold is either
 * charged (on success) or released (on failure). The balance is the sum of the ledger.
 */
export interface LedgerEntry {
  id: string
  at: string
  kind: "allowance" | "topup" | "hold" | "charge" | "release"
  description: string
  /** What the provider charged us, for usage lines (AUD). */
  cost?: number
  /** Signed change to the balance (AUD): usage is negative. */
  amount: number
  publication?: string
}

/** The account's AI usage balance in AUD (sample). Shared by every publication on the account. */
export interface CreditAccount {
  balance: number
  monthlyIncluded: number
  usedThisMonth: number
  /** Monthly spend cap in AUD; usage stops and asks first beyond it. */
  cap: number
  renewsOn: string
  ledger: LedgerEntry[]
}

export interface MadeVideo {
  id: string
  channelId: string
  title: string
  templateId: string
  format: VideoFormat
  seconds: number
  status: "ready" | "published"
  /** What the render was charged (AUD). */
  charged: number
  createdAt: string
  sourceArticleId?: string
}

/** Homestand Native Formats: advertisers supply a brief; we render it in the channel's design. */
export type NativeFormat = "chapter_sponsor" | "halftime" | "sponsored_story" | "sponsored_short" | "presented_by"

export type AdSenseSlot = "story" | "halftime"

export interface AdSenseSettings {
  publisherId: string
  /** Fill unsold slots. Off means unsold slots show the channel's own call to action. */
  fillUnsold: boolean
  /** Slots Homestand hasn't sold this week (sample data; in a real build the ad server knows). */
  unsoldSlots: AdSenseSlot[]
  /** The publisher confirmed these categories are blocked in their AdSense account. */
  blockedCategoriesConfirmed: boolean
}

export interface Sponsor {
  /** Set when the slot is filled by an ad network instead of a sold sponsor. */
  network?: "adsense"
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
  /** The publications this creative is written for. Sponsors write one creative per publication, so a racing line never lands on a football site. */
  channelIds: string[]
  /** For everyday sponsors: which fill they are in the slot plans. */
  fill?: "primary" | "secondary"
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
