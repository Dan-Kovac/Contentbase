import Link from "next/link"
import { ArrowRight, Building2, Check, Megaphone, Network, Newspaper, Tv, Users } from "lucide-react"
import { Button } from "@/components/ui/button"
import { YouTubeIcon } from "@/components/auth/provider-icons"
import { Container, DarkHero, Section, SectionHeading, TickList } from "@/components/marketing/section"
import {
  AgeVerifiedPanel,
  FormatShapes,
  HomestandPageSketch,
  OneVideoInMock,
  ReviewCardMock,
  TypicalPageSketch,
} from "@/components/marketing/product-visuals"
import { TemplatePreview } from "@/components/settings/template-preview"
import { getChannel } from "@/lib/data"
import { cn } from "@/lib/utils"

const STEPS = [
  {
    n: "1",
    title: "Connect YouTube",
    body: "Sign in with Google and pick your channel. We import your public videos, and every new upload from then on.",
  },
  {
    n: "2",
    title: "We draft the article, shorts and SEO",
    body: "Each video becomes a draft pack: a video page with chapters, an article in your voice, shorts cut from the best moments, and the search details.",
  },
  {
    n: "3",
    title: "You review and publish",
    body: "Drafts wait in Ready to review. Change what you like, then publish with one click. Nothing goes live without you.",
  },
]

