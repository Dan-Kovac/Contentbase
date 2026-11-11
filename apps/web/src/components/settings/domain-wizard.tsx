"use client"

import { useEffect, useState } from "react"
import { AlertCircle, Check, Copy, ExternalLink, Globe, Loader2, Lock, Plus, RotateCcw, ShieldCheck, X } from "lucide-react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { StatusBadge } from "@/components/brand/status-badge"
import { cn } from "@/lib/utils"
import type { Channel } from "@/lib/types"
import { Panel, PanelFooter, Section } from "./section"

const DOMAIN = /^(?=.{4,253}$)([a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?\.)+[a-z]{2,}$/

const STEPS = ["Domain", "DNS records", "Verify", "SSL", "Go live"] as const
type Step = 0 | 1 | 2 | 3 | 4

type RecordStatus = "pending" | "verified"

function CopyButton({ value, label }: { value: string; label: string }) {
  const [done, setDone] = useState(false)
  return (
    <Button
      variant="ghost"
      size="icon-xs"
      aria-label={`Copy ${label}`}
      onClick={() => {
        navigator.clipboard?.writeText(value).catch(() => {})
        setDone(true)
        toast.success("Copied")
        setTimeout(() => setDone(false), 1500)
      }}
    >
      {done ? <Check /> : <Copy />}
    </Button>
  )
}

function Stepper({ step }: { step: Step }) {
  return (
    <ol className="flex flex-wrap gap-x-1 gap-y-2" aria-label="Steps">
      {STEPS.map((s, i) => {
        const done = i < step
        const current = i === step
        return (
          <li key={s} className="flex items-center gap-1" aria-current={current ? "step" : undefined}>
            <span
              className={cn(
                "flex h-7 items-center gap-1.5 rounded-full border px-2.5 text-[12px] font-medium",
                current && "border-foreground bg-foreground text-background",
                done && "text-foreground",
                !done && !current && "text-muted-foreground",
              )}
            >
              {done ? <Check className="size-3.5" aria-hidden /> : <span className="font-mono tabular">{i + 1}</span>}
              {s}
            </span>
            {i < STEPS.length - 1 && <span className="hidden h-px w-3 bg-border sm:block" aria-hidden />}
          </li>
        )
      })}
    </ol>
  )
}

export function DomainSettings({ channel }: { channel: Channel }) {
  const primary = channel.customDomain ?? "footyfix.com.au"
  const [wizardOpen, setWizardOpen] = useState(false)
  const [step, setStep] = useState<Step>(0)
  const [domain, setDomain] = useState("")
  const [kind, setKind] = useState<"apex" | "sub">("apex")
  const [touched, setTouched] = useState(false)
  const [checking, setChecking] = useState(false)
  const [checks, setChecks] = useState(0)
  const [records, setRecords] = useState<RecordStatus[]>(["pending", "pending", "pending"])
  const [ssl, setSsl] = useState<"issuing" | "issued">("issuing")
  const [extra, setExtra] = useState<{ domain: string; primary: boolean }[]>([])
  const [makePrimary, setMakePrimary] = useState(false)

  const clean = domain.trim().toLowerCase().replace(/^https?:\/\//, "").replace(/\/.*$/, "")
  const domainError = !clean
    ? "Enter the domain you own, e.g. footyfixtv.com.au."
    : !DOMAIN.test(clean)
      ? "That doesn't look like a domain. Check the spelling, e.g. footyfixtv.com.au."
      : clean.endsWith("homestand.com.au")
        ? "That's a Homestand address. Enter a domain you bought, e.g. footyfixtv.com.au."
        : clean === primary || extra.some((e) => e.domain === clean)
          ? "That domain is already on your channel."
          : null

  const host = kind === "apex" ? "@" : clean.split(".")[0]
  const dnsRecords =
    kind === "apex"
      ? [
          { type: "A", name: "@", value: "76.223.18.40", purpose: "Points your domain at Homestand" },
          { type: "CNAME", name: "www", value: "edge.homestand.com.au", purpose: "Sends www to the same place" },
          { type: "TXT", name: "_homestand", value: `hs-verify=${channel.slug}-7c2a91`, purpose: "Proves you own the domain" },
        ]
      : [
          { type: "CNAME", name: host, value: "edge.homestand.com.au", purpose: "Points the subdomain at Homestand" },
          { type: "TXT", name: `_homestand.${host}`, value: `hs-verify=${channel.slug}-7c2a91`, purpose: "Proves you own the domain" },
        ]

  // SSL is issued automatically once DNS is verified.
  useEffect(() => {
    if (step !== 3 || ssl === "issued") return
    const t = setTimeout(() => setSsl("issued"), 1800)
    return () => clearTimeout(t)
  }, [step, ssl])

  function reset() {
    setStep(0)
    setDomain("")
    setTouched(false)
    setChecks(0)
    setRecords(["pending", "pending", "pending"])
    setSsl("issuing")
    setMakePrimary(false)
  }

  function verify() {
    setChecking(true)
    setTimeout(() => {
      setChecking(false)
      const n = checks + 1
      setChecks(n)
      if (n === 1) {
        // First check: the TXT record has propagated, the rest haven't yet.
        setRecords(dnsRecords.map((r) => (r.type === "TXT" ? "verified" : "pending")))
      } else {
        setRecords(dnsRecords.map(() => "verified"))
        toast.success("Domain verified")
      }
    }, 1400)
  }

  const allVerified = records.slice(0, dnsRecords.length).every((r) => r === "verified")

  return (
    <div>
      <Section id="domains" title="Your domains" description="Your Homestand address always works. A custom domain becomes the address people see and Google indexes.">
        <Panel>
          <ul className="divide-y">
            <li className="grid gap-3 p-4 sm:grid-cols-[1fr_auto] sm:items-center sm:p-5">
              <div className="min-w-0">
                <p className="flex flex-wrap items-center gap-2">
                  <Globe className="size-4 text-muted-foreground" aria-hidden />
                  <span className="font-mono text-sm font-medium">{primary}</span>
                  {!extra.some((e) => e.primary) && <StatusBadge tone="published">Primary</StatusBadge>}
                </p>
                <ul className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-[13px] text-muted-foreground">
                  <li className="flex items-center gap-1.5">
                    <Check className="size-3.5 text-foreground" aria-hidden /> DNS verified
                  </li>
                  <li className="flex items-center gap-1.5">
                    <Lock className="size-3.5 text-foreground" aria-hidden /> SSL issued, renews automatically
                  </li>
                  <li className="flex items-center gap-1.5">
                    <span className="size-[7px] bg-pop-ink" aria-hidden /> Live since 28 October 2026
                  </li>
                </ul>
              </div>
              <Button variant="outline" size="sm" asChild className="justify-self-start">
                <a href={`https://${primary}`} target="_blank" rel="noreferrer">
                  Visit <ExternalLink />
                </a>
              </Button>
            </li>
            {extra.map((e) => (
              <li key={e.domain} className="grid gap-3 p-4 sm:grid-cols-[1fr_auto] sm:items-center sm:p-5">
                <div className="min-w-0">
                  <p className="flex flex-wrap items-center gap-2">
                    <Globe className="size-4 text-muted-foreground" aria-hidden />
                    <span className="font-mono text-sm font-medium">{e.domain}</span>
                    {e.primary ? <StatusBadge tone="published">Primary</StatusBadge> : <StatusBadge tone="connected">Redirects to primary</StatusBadge>}
                  </p>
                  <p className="mt-2 flex items-center gap-1.5 text-[13px] text-muted-foreground">
                    <Lock className="size-3.5 text-foreground" aria-hidden /> SSL issued · Live
                  </p>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  className="justify-self-start"
                  onClick={() => {
                    setExtra((l) => l.filter((x) => x.domain !== e.domain))
                    toast.success(`${e.domain} removed`)
                  }}
                >
                  Remove
                </Button>
              </li>
            ))}
            <li className="grid gap-3 bg-muted/40 p-4 sm:grid-cols-[1fr_auto] sm:items-center sm:p-5">
              <div className="min-w-0">
                <p className="flex flex-wrap items-center gap-2">
                  <span className="font-mono text-sm">{channel.slug}.homestand.com.au</span>
                  <StatusBadge tone="neutral">Homestand address</StatusBadge>
                </p>
                <p className="mt-1 text-[13px] text-muted-foreground">Redirects to your primary domain. Always on.</p>
              </div>
            </li>
          </ul>
          {!wizardOpen && (
            <PanelFooter note="Add a second domain, or a new one to move to.">
              <Button
                size="sm"
                onClick={() => {
                  reset()
                  setWizardOpen(true)
                }}
              >
                <Plus /> Add domain
              </Button>
            </PanelFooter>
          )}
        </Panel>
      </Section>

      {wizardOpen && (
        <Section id="wizard" title="Add a domain" description="Five steps. Most domains are live within 15 minutes. Your current address keeps working the whole time.">
          <Panel>
            <div className="flex flex-wrap items-center justify-between gap-3 border-b px-4 py-3 sm:px-5">
              <Stepper step={step} />
              <Button variant="ghost" size="icon-sm" aria-label="Close wizard" onClick={() => setWizardOpen(false)}>
                <X />
              </Button>
            </div>

            {step === 0 && (
              <form
                className="grid gap-5 p-4 sm:p-5"
                onSubmit={(e) => {
                  e.preventDefault()
                  setTouched(true)
                  if (!domainError) {
                    setDomain(clean)
                    setStep(1)
                  }
                }}
              >
                <div className="grid gap-2">
                  <Label htmlFor="new-domain">Domain</Label>
                  <Input
                    id="new-domain"
                    placeholder="footyfixtv.com.au"
                    value={domain}
                    onChange={(e) => setDomain(e.target.value)}
                    className="font-mono sm:max-w-[360px]"
                    spellCheck={false}
                    autoComplete="off"
                    aria-invalid={touched && !!domainError}
                    aria-describedby={touched && domainError ? "domain-error" : "domain-help"}
                  />
                  {touched && domainError ? (
                    <p id="domain-error" className="flex items-center gap-1.5 text-[13px] text-destructive">
                      <AlertCircle className="size-4 shrink-0" aria-hidden /> {domainError}
                    </p>
                  ) : (
                    <p id="domain-help" className="text-[13px] text-muted-foreground">
                      Buy it first from any registrar, such as VentraIP, Crazy Domains or GoDaddy.
                    </p>
                  )}
                </div>
                <fieldset className="grid gap-2">
                  <legend className="mb-2 text-sm font-medium">Type of domain</legend>
                  <RadioGroup value={kind} onValueChange={(v) => setKind(v as "apex" | "sub")} className="gap-2">
                    <label className="flex items-start gap-3 rounded-md border p-3 has-[[data-state=checked]]:border-foreground">
                      <RadioGroupItem value="apex" className="mt-0.5" />
                      <span>
                        <span className="block text-sm font-medium">A whole domain</span>
                        <span className="block text-[13px] text-muted-foreground">footyfixtv.com.au, with www redirecting to it</span>
                      </span>
                    </label>
                    <label className="flex items-start gap-3 rounded-md border p-3 has-[[data-state=checked]]:border-foreground">
                      <RadioGroupItem value="sub" className="mt-0.5" />
                      <span>
                        <span className="block text-sm font-medium">A subdomain</span>
                        <span className="block text-[13px] text-muted-foreground">watch.footyfix.com.au, alongside an existing site</span>
                      </span>
                    </label>
                  </RadioGroup>
                </fieldset>
                <div>
                  <Button type="submit">Continue</Button>
                </div>
              </form>
            )}

            {step === 1 && (
              <div className="grid gap-4 p-4 sm:p-5">
                <p className="text-sm">
                  Sign in to the registrar for <span className="font-mono font-medium">{domain}</span> and add these records in its DNS settings. Leave TTL at the default.
                </p>
                <div className="overflow-x-auto rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-20">Type</TableHead>
                        <TableHead>Name</TableHead>
                        <TableHead>Value</TableHead>
                        <TableHead className="hidden md:table-cell">What it does</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {dnsRecords.map((r) => (
                        <TableRow key={r.type + r.name}>
                          <TableCell className="font-mono text-[13px] font-medium">{r.type}</TableCell>
                          <TableCell>
                            <span className="flex items-center gap-1 font-mono text-[13px]">
                              {r.name} <CopyButton value={r.name} label={`${r.type} name`} />
                            </span>
                          </TableCell>
                          <TableCell>
                            <span className="flex items-center gap-1 font-mono text-[13px]">
                              {r.value} <CopyButton value={r.value} label={`${r.type} value`} />
                            </span>
                          </TableCell>
                          <TableCell className="hidden text-[13px] text-muted-foreground md:table-cell">{r.purpose}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
                <p className="text-[13px] text-muted-foreground">Remove any other A or AAAA records on {kind === "apex" ? "@" : host}. They would send some visitors to your old host.</p>
                <div className="flex flex-wrap gap-2">
                  <Button onClick={() => setStep(2)}>I&apos;ve added the records</Button>
                  <Button variant="ghost" onClick={() => setStep(0)}>
                    Back
                  </Button>
                </div>
              </div>
            )}

            {step === 2 && (
              <div className="grid gap-4 p-4 sm:p-5">
                <ul className="divide-y rounded-md border" aria-live="polite">
                  {dnsRecords.map((r, i) => (
                    <li key={r.type + r.name} className="flex items-center justify-between gap-3 px-3 py-2.5">
                      <span className="min-w-0 truncate font-mono text-[13px]">
                        {r.type} <span className="text-muted-foreground">{r.name}</span>
                      </span>
                      {checking ? (
                        <span className="flex items-center gap-1.5 text-[13px] text-muted-foreground">
                          <Loader2 className="size-3.5 animate-spin" aria-hidden /> Checking
                        </span>
                      ) : records[i] === "verified" ? (
                        <StatusBadge tone="connected">Verified</StatusBadge>
                      ) : (
                        <StatusBadge tone="processing">{checks === 0 ? "Not checked" : "Pending"}</StatusBadge>
                      )}
                    </li>
                  ))}
                </ul>
                {checks > 0 && !allVerified && !checking && (
                  <p className="flex items-start gap-2 rounded-md bg-muted px-3 py-2 text-[13px]">
                    <AlertCircle className="mt-0.5 size-4 shrink-0" aria-hidden />
                    We can see your TXT record, but not the others yet. DNS changes usually show within 15 minutes and can take up to 48 hours. Check the values match, then check again.
                  </p>
                )}
                {allVerified && <p className="text-[13px]">All records found. We&apos;re ready to issue your certificate.</p>}
                <div className="flex flex-wrap gap-2">
                  {allVerified ? (
                    <Button onClick={() => setStep(3)}>Continue</Button>
                  ) : (
                    <Button onClick={verify} disabled={checking}>
                      {checking && <Loader2 className="animate-spin" />} {checks === 0 ? "Check DNS" : "Check again"}
                    </Button>
                  )}
                  <Button variant="ghost" onClick={() => setStep(1)}>
                    See records
                  </Button>
                </div>
              </div>
            )}

            {step === 3 && (
              <div className="grid gap-4 p-4 sm:p-5">
                <div className="flex items-center gap-3 rounded-md border p-4" aria-live="polite">
                  {ssl === "issuing" ? <Loader2 className="size-5 animate-spin" aria-hidden /> : <ShieldCheck className="size-5" aria-hidden />}
                  <div>
                    <p className="text-sm font-medium">{ssl === "issuing" ? "Issuing your SSL certificate" : "SSL certificate issued"}</p>
                    <p className="text-[13px] text-muted-foreground">
                      {ssl === "issuing" ? "This takes about a minute. You don't need to do anything." : `https://${domain} is secure. We renew it automatically every 60 days.`}
                    </p>
                  </div>
                </div>
                <div>
                  <Button disabled={ssl !== "issued"} onClick={() => setStep(4)}>
                    Continue
                  </Button>
                </div>
              </div>
            )}

            {step === 4 && (
              <div className="grid gap-4 p-4 sm:p-5">
                <label className="flex items-start gap-3 rounded-md border p-3">
                  <input type="checkbox" className="mt-1 size-4 accent-foreground" checked={makePrimary} onChange={(e) => setMakePrimary(e.target.checked)} />
                  <span>
                    <span className="block text-sm font-medium">Make {domain} my primary domain</span>
                    <span className="block text-[13px] text-muted-foreground">
                      Otherwise it redirects to {primary}. Making it primary moves your pages with 301 redirects, so search rankings carry over.
                    </span>
                  </span>
                </label>
                <div>
                  <Button
                    variant="pop"
                    onClick={() => {
                      setExtra((l) => [...l.map((x) => ({ ...x, primary: makePrimary ? false : x.primary })), { domain, primary: makePrimary }])
                      setWizardOpen(false)
                      toast.success(`${domain} is live`)
                    }}
                  >
                    Go live
                  </Button>
                </div>
              </div>
            )}

            <div className="flex items-start gap-2 border-t bg-muted/40 px-4 py-3 text-[13px] text-muted-foreground sm:px-5">
              <RotateCcw className="mt-0.5 size-4 shrink-0" aria-hidden />
              <p>
                <span className="font-medium text-foreground">Rollback:</span> if something looks wrong after going live, remove the domain here and your channel serves from {primary} again within a minute. Old links keep redirecting.
              </p>
            </div>
          </Panel>
        </Section>
      )}

      <Section id="rollback" title="If something goes wrong" description="Domain changes are safe to undo.">
        <ul className="grid gap-2 text-[13px] leading-5 text-muted-foreground">
          <li className="rounded-md border bg-card p-3">
            <span className="font-medium text-foreground">Switching back is one click.</span> Remove a domain or make another one primary, and traffic moves within a minute.
          </li>
          <li className="rounded-md border bg-card p-3">
            <span className="font-medium text-foreground">Your Homestand address never stops.</span> {channel.slug}.homestand.com.au always serves your channel, whatever happens to DNS.
          </li>
          <li className="rounded-md border bg-card p-3">
            <span className="font-medium text-foreground">Email is untouched.</span> We never ask you to change MX records, so your mail keeps flowing.
          </li>
        </ul>
      </Section>
    </div>
  )
}
