import type { Metadata } from "next"
import { PageHeader } from "@/components/shell/page-header"
import { ChannelsTable } from "@/components/admin/channels-table"
import { listChannels } from "@/lib/data"

export const metadata: Metadata = { title: "Channels" }

export default function ChannelsPage() {
  return (
    <div>
      <PageHeader
        title="Channels"
        description="Mode, plan and the notable-person flag for every channel. Age-verified channels can carry alcohol and wagering ads behind the triple lock; flagged channels are kept out of wagering-linked revenue. Every action here is logged."
      />
      <ChannelsTable channels={listChannels()} />
    </div>
  )
}
