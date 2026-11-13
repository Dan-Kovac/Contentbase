"use client"

/**
 * The channel's own call to action (CHN-02). The creator names the button and points it at
 * joining the channel (a free Homestand account) or at their own link. Signing in is always
 * offered in words, next to it.
 */
import { useEffect, useRef, useState } from "react"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { ArrowRight, Check, ChevronDown, LogOut, ShieldCheck, UserRound } from "lucide-react"
import { toast } from "sonner"
import { AppleIcon, GoogleIcon } from "@/components/auth/provider-icons"
import { cn } from "@/lib/utils"
import type { Channel } from "@/lib/types"
import { DISPLAY } from "./styles"
import { useViewer } from "./viewer"

type CtaChannel = Pick<Channel, "slug" | "name" | "cta" | "template">

/** Where the call to action goes. Join keeps the visitor's place with ?next=. */
export function ctaHref(channel: CtaChannel, next?: string, mode?: "signin") {
  if (channel.cta.action === "link" && channel.cta.href && mode !== "signin") return channel.cta.href
  const q = new URLSearchParams()
  if (next) q.set("next", next)
  if (mode) q.set("mode", mode)
  const qs = q.toString()
  return `/c/${channel.slug}/join${qs ? `?${qs}` : ""}`
}

function isExternal(href: string) {
  return /^https?:\/\//.test(href)
}

function CtaLink({ href, className, children }: { href: string; className?: string; children: React.ReactNode }) {
  if (isExternal(href))
    return (
      <a href={href} className={className} target="_blank" rel="noopener">
        {children}
      </a>
    )
  return (
    <Link href={href} className={className}>
      {children}
    </Link>
  )
}

/** Header: search lives beside this. "Sign in" in words, then the channel's own button. */
export function HeaderActions({ channel }: { channel: CtaChannel }) {
  const { signedIn, verified, setViewer } = useViewer()
  const pathname = usePathname()
  const [open, setOpen] = useState(false)
  const menu = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!open) return
    const close = (e: MouseEvent) => {
      if (!menu.current?.contains(e.target as Node)) setOpen(false)
    }
    window.addEventListener("click", close)
    return () => window.removeEventListener("click", close)
  }, [open])

  const joined = signedIn && channel.cta.action === "join"
  return (
    <>
      {signedIn ? (
        <div ref={menu} className="relative">
          <button
            type="button"
            aria-expanded={open}
            aria-haspopup="menu"
            onClick={() => setOpen((o) => !o)}
            className="inline-flex h-9 items-center gap-1.5 rounded-md px-2 text-[14px] font-medium outline-none hover:bg-accent focus-visible:ring-2 focus-visible:ring-ring"
          >
            <span className="grid size-7 place-items-center rounded-full bg-foreground text-[11px] font-bold text-background" aria-hidden>
              MN
            </span>
            <span className="sr-only">Your account</span>
            <ChevronDown className="size-4 text-muted-foreground" aria-hidden />
          </button>
          {open && (
            <div role="menu" className="absolute right-0 top-11 z-40 w-60 rounded-lg border bg-popover p-1.5 text-popover-foreground shadow-popover">
              <p className="px-2.5 pb-2 pt-1.5 text-[13px] text-muted-foreground">
                Signed in as <span className="font-semibold text-foreground">Mia Nguyen</span>
                <span className="mt-1 flex items-center gap-1.5">
                  {verified ? <ShieldCheck className="size-3.5" aria-hidden /> : null}
                  {verified ? "Confirmed 18+" : "Age not confirmed"}
                </span>
              </p>
              <Link role="menuitem" href="/account" className="flex items-center gap-2 rounded-md px-2.5 py-2 text-[14px] outline-none hover:bg-accent focus-visible:bg-accent">
                <UserRound className="size-4" aria-hidden /> Your account
              </Link>
              {!verified && (
                <Link
                  role="menuitem"
                  href={`/account/verify-age?next=${encodeURIComponent(pathname)}`}
                  className="flex items-center gap-2 rounded-md px-2.5 py-2 text-[14px] outline-none hover:bg-accent focus-visible:bg-accent"
                >
                  <ShieldCheck className="size-4" aria-hidden /> Confirm you&apos;re 18+
                </Link>
              )}
              <button
                role="menuitem"
                type="button"
                onClick={() => {
                  setViewer("logged_out")
                  setOpen(false)
                  toast("Signed out")
                }}
                className="flex w-full items-center gap-2 rounded-md px-2.5 py-2 text-left text-[14px] outline-none hover:bg-accent focus-visible:bg-accent"
              >
                <LogOut className="size-4" aria-hidden /> Sign out
              </button>
            </div>
          )}
        </div>
      ) : (
        <Link
          href={ctaHref(channel, pathname, "signin")}
          className="inline-flex h-9 items-center rounded-md px-2.5 text-[14px] font-medium outline-none hover:bg-accent focus-visible:ring-2 focus-visible:ring-ring"
        >
          Sign in
        </Link>
      )}
      {joined ? (
        <span className="ml-1 hidden h-8 items-center gap-1.5 rounded-full border border-input px-3.5 text-[13px] font-semibold sm:inline-flex">
          <Check className="size-3.5" aria-hidden /> Member
        </span>
      ) : (
        <CtaLink
          href={ctaHref(channel, pathname)}
          className="ml-1 inline-block h-8 max-w-[38vw] truncate leading-8 whitespace-nowrap rounded-full bg-[var(--chan)] px-3 text-[13px] sm:max-w-none sm:px-4 font-bold text-[var(--chan-on)] outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
        >
          {channel.cta.label}
        </CtaLink>
      )}
    </>
  )
}

