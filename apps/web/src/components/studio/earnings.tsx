import type { Earnings } from "@/lib/types"

const aud = (n: number) => `$${n.toLocaleString("en-AU")}`
const k = (n: number) => `${Math.round(n / 1000)}k`

/** Weighted minutes: signed-in minutes count in full, logged-out minutes a fifth. */
export const weightedMinutes = (e: Earnings) => e.minutes.signedIn + e.minutes.loggedOut / 5

/** Ad earnings for one publication: its pool share, the minutes behind it and AdSense. */
export function EarningsPanel({ earn }: { earn: Earnings }) {
  const change = Math.round(((earn.total - earn.previousTotal) / earn.previousTotal) * 100)
  const fromSignedIn = Math.round((earn.minutes.signedIn / 1000) * earn.pool.ratePer1000)
  const fromLoggedOut = earn.total - fromSignedIn
  const rows = [
    { label: "Signed-in minutes", meta: `${k(earn.minutes.signedIn)} minutes, counted in full`, amount: fromSignedIn },
    { label: "Logged-out minutes", meta: `${k(earn.minutes.loggedOut)} minutes, counted at a fifth`, amount: fromLoggedOut },
  ]
  const max = Math.max(...rows.map((r) => r.amount))
  return (
    <section id="earnings" aria-labelledby="earnings-h" className="scroll-mt-24">
      <div className="mb-3 flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1">
        <h2 id="earnings-h" className="text-lg font-semibold tracking-[-0.2px]">
          Earnings
        </h2>
        <p className="text-[13px] text-muted-foreground">{earn.period} · AUD inc. GST · sample data</p>
      </div>
      <div className="grid gap-px overflow-hidden rounded-lg border bg-border lg:grid-cols-[1fr_1.4fr_1fr]">
        <div className="flex flex-col gap-2 bg-card p-5">
          <p className="text-[13px] font-medium text-muted-foreground">Your share of the ad pool</p>
          <p className="text-[34px] font-bold leading-10 tracking-[-0.8px]">{aud(earn.total)}</p>
          <p className="text-xs text-muted-foreground">
            <span className="font-semibold text-foreground">
              {change >= 0 ? "+" : ""}
              {change}%
            </span>{" "}
            vs previous 30 days
          </p>
          <p className="mt-2 border-t pt-3 text-[13px] leading-5 text-muted-foreground">
            {k(weightedMinutes(earn))} verified minutes at <span className="font-semibold text-foreground">${earn.pool.ratePer1000.toFixed(2)}</span> per 1,000.
          </p>
        </div>
        <div className="bg-card p-5">
          <p className="mb-4 text-[13px] font-semibold">Where it comes from</p>
          <ul className="flex flex-col gap-3">
            {rows.map((r) => (
              <li key={r.label} className="grid gap-1.5">
                <span className="flex items-baseline justify-between gap-3 text-[14px]">
                  <span>{r.label}</span>
                  <span className="font-semibold">{aud(r.amount)}</span>
                </span>
                <span className="h-2 overflow-hidden rounded-full bg-muted" aria-hidden>
                  <span className="block h-full rounded-full bg-chart-1" style={{ width: `${(r.amount / max) * 100}%` }} />
                </span>
                <span className="text-[12px] text-muted-foreground">{r.meta}</span>
              </li>
            ))}
          </ul>
          <p className="mt-3 text-[12px] leading-[18px] text-muted-foreground">A signed-in minute is worth five logged-out ones. Getting viewers to join is the biggest lever.</p>
        </div>
        <div className="flex flex-col gap-2 bg-card p-5">
          <p className="text-[13px] font-medium text-muted-foreground">Google AdSense</p>
          <p className="text-[26px] font-bold leading-8 tracking-[-0.5px]">{aud(earn.adsense)}</p>
          <p className="text-[13px] leading-5 text-muted-foreground">From slots Homestand hadn&apos;t sold, paid by Google straight to your account.</p>
          <p className="mt-2 border-t pt-3 text-[13px] leading-5 text-muted-foreground">
            Half of what advertisers pay goes into the pool, split by verified minutes. Your pay never depends on which ads ran.
          </p>
        </div>
      </div>
    </section>
  )
}
