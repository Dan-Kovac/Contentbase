import Link from "next/link"
import { PenLine, Upload } from "lucide-react"
import { PageHeader } from "@/components/shell/page-header"
import { Button } from "@/components/ui/button"
import { DEMO_CHANNEL_SLUG, getChannel, listArticles, listShorts, listVideos } from "@/lib/data"
import { formatDuration } from "@/lib/format"
import type { Video } from "@/lib/types"
import { LibraryTable, type LibraryRow } from "@/components/studio/library-table"
import { sectionLabel } from "@/components/studio/lib"

export const metadata = { title: "Library" }

const REVIEWABLE = new Set(["ready", "draft", "scheduled", "published"])

function dateFor(v: Video) {
  if (v.status === "published") return v.publishedAt ?? v.sourcePublishedAt
  if (v.status === "scheduled") return v.scheduledFor ?? v.sourcePublishedAt
  return v.sourcePublishedAt
}

export default function LibraryPage() {
  const channel = getChannel(DEMO_CHANNEL_SLUG)!
  const videos = listVideos(channel.id)
  const rows: LibraryRow[] = [
    ...videos.map<LibraryRow>((v) => ({
      id: v.id,
      kind: "video",
      title: v.title,
      status: v.status,
      section: sectionLabel(v.section),
      date: dateFor(v),
      views: v.views,
      tone: v.posterTone,
      src: v.poster,
      durationSec: v.durationSec,
      exclusive: v.exclusive,
      href: REVIEWABLE.has(v.status) ? `/studio/review/${v.id}` : undefined,
      meta: `${formatDuration(v.durationSec)} · ${v.source === "youtube" ? "YouTube" : "Upload"}`,
    })),
    ...videos.map<LibraryRow>((v) => ({
      id: v.id,
      kind: "article",
      title: v.article.headline,
      status: v.status,
      section: sectionLabel(v.section),
      date: dateFor(v),
      views: Math.round(v.views * 0.38),
      tone: v.posterTone,
      src: v.poster,
      exclusive: v.exclusive,
      href: REVIEWABLE.has(v.status) ? `/studio/review/${v.id}` : undefined,
      meta: v.status === "processing" ? "Drafting from the video" : `From the video · ${v.article.author} · ${v.article.readMinutes} min read`,
    })),
    ...listArticles(channel.id).map<LibraryRow>((a) => ({
      id: a.id,
      kind: "article",
      title: a.headline,
      status: a.status,
      section: sectionLabel(a.section),
      date: a.publishedAt ?? "–",
      views: a.status === "published" ? 18400 : 0,
      tone: "#262626",
      src: a.hero,
      exclusive: false,
      href: `/studio/articles/${a.id}`,
      meta: `Written article · ${a.author} · ${a.readMinutes} min read`,
    })),
    ...listShorts(channel.id).map<LibraryRow>((s) => ({
      id: s.id,
      kind: "short",
      title: s.title,
      status: s.status,
      section: s.source === "youtube_short" ? "YouTube Short" : "Clip",
      date: s.videoId ? dateFor(videos.find((v) => v.id === s.videoId) ?? videos[0]) : "Imported 28 October 2026",
      views: s.views,
      tone: s.posterTone,
      src: s.poster,
      durationSec: s.durationSec,
      exclusive: false,
      href: `/studio/shorts/${s.id}`,
      meta: `${s.durationSec} s · ${s.caption}`,
    })),
  ]

  return (
    <div>
      <PageHeader
        title="Library"
        description={`Every video, article and short on ${channel.name}. Filter, search and act on several at once.`}
        actions={
          <>
            <Button variant="outline" asChild>
              <Link href="/studio/articles/new">
                <PenLine /> Write an article
              </Link>
            </Button>
            <Button variant="outline" asChild>
              <Link href="/studio/upload">
                <Upload /> Upload
              </Link>
            </Button>
          </>
        }
      />
      <LibraryTable initialRows={rows} />
    </div>
  )
}