/**
 * The call to action as a panel: the width of the column it sits in (the reading column at the
 * end of an article, the right rail on a home page). Members see a quiet confirmation instead.
 */
export function ChannelCtaBlock({ channel, className, tone = "card" }: { channel: CtaChannel; className?: string; tone?: "card" | "inline" }) {
  const { signedIn } = useViewer()
  const pathname = usePathname()
  const joined = signedIn && channel.cta.action === "join"
  if (tone === "inline") {
    // The footer version: the line and the button beside the logo, no panel.
    if (joined) return null
    return (
      <div data-channel-cta className={cn("flex flex-wrap items-center gap-x-4 gap-y-3", className)}>
        <p className="text-[14px] leading-[21px] text-foreground">{channel.cta.line}</p>
        <CtaLink
          href={ctaHref(channel, pathname)}
          className="inline-flex h-9 items-center gap-1.5 rounded-full bg-[var(--chan)] px-4 text-[13px] font-bold text-[var(--chan-on)] outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
        >
          {channel.cta.label} <ArrowRight className="size-3.5" aria-hidden />
        </CtaLink>
      </div>
    )
  }
  return (
    <aside
      aria-label={channel.cta.label}
      data-channel-cta
      className={cn("flex flex-col gap-4 rounded-lg border bg-card p-5 font-sans md:p-6", className)}
    >
      <div className="flex min-w-0 items-start gap-3">
        <span className="grid size-10 shrink-0 place-items-center rounded-md bg-[var(--chan)] text-[17px] font-black text-[var(--chan-on)]" aria-hidden>
          {channel.name[0]}
        </span>
        <div className="flex min-w-0 flex-col gap-1">
          <p className={cn(DISPLAY, "text-[21px] leading-[25px]", channel.template === "broadcast" && "uppercase")}>
            {joined ? `You're a member of ${channel.name}` : channel.name}
          </p>
          <p className="text-[15px] leading-[22px] text-muted-foreground">
            {joined ? "New episodes and members-only videos arrive in your weekly digest." : channel.cta.line}
          </p>
        </div>
      </div>
      {!joined && (
        <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
          <CtaLink
            href={ctaHref(channel, pathname)}
            className="inline-flex h-11 items-center gap-2 rounded-md bg-[var(--chan)] px-5 text-[15px] font-bold text-[var(--chan-on)] outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
          >
            {channel.cta.label} <ArrowRight className="size-4" aria-hidden />
          </CtaLink>
          {!signedIn && (
            <span className="text-[13px] text-muted-foreground">
              Already a member?{" "}
              <Link href={ctaHref(channel, pathname, "signin")} className="font-semibold text-foreground underline-offset-4 hover:underline">
                Sign in
              </Link>
            </span>
          )}
        </div>
      )}
    </aside>
  )
}

