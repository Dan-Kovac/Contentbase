import type { Metadata } from "next"
import Link from "next/link"
import { ArrowUpRight } from "lucide-react"
import { Wordmark } from "@/components/brand/wordmark"

export const metadata: Metadata = { title: "Showcase", robots: { index: false } }

type Step = { href: string; label: string; say: string }
type Act = { id: string; title: string; point: string; minutes: number; steps: Step[] }

const TRACK_VIDEO = "/c/trackside/v/cox-plate-draw"

/**
 * Unlisted. The showcase: one run of about fifteen minutes in four acts, matching the four things
 * the room needs to leave with. Links set the viewer state with ?as= so each step shows what it
 * should whatever happened before.
 */
const ACTS: Act[] = [
  {
    id: "in-house",
    title: "1. Our brands, on their own publications",
    point:
      "From 1 January 2027 a betting ad online needs a signed-in viewer, a confirmed adult and an opt-out. Our in-house brands can meet that if they live on their own publications, and those publications grow organically from the videos we already make.",
    minutes: 4,
    steps: [
      { href: "/c/trackside?as=logged_out", label: "An in-house racing brand", say: "Its own site, its own look and its own join button. Every YouTube video becomes a video page, an article and shorts, all indexed by Google." },
      { href: "/studio/publications", label: "Every brand on one account", say: "One login runs each publication. The switcher at the top moves between them; this view shows them all at once." },
      { href: "/studio/review/v_coxplate", label: "Review before anything goes live", say: "The draft pack arrives ready: article in the brand's voice, chapters, shorts, SEO. Odds and 'bet now' lines are flagged before publishing." },
      { href: "/studio/analytics", label: "Organic growth", say: "Search traffic, signed-in members and watch time, per publication." },
    ],
  },
  {
    id: "triple-lock",
    title: "2. The triple lock",
    point: "A wagering ad only shows to a signed-in viewer, confirmed 18+, who hasn't opted out. Anything else, or any error, and it doesn't show. Every decision is logged as evidence.",
    minutes: 4,
    steps: [
      { href: `${TRACK_VIDEO}?as=logged_out`, label: "The video, logged out", say: "No betting sponsor. Everyday brands fill the slots, shaped like the content beside them, and unsold ones go to AdSense with gambling blocked." },
      { href: "/c/trackside/join?next=/c/trackside", label: "Join", say: "The brand's own join page. One central sign-in works on every publication." },
      { href: `/account/verify-age?next=${encodeURIComponent(TRACK_VIDEO)}`, label: "Confirm 18+", say: "A certified provider checks age. We keep the result, never the ID." },
      { href: `${TRACK_VIDEO}?as=verified`, label: "The same video, confirmed 18+", say: "Now the betting sponsor can show, with an 18+ mark and a one-tap opt-out." },
      { href: `${TRACK_VIDEO}?as=opted_out`, label: "Opted out", say: "One tap and every betting sponsor is replaced, on every publication." },
      { href: "/admin/evidence", label: "The evidence", say: "Each lock with its reference, for every decision, exportable for compliance and regulators." },
    ],
  },
  {
    id: "money",
    title: "3. How it makes money",
    point: "A platform fee per publication, a share of the ads Homestand sells, AdSense from day one so every page earns, and AI at cost plus 20%.",
    minutes: 4,
    steps: [
      { href: "/pricing", label: "The platform fee", say: "Per publication, monthly. In-house brands and networks are Enterprise." },
      { href: "/advertisers", label: "Ads Homestand sells", say: "Native formats sold to brands, with the triple lock and evidence as the premium. Half goes to a creator pool, split by verified minutes." },
      { href: "/studio/settings/monetisation#adsense", label: "AdSense from day one", say: "Unsold story and half-time slots fill from the publisher's own AdSense, in the same box, with gambling and alcohol blocked." },
      { href: "/studio/analytics#earnings", label: "What a publisher earns", say: "Their share of the pool by signed-in minutes, plus AdSense. Pay never depends on which ads ran." },
      { href: "/studio/credits", label: "AI at cost plus 20%", say: "Every AI job is charged at what the provider charges us plus 20%, on a ledger the customer can read line by line." },
    ],
  },
  {
    id: "becomes",
    title: "4. What it becomes",
    point: "The same platform fixes the 2027 problem for every sports publisher and creator, not just ours. Then it helps them make more: video from words, newsletters, more brands.",
    minutes: 3,
    steps: [
      { href: "/publishers", label: "For any publisher", say: "Keep wagering revenue the 2027 rules would take, and keep their search rankings." },
      { href: "/signup", label: "Live in four steps", say: "Connect YouTube, pick the channel, make it theirs, live." },
      { href: "/c/footyfix?as=logged_out", label: "An independent creator", say: "A football creator's channel on the same platform: Editorial template, their colour, their button." },
      { href: "/studio/video/new?article=a_ladder", label: "Next: words to video", say: "An article becomes an explainer or a short in the brand's look and voice, for cents." },
      { href: "/c/footyfix/newsletters?as=signed_in", label: "Next: newsletters", say: "Members choose their newsletters, sent from the publication's own domain." },
    ],
  },
]

