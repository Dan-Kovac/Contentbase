import { Suspense } from "react"
import { notFound } from "next/navigation"
import { ChannelFooter, ChannelHeader } from "@/components/shell/channel-chrome"
import { channelNav, viewerNotes } from "@/components/channel/lib"
import { DemoBar, ViewerProvider } from "@/components/channel/viewer"
import { getChannel, listChannels } from "@/lib/data"
import { channelStyle, contrastRatio } from "@/lib/format"
import { cn } from "@/lib/utils"

export function generateStaticParams() {
  return listChannels().map((c) => ({ channel: c.slug }))
}

async function ChannelFrame({
  children,
  params,
}: {
  children: React.ReactNode
  params: Promise<{ channel: string }>
}) {
  const { channel: slug } = await params
  const channel = getChannel(slug)
  if (!channel) notFound()
  const dark = channel.template === "broadcast"
  // The accent as text (numbers, links): only where it reads at 4.5:1 on the page ground.
  const ground = dark ? "#0a0a0a" : "#ffffff"
  const ink = contrastRatio(channel.accentHex, ground) >= 4.5 ? channel.accentHex : "var(--foreground)"
  return (
    <div
      style={{ ...channelStyle(channel.accentHex, channel.pairing), ["--chan-ink" as string]: ink }}
      data-template={channel.template}
      className={cn("flex min-h-svh flex-col bg-background text-foreground", dark && "dark [color-scheme:dark]")}
    >
      <ViewerProvider>
        <ChannelHeader channel={channel} nav={channelNav(channel)} />
        <main id="main" className="flex-1">
          {children}
        </main>
        <ChannelFooter channel={channel} nav={channelNav(channel)} />
        <DemoBar notes={viewerNotes(channel)} />
      </ViewerProvider>
    </div>
  )
}

export default function ChannelLayout({
  children,
  params,
}: {
  children: React.ReactNode
  params: Promise<{ channel: string }>
}) {
  return (
    <Suspense fallback={<div className="min-h-svh bg-background" />}>
      <ChannelFrame params={params}>{children}</ChannelFrame>
    </Suspense>
  )
}
