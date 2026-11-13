import Link from "next/link"
import { ArrowRight, Plus, ShieldCheck, Sparkles, Upload } from "lucide-react"
import { PageHeader } from "@/components/shell/page-header"
import { StatusBadge } from "@/components/brand/status-badge"
import { Button } from "@/components/ui/button"
import { getSendingDomain, listEmailCampaigns, listEmailStreams } from "@/lib/data"
import { compact } from "@/lib/format"
import { currentPublication } from "@/lib/publication"

export const metadata = { title: "Email" }

const pct = (n: number) => `${Math.round(n * 100)}%`

/** Email for the open publication: its streams, what's been sent and what's next, and sending health. */
export default async function EmailPage() {
  const channel = await currentPublication()
  const streams = listEmailStreams(channel.id)
  const campaigns = listEmailCampaigns(channel.id)
  const domain = getSendingDomain(channel.id)
  const total = streams.reduce((n, s) => n + s.subscribers, 0)
  const largest = Math.max(0, ...streams.map((s) => s.subscribers))
  const avg = (k: "openRate" | "clickRate") => (streams.length ? streams.reduce((n, s) => n + s[k] * s.subscribers, 0) / Math.max(1, total) : 0)
  const stats = [
    { label: "Members subscribed", value: compact(largest), note: `${compact(total)} subscriptions across ${streams.length} newsletters` },
    { label: "Open rate, 90 days", value: pct(avg("openRate")), note: "Apple Mail opens counted as estimates" },
    { label: "Click rate, 90 days", value: pct(avg("clickRate")), note: "Clicks to your own pages" },
    { label: "Sending from", value: domain?.managed ? "Shared" : "Your domain", note: domain?.domain ?? "" },
  ]

  return (
    <div className="grid grid-cols-1 gap-10">
      <PageHeader
        title="Email"
        description={`Newsletters from ${channel.name} to its members, sent from your own domain. Every subscriber signed up on your channel or came in with your import, so the list is yours.`}
        className="pb-0"
        actions={
          <>
            <Button variant="outline" asChild>
              <Link href="/studio/email/subscribers">
                <Upload /> Import subscribers
              </Link>
            </Button>
            <Button variant="pop" asChild>
              <Link href="/studio/email/new">
                <Plus /> New email
              </Link>
            </Button>
          </>
        }
      />

      <dl className="grid grid-cols-2 gap-px overflow-hidden rounded-lg border bg-border lg:grid-cols-4">
        {stats.map((s) => (
          <div key={s.label} className="flex flex-col gap-1 bg-card p-4">
            <dt className="order-2 text-[13px] text-muted-foreground">{s.label}</dt>
            <dd className="order-1 text-[28px] font-bold leading-8 tracking-[-0.6px]">{s.value}</dd>
            <dd className="order-3 truncate text-[12px] text-muted-foreground">{s.note}</dd>
          </div>
        ))}
      </dl>

      <section aria-labelledby="streams-h" className="min-w-0">
        <div className="mb-3 flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1">
          <h2 id="streams-h" className="text-lg font-semibold tracking-[-0.2px]">
            Newsletters
          </h2>
          <p className="text-[13px] text-muted-foreground">Members choose these on your Newsletters page and when they join</p>
        </div>
        <ul className="grid grid-cols-1 gap-3 md:grid-cols-2">
          {streams.map((s) => (
            <li key={s.id} className="flex min-w-0 flex-col gap-3 rounded-lg border bg-card p-4">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="flex flex-wrap items-center gap-2 text-[16px] font-semibold">
                    {s.name}
                    {s.autoDraft && (
                      <span className="inline-flex items-center gap-1 rounded-sm bg-muted px-1.5 text-[11px] font-semibold text-muted-foreground">
                        <Sparkles className="size-3" aria-hidden /> Drafts itself
                      </span>
                    )}
                    {s.membersOnly && <span className="rounded-sm border px-1.5 text-[11px] font-semibold text-muted-foreground">Members only</span>}
                  </p>
                  <p className="mt-0.5 text-[13px] leading-5 text-muted-foreground">{s.description}</p>
                </div>
              </div>
              <dl className="grid grid-cols-4 gap-2 border-t pt-3 text-[13px]">
                {[
                  ["Subscribers", compact(s.subscribers)],
                  ["Opens", pct(s.openRate)],
                  ["Clicks", pct(s.clickRate)],
                  ["Sends", s.cadence],
                ].map(([k, v]) => (
                  <div key={k} className="flex min-w-0 flex-col">
                    <dt className="order-2 text-[12px] text-muted-foreground">{k}</dt>
                    <dd className="order-1 truncate font-semibold">{v}</dd>
                  </div>
                ))}
              </dl>
              <Link href={`/studio/email/new?stream=${s.id}`} className="inline-flex w-fit items-center gap-1 text-[13px] font-semibold underline-offset-4 hover:underline">
                Write to {s.name} <ArrowRight className="size-3.5" aria-hidden />
              </Link>
            </li>
          ))}
        </ul>
      </section>

      <section aria-labelledby="sent-h">
        <h2 id="sent-h" className="mb-3 text-lg font-semibold tracking-[-0.2px]">
          Sent and scheduled
        </h2>
        <ul className="divide-y rounded-lg border bg-card">
          {campaigns.map((c) => (
            <li key={c.id} className="flex flex-wrap items-center gap-x-4 gap-y-2 p-3 sm:px-4">
              <span className="min-w-0 flex-1">
                <span className="block truncate text-sm font-semibold">{c.subject}</span>
                <span className="mt-0.5 block text-xs text-muted-foreground">
                  {streams.find((s) => s.id === c.streamId)?.name} · {c.date}
                </span>
              </span>
              <StatusBadge tone={c.status === "sent" ? "published" : c.status === "scheduled" ? "scheduled" : "draft"}>{c.status === "sent" ? "Sent" : undefined}</StatusBadge>
              <span className="w-40 text-right text-[13px] text-muted-foreground">
                {c.status === "sent" ? `${pct(c.opens / c.recipients)} opened · ${pct(c.clicks / c.recipients)} clicked` : `${compact(c.recipients)} subscribers`}
              </span>
            </li>
          ))}
        </ul>
      </section>

      {domain && (
        <Link href="/studio/email/sending" className="group flex flex-wrap items-center gap-4 rounded-lg border bg-card p-4 outline-none hover:bg-accent/40 focus-visible:ring-2 focus-visible:ring-ring">
          <ShieldCheck className="size-5" aria-hidden />
          <span className="min-w-0 flex-1 text-[14px] leading-[21px]">
            <span className="font-semibold">{domain.managed ? "Sending from Homestand's shared domain." : `Sending from ${domain.domain}, verified.`}</span>{" "}
            <span className="text-muted-foreground">
              Bounces {(domain.bounceRate * 100).toFixed(1)}%, spam complaints {(domain.complaintRate * 100).toFixed(2)}%. Both well inside what Gmail and Yahoo ask of bulk senders.
              {domain.managed && " Add your own domain for the best inbox placement."}
            </span>
          </span>
          <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" aria-hidden />
        </Link>
      )}
    </div>
  )
}
