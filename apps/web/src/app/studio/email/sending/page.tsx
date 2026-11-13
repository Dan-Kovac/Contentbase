import { CheckCircle2, CircleDashed } from "lucide-react"
import { PageHeader } from "@/components/shell/page-header"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { getSendingDomain } from "@/lib/data"
import { currentPublication } from "@/lib/publication"

export const metadata = { title: "Sending" }

/** Who the email is from, the DNS records that prove it, and the health numbers inboxes judge us on. */
export default async function SendingPage() {
  const channel = await currentPublication()
  const d = getSendingDomain(channel.id)
  if (!d) return null
  const site = channel.customDomain ?? `${channel.slug}.com.au`
  const records = d.managed
    ? [
        { type: "TXT", host: `send.${site}`, value: "v=spf1 include:spf.homestand.email ~all", purpose: "SPF: lets Homestand send for you", status: "pending" as const },
        { type: "CNAME", host: `hs1._domainkey.${site}`, value: "hs1.dkim.homestand.email", purpose: "DKIM: signs every email so it can't be faked", status: "pending" as const },
        { type: "MX", host: `send.${site}`, value: "feedback.homestand.email (priority 10)", purpose: "Bounces and complaints come back to us", status: "pending" as const },
        { type: "TXT", host: `_dmarc.${site}`, value: "v=DMARC1; p=none; rua=mailto:dmarc@homestand.email", purpose: "DMARC: tells inboxes what to do with fakes", status: "pending" as const },
      ]
    : d.records
  return (
    <div className="mx-auto grid max-w-[1040px] grid-cols-1 gap-8">
      <PageHeader title="Sending" description="Who your email comes from, the records that prove it, and the numbers inboxes judge you on." className="pb-0" />

      <section aria-labelledby="from-h" className="grid gap-4 rounded-lg border bg-card p-5 sm:grid-cols-2">
        <h2 id="from-h" className="text-[15px] font-semibold sm:col-span-2">
          From
        </h2>
        {[
          ["From name", d.fromName],
          ["From address", d.fromAddress],
          ["Replies go to", d.replyTo],
          ["Postal address (shown in every footer)", d.postalAddress],
        ].map(([label, value]) => (
          <div key={label} className="grid gap-1.5">
            <Label>{label}</Label>
            <Input defaultValue={value} />
          </div>
        ))}
      </section>

      <section aria-labelledby="domain-h" className="flex flex-col gap-3">
        <div className="flex flex-wrap items-baseline justify-between gap-2">
          <h2 id="domain-h" className="text-lg font-semibold tracking-[-0.2px]">
            {d.managed ? `Add your own domain: ${site}` : `Your sending domain: ${d.domain}`}
          </h2>
          <span className="flex items-center gap-1.5 text-[13px] font-semibold">
            {d.managed ? (
              <>
                <CircleDashed className="size-4" aria-hidden /> Using Homestand&apos;s shared domain for now
              </>
            ) : (
              <>
                <CheckCircle2 className="size-4 text-pop-ink" aria-hidden /> Verified
              </>
            )}
          </span>
        </div>
        <p className="text-[14px] leading-[21px] text-muted-foreground">
          {d.managed
            ? `Email goes out from ${d.domain} until you add these records where you manage ${site}. Your own domain builds your own reputation and lands in more inboxes. It usually takes a few minutes; we check every 15.`
            : "These records let us send as you, sign every email, and catch bounces and complaints. Leave them in place."}
        </p>
        <div className="overflow-x-auto rounded-lg border bg-card">
          <table className="w-full text-[13px]">
            <thead className="bg-muted/60 text-left">
              <tr>
                <th className="px-3 py-2 font-semibold">Type</th>
                <th className="px-3 py-2 font-semibold">Host</th>
                <th className="px-3 py-2 font-semibold">Value</th>
                <th className="px-3 py-2 font-semibold">Status</th>
              </tr>
            </thead>
            <tbody>
              {records.map((r) => (
                <tr key={r.host + r.type} className="border-t align-top">
                  <td className="px-3 py-2.5 font-mono">{r.type}</td>
                  <td className="px-3 py-2.5">
                    <span className="block break-all font-mono">{r.host}</span>
                    <span className="text-[12px] text-muted-foreground">{r.purpose}</span>
                  </td>
                  <td className="break-all px-3 py-2.5 font-mono text-muted-foreground">{r.value}</td>
                  <td className="whitespace-nowrap px-3 py-2.5 font-semibold">{r.status === "verified" ? "Verified" : "Waiting"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section aria-labelledby="health-h" className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <h2 id="health-h" className="sr-only">
          Health
        </h2>
        <div className="flex flex-col gap-1 rounded-lg border bg-card p-4">
          <p className="text-[13px] text-muted-foreground">Bounces, 30 days</p>
          <p className="text-[28px] font-bold leading-8">{(d.bounceRate * 100).toFixed(1)}%</p>
          <p className="text-[12px] text-muted-foreground">We pause sending and tell you above 2%.</p>
        </div>
        <div className="flex flex-col gap-1 rounded-lg border bg-card p-4">
          <p className="text-[13px] text-muted-foreground">Spam complaints, 30 days</p>
          <p className="text-[28px] font-bold leading-8">{(d.complaintRate * 100).toFixed(2)}%</p>
          <p className="text-[12px] text-muted-foreground">Gmail and Yahoo want bulk senders under 0.3%. We act at 0.1%.</p>
        </div>
      </section>

      <section aria-labelledby="rules-h" className="rounded-lg border bg-card p-5">
        <h2 id="rules-h" className="mb-3 text-[15px] font-semibold">
          Done for you on every email
        </h2>
        <ul className="grid gap-2 text-[14px] leading-[21px] text-muted-foreground sm:grid-cols-2">
          <li>One-click unsubscribe, in the footer and in the headers inboxes read</li>
          <li>Unsubscribes honoured straight away, on every publication you run</li>
          <li>Your name, why they&apos;re getting it and your postal address in the footer</li>
          <li>Bounced and complaining addresses suppressed automatically</li>
          <li>New domains warmed up gradually, so big lists don&apos;t look like spam</li>
          <li>No age-restricted sponsors in email: we can&apos;t check age in an inbox</li>
        </ul>
      </section>
    </div>
  )
}
