import { FORMAT_LABEL } from "@/components/marketing/native-formats"
import type { Earnings } from "@/lib/types"

const aud = (n: number) => `$${n.toLocaleString("en-AU")}`

/** One bar per row, as a share of the largest row. Plain HTML so it reads without a chart library. */
function Bars({ rows, note }: { rows: { label: React.ReactNode; amount: number; meta?: string }[]; note?: string }) {
  const max = Math.max(...rows.map((r) => r.amount))
  return (
    <div className="flex flex-col gap-3">
      <ul className="flex flex-col gap-3">
        {rows.map((r, i) => (
          <li key={i} className="grid gap-1.5">
            <span className="flex items-baseline justify-between gap-3 text-[14px]">
              <span className="min-w-0 truncate">{r.label}</span>
              <span className="shrink-0 font-semibold">{aud(r.amount)}</span>
            </span>
            <span className="h-2 overflow-hidden rounded-full bg-muted" aria-hidden>
              <span className="block h-full rounded-full bg-chart-1" style={{ width: `${(r.amount / max) * 100}%` }} />
            </span>
            {r.meta && <span className="text-[12px] text-muted-foreground">{r.meta}</span>}
          </li>
        ))}
      </ul>
      {note && <p className="text-[12px] leading-[18px] text-muted-foreground">{note}</p>}
    </div>
  )
}

/** Sponsor earnings for one publication: by format, by sponsor and by who was watching. */
export function EarningsPanel({ earn }: { earn: Earnings }) {
  const change = Math.round(((earn.total - earn.previousTotal) / earn.previousTotal) * 100)
  return (
    <section id="earnings" aria-labelledby="earnings-h" className="scroll-mt-24">
      <div className="mb-3 flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1">
        <h2 id="earnings-h" className="text-lg font-semibold tracking-[-0.2px]">
          Earnings
        </h2>
        <p className="text-[13px] text-muted-foreground">{earn.period} · your share, AUD inc. GST · sample data</p>
      </div>
      <div className="grid gap-px overflow-hidden rounded-lg border bg-border lg:grid-cols-4">
        <div className="flex flex-col gap-2 bg-card p-5">
          <p className="text-[13px] font-medium text-muted-foreground">Sponsor earnings</p>
          <p className="text-[34px] font-bold leading-10 tracking-[-0.8px]">{aud(earn.total)}</p>
          <p className="text-xs text-muted-foreground">
            <span className="font-semibold text-foreground">
              {change >= 0 ? "+" : ""}
              {change}%
            </span>{" "}
            vs previous 30 days
          </p>
          <p className="mt-2 border-t pt-3 text-[13px] leading-5 text-muted-foreground">
            <span className="font-semibold text-foreground">{aud(earn.ageVerified)}</span> came from age-verified sponsors, shown only to signed-in viewers confirmed 18+.
          </p>
        </div>
        <div className="bg-card p-5">
          <p className="mb-4 text-[13px] font-semibold">By format</p>
          <Bars rows={earn.byFormat.map((f) => ({ label: FORMAT_LABEL[f.format], amount: f.amount }))} />
        </div>
        <div className="bg-card p-5">
          <p className="mb-4 text-[13px] font-semibold">By sponsor</p>
          <Bars
            rows={earn.bySponsor.map((s) => ({
              label: (
                <>
                  {s.name}
                  {s.ageCategory && <span className="ml-1.5 rounded-[2px] border px-1 text-[10px] font-bold">18+</span>}
                </>
              ),
              amount: s.amount,
            }))}
          />
        </div>
        <div className="bg-card p-5">
          <p className="mb-4 text-[13px] font-semibold">By who was watching</p>
          <Bars
            rows={earn.byViewer.map((v) => ({ label: v.state, amount: v.amount, meta: `${Math.round(v.impressions / 1000)}k impressions` }))}
            note="Confirmed adults are a small share of impressions and most of the money. Getting viewers to sign in is the biggest lever."
          />
        </div>
      </div>
    </section>
  )
}
