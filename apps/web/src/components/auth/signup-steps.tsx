import Link from "next/link"
import { Check } from "lucide-react"
import { cn } from "@/lib/utils"

export const SIGNUP_STEPS = [
  { label: "Connect", href: "/signup" },
  { label: "Channel", href: "/signup/channel" },
  { label: "Make it yours", href: "/signup/name" },
  { label: "Live", href: "/signup/importing" },
] as const

/** Step indicator for the sign-up flow. `current` is 0-based. */
export function SignupSteps({ current }: { current: number }) {
  return (
    <nav aria-label="Sign-up progress" className="flex flex-col gap-2">
      <p className="text-[13px] font-medium text-muted-foreground sm:hidden">
        Step {current + 1} of {SIGNUP_STEPS.length} · <span className="text-foreground">{SIGNUP_STEPS[current].label}</span>
      </p>
      <ol className="flex items-center gap-1.5 sm:gap-2">
        {SIGNUP_STEPS.map((s, i) => {
          const done = i < current
          const active = i === current
          const content = (
            <>
              <span
                className={cn(
                  "grid size-6 shrink-0 place-items-center rounded-full border text-[12px] font-bold tabular",
                  done && "border-primary bg-primary text-primary-foreground",
                  active && "border-foreground text-foreground",
                  !done && !active && "border-border text-muted-foreground",
                )}
              >
                {done ? <Check className="size-3.5" strokeWidth={3} aria-hidden /> : i + 1}
              </span>
              <span className={cn("hidden text-[13px] font-medium sm:inline", active ? "text-foreground" : "text-muted-foreground")}>{s.label}</span>
              <span className="sr-only">{done ? " (done)" : active ? " (current step)" : ""}</span>
            </>
          )
          return (
            <li key={s.href} className={cn("flex items-center gap-1.5 sm:gap-2", i < SIGNUP_STEPS.length - 1 && "flex-1")} aria-current={active ? "step" : undefined}>
              {done ? (
                <Link href={s.href} className="flex items-center gap-2 rounded-full outline-none focus-visible:ring-2 focus-visible:ring-ring">
                  {content}
                </Link>
              ) : (
                <span className="flex items-center gap-2">{content}</span>
              )}
              {i < SIGNUP_STEPS.length - 1 && <span className={cn("h-px min-w-2 flex-1", done ? "bg-foreground" : "bg-border")} aria-hidden />}
            </li>
          )
        })}
      </ol>
    </nav>
  )
}
