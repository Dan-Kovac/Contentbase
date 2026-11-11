import { PageHeader } from "@/components/shell/page-header"
import { Monetisation } from "@/components/settings/monetisation"
import { DEMO_CHANNEL_SLUG, getChannel } from "@/lib/data"

export const metadata = { title: "Monetisation" }

export default function MonetisationPage() {
  const channel = getChannel(DEMO_CHANNEL_SLUG)!
  return (
    <div className="mx-auto max-w-[1040px]">
      <PageHeader title="Monetisation" description="Choose your channel mode and which ads you'll accept. Homestand sells and places every ad." />
      <Monetisation channel={channel} />
    </div>
  )
}
