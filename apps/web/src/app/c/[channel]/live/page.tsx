import { Suspense } from "react"
import type { Metadata } from "next"
import { notFound } from "next/navigation"
import { AdSlot } from "@/components/brand/ad-slot"
import { StatusBadge } from "@/components/brand/status-badge"
import { BODY, DISPLAY, SITE } from "@/components/channel/lib"
import { getLiveBlog } from "@/components/channel/live-data"
import { JsonLd } from "@/components/channel/video-page"
import { ChannelPageSkeleton } from "@/components/channel/skeleton"
import { getChannel } from "@/lib/data"
import { cn } from "@/lib/utils"

export async function generateMetadata({ params }: { params: Promise<{ channel: string }> }): Promise<Metadata> {
  const { channel: slug } = await params
  const channel = getChannel(slug)
  const blog = channel && getLiveBlog(channel.slug)
  if (!channel || !blog) return {}
  return {
    title: { absolute: `Live: ${blog.title} · ${channel.name}` },
    description: blog.standfirst,
    alternates: { canonical: `${SITE}/c/${channel.slug}/live` },
  }
}

async function LivePageContent({ params }: { params: Promise<{ channel: string }> }) {
  const { channel: slug } = await params
  const channel = getChannel(slug)
  const blog = channel && getLiveBlog(channel.slug)
  if (!channel || !blog) notFound()

  const url = `${SITE}/c/${channel.slug}/live`
  const ld = {
    "@context": "https://schema.org",
    "@type": "LiveBlogPosting",
    headline: blog.title,
    description: blog.standfirst,
    url,
    coverageStartTime: blog.updates[blog.updates.length - 1]?.iso,
    dateModified: blog.updatedIso,
    publisher: { "@type": "Organization", name: channel.name },
    liveBlogUpdate: blog.updates.map((u) => ({
      "@type": "BlogPosting",
      headline: u.title ?? u.text.slice(0, 80),
      datePublished: u.iso,
      articleBody: u.text,
      author: { "@type": "Person", name: u.author },
    })),
  }
  const keyMoments = blog.updates.filter((u) => u.key)

  return (
    <div className="mx-auto max-w-[1280px] px-4 pt-8 md:px-8 md:pt-12">
      <JsonLd data={ld} />
      <div className="grid gap-12 lg:grid-cols-12">
        <article className="min-w-0 lg:col-span-8">
          <header className="flex flex-col gap-4 border-b pb-6">
            <div className="flex flex-wrap items-center gap-3">
              <StatusBadge tone="live" />
              <span className="text-[13px] font-medium text-muted-foreground">{blog.event}</span>
            </div>
            <h1 className={cn(DISPLAY, "text-[36px] leading-[1.04] md:text-[52px]")}>{blog.title}</h1>
            <p className={cn(BODY, "max-w-[60ch] text-[19px] leading-[29px] text-foreground/80 md:text-[21px] md:leading-[31px]")}>
              {blog.standfirst}
            </p>
            <p className="text-[13px] text-muted-foreground">
              Last updated <time dateTime={blog.updatedIso}>{blog.updatedAt}, {blog.startedAt}</time> · Newest first
            </p>
          </header>

          <ol className="relative mt-2" aria-label="Live updates">
            {blog.updates.map((u) => (
              <li key={u.id} id={u.id} className="grid scroll-mt-24 grid-cols-[72px_1fr] gap-4 border-b py-6 md:grid-cols-[96px_1fr] md:gap-6">
                <div className="flex flex-col gap-1">
                  <time dateTime={u.iso} className="font-mono text-[14px] font-medium tabular">
                    {u.time}
                  </time>
                  {u.key && <span className="kicker text-[10px] text-foreground">Key</span>}
                </div>
                <div className="min-w-0">
                  {u.title && <h2 className={cn(DISPLAY, "mb-2 text-[22px] leading-[27px] md:text-[24px] md:leading-[29px]")}>{u.title}</h2>}
                  <p className={cn(BODY, "max-w-[64ch] text-[17px] leading-[28px] md:text-[18px] md:leading-[29px]")}>{u.text}</p>
                  <p className="mt-2 text-[13px] text-muted-foreground">{u.author}</p>
                </div>
              </li>
            ))}
          </ol>
        </article>

        <aside className="flex flex-col gap-8 lg:col-span-4">
          <div className="rounded-lg border bg-card p-5">
            <h2 className="kicker mb-3 text-foreground">Key moments</h2>
            <ol className="flex flex-col gap-3">
              {keyMoments.map((u) => (
                <li key={u.id}>
                  <a href={`#${u.id}`} className="group flex gap-3 text-[15px] outline-none focus-visible:ring-2 focus-visible:ring-ring">
                    <span className="w-16 shrink-0 font-mono text-[13px] leading-[22px] text-muted-foreground tabular">{u.time}</span>
                    <span className="font-medium leading-[22px] group-hover:underline">{u.title}</span>
                  </a>
                </li>
              ))}
            </ol>
          </div>
          {/*
            TLK-08: this page is flagged is_live, so the ad decision service excludes wagering for
            every slot here, whatever the viewer's locks. The slot below is always non-wagering.
          */}
          <div data-ad-policy="non-wagering" data-live-page="true" className="flex justify-center lg:justify-start">
            <p className="sr-only">Betting ads are switched off on live coverage.</p>
            <AdSlot format="mrec" wagering={false} advertiser="Southern Cross Utes" className="lg:mx-0" />
          </div>
        </aside>
      </div>
    </div>
  )
}

// params are URL data: read them inside Suspense so the shared App Shell stays instant.
export default function LivePage({ params }: { params: Promise<{ channel: string }> }) {
  return (
    <Suspense fallback={<ChannelPageSkeleton variant="page" />}>
      <LivePageContent params={params} />
    </Suspense>
  )
}
