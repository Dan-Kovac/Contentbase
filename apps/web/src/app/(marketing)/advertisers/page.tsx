import type { Metadata } from "next"
import { BadgeCheck, FileDown, FileText, ListChecks, MousePointerClick, ScrollText, ShieldCheck, Target, UserCheck, Wallet } from "lucide-react"
import { AdSlot } from "@/components/brand/ad-slot"
import { LockStatus } from "@/components/brand/compliance"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { DarkHero, Section, SectionHeading, TickList } from "@/components/marketing/section"
import { AdvertiserContactForm } from "@/components/marketing/advertiser-contact-form"
import { listAdDecisions } from "@/lib/data"

export const metadata: Metadata = {
  title: "For advertisers",
  description: "A premium, signed-in, age-assured audience for Australian sport and racing. Every placement designed into the page.",
}

const AUDIENCE = [
  { Icon: UserCheck, title: "Signed in", body: "Viewers sign in with one free account to watch exclusives and follow channels. You reach people, not cookies." },
  { Icon: ShieldCheck, title: "Age-assured", body: "Adults confirm they're 18 or over with a certified provider. We keep the result, never the ID." },
  { Icon: Target, title: "Sport and racing, in context", body: "AFL, AFLW, NRL, cricket and racing channels made by the creators fans already watch." },
]

const LOCKS = [
  { n: "1", title: "Signed in", body: "The viewer has a valid session on a registered Homestand account." },
  { n: "2", title: "18+ confirmed", body: "A certified age-assurance provider has confirmed they're an adult. We store the result, method, provider reference and time." },
  { n: "3", title: "Not opted out", body: "They haven't chosen “Don't show me betting ads”, and once the national AdStop register goes live, they're not on it." },
]

const PACK = [
  { Icon: ScrollText, text: "How each lock is enforced, with the provider and method for age assurance" },
  { Icon: ListChecks, text: "Impression-level evidence: session, age-assurance record, opt-out status, time, ad and channel" },
  { Icon: FileText, text: "Creative review records: odds, notable persons and the responsible gambling message" },
  { Icon: BadgeCheck, text: "Live-sport exclusions and racing-only declarations for every channel in the flight" },
]

const FORMATS = [
  { name: "MREC", size: "300 × 250", where: "In-article after a natural break, and at the end of a page" },
  { name: "Billboard", size: "970 × 250", where: "Sponsor band on a channel home, desktop" },
  { name: "Mobile band", size: "320 × 100", where: "Sponsor band on a channel home, mobile" },
  { name: "Sponsored short", size: "1080 × 1920 (9:16)", where: "In the shorts row and feed, at most one in every 8 shorts" },
]

const PRICING = [
  { Icon: Wallet, name: "CPM", body: "Per thousand viewable impressions, by channel, section or the whole network." },
  { Icon: FileDown, name: "Flat fee", body: "Channel and section takeovers, sponsor bands and season partnerships at a fixed price." },
  { Icon: MousePointerClick, name: "CPC", body: "Per click, for performance campaigns. Wagering CPC only after legal sign-off." },
]

