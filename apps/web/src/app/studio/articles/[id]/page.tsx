import { Suspense } from "react"
import Link from "next/link"
import { ArrowRight } from "lucide-react"
import { notFound } from "next/navigation"
import { allArticles, getArticle, getChannelById } from "@/lib/data"
import { Skeleton } from "@/components/ui/skeleton"
import { ArticleWriter } from "@/components/studio/articles/article-writer"
import { embedVideos, writerChannel } from "@/components/studio/editor/channel-props"

export function generateStaticParams() {
  return allArticles().map((a) => ({ id: a.id }))
}

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  return { title: getArticle(id)?.headline ?? "Article" }
}

export default function ArticlePage({ params }: { params: Promise<{ id: string }> }) {
  return (
    <Suspense fallback={<WriterSkeleton />}>
      <Writer params={params} />
    </Suspense>
  )
}

async function Writer({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const article = getArticle(id)
  if (!article) notFound()
  const channel = getChannelById(article.channelId)!
  return (
    <>
      {article.status === "published" && (
        <p className="mb-6 flex flex-wrap items-center justify-between gap-3 rounded-lg border bg-card px-4 py-3 text-[14px]">
          <span className="text-muted-foreground">
            <span className="font-semibold text-foreground">Make a video from this article.</span> A long-form explainer or a short, in {channel.name}&apos;s brand and voice.
          </span>
          <Link href={`/studio/video/new?article=${article.id}`} className="inline-flex items-center gap-1 font-semibold underline-offset-4 hover:underline">
            Make a video <ArrowRight className="size-4" aria-hidden />
          </Link>
        </p>
      )}
      <ArticleWriter key={article.id} article={article} channel={writerChannel(channel)} videos={embedVideos(channel.id)} />
    </>
  )
}

function WriterSkeleton() {
  return (
    <div className="grid gap-6" aria-busy="true" aria-label="Loading the article">
      <Skeleton className="h-4 w-20" />
      <Skeleton className="h-9 w-2/3" />
      <Skeleton className="h-10 w-full" />
      <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_320px]">
        <div className="grid gap-3">
          <Skeleton className="aspect-video" />
          <Skeleton className="h-14" />
          <Skeleton className="h-40" />
        </div>
        <Skeleton className="h-64" />
      </div>
    </div>
  )
}
