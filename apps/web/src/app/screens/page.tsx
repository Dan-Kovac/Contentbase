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
      { href: "/", name: "Landing", what: "Your channel. Your audience. Creator and publisher paths, how it works, earn, migrate." },
      { href: "/publishers", name: "For publishers", what: "Migration with rankings kept, the 2027 wagering rules, white-glove move." },
      { href: "/pricing", name: "Pricing", what: "Starter, Pro, Publisher, Enterprise in AUD inc. GST, 14-day trial, comparison, FAQ.", ids: "BIL-01, BIL-02" },
      { href: "/advertisers", name: "For advertisers", what: "Logged-in, age-assured audience, the triple lock, ad formats, contact.", ids: "TLK-09" },
    ],
  },
  {
    title: "Sign-up and sign-in",
    who: "Creators joining Homestand (YouTube first)",
    screens: [
      { href: "/signup", name: "1. Connect YouTube", what: "Continue with Google; read-only access to public videos.", ids: "MIG-01" },
      { href: "/signup/channel", name: "2. Pick your channel", what: "Which YouTube channel, what to import, auto-import on." },
      { href: "/signup/name", name: "3. Name and address", what: "Channel name and subdomain with availability check.", ids: "CHN-01" },
      { href: "/signup/style", name: "4. Choose your look", what: "Template, accent and type pairing with a live preview.", ids: "CHN-02, CHN-03" },
      { href: "/signup/plan", name: "5. Plan", what: "Pick a plan, 14-day trial, card optional." },
      { href: "/signup/importing", name: "6. You're live", what: "Live URL and import progress; drafts arrive in Ready to review.", ids: "MIG-07" },
      { href: "/signin", name: "Creator sign-in", what: "Google or email magic link." },
    ],
  },
  {
    title: "Creator studio",
    who: "Creators, after sign-up",
    screens: [
      { href: "/studio", name: "Home", what: "Ready to review queue, pipeline, YouTube status, 30-day numbers.", ids: "ANL-01" },
      { href: "/studio/review", name: "Ready to review", what: "Draft packs from new YouTube uploads, with compliance flags.", ids: "ING-11, MIG-08" },
      { href: "/studio/review/v_blues", name: "Review workspace", what: "Article editor with AI assist, shorts, SEO and thumbnail, transcript, publish.", ids: "ING-04–10, EDT-01, EDT-02, EDT-04, EDT-05" },
      { href: "/studio/review/v_coxplate", name: "Review with compliance flags", what: "Odds and a call to bet flagged inline, publishing blocked until resolved.", ids: "ING-10" },
      { href: "/studio/library", name: "Library", what: "Videos, articles and shorts with status, filters and bulk actions.", ids: "EDT-03" },
      { href: "/studio/shorts", name: "Shorts", what: "Clips cut from your videos and your YouTube Shorts.", ids: "ING-07" },
      { href: "/studio/shorts/s_blues1", name: "Shorts editor", what: "9:16 preview, trim, reframe, captions.", ids: "EDT-06" },
      { href: "/studio/upload", name: "Upload", what: "Resumable upload, then the processing pipeline.", ids: "ING-01–03" },
      { href: "/studio/analytics", name: "Analytics", what: "Views, watch time, sign-ups, search traffic, top content, sources.", ids: "ANL-01" },
      { href: "/studio/imports", name: "Imports", what: "Import history with counts.", ids: "MIG-07" },
      { href: "/studio/imports/new", name: "New import", what: "YouTube, WordPress, Ghost, Substack or RSS.", ids: "MIG-02–04" },
      { href: "/studio/imports/imp_yt_initial", name: "Import report", what: "Problems with retry, redirect map, generate articles for all.", ids: "MIG-05, MIG-07, MIG-08" },
    ],
  },
  {
    title: "Studio settings",
    who: "Creators setting up and running their channel",
    screens: [
      { href: "/studio/settings", name: "Channel", what: "Name, tagline, address, time zone, sections, danger zone." },
      { href: "/studio/settings/design", name: "Design", what: "Logo, accent (with contrast check), type pairing, template, homepage modules, navigation.", ids: "CHN-02, CHN-03, CHN-05, CHN-07" },
      { href: "/studio/settings/connections", name: "Connections", what: "YouTube (auto-import), source files, TikTok and Instagram later.", ids: "MIG-01, MIG-10" },
      { href: "/studio/settings/domain", name: "Custom domain", what: "DNS records, verification, SSL, go live.", ids: "MIG-06" },
      { href: "/studio/settings/monetisation", name: "Monetisation", what: "Channel mode, triple lock, where ads appear, category blocks, AdSense.", ids: "CHN-06, ADS-01, ADS-08, ADS-09, TLK-10" },
      { href: "/studio/settings/voice", name: "Brand voice", what: "Tone, banned words, house style.", ids: "ING-09" },
      { href: "/studio/settings/billing", name: "Billing", what: "Plan, video hours, upgrades, invoices with GST.", ids: "BIL-01, BIL-02" },
    ],
  },
  {
    title: "Public channel",
    who: "Viewers (shown for Footy Fix; swap the slug for trackside)",
    screens: [
      { href: "/c/footyfix", name: "Channel home", what: "Lead story, shorts row, sponsor band, article grid, sections.", ids: "CHN-04, CHN-05, ADS-01" },
      { href: "/c/footyfix/v/blues-centre-bounce-problem", name: "Video page", what: "Player, chapters, article, in-article and end ads, transcript, related, Preview-as ad states.", ids: "SEO-02, SEO-05, SEO-06, TLK-01–03" },
      { href: "/c/footyfix/v/inside-blues-pre-season", name: "Exclusive (logged out)", what: "Sign in to watch gate, no ads.", ids: "AUD-03" },
      { href: "/c/footyfix/shorts", name: "Shorts feed", what: "Vertical player, next and previous, sponsored card every 8.", ids: "ING-07" },
      { href: "/c/footyfix/s/afl", name: "Section", what: "Section grid." },
      { href: "/c/footyfix/live", name: "Live coverage", what: "Live blog; wagering ads switched off.", ids: "TLK-08" },
      { href: "/c/footyfix/about", name: "About", what: "Bio, followers, links." },
      { href: "/c/footyfix/search", name: "Search", what: "Videos, articles and shorts." },
      { href: "/c/trackside", name: "Trackside (racing-only)", what: "Navy accent, Grandstand pairing, racing-only mode." },
    ],
  },
  {
    title: "Viewer account",
    who: "Signed-in viewers, across every channel",
    screens: [
      { href: "/account/signin", name: "Sign in", what: "One account for every Homestand channel.", ids: "AUD-01" },
      { href: "/account/check-email", name: "Check your email", what: "Magic link sent." },
      { href: "/account", name: "Account centre", what: "Profile, following, ad preferences with the betting opt-out, your data.", ids: "AUD-02, AUD-04, TLK-03" },
      { href: "/account/verify-age", name: "Age assurance", what: "Certified provider check; we keep the result, never your ID.", ids: "TLK-02" },
    ],
  },
  {
    title: "Admin and compliance",
    who: "The Homestand team",
    screens: [
      { href: "/admin", name: "Overview", what: "Pilot KPIs and alerts.", ids: "ANL-04" },
      { href: "/admin/review", name: "Creative review", what: "Checklist, approve or reject with a reason.", ids: "ADS-06, ADM-02" },
      { href: "/admin/campaigns", name: "Campaigns", what: "CPM, flat and CPC; never per sign-up.", ids: "ADS-04, ADS-05, ANL-03" },
      { href: "/admin/evidence", name: "Ad decisions and evidence", what: "Each lock per impression, export CSV or PDF.", ids: "TLK-05, TLK-09, ADM-03" },
      { href: "/admin/channels", name: "Channels", what: "Suspend, change mode, impersonate, all logged.", ids: "ADM-01, ADM-05" },
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
