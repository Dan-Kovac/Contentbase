import { Suspense } from "react"
import type { Metadata } from "next"
import Link from "next/link"
import { notFound } from "next/navigation"
import { ChevronRight } from "lucide-react"
import { BODY, SITE, isoDate, publicArticles, relatedFor, sectionLabel, sectionPath, slotOptions } from "@/components/channel/lib"
import { SponsorSlot } from "@/components/channel/viewer"
import { ChannelCtaBlock } from "@/components/channel/channel-cta"
import { ArticleHeaderView, BlockView, JsonLd, RelatedItems, splitAtBreak } from "@/components/channel/video-page"
import { ChannelPageSkeleton } from "@/components/channel/skeleton"
import { getChannel, listChannels } from "@/lib/data"
import { cn } from "@/lib/utils"

type Params = Promise<{ channel: string; slug: string }>

export function generateStaticParams() {
  const params = listChannels().flatMap((c) => publicArticles(c).map((a) => ({ channel: c.slug, slug: a.slug })))
  return params.length ? params : [{ channel: listChannels()[0].slug, slug: "none" }]
}

function load(c: string, s: string) {
  const channel = getChannel(c)
  const article = channel && publicArticles(channel).find((a) => a.slug === s)
  if (!channel || !article) return null
  return { channel, article }
}

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { channel: c, slug } = await params
  const data = load(c, slug)
  if (!data) return {}
  const { channel, article } = data
  return {
    title: { absolute: `${article.headline} | ${channel.name}` },
    description: article.standfirst,
    alternates: { canonical: `${SITE}/c/${channel.slug}/a/${article.slug}` },
    openGraph: { title: article.headline, description: article.standfirst, type: "article", images: article.hero ? [article.hero] : undefined },
  }
}

const READING = cn(BODY, "mx-auto w-full max-w-[68ch] text-[18px] leading-[30px] md:text-[19px] md:leading-[32px]")

async function ArticlePageContent({ params }: { params: Params }) {
  const { channel: c, slug } = await params
  const data = load(c, slug)
  if (!data) notFound()
  const { channel, article } = data
  const { before, after } = splitAtBreak(article.blocks, 1)
  const related = relatedFor(channel, article)
  const url = `${SITE}/c/${channel.slug}/a/${article.slug}`
  const ld = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: article.headline,
    description: article.standfirst,
    image: article.hero ? [`${SITE}${article.hero}`] : undefined,
    datePublished: article.publishedAt ? isoDate(article.publishedAt) : undefined,
    author: { "@type": "Person", name: article.author },
    publisher: { "@type": "Organization", name: channel.name, url: `${SITE}/c/${channel.slug}` },
    mainEntityOfPage: url,
  }

  return (
    <div>
      <JsonLd data={ld} />
      <div className="mx-auto max-w-[1280px] px-4 pt-5 md:px-8 md:pt-8">
        <nav aria-label="Breadcrumb" className="mb-8 text-[13px] text-muted-foreground md:mb-12">
          <ol className="flex flex-wrap items-center gap-1">
            <li>
              <Link href={`/c/${channel.slug}`} className="hover:text-foreground hover:underline">
                {channel.name}
              </Link>
            </li>
            <li aria-hidden>
              <ChevronRight className="size-3.5" />
            </li>
            <li>
              <Link href={sectionPath(channel, article.section)} className="hover:text-foreground hover:underline">
                {sectionLabel(channel, article.section)}
              </Link>
            </li>
            <li aria-hidden>
              <ChevronRight className="size-3.5" />
            </li>
            <li aria-current="page" className="min-w-0 truncate text-foreground">
              {article.headline}
            </li>
          </ol>
        </nav>

        <article>
          <div className="mx-auto max-w-[920px]">
            <ArticleHeaderView
              size="lg"
              h={{
                kicker: sectionLabel(channel, article.section),
                kickerHref: sectionPath(channel, article.section),
                headline: article.headline,
                standfirst: article.standfirst,
                author: article.author,
                date: article.publishedAt ?? "",
                readMinutes: article.readMinutes,
              }}
            />
          </div>
          {article.hero && (
            <figure className="mx-auto mt-8 max-w-[920px] md:mt-10">
              {/* eslint-disable-next-line @next/next/no-img-element -- prototype media; next/image once media is on the CDN */}
              <img src={article.hero} alt="" className="aspect-[16/9] w-full rounded-lg object-cover" fetchPriority="high" />
            </figure>
          )}
          <div className={cn(READING, "mt-8 md:mt-12 [&>*:first-child]:mt-0")}>
            {before.map((b, i) => (
              <BlockView key={i} block={b} channel={channel} />
            ))}
          </div>
          {after.length > 0 && (
            <div className={READING}>
              {/* Half-time: between two sections, inside the reading column like an image block. */}
              <SponsorSlot format="halftime" options={slotOptions(channel, "halftime")} />
              {after.map((b, i) => (
                <BlockView key={i} block={b} channel={channel} />
              ))}
            </div>
          )}
          <div className={cn(READING, "mt-12")}>
            <ChannelCtaBlock channel={{ slug: channel.slug, name: channel.name, cta: channel.cta, template: channel.template }} />
          </div>
        </article>
      </div>
      <div className="mx-auto mt-16 max-w-[1280px] px-4 md:mt-24 md:px-8">
        <RelatedItems channel={channel} related={related} sponsor={slotOptions(channel, "short")} />
      </div>
    </div>
  )
}

// params are URL data: read them inside Suspense so the shared App Shell stays instant.
export default function ArticlePage({ params }: { params: Params }) {
  return (
    <Suspense fallback={<ChannelPageSkeleton variant="page" />}>
      <ArticlePageContent params={params} />
    </Suspense>
  )
}
