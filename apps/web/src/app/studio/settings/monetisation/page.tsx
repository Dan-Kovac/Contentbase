import Link from "next/link"
import { ArrowRight } from "lucide-react"
import { PageHeader } from "@/components/shell/page-header"
import { Monetisation } from "@/components/settings/monetisation"
import { getEarnings, listSponsors } from "@/lib/data"
import { currentPublication } from "@/lib/publication"

export const metadata = { title: "Monetisation" }

const aud = (n: number) => `$${n.toLocaleString("en-AU")}`

export default async function MonetisationPage() {
  const channel = await currentPublication()
  const earn = getEarnings(channel.id)
  return (
    <div className="mx-auto max-w-[1040px]">
      <PageHeader title="Monetisation" description="Choose whether age-restricted advertisers can reach your verified adults, and which ads you'll accept. Homestand sells and places every ad." />
      {earn && (
        // What the settings below earn, first: the reason to switch age-verified advertising on.
        <Link
          href="/studio/analytics#earnings"
          className="group mb-8 grid gap-4 rounded-lg border bg-card p-5 outline-none transition-colors hover:bg-accent/40 focus-visible:ring-2 focus-visible:ring-ring sm:grid-cols-[auto_1fr_auto] sm:items-center sm:gap-8"
        >
          <span className="flex flex-col">
            <span className="text-[13px] font-medium text-muted-foreground">Sponsor earnings, 30 days</span>
            <span className="text-[30px] font-bold leading-9 tracking-[-0.6px]">{aud(earn.total)}</span>
          </span>
          <span className="text-[14px] leading-[21px] text-muted-foreground">
            <span className="font-semibold text-foreground">{aud(earn.ageVerified)}</span> of it came from age-verified sponsors, which only show because {channel.name} runs in
            Age-verified mode. Sample data.
          </span>
          <span className="inline-flex items-center gap-1 text-[14px] font-semibold">
            See earnings <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" aria-hidden />
          </span>
        </Link>
      )}
      <Monetisation channel={channel} sponsors={listSponsors()} />
    </div>
  )
}
