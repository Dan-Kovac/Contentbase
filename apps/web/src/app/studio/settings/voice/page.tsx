import { PageHeader } from "@/components/shell/page-header"
import { VoiceForm } from "@/components/settings/voice-form"
import { DEMO_CHANNEL_SLUG, getChannel } from "@/lib/data"

export const metadata = { title: "Brand voice" }

export default function VoicePage() {
  const channel = getChannel(DEMO_CHANNEL_SLUG)!
  return (
    <div className="mx-auto max-w-[1040px]">
      <PageHeader title="Brand voice" description="We learn how you write from your own articles. Every draft article, headline and caption follows it, so drafts sound like you before you edit them." />
      <VoiceForm channel={channel} />
    </div>
  )
}
