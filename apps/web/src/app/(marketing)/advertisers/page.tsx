import type { Metadata } from "next"
import {
  BadgeCheck,
  Beer,
  Car,
  Dices,
  FileDown,
  FileText,
  Gauge,
  Landmark,
  ListChecks,
  MousePointerClick,
  Plane,
  ScrollText,
  ShieldCheck,
  Shirt,
  Tag,
  Target,
  UserCheck,
  UtensilsCrossed,
  Wallet,
} from "lucide-react"
import { LockStatus } from "@/components/brand/compliance"
import { HalftimeBreak } from "@/components/brand/native-ads"
import { Button } from "@/components/ui/button"
import { DarkHero, Section, SectionHeading, TickList } from "@/components/marketing/section"
import { AdvertiserContactForm } from "@/components/marketing/advertiser-contact-form"
import { FORMAT_EXAMPLE, FormatStage, NATIVE_FORMATS } from "@/components/marketing/native-formats"
import { getSponsor, listAdDecisions } from "@/lib/data"

export const metadata: Metadata = {
  title: "For advertisers",
  description: "Reach verified adults, in formats people actually watch. Homestand Native Formats on Australian sport channels, with age-verified placements for alcohol and wagering.",
}

const AUDIENCE = [
  { Icon: UserCheck, title: "Signed in", body: "Viewers sign in with one free account to watch exclusives and follow channels. You reach people, not cookies." },
  { Icon: ShieldCheck, title: "Age-verified", body: "Adults confirm they're 18 or over with a certified provider. We keep the result, never the ID." },
  { Icon: Target, title: "Sport, in context", body: "AFL, AFLW, NRL, cricket and racing channels made by the creators fans already watch." },
]

const PROMISES = [
  { Icon: Tag, text: "Always labelled Sponsored or Presented by" },
  { Icon: Gauge, text: "Space reserved before load, so nothing moves" },
  { Icon: ShieldCheck, text: "Age-restricted formats carry 18+ and an opt-out" },
]

const LOCKS = [
  { n: "1", title: "Signed in", body: "The viewer has a valid session on a registered Homestand account." },
  { n: "2", title: "18+ confirmed", body: "A certified age-assurance provider has confirmed they're an adult. We store the result, method, provider reference and time." },
  {
    n: "3",
    title: "Not opted out",
    body: "They haven't turned off ads in that category: “Don't show me alcohol ads” or “Don't show me betting ads”. For betting, we also check the national AdStop register once it's live.",
  },
]

const AGE_RESTRICTED = [
  { Icon: Beer, name: "Alcohol", note: "Beer, wine, spirits and venues. Placed only where the triple lock passes." },
  { Icon: Dices, name: "Wagering", note: "Licensed operators only. Off around live sport, and creative reviewed for odds and notable people." },
]

const EVERYDAY = [
  { Icon: Car, name: "Automotive" },
  { Icon: Shirt, name: "Sportswear and equipment" },
  { Icon: UtensilsCrossed, name: "Food and non-alcoholic drinks" },
  { Icon: Landmark, name: "Banking and insurance" },
  { Icon: Plane, name: "Travel" },
]

const PACK = [
  { Icon: ScrollText, text: "How each lock is enforced, with the provider and method for age assurance" },
  { Icon: ListChecks, text: "Impression-level evidence: session, age-assurance record, opt-out status, time, format and channel" },
  { Icon: FileText, text: "Creative review records against the rules for your category" },
  { Icon: BadgeCheck, text: "Live-sport exclusions and category blocks for every channel in the flight" },
]

const PRICING = [
  { Icon: Wallet, name: "CPM", body: "Per thousand viewable impressions, by channel, section or the whole network. Suits stat cards, half-time breaks and sponsored shorts." },
  { Icon: FileDown, name: "Flat sponsorship", body: "A fixed price for a flight: Presented by on a channel or section, or a chapter sponsor across a series." },
  { Icon: MousePointerClick, name: "CPC", body: "Per click, for performance campaigns. Wagering CPC only after legal sign-off." },
]

