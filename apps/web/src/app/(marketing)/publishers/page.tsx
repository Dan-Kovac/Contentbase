import type { Metadata } from "next"
import Link from "next/link"
import { ArrowRight, CalendarClock, FileSearch, Ghost, Mail, Newspaper, Rss, Scale } from "lucide-react"
import { LockStatus } from "@/components/brand/compliance"
import { Button } from "@/components/ui/button"
import { DarkHero, Section, SectionHeading, TickList } from "@/components/marketing/section"
import { RedirectMock } from "@/components/marketing/product-visuals"

export const metadata: Metadata = {
  title: "For publishers",
  description: "Move your site in a day, keep your rankings, keep your ad revenue.",
}

const SOURCES = [
  { name: "WordPress", how: "WXR export or the REST API. Posts, pages, authors, categories, tags and media.", Icon: Newspaper },
  { name: "Ghost", how: "JSON export. Posts, authors, tags and feature images.", Icon: Ghost },
  { name: "Substack", how: "Your export zip and podcast feed. Posts and episodes.", Icon: Mail },
  { name: "RSS", how: "Any public feed. We follow it until you switch over.", Icon: Rss },
]

const RULES = [
  { title: "The triple lock", body: "Wagering ads online only reach people who are signed in, confirmed 18 or over, and haven't opted out. Evidence is kept for each check." },
  { title: "Notable-person ban", body: "No wagering ad may feature an athlete, celebrity or influencer, and bookmakers can't contract them to promote betting." },
  { title: "No odds promotion", body: "Ad creative can't promote odds. Dedicated racing services are excepted." },
  { title: "No ads around live sport", body: "Wagering ads switch off during and around live coverage of a sporting event." },
  { title: "No commissions", body: "Bookmakers can't pay per sign-up, deposit or bet. We only sell CPM, flat-fee and CPC." },
  { title: "Racing exemption", body: "Racing-only services are exempt from the triple lock. Declare racing-only mode and we log it and prompt a review every quarter." },
]

const WHITE_GLOVE = [
  { title: "Audit", body: "We crawl your site, list every URL and note your top-ranking pages before anything moves." },
  { title: "Test import", body: "A full import to a private channel, so your editors can check posts, embeds and authors." },
  { title: "Redirect sign-off", body: "You approve the 301 map line by line, with special care for the pages that earn the most traffic." },
  { title: "Cut-over", body: "We switch DNS in a quiet window, with a rollback plan ready and your team on the call." },
  { title: "30-day watch", body: "We track crawl errors and rankings for a month and fix anything that slips." },
]

