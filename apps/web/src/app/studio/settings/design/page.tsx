import { PageHeader } from "@/components/shell/page-header"
import { DesignEditor } from "@/components/settings/design-editor"
import { DEMO_CHANNEL_SLUG, getChannel } from "@/lib/data"

export const metadata = { title: "Design" }

export default function DesignSettingsPage() {
  const channel = getChannel(DEMO_CHANNEL_SLUG)!
  return (
    <div>
      <PageHeader title="Design" description="Your logo, colour, type and homepage. The preview updates as you go. Nothing changes on your channel until you save." />
      <DesignEditor channel={channel} />
    </div>
  )
}
