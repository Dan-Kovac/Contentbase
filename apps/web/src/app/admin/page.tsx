import type { Metadata } from "next"
import Link from "next/link"
import { ArrowRight, CircleAlert, CircleCheck, Info, TriangleAlert } from "lucide-react"
import { PageHeader } from "@/components/shell/page-header"
import { adminAlerts, pilotKpis, type KpiStatus } from "@/components/admin/data"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { listChannels, listVideos, listShorts } from "@/lib/data"
import { compact } from "@/lib/format"
import { cn } from "@/lib/utils"
import type { ChannelMode } from "@/lib/types"

export const metadata: Metadata = { title: "Overview" }

const STATUS: Record<KpiStatus, { label: string; Icon: typeof CircleCheck; cls: string }> = {
  on_track: { label: "On track", Icon: CircleCheck, cls: "text-foreground" },
  watch: { label: "Watch", Icon: TriangleAlert, cls: "text-foreground" },
  off_track: { label: "Off track", Icon: CircleAlert, cls: "text-destructive" },
}

const MODE_LABEL: Record<ChannelMode, string> = { standard: "Standard", age_verified: "Age-verified" }

export default function AdminOverview() {
  const kpis = pilotKpis()
  const compliance = kpis.find((k) => k.id === "compliance")!
  const rest = kpis.filter((k) => k.id !== "compliance")
  const alerts = adminAlerts()
  const channels = listChannels()

  return (
    <div>
      <PageHeader
        title="Pilot overview"
        description="Section 3 metrics across the pilot channels, 13 October to 11 November 2026. Targets are the pilot hypotheses."
      />

      <section aria-labelledby="compliance-kpi" className="mb-6 flex flex-col gap-4 rounded-lg border bg-card p-5 md:flex-row md:items-center md:justify-between">
        <div className="flex items-start gap-4">
          <span className="grid size-10 shrink-0 place-items-center rounded-md bg-muted">
            <CircleCheck className="size-5" aria-hidden />
          </span>
          <div>
            <h2 id="compliance-kpi" className="text-[13px] font-semibold uppercase tracking-[0.8px] text-muted-foreground">
              Compliance · {compliance.label}
            </h2>
            <p className="mt-1 text-[15px] text-muted-foreground">{compliance.detail} Target: {compliance.target}.</p>
          </div>
        </div>
        <div className="flex items-baseline gap-3 md:text-right">
          <span className="text-[44px] font-extrabold leading-none tracking-[-1px]">{compliance.value}</span>
          <span className={cn("inline-flex items-center gap-1.5 text-[13px] font-semibold", STATUS[compliance.status].cls)}>
            {STATUS[compliance.status].label}
          </span>
        </div>
      </section>

      <section aria-label="Pilot KPIs" className="grid gap-px overflow-hidden rounded-lg border bg-border sm:grid-cols-2 xl:grid-cols-3">
        {rest.map((k) => {
          const s = STATUS[k.status]
          return (
            <div key={k.id} className="flex min-w-0 flex-col gap-2 bg-card p-5">
              <div className="flex items-center justify-between gap-3">
                <h3 className="text-[13px] font-semibold text-muted-foreground">{k.label}</h3>
                <span className={cn("inline-flex items-center gap-1 text-[12px] font-semibold", s.cls)}>
                  <s.Icon className={cn("size-3.5", k.status === "on_track" && "text-pop-ink")} aria-hidden />
                  {s.label}
                </span>
              </div>
              <span className="text-[30px] font-extrabold leading-[34px] tracking-[-0.6px]">{k.value}</span>
              <span className="text-[13px] text-muted-foreground">Target: {k.target}</span>
              <p className="text-[13px] leading-[19px] text-muted-foreground">{k.detail}</p>
            </div>
          )
        })}
      </section>

      <div className="mt-10 grid gap-10 xl:grid-cols-12">
        <section aria-labelledby="alerts" className="xl:col-span-7">
          <h2 id="alerts" className="mb-3 text-[18px] font-bold">Alerts</h2>
          <ul className="divide-y rounded-lg border">
            {alerts.map((a) => (
              <li key={a.id} className="flex flex-col gap-3 p-4 sm:flex-row sm:items-start">
                <span className="mt-0.5 shrink-0">
                  {a.severity === "action" ? (
                    <TriangleAlert className="size-4" aria-label="Needs action" />
                  ) : (
                    <Info className="size-4 text-muted-foreground" aria-label="For information" />
                  )}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="text-[14px] font-semibold">{a.title}</p>
                  <p className="mt-0.5 text-[13px] leading-[19px] text-muted-foreground">{a.detail}</p>
                </div>
                <Link href={a.href} className="inline-flex shrink-0 items-center gap-1 text-[13px] font-semibold hover:underline">
                  {a.cta} <ArrowRight className="size-3.5" aria-hidden />
                </Link>
              </li>
            ))}
          </ul>
        </section>

        <section aria-labelledby="pilot-channels" className="min-w-0 xl:col-span-5">
          <h2 id="pilot-channels" className="mb-3 text-[18px] font-bold">Pilot channels</h2>
          <div className="overflow-x-auto rounded-lg border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Channel</TableHead>
                  <TableHead>Mode</TableHead>
                  <TableHead className="text-right">Published</TableHead>
                  <TableHead className="text-right">Ready</TableHead>
                  <TableHead className="text-right">Followers</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {channels.map((c) => (
                  <TableRow key={c.id}>
                    <TableCell className="font-medium">
                      <Link href={`/c/${c.slug}`} className="hover:underline">{c.name}</Link>
                    </TableCell>
                    <TableCell>{MODE_LABEL[c.mode]}</TableCell>
                    <TableCell className="text-right tabular">
                      {listVideos(c.id, "published").length + listShorts(c.id, "published").length}
                    </TableCell>
                    <TableCell className="text-right tabular">
                      {listVideos(c.id, "ready").length + listShorts(c.id, "ready").length}
                    </TableCell>
                    <TableCell className="text-right">{compact(c.followers)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </section>
      </div>
    </div>
  )
}
