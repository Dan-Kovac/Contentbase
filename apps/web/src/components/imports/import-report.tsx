"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { ArrowLeft, ArrowRight, Captions, Check, Download, FileText, Loader2, RotateCw, ShieldCheck } from "lucide-react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { StatusBadge } from "@/components/brand/status-badge"
import { number } from "@/lib/format"
import { cn } from "@/lib/utils"
import type { ImportJob } from "@/lib/types"
import { SourceMark, SOURCE_LABEL } from "./source-meta"

export type PageMapRow = { from: string; to: string }

const pitchBar = "bg-muted [&>[data-slot=progress-indicator]]:bg-pitch"

function Count({ label, value, tone }: { label: string; value: number; tone?: "bad" }) {
  return (
    <div className="rounded-lg border bg-card p-4">
      <p className={cn("text-[13px] font-medium text-muted-foreground", tone === "bad" && value > 0 && "text-destructive")}>{label}</p>
      <p className={cn("mt-1 text-[28px] font-bold leading-8 tracking-[-0.5px] tabular", tone === "bad" && value > 0 && "text-destructive")}>{number(value)}</p>
    </div>
  )
}

function Block({ title, description, action, children }: { title: string; description?: React.ReactNode; action?: React.ReactNode; children: React.ReactNode }) {
  return (
    <section className="overflow-hidden rounded-lg border bg-card">
      <div className="flex flex-wrap items-start justify-between gap-3 border-b px-4 py-3 sm:px-5">
        <div className="min-w-0">
          <h2 className="text-[15px] font-semibold">{title}</h2>
          {description && <p className="mt-0.5 text-[13px] text-muted-foreground">{description}</p>}
        </div>
        {action}
      </div>
      {children}
    </section>
  )
}

