import type { Metadata } from "next"
import { PageHeader } from "@/components/shell/page-header"
import { EvidenceViewer } from "@/components/admin/evidence-viewer"
import { listAdDecisions, listCampaigns } from "@/lib/data"

export const metadata: Metadata = { title: "Ad decisions and evidence" }

export default function EvidencePage() {
  return (
    <div>
      <PageHeader
        title="Ad decisions and evidence"
        description="Every ad request, the result of each lock and the reason code. Wagering impressions carry a separate evidence record per lock, written before the creative is returned."
      />
      <EvidenceViewer decisions={listAdDecisions()} campaigns={listCampaigns()} />
    </div>
  )
}
