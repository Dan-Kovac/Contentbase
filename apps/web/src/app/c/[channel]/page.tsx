import { Suspense } from "react"
import type { Metadata } from "next"
import { notFound } from "next/navigation"
import { BroadcastHome } from "@/components/channel/home-broadcast"
import { EditorialHome } from "@/components/channel/home-editorial"
import { homeData } from "@/components/channel/home-modules"
import { SITE } from "@/components/channel/lib"
import { ChannelPageSkeleton } from "@/components/channel/skeleton"
import { getChannel } from "@/lib/data"

export async function generateMetadata({ params }: { params: Promise<{ channel: string }> }): Promise<Metadata> {
  const { channel: slug } = await params
  const channel = getChannel(slug)
  if (!channel) return {}
  return {
    title: { absolute: `${channel.name} · ${channel.tagline}` },
    description: channel.tagline,
    alternates: { canonical: `${SITE}/c/${channel.slug}` },
    openGraph: { title: channel.name, description: channel.tagline, type: "website" },
  }
}

async function ChannelHomeContent({ params }: { params: Promise<{ channel: string }> }) {
  const { channel: slug } = await params
  const channel = getChannel(slug)
  if (!channel) notFound()
  const data = homeData(channel)
  // The public render is logged out, so every native format here is non-restricted.
  return channel.template === "broadcast" ? <BroadcastHome data={data} /> : <EditorialHome data={data} />
}

// params are URL data: read them inside Suspense so the shared App Shell stays instant.
export default function ChannelHome({ params }: { params: Promise<{ channel: string }> }) {
  return (
    <Suspense fallback={<ChannelPageSkeleton variant="home" />}>
      <ChannelHomeContent params={params} />
    </Suspense>
  )
}