export function ImportReport({
  job: initialJob,
  channelName,
  domain,
  isExample,
  skippedNote,
  pageMap,
  pageMapKind,
  crawledAt,
}: {
  job: ImportJob
  channelName: string
  domain: string
  isExample: boolean
  skippedNote: string
  pageMap: PageMapRow[]
  pageMapKind: "redirect" | "pages"
  crawledAt: string
}) {
  const [job, setJob] = useState(initialJob)
  const [retry, setRetry] = useState<Record<number, "retrying" | "queued">>({})
  const [articles, setArticles] = useState<"idle" | "queueing" | "queued">("idle")

  // The automatic sync finishes its second video while you watch.
  useEffect(() => {
    if (initialJob.status !== "running") return
    const t = setTimeout(() => {
      setJob((j) => ({ ...j, status: "done", imported: j.total - j.skipped - j.failed }))
      toast.success("Import finished", { description: "2 new videos are ready to review." })
    }, 6000)
    return () => clearTimeout(t)
  }, [initialJob.status])

  const processed = job.imported + job.skipped + job.failed
  const pct = Math.round((processed / job.total) * 100)
  const running = job.status === "running"
  const isYouTube = job.source === "youtube"
  const isFirstYouTube = job.id === "imp_yt_initial"
  const transcripts = { done: 180, of: job.imported }

  function retryOne(i: number) {
    setRetry((r) => ({ ...r, [i]: "retrying" }))
    setTimeout(() => {
      setRetry((r) => ({ ...r, [i]: "queued" }))
      toast.success("Queued for retry")
    }, 900)
  }
  function retryAll() {
    job.problems.forEach((_, i) => retryOne(i))
  }

  return (
    <div className="grid gap-6">
      <div>
        <Link href="/studio/imports" className="mb-3 inline-flex items-center gap-1.5 text-[13px] font-medium text-muted-foreground hover:text-foreground">
          <ArrowLeft className="size-3.5" aria-hidden /> Imports
        </Link>
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div className="flex min-w-0 gap-3">
            <SourceMark source={job.source} className="size-12" />
            <div className="min-w-0">
              <h1 className="text-[26px] font-bold leading-[30px] tracking-[-0.5px] sm:text-[30px] sm:leading-[34px]">{job.label}</h1>
              <p className="mt-1.5 flex flex-wrap items-center gap-2 text-[14px] text-muted-foreground">
                {running ? <StatusBadge tone="processing">Running</StatusBadge> : job.status === "failed" ? <StatusBadge tone="failed" /> : <StatusBadge tone="connected">Finished</StatusBadge>}
                {isExample && <StatusBadge tone="neutral">Example · {channelName}</StatusBadge>}
                <span>
                  {SOURCE_LABEL[job.source]} · Started {job.startedAt}
                </span>
              </p>
            </div>
          </div>
          <Button variant="outline" size="sm" onClick={() => toast.success("Downloaded", { description: `${job.id}-report.csv` })}>
            <Download /> Download report
          </Button>
        </div>
      </div>

      {/* Progress */}
      <section aria-label="Progress" className="rounded-lg border bg-card p-4 sm:p-5">
        <div className="flex flex-wrap items-baseline justify-between gap-2">
          <p className="text-sm font-medium" aria-live="polite">
            {running ? (
              <span className="flex items-center gap-2">
                <Loader2 className="size-4 animate-spin" aria-hidden /> Importing {processed + 1} of {job.total}
              </span>
            ) : (
              "Import complete"
            )}
          </p>
          <p className="text-[13px] text-muted-foreground tabular">
            {number(processed)} of {number(job.total)} items processed
          </p>
        </div>
        <Progress value={pct} className={cn("mt-3 h-2", pitchBar)} aria-label={`${pct}% processed`} />
        <p className="mt-3 text-sm">
          <span className="font-semibold tabular">{number(job.imported)}</span> imported · <span className="font-semibold tabular">{number(job.skipped)}</span> skipped ·{" "}
          <span className={cn("font-semibold tabular", job.failed > 0 && "text-destructive")}>{number(job.failed)}</span> failed
          {job.failed > 0 && (
            <>
              .{" "}
              <button type="button" onClick={retryAll} className="font-medium underline underline-offset-2 outline-none focus-visible:ring-2 focus-visible:ring-ring">
                Retry failed items
              </button>
            </>
          )}
        </p>
        {isFirstYouTube && (
          <div className="mt-4 flex items-start gap-3 rounded-md border bg-muted/40 p-3">
            <Captions className="mt-0.5 size-4 shrink-0" aria-hidden />
            <div className="grid min-w-0 flex-1 gap-2">
              <p className="text-[13px] leading-5">
                <span className="font-medium">
                  Transcripts: {transcripts.done} of {transcripts.of} done.
                </span>{" "}
                The rest finish within 2 days. YouTube limits how fast we can fetch captions, so large imports are spread out.
              </p>
              <Progress value={Math.round((transcripts.done / transcripts.of) * 100)} className="h-1.5 max-w-[320px] bg-muted [&>[data-slot=progress-indicator]]:bg-foreground" aria-label={`${transcripts.done} of ${transcripts.of} transcripts done`} />
            </div>
          </div>
        )}
      </section>

      <div className="grid grid-cols-3 gap-3">
        <Count label="Imported" value={job.imported} />
        <Count label="Skipped" value={job.skipped} />
        <Count label="Failed" value={job.failed} tone="bad" />
      </div>

      {/* MIG-08 */}
      {isFirstYouTube && (
        <section aria-label="Generate articles" className="flex flex-col gap-4 rounded-lg border bg-card p-4 sm:flex-row sm:items-center sm:justify-between sm:p-5">
          <div className="flex min-w-0 gap-3">
            <FileText className="mt-0.5 size-5 shrink-0" aria-hidden />
            <div>
              <p className="text-sm font-semibold">
                {articles === "queued" ? `${number(job.imported)} articles queued` : `Turn ${number(job.imported)} imported videos into articles`}
              </p>
              <p className="mt-0.5 text-[13px] leading-5 text-muted-foreground" aria-live="polite">
                {articles === "queued"
                  ? "They run in the background and land in Ready to review as drafts. Nothing goes live until you publish."
                  : "We draft an article, SEO title and description for each one, in your brand voice. They arrive as drafts for you to review."}
              </p>
            </div>
          </div>
          {articles === "queued" ? (
            <Button variant="outline" asChild className="self-start sm:self-auto">
              <Link href="/studio/review">
                Open Ready to review <ArrowRight />
              </Link>
            </Button>
          ) : (
            <Button
              variant="pop"
              className="self-start sm:self-auto"
              disabled={articles === "queueing"}
              onClick={() => {
                setArticles("queueing")
                setTimeout(() => {
                  setArticles("queued")
                  toast.success(`${number(job.imported)} articles queued`, { description: "Drafts land in Ready to review as they're done." })
                }, 900)
              }}
            >
              {articles === "queueing" && <Loader2 className="animate-spin" />} Generate articles for all imported videos
            </Button>
          )}
        </section>
      )}
      {isYouTube && !isFirstYouTube && (
        <p className="flex items-center gap-2 rounded-lg border bg-muted/40 px-4 py-3 text-[13px]">
          <Check className="size-4 shrink-0" aria-hidden /> New uploads get a draft pack automatically: video page, article, suggested shorts and SEO.
        </p>
      )}

      {/* Problems */}
      <Block
        title="Items that need attention"
        description={job.problems.length ? "Each failure says what went wrong and how to fix it." : "Nothing failed."}
        action={
          job.problems.length > 0 ? (
            <Button size="sm" variant="outline" onClick={retryAll} disabled={job.problems.every((_, i) => retry[i])}>
              <RotateCw /> Retry all
            </Button>
          ) : undefined
        }
      >
        {job.problems.length > 0 ? (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="pl-4 sm:pl-5">Item</TableHead>
                  <TableHead>Reason</TableHead>
                  <TableHead className="w-[120px]">Status</TableHead>
                  <TableHead className="w-[100px] pr-4 text-right sm:pr-5">
                    <span className="sr-only">Action</span>
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {job.problems.map((p, i) => (
                  <TableRow key={p.item}>
                    <TableCell className="min-w-[180px] whitespace-normal pl-4 font-medium sm:pl-5">{p.item}</TableCell>
                    <TableCell className="min-w-[240px] whitespace-normal text-[13px] text-muted-foreground">{p.reason}</TableCell>
                    <TableCell>{retry[i] === "queued" ? <StatusBadge tone="processing">Queued</StatusBadge> : <StatusBadge tone="failed" />}</TableCell>
                    <TableCell className="pr-4 text-right sm:pr-5">
                      <Button size="sm" variant="ghost" disabled={!!retry[i]} onClick={() => retryOne(i)} aria-label={`Retry ${p.item}`}>
                        {retry[i] === "retrying" ? <Loader2 className="animate-spin" /> : <RotateCw />} Retry
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        ) : null}
        <p className="border-t bg-muted/40 px-4 py-3 text-[13px] text-muted-foreground first:border-t-0 sm:px-5">
          <span className="font-medium text-foreground">{number(job.skipped)} skipped.</span> {skippedNote}
        </p>
      </Block>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_340px]">
        {/* Redirect map */}
        <Block
          title={pageMapKind === "redirect" ? "Redirect map" : "Page map"}
          description={
            pageMapKind === "redirect"
              ? `Every old URL returns a 301 to its new page on ${domain}. Showing ${pageMap.length} of ${number(job.imported)}.`
              : `Videos stay on YouTube, so no redirects are needed. Each one now has its own page on ${domain}.`
          }
        >
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="pl-4 sm:pl-5">{pageMapKind === "redirect" ? "Old URL" : "YouTube video"}</TableHead>
                  <TableHead className="w-6">
                    <span className="sr-only">to</span>
                  </TableHead>
                  <TableHead>New page</TableHead>
                  <TableHead className="pr-4 text-right sm:pr-5">{pageMapKind === "redirect" ? "Status" : ""}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {pageMap.map((r) => (
                  <TableRow key={r.from}>
                    <TableCell className="max-w-[280px] truncate pl-4 font-mono text-xs sm:pl-5" title={r.from}>
                      {r.from}
                    </TableCell>
                    <TableCell className="px-0 text-muted-foreground">
                      <ArrowRight className="size-3.5" aria-hidden />
                    </TableCell>
                    <TableCell className="max-w-[280px] truncate font-mono text-xs" title={r.to}>
                      {r.to}
                    </TableCell>
                    <TableCell className="pr-4 text-right font-mono text-xs sm:pr-5">{pageMapKind === "redirect" ? "301" : ""}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </Block>

        {/* Crawl check */}
        <Block title="Crawl check" description={running ? "Runs when the import finishes." : `Last run ${crawledAt}.`}>
          <div className="grid gap-3 p-4 sm:p-5">
            {running ? (
              <p className="flex items-center gap-2 text-sm text-muted-foreground">
                <Loader2 className="size-4 animate-spin" aria-hidden /> Waiting for the import
              </p>
            ) : (
              <>
                <p className="flex items-center gap-2 text-2xl font-bold tracking-[-0.4px]">
                  <ShieldCheck className="size-6" aria-hidden /> 0 broken links
                </p>
                <ul className="grid gap-1.5 text-[13px] text-muted-foreground">
                  <li className="flex justify-between gap-3">
                    <span>{pageMapKind === "redirect" ? "Old URLs checked" : "New pages checked"}</span>
                    <span className="font-medium text-foreground tabular">{number(job.imported)}</span>
                  </li>
                  <li className="flex justify-between gap-3">
                    <span>{pageMapKind === "redirect" ? "Returning 301" : "Internal links checked"}</span>
                    <span className="font-medium text-foreground tabular">{number(pageMapKind === "redirect" ? job.imported : job.imported * 6)}</span>
                  </li>
                  <li className="flex justify-between gap-3">
                    <span>Returning 404</span>
                    <span className="font-medium text-foreground tabular">0</span>
                  </li>
                </ul>
              </>
            )}
          </div>
        </Block>
      </div>
    </div>
  )
}
