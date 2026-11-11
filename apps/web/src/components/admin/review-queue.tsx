"use client"

import { useState } from "react"
import { Check, CircleAlert, CircleHelp, ScrollText, X } from "lucide-react"
import { toast } from "sonner"
import { StatusBadge } from "@/components/brand/status-badge"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { cn } from "@/lib/utils"
import type { Creative } from "@/lib/types"
import { ADMIN_USER } from "./data"
import { nowStamp } from "./clock"

type CheckResult = Creative["checks"][number]["result"]
type Decision = "approve" | "reject"

interface Item extends Creative {
  audit?: string
  reason?: string
}

const REJECT_PRESETS = [
  "Promotes odds. Resubmit without prices.",
  "Features a notable person.",
  "Responsible gambling message missing or too small.",
  "Includes an inducement (bonus bets or deposit match).",
]

const CREATIVE_COPY: Record<string, { headline: string; body: string; small?: string }> = {
  cr_riv_1: { headline: "Spring Carnival", body: "Every race, every track. Feature race from $3.50.", small: "Gamble responsibly. For free and confidential support call 1800 858 858 or visit gamblinghelponline.org.au. 18+ only." },
  cr_hb_2: { headline: "Racing, covered", body: "Form, fields and results for every Australian meeting.", small: "Chances are you're about to lose. For free and confidential support call 1800 858 858. 18+ only." },
  cr_boots_1: { headline: "Built for the last quarter", body: "New season boots. Free returns Australia-wide." },
}

function CreativePreview({ c }: { c: Creative }) {
  const copy = CREATIVE_COPY[c.id] ?? { headline: c.name, body: c.advertiser }
  const wide = c.size === "970x250"
  const banner = c.size === "320x100"
  return (
    <div className="rounded-lg border bg-ad-frame p-4 md:p-6">
      <div className="mb-3 flex items-center justify-between text-[12px] text-muted-foreground">
        <span className="font-mono">{c.size.replace("x", " × ")}</span>
        <span>Shown at actual size where it fits</span>
      </div>
      <div className="flex justify-center">
        <div
          className={cn(
            "relative flex max-w-full flex-col justify-between overflow-hidden rounded-[2px] p-4 text-white",
            wide ? "aspect-[970/250] w-[970px] md:p-8" : banner ? "aspect-[320/100] w-[320px]" : "aspect-[300/250] w-[300px]",
          )}
          style={{ background: c.isWagering ? "linear-gradient(135deg,#0b2545,#13315c 60%,#1f6f8b)" : "linear-gradient(135deg,#1f2a1d,#3f5233)" }}
          role="img"
          aria-label={`${c.advertiser} creative: ${copy.headline}. ${copy.body}`}
        >
          <span className="text-[11px] font-bold uppercase tracking-[1px] opacity-80">{c.advertiser}</span>
          <div>
            <p className={cn("font-extrabold leading-tight tracking-[-0.02em]", wide ? "text-[20px] sm:text-[34px] md:text-[44px]" : "text-[26px]")}>{copy.headline}</p>
            <p className={cn("mt-1 opacity-90", wide ? "text-[12px] sm:text-[16px] md:text-[20px]" : "text-[14px]")}>{copy.body}</p>
          </div>
          {copy.small && <p className={cn("leading-snug opacity-80", wide ? "text-[8px] sm:text-[11px]" : "text-[9px]")}>{copy.small}</p>}
        </div>
      </div>
    </div>
  )
}

const RESULT: Record<CheckResult, { label: string; Icon: typeof Check; cls: string }> = {
  pass: { label: "Pass", Icon: Check, cls: "text-foreground" },
  fail: { label: "Fail", Icon: X, cls: "text-destructive" },
  check: { label: "Check", Icon: CircleHelp, cls: "text-foreground" },
}

