"use client"

import { useState } from "react"
import Link from "next/link"
import { ArrowUpRight, Clock, Flag } from "lucide-react"
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
import { ADMIN_USER, type Report } from "./data"
import { nowStamp } from "./clock"

type Item = Report & { resolution?: string }
type Decision = "takedown" | "dismiss"

function noticeFor(r: Report) {
  return `Hi ${r.channel} team,

We've taken down "${r.contentTitle}" after viewer reports (${r.reason.toLowerCase()}).

What we found: ${r.excerpt}

What to do: edit the ${r.contentType.toLowerCase()} in your studio to remove this, then republish. It goes live again once you do. If you think we got this wrong, reply to this email and we'll review it within one business day.

Homestand Trust and Safety`
}

function SlaLabel({ r }: { r: Report }) {
  if (r.status !== "open") return null
  return (
    <span className={cn("inline-flex items-center gap-1 text-[12px] font-semibold", r.minutesLeft <= 0 && "text-destructive")}>
      <Clock className="size-3.5" aria-hidden />
      {r.minutesLeft > 0 ? `${r.minutesLeft} min left` : "Past the 1-hour target"}
    </span>
  )
}

export function ModerationQueue({ reports }: { reports: Report[] }) {
  const [items, setItems] = useState<Item[]>(reports)
  const [selectedId, setSelectedId] = useState(reports[0]?.id)
  const [dialog, setDialog] = useState<Decision | null>(null)
  const [text, setText] = useState("")
  const [error, setError] = useState(false)
  const selected = items.find((i) => i.id === selectedId)
  const open = items.filter((i) => i.status === "open").length

  const start = (d: Decision) => {
    if (!selected) return
    setDialog(d)
    setError(false)
    setText(d === "takedown" ? noticeFor(selected) : "")
  }
  const confirm = () => {
    if (!selected || !dialog) return
    if (!text.trim()) return setError(true)
    const at = nowStamp()
    setItems((xs) =>
      xs.map((x) =>
        x.id === selected.id
          ? {
              ...x,
              status: dialog === "takedown" ? "taken_down" : "dismissed",
              resolution:
                dialog === "takedown"
                  ? `Taken down by ${ADMIN_USER}, ${at}. Notice emailed to ${selected.channel}. Logged as moderation.takedown.`
                  : `Dismissed by ${ADMIN_USER}, ${at}. Reason: ${text.trim()}. Logged as moderation.dismiss.`,
            }
          : x,
      ),
    )
    toast(dialog === "takedown" ? "Taken down" : "Dismissed", {
      description: dialog === "takedown" ? `Notice sent to ${selected.channel}.` : selected.contentTitle,
    })
    setDialog(null)
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[380px_minmax(0,1fr)]">
      <aside aria-label="Reports" className="min-w-0">
        <p className="mb-3 text-[13px] text-muted-foreground">{open} open · Takedown target: within 1 hour</p>
        <ul className="divide-y rounded-lg border">
          {items.map((r) => (
            <li key={r.id}>
              <button
                type="button"
                onClick={() => setSelectedId(r.id)}
                aria-current={r.id === selectedId ? "true" : undefined}
                className={cn(
                  "flex w-full flex-col gap-1.5 px-4 py-3 text-left outline-none hover:bg-accent focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-ring",
                  r.id === selectedId && "bg-accent",
                )}
              >
                <span className="flex items-center justify-between gap-2">
                  <span className="truncate text-[14px] font-semibold">{r.contentTitle}</span>
                  {r.status === "open" ? (
                    <StatusBadge tone="neutral">Open</StatusBadge>
                  ) : r.status === "taken_down" ? (
                    <StatusBadge tone="failed">Taken down</StatusBadge>
                  ) : (
                    <StatusBadge tone="neutral">Dismissed</StatusBadge>
                  )}
                </span>
                <span className="text-[13px] text-muted-foreground">
                  {r.channel} · {r.contentType} · {r.reason}
                </span>
                <span className="flex flex-wrap items-center gap-3 text-[12px] text-muted-foreground">
                  <span className="inline-flex items-center gap-1"><Flag className="size-3.5" aria-hidden /> {r.reports} {r.reports === 1 ? "report" : "reports"}</span>
                  <SlaLabel r={r} />
                </span>
              </button>
            </li>
          ))}
        </ul>
      </aside>

      {selected && (
        <section aria-labelledby="report-title" className="flex min-w-0 flex-col gap-5">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div className="min-w-0">
              <p className="font-mono text-[12px] text-muted-foreground">{selected.id}</p>
              <h2 id="report-title" className="text-[20px] font-bold">{selected.contentTitle}</h2>
              <p className="text-[14px] text-muted-foreground">
                {selected.channel} · {selected.contentType} · First reported {selected.receivedAt}
              </p>
            </div>
            {selected.status === "open" && (
              <div className="flex gap-2">
                <Button variant="outline" onClick={() => start("dismiss")}>Dismiss</Button>
                <Button variant="destructive" onClick={() => start("takedown")}>Take down</Button>
              </div>
            )}
          </div>

          <div className="grid gap-5 xl:grid-cols-2">
            <div className="rounded-lg border p-4">
              <h3 className="text-[12px] font-semibold uppercase tracking-[0.8px] text-muted-foreground">Reported content</h3>
              <blockquote className="mt-2 border-l-2 border-destructive pl-3 font-serif text-[16px] leading-[24px]">{selected.excerpt}</blockquote>
              <Link href={selected.contentHref} className="mt-3 inline-flex items-center gap-1 text-[13px] font-semibold hover:underline">
                Open on the channel <ArrowUpRight className="size-3.5" aria-hidden />
              </Link>
            </div>
            <div className="rounded-lg border p-4">
              <h3 className="text-[12px] font-semibold uppercase tracking-[0.8px] text-muted-foreground">Viewer report</h3>
              <p className="mt-2 text-[14px] font-medium">{selected.reason}</p>
              <p className="mt-1 text-[14px] leading-[21px] text-muted-foreground">“{selected.note}”</p>
              <p className="mt-3 text-[12px] text-muted-foreground">Reporter identities are kept private and never shared with the creator.</p>
            </div>
          </div>

          {selected.resolution ? (
            <p className="rounded-lg bg-muted px-4 py-3 text-[13px]">{selected.resolution}</p>
          ) : selected.status !== "open" ? (
            <p className="rounded-lg bg-muted px-4 py-3 text-[13px]">Resolved before this session. See the audit log.</p>
          ) : null}
        </section>
      )}

      <Dialog open={!!dialog} onOpenChange={(o) => !o && setDialog(null)}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>{dialog === "takedown" ? "Take down and notify the creator" : "Dismiss report"}</DialogTitle>
            <DialogDescription>
              {dialog === "takedown"
                ? "The content goes offline straight away and this notice is emailed to the channel owner. Edit it if you need to."
                : "The content stays up. The reason is logged; the reporter is told the content was reviewed."}
            </DialogDescription>
          </DialogHeader>
          <div className="flex flex-col gap-2">
            <Label htmlFor="mod-text">{dialog === "takedown" ? "Notice to the creator" : "Reason (required)"}</Label>
            <Textarea
              id="mod-text"
              rows={dialog === "takedown" ? 11 : 3}
              value={text}
              onChange={(e) => {
                setText(e.target.value)
                if (e.target.value.trim()) setError(false)
              }}
              className="text-[13px]"
              aria-invalid={error || undefined}
              aria-describedby={error ? "mod-error" : undefined}
            />
            {error && <p id="mod-error" className="text-[13px] text-destructive">{dialog === "takedown" ? "The creator must get a notice." : "Add a reason."}</p>}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialog(null)}>Cancel</Button>
            <Button variant={dialog === "takedown" ? "destructive" : "default"} onClick={confirm}>
              {dialog === "takedown" ? "Take down and send notice" : "Dismiss"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
