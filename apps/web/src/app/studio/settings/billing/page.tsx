import { PageHeader } from "@/components/shell/page-header"
import { Billing } from "@/components/settings/billing"

import { currentPublication } from "@/lib/publication"

export const metadata = { title: "Billing" }

export default async function BillingPage() {
  const channel = (await currentPublication())
  return (
    <div className="mx-auto max-w-[1040px]">
      <PageHeader title="Billing" description="Your plan, usage, payment method and tax invoices." />
      <Billing currentPlan={channel.plan} />
    </div>
  )
}
