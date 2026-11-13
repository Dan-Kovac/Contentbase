import Link from "next/link"
import { ArrowRight, Coins } from "lucide-react"
import { PageHeader } from "@/components/shell/page-header"
import { Billing } from "@/components/settings/billing"
import { getCreditAccount } from "@/lib/data"
import { currentPublication } from "@/lib/publication"

export const metadata = { title: "Billing" }

export default async function BillingPage() {
  const channel = await currentPublication()
  const credits = getCreditAccount()
  return (
    <div className="mx-auto max-w-[1040px]">
      <PageHeader title="Billing" description="Your plan, AI credits, usage, payment method and tax invoices." />
      {/* Two parts to the bill: the platform fee and the AI credits the account uses. */}
      <Link
        href="/studio/credits"
        className="group mb-8 grid gap-3 rounded-lg border bg-card p-5 outline-none transition-colors hover:bg-accent/40 focus-visible:ring-2 focus-visible:ring-ring sm:grid-cols-[auto_1fr_auto] sm:items-center sm:gap-8"
      >
        <span className="flex items-center gap-3">
          <Coins className="size-5" aria-hidden />
          <span className="flex flex-col">
            <span className="text-[13px] font-medium text-muted-foreground">AI credits</span>
            <span className="text-[26px] font-bold leading-8 tracking-[-0.5px]">{credits.balance.toLocaleString("en-AU")}</span>
          </span>
        </span>
        <span className="text-[14px] leading-[21px] text-muted-foreground">
          {credits.usedThisMonth.toLocaleString("en-AU")} used this month across your publications, against a cap of {credits.cap.toLocaleString("en-AU")}. Your plan adds{" "}
          {credits.monthlyIncluded.toLocaleString("en-AU")} on {credits.renewsOn}.
        </span>
        <span className="inline-flex items-center gap-1 text-[14px] font-semibold">
          Top up <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" aria-hidden />
        </span>
      </Link>
      <Billing currentPlan={channel.plan} />
    </div>
  )
}
