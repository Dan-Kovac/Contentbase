import Link from "next/link"
import { FileVideo, SquarePlay } from "lucide-react"
import { PageHeader } from "@/components/shell/page-header"
import { VideoThumb } from "@/components/brand/media"
import { StatusBadge } from "@/components/brand/status-badge"
import { DEMO_CHANNEL_SLUG, getChannel, getVideo, listShorts } from "@/lib/data"
import { compact, formatDuration } from "@/lib/format"
import type { Short } from "@/lib/types"

export const metadata = { title: "Shorts" }

function ShortTile({ s, needsSource, from }: { s: Short; needsSource?: boolean; from?: string }) {
  return (
    <li>
      <Link
        href={`/studio/shorts/${s.id}`}
        className="group flex flex-col gap-2 rounded-lg outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
      >
        <VideoThumb tone={s.posterTone} ratio="9/16" durationSec={s.durationSec}>
          <div className="absolute left-2 top-2">
            <StatusBadge
              tone={s.status}
              className={s.status === "ready" ? "border-transparent bg-background text-foreground" : undefined}
            >
              {s.status === "ready" ? (needsSource ? "Suggestion" : "Ready") : undefined}
            </StatusBadge>
          </div>
          {needsSource && (
            <div className="absolute inset-x-2 bottom-9 flex items-center gap-1.5 rounded-[2px] bg-black/75 px-2 py-1 text-[11px] font-medium leading-4 text-white">
              <FileVideo className="size-3 shrink-0" aria-hidden /> Add source file to render
            </div>
          )}
        </VideoThumb>
        <p className="line-clamp-2 text-[15px] font-semibold leading-5 group-hover:underline">{s.title}</p>
        <p className="-mt-1 text-xs text-muted-foreground tabular">
          {s.status === "published" ? `${compact(s.views)} views` : from ? `From ${from}` : formatDuration(s.durationSec)}
        </p>
      </Link>
    </li>
  )
}

export default function ShortsPage() {
  const channel = getChannel(DEMO_CHANNEL_SLUG)!
  const shorts = listShorts(channel.id)
  const imported = shorts.filter((s) => s.source === "youtube_short")
  const clips = shorts.filter((s) => s.source === "clip")
  const grid = "grid grid-cols-2 gap-x-4 gap-y-6 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-6"

  return (
    <div className="grid grid-cols-1 gap-12">
      <PageHeader
        title="Shorts"
        description="Your YouTube Shorts, plus the clips we cut from your longer videos. Shorts appear in the shorts row on your channel home."
        className="pb-0"
      />

      <section aria-labelledby="clips-h">
        <div className="mb-4 flex flex-wrap items-baseline justify-between gap-2">
          <h2 id="clips-h" className="text-lg font-semibold tracking-[-0.2px]">
            Cut from your videos <span className="ml-1 text-[15px] font-normal text-muted-foreground tabular">{clips.length}</span>
          </h2>
          <p className="text-[13px] text-muted-foreground">Rendered at 9:16 with burned-in captions once we have the source file</p>
        </div>
        <ul className={grid}>
          {clips.map((s) => {
            const v = s.videoId ? getVideo(s.videoId) : undefined
            const needsSource = s.status !== "published" && v?.source === "youtube"
            return <ShortTile key={s.id} s={s} needsSource={needsSource} from={v?.title} />
          })}
        </ul>
      </section>

      <section aria-labelledby="yt-h">
        <div className="mb-4 flex flex-wrap items-baseline justify-between gap-2">
          <h2 id="yt-h" className="text-lg font-semibold tracking-[-0.2px]">
            From your YouTube Shorts <span className="ml-1 text-[15px] font-normal text-muted-foreground tabular">{imported.length}</span>
          </h2>
          <p className="flex items-center gap-1.5 text-[13px] text-muted-foreground">
            <SquarePlay className="size-3.5" aria-hidden /> Play in the YouTube player. Edit the title and caption here.
          </p>
        </div>
        <ul className={grid}>
          {imported.map((s) => (
            <ShortTile key={s.id} s={s} />
          ))}
        </ul>
      </section>
    </div>
  )
}
