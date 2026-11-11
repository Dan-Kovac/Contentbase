"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { EmailLinkForm } from "./email-link-form"

/** "No YouTube? Use email" on sign-up step 1. Skips the channel step. */
export function EmailFallback() {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  if (!open) {
    return (
      <p className="text-[14px] text-muted-foreground">
        Not on YouTube, or rather not use Google?{" "}
        <button type="button" onClick={() => setOpen(true)} className="font-semibold text-foreground underline-offset-4 hover:underline">
          Sign up with email
        </button>
      </p>
    )
  }
  return (
    <div className="flex flex-col gap-2">
      <EmailLinkForm id="signup-email" label="Your email" submitLabel="Continue with email" onSent={() => router.push("/signup/name")} />
      <p className="text-[13px] leading-5 text-muted-foreground">You can connect YouTube or import a site from your studio later.</p>
    </div>
  )
}
