"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { Ban, CircleCheck, Download, KeyRound, ShieldCheck, Trash2, TriangleAlert, User, Users } from "lucide-react"
import { toast } from "sonner"
import { AppleIcon, GoogleIcon } from "@/components/auth/provider-icons"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Spinner } from "@/components/ui/spinner"
import { Switch } from "@/components/ui/switch"
import { cn } from "@/lib/utils"

export interface FollowedChannel {
  slug: string
  name: string
  tagline: string
  accent: string
  accentOn: string
  initials: string
  followers: string
}

const VIEWER = { name: "Mia Nguyen", email: "mia.nguyen@example.com", since: "3 March 2026" }

const NAV = [
  { id: "profile", label: "Profile", Icon: User },
  { id: "following", label: "Following", Icon: Users },
  { id: "ads", label: "Age-restricted ads", Icon: ShieldCheck },
  { id: "data", label: "Your data", Icon: KeyRound },
]

/** Account centre (AUD-04): profile, following, age-restricted ads, your data. */
export function AccountCentre({ channels }: { channels: FollowedChannel[] }) {
  const [active, setActive] = useState("profile")

  useEffect(() => {
    const ids = NAV.map((n) => n.id)
    const obs = new IntersectionObserver(
      (entries) => {
        const visible = entries.filter((e) => e.isIntersecting).sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top)
        if (visible[0]) setActive(visible[0].target.id)
      },
      { rootMargin: "-20% 0px -60% 0px" },
    )
    ids.forEach((id) => {
      const el = document.getElementById(id)
      if (el) obs.observe(el)
    })
    return () => obs.disconnect()
  }, [])

  return (
    <div className="mx-auto grid w-full max-w-[1080px] grid-cols-1 gap-8 px-4 py-8 sm:px-6 md:grid-cols-[220px_minmax(0,1fr)] md:py-12 lg:px-8">
      <div className="flex flex-col gap-6 md:sticky md:top-8 md:self-start">
        <div className="flex items-center gap-3">
          <Avatar className="size-11">
            <AvatarFallback className="bg-primary text-[15px] font-bold text-primary-foreground">MN</AvatarFallback>
          </Avatar>
          <div className="flex min-w-0 flex-col">
            <h1 className="text-[18px] font-bold leading-6">Your account</h1>
            <p className="truncate text-[13px] text-muted-foreground">{VIEWER.email}</p>
          </div>
        </div>
        <nav aria-label="Account sections" className="-mx-4 overflow-x-auto px-4 md:mx-0 md:px-0">
          <ul className="flex gap-1 md:flex-col">
            {NAV.map(({ id, label, Icon }) => (
              <li key={id}>
                <a
                  href={`#${id}`}
                  aria-current={active === id ? "true" : undefined}
                  className={cn(
                    "flex items-center gap-2 whitespace-nowrap rounded-md px-3 py-2 text-[14px] font-medium outline-none transition-colors focus-visible:ring-2 focus-visible:ring-ring",
                    active === id ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-background hover:text-foreground",
                  )}
                >
                  <Icon className="size-4" aria-hidden />
                  {label}
                </a>
              </li>
            ))}
          </ul>
        </nav>
      </div>

      <div className="flex min-w-0 flex-col gap-6">
        <Profile />
        <Following channels={channels} />
        <AdPreferences />
        <YourData />
      </div>
    </div>
  )
}

function Panel({ id, title, lede, children }: { id: string; title: string; lede?: React.ReactNode; children: React.ReactNode }) {
  return (
    <section id={id} aria-labelledby={`${id}-title`} className="scroll-mt-6 rounded-lg border bg-background">
      <div className="flex flex-col gap-1 border-b px-5 py-4 sm:px-6">
        <h2 id={`${id}-title`} className="text-[20px] font-bold tracking-[-0.01em]">
          {title}
        </h2>
        {lede && <p className="text-[14px] leading-[21px] text-muted-foreground">{lede}</p>}
      </div>
      <div className="flex flex-col gap-6 px-5 py-5 sm:px-6">{children}</div>
    </section>
  )
}

