import Link from "next/link"
import { Wordmark } from "@/components/brand/wordmark"
import { cn } from "@/lib/utils"

/**
 * Split layout for creator sign-in and sign-up: a brand-black panel with the
 * Pitch glow on the left (top on mobile), and the form on a white ground.
 */
export function AuthShell({
  aside,
  children,
  wide = false,
  asideClassName,
  top,
}: {
  /** Content for the black panel. Hidden below lg unless `asideOnMobile`. */
  aside: React.ReactNode
  children: React.ReactNode
  /** Give the form column more room (style step). */
  wide?: boolean
  asideClassName?: string
  /** Shown above the form, e.g. the step indicator. */
  top?: React.ReactNode
}) {
  return (
    <div className={cn("grid min-h-svh grid-cols-1 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)]", wide && "lg:grid-cols-[minmax(0,6fr)_minmax(0,6fr)]")}>
      <aside className="relative overflow-hidden bg-brand-black text-brand-white">
        <div className="pointer-events-none absolute inset-0 bg-pitch-glow" aria-hidden />
        <div className="relative flex h-full flex-col gap-10 px-4 py-5 sm:px-8 lg:px-12 lg:py-10">
          <Link href="/" aria-label="Homestand home" className="w-fit rounded-sm text-brand-white focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-brand-white">
            <Wordmark height={22} />
          </Link>
          <div className={cn("hidden flex-1 flex-col justify-center gap-8 lg:flex", asideClassName)}>{aside}</div>
          <p className="hidden text-[13px] text-brand-muted lg:block">© 2026 Homestand · Made in Melbourne</p>
        </div>
      </aside>
      <main className="flex flex-col bg-background">
        {top && <div className="border-b px-4 py-4 sm:px-8 lg:px-12">{top}</div>}
        <div className="flex flex-1 justify-center px-4 py-10 sm:px-8 lg:items-center lg:px-12 lg:py-16">
          <div className={cn("flex w-full flex-col gap-8", wide ? "max-w-[560px]" : "max-w-[440px]")}>{children}</div>
        </div>
      </main>
    </div>
  )
}

/** Title block for an auth form. */
export function AuthHeading({ kicker, title, lede }: { kicker?: string; title: React.ReactNode; lede?: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-3">
      {kicker && <p className="kicker">{kicker}</p>}
      <h1 className="text-[32px] font-extrabold leading-[36px] tracking-[-0.03em] sm:text-[38px] sm:leading-[42px]">{title}</h1>
      {lede && <p className="text-[16px] leading-[25px] text-muted-foreground">{lede}</p>}
    </div>
  )
}

/** "or" rule between provider buttons and the email form. */
export function OrDivider({ label = "or" }: { label?: string }) {
  return (
    <div className="flex items-center gap-3 text-[13px] text-muted-foreground" role="separator" aria-label={label}>
      <span className="h-px flex-1 bg-border" />
      {label}
      <span className="h-px flex-1 bg-border" />
    </div>
  )
}

/** Large statement for the black panel. */
export function AsideStatement({ title, body }: { title: React.ReactNode; body?: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-4">
      <p className="max-w-[16ch] text-[40px] font-extrabold leading-[42px] tracking-[-0.035em] xl:text-[52px] xl:leading-[54px]">{title}</p>
      {body && <p className="max-w-[44ch] text-[16px] leading-[25px] text-brand-muted">{body}</p>}
    </div>
  )
}
