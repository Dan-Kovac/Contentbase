import { Suspense } from "react"
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
  return <ArticleWriter key={article.id} article={article} channel={writerChannel(channel)} videos={embedVideos(channel.id)} />
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
