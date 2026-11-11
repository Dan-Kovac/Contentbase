import { DEMO_CHANNEL_SLUG, getChannel } from "@/lib/data"
import { ArticleWriter } from "@/components/studio/articles/article-writer"
import { embedVideos, writerChannel } from "@/components/studio/editor/channel-props"

export const metadata = { title: "Write an article" }

export default function NewArticlePage() {
  const channel = getChannel(DEMO_CHANNEL_SLUG)!
  return <ArticleWriter article={null} channel={writerChannel(channel)} videos={embedVideos(channel.id)} />
}
