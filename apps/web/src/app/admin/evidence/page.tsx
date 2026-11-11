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
        description="Every ad request, the result of each lock and the reason code. Age-restricted impressions (alcohol, wagering) carry an evidence record per lock, written before the creative is returned. Target: zero age-restricted impressions outside a valid triple-lock session."
      />
      <EvidenceViewer decisions={listAdDecisions()} campaigns={listCampaigns()} />
    </div>
  )
}
