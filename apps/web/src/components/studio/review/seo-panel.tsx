"use client"

import { useRef } from "react"
import { Check, ImagePlus } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { VideoThumb } from "@/components/brand/media"
import { formatDuration } from "@/lib/format"
import { cn } from "@/lib/utils"

export interface SeoState {
  titleTag: string
  metaDescription: string
  slug: string
  altText: string
  thumb: number
  customThumb: string | null
}

function Count({ n, max }: { n: number; max: number }) {
  return (
    <span className={cn("text-xs tabular", n > max ? "font-semibold text-destructive" : "text-muted-foreground")}>
      {n} / {max}
    </span>
  )
}

/** ING-06, ING-08: search and social metadata, and the thumbnail. */
export function SeoPanel({
  seo,
  setSeo,
  domain,
  channelName,
  headline,
  frames,
}: {
  seo: SeoState
  setSeo: (fn: (s: SeoState) => SeoState) => void
  domain: string
  channelName: string
  headline: string
  frames: { tone: string; at: number }[]
}) {
  const fileRef = useRef<HTMLInputElement>(null)
  const set = (patch: Partial<SeoState>) => setSeo((s) => ({ ...s, ...patch }))
  const tone = seo.thumb === -1 ? "#262626" : frames[seo.thumb]?.tone
  const slugOk = /^[a-z0-9]+(-[a-z0-9]+)*$/.test(seo.slug)

  return (
    <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_380px]">
      <div className="grid min-w-0 max-w-[680px] content-start gap-8">
        <section className="grid gap-5" aria-labelledby="search-h">
          <h2 id="search-h" className="kicker text-foreground">
            Search
          </h2>
          <div className="grid gap-1.5">
            <div className="flex items-center justify-between">
              <Label htmlFor="seo-title">Title tag</Label>
              <Count n={seo.titleTag.length} max={60} />
            </div>
            <Input id="seo-title" value={seo.titleTag} onChange={(e) => set({ titleTag: e.target.value })} />
          </div>
          <div className="grid gap-1.5">
            <div className="flex items-center justify-between">
              <Label htmlFor="seo-desc">Meta description</Label>
              <Count n={seo.metaDescription.length} max={160} />
            </div>
            <Textarea id="seo-desc" rows={3} value={seo.metaDescription} onChange={(e) => set({ metaDescription: e.target.value })} className="resize-none" />
          </div>
          <div className="grid gap-1.5">
            <Label htmlFor="seo-slug">Slug</Label>
            <div className="flex min-w-0 items-center rounded-md border border-input focus-within:ring-[3px] focus-within:ring-ring/50">
              <span className="hidden shrink-0 border-r bg-muted px-3 py-2 font-mono text-xs text-muted-foreground sm:block">{domain}/</span>
              <input
                id="seo-slug"
                value={seo.slug}
                onChange={(e) => set({ slug: e.target.value.toLowerCase().replace(/\s+/g, "-") })}
                aria-invalid={!slugOk}
                aria-describedby="slug-help"
                className="h-9 min-w-0 flex-1 bg-transparent px-3 font-mono text-[13px] outline-none"
              />
            </div>
            <p id="slug-help" className={cn("text-xs", slugOk ? "text-muted-foreground" : "text-destructive")}>
              {slugOk ? "Lowercase words joined by hyphens. Changing it after publishing adds a redirect." : "Use lowercase letters, numbers and single hyphens, e.g. blues-centre-bounce."}
            </p>
          </div>
          <div className="grid gap-1.5">
            <Label htmlFor="seo-alt">Thumbnail alt text</Label>
            <Input id="seo-alt" value={seo.altText} onChange={(e) => set({ altText: e.target.value })} />
          </div>
        </section>

        <section aria-labelledby="thumb-h">
          <h2 id="thumb-h" className="kicker mb-1 text-foreground">
            Thumbnail
          </h2>
          <p className="mb-4 text-sm text-muted-foreground">Three frames we picked from the video, or upload your own.</p>
          <div role="radiogroup" aria-labelledby="thumb-h" className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            {frames.map((f, i) => {
              const on = seo.thumb === i
              return (
                <button
                  key={i}
                  type="button"
                  role="radio"
                  aria-checked={on}
                  aria-label={`Frame at ${formatDuration(f.at)}`}
                  onClick={() => set({ thumb: i })}
                  className={cn(
                    "group relative rounded-lg p-0.5 outline-none ring-offset-2 ring-offset-background transition-shadow focus-visible:ring-2 focus-visible:ring-ring",
                    on ? "ring-2 ring-foreground" : "hover:ring-1 hover:ring-input",
                  )}
                >
                  <VideoThumb tone={f.tone} className="[&_span.rounded-full]:hidden" />
                  <span className="absolute bottom-2 left-2 rounded-[2px] bg-black/80 px-1.5 py-0.5 font-mono text-[11px] text-white tabular">
                    {formatDuration(f.at)}
                  </span>
                  {on && (
                    <span className="absolute right-2 top-2 grid size-5 place-items-center rounded-full bg-foreground text-background">
                      <Check className="size-3" strokeWidth={3} aria-hidden />
                    </span>
                  )}
                </button>
              )
            })}
            <button
              type="button"
              role="radio"
              aria-checked={seo.thumb === -1}
              onClick={() => (seo.customThumb ? set({ thumb: -1 }) : fileRef.current?.click())}
              className={cn(
                "grid aspect-video place-items-center rounded-lg border border-dashed p-2 text-center text-xs text-muted-foreground outline-none transition-colors hover:bg-accent focus-visible:ring-2 focus-visible:ring-ring",
                seo.thumb === -1 && "border-solid border-foreground text-foreground ring-1 ring-foreground",
              )}
            >
              <span className="grid justify-items-center gap-1">
                <ImagePlus className="size-4" aria-hidden />
                {seo.customThumb ? <span className="line-clamp-2 break-all">{seo.customThumb}</span> : "Upload your own"}
              </span>
            </button>
          </div>
          <input
            ref={fileRef}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            className="sr-only"
            tabIndex={-1}
            aria-label="Upload a thumbnail"
            onChange={(e) => {
              const f = e.target.files?.[0]
              if (f) set({ customThumb: f.name, thumb: -1 })
            }}
          />
          <p className="mt-2 text-xs text-muted-foreground">JPG, PNG or WebP, 1280 × 720 or larger.</p>
        </section>
      </div>

      <aside className="grid content-start gap-6 lg:sticky lg:top-20 lg:self-start" aria-label="Previews">
        <div>
          <p className="mb-2 text-[13px] font-semibold text-muted-foreground">Google</p>
          <div className="rounded-lg border bg-card p-4">
            <p className="truncate text-xs text-muted-foreground">
              {domain} › {seo.slug}
            </p>
            <p className="mt-1 line-clamp-1 text-[18px] leading-6 text-[#1a0dab] dark:text-[#8ab4f8]">{seo.titleTag || headline}</p>
            <p className="mt-1 line-clamp-2 text-[13px] leading-5 text-muted-foreground">{seo.metaDescription}</p>
          </div>
        </div>
        <div>
          <p className="mb-2 text-[13px] font-semibold text-muted-foreground">Open Graph and X card</p>
          <div className="overflow-hidden rounded-lg border bg-card">
            <VideoThumb tone={tone} className="rounded-none" />
            <div className="border-t bg-muted/50 px-3.5 py-3">
              <p className="text-[11px] uppercase tracking-[0.6px] text-muted-foreground">{domain}</p>
              <p className="mt-0.5 line-clamp-2 text-[15px] font-semibold leading-5">{headline}</p>
              <p className="mt-0.5 line-clamp-1 text-[13px] text-muted-foreground">{seo.metaDescription}</p>
            </div>
          </div>
          <p className="mt-2 text-xs text-muted-foreground">Shared as {channelName}. The card uses your headline and thumbnail.</p>
        </div>
      </aside>
    </div>
  )
}
