"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Spinner } from "@/components/ui/spinner"
import { cn } from "@/lib/utils"
import { AppleIcon, GoogleIcon } from "./provider-icons"

/**
 * "Continue with Google / Apple". In the prototype it shows the redirect state
 * briefly, then moves to `href` as if the provider had returned.
 */
export function ProviderButton({
  provider,
  href,
  label,
  variant = "outline",
  className,
}: {
  provider: "google" | "apple"
  href: string
  label?: string
  variant?: "outline" | "default"
  className?: string
}) {
  const router = useRouter()
  const [busy, setBusy] = useState(false)
  const name = provider === "google" ? "Google" : "Apple"
  return (
    <Button
      type="button"
      size="lg"
      variant={variant}
      className={cn("h-11 w-full text-[15px]", className)}
      disabled={busy}
      onClick={() => {
        setBusy(true)
        setTimeout(() => router.push(href), 900)
      }}
    >
      {busy ? <Spinner /> : provider === "google" ? <GoogleIcon /> : <AppleIcon />}
      {busy ? `Opening ${name}` : (label ?? `Continue with ${name}`)}
    </Button>
  )
}
