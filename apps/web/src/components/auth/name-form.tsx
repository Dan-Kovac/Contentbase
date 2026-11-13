"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { AlertCircle, ArrowRight, Check, CircleCheck, CircleX } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Spinner } from "@/components/ui/spinner"
import { AccentField, accentState } from "@/components/settings/accent-field"
import { CTA_PRESETS } from "@/lib/cta"
import { cn } from "@/lib/utils"
import type { Template } from "@/lib/types"
import { AuthHeading, AuthShell } from "./auth-shell"
import { ChannelPreview } from "./channel-preview"
import { toSubdomain, useSignupDraft } from "./signup-draft"
import { SignupSteps } from "./signup-steps"

const TEMPLATES: { id: Template; label: string; note: string }[] = [
  { id: "editorial", label: "Editorial", note: "A white magazine: photo lead, story grid" },
  { id: "broadcast", label: "Broadcast", note: "Dark and video-led, rails of videos" },
]

/** Subdomains already in use (sample). */
const TAKEN = new Set(["footy", "afl", "nrl", "racing", "trackside", "homestand", "www", "studio", "admin", "footyfixed"])

type Check = "idle" | "checking" | "available" | "taken" | "invalid"

/**
 * Step 3, Make it yours: name and address, template, colour and the channel's button, with the
 * live preview as the left panel. Logo and type pairing wait for Design settings.
 */
