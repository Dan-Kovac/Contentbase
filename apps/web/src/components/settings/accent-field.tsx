"use client"

import { AlertCircle, Check, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { checkAccent, contrastRatio, isHex } from "@/lib/format"
import { cn } from "@/lib/utils"

/** "#1c4fb8", "1C4FB8" or "#18b" -> "#1c4fb8"; anything else -> null. */
export function normaliseHex(input: string): string | null {
  const m = input.trim().match(/^#?([0-9a-f]{6}|[0-9a-f]{3})$/i)
  if (!m) return null
  let h = m[1].toLowerCase()
  if (h.length === 3) h = h.split("").map((c) => c + c).join("")
  const hex = `#${h}`
  return isHex(hex) ? hex : null
}

/** 4.567 -> "4.5:1" (rounded down, so a pass is never overstated). */
export function ratio(n: number) {
  return `${(Math.floor(n * 10) / 10).toFixed(1)}:1`
}

function toHsl(hex: string) {
  const [r, g, b] = [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16) / 255)
  const max = Math.max(r, g, b)
  const min = Math.min(r, g, b)
  const l = (max + min) / 2
  if (max === min) return { h: 0, s: 0, l }
  const d = max - min
  const s = l > 0.5 ? d / (2 - max - min) : d / (max + min)
  const h = max === r ? (g - b) / d + (g < b ? 6 : 0) : max === g ? (b - r) / d + 2 : (r - g) / d + 4
  return { h: h * 60, s, l }
}

function fromHsl(h: number, s: number, l: number) {
  const k = (n: number) => (n + h / 30) % 12
  const a = s * Math.min(l, 1 - l)
  const f = (n: number) => l - a * Math.max(-1, Math.min(k(n) - 3, 9 - k(n), 1))
  return `#${[0, 8, 4].map((n) => Math.round(f(n) * 255).toString(16).padStart(2, "0")).join("")}`
}

/** The lightest shade of the same hue that passes the accent check. */
export function suggestAccent(hex: string) {
  const { h, s, l } = toHsl(hex)
  for (let next = l; next >= 0; next -= 0.01) {
    const candidate = fromHsl(h, s, next)
    if (checkAccent(candidate).ok) return candidate
  }
  return "#0a0a0a"
}

/** Everything a form needs to know about what the creator typed. */
export function accentState(input: string) {
  const hex = normaliseHex(input)
  const check = hex ? checkAccent(hex) : null
  return { hex, check, ok: !!check?.ok }
}

export function AccentField({ id, value, onChange, compact = false }: { id: string; value: string; onChange: (v: string) => void; compact?: boolean }) {
  const { hex, check, ok } = accentState(value)
  const suggestion = hex && check && !ok ? suggestAccent(hex) : null
  const msgId = `${id}-result`

  return (
    <div className="grid gap-4">
      <div className="flex flex-wrap items-end gap-3">
        <div className="grid gap-2">
          <label htmlFor={id} className="text-sm font-medium leading-5">
            Hex colour
          </label>
          <div className="flex items-center gap-2">
            <span className="relative size-9 shrink-0 overflow-hidden rounded-md border border-input focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2">
              <input
                type="color"
                aria-label="Pick a colour"
                value={hex ?? "#000000"}
                onChange={(e) => onChange(e.target.value.toUpperCase())}
                className="absolute -inset-2 size-[calc(100%+16px)] cursor-pointer border-0 bg-transparent p-0"
              />
            </span>
            <Input
              id={id}
              value={value}
              onChange={(e) => onChange(e.target.value)}
              className="w-32 font-mono uppercase"
              spellCheck={false}
              autoComplete="off"
              maxLength={7}
              aria-invalid={!ok}
              aria-describedby={msgId}
            />
          </div>
        </div>
        {hex && check && (
          <div className="flex items-center gap-2 pb-1" aria-hidden>
            <span className="rounded-full px-3 py-1 text-[12px] font-semibold" style={{ background: hex, color: check.on }}>
              Follow
            </span>
            <span className="rounded-md border bg-white px-2.5 py-1 text-[12px] font-medium text-neutral-950 [color-scheme:light]">
              <span className="mr-1.5 inline-block size-[7px]" style={{ background: hex }} />
              <span className="underline decoration-2 underline-offset-[5px]" style={{ textDecorationColor: hex }}>
                Latest
              </span>
            </span>
          </div>
        )}
      </div>

      <div id={msgId} aria-live="polite" className="grid gap-2">
        {!hex ? (
          <p className="flex items-start gap-2 text-[13px] text-destructive">
            <AlertCircle className="mt-0.5 size-4 shrink-0" aria-hidden />
            That isn&apos;t a hex colour. Use six digits after a #, e.g. #1C4FB8.
          </p>
        ) : (
          check && (
            <>
              <ul className={cn("grid gap-1.5 text-[13px]", !compact && "sm:grid-cols-2")}>
                <li className="flex items-center justify-between gap-3 rounded-md border px-3 py-2">
                  <span className="min-w-0">
                    On your white page <span className="text-muted-foreground">(needs 3:1)</span>
                  </span>
                  <span className={cn("flex shrink-0 items-center gap-1.5 font-mono font-medium tabular", check.page < 3 && "text-destructive")}>
                    {ratio(check.page)}
                    {check.page >= 3 ? <Check className="size-4" aria-label="Pass" /> : <X className="size-4" aria-label="Fail" />}
                  </span>
                </li>
                <li className="flex items-center justify-between gap-3 rounded-md border px-3 py-2">
                  <span className="min-w-0">
                    {check.on === "#ffffff" ? "White" : "Black"} text on it <span className="text-muted-foreground">(needs 4.5:1)</span>
                  </span>
                  <span className={cn("flex shrink-0 items-center gap-1.5 font-mono font-medium tabular", check.text < 4.5 && "text-destructive")}>
                    {ratio(check.text)}
                    {check.text >= 4.5 ? <Check className="size-4" aria-label="Pass" /> : <X className="size-4" aria-label="Fail" />}
                  </span>
                </li>
              </ul>
              {ok ? (
                <p className="text-[13px] text-muted-foreground">
                  Passes WCAG AA. We set {check.on === "#ffffff" ? "white" : "black"} text on it automatically.
                </p>
              ) : (
                <div className="flex flex-wrap items-center gap-x-3 gap-y-2 rounded-md border border-destructive/40 bg-destructive/5 px-3 py-2.5 text-[13px]">
                  <p className="flex min-w-0 flex-1 items-start gap-2 text-destructive">
                    <AlertCircle className="mt-0.5 size-4 shrink-0" aria-hidden />
                    <span>
                      {hex.toUpperCase()} is too pale on white ({ratio(check.page)}), so links and the nav underline would be hard to see. Try a darker shade, e.g.{" "}
                      <span className="font-mono font-medium">{suggestion?.toUpperCase()}</span> ({ratio(contrastRatio(suggestion ?? "#0a0a0a", "#ffffff"))}).
                    </span>
                  </p>
                  {suggestion && (
                    <Button type="button" variant="outline" size="sm" onClick={() => onChange(suggestion.toUpperCase())}>
                      <span className="size-3.5 rounded-[2px] border border-black/10" style={{ background: suggestion }} aria-hidden />
                      Use {suggestion.toUpperCase()}
                    </Button>
                  )}
                </div>
              )}
            </>
          )
        )}
      </div>
    </div>
  )
}
