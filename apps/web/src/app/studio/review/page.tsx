import Link from "next/link"
import { Upload } from "lucide-react"
import { PageHeader } from "@/components/shell/page-header"
import { Button } from "@/components/ui/button"
import { listVideos } from "@/lib/data"
import { currentPublication } from "@/lib/publication"
import { ReviewQueue } from "@/components/studio/review-queue"
import { toPack } from "@/components/studio/lib"

export const metadata = { title: "Ready to review" }

export default async function ReviewQueuePage() {
  const channel = await currentPublication()
  const packs = listVideos(channel.id, "ready").map((v) => toPack(v, channel.name))
  const flagged = packs.filter((p) => p.flags.length).length

  return (
    <div>
      <PageHeader
        title="Ready to review"
        description={
          <>
            Each new YouTube upload arrives here as a draft pack: a video page, an article, shorts and SEO. Check it, then publish.
            Nothing goes live until you do.
            {flagged > 0 && <> {flagged === 1 ? "One pack has" : `${flagged} packs have`} compliance flags to resolve first.</>}
          </>
        }
        actions={
          <Button variant="outline" asChild>
            <Link href="/studio/upload">
              <Upload /> Upload a file
            </Link>
          </Button>
        }
      />
      <ReviewQueue packs={packs} />
    </div>
  )
}
