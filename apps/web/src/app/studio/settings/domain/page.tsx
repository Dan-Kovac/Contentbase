import { PageHeader } from "@/components/shell/page-header"
import { DomainSettings } from "@/components/settings/domain-wizard"

import { currentPublication } from "@/lib/publication"

export const metadata = { title: "Domain" }

export default async function DomainPage() {
  const channel = (await currentPublication())
  return (
    <div className="mx-auto max-w-[1040px]">
      <PageHeader title="Domain" description="Put your channel on a domain you own. We handle the certificate and the redirects." />
      <DomainSettings channel={channel} />
    </div>
  )
}
