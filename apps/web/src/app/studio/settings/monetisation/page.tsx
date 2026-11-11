import { PageHeader } from "@/components/shell/page-header"
import { Monetisation } from "@/components/settings/monetisation"
import { DEMO_CHANNEL_SLUG, getChannel, listSponsors } from "@/lib/data"

export const metadata = { title: "Monetisation" }

export default function MonetisationPage() {
  const channel = getChannel(DEMO_CHANNEL_SLUG)!
  return (
    <div className="mx-auto max-w-[1040px]">
      <PageHeader title="Monetisation" description="Choose whether age-restricted advertisers can reach your verified adults, and which ads you'll accept. Homestand sells and places every ad." />
      <Monetisation channel={channel} sponsors={listSponsors()} />
    </div>
  )
}
