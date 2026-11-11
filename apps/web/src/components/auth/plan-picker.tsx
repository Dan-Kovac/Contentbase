"use client"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { CreditCard } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Spinner } from "@/components/ui/spinner"
import { Switch } from "@/components/ui/switch"
import { PLANS, TRIAL_ENDS } from "@/components/marketing/plans"
import type { Plan } from "@/lib/types"
import { cn } from "@/lib/utils"
import { useSignupDraft } from "./signup-draft"

const SELF_SERVE = PLANS.filter((p) => p.price != null)

const SUMMARY: Record<string, string> = {
  starter: "1 channel · subdomain · 10 video hours a month",
  pro: "Your own domain · 40 video hours · age-verified ads · ad revenue share",
  publisher: "3 channels · team roles · 150 video hours · migration help",
}

/** Step 5: choose a plan. 14-day trial, card optional. */
export function PlanPicker() {
  const router = useRouter()
  const [draft, update] = useSignupDraft()
  const [addCard, setAddCard] = useState(false)
  const [busy, setBusy] = useState(false)
  const plan = SELF_SERVE.find((p) => p.id === draft.plan) ?? SELF_SERVE[1]

  return (
    <form
      className="flex flex-col gap-8"
      onSubmit={(e) => {
        e.preventDefault()
        setBusy(true)
        setTimeout(() => router.push("/signup/importing"), 800)
      }}
    >
      <fieldset>
        <legend className="sr-only">Plan</legend>
        <RadioGroup value={plan.id} onValueChange={(v) => update({ plan: v as Plan })} className="gap-2">
          {SELF_SERVE.map((p) => (
            <Label
              key={p.id}
              htmlFor={`plan-${p.id}`}
              className={cn(
                "flex cursor-pointer items-start gap-3 rounded-lg border p-4 font-normal transition-colors hover:bg-accent",
                plan.id === p.id && "border-foreground ring-1 ring-foreground",
              )}
            >
              <RadioGroupItem id={`plan-${p.id}`} value={p.id} className="mt-1" />
              <span className="flex min-w-0 flex-1 flex-col gap-1">
                <span className="flex flex-wrap items-baseline justify-between gap-x-3">
                  <span className="flex items-center gap-2 text-[16px] font-bold">
                    {p.name}
                    {p.featured && (
                      <span className="rounded-[2px] bg-primary px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-[0.8px] text-primary-foreground">
                        Most chosen
                      </span>
                    )}
                  </span>
                  <span className="whitespace-nowrap text-[15px] font-semibold tabular">
                    ${p.price} <span className="text-[13px] font-normal text-muted-foreground">a month inc. GST</span>
                  </span>
                </span>
                <span className="text-[13px] leading-5 text-muted-foreground">{SUMMARY[p.id]}</span>
              </span>
            </Label>
          ))}
        </RadioGroup>
        <p className="mt-3 text-[13px] text-muted-foreground">
          Bigger than this?{" "}
          <Link href="/pricing#enterprise" className="font-semibold text-foreground underline-offset-4 hover:underline">
            Enterprise
          </Link>{" "}
          includes unlimited channels and white-glove migration.
        </p>
      </fieldset>

      <div className="flex flex-col gap-4 rounded-lg border p-4">
        <div className="flex items-start justify-between gap-4">
          <div className="flex flex-col gap-1">
            <Label htmlFor="add-card" className="text-[15px] font-semibold">
              Add a card now
            </Label>
            <p id="add-card-note" className="text-[13px] leading-5 text-muted-foreground">
              Optional. Without one, your channel pauses on {TRIAL_ENDS} until you choose a plan. Nothing is deleted.
            </p>
          </div>
          <Switch id="add-card" checked={addCard} onCheckedChange={setAddCard} aria-describedby="add-card-note" />
        </div>
        {addCard && (
          <div className="grid gap-3 border-t pt-4 sm:grid-cols-[1fr_96px_80px]">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="cc-number" className="text-[13px]">
                Card number
              </Label>
              <div className="relative">
                <CreditCard className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" aria-hidden />
                <Input id="cc-number" inputMode="numeric" autoComplete="cc-number" placeholder="1234 1234 1234 1234" className="h-10 pl-9" />
              </div>
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="cc-exp" className="text-[13px]">
                Expiry
              </Label>
              <Input id="cc-exp" autoComplete="cc-exp" placeholder="MM / YY" className="h-10" />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="cc-cvc" className="text-[13px]">
                CVC
              </Label>
              <Input id="cc-cvc" inputMode="numeric" autoComplete="cc-csc" placeholder="123" className="h-10" />
            </div>
            <p className="text-[12px] text-muted-foreground sm:col-span-3">
              We charge ${plan.price} inc. GST on {TRIAL_ENDS}, then monthly. Cancel any time before then and you pay nothing.
            </p>
          </div>
        )}
      </div>

      <div className="flex flex-col gap-3">
        <Button type="submit" variant="pop" size="xl" className="w-full" disabled={busy}>
          {busy && <Spinner />}
          Start 14-day free trial
        </Button>
        <p className="text-center text-[13px] text-muted-foreground">
          {plan.name} · ${plan.price} a month inc. GST after {TRIAL_ENDS}
        </p>
      </div>
    </form>
  )
}
