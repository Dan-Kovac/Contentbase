import type { Metadata } from "next";
import Link from "next/link";
import {
  ArrowRight,
  CalendarClock,
  FileSearch,
  Ghost,
  Mail,
  Newspaper,
  Rss,
  Scale,
} from "lucide-react";
import { LockStatus } from "@/components/brand/compliance";
import { Button } from "@/components/ui/button";
import {
  DarkHero,
  Section,
  SectionHeading,
  TickList,
} from "@/components/marketing/section";
import { RedirectMock } from "@/components/marketing/product-visuals";
import { getEarnings } from "@/lib/data";
import { compact } from "@/lib/format";

export const metadata: Metadata = {
  title: "For publishers",
  description:
    "Move your site in a day, keep your rankings, keep your ad revenue.",
};

const SOURCES = [
  {
    name: "WordPress",
    how: "WXR export or the REST API. Posts, pages, authors, categories, tags and media.",
    Icon: Newspaper,
  },
  {
    name: "Ghost",
    how: "JSON export. Posts, authors, tags and feature images.",
    Icon: Ghost,
  },
  {
    name: "Substack",
    how: "Your export zip and podcast feed. Posts and episodes.",
    Icon: Mail,
  },
  {
    name: "RSS",
    how: "Any public feed. We follow it until you switch over.",
    Icon: Rss,
  },
];

const WHY = [
  {
    kicker: "Wagering",
    title: "From 1 January 2027",
    body: "Wagering ads online may only reach people who are signed in, confirmed 18 or over and haven't opted out. Sites that can't check all three lose that category.",
  },
  {
    kicker: "Alcohol",
    title: "Directed at adults",
    body: "Australia's alcohol marketing code asks advertisers to direct ads at adults and to use the age controls a site offers. Verified placements give them that control.",
  },
];

const RULES = [
  {
    title: "Checked on every ad",
    body: "The triple lock runs on every request for an age-restricted ad. Evidence is kept for each check.",
  },
  {
    title: "Separate opt-outs",
    body: "Viewers can turn off betting ads and alcohol ads separately, in one place, for every channel.",
  },
  {
    title: "Your categories, your call",
    body: "Allow alcohol, wagering or both. Block either one at any time, even with the lock on.",
  },
  {
    title: "No wagering around live sport",
    body: "Wagering ads switch off during and around live coverage of a sporting event.",
  },
  {
    title: "Reviewed creative",
    body: "Wagering creative is checked for odds, notable people and the responsible gambling message. Alcohol creative is checked against the code.",
  },
  {
    title: "No commissions",
    body: "Advertisers never pay per sign-up, deposit or bet. We only sell CPM, flat-fee and CPC.",
  },
];

const WHITE_GLOVE = [
  {
    title: "Audit",
    body: "We crawl your site, list every URL and note your top-ranking pages before anything moves.",
  },
  {
    title: "Test import",
    body: "A full import to a private channel, so your editors can check posts, embeds and authors.",
  },
  {
    title: "Redirect sign-off",
    body: "You approve the 301 map line by line, with special care for the pages that earn the most traffic.",
  },
  {
    title: "Cut-over",
    body: "We switch DNS in a quiet window, with a rollback plan ready and your team on the call.",
  },
  {
    title: "30-day watch",
    body: "We track crawl errors and rankings for a month and fix anything that slips.",
  },
];

const aud = (n: number) => `$${n.toLocaleString("en-AU")}`

