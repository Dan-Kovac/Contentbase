// Server-side helpers that shape channel data for the studio editors.
import { listArticles, listVideos } from "@/lib/data"
import type { Channel } from "@/lib/types"
import type { EmbedVideo } from "./block-editor"

export function channelDomain(c: Channel) {
  return c.customDomain ?? `${c.slug}.homestand.com.au`
}

export function writerChannel(c: Channel) {
  const authors = [c.owner, ...listArticles(c.id).map((a) => a.author), ...listVideos(c.id).map((v) => v.article.author)]
  return {
    name: c.name,
    slug: c.slug,
    domain: channelDomain(c),
    sections: c.sections,
    authors: authors.filter((a, i) => a && authors.indexOf(a) === i),
  }
}

/** Published and scheduled videos that can be embedded in a page or article. */
export function embedVideos(channelId: string): EmbedVideo[] {
  return listVideos(channelId, ["published", "scheduled", "ready"]).map((v) => ({
    id: v.id,
    title: v.title,
    poster: v.poster,
    tone: v.posterTone,
    durationSec: v.durationSec,
  }))
}
