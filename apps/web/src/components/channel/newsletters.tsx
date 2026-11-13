"use client"

/**
 * A channel's newsletters (email streams). Anyone can see them; subscribing needs a free account,
 * so every subscriber is a signed-in member the publication owns. Each stream is chosen on its
 * own, and every email carries a one-click unsubscribe.
 */
import { useEffect, useState } from "react"
import Link from "next/link"
import { Lock, Mail } from "lucide-react"
import { toast } from "sonner"
import { Switch } from "@/components/ui/switch"
import { cn } from "@/lib/utils"
import type { EmailStream } from "@/lib/types"
import { ctaHref } from "./channel-cta"
import { useViewer } from "./viewer"

type StreamInfo = Pick<EmailStream, "id" | "name" | "description" | "cadence" | "membersOnly" | "defaultOn">
type ChannelInfo = { slug: string; name: string; cta: { label: string; line: string; action: "join" | "link"; href?: string }; template: "editorial" | "broadcast" }

const KEY = (slug: string) => `homestand:subs:${slug}`

function readSubs(slug: string, streams: StreamInfo[]): string[] {
  try {
    const raw = window.localStorage.getItem(KEY(slug))
    if (raw) return JSON.parse(raw)
  } catch {
    /* storage blocked: fall back to the defaults */
  }
  return streams.filter((s) => s.defaultOn).map((s) => s.id)
}

export function NewsletterPicker({ channel, streams, email = "mia.nguyen@example.com" }: { channel: ChannelInfo; streams: StreamInfo[]; email?: string }) {
  const { signedIn } = useViewer()
  const [subs, setSubs] = useState<string[]>([])

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- reads the viewer's saved choices after hydration
    setSubs(readSubs(channel.slug, streams))
  }, [channel.slug, streams])

  const toggle = (s: StreamInfo, on: boolean) => {
    const next = on ? [...subs, s.id] : subs.filter((x) => x !== s.id)
    setSubs(next)
    try {
      window.localStorage.setItem(KEY(channel.slug), JSON.stringify(next))
    } catch {
      /* storage blocked: the choice still holds for this page */
    }
    toast(on ? `Subscribed to ${s.name}` : `Unsubscribed from ${s.name}`, { description: on ? `It comes to ${email}.` : "You won't get it any more." })
  }

  return (
    <div className="flex flex-col gap-4 font-sans">
      {!signedIn && (
        <div className="flex flex-col gap-3 rounded-lg border bg-muted/50 p-4 sm:flex-row sm:items-center sm:justify-between">
          <p className="flex items-start gap-2 text-[14px] leading-[21px]">
            <Lock className="mt-0.5 size-4 shrink-0" aria-hidden />
            <span>
              <span className="font-semibold">Newsletters are for members.</span> Join {channel.name} free to choose which ones you get. One account works on every Homestand
              channel.
            </span>
          </p>
          <div className="flex shrink-0 items-center gap-3">
            <Link
              href={ctaHref(channel, `/c/${channel.slug}/newsletters`)}
              className="inline-flex h-10 items-center rounded-md bg-[var(--chan)] px-4 text-[14px] font-bold text-[var(--chan-on)] outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            >
              {channel.cta.action === "join" ? channel.cta.label : "Join free"}
            </Link>
            <Link href={ctaHref(channel, `/c/${channel.slug}/newsletters`, "signin")} className="text-[14px] font-semibold underline-offset-4 hover:underline">
              Sign in
            </Link>
          </div>
        </div>
      )}
      <ul className="flex flex-col divide-y rounded-lg border bg-card">
        {streams.map((s) => {
          const on = signedIn && subs.includes(s.id)
          return (
            <li key={s.id} className="flex items-start gap-4 p-4 sm:p-5">
              <span className={cn("mt-0.5 grid size-10 shrink-0 place-items-center rounded-md", on ? "bg-[var(--chan)] text-[var(--chan-on)]" : "bg-muted text-muted-foreground")} aria-hidden>
                <Mail className="size-5" />
              </span>
              <div className="flex min-w-0 flex-1 flex-col gap-1">
                <p className="flex flex-wrap items-center gap-2 text-[16px] font-semibold">
                  <label htmlFor={`sub-${s.id}`}>{s.name}</label>
                  {s.membersOnly && <span className="rounded-[2px] border px-1.5 text-[10px] font-bold uppercase tracking-[0.6px] text-muted-foreground">Members</span>}
                </p>
                <p className="text-[14px] leading-[21px] text-muted-foreground">{s.description}</p>
                <p className="text-[12px] text-muted-foreground">{s.cadence}</p>
              </div>
              <Switch id={`sub-${s.id}`} checked={on} disabled={!signedIn} onCheckedChange={(v) => toggle(s, v)} aria-label={`${s.name} newsletter`} />
            </li>
          )
        })}
      </ul>
      {signedIn && (
        <p className="text-[13px] text-muted-foreground">
          Sent to {email}. Every email has a one-click unsubscribe, and you can change these any time in{" "}
          <Link href="/account#following" className="font-semibold text-foreground underline-offset-4 hover:underline">
            your account
          </Link>
          .
        </p>
      )}
    </div>
  )
}