export function NameForm() {
  const router = useRouter()
  const [draft, update] = useSignupDraft()
  const [touchedSub, setTouchedSub] = useState(false)
  const [check, setCheck] = useState<Check>("idle")
  const sub = draft.subdomain

  useEffect(() => {
    if (!sub) {
      // eslint-disable-next-line react-hooks/set-state-in-effect -- derived check state for the simulated availability lookup
      setCheck("idle")
      return
    }
    if (sub.length < 3) {
      setCheck("invalid")
      return
    }
    setCheck("checking")
    const t = setTimeout(() => setCheck(TAKEN.has(sub) ? "taken" : "available"), 450)
    return () => clearTimeout(t)
  }, [sub])

  const suggestions = [`${sub}au`, `${sub}hq`, `the${sub}`].filter((s) => !TAKEN.has(s))
  const accent = accentState(draft.accentHex)
  const [tried, setTried] = useState(false)
  const ready = check === "available" && !!draft.name.trim() && accent.ok && !!draft.ctaLabel.trim()

  const preview = (
    <ChannelPreview
      name={draft.name}
      subdomain={draft.subdomain}
      template={draft.template}
      accentHex={draft.accentHex}
      pairing={draft.pairing}
      logoUrl={draft.logoUrl}
      iconUrl={draft.iconUrl}
      ctaLabel={draft.ctaLabel}
    />
  )

  return (
    <AuthShell
      wide
      top={<SignupSteps current={2} />}
      aside={
        <div className="flex flex-col gap-5">
          <p className="text-[13px] font-semibold uppercase tracking-[1px] text-brand-muted">Live preview</p>
          {preview}
          <p className="text-[13px] leading-5 text-brand-muted">Your import has already started, and your real videos replace the sample photos as they arrive. Add a logo and choose fonts later in Design settings.</p>
        </div>
      }
    >
    <AuthHeading title="Make it yours" lede="Your name, your address, your look and the one thing you want visitors to do. Change any of it later." />
    <div className="lg:hidden">{preview}</div>
    <form
      noValidate
      className="flex flex-col gap-8"
      onSubmit={(e) => {
        e.preventDefault()
        setTried(true)
        if (ready) router.push("/signup/importing")
      }}
    >
      <div className="flex flex-col gap-2">
        <Label htmlFor="channel-name">Channel name</Label>
        <Input
          id="channel-name"
          className="h-11 text-[16px]"
          value={draft.name}
          maxLength={40}
          onChange={(e) => {
            const name = e.target.value
            update(touchedSub ? { name } : { name, subdomain: toSubdomain(name) })
          }}
          aria-describedby="channel-name-note"
        />
        <p id="channel-name-note" className="text-[13px] text-muted-foreground">
          Shown in your header when you don&apos;t have a logo. You can change it any time.
        </p>
      </div>

      <div className="flex flex-col gap-2">
        <Label htmlFor="subdomain">Your address</Label>
        <div className="flex h-11 items-center rounded-md border border-input focus-within:border-ring focus-within:ring-[3px] focus-within:ring-ring/50">
          <input
            id="subdomain"
            className="h-full w-0 min-w-0 flex-1 bg-transparent pl-3 text-[16px] outline-none"
            value={sub}
            maxLength={30}
            autoCapitalize="none"
            spellCheck={false}
            onChange={(e) => {
              setTouchedSub(true)
              update({ subdomain: toSubdomain(e.target.value) })
            }}
            aria-describedby="subdomain-status"
            aria-invalid={check === "taken" || check === "invalid"}
          />
          <span className="shrink-0 pr-3 text-[15px] text-muted-foreground">.homestand.com.au</span>
        </div>
        <div id="subdomain-status" aria-live="polite" className="min-h-5 text-[13px]">
          {check === "checking" && (
            <span className="flex items-center gap-1.5 text-muted-foreground">
              <Spinner className="size-3.5" aria-hidden /> Checking {sub}.homestand.com.au
            </span>
          )}
          {check === "available" && (
            <span className="flex items-center gap-1.5 font-medium">
              <CircleCheck className="size-4 text-pop-ink" aria-hidden /> {sub}.homestand.com.au is available
            </span>
          )}
          {check === "taken" && (
            <span className="flex flex-wrap items-center gap-1.5 text-destructive">
              <CircleX className="size-4" aria-hidden /> {sub}.homestand.com.au is taken. Try
              {suggestions.map((s, i) => (
                <button
                  key={s}
                  type="button"
                  className="font-semibold text-foreground underline underline-offset-2"
                  onClick={() => {
                    setTouchedSub(true)
                    update({ subdomain: s })
                  }}
                >
                  {s}
                  {i < suggestions.length - 1 ? "," : ""}
                </button>
              ))}
            </span>
          )}
          {check === "invalid" && <span className="text-destructive">Use at least 3 letters or numbers.</span>}
          {check === "idle" && <span className="text-muted-foreground">Letters and numbers only.</span>}
        </div>
        <p className="text-[13px] leading-5 text-muted-foreground">
          Live as soon as you finish. On Pro you can point your own domain, like footyfix.com.au, at it later.
        </p>
      </div>

      <fieldset className="flex flex-col gap-3">
        <legend className="mb-3 text-[15px] font-semibold">Template</legend>
        <div role="radiogroup" aria-label="Template" className="grid grid-cols-2 gap-2">
          {TEMPLATES.map((t) => (
            <button
              key={t.id}
              type="button"
              role="radio"
              aria-checked={draft.template === t.id}
              // The type pairing follows the template here; it can be changed later in Design settings.
              onClick={() => update({ template: t.id, pairing: t.id === "broadcast" ? "grandstand" : "minimal" })}
              className={cn(
                "flex flex-col gap-1 rounded-lg border p-3 text-left outline-none transition-colors focus-visible:ring-2 focus-visible:ring-ring",
                draft.template === t.id ? "border-foreground ring-1 ring-foreground" : "hover:bg-accent",
              )}
            >
              <span className="flex items-center justify-between text-[14px] font-semibold">
                {t.label}
                {draft.template === t.id && <Check className="size-4" aria-hidden />}
              </span>
              <span className="text-[13px] leading-[18px] text-muted-foreground">{t.note}</span>
            </button>
          ))}
        </div>
      </fieldset>

      <fieldset className="flex flex-col gap-3">
        <legend className="mb-1 text-[15px] font-semibold">Your colour</legend>
        <p className="mb-2 text-[13px] leading-5 text-muted-foreground">As a hex. It goes on your button, links and the nav underline. We check its contrast as you type.</p>
        <AccentField id="signup-accent" value={draft.accentHex} onChange={(v) => update({ accentHex: v })} compact />
      </fieldset>

      <fieldset className="flex flex-col gap-3">
        <legend className="mb-1 text-[15px] font-semibold">What should your button say?</legend>
        <p className="mb-2 text-[13px] leading-5 text-muted-foreground">It sits in your header and at the end of every article. Visitors who press it join your channel for free.</p>
        <div className="flex flex-wrap gap-1.5" role="group" aria-label="Button presets">
          {CTA_PRESETS.map((p) => (
            <button
              key={p}
              type="button"
              aria-pressed={draft.ctaLabel === p}
              onClick={() => update({ ctaLabel: p })}
              className={cn(
                "h-9 rounded-full border px-3.5 text-[13px] font-semibold outline-none transition-colors focus-visible:ring-2 focus-visible:ring-ring",
                draft.ctaLabel === p ? "border-foreground bg-foreground text-background" : "border-input hover:bg-accent",
              )}
            >
              {p}
            </button>
          ))}
        </div>
        <Input aria-label="Button text" value={draft.ctaLabel} maxLength={20} onChange={(e) => update({ ctaLabel: e.target.value })} className="h-10 max-w-[280px]" aria-invalid={!draft.ctaLabel.trim()} />
      </fieldset>

      <div className="grid gap-2">
        {tried && !ready && (
          <p role="alert" className="flex items-start gap-2 text-[13px] text-destructive">
            <AlertCircle className="mt-0.5 size-4 shrink-0" aria-hidden />
            {!draft.name.trim()
              ? "Give your channel a name."
              : check !== "available"
                ? "Choose an address that's available."
                : !accent.ok
                  ? "Fix your colour to continue. It needs 3:1 on white and 4.5:1 with text on it."
                  : "Give your button some text."}
          </p>
        )}
        <Button type="submit" size="xl" className="w-full" aria-disabled={!ready}>
          Make it live
          <ArrowRight aria-hidden />
        </Button>
        <p className="text-center text-[13px] text-muted-foreground">14-day Pro trial. No card needed. Choose a plan later in Billing.</p>
      </div>
    </form>
    </AuthShell>
  )
}
