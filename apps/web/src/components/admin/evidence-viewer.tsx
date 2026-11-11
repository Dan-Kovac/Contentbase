"use client"

import { useMemo, useState } from "react"
import { Download, FileSpreadsheet, FileText, Search } from "lucide-react"
import { toast } from "sonner"
import { LockStatus } from "@/components/brand/compliance"
import { StatusBadge } from "@/components/brand/status-badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Progress } from "@/components/ui/progress"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"
import { cn } from "@/lib/utils"
import type { AdDecision, Campaign } from "@/lib/types"
import { longStamp, shortTime } from "./data"
import { nowStamp } from "./clock"

const OUTCOME: Record<AdDecision["outcome"], string> = {
  wagering_served: "Age-restricted served",
  non_wagering_served: "Everyday ad served",
  house: "House promo",
}

const REASONS: Record<string, string> = {
  ALL_LOCKS_PASS: "Signed in, current 18+ assurance and not opted out (account and AdStop). Evidence written before the creative was returned.",
  LOCK1_NO_SESSION: "No signed-in session. Age-restricted categories excluded; an everyday ad filled the space.",
  LOCK2_NO_ASSURANCE: "Signed in but no current 18+ assurance on file. Failed closed to an everyday ad.",
  LOCK3_OPTED_OUT: "The viewer has turned off ads in this category. Everyday ad served.",
  PAGE_IS_LIVE: "The page is flagged as live coverage (TLK-08), so wagering is excluded for every viewer.",
  NO_FILL: "No eligible creative. The space showed a house promo at the same size.",
}

type Job = {
  id: string
  label: string
  format: "csv" | "pdf"
  status: "queued" | "running" | "ready"
  progress: number
  requestedAt: string
  url?: string
  rows: number
}

const MONTHS = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"]
/** "2026-11-01" -> "1 November 2026" */
function longDate(iso: string) {
  const [y, m, d] = iso.split("-").map(Number)
  return y && m && d ? `${d} ${MONTHS[m - 1]} ${y}` : iso
}

function csvFor(decisions: AdDecision[]) {
  const head = ["decision_id", "timestamp", "channel", "slot", "outcome", "reason_code", "lock1_session_ref", "lock1_pass", "lock2_assurance_ref", "lock2_pass", "lock3_optout_ref", "lock3_pass"]
  const rows = decisions.map((d) =>
    [d.id, d.at, d.channel, d.slot, d.outcome, d.reason, d.locks.session.ref ?? "", d.locks.session.pass, d.locks.age.ref ?? "", d.locks.age.pass, d.locks.optout.ref ?? "", d.locks.optout.pass]
      .map((v) => `"${String(v).replace(/"/g, '""')}"`)
      .join(","),
  )
  return [head.join(","), ...rows].join("\n")
}

/** A small, valid one-page PDF summary (Helvetica, ASCII only). */
function pdfFor(title: string, lines: string[]) {
  const esc = (s: string) => s.replace(/[^\x20-\x7e]/g, "-").replace(/([()\\])/g, "\\$1")
  const text = [`BT /F1 16 Tf 50 790 Td (${esc(title)}) Tj ET`, ...lines.map((l, i) => `BT /F1 9 Tf 50 ${760 - i * 14} Td (${esc(l)}) Tj ET`)].join("\n")
  const objs = [
    "<< /Type /Catalog /Pages 2 0 R >>",
    "<< /Type /Pages /Kids [3 0 R] /Count 1 >>",
    "<< /Type /Page /Parent 2 0 R /MediaBox [0 0 595 842] /Resources << /Font << /F1 4 0 R >> >> /Contents 5 0 R >>",
    "<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>",
    `<< /Length ${text.length} >>\nstream\n${text}\nendstream`,
  ]
  let out = "%PDF-1.4\n"
  const offsets: number[] = []
  objs.forEach((o, i) => {
    offsets.push(out.length)
    out += `${i + 1} 0 obj\n${o}\nendobj\n`
  })
  const xref = out.length
  out += `xref\n0 ${objs.length + 1}\n0000000000 65535 f \n${offsets.map((o) => `${String(o).padStart(10, "0")} 00000 n \n`).join("")}`
  out += `trailer\n<< /Size ${objs.length + 1} /Root 1 0 R >>\nstartxref\n${xref}\n%%EOF`
  return out
}

