import { PageHeader } from "@/components/shell/page-header"
import { Billing } from "@/components/settings/billing"
import { DEMO_CHANNEL_SLUG, getChannel } from "@/lib/data"

export const metadata = { title: "Billing" }

export default function BillingPage() {
  const channel = getChannel(DEMO_CHANNEL_SLUG)!
  return (
    <div className="mx-auto max-w-[1040px]">
      <PageHeader title="Billing" description="Your plan, usage, payment method and tax invoices." />
      <Billing currentPlan={channel.plan} />
    </div>
  )
}
