import { PageHeader } from "@/components/shell/page-header"
import { Connections } from "@/components/settings/connections"
import { DEMO_CHANNEL_SLUG, getChannel } from "@/lib/data"

export const metadata = { title: "Connections" }

export default function ConnectionsPage() {
  const channel = getChannel(DEMO_CHANNEL_SLUG)!
  return (
    <div className="mx-auto max-w-[1040px]">
      <PageHeader title="Connections" description="Where your videos come from. Connect once and new uploads arrive as drafts for you to review." />
      <Connections channel={channel} />
    </div>
  )
}
