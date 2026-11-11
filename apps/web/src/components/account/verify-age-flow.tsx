"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { ArrowRight, CircleCheck, CircleX, ExternalLink, FileCheck, IdCard, Lock, ScanFace, ShieldCheck } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Progress } from "@/components/ui/progress"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Spinner } from "@/components/ui/spinner"
import { cn } from "@/lib/utils"
import { AccountSheet } from "./sheet"

type Method = "digital-id" | "estimation" | "document"
type Step = "choose" | "handoff" | "success" | "failed"

const METHODS: { id: Method; title: string; note: string; time: string; Icon: typeof IdCard }[] = [
  { id: "digital-id", title: "Digital ID", note: "Approve a one-time 18+ check in your Digital ID app. Only “over 18: yes” comes back.", time: "About 1 minute", Icon: IdCard },
  { id: "estimation", title: "Age estimation", note: "A short selfie video. The provider estimates your age and deletes the video straight away.", time: "About 30 seconds", Icon: ScanFace },
  { id: "document", title: "ID document check", note: "Scan a licence or passport with the provider. They check it and keep nothing.", time: "About 2 minutes", Icon: FileCheck },
]

/** Age assurance (TLK-02): why we ask, choose a method, provider handoff, then result. */
export function VerifyAgeFlow() {
  const [step, setStep] = useState<Step>("choose")
  const [method, setMethod] = useState<Method>("digital-id")
  const [progress, setProgress] = useState(0)
  const chosen = METHODS.find((m) => m.id === method)!

  useEffect(() => {
    if (step !== "handoff") return
    setProgress(0)
    const t = setInterval(() => setProgress((p) => Math.min(100, p + 4)), 120)
    const done = setTimeout(() => setStep("success"), 3400)
    return () => {
      clearInterval(t)
      clearTimeout(done)
    }
  }, [step])

  if (step === "handoff") {
    return (
      <AccountSheet
        title={`Continue with ${chosen.title.toLowerCase()}`}
        lede="We've opened our certified provider in a new window. Finish there and you'll come straight back here."
        icon={<Badge Icon={chosen.Icon} />}
      >
        <div className="flex flex-col gap-4 rounded-lg border bg-muted/50 p-5" aria-live="polite">
          <div className="flex items-center gap-3">
            <Spinner className="size-5" />
            <div className="flex flex-col">
              <p className="text-[15px] font-semibold">Waiting for the provider</p>
              <p className="text-[13px] text-muted-foreground">{chosen.time}</p>
            </div>
          </div>
          <Progress value={progress} aria-label="Waiting for provider" className="bg-background *:data-[slot=progress-indicator]:bg-pitch" />
          <p className="flex items-center gap-2 text-[13px] text-muted-foreground">
            <Lock className="size-3.5" aria-hidden />
            Your ID goes to the provider, never to Homestand.
          </p>
        </div>
        <div className="flex flex-col gap-2.5">
          <Button variant="outline" size="lg" className="h-11">
            <ExternalLink aria-hidden />
            Reopen the provider window
          </Button>
          <Button variant="ghost" onClick={() => setStep("choose")}>
            Cancel
          </Button>
        </div>
        <button
          type="button"
          onClick={() => setStep("failed")}
          className="w-fit text-[12px] text-muted-foreground underline underline-offset-2 hover:text-foreground"
        >
          Prototype: show a failed check
        </button>
      </AccountSheet>
    )
  }

  if (step === "success") {
    return (
      <AccountSheet
        title="You're confirmed 18 or over"
        lede="We keep the result, never your ID."
        icon={<Badge Icon={CircleCheck} tone="ok" />}
      >
        <dl className="grid grid-cols-[auto_1fr] gap-x-6 gap-y-2.5 rounded-lg border p-4 text-[14px]">
          <dt className="text-muted-foreground">Result</dt>
          <dd className="font-semibold">18 or over</dd>
          <dt className="text-muted-foreground">Method</dt>
          <dd>{chosen.title}</dd>
          <dt className="text-muted-foreground">Reference</dt>
          <dd className="break-all font-mono text-[13px]">aa_20261111_7Hq2f</dd>
          <dt className="text-muted-foreground">Checked</dt>
          <dd>11 November 2026, 9:41 am</dd>
        </dl>
        <p className="text-[14px] leading-[22px] text-muted-foreground">
          That&apos;s all we store. You can still choose &ldquo;Don&apos;t show me betting ads&rdquo; at any time in your account.
        </p>
        <div className="flex flex-col gap-2.5">
          <Button asChild size="lg" className="h-11">
            <Link href="/account#ads">Back to ad preferences</Link>
          </Button>
          <Button asChild variant="ghost">
            <Link href="/c/footyfix">Back to Footy Fix</Link>
          </Button>
        </div>
      </AccountSheet>
    )
  }

  if (step === "failed") {
    return (
      <AccountSheet
        title="We couldn't confirm your age"
        lede={`The provider couldn't complete the ${chosen.title.toLowerCase()} check. Nothing about the attempt was kept.`}
        icon={<Badge Icon={CircleX} tone="fail" />}
      >
        <div className="flex flex-col gap-2 rounded-lg border p-4 text-[14px] leading-[22px]">
          <p className="font-semibold">Common reasons</p>
          <ul className="list-disc pl-5 text-muted-foreground">
            <li>The window was closed before the check finished</li>
            <li>The photo or scan was too dark or blurry</li>
            <li>The estimate was too close to 18 to be sure</li>
          </ul>
        </div>
        <p className="text-[14px] leading-[22px] text-muted-foreground">
          You can keep watching everything. Until you&apos;re confirmed, you won&apos;t see betting ads.
        </p>
        <div className="flex flex-col gap-2.5">
          <Button size="lg" className="h-11" onClick={() => setStep("choose")}>
            Try another method
          </Button>
          <Button asChild variant="ghost">
            <Link href="/account#ads">Not now</Link>
          </Button>
        </div>
      </AccountSheet>
    )
  }

  return (
    <AccountSheet
      title="Confirm you're 18 or over"
      lede="We keep the result, never your ID."
      icon={<Badge Icon={ShieldCheck} />}
      className="max-w-[520px]"
    >
      <div className="flex flex-col gap-2 rounded-lg bg-muted p-4">
        <p className="text-[14px] font-semibold">Why we ask</p>
        <p className="text-[14px] leading-[22px] text-muted-foreground">
          Australian law only allows betting ads online for signed-in adults who haven&apos;t opted out. We only use this check for betting ads. You
          don&apos;t need it to watch anything on Homestand.
        </p>
      </div>
      <form
        className="flex flex-col gap-5"
        onSubmit={(e) => {
          e.preventDefault()
          setStep("handoff")
        }}
      >
        <fieldset className="flex flex-col gap-3">
          <legend className="mb-3 text-[15px] font-semibold">Choose how to check</legend>
          <RadioGroup value={method} onValueChange={(v) => setMethod(v as Method)} className="gap-2">
            {METHODS.map(({ id, title, note, time, Icon }) => (
              <Label
                key={id}
                htmlFor={`m-${id}`}
                className={cn(
                  "flex cursor-pointer items-start gap-3 rounded-lg border p-4 font-normal transition-colors hover:bg-accent",
                  method === id && "border-foreground ring-1 ring-foreground",
                )}
              >
                <Icon className="mt-0.5 size-5 shrink-0" aria-hidden />
                <span className="flex min-w-0 flex-1 flex-col gap-1">
                  <span className="flex flex-wrap items-baseline justify-between gap-x-2">
                    <span className="text-[15px] font-semibold">{title}</span>
                    <span className="text-[12px] text-muted-foreground">{time}</span>
                  </span>
                  <span className="text-[13px] leading-5 text-muted-foreground">{note}</span>
                </span>
                <RadioGroupItem id={`m-${id}`} value={id} className="mt-0.5" />
              </Label>
            ))}
          </RadioGroup>
        </fieldset>
        <p className="text-[13px] leading-5 text-muted-foreground">
          Checks are run by a certified Australian age-assurance provider. We store only the result, the method, a reference and the time.
        </p>
        <div className="flex flex-col gap-2.5">
          <Button type="submit" size="lg" className="h-11">
            Continue to provider
            <ArrowRight aria-hidden />
          </Button>
          <Button asChild variant="ghost">
            <Link href="/account#ads">Not now</Link>
          </Button>
        </div>
      </form>
    </AccountSheet>
  )
}

function Badge({ Icon, tone }: { Icon: typeof IdCard; tone?: "ok" | "fail" }) {
  return (
    <span
      className={cn(
        "grid size-9 place-items-center rounded-[6px]",
        tone === "ok" ? "bg-pitch text-pop-foreground" : tone === "fail" ? "border border-destructive text-destructive" : "bg-muted",
      )}
    >
      <Icon className="size-5" aria-hidden />
    </span>
  )
}
