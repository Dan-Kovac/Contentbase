import { PageHeader } from "@/components/shell/page-header"
import { CreditsPanel } from "@/components/studio/video/credits-panel"
import { CREDIT_PRICES, CREDIT_PRICE_AUD, TOP_UPS } from "@/lib/credits"
import { getCreditAccount } from "@/lib/data"

export const metadata = { title: "AI credits" }

const PRICE_ROWS: [string, string][] = [
  ["Short video, up to 60 seconds", `${CREDIT_PRICES.shortVideo}`],
  ["Long-form video, per minute", `${CREDIT_PRICES.longVideoPerMinute}`],
  ["In-app video, per minute", `${CREDIT_PRICES.inappVideoPerMinute}`],
  ["Synthetic voiceover, per minute", `${CREDIT_PRICES.voicePerMinute}`],
  ["Translation and dubbing, per minute", `${CREDIT_PRICES.dubPerMinute}`],
  ["Video-to-article beyond your plan, per video hour", `${CREDIT_PRICES.extraProcessingPerHour}`],
  ["Thumbnail and title set", `${CREDIT_PRICES.thumbnails}`],
]

/** One credit balance for the whole account: every publication draws on it. */
export default function CreditsPage() {
  const account = getCreditAccount()
  return (
    <div className="mx-auto max-w-[1040px]">
      <PageHeader
        title="AI credits"
        description={`Your plan covers the core: every YouTube video becomes a draft pack. Credits pay for the heavier work, like turning words into video, voiceover and dubbing. One credit is about $${CREDIT_PRICE_AUD.toFixed(2)}; your plan includes a monthly allowance and top-ups roll over for 12 months.`}
      />
      <CreditsPanel account={account} topUps={TOP_UPS} prices={PRICE_ROWS} />
    </div>
  )
}
