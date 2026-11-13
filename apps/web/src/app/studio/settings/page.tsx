import { PageHeader } from "@/components/shell/page-header"
import { ChannelForm } from "@/components/settings/channel-form"

import { currentPublication } from "@/lib/publication"

export const metadata = { title: "Channel settings" }

export default async function ChannelSettingsPage() {
  const channel = (await currentPublication())
  return (
    <div className="mx-auto max-w-[1040px]">
      <PageHeader title="Channel" description="The basics: your name, your address, your sections." />
      <ChannelForm channel={channel} />
    </div>
  )
}
