import { Suspense } from "react"
import { DEMO_CHANNEL_SLUG, getChannel, listPages } from "@/lib/data"
import { Skeleton } from "@/components/ui/skeleton"
import { PageEditor } from "@/components/studio/pages/page-editor"
import { channelDomain, embedVideos } from "@/components/studio/editor/channel-props"

export const metadata = { title: "New page" }

export default function NewPagePage({ searchParams }: { searchParams: Promise<{ template?: string }> }) {
  return (
    <Suspense fallback={<EditorSkeleton />}>
      <Editor searchParams={searchParams} />
    </Suspense>
  )
}

async function Editor({ searchParams }: { searchParams: Promise<{ template?: string }> }) {
  const { template } = await searchParams
  const channel = getChannel(DEMO_CHANNEL_SLUG)!
  return (
    <PageEditor
      key={template ?? "blank"}
      page={null}
      templateId={template}
      channel={{
        name: channel.name,
        slug: channel.slug,
        domain: channelDomain(channel),
        owner: channel.owner,
        navCount: channel.nav.length,
        takenSlugs: listPages(channel.id).map((p) => p.slug),
      }}
      videos={embedVideos(channel.id)}
    />
  )
}

function EditorSkeleton() {
  return (
    <div className="grid gap-6" aria-busy="true" aria-label="Loading the page editor">
      <Skeleton className="h-4 w-16" />
      <Skeleton className="h-5 w-24" />
      <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_320px]">
        <div className="grid gap-3">
          <Skeleton className="h-10 w-1/2" />
          <Skeleton className="h-14" />
          <Skeleton className="h-40" />
        </div>
        <Skeleton className="h-64" />
      </div>
    </div>
  )
}
