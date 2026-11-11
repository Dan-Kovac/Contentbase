import { Suspense } from "react"
import { notFound } from "next/navigation"
import { allShorts, getShort, getVideo } from "@/lib/data"
import { Skeleton } from "@/components/ui/skeleton"
import { ShortsEditor } from "@/components/studio/shorts-editor"

export function generateStaticParams() {
  return allShorts().map((s) => ({ id: s.id }))
}

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  return { title: getShort(id)?.title ?? "Short" }
}

export default function ShortPage({ params }: { params: Promise<{ id: string }> }) {
  return (
    <Suspense
      fallback={
        <div className="grid gap-6" aria-busy="true" aria-label="Loading the short">
          <Skeleton className="h-8 w-1/2" />
          <div className="grid gap-10 md:grid-cols-[300px_1fr]">
            <Skeleton className="aspect-[9/16]" />
            <Skeleton className="h-64" />
          </div>
        </div>
      }
    >
      <Editor params={params} />
    </Suspense>
  )
}

async function Editor({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const short = getShort(id)
  if (!short) notFound()
  const v = short.videoId ? getVideo(short.videoId) : undefined
  return (
    <ShortsEditor
      key={short.id}
      short={short}
      parent={
        v && {
          id: v.id,
          title: v.title,
          slug: v.slug,
          source: v.source,
          durationSec: v.durationSec,
          posterTone: v.posterTone,
          transcript: v.transcript,
        }
      }
    />
  )
}
