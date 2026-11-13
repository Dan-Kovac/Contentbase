import { Suspense } from "react"
import { PageHeader } from "@/components/shell/page-header"
import { EmailBuilder } from "@/components/studio/email/builder"
import { channelStories } from "@/components/channel/lib"
import { getSendingDomain, listEmailStreams } from "@/lib/data"
import { currentPublication } from "@/lib/publication"

export const metadata = { title: "New email" }

type Search = Promise<{ stream?: string }>

async function Builder({ searchParams }: { searchParams: Search }) {
  const { stream } = await searchParams
  const channel = await currentPublication()
  const domain = getSendingDomain(channel.id)
  const site = channel.customDomain ?? `${channel.slug}.homestand.com.au`
  const stories = channelStories(channel)
    .slice(0, 4)
    .map((s) => ({ kicker: s.sectionLabel, headline: s.headline, standfirst: s.standfirst, image: s.poster, href: `https://${site}${s.href.replace(`/c/${channel.slug}`, "")}` }))
  return (
    <EmailBuilder
      streams={listEmailStreams(channel.id).map(({ id, name, subscribers }) => ({ id, name, subscribers }))}
      brand={{ name: channel.name, accentHex: channel.accentHex, domain: domain?.domain ?? site, postalAddress: domain?.postalAddress ?? "" }}
      stories={stories}
      initialStream={stream}
      editor={channel.slug === "footyfix" ? "Sam and Jess" : `The ${channel.name} team`}
      testTo={domain?.replyTo ?? "you@example.com"}
    />
  )
}

export default function NewEmailPage({ searchParams }: { searchParams: Search }) {
  return (
    <div>
      <PageHeader
        title="New email"
        description="Build it from blocks in your brand, or paste your own HTML. We add the footer every email needs and check it before it goes."
      />
      <Suspense fallback={<div className="h-[600px] animate-pulse rounded-lg bg-muted" />}>
        <Builder searchParams={searchParams} />
      </Suspense>
    </div>
  )
}
