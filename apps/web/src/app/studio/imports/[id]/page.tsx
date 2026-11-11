import { Suspense } from "react"
import { notFound } from "next/navigation"
import { ImportReport, type PageMapRow } from "@/components/imports/import-report"
import { Skeleton } from "@/components/ui/skeleton"
import { DEMO_CHANNEL_SLUG, listChannels, listImportJobs, listVideos } from "@/lib/data"

function allJobs() {
  return listChannels().flatMap((c) => listImportJobs(c.id).map((job) => ({ job, channel: c })))
}

export function generateStaticParams() {
  return allJobs().map(({ job }) => ({ id: job.id }))
}

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const found = allJobs().find((j) => j.job.id === id)
  return { title: found ? `Import report: ${found.job.label}` : "Import report" }
}

// Sample redirect map for site imports. In production this comes from the job's redirect table.
const WP_REDIRECTS: { from: string; slug: string }[] = [
  { from: "/2026/10/cox-plate-barrier-draw-explained/", slug: "cox-plate-draw" },
  { from: "/2026/11/trainer-of-the-week-flemington-double/", slug: "trainer-of-the-week-waller" },
  { from: "/category/form/", slug: "s/form" },
  { from: "/2025/03/golden-slipper-day-form-guide/", slug: "golden-slipper-form-guide" },
  { from: "/?p=10482", slug: "melbourne-cup-international-raiders" },
  { from: "/author/trackside-desk/", slug: "about" },
]

async function Report({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const found = allJobs().find((j) => j.job.id === id)
  if (!found) notFound()
  const { job, channel } = found
  const domain = channel.customDomain ?? `${channel.slug}.homestand.com.au`

  let pageMap: PageMapRow[]
  if (job.source === "youtube") {
    pageMap = listVideos(channel.id)
      .filter((v) => v.youtubeId)
      .slice(0, job.status === "running" ? job.imported : 6)
      .map((v) => ({ from: `youtube.com/watch?v=${v.youtubeId}`, to: `${domain}/v/${v.slug}` }))
  } else {
    const oldHost = job.label.split(": ")[1] ?? "oldsite.com.au"
    pageMap = WP_REDIRECTS.map((r) => ({
      from: `${oldHost}${r.from}`,
      to: `${domain}/${r.slug.startsWith("s/") || r.slug === "about" ? r.slug : `a/${r.slug}`}`,
    }))
  }

  const skippedNote =
    job.source === "youtube"
      ? job.skipped
        ? "4 private or unlisted videos, and 2 already on your channel as uploads. Make a video public on YouTube to include it next time."
        : "Nothing was skipped."
      : "Drafts, trashed posts and empty pages in WordPress aren't imported. Publish them first if you want them."

  return (
    <ImportReport
      job={job}
      channelName={channel.name}
      domain={domain}
      isExample={channel.slug !== DEMO_CHANNEL_SLUG}
      skippedNote={skippedNote}
      pageMap={pageMap}
      pageMapKind={job.source === "youtube" ? "pages" : "redirect"}
      crawledAt={job.source === "youtube" ? "28 October 2026, 6:40 pm" : "30 October 2026, 4:15 pm"}
    />
  )
}

export default function ImportReportPage({ params }: { params: Promise<{ id: string }> }) {
  return (
    <div className="mx-auto max-w-[1120px]">
      <Suspense
        fallback={
          <div className="grid gap-4">
            <Skeleton className="h-12 w-2/3" />
            <Skeleton className="h-32 w-full" />
            <Skeleton className="h-64 w-full" />
          </div>
        }
      >
        <Report params={params} />
      </Suspense>
    </div>
  )
}
