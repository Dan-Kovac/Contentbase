import { Suspense } from "react"
import { PageHeader } from "@/components/shell/page-header"
import { CreditsPanel } from "@/components/studio/video/credits-panel"
import { MARGIN, RATES, TOP_UPS, price } from "@/lib/credits"
import { getCreditAccount } from "@/lib/data"
import { currentPublication } from "@/lib/publication"

export const metadata = { title: "AI usage" }

const SHOWN = [RATES.script, RATES.voice, RATES.render, RATES.renderLicence, RATES.imagery, RATES.dub, RATES.processing, RATES.titles, RATES.emails, RATES.digest]

async function Panel() {
  const pub = await currentPublication()
  return <CreditsPanel account={getCreditAccount()} topUps={TOP_UPS} rates={SHOWN.map((r) => ({ ...r, price: price(r.cost) }))} publication={pub.name} />
}

/** One dollar balance for the whole account: every publication draws on it, at provider cost plus the margin. */
export default function CreditsPage() {
  return (
    <div className="mx-auto max-w-[1040px]">
      <PageHeader
        title="AI usage"
        description={`Your plan covers the core: every YouTube video becomes a draft pack. AI work beyond that, like turning words into video, voiceover and dubbing, is charged at what the provider charges us plus ${Math.round(MARGIN * 100)}%.`}
      />
      <Suspense>
        <Panel />
      </Suspense>
    </div>
  )
}
