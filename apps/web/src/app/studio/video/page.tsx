import Link from "next/link"
import { ArrowRight, Coins, Plus } from "lucide-react"
import { PageHeader } from "@/components/shell/page-header"
import { StatusBadge } from "@/components/brand/status-badge"
import { Button } from "@/components/ui/button"
import { SceneFrame } from "@/components/studio/video/scene-frame"
import { brandKit } from "@/components/studio/video/brand"
import { buildStoryboard, clock } from "@/components/studio/video/storyboard"
import { FORMAT_INFO } from "@/lib/credits"
import { getArticle, getCreditAccount, listArticles, listMadeVideos, listVideoTemplates } from "@/lib/data"
import { currentPublication } from "@/lib/publication"

export const metadata = { title: "Video" }

/** Words to video: what you've made, what you could make next, and what it costs. */
export default async function VideoHubPage() {
  const channel = await currentPublication()
  const brand = brandKit(channel)
  const templates = listVideoTemplates()
  const made = listMadeVideos(channel.id)
  const credits = getCreditAccount()
  const ready = listArticles(channel.id).filter((a) => a.status === "published" && a.blocks.length > 2)

  return (
    <div className="grid grid-cols-1 gap-10">
      <PageHeader
        title="Video"
        description="Your videos become articles automatically. This goes the other way: write once, and get a long-form video for YouTube, a short for the feed or a clip for apps, in your brand and your voice."
        className="pb-0"
        actions={
          <Button variant="pop" asChild>
            <Link href="/studio/video/new">
              <Plus /> Make a video
            </Link>
          </Button>
        }
      />

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-[minmax(0,1fr)_320px]">
        <section aria-labelledby="next-h" className="min-w-0">
          <h2 id="next-h" className="mb-3 text-lg font-semibold tracking-[-0.2px]">
            Articles ready to become videos
          </h2>
          {ready.length ? (
            <ul className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              {ready.map((a) => {
                const scenes = buildStoryboard({ headline: a.headline, standfirst: a.standfirst, hero: a.hero, blocks: a.blocks }, "long", channel.cta.label)
                const chart = scenes.find((s) => s.rows) ?? scenes[1]
                return (
                  <li key={a.id} className="flex flex-col gap-3 rounded-lg border bg-card p-3">
                    <div className="grid grid-cols-2 gap-1.5" aria-hidden>
                      <SceneFrame scene={scenes[0]} index={0} template={templates[0]} brand={brand} ratio="16/9" captions={false} />
                      <SceneFrame scene={chart} index={1} template={templates[0]} brand={brand} ratio="16/9" captions={false} />
                    </div>
                    <p className="text-[15px] font-semibold leading-5">{a.headline}</p>
                    <p className="text-[13px] text-muted-foreground">
                      {scenes.length} scenes drafted · about {clock(scenes.reduce((n, s) => n + s.seconds, 0))} long-form, or a 60-second short
                    </p>
                    <Button asChild variant="outline" size="sm" className="mt-auto w-fit">
                      <Link href={`/studio/video/new?article=${a.id}`}>
                        Make a video <ArrowRight />
                      </Link>
                    </Button>
                  </li>
                )
              })}
            </ul>
          ) : (
            <p className="rounded-lg border border-dashed p-6 text-[14px] text-muted-foreground">
              Publish an article first, or paste any text into{" "}
              <Link href="/studio/video/new" className="font-semibold text-foreground underline-offset-4 hover:underline">
                Make a video
              </Link>
              .
            </p>
          )}
        </section>

        <aside className="flex flex-col gap-4" aria-label="Credits and templates">
          <Link href="/studio/credits" className="group flex flex-col gap-2 rounded-lg border bg-card p-4 outline-none hover:bg-accent/50 focus-visible:ring-2 focus-visible:ring-ring">
            <span className="flex items-center justify-between text-[13px] font-medium text-muted-foreground">
              <span className="flex items-center gap-2">
                <Coins className="size-4" aria-hidden /> AI credits
              </span>
              <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" aria-hidden />
            </span>
            <span className="text-[30px] font-bold leading-9 tracking-[-0.6px]">{credits.balance.toLocaleString("en-AU")}</span>
            <span className="text-xs leading-[18px] text-muted-foreground">
              A short costs about 45 credits, a 5-minute explainer about 150. Shared by every publication on your account.
            </span>
          </Link>
          <Link href="/studio/video/templates" className="group flex flex-col gap-2 rounded-lg border bg-card p-4 outline-none hover:bg-accent/50 focus-visible:ring-2 focus-visible:ring-ring">
            <span className="flex items-center justify-between text-[13px] font-medium text-muted-foreground">
              Templates
              <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" aria-hidden />
            </span>
            <span className="text-[15px] font-semibold">
              {templates.filter((t) => t.owned).length} included · {templates.filter((t) => !t.owned).length} more to add
            </span>
            <span className="text-xs leading-[18px] text-muted-foreground">Every template takes your colours, type, logo and voice.</span>
          </Link>
        </aside>
      </div>

      <section aria-labelledby="made-h">
        <h2 id="made-h" className="mb-3 text-lg font-semibold tracking-[-0.2px]">
          Made from words
        </h2>
        {made.length ? (
          <ul className="divide-y rounded-lg border bg-card">
            {made.map((v) => {
              const t = templates.find((x) => x.id === v.templateId)!
              const src = v.sourceArticleId ? getArticle(v.sourceArticleId) : undefined
              return (
                <li key={v.id} className="flex flex-wrap items-center gap-4 p-3 sm:px-4">
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-sm font-semibold">{v.title}</span>
                    <span className="mt-0.5 block text-xs text-muted-foreground">
                      {FORMAT_INFO[v.format].label} · {clock(v.seconds)} · {t.name} · {v.createdAt}
                      {src && ` · from “${src.headline}”`}
                    </span>
                  </span>
                  <StatusBadge tone={v.status === "published" ? "published" : "ready"} />
                  <span className="w-24 text-right text-[13px] text-muted-foreground tabular-nums">{v.credits} credits</span>
                </li>
              )
            })}
          </ul>
        ) : (
          <p className="rounded-lg border border-dashed p-6 text-[14px] text-muted-foreground">Nothing yet. Your first video takes about two minutes.</p>
        )}
      </section>
    </div>
  )
}
