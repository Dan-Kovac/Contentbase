import { Suspense } from "react"
import { notFound } from "next/navigation"
import { allPages, getChannelById, getPage, listPages } from "@/lib/data"
import { Skeleton } from "@/components/ui/skeleton"
import { PageEditor } from "@/components/studio/pages/page-editor"
import { channelDomain, embedVideos } from "@/components/studio/editor/channel-props"

export function generateStaticParams() {
  return allPages().map((p) => ({ id: p.id }))
}

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  return { title: getPage(id)?.title ?? "Page" }
}

export default function EditPagePage({ params }: { params: Promise<{ id: string }> }) {
  return (
    <Suspense
      fallback={
        <div className="grid gap-6" aria-busy="true" aria-label="Loading the page editor">
          <Skeleton className="h-4 w-16" />
          <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_320px]">
            <div className="grid gap-3">
              <Skeleton className="h-10 w-1/2" />
              <Skeleton className="h-40" />
            </div>
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
  const page = getPage(id)
  if (!page) notFound()
  const channel = getChannelById(page.channelId)!
  return (
    <PageEditor
      key={page.id}
      page={page}
      channel={{
        name: channel.name,
        slug: channel.slug,
        domain: channelDomain(channel),
        owner: channel.owner,
        navCount: channel.nav.length - (page.inNav ? 1 : 0),
        takenSlugs: listPages(channel.id).filter((p) => p.id !== page.id).map((p) => p.slug),
      }}
      videos={embedVideos(channel.id)}
    />
  )
}
