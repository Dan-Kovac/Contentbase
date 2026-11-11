"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { useSearchParams } from "next/navigation"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"

/** Magic link sent, with a resend cooldown (AUD-01). */
export function CheckEmail() {
  const params = useSearchParams()
  const email = params.get("email") || "mia.nguyen@example.com"
  const [wait, setWait] = useState(30)

  useEffect(() => {
    if (wait <= 0) return
    const t = setTimeout(() => setWait((w) => w - 1), 1000)
    return () => clearTimeout(t)
  }, [wait])

  return (
    <div className="flex flex-col gap-6">
      <p className="text-[15px] leading-[23px]">
        We sent a sign-in link to <span className="font-semibold break-all">{email}</span>. Open it on this device to finish signing in. It works for 15 minutes.
      </p>
      <div className="flex flex-col gap-2.5">
        <Button asChild size="lg" className="h-11">
          <Link href="/account">I&apos;ve clicked the link</Link>
        </Button>
        <Button
          variant="outline"
          size="lg"
          className="h-11"
          disabled={wait > 0}
          onClick={() => {
            setWait(30)
            toast("Sent another link", { description: email })
          }}
        >
          {wait > 0 ? `Resend link in ${wait}s` : "Resend link"}
        </Button>
      </div>
      <p className="border-t pt-5 text-[13px] leading-5 text-muted-foreground">
        Nothing there? Check your spam or promotions folder, or{" "}
        <Link href="/account/signin" className="font-semibold text-foreground underline-offset-4 hover:underline">
          use a different email
        </Link>
        .
      </p>
    </div>
  )
}
