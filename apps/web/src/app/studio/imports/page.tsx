import Link from "next/link"
import { ArrowRight, Plus, RefreshCw } from "lucide-react"
import { PageHeader } from "@/components/shell/page-header"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { StatusBadge } from "@/components/brand/status-badge"
import { SourceMark, SOURCE_LABEL } from "@/components/imports/source-meta"
import { listChannels, listImportJobs } from "@/lib/data"
import { currentPublication } from "@/lib/publication"
import { number } from "@/lib/format"
import type { ImportJob } from "@/lib/types"

export const metadata = { title: "Imports" }

function JobStatus({ job }: { job: ImportJob }) {
  if (job.status === "running") return <StatusBadge tone="processing">Running</StatusBadge>
  if (job.status === "failed") return <StatusBadge tone="failed" />
  return <StatusBadge tone="connected">Finished</StatusBadge>
}

export default async function ImportsPage() {
  const demo = (await currentPublication())
  const jobs = listChannels().flatMap((c) => listImportJobs(c.id).map((j) => ({ job: j, channel: c })))
  // Own channel first, the running sync at the top.
  jobs.sort((a, b) => Number(b.channel.id === demo.id) - Number(a.channel.id === demo.id) || Number(b.job.status === "running") - Number(a.job.status === "running"))

  return (
    <div className="mx-auto max-w-[1040px]">
      <PageHeader
        title="Imports"
        description="Everything you've brought into Homestand, with what came across, what didn't and why."
        actions={
          <Button asChild>
            <Link href="/studio/imports/new">
              <Plus /> New import
            </Link>
          </Button>
        }
      />

      <div className="mb-6 flex flex-col gap-3 rounded-lg border bg-muted/40 p-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-start gap-3">
          <RefreshCw className="mt-0.5 size-4 shrink-0" aria-hidden />
          <p className="text-sm">
            <span className="font-medium">New YouTube uploads import automatically.</span>{" "}
            <span className="text-muted-foreground">Each one arrives as a draft pack in Ready to review.</span>
          </p>
        </div>
        <Link href="/studio/settings/connections" className="shrink-0 text-[13px] font-medium underline underline-offset-2">
          Manage in Connections
        </Link>
      </div>

      <ul className="grid gap-3" aria-label="Import history">
        {jobs.map(({ job, channel }) => {
          const done = job.imported + job.skipped + job.failed
          const pct = Math.round((done / job.total) * 100)
          const isExample = channel.id !== demo.id
          return (
            <li key={job.id} className="rounded-lg border bg-card">
              <div className="grid gap-4 p-4 sm:p-5 md:grid-cols-[minmax(0,1fr)_auto] md:items-center">
                <div className="flex min-w-0 gap-3">
                  <SourceMark source={job.source} />
                  <div className="min-w-0">
                    <p className="flex flex-wrap items-center gap-2">
                      <Link href={`/studio/imports/${job.id}`} className="text-sm font-semibold hover:underline">
                        {job.label}
                      </Link>
                      <JobStatus job={job} />
                      {isExample && <StatusBadge tone="neutral">Example · {channel.name}</StatusBadge>}
                    </p>
                    <p className="mt-0.5 text-[13px] text-muted-foreground">
                      {SOURCE_LABEL[job.source]} · Started {job.startedAt}
                    </p>
                    {job.status === "running" ? (
                      <div className="mt-3 grid max-w-[360px] gap-1.5">
                        <Progress value={pct} aria-label={`${done} of ${job.total} items`} className="h-1.5 bg-muted [&>[data-slot=progress-indicator]]:bg-pitch" />
                        <p className="text-[13px]">
                          {done} of {job.total} new videos imported. The next one is being drafted.
                        </p>
                      </div>
                    ) : (
                      <p className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-[13px] tabular">
                        <span>
                          <span className="font-semibold">{number(job.imported)}</span> imported
                        </span>
                        <span>
                          <span className="font-semibold">{number(job.skipped)}</span> skipped
                        </span>
                        <span className={job.failed ? "text-destructive" : undefined}>
                          <span className="font-semibold">{number(job.failed)}</span> failed
                        </span>
                      </p>
                    )}
                  </div>
                </div>
                <Button variant="outline" size="sm" asChild className="justify-self-start md:justify-self-end">
                  <Link href={`/studio/imports/${job.id}`}>
                    View report <ArrowRight />
                  </Link>
                </Button>
              </div>
            </li>
          )
        })}
      </ul>
    </div>
  )
}