export function ReviewQueue({ creatives }: { creatives: Creative[] }) {
  const [items, setItems] = useState<Item[]>(creatives)
  const [filter, setFilter] = useState<"pending" | "all">("pending")
  const [selectedId, setSelectedId] = useState(creatives.find((c) => c.status === "pending")?.id ?? creatives[0]?.id)
  const [dialog, setDialog] = useState<Decision | null>(null)
  const [reason, setReason] = useState("")
  const [error, setError] = useState(false)

  const list = filter === "pending" ? items.filter((i) => i.status === "pending") : items
  const selected = items.find((i) => i.id === selectedId)
  const pendingCount = items.filter((i) => i.status === "pending").length

  const setCheck = (idx: number, result: CheckResult) =>
    setItems((xs) =>
      xs.map((x) => (x.id === selectedId ? { ...x, checks: x.checks.map((k, i) => (i === idx ? { ...k, result } : k)) } : x)),
    )

  const open = (d: Decision) => {
    setReason("")
    setError(false)
    setDialog(d)
  }

  const confirm = () => {
    if (!selected || !dialog) return
    if (!reason.trim()) {
      setError(true)
      return
    }
    const status = dialog === "approve" ? "approved" : "rejected"
    const at = nowStamp()
    setItems((xs) =>
      xs.map((x) =>
        x.id === selected.id
          ? { ...x, status, reason: reason.trim(), audit: `${status === "approved" ? "Approved" : "Rejected"} by ${ADMIN_USER}, ${at}. Logged to the audit log as creative.${dialog}.` }
          : x,
      ),
    )
    setDialog(null)
    toast(status === "approved" ? "Approved" : "Rejected", { description: `${selected.advertiser}: ${selected.name}` })
  }

  const hasFail = selected?.checks.some((k) => k.result === "fail")
  const hasOpen = selected?.checks.some((k) => k.result === "check")
  const canApprove = selected?.status === "pending" && !hasFail && !hasOpen

  return (
    <div className="grid gap-6 lg:grid-cols-[340px_minmax(0,1fr)]">
      <aside aria-label="Creatives" className="min-w-0">
        <div className="mb-3 flex gap-1" role="tablist" aria-label="Filter">
          {(["pending", "all"] as const).map((f) => (
            <button
              key={f}
              type="button"
              role="tab"
              aria-selected={filter === f}
              onClick={() => setFilter(f)}
              className={cn(
                "h-8 rounded-md px-3 text-[13px] font-semibold",
                filter === f ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-accent",
              )}
            >
              {f === "pending" ? `Pending ${pendingCount}` : `All ${items.length}`}
            </button>
          ))}
        </div>
        {list.length ? (
          <ul className="divide-y rounded-lg border">
            {list.map((c) => (
              <li key={c.id}>
                <button
                  type="button"
                  onClick={() => setSelectedId(c.id)}
                  aria-current={c.id === selectedId ? "true" : undefined}
                  className={cn(
                    "flex w-full flex-col gap-1.5 px-4 py-3 text-left outline-none hover:bg-accent focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-ring",
                    c.id === selectedId && "bg-accent",
                  )}
                >
                  <span className="flex items-center justify-between gap-2">
                    <span className="truncate text-[14px] font-semibold">{c.name}</span>
                    {c.status === "pending" ? (
                      <StatusBadge tone="neutral">Pending</StatusBadge>
                    ) : c.status === "approved" ? (
                      <StatusBadge tone="published">Approved</StatusBadge>
                    ) : (
                      <StatusBadge tone="failed">Rejected</StatusBadge>
                    )}
                  </span>
                  <span className="text-[13px] text-muted-foreground">{c.advertiser}</span>
                  <span className="flex items-center gap-2 text-[12px] text-muted-foreground">
                    {c.isWagering && <StatusBadge tone="wagering" />}
                    <span className="font-mono">{c.size}</span>
                  </span>
                  <span className="text-[12px] text-muted-foreground">Submitted {c.submittedAt}</span>
                </button>
              </li>
            ))}
          </ul>
        ) : (
          <div className="rounded-lg border border-dashed p-6 text-center text-[14px] text-muted-foreground">
            The queue is clear. New creatives appear here as advertisers submit them.
          </div>
        )}
      </aside>

      {selected ? (
        <section aria-labelledby="creative-title" className="flex min-w-0 flex-col gap-6">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div className="min-w-0">
              <h2 id="creative-title" className="text-[20px] font-bold">{selected.name}</h2>
              <p className="text-[14px] text-muted-foreground">
                {selected.advertiser} · Campaign <span className="font-mono">{selected.campaignId}</span> · Submitted {selected.submittedAt}
              </p>
            </div>
            {selected.status === "pending" && (
              <div className="flex gap-2">
                <Button variant="outline" onClick={() => open("reject")}>
                  <X aria-hidden /> Reject
                </Button>
                <Button onClick={() => open("approve")} disabled={!canApprove}>
                  <Check aria-hidden /> Approve
                </Button>
              </div>
            )}
          </div>

          <CreativePreview c={selected} />

          <div className="grid gap-6 xl:grid-cols-2">
            <div>
              <h3 className="mb-2 text-[15px] font-semibold">
                {selected.isWagering ? "Wagering checklist (ADS-06)" : "Brand-safety checklist"}
              </h3>
              <ul className="divide-y rounded-lg border">
                {selected.checks.map((k, i) => {
                  const r = RESULT[k.result]
                  return (
                    <li key={k.label} className="flex flex-wrap items-center justify-between gap-3 px-4 py-3">
                      <span className="text-[14px]">{k.label}</span>
                      <span className="flex items-center gap-2">
                        <span className={cn("inline-flex items-center gap-1 text-[12px] font-bold uppercase tracking-[0.8px]", r.cls)}>
                          <r.Icon className="size-3.5" aria-hidden /> {r.label}
                        </span>
                        {selected.status === "pending" && k.result !== "pass" && (
                          <span className="flex gap-1">
                            <Button size="xs" variant="outline" onClick={() => setCheck(i, "pass")} aria-label={`Mark "${k.label}" as pass`}>
                              Pass
                            </Button>
                            {k.result !== "fail" && (
                              <Button size="xs" variant="outline" onClick={() => setCheck(i, "fail")} aria-label={`Mark "${k.label}" as fail`}>
                                Fail
                              </Button>
                            )}
                          </span>
                        )}
                      </span>
                    </li>
                  )
                })}
              </ul>
              {selected.status === "pending" && (hasFail || hasOpen) && (
                <p className="mt-2 flex items-start gap-1.5 text-[13px] text-muted-foreground">
                  <CircleAlert className="mt-0.5 size-3.5 shrink-0" aria-hidden />
                  {hasFail ? "A check fails, so this creative can only be rejected." : "Resolve every check before you approve."}
                </p>
              )}
            </div>
            <div>
              <h3 className="mb-2 text-[15px] font-semibold">Audit</h3>
              <div className="rounded-lg border bg-muted/50 p-4 text-[13px] leading-[20px]">
                <p className="flex items-start gap-2">
                  <ScrollText className="mt-0.5 size-4 shrink-0" aria-hidden />
                  <span>
                    {selected.audit ??
                      (selected.status === "pending"
                        ? "Your decision and reason are written to the audit log with your name and the time. Wagering creatives serve only after approval."
                        : `Decision recorded. ${selected.status === "approved" ? "Approved" : "Rejected"} before this session.`)}
                  </span>
                </p>
                {selected.reason && (
                  <p className="mt-3 border-t pt-3">
                    <span className="font-semibold">Reason: </span>
                    {selected.reason}
                  </p>
                )}
              </div>
            </div>
          </div>
        </section>
      ) : null}

      <Dialog open={dialog !== null} onOpenChange={(o) => !o && setDialog(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{dialog === "approve" ? "Approve creative" : "Reject creative"}</DialogTitle>
            <DialogDescription>
              {selected?.advertiser}: {selected?.name}. The reason goes to the audit log
              {dialog === "reject" ? " and to the advertiser." : "."}
            </DialogDescription>
          </DialogHeader>
          {dialog === "reject" && (
            <div className="flex flex-wrap gap-2">
              {REJECT_PRESETS.map((p) => (
                <button
                  key={p}
                  type="button"
                  onClick={() => {
                    setReason(p)
                    setError(false)
                  }}
                  className="rounded-full border border-input px-3 py-1 text-left text-[12px] font-medium hover:bg-accent"
                >
                  {p}
                </button>
              ))}
            </div>
          )}
          <div className="flex flex-col gap-2">
            <Label htmlFor="decision-reason">Reason (required)</Label>
            <Textarea
              id="decision-reason"
              value={reason}
              onChange={(e) => {
                setReason(e.target.value)
                if (e.target.value.trim()) setError(false)
              }}
              placeholder={dialog === "approve" ? "e.g. All checks pass. RG message legible at actual size." : "Say what to fix so the advertiser can resubmit."}
              aria-invalid={error || undefined}
              aria-describedby={error ? "reason-error" : undefined}
              rows={3}
            />
            {error && (
              <p id="reason-error" className="text-[13px] text-destructive">
                Add a reason. Every review decision is logged with one.
              </p>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialog(null)}>
              Cancel
            </Button>
            <Button variant={dialog === "reject" ? "destructive" : "default"} onClick={confirm}>
              {dialog === "approve" ? "Approve" : "Reject"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
