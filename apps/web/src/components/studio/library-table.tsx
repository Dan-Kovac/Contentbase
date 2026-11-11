"use client"

import Link from "next/link"
import { useMemo, useState } from "react"
import { toast } from "sonner"
import { CalendarClock, Lock, MoreHorizontal, Search, Trash2, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { VideoThumb } from "@/components/brand/media"
import { StatusBadge } from "@/components/brand/status-badge"
import { compact } from "@/lib/format"
import { cn } from "@/lib/utils"
import type { ContentStatus } from "@/lib/types"
import { ScheduleDialog } from "./schedule-dialog"

export type LibraryKind = "video" | "article" | "short"

export interface LibraryRow {
  id: string
  kind: LibraryKind
  title: string
  status: ContentStatus
  section: string
  date: string
  views: number
  tone: string
  durationSec?: number
  exclusive: boolean
  href?: string
  meta?: string
}

const STATUS_OPTIONS: { value: "all" | ContentStatus; label: string }[] = [
  { value: "all", label: "All statuses" },
  { value: "ready", label: "Ready to review" },
  { value: "scheduled", label: "Scheduled" },
  { value: "published", label: "Published" },
  { value: "processing", label: "Processing" },
]

const KIND_LABEL: Record<LibraryKind, string> = { video: "Videos", article: "Articles", short: "Shorts" }

/** EDT-03: everything on the channel, with filters, search and bulk actions. */
export function LibraryTable({ initialRows }: { initialRows: LibraryRow[] }) {
  const [rows, setRows] = useState(initialRows)
  const [kind, setKind] = useState<LibraryKind>("video")
  const [q, setQ] = useState("")
  const [status, setStatus] = useState<"all" | ContentStatus>("all")
  const [selected, setSelected] = useState<Set<string>>(new Set())
  const [scheduleIds, setScheduleIds] = useState<string[] | null>(null)
  const [deleteIds, setDeleteIds] = useState<string[] | null>(null)

  const key = (r: LibraryRow) => `${r.kind}:${r.id}`
  const shown = useMemo(
    () =>
      rows.filter(
        (r) =>
          r.kind === kind &&
          (status === "all" || r.status === status) &&
          (!q || r.title.toLowerCase().includes(q.toLowerCase()) || r.section.toLowerCase().includes(q.toLowerCase())),
      ),
    [rows, kind, status, q],
  )
  const counts = useMemo(() => {
    const c: Record<LibraryKind, number> = { video: 0, article: 0, short: 0 }
    rows.forEach((r) => c[r.kind]++)
    return c
  }, [rows])

  const selectedRows = shown.filter((r) => selected.has(key(r)))
  const allOn = shown.length > 0 && selectedRows.length === shown.length
  const someOn = selectedRows.length > 0 && !allOn

  const toggle = (k: string, on: boolean) =>
    setSelected((s) => {
      const n = new Set(s)
      if (on) n.add(k)
      else n.delete(k)
      return n
    })

  const patch = (keys: string[], p: Partial<LibraryRow>) => setRows((rs) => rs.map((r) => (keys.includes(key(r)) ? { ...r, ...p } : r)))

  const publishable = (r: LibraryRow) => r.status === "ready" || r.status === "draft" || r.status === "scheduled"

  const publish = (targets: LibraryRow[]) => {
    const ok = targets.filter(publishable)
    const skipped = targets.length - ok.length
    if (!ok.length) {
      toast.error("Nothing to publish", { description: "Pick items that are ready to review or scheduled." })
      return
    }
    patch(ok.map(key), { status: "published", date: "11 November 2026" })
    setSelected(new Set())
    toast.success("Published", {
      description: `${ok.length} ${ok.length === 1 ? "item" : "items"} published${skipped ? `, ${skipped} skipped (still processing or already live)` : ""}.`,
    })
  }

  return (
    <div className="grid gap-4">
      <Tabs
        value={kind}
        onValueChange={(v) => {
          setKind(v as LibraryKind)
          setSelected(new Set())
        }}
      >
        <TabsList>
          {(Object.keys(KIND_LABEL) as LibraryKind[]).map((k) => (
            <TabsTrigger key={k} value={k} className="px-3">
              {KIND_LABEL[k]} <span className="text-muted-foreground tabular">{counts[k]}</span>
            </TabsTrigger>
          ))}
        </TabsList>
      </Tabs>

      <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
        <div className="relative flex-1 sm:max-w-sm">
          <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" aria-hidden />
          <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder={`Search ${KIND_LABEL[kind].toLowerCase()}`} aria-label="Search the library" className="pl-9" />
        </div>
        <Select value={status} onValueChange={(v) => setStatus(v as typeof status)}>
          <SelectTrigger className="w-full sm:w-[180px]" aria-label="Filter by status">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {STATUS_OPTIONS.map((o) => (
              <SelectItem key={o.value} value={o.value}>
                {o.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {(q || status !== "all") && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              setQ("")
              setStatus("all")
            }}
          >
            <X /> Clear
          </Button>
        )}
      </div>

      {selectedRows.length > 0 && (
        <div className="flex flex-wrap items-center gap-2 rounded-lg border border-foreground bg-card px-3 py-2" role="toolbar" aria-label="Bulk actions">
          <span className="mr-2 text-sm font-semibold tabular">{selectedRows.length} selected</span>
          <Button size="sm" onClick={() => publish(selectedRows)}>
            Publish
          </Button>
          <Button size="sm" variant="outline" onClick={() => setScheduleIds(selectedRows.map(key))}>
            <CalendarClock /> Schedule
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={() => {
              patch(selectedRows.map(key), { exclusive: true })
              toast.success("Marked exclusive", { description: `${selectedRows.length} items are now signed-in only.` })
            }}
          >
            <Lock /> Mark exclusive
          </Button>
          <Button size="sm" variant="ghost" className="text-destructive hover:text-destructive" onClick={() => setDeleteIds(selectedRows.map(key))}>
            <Trash2 /> Delete
          </Button>
          <Button size="sm" variant="ghost" className="ml-auto" onClick={() => setSelected(new Set())}>
            Clear selection
          </Button>
        </div>
      )}

      <div className="overflow-x-auto rounded-lg border bg-card">
        <Table className="min-w-[780px]">
          <TableHeader>
            <TableRow className="hover:bg-transparent">
              <TableHead className="w-10 pl-4">
                <Checkbox
                  checked={allOn ? true : someOn ? "indeterminate" : false}
                  onCheckedChange={(v) => setSelected(v ? new Set(shown.map(key)) : new Set())}
                  aria-label="Select all"
                />
              </TableHead>
              <TableHead>Title</TableHead>
              <TableHead className="w-[150px]">Status</TableHead>
              <TableHead className="w-[90px]">Section</TableHead>
              <TableHead className="w-[170px]">Date</TableHead>
              <TableHead className="w-[80px] text-right">Views</TableHead>
              <TableHead className="w-12 pr-4">
                <span className="sr-only">Actions</span>
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {shown.map((r) => {
              const k = key(r)
              const on = selected.has(k)
              return (
                <TableRow key={k} data-state={on ? "selected" : undefined}>
                  <TableCell className="pl-4">
                    <Checkbox checked={on} onCheckedChange={(v) => toggle(k, !!v)} aria-label={`Select ${r.title}`} />
                  </TableCell>
                  <TableCell className="py-2.5">
                    <div className="flex min-w-0 items-center gap-3">
                      <div className={cn("shrink-0", r.kind === "short" ? "w-[34px]" : "w-[96px]")}>
                        <VideoThumb tone={r.tone} ratio={r.kind === "short" ? "9/16" : "16/9"} className="rounded-md [&_span.rounded-full]:hidden" />
                      </div>
                      <div className="min-w-0">
                        {r.href ? (
                          <Link href={r.href} className="line-clamp-1 whitespace-normal font-semibold hover:underline focus-visible:underline focus-visible:outline-none">
                            {r.title}
                          </Link>
                        ) : (
                          <span className="line-clamp-1 whitespace-normal font-semibold">{r.title}</span>
                        )}
                        {r.meta && <p className="line-clamp-1 whitespace-normal text-xs text-muted-foreground">{r.meta}</p>}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-wrap gap-1">
                      <StatusBadge tone={r.status} className={r.status === "ready" ? "bg-background text-foreground border-input" : undefined}>
                        {r.status === "ready" ? "Ready" : undefined}
                      </StatusBadge>
                      {r.exclusive && <Lock className="size-3.5 self-center text-muted-foreground" aria-label="Exclusive" />}
                    </div>
                  </TableCell>
                  <TableCell className="text-muted-foreground">{r.section}</TableCell>
                  <TableCell className="text-muted-foreground tabular">{r.date}</TableCell>
                  <TableCell className="text-right font-medium tabular">{r.status === "published" ? compact(r.views) : "–"}</TableCell>
                  <TableCell className="pr-4">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon-sm" aria-label={`Actions for ${r.title}`}>
                          <MoreHorizontal />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-44">
                        {r.href && (
                          <DropdownMenuItem asChild>
                            <Link href={r.href}>{r.status === "ready" ? "Review" : "Edit"}</Link>
                          </DropdownMenuItem>
                        )}
                        <DropdownMenuItem disabled={!publishable(r)} onSelect={() => publish([r])}>
                          Publish
                        </DropdownMenuItem>
                        <DropdownMenuItem disabled={!publishable(r)} onSelect={() => setScheduleIds([k])}>
                          Schedule
                        </DropdownMenuItem>
                        <DropdownMenuItem onSelect={() => patch([k], { exclusive: !r.exclusive })}>
                          {r.exclusive ? "Remove exclusive" : "Mark exclusive"}
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem variant="destructive" onSelect={() => setDeleteIds([k])}>
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              )
            })}
            {shown.length === 0 && (
              <TableRow className="hover:bg-transparent">
                <TableCell colSpan={7} className="py-14 text-center">
                  <p className="font-semibold">No {KIND_LABEL[kind].toLowerCase()} match</p>
                  <p className="mt-1 text-sm text-muted-foreground">Try another search or status.</p>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      <p className="text-xs text-muted-foreground">
        {shown.length} of {counts[kind]} {KIND_LABEL[kind].toLowerCase()}
      </p>

      <ScheduleDialog
        open={!!scheduleIds}
        onOpenChange={(o) => !o && setScheduleIds(null)}
        itemTitle={scheduleIds && scheduleIds.length > 1 ? `${scheduleIds.length} items` : rows.find((r) => scheduleIds?.includes(key(r)))?.title ?? ""}
        onSchedule={(when) => {
          if (!scheduleIds) return
          const ok = rows.filter((r) => scheduleIds.includes(key(r)) && publishable(r)).map(key)
          patch(ok, { status: "scheduled", date: when })
          setSelected(new Set())
          toast.success("Scheduled", { description: `${ok.length} ${ok.length === 1 ? "item goes" : "items go"} live ${when}.` })
        }}
      />

      <AlertDialog open={!!deleteIds} onOpenChange={(o) => !o && setDeleteIds(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete {deleteIds && deleteIds.length > 1 ? `${deleteIds.length} items` : "this item"}?</AlertDialogTitle>
            <AlertDialogDescription>
              Published pages are taken down and redirect to your channel home. The video stays on YouTube.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={() => {
                const n = deleteIds?.length ?? 0
                setRows((rs) => rs.filter((r) => !deleteIds?.includes(key(r))))
                setSelected(new Set())
                toast.success("Deleted", { description: `${n} ${n === 1 ? "item" : "items"} deleted.` })
              }}
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
