"use client"

import { useRef, useState } from "react"
import { useRouter } from "next/navigation"
import { AlertCircle, ArrowRight, Check, ImageUp } from "lucide-react"
import { Button } from "@/components/ui/button"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { PAIRINGS } from "@/lib/format"
import type { Pairing, Template } from "@/lib/types"
import { cn } from "@/lib/utils"
import { AccentField, accentState } from "@/components/settings/accent-field"
import { TemplatePreview } from "@/components/settings/template-preview"
import { AuthHeading, AuthShell } from "./auth-shell"
import { ChannelPreview } from "./channel-preview"
import { useSignupDraft } from "./signup-draft"
import { SignupSteps } from "./signup-steps"

const TEMPLATES: { id: Template; label: string; note: string }[] = [
  { id: "editorial", label: "Editorial", note: "A white magazine with a photo lead and a story grid" },
  { id: "broadcast", label: "Broadcast", note: "Dark and video-led, with rails of videos" },
]

const MAX_BYTES = 1024 * 1024

function readImage(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const r = new FileReader()
    r.onload = () => resolve(String(r.result))
    r.onerror = () => reject(r.error)
    r.readAsDataURL(file)
  })
}

function UploadTile({
  id,
  label,
  help,
  value,
  square,
  onChange,
  onError,
  fallback,
}: {
  id: string
  label: string
  help: string
  value: string | null
  square?: boolean
  onChange: (v: string | null) => void
  onError: (msg: string | null) => void
  fallback: React.ReactNode
}) {
  const ref = useRef<HTMLInputElement>(null)
  return (
    <div className="flex items-center gap-3 rounded-lg border p-3">
      <div className={cn("grid h-12 shrink-0 place-items-center overflow-hidden rounded-md border bg-white px-2 [color-scheme:light]", square ? "w-12 px-0" : "w-24")}>
        {value ? (
          // eslint-disable-next-line @next/next/no-img-element -- client-side preview of the chosen file
          <img src={value} alt={`Your ${label.toLowerCase()}`} className={square ? "size-full object-cover" : "max-h-6 w-auto max-w-full object-contain"} />
        ) : (
          fallback
        )}
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-sm font-medium">{label}</p>
        <p className="text-[12px] leading-4 text-muted-foreground">{help}</p>
      </div>
      <input
        ref={ref}
        id={id}
        type="file"
        accept=".svg,.png,image/svg+xml,image/png"
        className="sr-only"
        onChange={async (e) => {
          const f = e.target.files?.[0]
          e.target.value = ""
          if (!f) return
          if (!(f.type === "image/svg+xml" || f.type === "image/png" || /\.(svg|png)$/i.test(f.name))) {
            onError(`${f.name} isn't an SVG or PNG. Export it as SVG (best) or PNG and try again.`)
            return
          }
          if (f.size > MAX_BYTES) {
            onError(`${f.name} is over 1 MB. Export it smaller, or add it later in Design settings.`)
            return
          }
          onError(null)
          onChange(await readImage(f))
        }}
      />
      {value ? (
        <Button type="button" variant="ghost" size="sm" onClick={() => onChange(null)} aria-label={`Remove ${label.toLowerCase()}`}>
          Remove
        </Button>
      ) : (
        <Button type="button" variant="outline" size="sm" onClick={() => ref.current?.click()} aria-label={`Upload ${label.toLowerCase()}`}>
          <ImageUp /> Upload
        </Button>
      )}
    </div>
  )
}

