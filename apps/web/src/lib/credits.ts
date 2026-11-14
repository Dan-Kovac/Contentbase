// AI usage: every piece of AI work is charged at what the provider charges us, plus a fixed margin.
// No credit maths, no bundles: a dollar balance that every publication on the account draws on.
// Provider rates are from the November 2026 research in docs/video-engine.md. Check them before launch.
import type { VideoFormat } from "@/lib/types"

/** What Homestand adds on top of the provider's price, on every line. */
export const MARGIN = 0.2

export type Rate = { label: string; provider: string; unit: string; cost: number }

/** Provider cost per unit, in AUD. */
export const RATES = {
  script: { label: "Script and scenes", provider: "Claude", unit: "finished minute", cost: 0.03 },
  voice: { label: "Voiceover", provider: "Azure Neural TTS, Australian voices", unit: "minute", cost: 0.02 },
  render: { label: "Rendering", provider: "Remotion on AWS Lambda", unit: "finished minute", cost: 0.06 },
  renderLicence: { label: "Render licence", provider: "Remotion", unit: "video", cost: 0.015 },
  imagery: { label: "Stock imagery", provider: "Pexels and Pixabay", unit: "video", cost: 0 },
  dub: { label: "Translation and dubbing", provider: "Claude and Azure", unit: "minute", cost: 0.05 },
  processing: { label: "Video to article beyond your plan", provider: "Deepgram and Claude", unit: "video hour", cost: 0.5 },
  titles: { label: "Titles and thumbnails", provider: "Claude", unit: "set", cost: 0.01 },
  emails: { label: "Emails beyond your plan", provider: "Resend", unit: "100 emails", cost: 0.06 },
  digest: { label: "Newsletter drafted from the week's stories", provider: "Claude", unit: "newsletter", cost: 0.02 },
} satisfies Record<string, Rate>

/** What the customer pays for something that costs us `cost`. */
export const price = (cost: number) => Math.round(cost * (1 + MARGIN) * 100) / 100

/** Dollars, to the cent below $10 and to the dollar above $1,000. */
export function money(n: number) {
  const abs = Math.abs(n)
  const s = abs >= 1000 ? Math.round(abs).toLocaleString("en-AU") : abs.toLocaleString("en-AU", { minimumFractionDigits: 2, maximumFractionDigits: 2 })
  return `${n < 0 ? "−" : ""}$${s}`
}

/** AI usage included with each plan, every month. */
export const PLAN_ALLOWANCE = { starter: 5, pro: 20, publisher: 60 } as const

/** Top-ups are the same price per dollar at every size: there's nothing to discount when it's cost plus a margin. */
export const TOP_UPS = [20, 50, 200]

export type EstimateLine = { label: string; detail: string; cost: number }

/** The cost of one render, line by line, and what the customer pays. Rendering is charged by the second. */
export function renderEstimate(format: VideoFormat, seconds: number, voice: boolean) {
  const minutes = seconds / 60
  const lines: EstimateLine[] = [
    { label: RATES.script.label, detail: RATES.script.provider, cost: minutes * RATES.script.cost },
    ...(voice ? [{ label: RATES.voice.label, detail: RATES.voice.provider, cost: minutes * RATES.voice.cost }] : []),
    { label: RATES.render.label, detail: `${RATES.render.provider}, ${format === "long" ? "16:9" : format === "short" ? "9:16" : "4:5"}`, cost: minutes * RATES.render.cost + RATES.renderLicence.cost },
    { label: RATES.imagery.label, detail: `${RATES.imagery.provider}, licensed`, cost: RATES.imagery.cost },
  ]
  const cost = lines.reduce((sum, l) => sum + l.cost, 0)
  return { lines, cost, price: price(cost) }
}

export const FORMAT_INFO: Record<VideoFormat, { label: string; ratio: string; note: string; maxSeconds?: number }> = {
  long: { label: "Long-form", ratio: "16/9", note: "16:9 for YouTube and your video pages" },
  short: { label: "Short", ratio: "9/16", note: "9:16, up to 60 seconds, for Shorts and your feed", maxSeconds: 60 },
  inapp: { label: "In-app", ratio: "4/5", note: "4:5 with burned-in captions, for apps and social" },
}
