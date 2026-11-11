"use client"

import { useState } from "react"
import { MailCheck } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Spinner } from "@/components/ui/spinner"

const EMAIL = /^\S+@\S+\.\S+$/

/**
 * Email magic-link form. Validates, shows a short sending state, then either
 * calls `onSent` (to navigate) or shows an inline "check your email" state.
 */
export function EmailLinkForm({
  id = "email",
  label = "Email",
  submitLabel = "Email me a sign-in link",
  onSent,
  defaultValue = "",
  submitVariant = "outline",
}: {
  submitVariant?: "outline" | "default"
  id?: string
  label?: string
  submitLabel?: string
  onSent?: (email: string) => void
  defaultValue?: string
}) {
  const [email, setEmail] = useState(defaultValue)
  const [error, setError] = useState("")
  const [state, setState] = useState<"idle" | "sending" | "sent">("idle")

  function submit(e: React.FormEvent) {
    e.preventDefault()
    if (!EMAIL.test(email.trim())) {
      setError("Check the email address, e.g. sam@footyfix.com.au.")
      return
    }
    setError("")
    setState("sending")
    setTimeout(() => {
      if (onSent) onSent(email.trim())
      else setState("sent")
    }, 700)
  }

  if (state === "sent") {
    return (
      <div role="status" className="flex flex-col gap-3 rounded-lg border bg-muted/50 p-5">
        <MailCheck className="size-6 text-pop-ink" aria-hidden />
        <p className="text-[16px] font-semibold">Check your email</p>
        <p className="text-[14px] leading-[22px] text-muted-foreground">
          We sent a sign-in link to <span className="font-medium text-foreground">{email}</span>. It works for 15 minutes.
        </p>
        <button type="button" onClick={() => setState("idle")} className="w-fit text-[14px] font-semibold underline-offset-4 hover:underline">
          Use a different email
        </button>
      </div>
    )
  }

  return (
    <form onSubmit={submit} noValidate className="flex flex-col gap-3">
      <Label htmlFor={id}>{label}</Label>
      <Input
        id={id}
        type="email"
        autoComplete="email"
        placeholder="sam@footyfix.com.au"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        aria-invalid={!!error}
        aria-describedby={error ? `${id}-error` : undefined}
        className="h-11"
      />
      {error && (
        <p id={`${id}-error`} className="text-[13px] text-destructive">
          {error}
        </p>
      )}
      <Button type="submit" size="lg" variant={submitVariant} className="h-11" disabled={state === "sending"}>
        {state === "sending" && <Spinner />}
        {state === "sending" ? "Sending link" : submitLabel}
      </Button>
    </form>
  )
}