export default function AdvertisersPage() {
  const decisions = listAdDecisions()
  const served = decisions.find((d) => d.reason === "ALL_LOCKS_PASS")!
  const blocked = decisions.find((d) => d.reason === "LOCK2_NO_ASSURANCE")!
  const heroSponsor = getSponsor("sp_ute")!

  return (
    <>
      <DarkHero>
        <div className="grid grid-cols-1 items-center gap-10 lg:grid-cols-[1.05fr_1fr] lg:gap-14">
          <div className="flex flex-col gap-8">
            <SectionHeading
              as="h1"
              dark
              kicker="For advertisers"
              title={
                <>
                  Reach verified adults, in formats people <span className="text-pitch">actually watch.</span>
                </>
              }
              lede="Homestand Native Formats put your brand inside Australian sport channels, designed into the page. Age-restricted brands reach only signed-in viewers confirmed 18 or over."
            />
            <div className="flex flex-col gap-3 sm:flex-row">
              <Button asChild size="xl" className="bg-brand-white text-brand-black hover:bg-brand-white/90">
                <a href="#contact">Talk to our team</a>
              </Button>
              <Button
                asChild
                size="xl"
                variant="outline"
                className="border-white/25 bg-transparent text-brand-white hover:bg-white/10 hover:text-brand-white dark:bg-transparent"
              >
                <a href="#formats">See the formats</a>
              </Button>
            </div>
          </div>
          <HalftimeBreak sponsor={heroSponsor} className="ring-1 ring-white/10" />
        </div>
      </DarkHero>

      <Section labelledBy="aud-title">
        <SectionHeading
          id="aud-title"
          kicker="The audience"
          title="People who chose to be here."
          lede="Every advertiser gets the same signed-in audience and the same designed formats. Age-restricted categories get one more guarantee: every viewer is a verified adult."
        />
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

      <Section tone="muted" id="formats" labelledBy="formats-title">
        <div className="flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
          <SectionHeading
            id="formats-title"
            kicker="Homestand Native Formats"
            title="Five formats. No banners."
            lede="You send a brief: your name, one line, an image or loop and a link. We render it in each channel's own design, so it reads like part of the page."
          />
          <ul className="flex flex-col gap-2.5 text-[14px] lg:max-w-[340px]">
            {PROMISES.map(({ Icon, text }) => (
              <li key={text} className="flex items-center gap-2.5">
                <Icon className="size-4 shrink-0 text-muted-foreground" aria-hidden />
                {text}
              </li>
            ))}
          </ul>
        </div>
        <ol className="mt-12 flex flex-col gap-4">
          {NATIVE_FORMATS.map((f, i) => (
            <li key={f.id} className="grid grid-cols-1 gap-6 rounded-lg border bg-card p-5 sm:p-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.7fr)] lg:gap-10">
              <div className="flex flex-col gap-3">
                <span className="flex items-center gap-2 text-[13px] font-semibold text-muted-foreground">
                  <span className="grid size-7 place-items-center rounded-[4px] bg-muted text-foreground" aria-hidden>
                    <f.Icon className="size-4" />
                  </span>
                  <span className="tabular">0{i + 1}</span>
                </span>
                <h3 className="text-[24px] font-extrabold leading-[28px] tracking-[-0.02em]">{f.name}</h3>
                <p className="text-[17px] leading-[25px]">{f.line}</p>
                <p className="text-[14px] leading-[21px] text-muted-foreground">
                  <span className="font-semibold text-foreground">Where it appears: </span>
                  {f.where}
                </p>
              </div>
              <FormatStage>{FORMAT_EXAMPLE[f.id]()}</FormatStage>
            </li>
          ))}
        </ol>
        <p className="mt-6 text-[13px] leading-5 text-muted-foreground">
          Examples use sample brands. The opt-out on an age-restricted format works as it does on a live channel. Try it.
        </p>
      </Section>

      <Section id="triple-lock" labelledBy="tl-title">
        <SectionHeading
          id="tl-title"
          kicker="The triple lock"
          title="Three checks before every age-restricted ad."
          lede="A channel that switches on age-verified advertising can carry ads for adults only. We check all three locks on every request, write the evidence first, and fail closed."
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
          <DecisionCard
            title="All three pass"
            note={"The viewer is signed in, confirmed 18+ and hasn’t opted out."}
            decision={served}
            verdict="Age-restricted ad eligible. Evidence written before serve."
          />
          <DecisionCard
            title="Age not confirmed"
            note="Signed in, but no age assurance on file. The lock fails closed."
            decision={blocked}
            verdict="Fail closed: an everyday ad filled the space."
          />
        </div>
        <ul className="mt-8 grid grid-cols-1 gap-x-8 gap-y-3 text-[14px] leading-[21px] text-muted-foreground md:grid-cols-3">
          <li>
            <span className="font-semibold text-foreground">Fail closed.</span> If any check errors or times out, no age-restricted ad is served.
          </li>
          <li>
            <span className="font-semibold text-foreground">Off around live sport.</span> Wagering ads switch off on any page marked live or near-live.
          </li>
          <li>
            <span className="font-semibold text-foreground">Standard means standard.</span> Channels without age-verified advertising never receive an age-restricted ad.
          </li>
        </ul>
      </Section>

      <Section tone="muted" id="categories" labelledBy="cat-title">
        <SectionHeading
          id="cat-title"
          kicker="Categories"
          title="For adults-only brands, and everyone else."
          lede="Age-restricted categories run only on age-verified channels, behind the triple lock. Everyday brands run across the network, to every viewer."
        />
        <div className="mt-12 grid grid-cols-1 gap-4 lg:grid-cols-2">
          <div className="flex flex-col gap-4 rounded-lg border bg-card p-6">
            <div className="flex items-center justify-between gap-3">
              <h3 className="text-[18px] font-bold">Age-restricted</h3>
              <span className="rounded-[2px] border border-foreground px-1.5 text-[11px] font-bold leading-[18px] tracking-[0.5px]">18+</span>
            </div>
            <ul className="flex flex-col divide-y">
              {AGE_RESTRICTED.map(({ Icon, name, note }) => (
                <li key={name} className="flex gap-3 py-3 first:pt-0">
                  <Icon className="mt-0.5 size-5 shrink-0 text-muted-foreground" aria-hidden />
                  <span className="flex flex-col gap-0.5">
                    <span className="text-[15px] font-semibold">{name}</span>
                    <span className="text-[14px] leading-[21px] text-muted-foreground">{note}</span>
                  </span>
                </li>
              ))}
            </ul>
            <p className="mt-auto text-[13px] leading-5 text-muted-foreground">More age-restricted categories will follow, on the same three locks.</p>
          </div>
          <div className="flex flex-col gap-4 rounded-lg border bg-card p-6">
            <h3 className="text-[18px] font-bold">Everyday brands</h3>
            <ul className="grid grid-cols-1 gap-2 sm:grid-cols-2">
              {EVERYDAY.map(({ Icon, name }) => (
                <li key={name} className="flex items-center gap-3 rounded-md border px-3 py-2.5 text-[14px] font-medium">
                  <Icon className="size-4 shrink-0 text-muted-foreground" aria-hidden />
                  {name}
                </li>
              ))}
            </ul>
            <p className="mt-auto text-[13px] leading-5 text-muted-foreground">
              Shown to every viewer, signed in or not. Creators can block any category they don&apos;t want on their channel.
            </p>
          </div>
        </div>
      </Section>

      <Section id="pack" labelledBy="pack-title">
        <div className="grid grid-cols-1 items-start gap-12 lg:grid-cols-2 lg:gap-16">
          <div className="flex flex-col gap-6">
            <SectionHeading
              id="pack-title"
              kicker="Due diligence"
              title="The evidence pack, on demand."
              lede="Generate a report for any campaign and date range, showing that every age-restricted impression passed all three locks. Hand it to your compliance team as it is."
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
              <span className="break-all font-mono">evidence_cmp_bookie_2026-11.pdf</span>
            </li>
          </ul>
        </div>
      </Section>

      <Section tone="muted" labelledBy="pricing-models-title">
        <SectionHeading
          id="pricing-models-title"
          kicker="Buying"
          title="Three ways to buy."
          lede="We never price on sign-ups, deposits or bets. Every creative is reviewed before it runs, in two working days."
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

      <Section id="contact" labelledBy="contact-title">
        <div className="grid grid-cols-1 gap-12 lg:grid-cols-[1fr_1.3fr] lg:gap-16">
          <div className="flex flex-col gap-6">
            <SectionHeading id="contact-title" kicker="Contact" title="Plan a campaign." lede="Tell us what you're planning. We'll come back with channels, formats, a rate card and a sample evidence pack." />
            <TickList items={["Rate card in AUD, GST shown", "Creative review in two working days", "Delivery reports by format and channel"]} />
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
  verdict,
}: {
  title: string
  note: string
  decision: ReturnType<typeof listAdDecisions>[number]
  verdict: string
}) {
  return (
    <div className="flex flex-col gap-4 rounded-lg border bg-card p-5">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <h3 className="text-[16px] font-bold">{title}</h3>
        <span className="font-mono text-[12px] text-muted-foreground">
          {decision.id} · {decision.channel}
        </span>
      </div>
      <p className="text-[14px] text-muted-foreground">{note}</p>
      <LockStatus locks={decision.locks} verdict={verdict} />
    </div>
  )
}