export function EvidenceViewer({ decisions, campaigns }: { decisions: AdDecision[]; campaigns: Campaign[] }) {
  const [q, setQ] = useState("")
  const [outcome, setOutcome] = useState<string>("all")
  const [channel, setChannel] = useState<string>("all")
  const [selectedId, setSelectedId] = useState(decisions[0]?.id)

  const channels = Array.from(new Set(decisions.map((d) => d.channel)))
  const filtered = useMemo(() => {
    const s = q.trim().toLowerCase()
    return decisions.filter(
      (d) =>
        (outcome === "all" || d.outcome === outcome) &&
        (channel === "all" || d.channel === channel) &&
        (!s ||
          [d.id, d.reason, d.slot, d.locks.session.ref, d.locks.age.ref, d.locks.optout.ref]
            .filter(Boolean)
            .some((v) => v!.toLowerCase().includes(s))),
    )
  }, [decisions, q, outcome, channel])
  const selected = decisions.find((d) => d.id === selectedId)

  // Export panel state
  const advertisers = Array.from(new Set(campaigns.map((c) => c.advertiser)))
  const [scope, setScope] = useState<"advertiser" | "campaign">("advertiser")
  const [target, setTarget] = useState(advertisers.find((a) => a.startsWith("Harbour")) ?? advertisers[0])
  const [from, setFrom] = useState("2026-11-01")
  const [to, setTo] = useState("2026-11-11")
  const [format, setFormat] = useState<"csv" | "pdf">("csv")
  const [jobs, setJobs] = useState<Job[]>([])

  const targetOptions = scope === "advertiser" ? advertisers.map((a) => ({ value: a, label: a })) : campaigns.map((c) => ({ value: c.id, label: `${c.advertiser} · ${c.id}` }))
  const dateError = from && to && from > to ? "The start date is after the end date." : ""

  const runExport = () => {
    if (dateError) return
    const id = `exp_${String(jobs.length + 1).padStart(3, "0")}`
    const label = `${scope === "campaign" ? targetOptions.find((o) => o.value === target)?.label : target} · ${longDate(from)} to ${longDate(to)}`
    const job: Job = { id, label, format, status: "queued", progress: 0, requestedAt: nowStamp(), rows: decisions.length }
    setJobs((js) => [job, ...js])
    const set = (patch: Partial<Job>) => setJobs((js) => js.map((j) => (j.id === id ? { ...j, ...patch } : j)))
    window.setTimeout(() => set({ status: "running", progress: 20 }), 600)
    window.setTimeout(() => set({ progress: 65 }), 1400)
    window.setTimeout(() => {
      const body =
        format === "csv"
          ? csvFor(decisions)
          : pdfFor("Homestand compliance evidence", [
              `Scope: ${label}`,
              `Generated: ${nowStamp()}`,
              "Locks: 1 signed-in session, 2 current 18+ assurance, 3 not opted out (account and AdStop).",
              "Fail closed: any failed or errored check serves an everyday ad.",
              "",
              ...decisions.map((d) => `${d.id}  ${d.at}  ${d.channel}  ${d.slot}  ${d.outcome}  ${d.reason}`),
            ])
      const url = URL.createObjectURL(new Blob([body], { type: format === "csv" ? "text/csv" : "application/pdf" }))
      set({ status: "ready", progress: 100, url })
      toast("Export ready", { description: label })
    }, 2400)
  }

  return (
    <div className="flex flex-col gap-10">
      <section aria-labelledby="decisions-h" className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_420px]">
        <div className="min-w-0">
          <h2 id="decisions-h" className="sr-only">Ad decisions</h2>
          <div className="mb-3 flex flex-wrap gap-2">
            <div className="relative min-w-[220px] flex-1">
              <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" aria-hidden />
              <Input
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="Search by decision, session or assurance ID, or reason"
                aria-label="Search decisions"
                className="pl-9"
              />
            </div>
            <Select value={outcome} onValueChange={setOutcome}>
              <SelectTrigger className="w-[190px]" aria-label="Outcome">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All outcomes</SelectItem>
                {Object.entries(OUTCOME).map(([k, v]) => (
                  <SelectItem key={k} value={k}>{v}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={channel} onValueChange={setChannel}>
              <SelectTrigger className="w-[150px]" aria-label="Channel">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All channels</SelectItem>
                {channels.map((c) => (
                  <SelectItem key={c} value={c}>{c}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="overflow-x-auto rounded-lg border">
            <Table className="min-w-[720px]">
              <TableHeader>
                <TableRow>
                  <TableHead>Time</TableHead>
                  <TableHead>Decision</TableHead>
                  <TableHead>Channel</TableHead>
                  <TableHead>Slot</TableHead>
                  <TableHead>Outcome</TableHead>
                  <TableHead>Reason code</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map((d) => (
                  <TableRow
                    key={d.id}
                    data-state={d.id === selectedId ? "selected" : undefined}
                    className="cursor-pointer"
                    onClick={() => setSelectedId(d.id)}
                  >
                    <TableCell className="whitespace-nowrap font-mono text-[12px] tabular">{shortTime(d.at)}</TableCell>
                    <TableCell>
                      <button
                        type="button"
                        onClick={() => setSelectedId(d.id)}
                        className="font-mono text-[13px] underline-offset-2 outline-none hover:underline focus-visible:ring-2 focus-visible:ring-ring"
                        aria-pressed={d.id === selectedId}
                      >
                        {d.id}
                      </button>
                    </TableCell>
                    <TableCell>{d.channel}</TableCell>
                    <TableCell className="text-muted-foreground">{d.slot}</TableCell>
                    <TableCell>
                      {d.outcome === "wagering_served" ? (
                        <StatusBadge tone="wagering">18+ served</StatusBadge>
                      ) : (
                        <span className="text-[13px]">{OUTCOME[d.outcome]}</span>
                      )}
                    </TableCell>
                    <TableCell className="font-mono text-[12px]">{d.reason}</TableCell>
                  </TableRow>
                ))}
                {!filtered.length && (
                  <TableRow>
                    <TableCell colSpan={6} className="py-10 text-center text-muted-foreground">
                      No decisions match. Clear the search or filters.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
          <p className="mt-2 text-[12px] text-muted-foreground">
            Showing {filtered.length} of {decisions.length} decisions from 11 November 2026. Evidence records are append-only and kept for at least 12 months.
          </p>
        </div>

        {selected && (
          <aside aria-labelledby="decision-detail" className="flex min-w-0 flex-col gap-4 rounded-lg border p-5">
            <div>
              <h2 id="decision-detail" className="font-mono text-[15px] font-semibold">{selected.id}</h2>
              <p className="text-[13px] text-muted-foreground">
                {longStamp(selected.at)} · {selected.channel} · {selected.slot}
              </p>
            </div>
            {selected.reason === "PAGE_IS_LIVE" && (
              <p className="rounded-md border border-foreground px-3 py-2 text-[13px] font-semibold">
                Locks passed, but the page is live coverage, so wagering was excluded before the lock check counted.
              </p>
            )}
            <LockStatus
              locks={selected.locks}
              verdict={
                selected.outcome === "wagering_served"
                  ? "Age-restricted ad eligible. Evidence written before serve."
                  : selected.locks.session.pass && selected.locks.age.pass && selected.locks.optout.pass
                    ? "Locks pass. An everyday ad was served for another reason (see the reason code)."
                    : "Fail closed: an everyday ad was served."
              }
            />
            <div className="rounded-md border p-3">
              <p className="text-[12px] font-semibold uppercase tracking-[0.8px] text-muted-foreground">Reason code</p>
              <p className="mt-1 font-mono text-[13px] font-semibold">{selected.reason}</p>
              <p className="mt-1 text-[13px] leading-[19px] text-muted-foreground">{REASONS[selected.reason] ?? "See the decision log."}</p>
            </div>
            <dl className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-1.5 text-[13px]">
              <dt className="text-muted-foreground">Outcome</dt>
              <dd>{OUTCOME[selected.outcome]}</dd>
              <dt className="text-muted-foreground">Evidence</dt>
              <dd>{selected.outcome === "wagering_served" ? <span className="font-mono">ev_{selected.id.slice(4)} · written before serve</span> : "Not required (everyday ad)"}</dd>
            </dl>
          </aside>
        )}
      </section>

      <section aria-labelledby="export-h" className="grid gap-6 xl:grid-cols-[420px_minmax(0,1fr)]">
        <div className="rounded-lg border p-5">
          <h2 id="export-h" className="text-[18px] font-bold">Evidence export</h2>
          <p className="mt-1 text-[13px] leading-[19px] text-muted-foreground">
            Per advertiser, campaign or date range, for advertiser due diligence (TLK-09) and regulator requests (ADM-03).
          </p>
          <div className="mt-5 flex flex-col gap-5">
            <RadioGroup
              value={scope}
              onValueChange={(v) => {
                const s = v as "advertiser" | "campaign"
                setScope(s)
                setTarget(s === "advertiser" ? advertisers[0] : campaigns[0].id)
              }}
              className="flex gap-5"
              aria-label="Export by"
            >
              {(["advertiser", "campaign"] as const).map((s) => (
                <div key={s} className="flex items-center gap-2">
                  <RadioGroupItem id={`scope-${s}`} value={s} />
                  <Label htmlFor={`scope-${s}`}>{s === "advertiser" ? "Advertiser" : "Campaign"}</Label>
                </div>
              ))}
            </RadioGroup>
            <div className="flex flex-col gap-2">
              <Label htmlFor="export-target">{scope === "advertiser" ? "Advertiser" : "Campaign"}</Label>
              <Select value={target} onValueChange={setTarget}>
                <SelectTrigger id="export-target" className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {targetOptions.map((o) => (
                    <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="flex flex-col gap-2">
                <Label htmlFor="export-from">From</Label>
                <Input id="export-from" type="date" value={from} onChange={(e) => setFrom(e.target.value)} aria-describedby={dateError ? "date-error" : undefined} aria-invalid={!!dateError || undefined} />
              </div>
              <div className="flex flex-col gap-2">
                <Label htmlFor="export-to">To</Label>
                <Input id="export-to" type="date" value={to} onChange={(e) => setTo(e.target.value)} aria-invalid={!!dateError || undefined} />
              </div>
            </div>
            {dateError && <p id="date-error" className="-mt-3 text-[13px] text-destructive">{dateError}</p>}
            <div className="flex flex-col gap-2">
              <span id="format-label" className="text-sm font-medium">Format</span>
              <ToggleGroup type="single" variant="outline" value={format} onValueChange={(v) => v && setFormat(v as "csv" | "pdf")} aria-labelledby="format-label">
                <ToggleGroupItem value="csv"><FileSpreadsheet aria-hidden /> CSV</ToggleGroupItem>
                <ToggleGroupItem value="pdf"><FileText aria-hidden /> PDF</ToggleGroupItem>
              </ToggleGroup>
            </div>
            <Button onClick={runExport} disabled={!!dateError}>Generate export</Button>
          </div>
        </div>

        <div className="min-w-0">
          <h3 className="mb-3 text-[15px] font-semibold">Export jobs</h3>
          {jobs.length ? (
            <ul className="divide-y rounded-lg border">
              {jobs.map((j) => (
                <li key={j.id} className="flex flex-col gap-2 p-4 sm:flex-row sm:items-center sm:gap-4">
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-[14px] font-medium">{j.label}</p>
                    <p className="text-[12px] text-muted-foreground">
                      <span className="font-mono">{j.id}</span> · {j.format.toUpperCase()} · Requested {j.requestedAt}
                    </p>
                    {j.status !== "ready" && <Progress value={j.progress} className="mt-2 h-1.5" aria-label={`${j.id} progress`} />}
                  </div>
                  <div className="flex shrink-0 items-center gap-3" aria-live="polite">
                    <span className={cn("text-[12px] font-bold uppercase tracking-[0.8px]", j.status === "ready" ? "text-foreground" : "text-muted-foreground")}>
                      {j.status === "queued" ? "Queued" : j.status === "running" ? "Generating" : "Ready"}
                    </span>
                    {j.url && (
                      <Button asChild size="sm" variant="outline">
                        <a href={j.url} download={`homestand-evidence-${j.id}.${j.format}`}>
                          <Download aria-hidden /> Download
                        </a>
                      </Button>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <div className="rounded-lg border border-dashed p-8 text-center text-[14px] text-muted-foreground">
              No exports yet in this session. Exports are generated in under 5 minutes and logged to the audit log.
            </div>
          )}
        </div>
      </section>
    </div>
  )
}
