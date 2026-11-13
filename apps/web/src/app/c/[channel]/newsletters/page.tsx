import { Suspense } from "react"
import type { Metadata } from "next"
import { notFound } from "next/navigation"
import { DISPLAY, SITE } from "@/components/channel/lib"
import { NewsletterPicker } from "@/components/channel/newsletters"
import { ChannelPageSkeleton } from "@/components/channel/skeleton"
import { getChannel, listEmailCampaigns, listEmailStreams } from "@/lib/data"
import { cn } from "@/lib/utils"

type Params = Promise<{ channel: string }>

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { channel: slug } = await params
  const channel = getChannel(slug)
  if (!channel) return {}
  return { title: { absolute: `Newsletters · ${channel.name}` }, alternates: { canonical: `${SITE}/c/${channel.slug}/newsletters` } }
}

/** The channel's own email streams. Subscribing is for members (signed in), so the list is the publication's own. */
async function NewslettersContent({ params }: { params: Params }) {
  const { channel: slug } = await params
  const channel = getChannel(slug)
  if (!channel) notFound()
  const streams = listEmailStreams(channel.id).map(({ id, name, description, cadence, membersOnly, defaultOn }) => ({ id, name, description, cadence, membersOnly, defaultOn }))
  const latest = listEmailCampaigns(channel.id).filter((c) => c.status === "sent")
  return (
    <div className="mx-auto grid max-w-[1080px] gap-10 px-4 py-10 md:grid-cols-[1fr_320px] md:gap-14 md:px-8 md:py-16">
      <div className="flex min-w-0 flex-col gap-6">
        <div className="flex flex-col gap-3">
          <p className="kicker text-foreground">Newsletters</p>
          <h1 className={cn(DISPLAY, "text-[40px] leading-[1] md:text-[52px]", channel.template === "broadcast" && "uppercase")}>{channel.name} in your inbox</h1>
          <p className="max-w-[52ch] text-[17px] leading-[26px] text-muted-foreground">Choose what you get and how often. Straight from {channel.name}, no algorithm in between.</p>
        </div>
        <NewsletterPicker channel={{ slug: channel.slug, name: channel.name, cta: channel.cta, template: channel.template }} streams={streams} />
      </div>
      {latest.length > 0 && (
        <aside aria-labelledby="latest-h" className="flex flex-col gap-3 self-start rounded-lg border bg-card p-5">
          <h2 id="latest-h" className="kicker text-foreground">
            Recent issues
          </h2>
          <ul className="flex flex-col divide-y">
            {latest.map((c) => (
              <li key={c.id} className="flex flex-col gap-0.5 py-3 first:pt-0 last:pb-0">
                <span className="text-[15px] font-semibold leading-5">{c.subject}</span>
                <span className="text-[13px] text-muted-foreground">
                  {listEmailStreams(channel.id).find((s) => s.id === c.streamId)?.name} · {c.date.split(",")[0]}
                </span>
              </li>
            ))}
          </ul>
        </aside>
      )}
    </div>
  )
}

// params are URL data: read them inside Suspense so the shared App Shell stays instant.
export default function NewslettersPage({ params }: { params: Params }) {
  return (
    <Suspense fallback={<ChannelPageSkeleton variant="page" />}>
      <NewslettersContent params={params} />
    </Suspense>
  )
}
