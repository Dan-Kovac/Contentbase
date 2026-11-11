import Link from "next/link"
import { ArrowRight, ArrowUpRight, Ghost, Globe, LayoutTemplate, Mail, Newspaper, Rss, Search, Users } from "lucide-react"
import { AdSlot } from "@/components/brand/ad-slot"
import { Button } from "@/components/ui/button"
import { YouTubeIcon } from "@/components/auth/provider-icons"
import { Container, DarkHero, Section, SectionHeading, TickList } from "@/components/marketing/section"
import {
  ChannelHomeMock,
  RedirectMock,
  ReviewCardMock,
  SearchResultMock,
  TripleLockPanel,
} from "@/components/marketing/product-visuals"
import { PricingTeaser } from "@/components/marketing/pricing-cards"

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

const SOURCES = [
  { name: "WordPress", note: "WXR export or REST API", Icon: Newspaper },
  { name: "Ghost", note: "JSON export", Icon: Ghost },
  { name: "Substack", note: "Posts and podcast feed", Icon: Mail },
  { name: "RSS", note: "Any feed", Icon: Rss },
]

export default function HomePage() {
  return (
    <>
      <DarkHero>
        <div className="flex flex-col items-center gap-6 text-center">
          <p className="kicker text-brand-white before:bg-pop">For Australian sport and racing creators</p>
          <h1 className="max-w-[16ch] text-[44px] font-extrabold leading-[44px] tracking-[-0.04em] sm:text-[72px] sm:leading-[70px] lg:text-[88px] lg:leading-[84px]">
            Your channel. <span className="text-pitch">Your audience.</span>
          </h1>
          <p className="max-w-[56ch] text-[17px] leading-[27px] text-brand-muted sm:text-[20px] sm:leading-[30px]">
            Connect YouTube and every video becomes an article, shorts and a page that ranks. You own all of it.
          </p>
          <div className="flex w-full flex-col justify-center gap-3 sm:w-auto sm:flex-row">
            <Button asChild size="xl" className="bg-brand-white text-brand-black hover:bg-brand-white/90">
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
          <p className="text-[13px] text-brand-muted">14-day free trial. No card needed. From $29 a month inc. GST.</p>
        </div>
        <div className="mx-auto mt-14 max-w-[1040px] md:mt-20">
          <ChannelHomeMock />
        </div>
      </DarkHero>

      {/* Two equal paths */}
      <Section labelledBy="paths-title">
        <h2 id="paths-title" className="sr-only">
          Choose your path
        </h2>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <PathCard
            id="creators"
            kicker="For creators"
            title="Turn your YouTube channel into a publication you own."
            points={[
              "Every video becomes a page, an article and shorts",
              "New uploads arrive as drafts, ready to review",
              "Your followers and search traffic stay with you",
            ]}
            cta="Connect YouTube"
            href="/signup"
            icon={<YouTubeIcon className="size-4" />}
          />
          <PathCard
            id="publishers"
            kicker="For publishers"
            title="Move your site in a day, keep your rankings, keep your ad revenue."
            points={[
              "Import from WordPress, Ghost, Substack or RSS",
              "Every old URL redirects to its new page",
              "Earn from wagering ads legally from 1 January 2027",
            ]}
            cta="Import your site"
            href="/publishers"
            icon={<LayoutTemplate aria-hidden />}
          />
        </div>
      </Section>

      {/* How it works */}
      <Section tone="muted" labelledBy="how-title">
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

      {/* Own it */}
      <Section labelledBy="own-title">
        <SectionHeading
          id="own-title"
          kicker="Own it"
          title="Your domain. Your audience. Your search traffic."
          lede="A feed can change its mind overnight. A channel on your own domain keeps working for you."
        />
        <div className="mt-12 grid grid-cols-1 gap-4 md:grid-cols-3">
          <Feature icon={<Globe aria-hidden />} title="Your domain" body="Start on footyfix.homestand.com.au, then move to footyfix.com.au when you're ready. SSL is handled." />
          <Feature icon={<Users aria-hidden />} title="Your audience" body="Viewers follow your channel and sign in with one free account. You see who follows and they get your weekly digest." />
          <Feature icon={<Search aria-hidden />} title="Your search traffic" body="Every video gets a fast page with a transcript, chapters and structured data, so Google can find it and send people to you." />
        </div>
        <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-[1.2fr_1fr]">
          <SearchResultMock />
          <div className="flex flex-col justify-center gap-2 rounded-lg border bg-card p-5">
            <p className="text-[13px] font-semibold text-muted-foreground">What a video page carries</p>
            <TickList items={["Full transcript and chapters", "Video and article structured data", "Open Graph cards for sharing", "A sitemap that updates on publish"]} />
          </div>
        </div>
      </Section>

      {/* Earn */}
      <Section tone="muted" labelledBy="earn-title">
        <div className="grid grid-cols-1 gap-12 lg:grid-cols-2 lg:gap-16">
          <div className="flex flex-col gap-8">
            <SectionHeading
              id="earn-title"
              kicker="Earn"
              title="Premium ads, designed into the page."
              lede="Every ad sits in a fixed, labelled slot. No pop-ups, no autoplay with sound, nothing between a headline and its first paragraph."
            />
            <TickList
              items={[
                "Billboard, MREC, sponsor band and sponsored shorts card",
                "Ad revenue share on Pro and above",
                "Google AdSense in the same slots on Publisher",
                "Block any category you don't want, such as alcohol",
              ]}
            />
            <div className="flex flex-col gap-3 rounded-lg border bg-card p-5">
              <p className="text-[15px] font-semibold">The triple lock</p>
              <p className="text-[15px] leading-[23px] text-muted-foreground">
                Wagering ads only reach signed-in, age-verified adults who haven&apos;t opted out, so you can earn from them legally from 1 January 2027.
              </p>
              <Link href="/advertisers#triple-lock" className="inline-flex items-center gap-1.5 text-[14px] font-semibold underline-offset-4 hover:underline">
                How the triple lock works
                <ArrowRight className="size-4" aria-hidden />
              </Link>
            </div>
          </div>
          <div className="flex flex-col gap-4">
            <TripleLockPanel />
            <div className="flex justify-center rounded-lg border bg-background p-2 sm:p-6">
              <AdSlot format="mrec" advertiser="Southern Cross Utes" />
            </div>
          </div>
        </div>
      </Section>

      {/* Move in */}
      <Section labelledBy="move-title">
        <div className="grid grid-cols-1 items-start gap-12 lg:grid-cols-2 lg:gap-16">
          <div className="flex flex-col gap-8">
            <SectionHeading
              id="move-title"
              kicker="Move in easily"
              title="Bring your archive. Keep your rankings."
              lede="Import posts, pages, authors, categories and images. Every old URL gets a 301 redirect to its new home, so search engines follow you over."
            />
            <ul className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              {SOURCES.map((s) => (
                <li key={s.name} className="flex items-center gap-3 rounded-lg border p-4">
                  <span className="grid size-9 place-items-center rounded-[4px] bg-muted" aria-hidden>
                    <s.Icon className="size-4" />
                  </span>
                  <span className="flex flex-col">
                    <span className="text-[15px] font-semibold">{s.name}</span>
                    <span className="text-[13px] text-muted-foreground">{s.note}</span>
                  </span>
                </li>
              ))}
            </ul>
            <Button asChild variant="outline" size="lg" className="w-fit">
              <Link href="/publishers">
                See how migration works
                <ArrowRight aria-hidden />
              </Link>
            </Button>
          </div>
          <RedirectMock />
        </div>
      </Section>

      {/* Pricing teaser */}
      <Section tone="muted" labelledBy="pricing-title">
        <div className="flex flex-col gap-10">
          <div className="flex flex-wrap items-end justify-between gap-6">
            <SectionHeading
              id="pricing-title"
              kicker="Pricing"
              title="Plans from $29 a month."
              lede="All prices in AUD and include GST. Every plan starts with a 14-day free trial."
            />
            <Button asChild variant="outline" size="lg">
              <Link href="/pricing">
                Compare plans
                <ArrowUpRight aria-hidden />
              </Link>
            </Button>
          </div>
          <PricingTeaser />
        </div>
      </Section>

      {/* Final CTA */}
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
            <Button asChild size="xl" className="bg-brand-white text-brand-black hover:bg-brand-white/90">
              <Link href="/signup">Start free trial</Link>
            </Button>
            <Button
              asChild
              size="xl"
              variant="outline"
              className="border-white/25 bg-transparent text-brand-white hover:bg-white/10 hover:text-brand-white dark:bg-transparent"
            >
              <Link href="/pricing">See pricing</Link>
            </Button>
          </div>
        </Container>
      </section>
    </>
  )
}

