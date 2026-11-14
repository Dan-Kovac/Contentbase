"use client"

import { useState } from "react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Slider } from "@/components/ui/slider"
import { cn } from "@/lib/utils"
import { MARGIN, money, type Rate } from "@/lib/credits"
import type { CreditAccount, LedgerEntry } from "@/lib/types"

const KIND_LABEL: Record<LedgerEntry["kind"], string> = {
  allowance: "Allowance",
  topup: "Top-up",
  hold: "Hold",
  charge: "Charge",
  release: "Released",
}

const pct = `${Math.round(MARGIN * 100)}%`

export function CreditsPanel({
  account,
  topUps,
  rates,
  publication,
}: {
  account: CreditAccount
  topUps: number[]
  rates: (Rate & { price: number })[]
  /** The publication the studio is working on, for the ledger filter. */
  publication: string
}) {
  const [balance, setBalance] = useState(account.balance)
  const [ledger, setLedger] = useState(account.ledger)
  const [cap, setCap] = useState(account.cap)
  const [scope, setScope] = useState<"this" | "all">("this")
  const usedPct = Math.min(100, (account.usedThisMonth / cap) * 100)
  const rows = scope === "all" ? ledger : ledger.filter((e) => e.publication === publication)

  return (
    <div className="grid grid-cols-1 gap-8">
      <section aria-label="Balance" className="grid grid-cols-1 gap-px overflow-hidden rounded-lg border bg-border md:grid-cols-[1.2fr_1fr_1fr]">
        <div className="flex flex-col gap-2 bg-card p-5">
          <p className="text-[13px] font-medium text-muted-foreground">Balance</p>
          <p className="text-[40px] font-bold leading-[44px] tracking-[-1px]">{money(balance)}</p>
          <p className="text-[13px] text-muted-foreground">Shared by every publication on your account</p>
        </div>
        <div className="flex flex-col gap-2 bg-card p-5">
          <p className="text-[13px] font-medium text-muted-foreground">Used this month</p>
          <p className="text-[28px] font-bold leading-8 tracking-[-0.6px]">{money(account.usedThisMonth)}</p>
          <div className="h-2 overflow-hidden rounded-full bg-muted" aria-hidden>
            <div className={cn("h-full rounded-full", usedPct > 80 ? "bg-destructive" : "bg-chart-1")} style={{ width: `${usedPct}%` }} />
          </div>
          <p className="text-[12px] text-muted-foreground">of a {money(cap)} monthly cap. We ask before going over, and email you at 80%.</p>
        </div>
        <div className="flex flex-col gap-2 bg-card p-5">
          <p className="text-[13px] font-medium text-muted-foreground">Included with your plan</p>
          <p className="text-[28px] font-bold leading-8 tracking-[-0.6px]">{money(account.monthlyIncluded)}</p>
          <p className="text-[12px] text-muted-foreground">A month on Publisher. Renews {account.renewsOn}.</p>
        </div>
      </section>

      <section aria-labelledby="rates-h">
        <div className="mb-3 flex flex-wrap items-baseline justify-between gap-2">
          <h2 id="rates-h" className="text-lg font-semibold tracking-[-0.2px]">
            Provider cost plus {pct}
          </h2>
          <p className="text-[13px] text-muted-foreground">What each provider charges us, plus {pct}. Nothing else.</p>
        </div>
        <div className="overflow-x-auto rounded-lg border bg-card">
          <table className="w-full min-w-[560px] text-[14px]">
            <thead className="text-left text-[12px] text-muted-foreground">
              <tr className="border-b">
                <th className="px-4 py-2.5 font-medium">Work</th>
                <th className="px-4 py-2.5 font-medium">Provider</th>
                <th className="px-4 py-2.5 text-right font-medium">Their price</th>
                <th className="px-4 py-2.5 text-right font-medium">You pay</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {rates.map((r) => (
                <tr key={r.label}>
                  <td className="px-4 py-2.5">
                    {r.label} <span className="text-muted-foreground">per {r.unit}</span>
                  </td>
                  <td className="px-4 py-2.5 text-muted-foreground">{r.provider}</td>
                  <td className="px-4 py-2.5 text-right text-muted-foreground">{r.cost === 0 ? "Free" : `$${r.cost.toFixed(3).replace(/0$/, "")}`}</td>
                  <td className="px-4 py-2.5 text-right font-semibold">{r.price === 0 ? "Free" : `$${(r.cost * (1 + MARGIN)).toFixed(3).replace(/0$/, "")}`}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="mt-2 text-[12px] text-muted-foreground">
          A 45-second short costs about 15 cents; a 6-minute explainer about 85 cents. Prices in AUD, inc. GST, rounded to the cent on each charge. Sample provider rates, checked November 2026.
        </p>
      </section>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-[1fr_1fr]">
        <section aria-labelledby="topup-h">
          <h2 id="topup-h" className="mb-3 text-lg font-semibold tracking-[-0.2px]">
            Top up
          </h2>
          <div className="flex flex-wrap gap-2 rounded-lg border bg-card p-5">
            {topUps.map((amount, i) => (
              <Button
                key={amount}
                variant={i === 1 ? "default" : "outline"}
                onClick={() => {
                  setBalance((b) => b + amount)
                  setLedger((l) => [{ id: `top_${Date.now()}`, at: "Just now", kind: "topup", description: "Top-up, card ending 4242", amount }, ...l])
                  toast.success(`${money(amount)} added`, { description: "It never expires and every publication can use it." })
                }}
              >
                Add {money(amount).replace(".00", "")}
              </Button>
            ))}
            <p className="basis-full text-[13px] text-muted-foreground">The same rate at every size. Unused balance never expires.</p>
          </div>
        </section>

        <section aria-labelledby="cap-h">
          <h2 id="cap-h" className="mb-3 text-lg font-semibold tracking-[-0.2px]">
            Monthly cap
          </h2>
          <div className="rounded-lg border bg-card p-5">
            <p className="flex items-baseline justify-between text-[15px] font-semibold">
              {money(cap)} <span className="text-[13px] font-normal text-muted-foreground">a month, across your publications</span>
            </p>
            <Slider className="mt-4" min={10} max={500} step={10} value={[cap]} onValueChange={([v]) => setCap(v)} aria-label="Monthly cap" />
            <p className="mt-3 text-[13px] text-muted-foreground">Nothing runs past the cap without someone saying yes.</p>
          </div>
        </section>
      </div>

      <section aria-labelledby="ledger-h">
        <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
          <h2 id="ledger-h" className="text-lg font-semibold tracking-[-0.2px]">
            Ledger
          </h2>
          <div className="inline-flex rounded-md border p-0.5 text-[13px]" role="group" aria-label="Show">
            {(["this", "all"] as const).map((s) => (
              <button
                key={s}
                type="button"
                aria-pressed={scope === s}
                onClick={() => setScope(s)}
                className={cn("rounded-[5px] px-2.5 py-1 font-medium outline-none focus-visible:ring-2 focus-visible:ring-ring", scope === s ? "bg-foreground text-background" : "text-muted-foreground hover:text-foreground")}
              >
                {s === "all" ? "All publications" : publication}
              </button>
            ))}
          </div>
        </div>
        <ul className="divide-y rounded-lg border bg-card">
          {rows.map((e) => (
            <li key={e.id} className="flex items-center gap-4 p-3 text-[14px] sm:px-4">
              <span className="w-[72px] shrink-0">
                <span className={cn("rounded-sm px-1.5 py-0.5 text-[11px] font-semibold", e.amount > 0 ? "bg-pop/15 text-pop-ink" : "bg-muted text-muted-foreground")}>{KIND_LABEL[e.kind]}</span>
              </span>
              <span className="min-w-0 flex-1">
                <span className="block truncate">{e.description}</span>
                <span className="text-[12px] text-muted-foreground">
                  {e.at}
                  {e.publication && ` · ${e.publication}`}
                  {e.cost !== undefined && ` · cost $${e.cost.toFixed(2)} + ${pct}`}
                </span>
              </span>
              <span className={cn("shrink-0 font-semibold tabular-nums", e.amount > 0 && "text-pop-ink")}>
                {e.amount > 0 ? "+" : ""}
                {money(e.amount)}
              </span>
            </li>
          ))}
          {rows.length === 0 && <li className="p-4 text-[14px] text-muted-foreground">Nothing for {publication} yet.</li>}
        </ul>
        <p className="mt-2 text-[12px] text-muted-foreground">Every render holds its estimate first. Success charges it; a failure releases it. The balance is always the sum of this ledger.</p>
      </section>
    </div>
  )
}
