import Link from "next/link"
import { ArrowUpRight, Globe, SquarePlay } from "lucide-react"
import { compact } from "@/lib/format"
import { cn } from "@/lib/utils"
import type { Block, Channel } from "@/lib/types"
import { ChannelCtaBlock } from "./channel-cta"
import { BODY, DISPLAY, SITE, publicArticles, publicShorts, publicVideos } from "./lib"
import { BlockView, JsonLd } from "./video-page"

function adsCopy(channel: Channel) {
  if (channel.mode !== "age_verified") return `${channel.name} doesn't show age-restricted ads, including betting ads.`
  const blocked = channel.blockedAgeCategories
  return [
    "Age-restricted ads, such as wagering, only reach signed-in, 18+ verified adults who haven't opted out, and never appear on live coverage.",
    blocked.length ? `${channel.name} doesn't show ${blocked.join(" or ")} ads at all.` : "",
  ]
    .filter(Boolean)
    .join(" ")
}

/**
 * A creator's custom page (About, Work with us…) built from blocks, with the channel's facts
 * alongside. The About route falls back to the channel bio when no About page is published.
 */
export function CustomPageView({
  channel,
  title,
  blocks,
  canonicalPath,
  kicker = "About",
}: {
  channel: Channel
  title: string
  blocks: Block[]
  canonicalPath: string
  kicker?: string
}) {
  const origin = `${SITE}/c/${channel.slug}`
  const firstImage = blocks.findIndex((b) => b.type === "image" && b.src)
  const hero = firstImage >= 0 ? (blocks[firstImage] as Extract<Block, { type: "image" }>) : undefined
  const body = hero ? blocks.filter((_, i) => i !== firstImage) : blocks
  const socials = [
    channel.youtube && {
      label: "YouTube",
      detail: `${channel.youtube.handle} · ${compact(channel.youtube.subscribers)} subscribers`,
      href: `https://www.youtube.com/${channel.youtube.handle}`,
      Icon: SquarePlay,
    },
    channel.customDomain && { label: "Website", detail: channel.customDomain, href: `https://${channel.customDomain}`, Icon: Globe },
  ].filter(Boolean) as { label: string; detail: string; href: string; Icon: typeof Globe }[]

  const ld = {
    "@context": "https://schema.org",
    "@type": kicker === "About" ? "AboutPage" : "WebPage",
    name: title,
    url: `${SITE}${canonicalPath}`,
    about: {
      "@type": "Organization",
      name: channel.name,
      url: origin,
      description: channel.tagline,
      founder: { "@type": "Person", name: channel.owner },
      sameAs: socials.map((s) => s.href),
    },
  }

  return (
    <div>
      <JsonLd data={ld} />
      <header className="mx-auto max-w-[1280px] px-4 pt-10 md:px-8 md:pt-16">
        <span className="kicker text-foreground">{kicker}</span>
        <h1 className={cn(DISPLAY, "mt-4 max-w-[18ch] text-[44px] leading-[1] sm:text-[60px] md:text-[80px]", channel.template === "broadcast" && "uppercase")}>{title}</h1>
        <p className={cn(BODY, "mt-5 max-w-[46ch] text-[21px] leading-[31px] text-foreground/80 md:text-[24px] md:leading-[35px]")}>{channel.tagline}</p>
      </header>

      {hero && (
        <figure className="mx-auto mt-10 max-w-[1280px] px-4 md:mt-14 md:px-8">
          {/* eslint-disable-next-line @next/next/no-img-element -- prototype media; next/image once media is on the CDN */}
          <img src={hero.src} alt={hero.caption} className="aspect-[16/9] w-full rounded-lg object-cover md:aspect-[21/9]" fetchPriority="high" />
          <figcaption className="mt-2 text-[13px] text-muted-foreground">{hero.caption}</figcaption>
        </figure>
      )}

      <div className="mx-auto mt-10 grid max-w-[1280px] gap-12 px-4 md:mt-14 md:px-8 lg:grid-cols-12">
        <div className="min-w-0 lg:col-span-7">
          <div className={cn(BODY, "max-w-[68ch] text-[18px] leading-[30px] md:text-[19px] md:leading-[32px] [&>*:first-child]:mt-0")}>
            {body.map((b, i) => (
              <BlockView key={i} block={b} channel={channel} />
            ))}
          </div>
          <ChannelCtaBlock channel={{ slug: channel.slug, name: channel.name, cta: channel.cta, template: channel.template }} className="mt-10 max-w-[68ch]" />
        </div>

        <aside className="flex flex-col gap-8 lg:col-span-4 lg:col-start-9">
          <dl className="grid grid-cols-2 gap-px overflow-hidden rounded-lg border bg-border">
            {[
              ["Followers", compact(channel.followers)],
              ["Videos", String(publicVideos(channel).length)],
              ["Shorts", String(publicShorts(channel).length)],
              ["Articles", String(publicVideos(channel).length + publicArticles(channel).length)],
            ].map(([k, v]) => (
              <div key={k} className="flex min-w-0 flex-col gap-1 bg-card p-4">
                <dt className="text-[12px] font-semibold uppercase tracking-[0.8px] text-muted-foreground">{k}</dt>
                <dd className={cn(DISPLAY, "text-[32px] leading-[36px] tabular")}>{v}</dd>
              </div>
            ))}
            <div className="col-span-2 flex flex-col gap-1 bg-card p-4">
              <dt className="text-[12px] font-semibold uppercase tracking-[0.8px] text-muted-foreground">Published by</dt>
              <dd className="text-[15px] font-semibold leading-5">{channel.owner}</dd>
            </div>
          </dl>

          {socials.length > 0 && (
            <div>
              <h2 className="kicker mb-3 text-foreground">Find us</h2>
              <ul className="divide-y border-y">
                {socials.map(({ label, detail, href, Icon }) => (
                  <li key={label}>
                    <a href={href} rel="me noopener" className="group flex items-center gap-3 py-3 outline-none focus-visible:ring-2 focus-visible:ring-ring">
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
          )}

          <div className="rounded-lg bg-muted p-4 text-[14px] leading-[21px]">
            <h2 className="mb-1 font-semibold">Ads on {channel.name}</h2>
            <p className="text-muted-foreground">{adsCopy(channel)}</p>
            <Link href="/account#ads" className="mt-2 inline-block font-semibold underline underline-offset-2">
              Don&apos;t show me betting ads
            </Link>
          </div>
        </aside>
      </div>
    </div>
  )
}
