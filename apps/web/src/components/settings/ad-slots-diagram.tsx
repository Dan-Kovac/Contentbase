import { cn } from "@/lib/utils"

/** Wireframes of where ads can appear (ADS-01). Purely illustrative. */

function Line({ w = "100%", className }: { w?: string; className?: string }) {
  return <div className={cn("h-1.5 rounded-full bg-muted-foreground/25", className)} style={{ width: w }} />
}
function Block({ className, ratio, children }: { className?: string; ratio?: string; children?: React.ReactNode }) {
  return (
    <div className={cn("relative rounded-[3px] bg-muted-foreground/15", className)} style={ratio ? { aspectRatio: ratio } : undefined}>
      {children}
    </div>
  )
}
function Slot({ n, label, size, className, ratio }: { n: number; label: string; size: string; className?: string; ratio?: string }) {
  return (
    <div
      className={cn("flex flex-col items-center justify-center gap-0.5 rounded-[2px] border border-dashed border-foreground/60 bg-ad-frame px-1 py-1.5 text-center", className)}
      style={ratio ? { aspectRatio: ratio } : undefined}
    >
      <span className="flex items-center gap-1 text-[9px] font-bold uppercase leading-none tracking-[0.6px] text-ad-label">
        <SlotNumber n={n} /> <span className="hidden sm:inline">{label}</span>
      </span>
      <span className="hidden font-mono text-[9px] leading-none text-muted-foreground sm:block">{size}</span>
    </div>
  )
}
export function SlotNumber({ n, className }: { n: number; className?: string }) {
  return (
    <span className={cn("inline-grid size-3.5 shrink-0 place-items-center rounded-full bg-foreground font-mono text-[8px] font-medium leading-none text-background", className)} aria-hidden>
      {n}
    </span>
  )
}

function Frame({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <figure className="flex min-w-0 flex-col gap-2">
      <div className="flex flex-1 flex-col gap-2 rounded-md border bg-background p-2.5">
        <div className="flex items-center gap-1.5 border-b pb-2">
          <span className="size-2.5 rounded-[2px] bg-[var(--chan,var(--pop-ink))]" aria-hidden />
          <Line w="30%" />
          <span className="ml-auto flex gap-1" aria-hidden>
            <Line w="14px" />
            <Line w="14px" />
          </span>
        </div>
        {children}
      </div>
      <figcaption className="text-[13px] font-medium">{title}</figcaption>
    </figure>
  )
}

export const SLOT_LEGEND = [
  { n: 1, name: "Sponsor band", where: "Homepage, between modules", size: "970 × 250 (320 × 100 on mobile)" },
  { n: 2, name: "Sponsored card", where: "One card in the shorts row", size: "9:16 card" },
  { n: 3, name: "Pre-roll", where: "Before uploaded videos. Non-wagering only. YouTube embeds carry YouTube's own ads.", size: "Up to 15 seconds" },
  { n: 4, name: "In-article", where: "After a natural break, never between a headline and its first paragraph", size: "300 × 250" },
  { n: 5, name: "End of article", where: "After the last paragraph", size: "300 × 250" },
]

export function AdSlotsDiagram() {
  return (
    <div className="grid gap-4">
      <div className="grid grid-cols-3 gap-2 sm:gap-4">
        <Frame title="Home">
          <Block ratio="16/9" />
          <Line w="80%" />
          <div className="grid grid-cols-4 gap-1">
            <Block ratio="9/16" />
            <Block ratio="9/16" />
            <Block ratio="9/16" />
            <Slot n={2} label="Card" size="9:16" ratio="9/16" className="px-0.5" />
          </div>
          <Slot n={1} label="Sponsor band" size="970 × 250" ratio="970/250" />
          <div className="grid grid-cols-2 gap-1.5">
            <Block ratio="16/9" />
            <Block ratio="16/9" />
          </div>
        </Frame>
        <Frame title="Video page">
          <Block ratio="16/9" className="grid place-items-center">
            <span className="rounded-[2px] border border-dashed border-foreground/60 bg-ad-frame px-1.5 py-1 text-[9px] font-bold uppercase tracking-[0.6px] text-ad-label">
              <span className="flex items-center gap-1">
                <SlotNumber n={3} /> <span className="hidden sm:inline">Pre-roll</span>
              </span>
            </span>
          </Block>
          <Line w="85%" className="h-2 bg-muted-foreground/40" />
          <Line />
          <Line w="92%" />
          <Line w="70%" />
          <Slot n={4} label="In-article" size="300 × 250" className="mx-auto w-3/5" ratio="300/250" />
          <Line />
          <Line w="60%" />
          <Slot n={5} label="End" size="300 × 250" className="mx-auto w-3/5" ratio="300/250" />
        </Frame>
        <Frame title="Article page">
          <Line w="90%" className="h-2 bg-muted-foreground/40" />
          <Line w="65%" className="h-2 bg-muted-foreground/40" />
          <Line w="80%" />
          <Block ratio="16/9" />
          <Line />
          <Line w="94%" />
          <Line w="88%" />
          <Slot n={4} label="In-article" size="300 × 250" className="mx-auto w-3/5" ratio="300/250" />
          <Line />
          <Line w="72%" />
          <Slot n={5} label="End" size="300 × 250" className="mx-auto w-3/5" ratio="300/250" />
        </Frame>
      </div>
      <ul className="grid gap-px overflow-hidden rounded-md border bg-border text-[13px]">
        {SLOT_LEGEND.map((s) => (
          <li key={s.n} className="grid grid-cols-[auto_1fr] gap-x-3 gap-y-0.5 bg-card px-3 py-2.5 sm:grid-cols-[auto_160px_1fr_auto]">
            <SlotNumber n={s.n} className="mt-0.5 size-4 text-[9px]" />
            <span className="font-medium">{s.name}</span>
            <span className="col-start-2 text-muted-foreground sm:col-start-auto">{s.where}</span>
            <span className="col-start-2 font-mono text-xs text-muted-foreground sm:col-start-auto sm:text-right">{s.size}</span>
          </li>
        ))}
      </ul>
    </div>
  )
}
