"use client"

import { useRouter } from "next/navigation"
import { ArrowRight, Check } from "lucide-react"
import { Button } from "@/components/ui/button"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { ACCENTS, PAIRINGS } from "@/lib/format"
import type { AccentName, Pairing, Template } from "@/lib/types"
import { cn } from "@/lib/utils"
import { AuthHeading, AuthShell } from "./auth-shell"
import { ChannelPreview } from "./channel-preview"
import { useSignupDraft } from "./signup-draft"
import { SignupSteps } from "./signup-steps"

const TEMPLATES: { id: Template; label: string; note: string }[] = [
  { id: "editorial", label: "Editorial", note: "Video and story side by side" },
  { id: "broadcast", label: "Broadcast", note: "Full-width video, TV feel" },
  { id: "minimal", label: "Minimal", note: "Centred, quiet, type-led" },
]

function TemplateGlyph({ id }: { id: Template }) {
  return (
    <svg viewBox="0 0 64 40" className="h-10 w-16 text-foreground" aria-hidden>
      <rect x="0.5" y="0.5" width="63" height="39" rx="3" fill="none" stroke="currentColor" opacity="0.25" />
      {id === "editorial" && (
        <>
          <rect x="5" y="5" width="54" height="4" rx="1" fill="currentColor" opacity="0.25" />
          <rect x="5" y="13" width="30" height="20" rx="2" fill="currentColor" opacity="0.7" />
          <rect x="39" y="15" width="20" height="4" rx="1" fill="currentColor" />
          <rect x="39" y="22" width="16" height="3" rx="1" fill="currentColor" opacity="0.35" />
        </>
      )}
      {id === "broadcast" && (
        <>
          <rect x="0.5" y="0.5" width="63" height="8" rx="2" fill="currentColor" />
          <rect x="5" y="12" width="54" height="23" rx="2" fill="currentColor" opacity="0.7" />
          <rect x="9" y="27" width="28" height="4" rx="1" fill="#fff" />
        </>
      )}
      {id === "minimal" && (
        <>
          <rect x="22" y="5" width="20" height="4" rx="1" fill="currentColor" />
          <rect x="14" y="13" width="36" height="4" rx="1" fill="currentColor" opacity="0.8" />
          <rect x="18" y="20" width="28" height="15" rx="2" fill="currentColor" opacity="0.5" />
        </>
      )}
    </svg>
  )
}

/** Step 4: template, accent and type pairing with a live masthead preview. */
export function StyleStep() {
  const router = useRouter()
  const [draft, update] = useSignupDraft()

  const preview = (
    <ChannelPreview name={draft.name} subdomain={draft.subdomain} template={draft.template} accent={draft.accent} pairing={draft.pairing} />
  )

  return (
    <AuthShell
      wide
      top={<SignupSteps current={3} />}
      aside={
        <div className="flex flex-col gap-5">
          <p className="text-[13px] font-semibold uppercase tracking-[1px] text-brand-muted">Live preview</p>
          {preview}
          <p className="text-[13px] leading-5 text-brand-muted">Your real videos replace the sample as they import. Change any of this later in Channel design.</p>
        </div>
      }
    >
      <AuthHeading title="Choose your look" lede="Pick a template, an accent and a type pairing. Every combination is checked for contrast." />

      <div className="lg:hidden">{preview}</div>

      <form
        className="flex flex-col gap-8"
        onSubmit={(e) => {
          e.preventDefault()
          router.push("/signup/plan")
        }}
      >
        <fieldset className="flex flex-col gap-3">
          <legend className="mb-3 text-[15px] font-semibold">Template</legend>
          <RadioGroup value={draft.template} onValueChange={(v) => update({ template: v as Template })} className="grid grid-cols-3 gap-2">
            {TEMPLATES.map((t) => (
              <Label
                key={t.id}
                htmlFor={`tpl-${t.id}`}
                className={cn(
                  "relative flex cursor-pointer flex-col items-start gap-2 rounded-lg border p-3 font-normal transition-colors hover:bg-accent has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-ring",
                  draft.template === t.id && "border-foreground ring-1 ring-foreground",
                )}
              >
                <RadioGroupItem id={`tpl-${t.id}`} value={t.id} className="sr-only" />
                <TemplateGlyph id={t.id} />
                <span className="text-[14px] font-semibold">{t.label}</span>
                <span className="hidden text-[12px] leading-4 text-muted-foreground sm:block">{t.note}</span>
              </Label>
            ))}
          </RadioGroup>
        </fieldset>

        <fieldset className="flex flex-col gap-3">
          <legend className="mb-3 text-[15px] font-semibold">
            Accent <span className="font-normal text-muted-foreground">· {ACCENTS[draft.accent].label}</span>
          </legend>
          <RadioGroup value={draft.accent} onValueChange={(v) => update({ accent: v as AccentName })} className="flex flex-wrap gap-2.5">
            {(Object.keys(ACCENTS) as AccentName[]).map((a) => (
              <Label
                key={a}
                htmlFor={`acc-${a}`}
                title={ACCENTS[a].label}
                className={cn(
                  "grid size-10 cursor-pointer place-items-center rounded-full border-2 border-transparent p-0.5 has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-ring has-[:focus-visible]:ring-offset-2",
                  draft.accent === a && "border-foreground",
                )}
              >
                <RadioGroupItem id={`acc-${a}`} value={a} className="sr-only" aria-label={ACCENTS[a].label} />
                <span className="grid size-full place-items-center rounded-full" style={{ background: ACCENTS[a].value, color: ACCENTS[a].on }}>
                  {draft.accent === a && <Check className="size-4" strokeWidth={3} aria-hidden />}
                </span>
              </Label>
            ))}
          </RadioGroup>
        </fieldset>

        <fieldset className="flex flex-col gap-3">
          <legend className="mb-3 text-[15px] font-semibold">Type pairing</legend>
          <RadioGroup value={draft.pairing} onValueChange={(v) => update({ pairing: v as Pairing })} className="gap-2">
            {(Object.keys(PAIRINGS) as Pairing[]).map((p) => (
              <Label
                key={p}
                htmlFor={`pair-${p}`}
                className={cn(
                  "flex cursor-pointer items-center gap-4 rounded-lg border p-3 font-normal transition-colors hover:bg-accent",
                  draft.pairing === p && "border-foreground ring-1 ring-foreground",
                )}
              >
                <span
                  className="grid h-12 w-14 shrink-0 place-items-center rounded-[4px] bg-muted text-[26px] leading-none"
                  style={{ fontFamily: PAIRINGS[p].display, fontWeight: PAIRINGS[p].weight, letterSpacing: PAIRINGS[p].tracking }}
                  aria-hidden
                >
                  Aa
                </span>
                <span className="flex min-w-0 flex-1 flex-col gap-0.5">
                  <span className="text-[15px] font-semibold">{PAIRINGS[p].label}</span>
                  <span className="text-[13px] leading-5 text-muted-foreground">{PAIRINGS[p].description}</span>
                </span>
                <RadioGroupItem id={`pair-${p}`} value={p} />
              </Label>
            ))}
          </RadioGroup>
        </fieldset>

        <Button type="submit" size="xl" className="w-full">
          Continue
          <ArrowRight aria-hidden />
        </Button>
      </form>
    </AuthShell>
  )
}
