import { Monogram } from "@/components/brand/wordmark"
import { cn } from "@/lib/utils"

/** Centred platform sheet used for viewer sign-in, check email and age assurance. */
export function AccountSheet({
  title,
  lede,
  children,
  className,
  icon,
  context = true,
}: {
  title: React.ReactNode
  lede?: React.ReactNode
  children: React.ReactNode
  className?: string
  icon?: React.ReactNode
  /** Show the "on Footy Fix" context chip. */
  context?: boolean
}) {
  return (
    <div className="flex justify-center px-4 py-10 sm:py-16">
      <div className={cn("flex w-full max-w-[460px] flex-col gap-7 rounded-lg border bg-background p-6 shadow-popover sm:p-8", className)}>
        <div className="flex flex-col gap-4">
          <div className="flex items-center justify-between gap-3">
            {icon ?? <Monogram size={36} />}
            {context && (
              <span className="inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[12px] text-muted-foreground">
                <span className="size-2 rounded-full bg-channel-pitch" aria-hidden />
                From Footy Fix
              </span>
            )}
          </div>
          <div className="flex flex-col gap-2">
            <h1 className="text-[28px] font-extrabold leading-[32px] tracking-[-0.025em]">{title}</h1>
            {lede && <p className="text-[15px] leading-[23px] text-muted-foreground">{lede}</p>}
          </div>
        </div>
        {children}
      </div>
    </div>
  )
}