function Profile() {
  const [name, setName] = useState(VIEWER.name)
  return (
    <Panel id="profile" title="Profile" lede={`Member since ${VIEWER.since}. Your name shows only to you.`}>
      <form
        className="grid gap-4 sm:grid-cols-2"
        onSubmit={(e) => {
          e.preventDefault()
          toast("Saved")
        }}
      >
        <div className="flex flex-col gap-2">
          <Label htmlFor="pf-name">Name</Label>
          <Input id="pf-name" value={name} onChange={(e) => setName(e.target.value)} autoComplete="name" />
        </div>
        <div className="flex flex-col gap-2">
          <Label htmlFor="pf-email">Email</Label>
          <Input id="pf-email" type="email" defaultValue={VIEWER.email} autoComplete="email" aria-describedby="pf-email-note" />
          <p id="pf-email-note" className="text-[12px] text-muted-foreground">
            We&apos;ll send a link to confirm a new address.
          </p>
        </div>
        <div className="sm:col-span-2">
          <Button type="submit">Save changes</Button>
        </div>
      </form>
      <div className="flex flex-col gap-3 border-t pt-5">
        <h3 className="text-[15px] font-semibold">Sign-in methods</h3>
        <ul className="flex flex-col divide-y rounded-lg border">
          <Method icon={<KeyRound className="size-4" aria-hidden />} name="Email link" detail={VIEWER.email} connected />
          <Method icon={<GoogleIcon />} name="Google" detail="mia.nguyen@gmail.com" connected />
          <Method icon={<AppleIcon />} name="Apple" detail="Not connected" />
        </ul>
      </div>
    </Panel>
  )
}

function Method({ icon, name, detail, connected = false }: { icon: React.ReactNode; name: string; detail: string; connected?: boolean }) {
  const [on, setOn] = useState(connected)
  return (
    <li className="flex items-center gap-3 px-4 py-3">
      <span className="grid size-8 shrink-0 place-items-center rounded-[4px] bg-muted">{icon}</span>
      <span className="flex min-w-0 flex-1 flex-col">
        <span className="text-[14px] font-semibold">{name}</span>
        <span className="truncate text-[13px] text-muted-foreground">{on ? (detail === "Not connected" ? "Connected" : detail) : "Not connected"}</span>
      </span>
      {name === "Email link" ? (
        <span className="text-[12px] font-medium text-muted-foreground">Always on</span>
      ) : (
        <Button
          variant="outline"
          size="sm"
          onClick={() => {
            setOn(!on)
            toast(on ? `${name} disconnected` : `${name} connected`)
          }}
        >
          {on ? "Disconnect" : "Connect"}
        </Button>
      )}
    </li>
  )
}

function Following({ channels }: { channels: FollowedChannel[] }) {
  const [following, setFollowing] = useState<Record<string, boolean>>(() => Object.fromEntries(channels.map((c) => [c.slug, true])))
  const [digest, setDigest] = useState(true)
  const count = Object.values(following).filter(Boolean).length

  return (
    <Panel id="following" title="Following" lede={`${count} ${count === 1 ? "channel" : "channels"}. New videos and articles from these channels go into your weekly digest.`}>
      <ul className="flex flex-col divide-y rounded-lg border">
        {channels.map((c) => {
          const on = following[c.slug]
          return (
            <li key={c.slug} className="flex items-center gap-3 px-4 py-3">
              <span className="grid size-10 shrink-0 place-items-center rounded-[4px] text-[13px] font-extrabold" style={{ background: c.accent, color: c.accentOn }} aria-hidden>
                {c.initials}
              </span>
              <span className="flex min-w-0 flex-1 flex-col">
                <Link href={`/c/${c.slug}`} className="w-fit text-[15px] font-semibold underline-offset-4 hover:underline">
                  {c.name}
                </Link>
                <span className="truncate text-[13px] text-muted-foreground">{c.tagline}</span>
              </span>
              <Button
                variant={on ? "outline" : "default"}
                size="sm"
                className="rounded-full"
                aria-pressed={on}
                onClick={() => {
                  setFollowing((f) => ({ ...f, [c.slug]: !on }))
                  toast(on ? `Unfollowed ${c.name}` : `Following ${c.name}`)
                }}
              >
                {on ? "Following" : "Follow"}
              </Button>
            </li>
          )
        })}
      </ul>
      <div className="flex items-start justify-between gap-4">
        <div className="flex flex-col gap-1">
          <Label htmlFor="digest" className="text-[15px] font-semibold">
            Weekly digest
          </Label>
          <p id="digest-note" className="text-[13px] leading-5 text-muted-foreground">
            One email on Monday mornings with what&apos;s new from the channels you follow.
          </p>
        </div>
        <Switch
          id="digest"
          checked={digest}
          onCheckedChange={(v) => {
            setDigest(v)
            toast(v ? "Weekly digest on" : "Weekly digest off")
          }}
          aria-describedby="digest-note"
        />
      </div>
    </Panel>
  )
}

