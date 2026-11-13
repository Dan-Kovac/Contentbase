import { PageHeader } from "@/components/shell/page-header"
import { TemplateShop } from "@/components/studio/video/template-shop"
import { brandKit } from "@/components/studio/video/brand"
import { buildStoryboard } from "@/components/studio/video/storyboard"
import { listArticles, listVideoTemplates } from "@/lib/data"
import { currentPublication } from "@/lib/publication"

export const metadata = { title: "Video templates" }

export default async function TemplatesPage() {
  const channel = await currentPublication()
  const article = listArticles(channel.id).find((a) => a.blocks.length > 2)
  const scenes = article
    ? buildStoryboard({ headline: article.headline, standfirst: article.standfirst, hero: article.hero, blocks: article.blocks }, "long", channel.cta.label)
    : []
  // Show a title, a chart (or a point) and a quote where the article has them.
  const samples = [scenes[0], scenes.find((s) => s.rows) ?? scenes[1], scenes.find((s) => s.kind === "quote") ?? scenes[2]].filter(Boolean)
  return (
    <div>
      <PageHeader
        title="Video templates"
        description={`Each template is shown here in ${channel.name}'s brand, with a scene from your own article. Three come with every plan; add more once and use them on every publication.`}
      />
      <TemplateShop templates={listVideoTemplates()} brand={brandKit(channel)} samples={samples} />
    </div>
  )
}
