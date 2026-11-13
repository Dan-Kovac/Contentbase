"use client"

/**
 * Bring a list across from WordPress, Substack, Mailchimp or a spreadsheet. Consent is required
 * (Australia's Spam Act), duplicates and anyone who unsubscribed before are skipped, and each
 * person becomes a member who signs in with a link from any email.
 */
import { useState } from "react"
import { CheckCircle2, FileSpreadsheet, Upload } from "lucide-react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { Progress } from "@/components/ui/progress"
import { cn } from "@/lib/utils"

const SAMPLE = [
  ["email", "first_name", "signed_up"],
  ["mia.nguyen@example.com", "Mia", "2024-03-02"],
  ["tom.r@example.com", "Tom", "2025-07-19"],
  ["priya.s@example.com", "Priya", "2023-11-08"],
]

export function SubscriberImport({ streams, channelName }: { streams: { id: string; name: string }[]; channelName: string }) {
  const [file, setFile] = useState<string | null>(null)
  const [chosen, setChosen] = useState<string[]>(streams.slice(0, 1).map((s) => s.id))
  const [consent, setConsent] = useState(false)
  const [phase, setPhase] = useState<"pick" | "running" | "done">("pick")
  const [progress, setProgress] = useState(0)

  const run = () => {
    setPhase("running")
    setProgress(0)
    const t = setInterval(() => setProgress((p) => Math.min(100, p + 7)), 120)
    setTimeout(() => {
      clearInterval(t)
      setProgress(100)
      setPhase("done")
      toast.success("Import finished", { description: "2,840 new members subscribed." })
    }, 1900)
  }

  if (phase === "done") {
    return (
      <div className="flex flex-col gap-4 rounded-lg border bg-card p-5">
        <p className="flex items-center gap-2 text-[16px] font-semibold">
          <CheckCircle2 className="size-5 text-pop-ink" aria-hidden /> {file} imported
        </p>
        <dl className="grid grid-cols-2 gap-px overflow-hidden rounded-md border bg-border sm:grid-cols-4">
          {[
            ["2,840", "Subscribed"],
            ["96", "Already subscribed"],
            ["38", "Not valid email addresses"],
            ["19", "Unsubscribed before, so skipped"],
          ].map(([v, k]) => (
            <div key={k} className="flex flex-col bg-background p-3">
              <dt className="order-2 text-[12px] text-muted-foreground">{k}</dt>
              <dd className="order-1 text-[22px] font-bold">{v}</dd>
            </div>
          ))}
        </dl>
        <p className="text-[13px] leading-5 text-muted-foreground">
          Each one is now a {channelName} member. Their first email explains why they&apos;re hearing from you and has a one-click unsubscribe; they sign in with a link from any
          email.
        </p>
        <Button variant="outline" className="w-fit" onClick={() => { setPhase("pick"); setFile(null); setConsent(false) }}>
          Import another file
        </Button>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-5 rounded-lg border bg-card p-5">
      {!file ? (
        <button
          type="button"
          onClick={() => setFile("footyfix-substack-export.csv")}
          className="flex flex-col items-center gap-2 rounded-lg border border-dashed p-8 text-center outline-none hover:bg-accent/40 focus-visible:ring-2 focus-visible:ring-ring"
        >
          <Upload className="size-6" aria-hidden />
          <span className="text-[15px] font-semibold">Choose a CSV</span>
          <span className="text-[13px] text-muted-foreground">An export from WordPress, Substack, Mailchimp or a spreadsheet. Up to 100,000 rows.</span>
        </button>
      ) : (
        <>
          <p className="flex items-center gap-2 text-[14px] font-semibold">
            <FileSpreadsheet className="size-4" aria-hidden /> {file} · 2,993 rows
          </p>
          <div className="overflow-x-auto rounded-md border">
            <table className="w-full text-[13px]">
              <thead className="bg-muted/60">
                <tr>
                  {SAMPLE[0].map((h, i) => (
                    <th key={h} className="px-3 py-2 text-left font-semibold">
                      {h}
                      <span className="block text-[11px] font-normal text-muted-foreground">{["Email (required)", "First name", "Signed up"][i]}</span>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {SAMPLE.slice(1).map((r) => (
                  <tr key={r[0]} className="border-t">
                    {r.map((c) => (
                      <td key={c} className="px-3 py-2 text-muted-foreground">
                        {c}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}

      <fieldset className="flex flex-col gap-2">
        <legend className="mb-1 text-[14px] font-semibold">Subscribe them to</legend>
        <div className="flex flex-wrap gap-2">
          {streams.map((s) => {
            const on = chosen.includes(s.id)
            return (
              <button
                key={s.id}
                type="button"
                aria-pressed={on}
                onClick={() => setChosen((c) => (on ? c.filter((x) => x !== s.id) : [...c, s.id]))}
                className={cn("h-9 rounded-full border px-3.5 text-[13px] font-semibold outline-none focus-visible:ring-2 focus-visible:ring-ring", on ? "border-foreground bg-foreground text-background" : "hover:bg-accent")}
              >
                {s.name}
              </button>
            )
          })}
        </div>
      </fieldset>

      <div className="flex items-start gap-3 rounded-md bg-muted/60 p-3">
        <Checkbox id="consent" checked={consent} onCheckedChange={(v) => setConsent(v === true)} className="mt-0.5" />
        <Label htmlFor="consent" className="text-[13px] font-normal leading-5">
          These people asked to hear from {channelName}, and I can show it if asked. Australia&apos;s Spam Act needs consent; buying lists isn&apos;t allowed.
        </Label>
      </div>

      {phase === "running" ? (
        <div className="flex flex-col gap-2">
          <Progress value={progress} aria-label="Import progress" />
          <p className="text-[13px] text-muted-foreground">Checking addresses, removing duplicates and anyone who unsubscribed before…</p>
        </div>
      ) : (
        <Button className="w-fit" disabled={!file || !consent || chosen.length === 0} onClick={run}>
          Import subscribers
        </Button>
      )}
    </div>
  )
}