export default function AdvertisersPage() {
  const decisions = listAdDecisions()
  const served = decisions.find((d) => d.reason === "ALL_LOCKS_PASS")!
  const blocked = decisions.find((d) => d.reason === "LOCK2_NO_ASSURANCE")!

  return (
    <>
      <DarkHero>
        <div className="grid grid-cols-1 items-end gap-10 lg:grid-cols-[1.3fr_1fr]">
          <SectionHeading
            as="h1"
            dark
            kicker="For advertisers"
            title={
              <>
                A premium audience. <span className="text-pitch">Placed with care.</span>
              </>
            }
            lede="Reach signed-in, age-assured fans of Australian sport and racing, in slots designed into the page. Never a pop-up, never on top of the story."
          />
          <div className="flex flex-col gap-3 sm:flex-row lg:justify-end">
            <Button asChild size="xl" className="bg-brand-white text-brand-black hover:bg-brand-white/90">
              <a href="#contact">Talk to our team</a>
            </Button>
            <Button
              asChild
              size="xl"
              variant="outline"
              className="border-white/25 bg-transparent text-brand-white hover:bg-white/10 hover:text-brand-white dark:bg-transparent"
            >
              <a href="#triple-lock">How the triple lock works</a>
            </Button>
          </div>
        </div>
      </DarkHero>

      <Section labelledBy="aud-title">
        <SectionHeading id="aud-title" kicker="The audience" title="People who chose to be here." lede="Wagering is one category among many. Every advertiser gets the same premium, logged-in audience and the same designed slots." />
        <div className="mt-12 grid grid-cols-1 gap-4 md:grid-cols-3">
          {AUDIENCE.map(({ Icon, title, body }) => (
            <div key={title} className="flex flex-col gap-3 rounded-lg border bg-card p-6">
              <span className="grid size-10 place-items-center rounded-[4px] bg-muted" aria-hidden>
                <Icon className="size-5" />
              </span>
              <h3 className="text-[18px] font-bold">{title}</h3>
              <p className="text-[15px] leading-[23px] text-muted-foreground">{body}</p>
            </div>
          ))}
        </div>
      </Section>

      <Section tone="muted" id="triple-lock" labelledBy="tl-title">
        <SectionHeading
          id="tl-title"
          kicker="The triple lock"
          title="Three checks before every wagering ad."
          lede="From 1 January 2027, wagering ads online are only legal behind a triple lock. We check all three locks on every request, write the evidence first, and fail closed."
        />
        <ol className="mt-12 grid grid-cols-1 gap-4 md:grid-cols-3">
          {LOCKS.map((l) => (
            <li key={l.n} className="flex flex-col gap-3 rounded-lg border bg-card p-6">
              <span className="text-[13px] font-bold uppercase tracking-[1px] text-muted-foreground">Lock {l.n}</span>
              <h3 className="text-[20px] font-bold tracking-[-0.01em]">{l.title}</h3>
              <p className="text-[15px] leading-[23px] text-muted-foreground">{l.body}</p>
            </li>
          ))}
        </ol>
        <div className="mt-8 grid grid-cols-1 gap-4 lg:grid-cols-2">
          <DecisionCard title="All three pass" note={"The viewer is signed in, confirmed 18+ and hasn’t opted out."} decision={served} />
          <DecisionCard title="Age not confirmed" note="Signed in, but no age assurance on file. The lock fails closed." decision={blocked} />
        </div>
        <ul className="mt-8 grid grid-cols-1 gap-x-8 gap-y-3 text-[14px] leading-[21px] text-muted-foreground md:grid-cols-3">
          <li>
            <span className="font-semibold text-foreground">Fail closed.</span> If any check errors or times out, no wagering ad is served.
          </li>
          <li>
            <span className="font-semibold text-foreground">No live sport.</span> Wagering ads switch off on any page marked live or near-live.
          </li>
          <li>
            <span className="font-semibold text-foreground">Lock off means off.</span> Channels without the lock never receive wagering ads, from any source.
          </li>
        </ul>
      </Section>

      <Section id="pack" labelledBy="pack-title">
        <div className="grid grid-cols-1 items-start gap-12 lg:grid-cols-2 lg:gap-16">
          <div className="flex flex-col gap-6">
            <SectionHeading
              id="pack-title"
              kicker="Due diligence"
              title="The evidence pack, on demand."
              lede="Generate a report for any campaign and date range. Hand it to your compliance team as it is."
            />
            <Button asChild variant="outline" size="lg" className="w-fit">
              <a href="#contact">Request a sample pack</a>
            </Button>
          </div>
          <ul className="flex flex-col divide-y rounded-lg border bg-card">
            {PACK.map(({ Icon, text }) => (
              <li key={text} className="flex gap-4 p-5">
                <Icon className="mt-0.5 size-5 shrink-0 text-muted-foreground" aria-hidden />
                <span className="text-[15px] leading-[23px]">{text}</span>
              </li>
            ))}
            <li className="flex flex-wrap items-center justify-between gap-2 p-5 text-[13px] text-muted-foreground">
              <span>CSV and PDF · records kept for at least 12 months</span>
              <span className="font-mono">evidence_cmp_bookie_2026-11.pdf</span>
            </li>
          </ul>
        </div>
      </Section>

      <Section tone="muted" id="formats" labelledBy="formats-title">
        <SectionHeading
          id="formats-title"
          kicker="Formats"
          title="Fixed sizes. Labelled. Never on top."
          lede="Every unit reserves its space before it loads, so pages don't jump. At most one ad per 600 words and three per page."
        />
        <div className="mt-12 flex flex-col gap-6">
          <div className="flex flex-wrap items-end justify-center gap-6 rounded-lg border bg-background p-4 sm:p-6 lg:justify-around">
            <AdSlot format="mrec" advertiser="Southern Cross Utes" />
            <AdSlot format="mrec" wagering advertiser="Harbour Bet (licensed)" />
            <AdSlot format="short-card" advertiser="Kick Boots Co." className="mx-0" />
          </div>
          <div className="rounded-lg border bg-background p-4 sm:p-6">
            <AdSlot format="band" responsiveBand advertiser="Kick Boots Co." />
          </div>
          <div className="overflow-hidden rounded-lg border bg-background">
            <Table>
              <TableHeader>
                <TableRow className="hover:bg-transparent">
                  <TableHead className="px-4">Format</TableHead>
                  <TableHead className="px-4">Size</TableHead>
                  <TableHead className="hidden px-4 sm:table-cell">Where it runs</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {FORMATS.map((f) => (
                  <TableRow key={f.name}>
                    <TableCell className="px-4 font-semibold">{f.name}</TableCell>
                    <TableCell className="px-4 font-mono text-[13px]">{f.size}</TableCell>
                    <TableCell className="hidden whitespace-normal px-4 text-muted-foreground sm:table-cell">{f.where}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
          <p className="text-[13px] leading-5 text-muted-foreground">
            The wagering unit above carries &ldquo;Don&apos;t show me betting ads&rdquo; inside the frame, as every wagering unit does. Try it.
          </p>
        </div>
      </Section>

      <Section labelledBy="pricing-models-title">
        <SectionHeading
          id="pricing-models-title"
          kicker="Buying"
          title="Three ways to buy."
          lede="We never price on sign-ups, deposits or bets. Wagering creative is reviewed for odds, notable persons and the responsible gambling message before it runs."
        />
        <div className="mt-12 grid grid-cols-1 gap-4 md:grid-cols-3">
          {PRICING.map(({ Icon, name, body }) => (
            <div key={name} className="flex flex-col gap-3 rounded-lg border bg-card p-6">
              <Icon className="size-5 text-muted-foreground" aria-hidden />
              <h3 className="text-[22px] font-extrabold tracking-[-0.02em]">{name}</h3>
              <p className="text-[15px] leading-[23px] text-muted-foreground">{body}</p>
            </div>
          ))}
        </div>
      </Section>

      <Section tone="muted" id="contact" labelledBy="contact-title">
        <div className="grid grid-cols-1 gap-12 lg:grid-cols-[1fr_1.3fr] lg:gap-16">
          <div className="flex flex-col gap-6">
            <SectionHeading id="contact-title" kicker="Contact" title="Plan a campaign." lede="Tell us what you're planning. We'll come back with channels, formats, a rate card and a sample evidence pack." />
            <TickList items={["Rate card in AUD, GST shown", "Creative review in two working days", "Delivery reports by placement and channel"]} />
          </div>
          <AdvertiserContactForm />
        </div>
      </Section>
    </>
  )
}

function DecisionCard({
  title,
  note,
  decision,
}: {
  title: string
  note: string
  decision: ReturnType<typeof listAdDecisions>[number]
}) {
  return (
    <div className="flex flex-col gap-4 rounded-lg border bg-card p-5">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <h3 className="text-[16px] font-bold">{title}</h3>
        <span className="font-mono text-[12px] text-muted-foreground">
          {decision.id} · {decision.channel} · {decision.slot}
        </span>
      </div>
      <p className="text-[14px] text-muted-foreground">{note}</p>
      <LockStatus locks={decision.locks} />
    </div>
  )
}
