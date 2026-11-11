import { VideoThumb } from "@/components/brand/media"
import { cn } from "@/lib/utils"
import type { EBlock } from "../review/types"
import type { EmbedVideo } from "./block-editor"

/** Read-only render of editor blocks, as the channel will show them. */
export function BlocksPreview({ blocks, videos = [], serif = true }: { blocks: EBlock[]; videos?: EmbedVideo[]; serif?: boolean }) {
  return (
    <div className={cn("grid gap-5", serif ? "font-serif text-[18px] leading-[30px]" : "text-[16px] leading-[26px]")}>
      {blocks.map(({ id, block: b }) => {
        switch (b.type) {
          case "paragraph":
            return b.text ? <p key={id}>{b.text}</p> : null
          case "heading":
            return b.text ? (
              <h2 key={id} className="mt-3 font-sans text-[24px] font-bold leading-[30px] tracking-[-0.4px]">
                {b.text}
              </h2>
            ) : null
          case "quote":
            return b.text ? (
              <blockquote key={id} className="border-l-[3px] border-foreground pl-4 font-serif text-[22px] italic leading-[32px]">
                {b.text}
                {b.cite && <footer className="mt-2 font-sans text-[13px] font-semibold not-italic text-muted-foreground">{b.cite}</footer>}
              </blockquote>
            ) : null
          case "list":
            return (
              <ul key={id} className="grid list-disc gap-1 pl-6">
                {b.items.filter(Boolean).map((it, i) => (
                  <li key={i}>{it}</li>
                ))}
              </ul>
            )
          case "divider":
            return <hr key={id} className="my-2" />
          case "image":
            return b.src ? (
              <figure key={id} className="grid gap-2">
                {/* eslint-disable-next-line @next/next/no-img-element -- prototype media */}
                <img src={b.src} alt={b.caption} className="aspect-[3/2] w-full rounded-lg object-cover" />
                {b.caption && <figcaption className="font-sans text-[13px] leading-5 text-muted-foreground">{b.caption}</figcaption>}
              </figure>
            ) : null
          case "video": {
            const v = videos.find((x) => x.id === b.videoId)
            return v ? (
              <figure key={id} className="grid gap-2">
                <VideoThumb tone={v.tone} src={v.poster} durationSec={v.durationSec} />
                <figcaption className="font-sans text-[13px] font-semibold leading-5">{v.title}</figcaption>
              </figure>
            ) : null
          }
        }
      })}
    </div>
  )
}
