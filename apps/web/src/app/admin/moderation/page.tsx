import type { Metadata } from "next"
import { PageHeader } from "@/components/shell/page-header"
import { ModerationQueue } from "@/components/admin/moderation-queue"
import { reports } from "@/components/admin/data"

export const metadata: Metadata = { title: "Moderation" }

export default function ModerationPage() {
  return (
    <div>
      <PageHeader
        title="Moderation"
        description="Viewer reports from every channel. Take content down with a notice to the creator, or dismiss with a reason."
      />
      <ModerationQueue reports={reports} />
    </div>
  )
}
