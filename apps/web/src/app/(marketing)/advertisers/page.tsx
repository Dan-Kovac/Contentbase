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
  UtensilsCrossed,
  Wallet,
} from "lucide-react"
import { HalftimeBreak } from "@/components/brand/native-ads"
import { Button } from "@/components/ui/button"
import { DarkHero, Section, SectionHeading, TickList } from "@/components/marketing/section"
import { AdvertiserContactForm } from "@/components/marketing/advertiser-contact-form"
import { FORMAT_EXAMPLE, FormatStage, NATIVE_FORMATS } from "@/components/marketing/native-formats"
import { slotOptions, viewerNotes } from "@/components/channel/lib"
import { TripleLockDemo } from "@/components/marketing/triple-lock-demo"
import { getChannel, getDailyStats, getSponsor, listChannels } from "@/lib/data"
import { compact } from "@/lib/format"
import { cn } from "@/lib/utils"

export const metadata: Metadata = {
  title: "For advertisers",
  description: "Reach verified adults, in formats people actually watch. Homestand Native Formats on Australian sport channels, with age-verified placements for alcohol and wagering.",
}

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
  { Icon: Wallet, name: "CPM", body: "Per thousand viewable impressions, by channel, section or the whole network. Suits sponsored stories, half-time breaks and sponsored shorts." },
  { Icon: FileDown, name: "Flat sponsorship", body: "A fixed price for a flight: Presented by on a channel or section, or a chapter sponsor across a series." },
  { Icon: MousePointerClick, name: "CPC", body: "Per click, for performance campaigns. Wagering CPC only after legal sign-off." },
]

export default function AdvertisersPage() {
  const heroSponsor = getSponsor("sp_ute")!
  const footy = getChannel("footyfix")!
  const channels = listChannels()
  const stats = getDailyStats()
  const NETWORK: [string, string][] = [
    [String(channels.length), "Pilot channels, AFL and racing"],
    [compact(channels.reduce((n, c) => n + c.followers, 0)), "Followers across the network"],
    [compact(stats.reduce((n, d) => n + d.signUps, 0)), "Viewers confirmed 18+ this month"],
    ["0", "Age-restricted ads served outside a valid triple-lock session"],
  ]

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
          <div className="rounded-lg bg-background p-4 text-foreground sm:p-5">
            <HalftimeBreak sponsor={heroSponsor} className="my-0" />
          </div>
        </div>
      </DarkHero>

      {/* The rule, in one line. Not legal advice: every compliance item needs lawyer sign-off. */}
      <section aria-label="The rule" className="border-b bg-background">
        <div className="mx-auto flex max-w-[1280px] flex-col gap-2 px-4 py-8 sm:px-6 md:flex-row md:items-baseline md:gap-8 lg:px-8">
          <p className="kicker shrink-0 text-foreground">From 1 January 2027</p>
          <p className="text-[19px] font-semibold leading-[28px] tracking-[-0.01em] md:text-[22px] md:leading-[31px]">
            Wagering ads online need a signed-in viewer, a confirmed adult and an opt-out. We check all three on every impression.
          </p>
        </div>
        <p className="mx-auto max-w-[1280px] px-4 pb-6 text-[12px] text-muted-foreground sm:px-6 lg:px-8">
          A plain summary of public commentary on the 2026 reforms, not legal advice. Check your own obligations with a lawyer.
        </p>
      </section>

      <Section tone="muted" id="triple-lock" labelledBy="tl-title">
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
        <div className="mt-8 rounded-lg border bg-muted/50 p-4 sm:p-6">
          <TripleLockDemo
            chapter={slotOptions(footy, "chapter")}
            halftime={slotOptions(footy, "halftime")}
            notes={viewerNotes(footy)}
            channelName={footy.name}
            chapterTitle="Chapter 2: Wingers leaving early"
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
      <Section id="formats" labelledBy="formats-title">
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
        <ol className="mt-12 grid grid-cols-1 gap-4 lg:grid-cols-2">
          {NATIVE_FORMATS.map((f, i) => (
            <li key={f.id} className={cn("flex flex-col gap-6 rounded-lg border bg-card p-5 sm:p-6", i === 0 && "lg:row-span-2")}>
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
              <FormatStage className="mt-auto">{FORMAT_EXAMPLE[f.id]()}</FormatStage>
            </li>
          ))}
        </ol>
        <p className="mt-6 text-[13px] leading-5 text-muted-foreground">
          Examples use sample brands. The opt-out on an age-restricted format works as it does on a live channel. Try it.
        </p>
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
      <Section labelledBy="net-title">
        <SectionHeading
          id="net-title"
          kicker="The network"
          title="People who chose to be here."
          lede="Every viewer you reach on Homestand followed a channel they like. Age-restricted categories get one more guarantee: every viewer is a confirmed adult."
        />
        <dl className="mt-12 grid grid-cols-2 gap-px overflow-hidden rounded-lg border bg-border lg:grid-cols-4">
          {NETWORK.map(([value, label]) => (
            <div key={label} className="flex flex-col gap-1 bg-card p-6">
              <dt className="order-2 text-[14px] leading-[20px] text-muted-foreground">{label}</dt>
              <dd className="order-1 text-[36px] font-extrabold leading-none tracking-[-0.03em]">{value}</dd>
            </div>
          ))}
        </dl>
        <p className="mt-3 text-[12px] text-muted-foreground">Sample pilot data, last 30 days.</p>
      </Section>

      <Section tone="muted" labelledBy="own-title">
        <div className="grid grid-cols-1 items-center gap-10 lg:grid-cols-[1.2fr_1fr] lg:gap-16">
          <SectionHeading
            id="own-title"
            kicker="Have content of your own?"
            title="Give your footy and racing content its own home."
            lede="Brands with their own shows and analysis can run them as a standalone channel on Enterprise: its own name, domain and audience, with the same review gate and the same rules as every other channel. Whether that suits your business is a question for your own lawyers first."
          />
          <div className="flex flex-col gap-3 rounded-lg border bg-card p-6">
            <TickList items={["A separate channel with its own brand and domain", "White-glove move of your existing videos and articles", "Your editorial team reviews every draft before it goes live"]} />
            <Button asChild variant="outline" size="lg" className="mt-2 w-fit">
              <a href="#contact">Talk to us about Enterprise</a>
            </Button>
          </div>
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
