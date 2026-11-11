"use client"

import { useState } from "react"
import { AlertTriangle, Check, CreditCard, Download } from "lucide-react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Progress } from "@/components/ui/progress"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { StatusBadge } from "@/components/brand/status-badge"
import { aud } from "@/lib/format"
import { cn } from "@/lib/utils"
import type { Plan } from "@/lib/types"
import { Panel, PanelBody, PanelFooter, Section } from "./section"

const ORDER: Plan[] = ["starter", "pro", "publisher", "enterprise"]

const PLANS: Record<Plan, { name: string; price: number | null; for: string; features: string[]; loses?: string[] }> = {
  starter: {
    name: "Starter",
    price: 29,
    for: "Solo creators getting started",
    features: ["1 channel on a Homestand subdomain", "10 video hours a month", "Draft articles and shorts", "All three templates"],
    loses: [
      "footyfix.com.au stops serving your channel. Old links redirect to footyfix.homestand.com.au.",
      "Triple lock mode switches off, so your channel moves to Standard mode and wagering ads stop.",
      "Video hours drop to 10 a month. You've used 18.5 this month, so new imports pause until 1 December.",
    ],
  },
  pro: {
    name: "Pro",
    price: 99,
    for: "Established creators",
    features: ["Custom domain", "40 video hours a month", "Triple lock mode", "Ad revenue share (next phase)", "Priority processing"],
  },
  publisher: {
    name: "Publisher",
    price: 299,
    for: "Small media brands and clubs",
    features: ["Everything in Pro", "3 channels and team roles", "150 video hours a month", "Migration help from our team", "Google AdSense in unsold slots"],
  },
  enterprise: {
    name: "Enterprise",
    price: null,
    for: "Networks and large publishers",
    features: ["Unlimited channels", "White-glove migration", "Service level agreement", "Dedicated support"],
  },
}

const gst = (incl: number) => Math.round((incl / 11) * 100) / 100

const INVOICES = [
  { id: "HS-2026-0412", date: "1 October 2026", description: "Starter, October 2026", amount: 29, status: "Paid" },
  { id: "HS-2026-0288", date: "1 September 2026", description: "Starter, September 2026", amount: 29, status: "Paid" },
  { id: "HS-2026-0164", date: "1 August 2026", description: "Starter, August 2026", amount: 29, status: "Paid" },
]

