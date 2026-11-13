"use client"

import { useState } from "react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Slider } from "@/components/ui/slider"
import { cn } from "@/lib/utils"
import type { CreditAccount } from "@/lib/types"

const n = (x: number) => x.toLocaleString("en-AU")

export function CreditsPanel({
  account,
  topUps,
  prices,
}: {
  account: CreditAccount
  topUps: { credits: number; price: number; note?: string }[]
  prices: [string, string][]
}) {
  const [balance, setBalance] = useState(account.balance)
  const [ledger, setLedger] = useState(account.ledger)
  const [cap, setCap] = useState(account.cap)
  const usedPct = Math.min(100, (account.usedThisMonth / cap) * 100)

  return (
    <div className="grid gap-8">
      <section aria-label="Balance" className="grid gap-px overflow-hidden rounded-lg border bg-border md:grid-cols-[1.2fr_1fr_1fr]">
        <div className="flex flex-col gap-2 bg-card p-5">
          <p className="text-[13px] font-medium text-muted-foreground">Balance</p>
          <p className="text-[40px] font-bold leading-[44px] tracking-[-1px]">{n(balance)}</p>
          <p className="text-[13px] text-muted-foreground">credits, shared by every publication on your account</p>
        </div>
        <div className="flex flex-col gap-2 bg-card p-5">
          <p className="text-[13px] font-medium text-muted-foreground">Used this month</p>
          <p className="text-[28px] font-bold leading-8 tracking-[-0.6px]">{n(account.usedThisMonth)}</p>
          <div className="h-2 overflow-hidden rounded-full bg-muted" aria-hidden>
            <div className={cn("h-full rounded-full", usedPct > 80 ? "bg-destructive" : "bg-chart-1")} style={{ width: `${usedPct}%` }} />
          </div>
          <p className="text-[12px] text-muted-foreground">
            of a {n(cap)} monthly cap. We ask before going over, and email you at 80%.
          </p>
        </div>
        <div className="flex flex-col gap-2 bg-card p-5">
          <p className="text-[13px] font-medium text-muted-foreground">Monthly allowance</p>
          <p className="text-[28px] font-bold leading-8 tracking-[-0.6px]">{n(account.monthlyIncluded)}</p>
          <p className="text-[12px] text-muted-foreground">Included with Publisher. Renews {account.renewsOn}.</p>
        </div>
      </section>

      <section aria-labelledby="topup-h">
        <h2 id="topup-h" className="mb-3 text-lg font-semibold tracking-[-0.2px]">
          Top up
        </h2>
        <ul className="grid gap-3 sm:grid-cols-3">
          {topUps.map((t, i) => (
            <li key={t.credits} className={cn("flex flex-col gap-3 rounded-lg border bg-card p-5", i === 1 && "ring-1 ring-foreground")}>
              <p className="flex items-baseline justify-between gap-2">
                <span className="text-[22px] font-bold tracking-[-0.4px]">{n(t.credits)}</span>
                {t.note && <span className="rounded-sm bg-muted px-1.5 text-[11px] font-semibold">{t.note}</span>}
              </p>
              <p className="text-[14px] text-muted-foreground">
                ${n(t.price)} inc. GST · about {Math.round(t.credits / 45)} shorts or {Math.round(t.credits / 150)} explainers
              </p>
              <Button
                variant={i === 1 ? "default" : "outline"}
                onClick={() => {
                  setBalance((b) => b + t.credits)
                  setLedger((l) => [{ id: `top_${Date.now()}`, at: "13 November 2026", description: `Top-up: ${n(t.credits)} credits ($${n(t.price)} inc. GST)`, credits: t.credits }, ...l])
                  toast.success(`${n(t.credits)} credits added`, { description: `Charged $${n(t.price)} inc. GST. They roll over for 12 months.` })
                }}
              >
                Buy {n(t.credits)}
              </Button>
            </li>
          ))}
        </ul>
      </section>

      <section aria-labelledby="cap-h" className="rounded-lg border bg-card p-5">
        <div className="flex flex-wrap items-baseline justify-between gap-2">
          <h2 id="cap-h" className="text-[15px] font-semibold">
            Monthly spend cap
          </h2>
          <span className="text-[15px] font-semibold">{n(cap)} credits · about ${n(Math.round(cap / 10))}</span>
        </div>
        <p className="mt-1 text-[13px] text-muted-foreground">Nothing renders past the cap without someone saying yes. Set a cap for each publication in its own settings.</p>
        <Slider className="mt-4" min={1000} max={20000} step={500} value={[cap]} onValueChange={([v]) => setCap(v)} aria-label="Monthly spend cap" />
      </section>

      <div className="grid gap-8 lg:grid-cols-[1.3fr_1fr]">
        <section aria-labelledby="ledger-h">
          <h2 id="ledger-h" className="mb-3 text-lg font-semibold tracking-[-0.2px]">
            Usage
          </h2>
          <ul className="divide-y rounded-lg border bg-card">
            {ledger.map((e) => (
              <li key={e.id} className="flex items-center gap-4 p-3 text-[14px] sm:px-4">
                <span className="min-w-0 flex-1">
                  <span className="block truncate">{e.description}</span>
                  <span className="text-[12px] text-muted-foreground">
                    {e.at}
                    {e.publication && ` · ${e.publication}`}
                  </span>
                </span>
                <span className={cn("shrink-0 font-semibold", e.credits > 0 && "text-pop-ink")}>
                  {e.credits > 0 ? "+" : ""}
                  {n(e.credits)}
                </span>
              </li>
            ))}
          </ul>
        </section>
        <section aria-labelledby="prices-h">
          <h2 id="prices-h" className="mb-3 text-lg font-semibold tracking-[-0.2px]">
            What things cost
          </h2>
          <dl className="divide-y rounded-lg border bg-card text-[14px]">
            {prices.map(([label, credits]) => (
              <div key={label} className="flex items-center justify-between gap-3 p-3 sm:px-4">
                <dt className="text-muted-foreground">{label}</dt>
                <dd className="shrink-0 font-semibold">{credits}</dd>
              </div>
            ))}
          </dl>
          <p className="mt-2 text-[12px] text-muted-foreground">Sample prices while we test them in the pilot.</p>
        </section>
      </div>
    </div>
  )
}
