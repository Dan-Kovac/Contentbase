"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { ArrowRight, CircleCheck, CircleX } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Spinner } from "@/components/ui/spinner"
import { toSubdomain, useSignupDraft } from "./signup-draft"

/** Subdomains already in use (sample). */
const TAKEN = new Set(["footy", "afl", "nrl", "racing", "trackside", "homestand", "www", "studio", "admin", "footyfixed"])

type Check = "idle" | "checking" | "available" | "taken" | "invalid"

/** Step 3: channel name and subdomain, with a live availability check. */
export function NameForm() {
  const router = useRouter()
  const [draft, update] = useSignupDraft()
  const [touchedSub, setTouchedSub] = useState(false)
  const [check, setCheck] = useState<Check>("idle")
  const sub = draft.subdomain

  useEffect(() => {
    if (!sub) {
      setCheck("idle")
      return
    }
    if (sub.length < 3) {
      setCheck("invalid")
      return
    }
    setCheck("checking")
    const t = setTimeout(() => setCheck(TAKEN.has(sub) ? "taken" : "available"), 450)
    return () => clearTimeout(t)
  }, [sub])

  const suggestions = [`${sub}au`, `${sub}hq`, `the${sub}`].filter((s) => !TAKEN.has(s))

  return (
    <form
      noValidate
      className="flex flex-col gap-8"
      onSubmit={(e) => {
        e.preventDefault()
        if (check === "available" && draft.name.trim()) router.push("/signup/style")
      }}
    >
      <div className="flex flex-col gap-2">
        <Label htmlFor="channel-name">Channel name</Label>
        <Input
          id="channel-name"
          className="h-11 text-[16px]"
          value={draft.name}
          maxLength={40}
          onChange={(e) => {
            const name = e.target.value
            update(touchedSub ? { name } : { name, subdomain: toSubdomain(name) })
          }}
          aria-describedby="channel-name-note"
        />
        <p id="channel-name-note" className="text-[13px] text-muted-foreground">
          Shown in your header when you don&apos;t have a logo. You can change it any time.
        </p>
      </div>

      <div className="flex flex-col gap-2">
        <Label htmlFor="subdomain">Your address</Label>
        <div className="flex h-11 items-center rounded-md border border-input focus-within:border-ring focus-within:ring-[3px] focus-within:ring-ring/50">
          <input
            id="subdomain"
            className="h-full w-0 min-w-0 flex-1 bg-transparent pl-3 text-[16px] outline-none"
            value={sub}
            maxLength={30}
            autoCapitalize="none"
            spellCheck={false}
            onChange={(e) => {
              setTouchedSub(true)
              update({ subdomain: toSubdomain(e.target.value) })
            }}
            aria-describedby="subdomain-status"
            aria-invalid={check === "taken" || check === "invalid"}
          />
          <span className="shrink-0 pr-3 text-[15px] text-muted-foreground">.homestand.com.au</span>
        </div>
        <div id="subdomain-status" aria-live="polite" className="min-h-5 text-[13px]">
          {check === "checking" && (
            <span className="flex items-center gap-1.5 text-muted-foreground">
              <Spinner className="size-3.5" aria-hidden /> Checking {sub}.homestand.com.au
            </span>
          )}
          {check === "available" && (
            <span className="flex items-center gap-1.5 font-medium">
              <CircleCheck className="size-4 text-pop-ink" aria-hidden /> {sub}.homestand.com.au is available
            </span>
          )}
          {check === "taken" && (
            <span className="flex flex-wrap items-center gap-1.5 text-destructive">
              <CircleX className="size-4" aria-hidden /> {sub}.homestand.com.au is taken. Try
              {suggestions.map((s, i) => (
                <button
                  key={s}
                  type="button"
                  className="font-semibold text-foreground underline underline-offset-2"
                  onClick={() => {
                    setTouchedSub(true)
                    update({ subdomain: s })
                  }}
                >
                  {s}
                  {i < suggestions.length - 1 ? "," : ""}
                </button>
              ))}
            </span>
          )}
          {check === "invalid" && <span className="text-destructive">Use at least 3 letters or numbers.</span>}
          {check === "idle" && <span className="text-muted-foreground">Letters and numbers only.</span>}
        </div>
        <p className="text-[13px] leading-5 text-muted-foreground">
          Live as soon as you finish. On Pro you can point your own domain, like footyfix.com.au, at it later.
        </p>
      </div>

      <Button type="submit" size="xl" className="w-full" disabled={check !== "available" || !draft.name.trim()}>
        Continue
        <ArrowRight aria-hidden />
      </Button>
    </form>
  )
}