const AGE_PREFS = [
  {
    id: "no-betting",
    label: "Don't show me betting ads",
    on: "On. You won't see betting ads on Homestand. Other ads still show.",
    off: "Off. Betting ads can show to you because you're signed in and confirmed 18 or over.",
    toastOn: "You won't see betting ads on Homestand",
    toastOff: "Betting ads can show again",
  },
  {
    id: "no-alcohol",
    label: "Don't show me alcohol ads",
    on: "On. You won't see alcohol ads on Homestand. Other ads still show.",
    off: "Off. Alcohol ads can show to you because you're signed in and confirmed 18 or over.",
    toastOn: "You won't see alcohol ads on Homestand",
    toastOff: "Alcohol ads can show again",
  },
] as const

function AdPreferences() {
  const [off, setOff] = useState<Record<string, boolean>>({ "no-betting": false, "no-alcohol": false })
  return (
    <Panel
      id="ads"
      title="Age-restricted ads"
      lede="Some ads are for adults only, such as alcohol and betting. They show only to signed-in viewers confirmed 18 or over who haven't turned them off. These settings apply on every Homestand channel, from your next page view."
    >
      <div className="flex flex-col gap-3 rounded-lg border p-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-start gap-3">
          <span className="grid size-9 shrink-0 place-items-center rounded-[4px] bg-muted" aria-hidden>
            <ShieldCheck className="size-4" />
          </span>
          <div className="flex flex-col gap-0.5">
            <p className="text-[13px] font-semibold text-muted-foreground">Age assurance</p>
            <p className="flex items-center gap-1.5 text-[15px] font-semibold">
              <CircleCheck className="size-4 text-pop-ink" aria-hidden />
              Confirmed 18 or over
            </p>
            <p className="text-[13px] leading-5 text-muted-foreground">4 November 2026 · Digital ID. We keep the result, never your ID.</p>
          </div>
        </div>
        <Button asChild variant="outline" size="sm" className="w-fit">
          <Link href="/account/verify-age">Check again</Link>
        </Button>
      </div>

      <ul className="flex flex-col divide-y rounded-lg border">
        {AGE_PREFS.map((p) => {
          const on = off[p.id]
          return (
            <li key={p.id} className={cn("flex flex-col gap-3 p-4 sm:p-5", on && "bg-muted/60")}>
              <div className="flex items-start justify-between gap-4">
                <div className="flex flex-col gap-1">
                  <Label htmlFor={p.id} className="text-[17px] font-bold leading-6">
                    {p.label}
                  </Label>
                  <p id={`${p.id}-note`} className="text-[14px] leading-[21px] text-muted-foreground" aria-live="polite">
                    {on ? p.on : p.off}
                  </p>
                </div>
                <Switch
                  id={p.id}
                  checked={on}
                  onCheckedChange={(v) => {
                    setOff((o) => ({ ...o, [p.id]: v }))
                    toast(v ? p.toastOn : p.toastOff)
                  }}
                  aria-describedby={`${p.id}-note`}
                  className="mt-1 data-[size=default]:h-6 data-[size=default]:w-11 *:data-[slot=switch-thumb]:size-5"
                />
              </div>
              {p.id === "no-betting" && (
                <p className="flex items-start gap-2 rounded-md bg-muted px-3 py-2 text-[13px] leading-5 text-muted-foreground">
                  <Ban className="mt-0.5 size-4 shrink-0" aria-hidden />
                  <span>
                    <span className="font-semibold text-foreground">AdStop register.</span> When the national AdStop register goes live, we&apos;ll check it too.
                    If you&apos;re on it, you won&apos;t see betting ads here, whatever this switch says.
                  </span>
                </p>
              )}
            </li>
          )
        })}
      </ul>

      <p className="text-[13px] leading-5 text-muted-foreground">
        Age-restricted ads never show to anyone signed out or not yet confirmed, and betting ads never show on live sport. Need support? Gambling Help
        Online is free and confidential on 1800 858 858, and the National Alcohol and Other Drug Hotline is on 1800 250 015.
      </p>
    </Panel>
  )
}