function PathCard({
  id,
  kicker,
  title,
  points,
  cta,
  href,
  icon,
}: {
  id: string
  kicker: string
  title: string
  points: string[]
  cta: string
  href: string
  icon: React.ReactNode
}) {
  return (
    <div id={id} className="flex scroll-mt-24 flex-col gap-6 rounded-lg border bg-card p-6 sm:p-8">
      <p className="kicker">{kicker}</p>
      <h3 className="text-[26px] font-extrabold leading-[30px] tracking-[-0.025em] sm:text-[30px] sm:leading-[34px]">{title}</h3>
      <TickList items={points} />
      <Button asChild size="lg" className="mt-auto w-full sm:w-fit">
        <Link href={href}>
          {icon}
          {cta}
        </Link>
      </Button>
    </div>
  )
}

function Feature({ icon, title, body }: { icon: React.ReactNode; title: string; body: string }) {
  return (
    <div className="flex flex-col gap-3 rounded-lg border bg-card p-6">
      <span className="grid size-10 place-items-center rounded-[4px] bg-muted [&_svg]:size-5" aria-hidden>
        {icon}
      </span>
      <h3 className="text-[18px] font-bold tracking-[-0.01em]">{title}</h3>
      <p className="text-[15px] leading-[23px] text-muted-foreground">{body}</p>
    </div>
  )
}
