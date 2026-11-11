"use client"

import { useState } from "react"
import { Search } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import type { AuditEntry } from "./data"

export function AuditTable({ entries }: { entries: AuditEntry[] }) {
  const [q, setQ] = useState("")
  const [actor, setActor] = useState("all")
  const actors = Array.from(new Set(entries.map((e) => e.actor)))
  const s = q.trim().toLowerCase()
  const rows = entries.filter(
    (e) =>
      (actor === "all" || e.actor === actor) &&
      (!s || [e.action, e.target, e.before, e.after, e.reason, e.id].filter(Boolean).some((v) => v!.toLowerCase().includes(s))),
  )

  return (
    <div>
      <div className="mb-3 flex flex-wrap gap-2">
        <div className="relative min-w-[220px] flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" aria-hidden />
          <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search action, target or reason" aria-label="Search the audit log" className="pl-9" />
        </div>
        <Select value={actor} onValueChange={setActor}>
          <SelectTrigger className="w-[180px]" aria-label="Actor">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All actors</SelectItem>
            {actors.map((a) => (
              <SelectItem key={a} value={a}>{a}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div className="overflow-x-auto rounded-lg border">
        <Table className="min-w-[1000px]">
          <TableHeader>
            <TableRow>
              <TableHead className="w-[190px]">Time</TableHead>
              <TableHead>Actor</TableHead>
              <TableHead>Action</TableHead>
              <TableHead>Target</TableHead>
              <TableHead>Before</TableHead>
              <TableHead>After</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.map((e) => (
              <TableRow key={e.id} className="align-top">
                <TableCell className="whitespace-nowrap text-[13px] tabular">
                  {e.at}
                  <div className="font-mono text-[11px] text-muted-foreground">{e.id}</div>
                </TableCell>
                <TableCell className="whitespace-nowrap">{e.actor}</TableCell>
                <TableCell className="font-mono text-[12px]">{e.action}</TableCell>
                <TableCell className="max-w-[300px] whitespace-normal">
                  {e.target}
                  {e.reason && <div className="mt-0.5 text-[12px] text-muted-foreground">Reason: {e.reason}</div>}
                </TableCell>
                <TableCell className="whitespace-normal font-mono text-[12px] text-muted-foreground">{e.before ?? "–"}</TableCell>
                <TableCell className="whitespace-normal font-mono text-[12px]">{e.after ?? "–"}</TableCell>
              </TableRow>
            ))}
            {!rows.length && (
              <TableRow>
                <TableCell colSpan={6} className="py-10 text-center text-muted-foreground">No entries match.</TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      <p className="mt-2 text-[12px] text-muted-foreground">Append-only. Entries can&apos;t be edited or deleted, including by admins.</p>
    </div>
  )
}
