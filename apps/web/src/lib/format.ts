import type { AccentName, Pairing } from "@/lib/types"

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

/** Channel accents: fill colour and the text colour that sits on it (pre-checked ≥6:1). */
export const ACCENTS: Record<AccentName, { label: string; value: string; on: string }> = {
  pitch: { label: "Pitch", value: "#2ef0a0", on: "#0a0a0a" },
  turf: { label: "Turf", value: "#0e5a3a", on: "#ffffff" },
  harbour: { label: "Harbour", value: "#1c4fb8", on: "#ffffff" },
  maroon: { label: "Maroon", value: "#8a1c2c", on: "#ffffff" },
  navy: { label: "Navy", value: "#1b2a4a", on: "#ffffff" },
  gold: { label: "Gold", value: "#8a5300", on: "#ffffff" },
  violet: { label: "Violet", value: "#5b2a86", on: "#ffffff" },
  mono: { label: "Mono", value: "#0a0a0a", on: "#ffffff" },
}

/** Type pairings a channel can pick. CSS font-family values use the app's font variables. */
export const PAIRINGS: Record<Pairing, { label: string; description: string; display: string; body: string; weight: number; tracking: string }> = {
  grandstand: { label: "Grandstand", description: "Condensed scoreboard headlines with a serif for reading.", display: "var(--font-condensed)", body: "var(--font-serif)", weight: 700, tracking: "0px" },
  broadcast: { label: "Broadcast", description: "Heavy, wide headlines. TV energy.", display: "var(--font-archivo)", body: "var(--font-archivo)", weight: 800, tracking: "-0.03em" },
  minimal: { label: "Minimal", description: "Homestand's own grotesk with a serif for reading.", display: "var(--font-sans)", body: "var(--font-serif)", weight: 800, tracking: "-0.025em" },
}

/** CSS variables to set on a channel's root element. */
export function channelStyle(accent: AccentName, pairing: Pairing) {
  const a = ACCENTS[accent]
  const p = PAIRINGS[pairing]
  return {
    "--chan": a.value,
    "--chan-on": a.on,
    "--chan-display": p.display,
    "--chan-body": p.body,
    "--chan-weight": String(p.weight),
    "--chan-tracking": p.tracking,
  } as React.CSSProperties
}