export default function PublishersPage() {
  const earn = getEarnings("ch_footyfix")
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
                  Move your site in a day.{" "}
                  <span className="text-pitch">Keep your rankings.</span>
                </>
              }
              lede="Bring your archive from WordPress, Ghost, Substack or RSS. Every old URL redirects to its new page, and age-verified advertising keeps premium advertisers on your pages."
            />
            <div className="flex flex-col gap-3 sm:flex-row">
              <Button
                asChild
                size="xl"
                className="bg-brand-white text-brand-black hover:bg-brand-white/90"
              >
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

      {/* Revenue is the reason a publisher moves, so it comes first. Sample figures, labelled. */}
      <Section labelledBy="earn-title">
        <div className="grid grid-cols-1 items-center gap-10 lg:grid-cols-[1fr_1.1fr] lg:gap-16">
          <SectionHeading
            id="earn-title"
            kicker="Keep the revenue"
            title="Wagering ads leave most sites in 2027. Not yours."
            lede="From 1 January 2027 a wagering ad needs a signed-in viewer, a confirmed adult and an opt-out. Most sites can't prove that. On Homestand it's a switch, so premium sponsors stay on your pages and you keep your share."
          />
          {earn && (
            <figure className="flex flex-col gap-4 rounded-lg border bg-card p-6">
              <figcaption className="flex flex-wrap items-baseline justify-between gap-2 text-[13px] text-muted-foreground">
                <span className="font-semibold text-foreground">Footy Fix, sponsor revenue share</span>
                <span>{earn.period}</span>
              </figcaption>
              <p className="text-[48px] font-extrabold leading-none tracking-[-0.03em]">{aud(earn.total)}</p>
              <p className="text-[14px] text-muted-foreground">
                Up {Math.round(((earn.total - earn.previousTotal) / earn.previousTotal) * 100)}% on the month before. {aud(earn.ageVerified)} of it from age-verified sponsors, shown only behind the triple lock.
              </p>
              <ul className="flex flex-col divide-y border-t text-[14px]">
                {earn.byViewer.map((v) => (
                  <li key={v.state} className="flex items-center justify-between gap-3 py-2.5">
                    <span>{v.state}</span>
                    <span className="flex items-baseline gap-4 tabular">
                      <span className="text-muted-foreground">{compact(v.impressions)} impressions</span>
                      <span className="w-16 text-right font-semibold">{aud(v.amount)}</span>
                    </span>
                  </li>
                ))}
              </ul>
              <p className="text-[12px] text-muted-foreground">Sample pilot data, AUD inc. GST. Not a forecast. Not legal advice.</p>
            </figure>
          )}
        </div>
      </Section>

      <Section tone="muted" labelledBy="migrate-title">
        <SectionHeading
          id="migrate-title"
          kicker="Migration"
          title="Everything comes across. Rankings included."
          lede="Search engines rank URLs. We keep every one of them working, so the traffic you've earned follows you to Homestand."
        />
        <ul className="mt-12 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {SOURCES.map(({ name, how, Icon }) => (
            <li
              key={name}
              className="flex flex-col gap-3 rounded-lg border bg-card p-6"
            >
              <span
                className="grid size-10 place-items-center rounded-[4px] bg-muted"
                aria-hidden
              >
                <Icon className="size-5" />
              </span>
              <h3 className="text-[18px] font-bold">{name}</h3>
              <p className="text-[15px] leading-[23px] text-muted-foreground">
                {how}
              </p>
            </li>
          ))}
        </ul>
        <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-3">
          <PromiseCard
            icon={<FileSearch aria-hidden />}
            title="A 301 for every URL"
            body="Posts, categories, tags, author pages and old query-string links all redirect to their new home."
          />
          <PromiseCard
            icon={<Scale aria-hidden />}
            title="Same titles and slugs"
            body="We keep your slugs, title tags and meta descriptions unless you choose to change them."
          />
          <PromiseCard
            icon={<CalendarClock aria-hidden />}
            title="Live in a day"
            body="Most sites under 5,000 posts import in a few hours. Your old site stays up until you switch DNS."
          />
        </div>
      </Section>

      <Section id="age-verified" labelledBy="rules-title">
        <div className="grid grid-cols-1 gap-12 lg:grid-cols-[1fr_1.1fr] lg:gap-16">
          <div className="flex flex-col gap-8">
            <SectionHeading
              id="rules-title"
              kicker="Age-verified advertising"
              title="Some ads are for adults only. We check, every time."
              lede="Advertisers in age-restricted categories need to know their ads reach adults. Most publishers can't prove that. On Homestand it's a switch."
            />
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              {WHY.map((w) => (
                <div
                  key={w.kicker}
                  className="flex flex-col gap-2 rounded-lg border bg-card p-5"
                >
                  <p className="kicker">{w.kicker}</p>
                  <h3 className="text-[16px] font-bold">{w.title}</h3>
                  <p className="text-[14px] leading-[21px] text-muted-foreground">
                    {w.body}
                  </p>
                </div>
              ))}
            </div>
          </div>
          <div className="flex flex-col gap-4">
            <div className="flex flex-col gap-4 rounded-lg border bg-card p-5">
              <p className="text-[15px] font-semibold">
                How the triple lock works
              </p>
              <TickList
                items={[
                  "Lock 1: the viewer is signed in to a free Homestand account",
                  "Lock 2: a certified provider has confirmed they're 18 or over",
                  "Lock 3: they haven't turned off ads in that category",
                ]}
              />
              <LockStatus
                locks={{
                  session: { pass: true, ref: "sess_7Hq2f91" },
                  age: { pass: true, ref: "aa_20261104" },
                  optout: { pass: true, ref: "pref_v12 · AdStop n/a" },
                }}
                verdict="Age-restricted ad eligible. Evidence written before serve."
              />
              <p className="text-[13px] leading-5 text-muted-foreground">
                Each check is written to an evidence log before the ad is
                served. If any check fails or times out, an everyday ad fills
                the same space.
              </p>
              <Link
                href="/advertisers#triple-lock"
                className="inline-flex w-fit items-center gap-1.5 text-[14px] font-semibold underline-offset-4 hover:underline"
              >
                Read the full explainer
                <ArrowRight className="size-4" aria-hidden />
              </Link>
            </div>
            <ul className="grid grid-cols-1 content-start gap-3 sm:grid-cols-2">
              {RULES.map((r) => (
                <li
                  key={r.title}
                  className="flex flex-col gap-2 rounded-lg border bg-card p-5"
                >
                  <h3 className="text-[16px] font-bold">{r.title}</h3>
                  <p className="text-[14px] leading-[21px] text-muted-foreground">
                    {r.body}
                  </p>
                </li>
              ))}
              <li className="text-[13px] leading-5 text-muted-foreground sm:col-span-2">
                A plain summary of the wagering advertising rules that start on
                1 January 2027 and the alcohol marketing code, not legal advice.
                Check your own obligations with a lawyer.
              </li>
            </ul>
          </div>
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
            <TickList
              items={[
                "Unlimited channels",
                "A named migration lead",
                "Service level agreement",
                "Dedicated support after launch",
              ]}
            />
            <div className="flex flex-col gap-3 sm:flex-row">
              <Button asChild size="lg">
                <a href="mailto:migrations@homestand.com.au?subject=White-glove%20migration">
                  Book a migration call
                </a>
              </Button>
              <Button asChild size="lg" variant="outline">
                <Link href="/pricing#enterprise">See Enterprise</Link>
              </Button>
            </div>
          </div>
          <ol className="flex flex-col">
            {WHITE_GLOVE.map((s, i) => (
              <li key={s.title} className="relative flex gap-4 pb-8 last:pb-0">
                {i < WHITE_GLOVE.length - 1 && (
                  <span
                    className="absolute left-[17px] top-10 bottom-1 w-px bg-border"
                    aria-hidden
                  />
                )}
                <span className="grid size-9 shrink-0 place-items-center rounded-[4px] border bg-background text-[14px] font-bold tabular">
                  {i + 1}
                </span>
                <div className="flex flex-col gap-1 pt-1.5">
                  <h3 className="text-[17px] font-bold">{s.title}</h3>
                  <p className="text-[15px] leading-[23px] text-muted-foreground">
                    {s.body}
                  </p>
                </div>
              </li>
            ))}
          </ol>
        </div>
      </Section>
    </>
  );
}

function PromiseCard({
  icon,
  title,
  body,
}: {
  icon: React.ReactNode;
  title: string;
  body: string;
}) {
  return (
    <div className="flex gap-4 rounded-lg border p-5">
      <span className="mt-0.5 text-pop-ink [&_svg]:size-5" aria-hidden>
        {icon}
      </span>
      <div className="flex flex-col gap-1">
        <h3 className="text-[16px] font-bold">{title}</h3>
        <p className="text-[14px] leading-[21px] text-muted-foreground">
          {body}
        </p>
      </div>
    </div>
  );
}
