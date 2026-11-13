import Link from "next/link"
import { ArrowUpRight } from "lucide-react"
import { Wordmark } from "@/components/brand/wordmark"

export const metadata = { title: "Every screen" }

type Screen = { href: string; name: string; what: string; ids?: string }
type Group = { title: string; who: string; screens: Screen[] }

const GROUPS: Group[] = [
  {
    title: "Marketing site",
    who: "Prospective creators, publishers and advertisers",
    screens: [
      { href: "/", name: "Landing", what: "Turn your channel into a publication you own: who wins, one account for every publication, how it works, words to video, the page rethought, age-verified advertising." },
      { href: "/publishers", name: "For publishers", what: "Keep the revenue (sample earnings), migration with rankings kept, age-verified advertising, white-glove move." },
      { href: "/pricing", name: "Pricing", what: "Starter, Pro, Publisher, Enterprise in AUD inc. GST, 14-day trial, comparison, FAQ.", ids: "BIL-01, BIL-02" },
      { href: "/advertisers", name: "For advertisers", what: "The rule in one line, an interactive triple lock, the five same-shape formats, evidence pack, network numbers, buying, contact.", ids: "ADS-01, ADS-07, TLK-09" },
    ],
  },
  {
    title: "Sign-up and sign-in",
    who: "Creators joining Homestand (YouTube first)",
    screens: [
      { href: "/signup", name: "1. Connect YouTube", what: "Continue with Google; read-only access to public videos.", ids: "MIG-01" },
      { href: "/signup/channel", name: "2. Pick your channel", what: "Which YouTube channel, what to import, auto-import on." },
      { href: "/signup/name", name: "3. Make it yours", what: "Name and address, template, colour and the channel's button, with a live preview. Every channel starts on a Pro trial.", ids: "CHN-01, CHN-02, CHN-03" },
      { href: "/signup/importing", name: "4. You're live", what: "Live URL and import progress; ends on Review your first draft.", ids: "MIG-07" },
      { href: "/signin", name: "Creator sign-in", what: "Google or email magic link." },
    ],
  },
  {
    title: "Creator studio",
    who: "Creators, after sign-up",
    screens: [
      { href: "/studio", name: "Home", what: "The open publication's queue, pipeline, sponsor earnings and 30-day numbers.", ids: "ANL-01" },
      { href: "/studio/publications", name: "All publications", what: "One account, every brand: totals, a card per publication and one review queue. The header switcher moves between them." },
      { href: "/studio/review", name: "Ready to review", what: "Draft packs from new YouTube uploads, with compliance flags.", ids: "ING-11, MIG-08" },
      { href: "/studio/review/v_blues", name: "Review workspace", what: "Article editor with AI assist, shorts, SEO and thumbnail, transcript, publish.", ids: "ING-04–10, EDT-01, EDT-02, EDT-04, EDT-05" },
      { href: "/studio/review/v_coxplate", name: "Review with compliance flags", what: "Odds and a call to bet flagged inline, publishing blocked until resolved.", ids: "ING-10" },
      { href: "/studio/library", name: "Library", what: "Videos, articles and shorts with status, filters and bulk actions.", ids: "EDT-03" },
      { href: "/studio/shorts", name: "Shorts", what: "Clips cut from your videos and your YouTube Shorts.", ids: "ING-07" },
      { href: "/studio/shorts/s_blues1", name: "Shorts editor", what: "9:16 preview, trim, reframe, captions.", ids: "EDT-06" },
      { href: "/studio/upload", name: "Upload", what: "Resumable upload, then the processing pipeline.", ids: "ING-01–03" },
      { href: "/studio/analytics", name: "Analytics", what: "Earnings by format, sponsor and viewer, then views, watch time, sign-ups, search traffic and top content.", ids: "ANL-01" },
      { href: "/studio/video", name: "Video", what: "Words to video: articles ready to become videos, what's been made, credit balance." },
      { href: "/studio/video/new?article=a_ladder", name: "Make a video", what: "Article to video: template, format, voice and brand kit, an editable storyboard, credit cost, render." },
      { href: "/studio/video/templates", name: "Video templates", what: "Three included, three to buy, each drawn in the publication's brand." },
      { href: "/studio/credits", name: "AI credits", what: "Balance for the account, allowance, top-ups, spend cap, usage by publication, prices." },
      { href: "/studio/email", name: "Email", what: "The publication's newsletters, sent and scheduled emails, sending health." },
      { href: "/studio/email/new?stream=es_weekly", name: "New email", what: "Blocks in your brand or paste your own HTML, draft from this week, preview, checks, send." },
      { href: "/studio/email/subscribers", name: "Subscribers", what: "Import a list with consent; duplicates and past unsubscribes skipped." },
      { href: "/studio/email/sending", name: "Sending", what: "From details, SPF, DKIM, MX and DMARC records, bounce and complaint rates." },
      { href: "/studio/imports", name: "Imports", what: "Import history with counts.", ids: "MIG-07" },
      { href: "/studio/imports/new", name: "New import", what: "YouTube, WordPress, Ghost, Substack or RSS.", ids: "MIG-02–04" },
      { href: "/studio/imports/imp_yt_initial", name: "Import report", what: "Problems with retry, redirect map, generate articles for all.", ids: "MIG-05, MIG-07, MIG-08" },
    ],
  },
  {
    title: "Articles and pages",
    who: "Creators writing without a video, and building their own pages",
    screens: [
      { href: "/studio/articles", name: "Articles", what: "Standalone articles written in the studio, not from a video: drafts and published." },
      { href: "/studio/articles/a_ladder", name: "Article editor", what: "Block editor for a standalone article: headline, standfirst, hero image, body, publish." },
      { href: "/studio/pages", name: "Pages", what: "Custom pages such as About and Work with us, with status and whether each is in the navigation." },
      { href: "/studio/pages/pg_about", name: "Page editor", what: "Block editor for a custom page, with a show-in-navigation switch." },
    ],
  },
  {
    title: "Studio settings",
    who: "Creators setting up and running their channel",
    screens: [
      { href: "/studio/settings", name: "Channel", what: "Name, tagline, address, time zone, sections, danger zone." },
      { href: "/studio/settings/design", name: "Design", what: "Logo, accent, call to action, type pairing, Editorial or Broadcast template, homepage modules, navigation.", ids: "CHN-02, CHN-03, CHN-05, CHN-07" },
      { href: "/studio/settings/connections", name: "Connections", what: "YouTube (auto-import), source files, TikTok and Instagram later.", ids: "MIG-01, MIG-10" },
      { href: "/studio/settings/domain", name: "Custom domain", what: "DNS records, verification, SSL, go live.", ids: "MIG-06" },
      { href: "/studio/settings/monetisation", name: "Monetisation", what: "Standard or Age-verified mode, alcohol and wagering allowed or blocked, where native formats appear, category blocks.", ids: "CHN-06, ADS-01, ADS-08, ADS-09" },
      { href: "/studio/settings/voice", name: "Brand voice", what: "Tone, banned words, house style.", ids: "ING-09" },
      { href: "/studio/settings/billing", name: "Billing", what: "Plan, video hours, upgrades, invoices with GST.", ids: "BIL-01, BIL-02" },
    ],
  },
  {
    title: "Public channel",
    who: "Viewers. Footy Fix uses the Editorial template; Trackside uses Broadcast.",
    screens: [
      { href: "/c/footyfix", name: "Channel home", what: "Editorial: Presented by on the lead, a sponsored short among shorts, a sponsored story among stories, the channel's call to action.", ids: "CHN-04, CHN-05, ADS-01" },
      { href: "/c/footyfix/join", name: "Join", what: "The channel's own call to action and join page, in its brand. One account for every channel.", ids: "AUD-01" },
      { href: "/c/footyfix/newsletters", name: "Newsletters", what: "The channel's email streams; members choose which they get." },
      { href: "/c/footyfix/v/blues-centre-bounce-problem", name: "Video page", what: "Chapter sponsor, a half-time break the width of the article, a sponsored short in related. The demo bar switches viewer state.", ids: "SEO-02, SEO-05, SEO-06, TLK-01–03" },
      { href: "/c/footyfix/v/blues-centre-bounce-problem?as=verified", name: "Video page, confirmed 18+", what: "The same page for a signed-in adult: the wagering sponsor shows, with 18+ and the opt-out.", ids: "TLK-01–03" },
      { href: "/c/footyfix/v/inside-blues-pre-season", name: "Members-only (logged out)", what: "Join free to watch, in the channel's accent; unlocks once joined. No ads.", ids: "AUD-03" },
      { href: "/c/footyfix/shorts", name: "Shorts feed", what: "Vertical player, next and previous, a sponsored short at most every 8.", ids: "ING-07" },
      { href: "/c/footyfix/s/afl", name: "Section", what: "Section grid." },
      { href: "/c/footyfix/live", name: "Live coverage", what: "Live blog; wagering ads switched off.", ids: "TLK-08" },
      { href: "/c/footyfix/a/ladder-predictor-after-round-7", name: "Article", what: "Standalone article from the studio: headline, standfirst, hero, body at reading width." },
      { href: "/c/footyfix/p/about", name: "Custom page", what: "A creator's own page (About), built in the studio page editor." },
      { href: "/c/footyfix/about", name: "About", what: "Bio, followers, links." },
      { href: "/c/footyfix/search", name: "Search", what: "Videos, articles and shorts." },
      { href: "/c/trackside", name: "Trackside (Broadcast)", what: "Broadcast template: dark and video-led, gold accent, Grandstand pairing, age-verified." },
    ],
  },
  {
    title: "Viewer account",
    who: "Signed-in viewers, across every channel",
    screens: [
      { href: "/account/signin", name: "Sign in", what: "One account for every Homestand channel.", ids: "AUD-01" },
      { href: "/account/check-email", name: "Check your email", what: "Magic link sent." },
      { href: "/account", name: "Account centre", what: "Profile, following, age-restricted ads (separate betting and alcohol switches, age status, AdStop), your data.", ids: "AUD-02, AUD-04, TLK-03" },
      { href: "/account/verify-age", name: "Age assurance", what: "Certified provider check for age-restricted ads; we keep the result, never your ID.", ids: "TLK-02" },
    ],
  },
  {
    title: "Admin and compliance",
    who: "The Homestand team",
    screens: [
      { href: "/admin", name: "Overview", what: "Pilot KPIs, including age-restricted impressions outside a valid triple-lock session (target 0), and alerts.", ids: "ANL-04" },
      { href: "/admin/review", name: "Creative review", what: "Creative rendered in its native format, age-restricted checklist, approve or reject with a reason.", ids: "ADS-06, ADM-02" },
      { href: "/admin/campaigns", name: "Campaigns", what: "Format, age category, CPM, flat and CPC; never per sign-up.", ids: "ADS-04, ADS-05, ANL-03" },
      { href: "/admin/evidence", name: "Ad decisions and evidence", what: "Each lock per age-restricted impression, export CSV or PDF.", ids: "TLK-05, TLK-09, ADM-03" },
      { href: "/admin/channels", name: "Channels", what: "Standard or Age-verified mode, suspend, impersonate, all logged.", ids: "ADM-01, ADM-05" },
      { href: "/admin/moderation", name: "Moderation", what: "Viewer reports and takedowns.", ids: "ADM-04" },
      { href: "/admin/audit", name: "Audit log", what: "Every admin and compliance action.", ids: "ADM-01" },
    ],
  },
]

