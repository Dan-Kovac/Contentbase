import { Rss } from "lucide-react"
import { cn } from "@/lib/utils"
import type { ImportJob } from "@/lib/types"
import { LetterGlyph, YouTubeGlyph } from "@/components/settings/glyphs"

export type ImportSource = ImportJob["source"]

export const SOURCE_LABEL: Record<ImportSource, string> = {
  youtube: "YouTube",
  wordpress: "WordPress",
  ghost: "Ghost",
  substack: "Substack",
  rss: "RSS or Atom",
}

export function SourceMark({ source, className }: { source: ImportSource; className?: string }) {
  return (
    <span className={cn("grid size-10 shrink-0 place-items-center rounded-md border bg-background text-foreground", source === "youtube" && "text-[#ff0033]", className)}>
      {source === "youtube" ? (
        <YouTubeGlyph className="size-6" />
      ) : source === "rss" ? (
        <Rss className="size-4" aria-hidden />
      ) : (
        <LetterGlyph letter={SOURCE_LABEL[source].slice(0, 1)} />
      )}
    </span>
  )
}