/** Step 4: template, accent, logo and type pairing with a live homepage preview. */
export function StyleStep() {
  const router = useRouter()
  const [draft, update] = useSignupDraft()
  const [uploadError, setUploadError] = useState<string | null>(null)
  const [tried, setTried] = useState(false)
  const accent = accentState(draft.accentHex)
  const previewAccent = accent.hex ?? "#1c4fb8"

  const preview = (
    <ChannelPreview
      name={draft.name}
      subdomain={draft.subdomain}
      template={draft.template}
      accentHex={draft.accentHex}
      pairing={draft.pairing}
      logoUrl={draft.logoUrl}
      iconUrl={draft.iconUrl}
    />
  )

  const initials = (draft.name.trim() || "H").slice(0, 1).toUpperCase()

  return (
    <AuthShell
      wide
      top={<SignupSteps current={3} />}
      aside={
        <div className="flex flex-col gap-5">
          <p className="text-[13px] font-semibold uppercase tracking-[1px] text-brand-muted">Live preview</p>
          {preview}
          <p className="text-[13px] leading-5 text-brand-muted">Your real videos replace the sample photos as they import. Change any of this later in Design settings.</p>
        </div>
      }
    >
      <AuthHeading title="Choose your look" lede="Pick a template, add your colour and logo, and choose a type pairing. We check your colour for contrast as you go." />

      <div className="lg:hidden">{preview}</div>

      <form
        className="flex flex-col gap-9"
        onSubmit={(e) => {
          e.preventDefault()
          setTried(true)
          if (!accent.ok) {
            document.getElementById("signup-accent")?.focus()
            return
          }
          router.push("/signup/plan")
        }}
      >
        <fieldset className="flex flex-col gap-3">
          <legend className="mb-3 text-[15px] font-semibold">Template</legend>
          <RadioGroup value={draft.template} onValueChange={(v) => update({ template: v as Template })} className="grid grid-cols-2 gap-3">
            {TEMPLATES.map((t) => (
              <Label
                key={t.id}
                htmlFor={`tpl-${t.id}`}
                className={cn(
                  "relative flex cursor-pointer flex-col items-stretch gap-2.5 rounded-lg border p-2 pb-3 font-normal transition-colors hover:bg-accent has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-ring has-[:focus-visible]:ring-offset-2",
                  draft.template === t.id && "border-foreground ring-1 ring-foreground",
                )}
              >
                <RadioGroupItem id={`tpl-${t.id}`} value={t.id} className="sr-only" />
                <div aria-hidden className="pointer-events-none">
                  <TemplatePreview
                    template={t.id}
                    accentHex={previewAccent}
                    pairing={draft.pairing}
                    name={draft.name}
                    logoUrl={draft.logoUrl}
                    maxHeight={520}
                    className="rounded-md"
                  />
                </div>
                <span className="flex items-center justify-between gap-2 px-1 text-[14px] font-semibold">
                  {t.label}
                  {draft.template === t.id && <Check className="size-4" aria-hidden />}
                </span>
                <span className="hidden px-1 text-[12px] leading-4 text-muted-foreground sm:block">{t.note}</span>
              </Label>
            ))}
          </RadioGroup>
        </fieldset>

        <fieldset className="flex flex-col gap-3">
          <legend className="mb-1 text-[15px] font-semibold">Accent colour</legend>
          <p className="mb-2 text-[13px] leading-5 text-muted-foreground">Your brand colour, as a hex. It goes on your Follow button, links and the nav underline.</p>
          <AccentField id="signup-accent" value={draft.accentHex} onChange={(v) => update({ accentHex: v })} compact />
        </fieldset>

        <fieldset className="flex flex-col gap-3">
          <legend className="mb-1 text-[15px] font-semibold">
            Logo <span className="font-normal text-muted-foreground">· optional</span>
          </legend>
          <p className="mb-2 text-[13px] leading-5 text-muted-foreground">SVG or PNG. With no logo, we set your channel name in your headline face.</p>
          <div className="grid gap-2">
            <UploadTile
              id="signup-logo"
              label="Logo"
              help="Wide logos work best"
              value={draft.logoUrl}
              onChange={(v) => update({ logoUrl: v })}
              onError={setUploadError}
              fallback={
                <span className="truncate text-[13px] font-bold text-neutral-950" style={{ fontFamily: PAIRINGS[draft.pairing].display }}>
                  {draft.name || "Your channel"}
                </span>
              }
            />
            <UploadTile
              id="signup-icon"
              label="Square icon"
              help="For browser tabs and social cards"
              value={draft.iconUrl}
              square
              onChange={(v) => update({ iconUrl: v })}
              onError={setUploadError}
              fallback={
                <span className="grid size-8 place-items-center rounded-[4px] text-[14px] font-extrabold" style={{ background: previewAccent, color: accent.check?.on ?? "#ffffff" }}>
                  {initials}
                </span>
              }
            />
          </div>
          {uploadError && (
            <p role="alert" className="flex items-start gap-2 text-[13px] text-destructive">
              <AlertCircle className="mt-0.5 size-4 shrink-0" aria-hidden /> {uploadError}
            </p>
          )}
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
          <p className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-dashed px-3 py-2.5 text-[13px] text-muted-foreground">
            <span>
              <span className="font-medium text-foreground">Custom fonts</span> · your own headline and reading faces
            </span>
            <span className="rounded-[2px] border bg-background px-2 py-0.5 text-[11px] font-bold uppercase tracking-[0.8px]">Coming soon</span>
          </p>
        </fieldset>

        <div className="grid gap-2">
          {tried && !accent.ok && (
            <p role="alert" className="flex items-start gap-2 text-[13px] text-destructive">
              <AlertCircle className="mt-0.5 size-4 shrink-0" aria-hidden /> Fix your accent colour to continue. It needs 3:1 on white and 4.5:1 with text on it.
            </p>
          )}
          <Button type="submit" size="xl" className="w-full" aria-disabled={!accent.ok}>
            Continue
            <ArrowRight aria-hidden />
          </Button>
        </div>
      </form>
    </AuthShell>
  )
}
