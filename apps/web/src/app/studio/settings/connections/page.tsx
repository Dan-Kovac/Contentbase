import { PageHeader } from "@/components/shell/page-header"
import { Connections } from "@/components/settings/connections"

import { currentPublication } from "@/lib/publication"

export const metadata = { title: "Connections" }

export default async function ConnectionsPage() {
  const channel = (await currentPublication())
  return (
    <div className="mx-auto max-w-[1040px]">
      <PageHeader title="Connections" description="Where your videos come from. Connect once and new uploads arrive as drafts for you to review." />
      <Connections channel={channel} />
    </div>
  )
}
