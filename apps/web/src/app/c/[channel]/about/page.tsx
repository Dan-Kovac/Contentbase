import { Suspense } from "react"
import type { Metadata } from "next"
import { notFound } from "next/navigation"
import { CustomPageView } from "@/components/channel/custom-page"
import { SITE, publishedPage } from "@/components/channel/lib"
import { ChannelPageSkeleton } from "@/components/channel/skeleton"
import { getChannel } from "@/lib/data"

export async function generateMetadata({ params }: { params: Promise<{ channel: string }> }): Promise<Metadata> {
  const { channel: slug } = await params
  const channel = getChannel(slug)
  if (!channel) return {}
  const page = publishedPage(channel, "about")
  return {
    title: { absolute: `${page?.title ?? "About"} · ${channel.name}` },
    description: channel.bio || `${channel.name}: ${channel.tagline}`,
    alternates: { canonical: `${SITE}/c/${channel.slug}/about` },
  }
}

/** The creator's own About page when one is published; otherwise the channel bio. */
async function AboutPageContent({ params }: { params: Promise<{ channel: string }> }) {
  const { channel: slug } = await params
  const channel = getChannel(slug)
  if (!channel) notFound()
  const page = publishedPage(channel, "about")
  return (
    <CustomPageView
      channel={channel}
      title={page?.title ?? `About ${channel.name}`}
      blocks={page?.blocks ?? [{ type: "paragraph", text: channel.bio }]}
      canonicalPath={`/c/${channel.slug}/about`}
    />
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
