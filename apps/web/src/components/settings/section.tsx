import { Lock } from "lucide-react"
import { cn } from "@/lib/utils"

/**
 * A settings section: title and description on the left, controls on the right
 * on desktop; stacked on mobile. `stacked` keeps the heading above the controls
 * at every width (used where the controls column is already narrow).
 */
export function Section({
  title,
  description,
  children,
  id,
  stacked = false,
  aside,
  className,
}: {
  title: string
  description?: React.ReactNode
  children: React.ReactNode
  id?: string
  stacked?: boolean
  aside?: React.ReactNode
  className?: string
}) {
  return (
    <section
      id={id}
      aria-labelledby={id ? `${id}-title` : undefined}
      className={cn(
        "grid scroll-mt-24 gap-4 border-t py-8 first:border-t-0 first:pt-0",
        !stacked && "lg:grid-cols-[minmax(0,260px)_minmax(0,1fr)] lg:gap-12",
        className,
      )}
    >
      <div className="min-w-0">
        <div className="flex items-center justify-between gap-3">
          <h2 id={id ? `${id}-title` : undefined} className="text-[15px] font-semibold leading-6">
            {title}
          </h2>
          {aside}
        </div>
        {description && <div className="mt-1 text-sm leading-5 text-muted-foreground [&_a]:font-medium [&_a]:text-foreground [&_a]:underline [&_a]:underline-offset-2">{description}</div>}
      </div>
      <div className="min-w-0">{children}</div>
    </section>
  )
}

/** A bordered surface for a group of controls. Cards take no shadow. */
export function Panel({ className, children }: { className?: string; children: React.ReactNode }) {
  return <div className={cn("overflow-hidden rounded-lg border bg-card", className)}>{children}</div>
}

export function PanelBody({ className, children }: { className?: string; children: React.ReactNode }) {
  return <div className={cn("grid gap-5 p-4 sm:p-5", className)}>{children}</div>
}

export function PanelFooter({ className, children, note }: { className?: string; children?: React.ReactNode; note?: React.ReactNode }) {
  return (
    <div className={cn("flex flex-wrap items-center justify-between gap-3 border-t bg-muted/40 px-4 py-3 sm:px-5", className)}>
      <div className="min-w-0 text-[13px] text-muted-foreground">{note}</div>
      <div className="flex flex-wrap items-center gap-2">{children}</div>
    </div>
  )
}

/** One row inside a panel: label and help text on the left, a control on the right. */
export function SettingRow({
  label,
  description,
  htmlFor,
  children,
  className,
}: {
  label: React.ReactNode
  description?: React.ReactNode
  htmlFor?: string
  children: React.ReactNode
  className?: string
}) {
  return (
    <div className={cn("flex items-start justify-between gap-4 px-4 py-4 sm:px-5 [&+&]:border-t", className)}>
      <div className="min-w-0">
        {htmlFor ? (
          <label htmlFor={htmlFor} className="text-sm font-medium leading-5">
            {label}
          </label>
        ) : (
          <div className="text-sm font-medium leading-5">{label}</div>
        )}
        {description && <div className="mt-0.5 text-[13px] leading-5 text-muted-foreground">{description}</div>}
      </div>
      <div className="shrink-0 pt-0.5">{children}</div>
    </div>
  )
}

/** "Fixed by Homestand": what the platform controls. */
export function FixedNote({ title = "Fixed by Homestand", items, className }: { title?: string; items: string[]; className?: string }) {
  return (
    <div className={cn("rounded-lg border border-dashed bg-muted/40 p-4", className)}>
      <p className="flex items-center gap-2 text-[13px] font-semibold">
        <Lock className="size-4" aria-hidden />
        {title}
      </p>
      <ul className="mt-2 grid gap-1 text-[13px] leading-5 text-muted-foreground">
        {items.map((i) => (
          <li key={i} className="flex gap-2">
            <span className="mt-[7px] size-1 shrink-0 rounded-full bg-muted-foreground" aria-hidden />
            {i}
          </li>
        ))}
      </ul>
    </div>
  )
}

/** Small uppercase tag for "Coming later", "Next phase" and similar. */
export function Tag({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <span className={cn("inline-flex h-[22px] items-center whitespace-nowrap rounded-[2px] border bg-background px-2 text-[11px] font-bold uppercase leading-none tracking-[0.8px] text-muted-foreground", className)}>
      {children}
    </span>
  )
}
