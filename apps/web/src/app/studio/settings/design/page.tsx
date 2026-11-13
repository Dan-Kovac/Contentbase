import { PageHeader } from "@/components/shell/page-header"
import { DesignEditor } from "@/components/settings/design-editor"

import { currentPublication } from "@/lib/publication"

export const metadata = { title: "Design" }

export default async function DesignSettingsPage() {
  const channel = (await currentPublication())
  return (
    <div>
      <PageHeader title="Design" description="Your logo, colour, type and homepage. The preview updates as you go. Nothing changes on your channel until you save." />
      <DesignEditor channel={channel} />
    </div>
  )
}
