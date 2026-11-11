import { cn } from "@/lib/utils"
import type { ContentStatus } from "@/lib/types"

type Tone = ContentStatus | "exclusive" | "live" | "wagering" | "neutral" | "connected"

const STYLES: Record<Tone, string> = {
  processing: "bg-muted text-muted-foreground border-border",
  ready: "bg-pitch text-pop-foreground border-transparent",
  draft: "bg-muted text-muted-foreground border-border",
  scheduled: "bg-background text-foreground border-foreground",
  published: "bg-primary text-primary-foreground border-transparent",
  failed: "bg-background text-destructive border-destructive",
  exclusive: "bg-pitch text-pop-foreground border-transparent",
  live: "bg-brand-black text-brand-white border-brand-grey",
  wagering: "bg-background text-foreground border-input",
  neutral: "bg-muted text-muted-foreground border-border",
  connected: "bg-background text-foreground border-input",
}

const LABELS: Record<Tone, string> = {
  processing: "Processing",
  ready: "Ready to review",
  draft: "Draft",
  scheduled: "Scheduled",
  published: "Published",
  failed: "Failed",
  exclusive: "Exclusive",
  live: "Live",
  wagering: "Wagering",
  neutral: "",
  connected: "Connected",
}

/** Uppercase status label. Status always shows as a word, never colour alone. */
export function StatusBadge({
  tone,
  children,
  className,
}: {
  tone: Tone
  children?: React.ReactNode
  className?: string
}) {
  return (
    <span
      className={cn(
        "inline-flex h-[22px] items-center gap-1.5 whitespace-nowrap rounded-[2px] border px-2 text-[11px] font-bold uppercase leading-none tracking-[0.8px]",
        STYLES[tone],
        className,
      )}
    >
      {(tone === "live" || tone === "connected") && (
        <span className={cn("size-1.5 rounded-full", tone === "live" ? "bg-pitch" : "bg-pop-ink")} aria-hidden />
      )}
      {children ?? LABELS[tone]}
    </span>
  )
}
