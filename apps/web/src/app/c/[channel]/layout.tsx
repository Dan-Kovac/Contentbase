import { notFound } from "next/navigation"
import { ChannelFooter, ChannelHeader } from "@/components/shell/channel-chrome"
import { getChannel, listChannels } from "@/lib/data"
import { channelStyle } from "@/lib/format"

export function generateStaticParams() {
  return listChannels().map((c) => ({ channel: c.slug }))
}

export default async function ChannelLayout({
  children,
  params,
}: {
  children: React.ReactNode
  params: Promise<{ channel: string }>
}) {
  const { channel: slug } = await params
  const channel = getChannel(slug)
  if (!channel) notFound()
  return (
    <div style={channelStyle(channel.accent, channel.pairing)} className="flex min-h-svh flex-col bg-background">
      <ChannelHeader channel={channel} />
      <main className="flex-1">{children}</main>
      <ChannelFooter channel={channel} />
    </div>
  )
}
