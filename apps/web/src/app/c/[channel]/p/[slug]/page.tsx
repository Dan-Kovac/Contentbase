import { Suspense } from "react"
import type { Metadata } from "next"
import { notFound, permanentRedirect } from "next/navigation"
import { CustomPageView } from "@/components/channel/custom-page"
import { SITE, publicPages } from "@/components/channel/lib"
import { ChannelPageSkeleton } from "@/components/channel/skeleton"
import { getChannel, listChannels } from "@/lib/data"

type Params = Promise<{ channel: string; slug: string }>

export function generateStaticParams() {
  const params = listChannels().flatMap((c) => publicPages(c).map((p) => ({ channel: c.slug, slug: p.slug })))
  // A placeholder keeps the route buildable when no channel has a published page yet.
  return params.length ? params : [{ channel: listChannels()[0].slug, slug: "about" }]
}

function load(c: string, s: string) {
  const channel = getChannel(c)
  const page = channel && publicPages(channel).find((p) => p.slug === s)
  if (!channel || !page) return null
  return { channel, page }
}

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { channel: c, slug } = await params
  const data = load(c, slug)
  if (!data) return {}
  const first = data.page.blocks.find((b) => b.type === "paragraph")
  return {
    title: { absolute: `${data.page.title} · ${data.channel.name}` },
    description: first?.type === "paragraph" ? first.text : data.channel.tagline,
    alternates: { canonical: `${SITE}/c/${data.channel.slug}/p/${data.page.slug}` },
  }
}

async function CustomPageContent({ params }: { params: Params }) {
  const { channel: c, slug } = await params
  // The About page lives at /about, its long-standing address.
  if (slug === "about") permanentRedirect(`/c/${c}/about`)
  const data = load(c, slug)
  if (!data) notFound()
  const { channel, page } = data
  return (
    <CustomPageView
      channel={channel}
      title={page.title}
      blocks={page.blocks}
      canonicalPath={`/c/${channel.slug}/p/${page.slug}`}
      kicker={channel.name}
    />
  )
}

// params are URL data: read them inside Suspense so the shared App Shell stays instant.
export default function CustomPage({ params }: { params: Params }) {
  return (
    <Suspense fallback={<ChannelPageSkeleton variant="page" />}>
      <CustomPageContent params={params} />
    </Suspense>
  )
}
