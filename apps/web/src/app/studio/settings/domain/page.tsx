import { PageHeader } from "@/components/shell/page-header"
import { DomainSettings } from "@/components/settings/domain-wizard"
import { DEMO_CHANNEL_SLUG, getChannel } from "@/lib/data"

export const metadata = { title: "Domain" }

export default function DomainPage() {
  const channel = getChannel(DEMO_CHANNEL_SLUG)!
  return (
    <div className="mx-auto max-w-[1040px]">
      <PageHeader title="Domain" description="Put your channel on a domain you own. We handle the certificate and the redirects." />
      <DomainSettings channel={channel} />
    </div>
  )
}
