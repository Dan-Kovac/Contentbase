import type { Metadata } from "next"
import { PageHeader } from "@/components/shell/page-header"
import { ReviewQueue } from "@/components/admin/review-queue"
import { listCreatives } from "@/lib/data"

export const metadata: Metadata = { title: "Creative review" }

export default function ReviewPage() {
  return (
    <div>
      <PageHeader
        title="Creative review"
        description="Every creative is checked before it can serve. Wagering creatives are checked for odds, notable persons, the responsible gambling message, inducements and harmful content. Target: reviewed within 1 business day."
      />
      <ReviewQueue creatives={listCreatives()} />
    </div>
  )
}