export function Billing({ currentPlan }: { currentPlan: Plan }) {
  const [plan, setPlan] = useState<Plan>(currentPlan)
  const [pending, setPending] = useState<Plan | null>(null)
  const [cardOpen, setCardOpen] = useState(false)
  const [card, setCard] = useState({ label: "Visa ending 4242", expiry: "08/2028" })
  const current = PLANS[plan]
  const hoursUsed = 18.5
  const hoursIncluded = plan === "starter" ? 10 : plan === "publisher" ? 150 : 40
  const pct = Math.min(100, Math.round((hoursUsed / hoursIncluded) * 100))

  const target = pending ? PLANS[pending] : null
  const isUpgrade = pending ? ORDER.indexOf(pending) > ORDER.indexOf(plan) : false

  return (
    <div>
      <Section id="plan" title="Current plan" description="Prices are in Australian dollars and include GST. Change or cancel at any time.">
        <Panel>
          <div className="grid gap-5 p-4 sm:p-5 md:grid-cols-2">
            <div>
              <p className="flex flex-wrap items-center gap-2">
                <span className="text-xl font-bold tracking-[-0.3px]">{current.name}</span>
                {plan === currentPlan && <StatusBadge tone="scheduled">Free trial</StatusBadge>}
              </p>
              <p className="mt-1 text-sm">
                {plan === currentPlan ? (
                  <>
                    <span className="font-semibold">9 days left.</span> Your trial ends 20 November 2026, then {aud(current.price!, false)} a month inc. GST.
                  </>
                ) : current.price ? (
                  <>From 20 November 2026: {aud(current.price, false)} a month inc. GST.</>
                ) : (
                  "Our team will be in touch about pricing."
                )}
              </p>
              <p className="mt-1 text-[13px] text-muted-foreground">No charge until the trial ends. We&apos;ll email you 3 days before.</p>
            </div>
            <div className="grid content-start gap-2">
              <div className="flex items-baseline justify-between gap-3">
                <span className="text-sm font-medium">Video hours this month</span>
                <span className="text-sm tabular">
                  <span className="font-semibold">{hoursUsed}</span> of {hoursIncluded}
                </span>
              </div>
              <Progress value={pct} aria-label={`${hoursUsed} of ${hoursIncluded} video hours used`} className="h-2 bg-muted [&>[data-slot=progress-indicator]]:bg-pitch" />
              <p className="text-[13px] text-muted-foreground">
                {hoursUsed > hoursIncluded
                  ? "Over this plan's hours. New imports pause until 1 December."
                  : `${(hoursIncluded - hoursUsed).toFixed(1)} hours left. Resets 1 December 2026. Imports and uploads both count.`}
              </p>
            </div>
          </div>
          <PanelFooter note="Cancelling ends your trial now. Your channel stays up, read-only, for 30 days.">
            <Button variant="ghost" size="sm" onClick={() => toast.success("Trial cancelled", { description: "Changed your mind? Pick a plan below." })}>
              Cancel trial
            </Button>
          </PanelFooter>
        </Panel>
      </Section>

      <Section id="plans" title="Plans" description="Upgrade takes effect straight away. Downgrades apply at the end of your trial or billing month.">
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          {ORDER.map((id) => {
            const p = PLANS[id]
            const isCurrent = id === plan
            const up = ORDER.indexOf(id) > ORDER.indexOf(plan)
            return (
              <div key={id} className={cn("flex flex-col rounded-lg border bg-card p-4", isCurrent && "border-foreground ring-1 ring-foreground")}>
                <div className="flex items-center justify-between gap-2">
                  <p className="text-sm font-semibold">{p.name}</p>
                  {isCurrent && <StatusBadge tone="published">Current</StatusBadge>}
                </div>
                <p className="mt-2">
                  {p.price ? (
                    <>
                      <span className="text-2xl font-bold tracking-[-0.5px] tabular">{aud(p.price, false)}</span>
                      <span className="text-[13px] text-muted-foreground"> a month inc. GST</span>
                    </>
                  ) : (
                    <span className="text-2xl font-bold tracking-[-0.5px]">On request</span>
                  )}
                </p>
                <p className="mt-1 text-[13px] text-muted-foreground">{p.for}</p>
                <ul className="mt-4 grid flex-1 content-start gap-1.5 text-[13px]">
                  {p.features.map((f) => (
                    <li key={f} className="flex gap-2">
                      <Check className="mt-0.5 size-3.5 shrink-0" aria-hidden /> {f}
                    </li>
                  ))}
                </ul>
                <div className="mt-4">
                  {isCurrent ? (
                    <Button variant="outline" size="sm" className="w-full" disabled>
                      Your plan
                    </Button>
                  ) : id === "enterprise" ? (
                    <Button variant="outline" size="sm" className="w-full" asChild>
                      <a href="mailto:sales@homestand.com.au?subject=Enterprise%20plan">Talk to us</a>
                    </Button>
                  ) : (
                    <Button variant={up ? "default" : "outline"} size="sm" className="w-full" onClick={() => setPending(id)} aria-label={up ? `Upgrade to ${p.name}` : `Downgrade to ${p.name}`}>
                      {up ? "Upgrade" : "Downgrade"}
                    </Button>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      </Section>

      <Section id="payment" title="Payment method" description="Cards are stored and charged by Stripe. We never see your full card number.">
        <Panel>
          <div className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between sm:p-5">
            <div className="flex items-center gap-3">
              <span className="grid h-9 w-12 place-items-center rounded-md border bg-background">
                <CreditCard className="size-5" aria-hidden />
              </span>
              <div>
                <p className="text-sm font-medium">{card.label}</p>
                <p className="text-[13px] text-muted-foreground">Expires {card.expiry} · Sam Doherty</p>
              </div>
            </div>
            <Button variant="outline" size="sm" className="self-start sm:self-auto" onClick={() => setCardOpen(true)}>
              Update card
            </Button>
          </div>
        </Panel>
      </Section>

      <Section id="details" title="Tax invoice details" description="Shown on every tax invoice. Add your ABN if you claim GST credits.">
        <Panel>
          <PanelBody className="sm:grid-cols-2">
            <div className="grid gap-2">
              <Label htmlFor="bill-name">Business or legal name</Label>
              <Input id="bill-name" defaultValue="Footy Fix Media" />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="bill-abn">ABN</Label>
              <Input id="bill-abn" defaultValue="51 824 753 556" inputMode="numeric" className="font-mono" />
            </div>
            <div className="grid gap-2 sm:col-span-2">
              <Label htmlFor="bill-email">Send invoices to</Label>
              <Input id="bill-email" type="email" defaultValue="accounts@footyfix.com.au" className="sm:max-w-[360px]" />
            </div>
          </PanelBody>
          <PanelFooter>
            <Button size="sm" onClick={() => toast.success("Saved")}>
              Save
            </Button>
          </PanelFooter>
        </Panel>
      </Section>

      <Section id="invoices" title="Invoices" description="Every invoice is a tax invoice from Homestand Pty Ltd, with GST shown.">
        <Panel>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="pl-4 sm:pl-5">Date</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead className="text-right">Total inc. GST</TableHead>
                  <TableHead className="hidden text-right sm:table-cell">GST</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="pr-4 text-right sm:pr-5">
                    <span className="sr-only">Download</span>
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {current.price && (
                  <TableRow className="bg-muted/40">
                    <TableCell className="pl-4 sm:pl-5">20 November 2026</TableCell>
                    <TableCell>{current.name}, first month</TableCell>
                    <TableCell className="text-right tabular">{aud(current.price)}</TableCell>
                    <TableCell className="hidden text-right tabular text-muted-foreground sm:table-cell">{aud(gst(current.price))}</TableCell>
                    <TableCell>
                      <StatusBadge tone="scheduled">Upcoming</StatusBadge>
                    </TableCell>
                    <TableCell className="pr-4 sm:pr-5" />
                  </TableRow>
                )}
                {INVOICES.map((inv) => (
                  <TableRow key={inv.id}>
                    <TableCell className="pl-4 sm:pl-5">{inv.date}</TableCell>
                    <TableCell>
                      {inv.description}
                      <span className="block font-mono text-xs text-muted-foreground">{inv.id}</span>
                    </TableCell>
                    <TableCell className="text-right tabular">{aud(inv.amount)}</TableCell>
                    <TableCell className="hidden text-right tabular text-muted-foreground sm:table-cell">{aud(gst(inv.amount))}</TableCell>
                    <TableCell>
                      <StatusBadge tone="neutral">{inv.status}</StatusBadge>
                    </TableCell>
                    <TableCell className="pr-4 text-right sm:pr-5">
                      <Button variant="ghost" size="icon-sm" aria-label={`Download invoice ${inv.id} as PDF`} onClick={() => toast.success("Downloaded", { description: `${inv.id}.pdf` })}>
                        <Download />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </Panel>
      </Section>

      <Dialog open={!!pending} onOpenChange={(o) => !o && setPending(null)}>
        <DialogContent>
          {target && pending && (
            <>
              <DialogHeader>
                <DialogTitle>
                  {isUpgrade ? "Upgrade" : "Downgrade"} to {target.name}?
                </DialogTitle>
                <DialogDescription>
                  {isUpgrade
                    ? `You get ${target.name} features now and stay on your free trial until 20 November 2026. Then it's ${aud(target.price!)} a month, including ${aud(gst(target.price!))} GST.`
                    : `From 20 November 2026 you'll pay ${aud(target.price!)} a month, including ${aud(gst(target.price!))} GST.`}
                </DialogDescription>
              </DialogHeader>
              {!isUpgrade && target.loses && (
                <div className="grid gap-2 rounded-md border border-destructive/40 p-3">
                  <p className="flex items-center gap-2 text-sm font-medium">
                    <AlertTriangle className="size-4 text-destructive" aria-hidden /> What changes on Starter
                  </p>
                  <ul className="grid gap-1.5 text-[13px] leading-5 text-muted-foreground">
                    {target.loses.map((l) => (
                      <li key={l}>{l}</li>
                    ))}
                  </ul>
                </div>
              )}
              <DialogFooter>
                <DialogClose asChild>
                  <Button variant="outline">Keep {current.name}</Button>
                </DialogClose>
                <Button
                  variant={isUpgrade ? "default" : "destructive"}
                  onClick={() => {
                    setPlan(pending)
                    setPending(null)
                    toast.success(isUpgrade ? `Upgraded to ${target.name}` : `Downgrade to ${target.name} scheduled`)
                  }}
                >
                  {isUpgrade ? `Upgrade to ${target.name}` : `Downgrade to ${target.name}`}
                </Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>

      <Dialog open={cardOpen} onOpenChange={setCardOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Update your card</DialogTitle>
            <DialogDescription>We&apos;ll open Stripe&apos;s secure page to add a new card. Your next charge, on 20 November 2026, uses the new card.</DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline">Cancel</Button>
            </DialogClose>
            <Button
              onClick={() => {
                setCardOpen(false)
                setCard({ label: "Mastercard ending 5100", expiry: "03/2030" })
                toast.success("Card updated", { description: "Mastercard ending 5100 is now your payment method." })
              }}
            >
              Continue to Stripe
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
