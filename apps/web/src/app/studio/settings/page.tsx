import { PageHeader } from "@/components/shell/page-header"
import { ChannelForm } from "@/components/settings/channel-form"
import { DEMO_CHANNEL_SLUG, getChannel } from "@/lib/data"

export const metadata = { title: "Channel settings" }

export default function ChannelSettingsPage() {
  const channel = getChannel(DEMO_CHANNEL_SLUG)!
  return (
    <div className="mx-auto max-w-[1040px]">
      <PageHeader title="Channel" description="The basics: your name, your address, your sections." />
      <ChannelForm channel={channel} />
    </div>
  )
}
