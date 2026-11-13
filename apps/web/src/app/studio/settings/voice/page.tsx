import { PageHeader } from "@/components/shell/page-header"
import { VoiceForm } from "@/components/settings/voice-form"

import { currentPublication } from "@/lib/publication"

export const metadata = { title: "Brand voice" }

export default async function VoicePage() {
  const channel = (await currentPublication())
  return (
    <div className="mx-auto max-w-[1040px]">
      <PageHeader title="Brand voice" description="We learn how you write from your own articles. Every draft article, headline and caption follows it, so drafts sound like you before you edit them." />
      <VoiceForm channel={channel} />
    </div>
  )
}