function YourData() {
  const [download, setDownload] = useState<"idle" | "preparing" | "ready">("idle")
  const [del, setDel] = useState<"idle" | "confirm" | "deleted">("idle")
  const [typed, setTyped] = useState("")
  const [understood, setUnderstood] = useState(false)
  const canDelete = typed.trim().toLowerCase() === VIEWER.email && understood

  return (
    <Panel id="data" title="Your data" lede="See what we hold about you, or close your account.">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-col gap-1">
          <h3 className="text-[15px] font-semibold">Download my data</h3>
          <p className="text-[13px] leading-5 text-muted-foreground" aria-live="polite">
            {download === "ready"
              ? "Ready: homestand-data-mia-nguyen.zip (profile, follows, preferences and age-assurance result)."
              : "Your profile, follows, preferences and age-assurance result, as JSON in a zip file."}
          </p>
        </div>
        {download === "ready" ? (
          <Button variant="outline" onClick={() => toast("Download started", { description: "homestand-data-mia-nguyen.zip" })}>
            <Download aria-hidden />
            Download zip
          </Button>
        ) : (
          <Button
            variant="outline"
            disabled={download === "preparing"}
            onClick={() => {
              setDownload("preparing")
              setTimeout(() => setDownload("ready"), 1400)
            }}
          >
            {download === "preparing" ? <Spinner /> : <Download aria-hidden />}
            {download === "preparing" ? "Preparing" : "Prepare download"}
          </Button>
        )}
      </div>

      <div className="flex flex-col gap-4 border-t pt-5">
        {del === "deleted" ? (
          <div role="status" className="flex flex-col gap-2 rounded-lg border p-4">
            <p className="flex items-center gap-2 text-[15px] font-semibold">
              <CircleCheck className="size-4 text-pop-ink" aria-hidden />
              Account scheduled for deletion
            </p>
            <p className="text-[13px] leading-5 text-muted-foreground">
              We&apos;ve signed you out everywhere. Everything is deleted on 11 December 2026. Sign in before then to cancel. Evidence records the law requires us to keep are held separately and never linked back to a profile.
            </p>
            <Button asChild variant="outline" size="sm" className="w-fit">
              <Link href="/account/signin">Sign in again</Link>
            </Button>
          </div>
        ) : (
          <>
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex flex-col gap-1">
                <h3 className="text-[15px] font-semibold">Delete account</h3>
                <p className="text-[13px] leading-5 text-muted-foreground">Removes your profile, follows and preferences on every Homestand channel.</p>
              </div>
              {del === "idle" && (
                <Button variant="outline" className="border-destructive text-destructive hover:bg-destructive/5 hover:text-destructive" onClick={() => setDel("confirm")}>
                  <Trash2 aria-hidden />
                  Delete account
                </Button>
              )}
            </div>
            {del === "confirm" && (
              <form
                className="flex flex-col gap-4 rounded-lg border border-destructive p-4"
                onSubmit={(e) => {
                  e.preventDefault()
                  if (canDelete) setDel("deleted")
                }}
              >
                <p className="flex items-start gap-2 text-[14px] font-semibold text-destructive">
                  <TriangleAlert className="mt-0.5 size-4 shrink-0" aria-hidden />
                  This can&apos;t be undone after 30 days.
                </p>
                <div className="flex flex-col gap-2">
                  <Label htmlFor="del-email">Type your email to confirm</Label>
                  <Input id="del-email" value={typed} onChange={(e) => setTyped(e.target.value)} placeholder={VIEWER.email} autoComplete="off" />
                </div>
                <div className="flex items-start gap-2.5">
                  <Checkbox id="del-ok" checked={understood} onCheckedChange={(v) => setUnderstood(v === true)} className="mt-0.5" />
                  <Label htmlFor="del-ok" className="text-[13px] font-normal leading-5">
                    I understand I&apos;ll lose access to exclusives and my follows on every channel.
                  </Label>
                </div>
                <div className="flex flex-wrap gap-2">
                  <Button type="submit" variant="destructive" disabled={!canDelete}>
                    Delete my account
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    onClick={() => {
                      setDel("idle")
                      setTyped("")
                      setUnderstood(false)
                    }}
                  >
                    Keep my account
                  </Button>
                </div>
              </form>
            )}
          </>
        )}
      </div>
    </Panel>
  )
}
