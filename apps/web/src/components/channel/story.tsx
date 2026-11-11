import Link from "next/link"
import { ArrowRight, FileText } from "lucide-react"
import { VideoThumb } from "@/components/brand/media"
import { formatDuration } from "@/lib/format"
import { cn } from "@/lib/utils"
import { BODY, DISPLAY, type Story } from "./lib"

/** A story's picture: a video poster (with play glyph and duration) or an article's hero photo. */
export function StoryImage({
  story,
  ratio = "16/9",
  className,
  priority,
}: {
  story: Story
  ratio?: "16/9" | "3/2" | "4/3"
  className?: string
  priority?: boolean
}) {
  if (story.kind === "video" && ratio === "16/9") {
    return <VideoThumb src={story.poster} tone={story.tone} durationSec={story.durationSec} exclusive={story.exclusive} className={className} />
  }
  return (
    <div className={cn("relative w-full overflow-hidden rounded-lg bg-muted", className)} style={{ aspectRatio: ratio }}>
      {story.poster ? (
        // eslint-disable-next-line @next/next/no-img-element -- prototype media; next/image once media is on the CDN
        <img
          src={story.poster}
          alt=""
          className="absolute inset-0 size-full object-cover transition-transform duration-300 group-hover:scale-[1.02] motion-reduce:transition-none"
          loading={priority ? "eager" : "lazy"}
        />
      ) : (
        <div className="absolute inset-0 grid place-items-center text-muted-foreground">
          <FileText className="size-8" aria-hidden />
        </div>
      )}
      {story.kind === "article" ? (
        <span className="absolute bottom-2 left-2 inline-flex items-center gap-1 rounded-[2px] bg-black/80 px-1.5 py-0.5 text-[11px] font-bold uppercase tracking-[0.8px] text-white">
          <FileText className="size-3" aria-hidden /> Article
        </span>
      ) : (
        story.durationSec != null && (
          <span className="absolute bottom-2 right-2 rounded-[2px] bg-black/80 px-1.5 py-0.5 font-mono text-xs font-medium text-white tabular">
            {formatDuration(story.durationSec)}
          </span>
        )
      )}
    </div>
  )
}

export function storyMeta(s: Story, withAuthor = false) {
  const parts = [withAuthor ? s.author : null, s.date || null, s.kind === "video" && s.durationSec ? `Video ${formatDuration(s.durationSec)}` : `${s.readMinutes} min read`]
  return parts.filter(Boolean).join(" · ")
}

/** A grid card: picture, kicker, headline, optional standfirst and meta. */
export function StoryCard({
  story,
  size = "md",
  standfirst = false,
  ratio = "16/9",
}: {
  story: Story
  size?: "sm" | "md" | "lg"
  standfirst?: boolean
  ratio?: "16/9" | "3/2"
}) {
  return (
    <article className="group relative flex min-w-0 flex-col gap-3">
      <StoryImage story={story} ratio={ratio} />
      <span className="kicker mt-1 text-foreground">{story.sectionLabel}</span>
      <h3
        className={cn(
          DISPLAY,
          size === "sm" && "text-[19px] leading-[23px]",
          size === "md" && "text-[22px] leading-[26px] md:text-[24px] md:leading-[28px]",
          size === "lg" && "text-[28px] leading-[32px] md:text-[36px] md:leading-[40px]",
        )}
      >
        <Link
          href={story.href}
          className="outline-none after:absolute after:inset-0 after:rounded-lg focus-visible:after:ring-2 focus-visible:after:ring-ring focus-visible:after:ring-offset-2 group-hover:underline group-hover:decoration-2 group-hover:underline-offset-4"
        >
          {story.headline}
        </Link>
      </h3>
      {standfirst && <p className={cn(BODY, "text-[16px] leading-[24px] text-foreground/75 md:text-[17px] md:leading-[26px]")}>{story.standfirst}</p>}
      <p className="text-[13px] text-muted-foreground">{storyMeta(story, size !== "sm")}</p>
    </article>
  )
}

/** Compact row: picture left, text right. Used for related items and lists. */
export function StoryRow({ story, className }: { story: Story; className?: string }) {
  return (
    <article className={cn("group relative grid grid-cols-[112px_1fr] gap-4 sm:grid-cols-[200px_1fr] sm:gap-5", className)}>
      <StoryImage story={story} ratio={story.kind === "video" ? "16/9" : "3/2"} />
      <div className="flex min-w-0 flex-col gap-1.5">
        <span className="kicker text-foreground">{story.sectionLabel}</span>
        <h3 className={cn(DISPLAY, "text-[18px] leading-[22px] sm:text-[21px] sm:leading-[25px]")}>
          <Link
            href={story.href}
            className="outline-none after:absolute after:inset-0 after:rounded-lg focus-visible:after:ring-2 focus-visible:after:ring-ring group-hover:underline group-hover:underline-offset-4"
          >
            {story.headline}
          </Link>
        </h3>
        <p className="text-[13px] text-muted-foreground">{storyMeta(story)}</p>
      </div>
    </article>
  )
}

/** Module heading: a heavy rule, the title in the display face and an optional "See all". */
export function ModuleHeading({
  id,
  title,
  href,
  linkLabel = "See all",
  children,
}: {
  id?: string
  title: string
  href?: string
  linkLabel?: string
  /** Sits under the rule, e.g. a "Presented by" credit. */
  children?: React.ReactNode
}) {
  return (
    <div className="mb-6 flex flex-col gap-3">
      <div className="flex items-end justify-between gap-4 border-t-2 border-foreground pt-3">
        <h2 id={id} className={cn(DISPLAY, "text-[26px] leading-[30px] md:text-[30px] md:leading-[34px]")}>
          {title}
        </h2>
        {href && (
          <Link
            href={href}
            className="inline-flex shrink-0 items-center gap-1.5 rounded-sm text-[14px] font-semibold text-foreground outline-none hover:underline hover:underline-offset-4 focus-visible:ring-2 focus-visible:ring-ring"
          >
            {linkLabel}
            <ArrowRight className="size-4" aria-hidden />
          </Link>
        )}
      </div>
      {children}
    </div>
  )
}

/** Broadcast template heading: an accent bar, uppercase display title, "See all". */
export function RailHeading({
  id,
  title,
  href,
  linkLabel = "See all",
  children,
}: {
  id?: string
  title: string
  href?: string
  linkLabel?: string
  children?: React.ReactNode
}) {
  return (
    <div className="mb-5 flex flex-col gap-3">
      <div className="flex items-center justify-between gap-4">
        <h2 id={id} className={cn(DISPLAY, "flex items-center gap-3 text-[26px] uppercase leading-none md:text-[32px]")}>
          <span className="h-[0.9em] w-1.5 shrink-0 bg-[var(--chan)]" aria-hidden />
          {title}
        </h2>
        {href && (
          <Link
            href={href}
            className="inline-flex shrink-0 items-center gap-1.5 rounded-sm text-[13px] font-bold uppercase tracking-[1px] text-[var(--chan)] outline-none hover:underline hover:underline-offset-4 focus-visible:ring-2 focus-visible:ring-ring"
          >
            {linkLabel}
            <ArrowRight className="size-4" aria-hidden />
          </Link>
        )}
      </div>
      {children}
    </div>
  )
}
