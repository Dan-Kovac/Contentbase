"use client"

import { useRouter } from "next/navigation"
import { OrDivider } from "@/components/auth/auth-shell"
import { EmailLinkForm } from "@/components/auth/email-link-form"
import { ProviderButton } from "@/components/auth/provider-button"

/** Viewer sign-in options: email magic link, Google, Apple (AUD-01). */
export function ViewerSignIn() {
  const router = useRouter()
  return (
    <div className="flex flex-col gap-5">
      <EmailLinkForm
        id="viewer-email"
        submitLabel="Email me a sign-in link"
        submitVariant="default"
        onSent={(email) => router.push(`/account/check-email?email=${encodeURIComponent(email)}`)}
      />
      <OrDivider />
      <div className="flex flex-col gap-2.5">
        <ProviderButton provider="google" href="/account" />
        <ProviderButton provider="apple" href="/account" />
      </div>
    </div>
  )
}
