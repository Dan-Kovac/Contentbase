// AI credits: what the expensive work costs. Sample prices, matching docs/revenue-model.md.
// One credit retails at about $0.10. Every plan includes a monthly allowance; top-ups roll over.
import type { VideoFormat } from "@/lib/types"

export const CREDIT_PRICE_AUD = 0.1

export const CREDIT_PRICES = {
  shortVideo: 40,
  longVideoPerMinute: 25,
  inappVideoPerMinute: 20,
  voicePerMinute: 5,
  dubPerMinute: 15,
  extraProcessingPerHour: 20,
  thumbnails: 5,
} as const

export const PLAN_CREDITS = { starter: 100, pro: 500, publisher: 2000 } as const

export const TOP_UPS = [
  { credits: 1000, price: 100 },
  { credits: 5000, price: 450, note: "Save 10%" },
  { credits: 20000, price: 1600, note: "Save 20%" },
]

/** Credits for one render. Voiceover is charged per started minute. */
export function renderCost(format: VideoFormat, seconds: number, voice: boolean) {
  const minutes = Math.max(1, Math.ceil(seconds / 60))
  const base =
    format === "short" ? CREDIT_PRICES.shortVideo : format === "long" ? minutes * CREDIT_PRICES.longVideoPerMinute : minutes * CREDIT_PRICES.inappVideoPerMinute
  return base + (voice ? minutes * CREDIT_PRICES.voicePerMinute : 0)
}

export const FORMAT_INFO: Record<VideoFormat, { label: string; ratio: string; note: string; maxSeconds?: number }> = {
  long: { label: "Long-form", ratio: "16/9", note: "16:9 for YouTube and your video pages" },
  short: { label: "Short", ratio: "9/16", note: "9:16, up to 60 seconds, for Shorts and your feed", maxSeconds: 60 },
  inapp: { label: "In-app", ratio: "4/5", note: "4:5 with burned-in captions, for apps and social" },
}