export default function PublishersPage() {
  return (
    <>
      <DarkHero>
        <div className="grid grid-cols-1 items-center gap-12 lg:grid-cols-[1.1fr_1fr]">
          <div className="flex flex-col gap-6">
            <SectionHeading
              as="h1"
              dark
              kicker="For publishers"
              title={
                <>
                  Move your site in a day. <span className="text-pitch">Keep your rankings.</span>
                </>
              }
              lede="Bring your archive from WordPress, Ghost, Substack or RSS. Every old URL redirects to its new page, and your wagering ad revenue survives 1 January 2027."
            />
            <div className="flex flex-col gap-3 sm:flex-row">
              <Button asChild size="xl" className="bg-brand-white text-brand-black hover:bg-brand-white/90">
                <Link href="/signup">
                  Import your site
                  <ArrowRight aria-hidden />
                </Link>
              </Button>
              <Button
                asChild
                size="xl"
                variant="outline"
                className="border-white/25 bg-transparent text-brand-white hover:bg-white/10 hover:text-brand-white dark:bg-transparent"
              >
                <Link href="#white-glove">White-glove migration</Link>
              </Button>
            </div>
          </div>
          <RedirectMock className="text-card-foreground" />
        </div>
      </DarkHero>

      <Section labelledBy="migrate-title">
        <SectionHeading
          id="migrate-title"
          kicker="Migration"
          title="Everything comes across. Rankings included."
          lede="Search engines rank URLs. We keep every one of them working, so the traffic you've earned follows you to Homestand."
        />
        <ul className="mt-12 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {SOURCES.map(({ name, how, Icon }) => (
            <li key={name} className="flex flex-col gap-3 rounded-lg border bg-card p-6">
              <span className="grid size-10 place-items-center rounded-[4px] bg-muted" aria-hidden>
                <Icon className="size-5" />
              </span>
              <h3 className="text-[18px] font-bold">{name}</h3>
              <p className="text-[15px] leading-[23px] text-muted-foreground">{how}</p>
            </li>
          ))}
        </ul>
        <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-3">
          <PromiseCard icon={<FileSearch aria-hidden />} title="A 301 for every URL" body="Posts, categories, tags, author pages and old query-string links all redirect to their new home." />
          <PromiseCard icon={<Scale aria-hidden />} title="Same titles and slugs" body="We keep your slugs, title tags and meta descriptions unless you choose to change them." />
          <PromiseCard icon={<CalendarClock aria-hidden />} title="Live in a day" body="Most sites under 5,000 posts import in a few hours. Your old site stays up until you switch DNS." />
        </div>
      </Section>

      <Section tone="muted" id="wagering" labelledBy="rules-title">
        <div className="grid grid-cols-1 gap-12 lg:grid-cols-[1fr_1.1fr] lg:gap-16">
          <div className="flex flex-col gap-8">
            <SectionHeading
              id="rules-title"
              kicker="1 January 2027"
              title="The wagering rules change. Your revenue doesn't have to."
              lede="From 1 January 2027, wagering ads online are only legal behind a triple lock. Most publishers won't build one. On Homestand it's a switch."
            />
            <div className="flex flex-col gap-4 rounded-lg border bg-card p-5">
              <p className="text-[15px] font-semibold">How the triple lock keeps that revenue legal</p>
              <TickList
                items={[
                  "Lock 1: the viewer is signed in to a free Homestand account",
                  "Lock 2: a certified provider has confirmed they're 18 or over",
                  "Lock 3: they haven't chosen “Don't show me betting ads”",
                ]}
              />
              <LockStatus
                locks={{
                  session: { pass: true, ref: "sess_7Hq2f91" },
                  age: { pass: true, ref: "aa_20261104" },
                  optout: { pass: true, ref: "pref_v12 · AdStop n/a" },
                }}
              />
              <p className="text-[13px] leading-5 text-muted-foreground">
                Each check is written to an evidence log before the ad is served. If any check fails or times out, a non-wagering ad fills the slot.
              </p>
              <Link href="/advertisers#triple-lock" className="inline-flex items-center gap-1.5 text-[14px] font-semibold underline-offset-4 hover:underline">
                Read the full explainer
                <ArrowRight className="size-4" aria-hidden />
              </Link>
            </div>
          </div>
          <ul className="grid grid-cols-1 content-start gap-3 sm:grid-cols-2">
            {RULES.map((r) => (
              <li key={r.title} className="flex flex-col gap-2 rounded-lg border bg-card p-5">
                <h3 className="text-[16px] font-bold">{r.title}</h3>
                <p className="text-[14px] leading-[21px] text-muted-foreground">{r.body}</p>
              </li>
            ))}
            <li className="text-[13px] leading-5 text-muted-foreground sm:col-span-2">
              A summary of the Interactive Gambling Amendment (Gambling Reform) Act 2026, not legal advice. Check your own obligations with a lawyer.
            </li>
          </ul>
        </div>
      </Section>

      <Section id="white-glove" labelledBy="wg-title">
        <div className="grid grid-cols-1 gap-12 lg:grid-cols-[1fr_1.2fr] lg:gap-16">
          <div className="flex flex-col gap-6">
            <SectionHeading
              id="wg-title"
              kicker="Enterprise"
              title="White-glove migration."
              lede="For newsrooms, racing media and clubs with a big archive. Our team plans the move, runs it and watches your rankings afterwards."
            />
            <TickList items={["Unlimited channels", "A named migration lead", "Service level agreement", "Dedicated support after launch"]} />
            <div className="flex flex-col gap-3 sm:flex-row">
              <Button asChild size="lg">
                <a href="mailto:migrations@homestand.com.au?subject=White-glove%20migration">Book a migration call</a>
              </Button>
              <Button asChild size="lg" variant="outline">
                <Link href="/pricing#enterprise">See Enterprise</Link>
              </Button>
            </div>
          </div>
          <ol className="flex flex-col">
            {WHITE_GLOVE.map((s, i) => (
              <li key={s.title} className="relative flex gap-4 pb-8 last:pb-0">
                {i < WHITE_GLOVE.length - 1 && <span className="absolute left-[17px] top-10 bottom-1 w-px bg-border" aria-hidden />}
                <span className="grid size-9 shrink-0 place-items-center rounded-[4px] border bg-background text-[14px] font-bold tabular">{i + 1}</span>
                <div className="flex flex-col gap-1 pt-1.5">
                  <h3 className="text-[17px] font-bold">{s.title}</h3>
                  <p className="text-[15px] leading-[23px] text-muted-foreground">{s.body}</p>
                </div>
              </li>
            ))}
          </ol>
        </div>
      </Section>
    </>
  )
}

function PromiseCard({ icon, title, body }: { icon: React.ReactNode; title: string; body: string }) {
  return (
    <div className="flex gap-4 rounded-lg border p-5">
      <span className="mt-0.5 text-pop-ink [&_svg]:size-5" aria-hidden>
        {icon}
      </span>
      <div className="flex flex-col gap-1">
        <h3 className="text-[16px] font-bold">{title}</h3>
        <p className="text-[14px] leading-[21px] text-muted-foreground">{body}</p>
      </div>
    </div>
  )
}
