import { Lock, ShieldCheck, Ban, Circle } from "lucide-react"
import { cn } from "@/lib/utils"
import type { AdDecision } from "@/lib/types"

const LOCKS = [
  { key: "session", name: "Signed in", Icon: Lock },
  { key: "age", name: "18+ confirmed", Icon: ShieldCheck },
  { key: "optout", name: "Not opted out", Icon: Ban },
] as const

/** Triple-lock result for one ad request (TLK-01–06). Admin and advertiser views only. */
export function LockStatus({
  locks,
  compact = false,
  verdict,
}: {
  locks: AdDecision["locks"]
  compact?: boolean
  /** Overrides the summary line, e.g. when wagering was excluded for another reason (live page, blocked category). */
  verdict?: string
}) {
  const allPass = locks.session.pass && locks.age.pass && locks.optout.pass
  return (
    <div className={cn("grid gap-2", compact ? "grid-cols-3" : "grid-cols-1 sm:grid-cols-3")} role="group" aria-label="Triple lock">
      {LOCKS.map(({ key, name, Icon }) => {
        const v = locks[key]
        return (
          <div key={key} className={cn("flex min-w-0 flex-col gap-1 rounded-lg border bg-card p-3", !v.pass && "border-destructive")}>
            <span className="flex items-center gap-2 text-[13px] font-semibold">
              <Icon className="size-4" aria-hidden />
              {name}
            </span>
            <span className={cn("flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-[0.8px]", v.pass ? "text-foreground" : "text-destructive")}>
              {v.pass ? <span className="size-[7px] bg-pop-ink" aria-hidden /> : <Circle className="size-2 fill-current" aria-hidden />}
              {v.pass ? "Pass" : "Fail"}
            </span>
            {v.ref && !compact && <span className="break-all font-mono text-xs text-muted-foreground">{v.ref}</span>}
          </div>
        )
      })}
      {!compact && (
        <div className="col-span-full rounded-md bg-muted px-3 py-2 text-[13px] font-semibold">
          {verdict ?? (allPass ? "Wagering creative eligible. Evidence written before serve." : "Fail closed: non-wagering ad served.")}
        </div>
      )}
    </div>
  )
}
