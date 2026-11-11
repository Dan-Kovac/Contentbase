import { Suspense } from "react"
import type { Metadata } from "next"
import Link from "next/link"
import { notFound } from "next/navigation"
import { ArrowUpRight, Globe, SquarePlay } from "lucide-react"
import { FollowButton } from "@/components/channel/follow-button"
import { JsonLd } from "@/components/channel/video-page"
import { BODY, DISPLAY, SITE, publicShorts, publicVideos } from "@/components/channel/lib"
import { ChannelPageSkeleton } from "@/components/channel/skeleton"
import { getChannel } from "@/lib/data"
import { compact } from "@/lib/format"
import { cn } from "@/lib/utils"
import type { Channel } from "@/lib/types"

// Bios are channel settings that are not in the sample data yet.
const BIOS: Record<string, string[]> = {
  footyfix: [
    "Footy Fix is AFL and AFLW analysis for people who watch the whole game, not just the highlights. Every week Sam Doherty and Jess Nguyen take one question, go to the vision and the numbers, and explain what is really happening.",
    "New episodes go up every Monday, with a mailbag on Thursdays. Every episode comes with a full article and a searchable transcript, so you can read it on the train or find the bit you remember.",
  ],
  trackside: [
    "Trackside covers Australian thoroughbred racing from the form guide to the stable yard. We talk to trainers, strappers and jockeys, and we explain why a race was won rather than who should have been backed.",
    "Trackside is a racing-only channel. Form analysis and feature interviews are published every week through the spring and autumn carnivals.",
  ],
}

const MODE_COPY: Record<Channel["mode"], string> = {
  standard: "This channel does not show betting ads.",
  triple_lock:
    "Betting ads only reach signed-in, age-verified adults who haven't opted out. You can turn them off at any time.",
  racing_only:
    "This is a declared racing channel. Betting ads only reach signed-in, age-verified adults who haven't opted out, and you can turn them off at any time.",
}

export async function generateMetadata({ params }: { params: Promise<{ channel: string }> }): Promise<Metadata> {
  const { channel: slug } = await params
  const channel = getChannel(slug)
  if (!channel) return {}
  return {
    title: { absolute: `About · ${channel.name}` },
    description: `${channel.name}: ${channel.tagline}`,
    alternates: { canonical: `${SITE}/c/${channel.slug}/about` },
  }
}

async function AboutPageContent({ params }: { params: Promise<{ channel: string }> }) {
  const { channel: slug } = await params
  const channel = getChannel(slug)
  if (!channel) notFound()

  const bio = BIOS[channel.slug] ?? [channel.tagline]
  const videoCount = publicVideos(channel).length
  const shortCount = publicShorts(channel).length
  const origin = `${SITE}/c/${channel.slug}`

  const socials = [
    channel.youtube && {
      label: "YouTube",
      detail: `${channel.youtube.handle} · ${compact(channel.youtube.subscribers)} subscribers`,
      href: `https://www.youtube.com/${channel.youtube.handle}`,
      Icon: SquarePlay,
    },
    channel.customDomain && { label: "Website", detail: channel.customDomain, href: `https://${channel.customDomain}`, Icon: Globe },
  ].filter(Boolean) as { label: string; detail: string; href: string; Icon: typeof Globe }[]

  const orgLd = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: channel.name,
    url: origin,
    description: channel.tagline,
    founder: { "@type": "Person", name: channel.owner },
    sameAs: socials.map((s) => s.href),
  }

  return (
    <div className="mx-auto max-w-[1280px] px-4 pt-10 md:px-8 md:pt-16">
      <JsonLd data={orgLd} />
      <div className="grid gap-12 lg:grid-cols-12">
        <div className="lg:col-span-7">
          <span className="kicker text-foreground">About</span>
          <h1 className={cn(DISPLAY, "mt-4 text-[44px] leading-[1] md:text-[72px]")}>{channel.name}</h1>
          <p className={cn(DISPLAY, "mt-5 text-[24px] leading-[30px] text-foreground/80 md:text-[28px] md:leading-[34px]")}>
            {channel.tagline}
          </p>
          <div className={cn(BODY, "mt-8 flex max-w-[68ch] flex-col gap-5 text-[18px] leading-[30px]")}>
            {bio.map((p) => (
              <p key={p}>{p}</p>
            ))}
          </div>
          <div className="mt-10">
            <FollowButton channelName={channel.name} followers={channel.followers} />
          </div>
        </div>

        <aside className="flex flex-col gap-8 lg:col-span-4 lg:col-start-9">
          <dl className="grid grid-cols-2 gap-px overflow-hidden rounded-lg border bg-border">
            {[
              ["Followers", compact(channel.followers)],
              ["Videos", String(videoCount)],
              ["Shorts", String(shortCount)],
              ["Published by", channel.owner],
            ].map(([k, v]) => (
              <div key={k} className="flex min-w-0 flex-col gap-1 bg-card p-4">
                <dt className="text-[12px] font-semibold uppercase tracking-[0.8px] text-muted-foreground">{k}</dt>
                <dd className={cn(k === "Published by" ? "text-[15px] font-semibold leading-5" : cn(DISPLAY, "text-[30px] leading-[34px] tabular"))}>{v}</dd>
              </div>
            ))}
          </dl>

          <div>
            <h2 className="kicker mb-3 text-foreground">Find us</h2>
            <ul className="divide-y border-y">
              {socials.map(({ label, detail, href, Icon }) => (
                <li key={label}>
                  <a
                    href={href}
                    rel="me noopener"
                    className="group flex items-center gap-3 py-3 outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  >
                    <Icon className="size-5 shrink-0" aria-hidden />
                    <span className="flex min-w-0 flex-col">
                      <span className="text-[15px] font-semibold group-hover:underline">{label}</span>
                      <span className="truncate text-[13px] text-muted-foreground">{detail}</span>
                    </span>
                    <ArrowUpRight className="ml-auto size-4 shrink-0 text-muted-foreground" aria-hidden />
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <div className="rounded-lg bg-muted p-4 text-[14px] leading-[21px]">
            <h2 className="mb-1 font-semibold">Ads on {channel.name}</h2>
            <p className="text-muted-foreground">{MODE_COPY[channel.mode]}</p>
            <Link href="/account#ads" className="mt-2 inline-block font-semibold underline underline-offset-2">
              Don&apos;t show me betting ads
            </Link>
          </div>
        </aside>
      </div>
    </div>
  )
}

// params are URL data: read them inside Suspense so the shared App Shell stays instant.
export default function AboutPage({ params }: { params: Promise<{ channel: string }> }) {
  return (
    <Suspense fallback={<ChannelPageSkeleton variant="page" />}>
      <AboutPageContent params={params} />
    </Suspense>
  )
}
