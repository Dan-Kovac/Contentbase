import { Suspense } from "react"
import { notFound } from "next/navigation"
import { allShorts, allVideos, getChannelById, getVideo } from "@/lib/data"
import { Skeleton } from "@/components/ui/skeleton"
import { ReviewWorkspace } from "@/components/studio/review/workspace"

const REVIEWABLE = new Set(["ready", "draft", "scheduled", "published"])

export function generateStaticParams() {
  return allVideos()
    .filter((v) => REVIEWABLE.has(v.status))
    .map((v) => ({ id: v.id }))
}

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const v = getVideo(id)
  return { title: v ? `Review: ${v.article.headline}` : "Review" }
}

export default function ReviewPage({ params }: { params: Promise<{ id: string }> }) {
  return (
    <Suspense fallback={<WorkspaceSkeleton />}>
      <Workspace params={params} />
    </Suspense>
  )
}

async function Workspace({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const video = getVideo(id)
  if (!video || !REVIEWABLE.has(video.status)) notFound()
  const channel = getChannelById(video.channelId)!
  const shorts = allShorts().filter((s) => video.shorts.includes(s.id))
  return (
    <ReviewWorkspace
      key={video.id}
      video={video}
      channel={{ name: channel.name, slug: channel.slug, domain: channel.customDomain ?? `${channel.slug}.homestand.com.au` }}
      shorts={shorts}
    />
  )
}

function WorkspaceSkeleton() {
  return (
    <div className="grid gap-6" aria-busy="true" aria-label="Loading the review">
      <Skeleton className="h-4 w-28" />
      <Skeleton className="h-9 w-2/3" />
      <Skeleton className="h-10 w-full" />
      <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_320px]">
        <div className="grid gap-3">
          <Skeleton className="h-14" />
          <Skeleton className="h-14" />
          <Skeleton className="h-40" />
        </div>
        <Skeleton className="aspect-video" />
      </div>
    </div>
  )
}