export default function HomePage() {
  const footy = getChannel("footyfix")!
  const track = getChannel("trackside")!
  return (
    <>
      {/* 1. Hero: what it is, in one line, and the proof beside it */}
      <DarkHero>
        <div className="grid grid-cols-1 items-center gap-12 lg:grid-cols-[1fr_minmax(0,600px)] lg:gap-14">
          <div className="flex flex-col items-start gap-6">
            <p className="kicker text-brand-white before:bg-pop">Video-first publishing for Australian sport and racing</p>
            <h1 className="max-w-[14ch] text-[44px] font-extrabold leading-[44px] tracking-[-0.04em] sm:text-[60px] sm:leading-[60px] xl:text-[68px] xl:leading-[66px]">
              Turn your channel into a publication <span className="text-pitch">you own.</span>
            </h1>
            <p className="max-w-[48ch] text-[17px] leading-[27px] text-brand-muted sm:text-[19px] sm:leading-[29px]">
              Connect YouTube. Every video becomes a video page, an article and shorts on your own site, with fans who sign in and sponsors that fit the page.
            </p>
            <div className="flex w-full flex-col gap-3 sm:w-auto sm:flex-row">
              <Button asChild size="xl" variant="pop">
                <Link href="/signup">
                  Start free trial
                  <ArrowRight aria-hidden />
                </Link>
              </Button>
              <Button
                asChild
                size="xl"
                variant="outline"
                className="border-white/25 bg-transparent text-brand-white hover:bg-white/10 hover:text-brand-white dark:bg-transparent"
              >
                <Link href="/c/footyfix">See a live channel</Link>
              </Button>
            </div>
            <p className="text-[13px] text-brand-muted">
              14-day free trial. No card needed. From $29 a month inc. GST.{" "}
              <Link href="/advertisers" className="font-semibold text-brand-white underline-offset-4 hover:underline">
                Advertising with us? See the formats
              </Link>
            </p>
          </div>
          <OneVideoInMock />
        </div>
      </DarkHero>

      {/* 2. Who wins: one column each, equal weight */}
      <Section id="who" labelledBy="who-title" className="md:py-20">
        <SectionHeading
          id="who-title"
          kicker="Who it's for"
          title="Better for everyone on the page."
        />
        <div className="mt-12 grid grid-cols-1 gap-4 lg:grid-cols-3">
          <WhoCard
            id="creators"
            icon={<Building2 aria-hidden />}
            kicker="Creators and publishers"
            title="Own the audience and the income."
            points={[
              "Your domain, your sign-ins, your search traffic",
              "Every video becomes a page, an article and shorts",
              "Sponsors pay to reach your verified adults, and you take a share",
            ]}
          >
            <div className="flex flex-wrap gap-2">
              <Button asChild size="lg">
                <Link href="/signup">
                  <YouTubeIcon className="size-4" />
                  Connect YouTube
                </Link>
              </Button>
              <Button asChild size="lg" variant="outline">
                <Link href="/publishers">Import your site</Link>
              </Button>
            </div>
          </WhoCard>
          <WhoCard
            icon={<Users aria-hidden />}
            kicker="Fans"
            title="A page worth staying on."
            points={["No banners and no pop-ups", "Watch, read or skip straight to a chapter", "One free account, and a say over the ads they see"]}
          >
            <Link href="/c/footyfix/v/blues-centre-bounce-problem" className="inline-flex w-fit items-center gap-1.5 text-[14px] font-semibold underline-offset-4 hover:underline">
              See a video page <ArrowRight className="size-4" aria-hidden />
            </Link>
          </WhoCard>
          <WhoCard
            id="advertisers"
            icon={<Megaphone aria-hidden />}
            kicker="Advertisers"
            title="Verified adults, in formats people watch."
            points={[
              "Three checks before every age-restricted ad",
              "Your brand set in the channel's own design",
              "Evidence for every impression, ready for your compliance team",
            ]}
          >
            <Link href="/advertisers" className="inline-flex w-fit items-center gap-1.5 text-[14px] font-semibold underline-offset-4 hover:underline">
              See the formats <ArrowRight className="size-4" aria-hidden />
            </Link>
          </WhoCard>
        </div>
      </Section>

      {/* 3. How it works */}
      <Section tone="muted" labelledBy="how-title" className="md:py-20">
        <div className="grid grid-cols-1 items-center gap-12 lg:grid-cols-[1fr_1.15fr] lg:gap-16">
          <div className="flex flex-col gap-10">
            <SectionHeading
              id="how-title"
              kicker="How it works"
              title="Connect once. Publish every week."
              lede="You keep making videos. Homestand turns each one into everything a publication needs, and waits for your say-so."
            />
            <ol className="flex flex-col gap-6">
              {STEPS.map((s) => (
                <li key={s.n} className="flex gap-4">
                  <span className="grid size-9 shrink-0 place-items-center rounded-[4px] bg-primary text-[15px] font-bold text-primary-foreground tabular">
                    {s.n}
                  </span>
                  <div className="flex flex-col gap-1">
                    <h3 className="text-[18px] font-bold tracking-[-0.01em]">{s.title}</h3>
                    <p className="text-[15px] leading-[23px] text-muted-foreground">{s.body}</p>
                  </div>
                </li>
              ))}
            </ol>
          </div>
          <ReviewCardMock />
        </div>
      </Section>

      {/* 4. The page, rethought */}
      <Section labelledBy="page-title" className="md:py-20">
        <SectionHeading
          id="page-title"
          kicker="The page, rethought"
          title="No banners. Sponsors take the shape of the story."
          lede="Most publications bolt ads on top of the page. Here a sponsor is a short among shorts, a story among stories, a break the width of the article. Nothing moves, nothing pops up, and every unit is labelled."
        />
        <div className="mt-12 grid grid-cols-1 gap-6 md:grid-cols-2">
          <figure className="flex flex-col gap-3">
            <div className="rounded-lg bg-muted p-4 sm:p-6">
              <TypicalPageSketch />
            </div>
            <figcaption className="text-[14px]">
              <span className="font-semibold">A typical sports page.</span> <span className="text-muted-foreground">Seven ad slots in standard sizes, a pop-up and a sticky footer, all fighting the story.</span>
            </figcaption>
          </figure>
          <figure className="flex flex-col gap-3">
            <div className="rounded-lg bg-muted p-4 sm:p-6">
              <HomestandPageSketch />
            </div>
            <figcaption className="text-[14px]">
              <span className="font-semibold">The same page on Homestand.</span> <span className="text-muted-foreground">Three sponsors, shown in green, each the shape of what sits beside it.</span>
            </figcaption>
          </figure>
        </div>
        <div className="mt-10 flex flex-col gap-5">
          <FormatShapes />
          <Link href="/advertisers#formats" className="inline-flex w-fit items-center gap-1.5 text-[14px] font-semibold underline-offset-4 hover:underline">
            See all five formats
            <ArrowRight className="size-4" aria-hidden />
          </Link>
        </div>
      </Section>

      {/* 5. Age-verified advertising */}
      <Section tone="muted" labelledBy="lock-title" className="md:py-20">
        <div className="grid grid-cols-1 items-center gap-12 lg:grid-cols-2 lg:gap-16">
          <div className="flex flex-col gap-6">
            <SectionHeading
              id="lock-title"
              kicker="Age-verified advertising"
              title="Adults-only ads, checked every time."
              lede="Switch on the triple lock and age-restricted ads, such as alcohol and wagering, only show to viewers who are signed in, confirmed 18 or over and haven't opted out. Every decision is logged as evidence. If any check fails, an everyday sponsor fills the same space."
            />
            <Link href="/advertisers#triple-lock" className="inline-flex w-fit items-center gap-1.5 text-[14px] font-semibold underline-offset-4 hover:underline">
              How the triple lock works
              <ArrowRight className="size-4" aria-hidden />
            </Link>
          </div>
          <AgeVerifiedPanel />
        </div>
      </Section>

      {/* 6. Growth */}
      <Section labelledBy="grow-title" className="md:py-20">
        <SectionHeading
          id="grow-title"
          kicker="Grow"
          title="From one channel to a media empire."
          lede="Start with the videos you already make. Add writers, sections and your own pages. Then run several brands under one roof, each with its own look and its own call to action."
        />
        <ol className="mt-12 grid grid-cols-1 gap-4 md:grid-cols-3">
          <GrowStep n={1} icon={<Tv aria-hidden />} title="A channel" body="Your videos on your own domain, each with an article, shorts and a page that ranks." />
          <GrowStep n={2} icon={<Newspaper aria-hidden />} title="A publication" body="Sections, writers, standalone articles, your own pages, members and a button that does what you want." />
          <GrowStep n={3} icon={<Network aria-hidden />} title="A network" body="More channels under one account: three on Publisher, unlimited on Enterprise, with one sales team behind them." />
        </ol>
        <div className="mt-8 grid grid-cols-1 gap-6 md:grid-cols-2">
          {[footy, track].map((c) => (
            <figure key={c.id} className="flex flex-col gap-3">
              <TemplatePreview
                template={c.template}
                accentHex={c.accentHex}
                pairing={c.pairing}
                name={c.name}
                nav={c.nav.map((n) => n.label)}
                sectionLabels={c.sections.map((s) => s.label)}
                domain={c.customDomain ?? `${c.slug}.homestand.com.au`}
                ctaLabel={c.cta.label}
                maxHeight={440}
              />
              <figcaption className="flex flex-wrap items-baseline gap-x-2 text-[14px]">
                <Link href={`/c/${c.slug}`} className="font-semibold underline-offset-4 hover:underline">
                  {c.name}
                </Link>
                <span className="text-muted-foreground">
                  {c.template === "editorial" ? "Editorial" : "Broadcast"} template · button: “{c.cta.label}”
                </span>
              </figcaption>
            </figure>
          ))}
        </div>
      </Section>

      {/* 7. Close */}
      <section aria-labelledby="final-title" className="relative overflow-hidden bg-brand-black text-brand-white">
        <div className="pointer-events-none absolute inset-0 bg-pitch-glow" aria-hidden />
        <Container className="relative flex flex-col items-center gap-6 py-20 text-center md:py-28">
          <h2 id="final-title" className="max-w-[18ch] text-[36px] font-extrabold leading-[40px] tracking-[-0.03em] sm:text-[56px] sm:leading-[58px]">
            Your next video could be your first article.
          </h2>
          <p className="max-w-[48ch] text-[17px] leading-[27px] text-brand-muted">
            Connect YouTube now. Your channel is live in a minute, and the first drafts land while you choose a look.
          </p>
          <div className="flex w-full flex-col justify-center gap-3 sm:w-auto sm:flex-row">
            <Button asChild size="xl" variant="pop">
              <Link href="/signup">
                Start free trial
                <ArrowRight aria-hidden />
              </Link>
            </Button>
          </div>
          <p className="flex flex-wrap items-center justify-center gap-x-2 text-[14px] text-brand-muted">
            <Check className="size-4 text-pop" aria-hidden /> From $29 a month inc. GST. 14-day free trial.
            <Link href="/pricing" className="font-semibold text-brand-white underline-offset-4 hover:underline">
              See pricing
            </Link>
          </p>
        </Container>
      </section>
    </>
  )
}

