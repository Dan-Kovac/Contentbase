
import { currentPublication } from "@/lib/publication"
import { ArticleWriter } from "@/components/studio/articles/article-writer"
import { embedVideos, writerChannel } from "@/components/studio/editor/channel-props"

export const metadata = { title: "Write an article" }

export default async function NewArticlePage() {
  const channel = (await currentPublication())
  return <ArticleWriter article={null} channel={writerChannel(channel)} videos={embedVideos(channel.id)} />
}