/** Members-only content: the gate for visitors, the content once they've joined. */
export function MembersOnly({ gate, children }: { gate: React.ReactNode; children: React.ReactNode }) {
  const { signedIn } = useViewer()
  return <>{signedIn ? children : gate}</>
}

/** The join form: email link, Google or Apple. Signing in here signs in on every Homestand channel. */
export function JoinForm({ channel, next, mode }: { channel: CtaChannel; next?: string; mode?: "signin" }) {
  const { setViewer } = useViewer()
  const router = useRouter()
  const [email, setEmail] = useState("")
  const [error, setError] = useState<string | null>(null)
  const done = (how: string) => {
    setViewer("signed_in")
    const back = next && next.startsWith("/") ? next : `/c/${channel.slug}`
    toast.success(mode === "signin" ? `Signed in to ${channel.name}` : `Welcome to ${channel.name}`, {
      description: `${how} Confirm you're 18 or over if you want age-restricted ads, such as betting, to be able to show.`,
      action: { label: "Confirm 18+", onClick: () => router.push(`/account/verify-age?next=${encodeURIComponent(back)}`) },
      duration: 10000,
    })
    router.push(back)
  }
  return (
    <div className="flex flex-col gap-4 font-sans">
      <form
        noValidate
        onSubmit={(e) => {
          e.preventDefault()
          if (!/^\S+@\S+\.\S+$/.test(email.trim())) {
            setError("Enter an email address, e.g. mia@example.com.")
            return
          }
          done(`Prototype: the sign-in link to ${email.trim()} counts as opened.`)
        }}
        className="flex flex-col gap-2"
      >
        <label htmlFor="join-email" className="text-[14px] font-semibold">
          Email
        </label>
        <input
          id="join-email"
          type="email"
          autoComplete="email"
          value={email}
          onChange={(e) => {
            setEmail(e.target.value)
            setError(null)
          }}
          placeholder="you@example.com"
          aria-invalid={!!error}
          aria-describedby={error ? "join-email-error" : undefined}
          className="h-11 rounded-md border border-input bg-background px-3 text-[15px] outline-none focus-visible:ring-2 focus-visible:ring-ring"
        />
        {error && (
          <p id="join-email-error" className="text-[13px] text-destructive">
            {error}
          </p>
        )}
        <button
          type="submit"
          className="mt-1 inline-flex h-11 items-center justify-center gap-2 rounded-md bg-[var(--chan)] px-5 text-[15px] font-bold text-[var(--chan-on)] outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
        >
          Email me a sign-in link
        </button>
      </form>
      <div className="flex items-center gap-3 text-[12px] text-muted-foreground" aria-hidden>
        <span className="h-px flex-1 bg-border" /> or <span className="h-px flex-1 bg-border" />
      </div>
      <div className="grid gap-2 sm:grid-cols-2">
        <button
          type="button"
          onClick={() => done("Signed in with Google.")}
          className="inline-flex h-11 items-center justify-center gap-2 rounded-md border border-input bg-background text-[14px] font-semibold outline-none hover:bg-accent focus-visible:ring-2 focus-visible:ring-ring"
        >
          <GoogleIcon /> Continue with Google
        </button>
        <button
          type="button"
          onClick={() => done("Signed in with Apple.")}
          className="inline-flex h-11 items-center justify-center gap-2 rounded-md border border-input bg-background text-[14px] font-semibold outline-none hover:bg-accent focus-visible:ring-2 focus-visible:ring-ring"
        >
          <AppleIcon /> Continue with Apple
        </button>
      </div>
    </div>
  )
}