export default function ScreensPage() {
  const total = GROUPS.reduce((n, g) => n + g.screens.length, 0)
  return (
    <div className="min-h-svh bg-background">
      <header className="bg-brand-black text-brand-white">
        <div className="mx-auto flex max-w-[1280px] flex-col gap-4 px-4 py-14 md:px-8">
          <Wordmark height={26} />
          <h1 className="text-[44px] font-extrabold leading-[46px] tracking-[-1.1px]">Every screen</h1>
          <Link href="/demo" className="w-fit rounded-full bg-pitch px-4 py-2 text-[14px] font-semibold text-pop-foreground">
            Start with the demo guide
          </Link>
          <p className="max-w-[60ch] text-[17px] leading-[26px] text-brand-muted">
            {total} screens across the marketing site, sign-up, creator studio, public channel, viewer account and admin. Each one is a working page on sample data. Requirement IDs refer to the PID.
          </p>
        </div>
      </header>
      <main className="mx-auto flex max-w-[1280px] flex-col gap-14 px-4 py-12 md:px-8">
        {GROUPS.map((g) => (
          <section key={g.title} aria-labelledby={g.title} className="flex flex-col gap-4">
            <div>
              <h2 id={g.title} className="text-[30px] font-bold leading-[34px] tracking-[-0.6px]">
                {g.title}
              </h2>
              <p className="text-[15px] text-muted-foreground">{g.who}</p>
            </div>
            <ul className="grid gap-px overflow-hidden rounded-lg border bg-border sm:grid-cols-2 lg:grid-cols-3">
              {g.screens.map((s) => (
                <li key={s.href} className="bg-background">
                  <Link href={s.href} className="group flex h-full flex-col gap-1.5 p-4 outline-none hover:bg-accent focus-visible:bg-accent">
                    <span className="flex items-center justify-between gap-2 text-[15px] font-semibold">
                      {s.name}
                      <ArrowUpRight className="size-4 text-muted-foreground group-hover:text-foreground" aria-hidden />
                    </span>
                    <span className="text-[13px] leading-[18px] text-muted-foreground">{s.what}</span>
                    <span className="mt-auto flex flex-wrap items-center justify-between gap-2 pt-2">
                      <span className="font-mono text-xs text-muted-foreground">{s.href}</span>
                      {s.ids && <span className="font-mono text-[11px] text-muted-foreground">{s.ids}</span>}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        ))}
      </main>
    </div>
  )
}
