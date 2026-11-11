import type { Metadata } from "next"
import { Suspense } from "react"
import { MailCheck } from "lucide-react"
import { AccountSheet } from "@/components/account/sheet"
import { CheckEmail } from "@/components/account/check-email"
import { Skeleton } from "@/components/ui/skeleton"

export const metadata: Metadata = { title: "Check your email" }

export default function CheckEmailPage() {
  return (
    <AccountSheet
      title="Check your email"
      icon={
        <span className="grid size-9 place-items-center rounded-[6px] bg-muted">
          <MailCheck className="size-5" aria-hidden />
        </span>
      }
    >
      <Suspense fallback={<Skeleton className="h-40 w-full" />}>
        <CheckEmail />
      </Suspense>
    </AccountSheet>
  )
}
