import type { Metadata } from "next"
import { PageHeader } from "@/components/shell/page-header"
import { ReviewQueue } from "@/components/admin/review-queue"
import { listCampaigns, listCreatives, listSponsors } from "@/lib/data"

export const metadata: Metadata = { title: "Creative review" }

export default function ReviewPage() {
  return (
    <div>
      <PageHeader
        title="Creative review"
        description="Every creative is checked in its native format before it can serve. Age-restricted creatives (alcohol, wagering) also get the checks for their category: no appeal to under-18s, no inducements, the required responsible-use message, and for wagering, no odds or notable persons. Target: reviewed within 1 business day."
      />
      <ReviewQueue creatives={listCreatives()} campaigns={listCampaigns()} sponsors={listSponsors()} />
    </div>
  )
}
