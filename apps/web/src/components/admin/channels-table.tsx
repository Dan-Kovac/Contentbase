"use client"

import { useState } from "react"
import Link from "next/link"
import { Ban, Eye, MoreHorizontal, RefreshCcw, ScrollText } from "lucide-react"
import { toast } from "sonner"
import { StatusBadge } from "@/components/brand/status-badge"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Textarea } from "@/components/ui/textarea"
import { compact } from "@/lib/format"
import type { Channel, ChannelMode } from "@/lib/types"
import { ADMIN_USER } from "./data"
import { nowStamp } from "./clock"

const MODE: Record<ChannelMode, string> = { standard: "Standard", triple_lock: "Triple lock", racing_only: "Racing-only" }
const PLAN = { starter: "Starter", pro: "Pro", publisher: "Publisher", enterprise: "Enterprise" } as const

type Row = Channel & { suspended?: boolean }
type Action = { kind: "suspend" | "mode" | "impersonate"; channel: Row }
type LogLine = { at: string; text: string; reason: string }

export function ChannelsTable({ channels }: { channels: Channel[] }) {
  const [rows, setRows] = useState<Row[]>(channels)
  const [action, setAction] = useState<Action | null>(null)
  const [reason, setReason] = useState("")
  const [mode, setMode] = useState<ChannelMode>("standard")
  const [declared, setDeclared] = useState(false)
  const [error, setError] = useState("")
  const [log, setLog] = useState<LogLine[]>([])

  const start = (kind: Action["kind"], channel: Row) => {
    setAction({ kind, channel })
    setReason("")
    setError("")
    setMode(channel.mode)
    setDeclared(false)
  }

  const confirm = () => {
    if (!action) return
    const c = action.channel
    if (!reason.trim()) return setError("Add a reason. Every admin action is logged with one.")
    if (action.kind === "mode" && mode === c.mode) return setError("Choose a different mode.")
    if (action.kind === "mode" && mode === "racing_only" && !declared) return setError("Racing-only needs the owner's racing content declaration.")
    const at = nowStamp()
    let text = ""
    if (action.kind === "suspend") {
      const next = !c.suspended
      setRows((rs) => rs.map((r) => (r.id === c.id ? { ...r, suspended: next } : r)))
      text = `${next ? "channel.suspend" : "channel.unsuspend"} · ${c.name}`
      toast(next ? "Suspended" : "Reinstated", { description: `${c.name}. Logged.` })
    } else if (action.kind === "mode") {
      setRows((rs) => rs.map((r) => (r.id === c.id ? { ...r, mode } : r)))
      text = `channel.mode_change · ${c.name} · ${MODE[c.mode]} → ${MODE[mode]}`
      toast("Mode changed", { description: `${c.name} is now ${MODE[mode]}. Logged.` })
    } else {
      text = `channel.impersonate · ${c.name} (studio, read-only)`
      toast("Impersonation started", { description: `Viewing ${c.name}'s studio as ${c.owner}. Logged.` })
    }
    setLog((l) => [{ at, text: `${ADMIN_USER} · ${text}`, reason: reason.trim() }, ...l])
    setAction(null)
  }

  const c = action?.channel
  return (
    <div className="flex flex-col gap-8">
      <div className="overflow-x-auto rounded-lg border">
        <Table className="min-w-[900px]">
          <TableHeader>
            <TableRow>
              <TableHead>Channel</TableHead>
              <TableHead>Owner</TableHead>
              <TableHead>Mode</TableHead>
              <TableHead>Plan</TableHead>
              <TableHead>Notable person</TableHead>
              <TableHead className="text-right">Followers</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="w-12"><span className="sr-only">Actions</span></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.map((r) => (
              <TableRow key={r.id}>
                <TableCell>
                  <Link href={`/c/${r.slug}`} className="font-medium hover:underline">{r.name}</Link>
                  <div className="font-mono text-[12px] text-muted-foreground">{r.customDomain ?? `${r.slug}.homestand.com.au`}</div>
                </TableCell>
                <TableCell>{r.owner}</TableCell>
                <TableCell>{MODE[r.mode]}</TableCell>
                <TableCell>{PLAN[r.plan]}</TableCell>
                <TableCell>
                  {r.notablePersonFlag ? <StatusBadge tone="failed">Flagged</StatusBadge> : <span className="text-muted-foreground">Not flagged</span>}
                </TableCell>
                <TableCell className="text-right tabular">{compact(r.followers)}</TableCell>
                <TableCell>{r.suspended ? <StatusBadge tone="failed">Suspended</StatusBadge> : <StatusBadge tone="published">Active</StatusBadge>}</TableCell>
                <TableCell>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon-sm" aria-label={`Actions for ${r.name}`}>
                        <MoreHorizontal />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onSelect={() => start("impersonate", r)}>
                        <Eye aria-hidden /> Impersonate
                      </DropdownMenuItem>
                      <DropdownMenuItem onSelect={() => start("mode", r)}>
                        <RefreshCcw aria-hidden /> Change mode
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem variant="destructive" onSelect={() => start("suspend", r)}>
                        <Ban aria-hidden /> {r.suspended ? "Reinstate" : "Suspend"}
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <section aria-labelledby="session-log">
        <h2 id="session-log" className="mb-3 flex items-center gap-2 text-[15px] font-semibold">
          <ScrollText className="size-4" aria-hidden /> Logged this session
        </h2>
        {log.length ? (
          <ul className="divide-y rounded-lg border text-[13px]">
            {log.map((l, i) => (
              <li key={i} className="flex flex-col gap-0.5 px-4 py-3">
                <span className="font-mono">{l.text}</span>
                <span className="text-muted-foreground">{l.at} · Reason: {l.reason}</span>
              </li>
            ))}
          </ul>
        ) : (
          <p className="rounded-lg border border-dashed p-5 text-[13px] text-muted-foreground">
            Suspend, change mode and impersonate are written to the <Link href="/admin/audit" className="underline underline-offset-2">audit log</Link> with your name, the time and a reason.
          </p>
        )}
      </section>

      <Dialog open={!!action} onOpenChange={(o) => !o && setAction(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {action?.kind === "suspend" ? `${c?.suspended ? "Reinstate" : "Suspend"} ${c?.name}` : action?.kind === "mode" ? `Change mode for ${c?.name}` : `Impersonate ${c?.name}`}
            </DialogTitle>
            <DialogDescription>
              {action?.kind === "suspend"
                ? c?.suspended
                  ? "The channel goes back online and the owner is notified."
                  : "The channel shows a suspended page to viewers, and the owner is notified by email. Content is kept."
                : action?.kind === "mode"
                  ? "Mode decides whether wagering ads can serve. The change takes effect on the next ad request."
                  : `You'll see ${c?.name}'s studio as ${c?.owner} sees it. Publishing is disabled while impersonating.`}
            </DialogDescription>
          </DialogHeader>
          {action?.kind === "mode" && (
            <div className="flex flex-col gap-3">
              <div className="flex flex-col gap-2">
                <Label htmlFor="new-mode">Mode</Label>
                <Select value={mode} onValueChange={(v) => setMode(v as ChannelMode)}>
                  <SelectTrigger id="new-mode" className="w-full"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="standard">Standard: no wagering ads</SelectItem>
                    <SelectItem value="triple_lock">Triple lock: wagering only when all three locks pass</SelectItem>
                    <SelectItem value="racing_only">Racing-only: declared racing service</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              {mode === "racing_only" && (
                <div className="flex items-start gap-2">
                  <Checkbox id="declared" checked={declared} onCheckedChange={(v) => setDeclared(v === true)} />
                  <Label htmlFor="declared" className="font-normal leading-5">
                    The owner has signed the racing content declaration. A quarterly review is scheduled.
                  </Label>
                </div>
              )}
            </div>
          )}
          <div className="flex flex-col gap-2">
            <Label htmlFor="action-reason">Reason (required)</Label>
            <Textarea
              id="action-reason"
              rows={3}
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder={action?.kind === "impersonate" ? "e.g. Support ticket 2240: scheduled post didn't go live." : "Say why. This goes to the audit log."}
              aria-invalid={!!error || undefined}
              aria-describedby={error ? "action-error" : undefined}
            />
            {error && <p id="action-error" className="text-[13px] text-destructive">{error}</p>}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setAction(null)}>Cancel</Button>
            <Button variant={action?.kind === "suspend" && !c?.suspended ? "destructive" : "default"} onClick={confirm}>
              {action?.kind === "suspend" ? (c?.suspended ? "Reinstate" : "Suspend") : action?.kind === "mode" ? "Change mode" : "Start impersonating"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
