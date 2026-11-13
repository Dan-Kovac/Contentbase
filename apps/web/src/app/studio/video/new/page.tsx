import { Suspense } from "react"
import { PageHeader } from "@/components/shell/page-header"
import { VideoComposer } from "@/components/studio/video/composer"
import { brandKit } from "@/components/studio/video/brand"
import { getCreditAccount, listArticles, listVideoTemplates } from "@/lib/data"
import { currentPublication } from "@/lib/publication"

export const metadata = { title: "Make a video" }

type Search = Promise<{ article?: string }>

async function Composer({ searchParams }: { searchParams: Search }) {
  const { article } = await searchParams
  const channel = await currentPublication()
  const articles = listArticles(channel.id)
    .filter((a) => a.blocks.length > 2)
    .map((a) => ({ id: a.id, headline: a.headline, standfirst: a.standfirst, hero: a.hero, blocks: a.blocks }))
  return (
    <VideoComposer
      articles={articles}
      templates={listVideoTemplates()}
      brand={brandKit(channel)}
      cta={channel.cta.label}
      voiceTone={channel.voice.tone}
      balance={getCreditAccount().balance}
      initialArticle={article}
    />
  )
}

export default function MakeVideoPage({ searchParams }: { searchParams: Search }) {
  return (
    <div>
      <PageHeader
        title="Make a video"
        description="Turn an article into a video in your brand: voiceover, charts, tables and big type. Edit the script scene by scene, then generate. You review it before anything goes live."
      />
      <Suspense fallback={<div className="h-[600px] animate-pulse rounded-lg bg-muted" />}>
        <Composer searchParams={searchParams} />
      </Suspense>
    </div>
  )
}
