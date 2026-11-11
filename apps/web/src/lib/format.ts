import type { Pairing } from "@/lib/types"

/** 1086 -> "18:06", 3725 -> "1:02:05" */
export function formatDuration(sec: number) {
  const h = Math.floor(sec / 3600)
  const m = Math.floor((sec % 3600) / 60)
  const s = sec % 60
  const mm = h ? String(m).padStart(2, "0") : String(m)
  return `${h ? `${h}:` : ""}${mm}:${String(s).padStart(2, "0")}`
}

/** 48210 -> "48.2k" */
export function compact(n: number) {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1).replace(/\.0$/, "")}m`
  if (n >= 1_000) return `${(n / 1_000).toFixed(1).replace(/\.0$/, "")}k`
  return String(n)
}

export function number(n: number) {
  return n.toLocaleString("en-AU")
}

/** AUD with cents, e.g. $7,420.50 */
export function aud(n: number, cents = true) {
  return n.toLocaleString("en-AU", {
    style: "currency",
    currency: "AUD",
    minimumFractionDigits: cents ? 2 : 0,
    maximumFractionDigits: cents ? 2 : 0,
  })
}

/** WCAG relative luminance of a #rrggbb colour. */
function luminance(hex: string) {
  const h = hex.replace("#", "")
  const [r, g, b] = [0, 2, 4].map((i) => {
    const c = parseInt(h.slice(i, i + 2), 16) / 255
    return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4
  })
  return 0.2126 * r + 0.7152 * g + 0.0722 * b
}

/** WCAG contrast ratio between two #rrggbb colours (1–21). */
export function contrastRatio(a: string, b: string) {
  const [hi, lo] = [luminance(a), luminance(b)].sort((x, y) => y - x)
  return (hi + 0.05) / (lo + 0.05)
}

export function isHex(v: string) {
  return /^#[0-9a-f]{6}$/i.test(v)
}

/** Black or white, whichever reads better on the given fill. */
export function readableOn(hex: string) {
  return contrastRatio(hex, "#0a0a0a") >= contrastRatio(hex, "#ffffff") ? "#0a0a0a" : "#ffffff"
}

/**
 * A creator's own accent passes when its best text colour reaches 4.5:1 on it
 * and the accent itself reaches 3:1 against the white page (for marks and borders).
 */
export function checkAccent(hex: string) {
  const on = readableOn(hex)
  const text = contrastRatio(hex, on)
  const page = contrastRatio(hex, "#ffffff")
  return { on, text, page, ok: text >= 4.5 && page >= 3 }
}

/** Type pairings a channel can pick. CSS font-family values use the app's font variables. */
export const PAIRINGS: Record<Pairing, { label: string; description: string; display: string; body: string; weight: number; tracking: string }> = {
  grandstand: { label: "Grandstand", description: "Condensed scoreboard headlines with a serif for reading.", display: "var(--font-condensed)", body: "var(--font-serif)", weight: 700, tracking: "0px" },
  broadcast: { label: "Broadcast", description: "Heavy, wide headlines. TV energy.", display: "var(--font-archivo)", body: "var(--font-archivo)", weight: 800, tracking: "-0.03em" },
  minimal: { label: "Minimal", description: "Homestand's own grotesk with a serif for reading.", display: "var(--font-sans)", body: "var(--font-serif)", weight: 800, tracking: "-0.025em" },
}

/** CSS variables to set on a channel's root element. */
export function channelStyle(accentHex: string, pairing: Pairing) {
  const p = PAIRINGS[pairing]
  return {
    "--chan": accentHex,
    "--chan-on": readableOn(accentHex),
    "--chan-display": p.display,
    "--chan-body": p.body,
    "--chan-weight": String(p.weight),
    "--chan-tracking": p.tracking,
  } as React.CSSProperties
}
