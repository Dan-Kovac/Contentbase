import { Check } from "lucide-react"
import { cn } from "@/lib/utils"

/**
 * Horizontal pipeline stepper. `current` is the index of the step in progress;
 * steps before it are done. Pass current = steps.length when everything is done.
 */
export function PipelineSteps({
  steps,
  current,
  className,
}: {
  steps: { label: string; detail?: string }[]
  current: number
  className?: string
}) {
  return (
    <ol className={cn("grid gap-3 sm:gap-0", className)} style={{ gridTemplateColumns: `repeat(${steps.length}, minmax(0, 1fr))` }}>
      {steps.map((s, i) => {
        const done = i < current
        const active = i === current
        return (
          <li key={s.label} className="relative flex min-w-0 flex-col gap-2" aria-current={active ? "step" : undefined}>
            <div className="flex items-center">
              <span
                className={cn(
                  "relative z-10 grid size-6 shrink-0 place-items-center rounded-full border text-[11px] font-bold tabular",
                  done && "border-foreground bg-foreground text-background",
                  active && "border-foreground bg-background text-foreground",
                  !done && !active && "border-border bg-background text-muted-foreground",
                )}
              >
                {done ? <Check className="size-3.5" strokeWidth={3} aria-hidden /> : active ? <span className="size-2 animate-pulse rounded-full bg-pop-ink" aria-hidden /> : i + 1}
              </span>
              {i < steps.length - 1 && (
                <span className={cn("h-px flex-1", done ? "bg-foreground" : "bg-border")} aria-hidden />
              )}
            </div>
            <div className="min-w-0 pr-2">
              <p className={cn("truncate text-[13px] font-semibold leading-4", !done && !active && "text-muted-foreground")}>{s.label}</p>
              {s.detail && <p className="mt-0.5 hidden truncate text-xs text-muted-foreground md:block">{s.detail}</p>}
              <span className="sr-only">{done ? "Done" : active ? "In progress" : "Waiting"}</span>
            </div>
          </li>
        )
      })}
    </ol>
  )
}