const MVP = [
  "YouTube sign-up and import",
  "Draft packs: article, chapters, shorts, SEO",
  "Review and publish",
  "Publications with their own look and join button",
  "Several publications on one account",
  "One central sign-in for viewers",
  "Age assurance and the triple lock, with evidence",
  "Native Formats, with AdSense filling unsold slots",
  "The creator pool and analytics",
  "Plans and billing",
]

const NEXT = ["Words to video", "AI usage beyond the plan", "Newsletters", "Site migration", "Licensing the triple lock to other sites"]

export default function DemoPage() {
  return (
    <div className="min-h-svh bg-background">
      <header className="bg-brand-black text-brand-white">
        <div className="mx-auto flex max-w-[1080px] flex-col gap-4 px-4 py-12 md:px-8">
          <Wordmark height={24} />
          <h1 className="text-[40px] font-extrabold leading-[44px] tracking-[-0.03em]">Showcase</h1>
          <p className="max-w-[62ch] text-[16px] leading-[25px] text-brand-muted">
            Four acts, about fifteen minutes. Every link opens the running app on sample data. On channel pages, a small bar at the bottom switches who is watching; add ?demo=0 to hide it.
          </p>
          <nav aria-label="Acts" className="flex flex-wrap gap-2 pt-2">
            {ACTS.map((a) => (
              <a key={a.id} href={`#${a.id}`} className="rounded-full border border-white/25 px-3 py-1.5 text-[13px] font-semibold hover:bg-white/10">
                {a.title.replace(/^\d\. /, "")}
              </a>
            ))}
            <Link href="/screens" className="rounded-full px-3 py-1.5 text-[13px] font-semibold text-brand-muted hover:text-brand-white">
              Every screen
            </Link>
          </nav>
        </div>
      </header>
      <main className="mx-auto flex max-w-[1080px] flex-col gap-14 px-4 py-12 md:px-8">
        {ACTS.map((a) => (
          <section key={a.id} id={a.id} aria-labelledby={`${a.id}-h`} className="scroll-mt-6">
            <div className="mb-4 flex flex-col gap-2">
              <div className="flex flex-wrap items-baseline justify-between gap-2">
                <h2 id={`${a.id}-h`} className="text-[28px] font-bold leading-8 tracking-[-0.5px]">
                  {a.title}
                </h2>
                <span className="text-[13px] text-muted-foreground">About {a.minutes} minutes</span>
              </div>
              <p className="max-w-[72ch] text-[16px] leading-[25px]">{a.point}</p>
            </div>
            <ol className="divide-y rounded-lg border">
              {a.steps.map((s, i) => (
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

        <section aria-labelledby="scope-h" className="grid gap-4 rounded-lg border p-5 md:grid-cols-2 md:p-6">
          <h2 id="scope-h" className="text-[20px] font-bold tracking-[-0.3px] md:col-span-2">
            What the MVP is
          </h2>
          <div>
            <p className="mb-2 text-[13px] font-semibold uppercase tracking-[1px] text-muted-foreground">In the MVP</p>
            <ul className="flex list-disc flex-col gap-1 pl-5 text-[15px]">
              {MVP.map((m) => (
                <li key={m}>{m}</li>
              ))}
            </ul>
          </div>
          <div>
            <p className="mb-2 text-[13px] font-semibold uppercase tracking-[1px] text-muted-foreground">Designed, built next</p>
            <ul className="flex list-disc flex-col gap-1 pl-5 text-[15px]">
              {NEXT.map((m) => (
                <li key={m}>{m}</li>
              ))}
            </ul>
            <p className="mt-3 text-[13px] leading-5 text-muted-foreground">
              Settle with lawyers before launch: whether a wagering operator owning the platform makes its publications wagering advertising.
            </p>
          </div>
        </section>
      </main>
    </div>
  )
}
