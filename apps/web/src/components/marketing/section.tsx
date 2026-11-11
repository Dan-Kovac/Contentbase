import { Check } from "lucide-react"
import { cn } from "@/lib/utils"

/** Page-width container with the brand gutters (16 / 24 / 32px). */
export function Container({ className, children }: { className?: string; children: React.ReactNode }) {
  return <div className={cn("mx-auto w-full max-w-[1280px] px-4 sm:px-6 lg:px-8", className)}>{children}</div>
}

export function Section({
  id,
  tone = "light",
  className,
  children,
  labelledBy,
}: {
  id?: string
  tone?: "light" | "muted" | "dark"
  className?: string
  children: React.ReactNode
  labelledBy?: string
}) {
  return (
    <section
      id={id}
      aria-labelledby={labelledBy}
      className={cn(
        "scroll-mt-16 py-16 md:py-24",
        tone === "muted" && "bg-muted",
        tone === "dark" && "bg-brand-black text-brand-white",
        className,
      )}
    >
      <Container>{children}</Container>
    </section>
  )
}

/** Kicker, headline and lede. `dark` swaps text colours for brand-black grounds. */
export function SectionHeading({
  id,
  kicker,
  title,
  lede,
  dark = false,
  align = "left",
  as: As = "h2",
  className,
}: {
  id?: string
  kicker?: string
  title: React.ReactNode
  lede?: React.ReactNode
  dark?: boolean
  align?: "left" | "center"
  as?: "h1" | "h2"
  className?: string
}) {
  return (
    <div className={cn("flex max-w-[720px] flex-col gap-4", align === "center" && "mx-auto items-center text-center", className)}>
      {kicker && <p className={cn("kicker", dark ? "text-brand-white before:bg-pop" : "text-foreground")}>{kicker}</p>}
      <As
        id={id}
        className={cn(
          "font-extrabold tracking-[-0.03em]",
          As === "h1" ? "text-[44px] leading-[46px] sm:text-[60px] sm:leading-[60px]" : "text-[32px] leading-[36px] sm:text-[44px] sm:leading-[48px]",
        )}
      >
        {title}
      </As>
      {lede && (
        <p className={cn("text-[17px] leading-[27px] sm:text-[19px] sm:leading-[29px]", dark ? "text-brand-muted" : "text-muted-foreground")}>
          {lede}
        </p>
      )}
    </div>
  )
}

/** Hero on brand-black with the Pitch glow. Always dark, whatever the theme. */
export function DarkHero({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <section className={cn("relative overflow-hidden bg-brand-black text-brand-white", className)}>
      <div className="pointer-events-none absolute inset-0 bg-pitch-glow" aria-hidden />
      <Container className="relative py-16 md:py-24">{children}</Container>
    </section>
  )
}

/** Small tick list used in plan cards and feature panels. */
export function TickList({ items, className, dark = false }: { items: React.ReactNode[]; className?: string; dark?: boolean }) {
  return (
    <ul className={cn("flex flex-col gap-2.5 text-[15px] leading-[22px]", className)}>
      {items.map((item, i) => (
        <li key={i} className="flex gap-2.5">
          <Check className={cn("mt-[3px] size-4 shrink-0", dark ? "text-pop" : "text-pop-ink")} strokeWidth={2.5} aria-hidden />
          <span>{item}</span>
        </li>
      ))}
    </ul>
  )
}