function WhoCard({
  id,
  icon,
  kicker,
  title,
  points,
  children,
}: {
  id?: string
  icon: React.ReactNode
  kicker: string
  title: string
  points: string[]
  children: React.ReactNode
}) {
  return (
    <div id={id} className="flex scroll-mt-24 flex-col gap-5 rounded-lg border bg-card p-6 sm:p-8">
      <span className="grid size-10 place-items-center rounded-[4px] bg-muted [&_svg]:size-5" aria-hidden>
        {icon}
      </span>
      <p className="kicker">{kicker}</p>
      <h3 className="text-[24px] font-extrabold leading-[28px] tracking-[-0.025em] sm:text-[28px] sm:leading-[32px]">{title}</h3>
      <TickList items={points} />
      <div className="mt-auto pt-2">{children}</div>
    </div>
  )
}

function GrowStep({ n, icon, title, body }: { n: number; icon: React.ReactNode; title: string; body: string }) {
  return (
    <li className={cn("flex flex-col gap-3 rounded-lg border bg-card p-6")}>
      <span className="flex items-center gap-3">
        <span className="grid size-10 place-items-center rounded-[4px] bg-muted [&_svg]:size-5" aria-hidden>
          {icon}
        </span>
        <span className="font-mono text-[13px] text-muted-foreground">0{n}</span>
      </span>
      <h3 className="text-[20px] font-bold tracking-[-0.01em]">{title}</h3>
      <p className="text-[15px] leading-[23px] text-muted-foreground">{body}</p>
    </li>
  )
}
