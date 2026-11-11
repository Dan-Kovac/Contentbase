import { cn } from "@/lib/utils"

/** Title row used at the top of every studio and admin page. */
export function PageHeader({
  title,
  description,
  actions,
  className,
}: {
  title: string
  description?: React.ReactNode
  actions?: React.ReactNode
  className?: string
}) {
  return (
    <div className={cn("flex flex-wrap items-end justify-between gap-4 pb-6", className)}>
      <div className="min-w-0">
        <h1 className="text-[30px] font-bold leading-[34px] tracking-[-0.6px]">{title}</h1>
        {description && <p className="mt-1.5 max-w-[68ch] text-[15px] leading-[22px] text-muted-foreground">{description}</p>}
      </div>
      {actions && <div className="flex flex-wrap items-center gap-2">{actions}</div>}
    </div>
  )
}
