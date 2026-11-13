import Link from "next/link"
import { ArrowRight, Newspaper, PenLine } from "lucide-react"
import { PageHeader } from "@/components/shell/page-header"
import { StatusBadge } from "@/components/brand/status-badge"
import { Button } from "@/components/ui/button"
import { listArticles, listVideos } from "@/lib/data"
import { currentPublication } from "@/lib/publication"
import { sectionLabel } from "@/components/studio/lib"

export const metadata = { title: "Articles" }

export default async function ArticlesPage() {
  const channel = (await currentPublication())
  const articles = listArticles(channel.id)
  const fromVideos = listVideos(channel.id).filter((v) => v.status !== "processing").length
  const cols = "md:grid-cols-[minmax(0,1fr)_130px_90px_130px_150px]"

  return (
    <div className="grid grid-cols-1 gap-8">
      <PageHeader
        title="Articles"
        description="Pieces you write yourself: columns, ladders, previews and news that don't start from a video. They sit alongside your video articles on the channel."
        className="pb-0"
        actions={
          <Button asChild>
            <Link href="/studio/articles/new">
              <PenLine /> Write an article
            </Link>
          </Button>
        }
      />

      <section aria-labelledby="written-h">
        <h2 id="written-h" className="sr-only">
          Written articles
        </h2>
        <div className="overflow-hidden rounded-lg border bg-card">
          <div className={`hidden gap-4 border-b px-4 py-2.5 text-xs font-medium text-muted-foreground md:grid ${cols}`} aria-hidden>
            <span>Article</span>
            <span>Status</span>
            <span>Section</span>
            <span>Author</span>
            <span>Date</span>
          </div>
          <ul className="divide-y">
            {articles.map((a) => (
              <li key={a.id}>
                <Link
                  href={`/studio/articles/${a.id}`}
                  className={`grid gap-x-4 gap-y-2 px-4 py-3 transition-colors hover:bg-accent/60 focus-visible:bg-accent focus-visible:outline-none md:items-center ${cols}`}
                >
                  <div className="flex min-w-0 items-center gap-3">
                    <div className="relative aspect-video w-[88px] shrink-0 overflow-hidden rounded-md bg-muted">
                      {a.hero ? (
                        // eslint-disable-next-line @next/next/no-img-element -- prototype media
                        <img src={a.hero} alt="" className="absolute inset-0 size-full object-cover" loading="lazy" />
                      ) : (
                        <span className="grid size-full place-items-center text-muted-foreground">
                          <Newspaper className="size-4" aria-hidden />
                        </span>
                      )}
                    </div>
                    <div className="min-w-0">
                      <p className="line-clamp-2 text-sm font-semibold leading-5">{a.headline}</p>
                      <p className="mt-0.5 line-clamp-1 text-xs text-muted-foreground">{a.standfirst}</p>
                    </div>
                  </div>
                  <div className="flex flex-wrap items-center gap-x-2 gap-y-1 pl-[100px] text-xs text-muted-foreground md:contents">
                    <span className="md:text-sm">
                      <StatusBadge tone={a.status} />
                    </span>
                    <span className="md:text-sm">{sectionLabel(a.section)}</span>
                    <span className="md:text-sm md:text-foreground">
                      <span className="md:hidden">· </span>
                      {a.author}
                    </span>
                    <span className="tabular md:text-sm">
                      <span className="md:hidden">· </span>
                      {a.publishedAt ?? `${a.readMinutes} min read · not published`}
                    </span>
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        </div>
        <p className="mt-2 text-xs text-muted-foreground">
          {articles.length} written {articles.length === 1 ? "article" : "articles"}
        </p>
      </section>

      <section className="flex flex-col gap-4 rounded-lg border bg-card p-4 sm:flex-row sm:items-center sm:p-5" aria-labelledby="video-articles-h">
        <div className="min-w-0 flex-1">
          <h2 id="video-articles-h" className="text-sm font-semibold">
            Articles from your videos
          </h2>
          <p className="mt-1 text-[13px] leading-5 text-muted-foreground">
            Every video comes with an article draft. You have {fromVideos} of them, reviewed with the video in Ready to review and listed in the Library.
          </p>
        </div>
        <Button variant="outline" asChild className="self-start sm:self-auto">
          <Link href="/studio/library">
            Open the Library <ArrowRight />
          </Link>
        </Button>
      </section>
    </div>
  )
}
