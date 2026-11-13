import type { Metadata } from "next"
import Link from "next/link"
import { ArrowUpRight } from "lucide-react"
import { Wordmark } from "@/components/brand/wordmark"

export const metadata: Metadata = { title: "Demo guide", robots: { index: false } }

type Step = { href: string; label: string; say: string }
type Track = { id: string; title: string; who: string; minutes: number; steps: Step[] }

const VIDEO = "/c/footyfix/v/blues-centre-bounce-problem"
const TRACK_VIDEO = "/c/trackside/v/cox-plate-draw"

/**
 * Unlisted. The click-through for a live demo, in three tracks. Links set the viewer state with
 * ?as= where it matters, so each step shows what it should whatever happened before.
 */
const TRACKS: Track[] = [
  {
    id: "sportsbet",
    title: "For Sportsbet",
    who: "Verified adults, compliance evidence, formats people watch, and a home for in-house brands",
    minutes: 8,
    steps: [
      { href: "/advertisers", label: "For advertisers", say: "The rule in one line, then the triple lock: pick who's watching and the sponsors change." },
      { href: `${TRACK_VIDEO}?as=logged_out`, label: "A Trackside video, logged out", say: "No age-restricted sponsor. Everyday brands fill every slot, the same shape as the content." },
      { href: "/c/trackside/join?next=/c/trackside", label: "Join Trackside", say: "The channel's own button and join page, in its own brand. One account works on every channel." },
      { href: `/account/verify-age?next=${encodeURIComponent(TRACK_VIDEO)}`, label: "Confirm 18+", say: "A certified provider checks age. We keep the result, never the ID." },
      { href: `${TRACK_VIDEO}?as=verified`, label: "The same video, confirmed 18+", say: "Now the wagering sponsor can show: chapter sponsor and half-time break, with 18+ and a one-tap opt-out." },
      { href: `${TRACK_VIDEO}?as=opted_out`, label: "Opted out of betting ads", say: "One tap and every betting sponsor is replaced, on every channel." },
      { href: "/admin/evidence", label: "Evidence log", say: "Every age-restricted decision, each lock with its reference, exportable for a compliance team." },
      { href: "/admin/campaigns", label: "Campaigns", say: "Impressions to confirmed adults, and zero served outside a valid session." },
      { href: "/studio/publications", label: "In-house brands", say: "Several brands on one account, each its own publication. Ownership needs legal advice first." },
    ],
  },
  {
    id: "publishers",
    title: "For publishers and creators",
    who: "Own the audience, keep the revenue, publish more with less work",
    minutes: 8,
    steps: [
      { href: "/", label: "Landing page", say: "What it is, in one line, with one upload becoming a publication beside it." },
      { href: "/signup", label: "Sign-up, four steps", say: "Connect YouTube, pick the channel, make it yours (name, look, button), live." },
      { href: "/studio", label: "Studio home", say: "What's ready to review, what's on the way, and what sponsors paid this month." },
      { href: "/studio/review/v_blues", label: "Review and publish", say: "Headline options, the article in their voice, shorts, SEO. Nothing goes live until they publish." },
      { href: "/studio/publications", label: "All publications", say: "One account, every brand at once. The switcher at the top moves between them." },
      { href: "/studio/video/new?article=a_ladder", label: "Words to video", say: "Write once, get a long-form video or a short in their brand. AI credits pay for it." },
      { href: "/studio/credits", label: "AI credits", say: "One balance for the account, top-ups and a spend cap. The second revenue line." },
      { href: "/publishers", label: "For publishers", say: "Keep the wagering revenue the 2027 rules would take, and keep the rankings." },
    ],
  },
  {
    id: "publication",
    title: "The publication, rethought",
    who: "What a sports publication looks like without banners",
    minutes: 5,
    steps: [
      { href: "/c/footyfix?as=logged_out", label: "Channel home", say: "Three sponsors at most: a byline, a short among shorts, a story among stories." },
      { href: `${VIDEO}?as=logged_out`, label: "Video page", say: "Player with chapters, then the article. The half-time break is the width of the article, like a photo." },
      { href: "/c/footyfix/shorts", label: "Shorts feed", say: "A sponsored short fills the same frame as every other short." },
      { href: "/c/footyfix/a/ladder-predictor-after-round-7", label: "Article", say: "The channel's call to action at the end, in its own words." },
      { href: "/#page-title", label: "Typical page vs Homestand", say: "Seven banners fighting the story, against three sponsors shaped like the content." },
      { href: "/c/trackside", label: "A second look", say: "Same platform, Broadcast template, its own colour and button." },
    ],
  },
]

export default function DemoPage() {
  return (
    <div className="min-h-svh bg-background">
      <header className="bg-brand-black text-brand-white">
        <div className="mx-auto flex max-w-[1080px] flex-col gap-4 px-4 py-12 md:px-8">
          <Wordmark height={24} />
          <h1 className="text-[40px] font-extrabold leading-[44px] tracking-[-0.03em]">Demo guide</h1>
          <p className="max-w-[60ch] text-[16px] leading-[25px] text-brand-muted">
            Three click-throughs, each a few minutes. Every link opens the running app on sample data. On channel pages, a small bar at the bottom switches who is watching; add ?demo=0
            to hide it.
          </p>
          <nav aria-label="Tracks" className="flex flex-wrap gap-2 pt-2">
            {TRACKS.map((t) => (
              <a key={t.id} href={`#${t.id}`} className="rounded-full border border-white/25 px-3 py-1.5 text-[13px] font-semibold hover:bg-white/10">
                {t.title}
              </a>
            ))}
            <Link href="/screens" className="rounded-full px-3 py-1.5 text-[13px] font-semibold text-brand-muted hover:text-brand-white">
              Every screen
            </Link>
          </nav>
        </div>
      </header>
      <main className="mx-auto flex max-w-[1080px] flex-col gap-14 px-4 py-12 md:px-8">
        {TRACKS.map((t) => (
          <section key={t.id} id={t.id} aria-labelledby={`${t.id}-h`} className="scroll-mt-6">
            <div className="mb-4 flex flex-wrap items-baseline justify-between gap-2">
              <div>
                <h2 id={`${t.id}-h`} className="text-[28px] font-bold leading-8 tracking-[-0.5px]">
                  {t.title}
                </h2>
                <p className="text-[15px] text-muted-foreground">{t.who}</p>
              </div>
              <span className="text-[13px] text-muted-foreground">About {t.minutes} minutes</span>
            </div>
            <ol className="divide-y rounded-lg border">
              {t.steps.map((s, i) => (
                <li key={s.href + i}>
                  <Link href={s.href} className="group grid grid-cols-[32px_1fr_auto] items-start gap-3 p-4 outline-none hover:bg-accent focus-visible:bg-accent">
                    <span className="font-mono text-[13px] leading-6 text-muted-foreground">{String(i + 1).padStart(2, "0")}</span>
                    <span className="flex flex-col gap-0.5">
                      <span className="text-[15px] font-semibold">{s.label}</span>
                      <span className="text-[14px] leading-[21px] text-muted-foreground">{s.say}</span>
                    </span>
                    <ArrowUpRight className="mt-1 size-4 text-muted-foreground group-hover:text-foreground" aria-hidden />
                  </Link>
                </li>
              ))}
            </ol>
          </section>
        ))}
      </main>
    </div>
  )
}
