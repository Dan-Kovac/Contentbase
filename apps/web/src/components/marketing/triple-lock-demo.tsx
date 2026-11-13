"use client"

/**
 * The triple lock, made interactive for advertisers: pick who is watching and the page's sponsors
 * change, exactly as they do on a live channel. Every sponsor is decided on the server for each
 * viewer state; this only switches between them.
 */
import { useState } from "react"
import { ChapterSponsorCredit, HalftimeBreak } from "@/components/brand/native-ads"
import { LockStatus } from "@/components/brand/compliance"
import { cn } from "@/lib/utils"
import type { Sponsor } from "@/lib/types"
import type { Viewer } from "@/components/channel/viewer"

const STATES: { id: Viewer; label: string; locks: [boolean, boolean, boolean] }[] = [
  { id: "logged_out", label: "Logged out", locks: [false, false, true] },
  { id: "signed_in", label: "Signed in", locks: [true, false, true] },
  { id: "verified", label: "Confirmed 18+", locks: [true, true, true] },
  { id: "opted_out", label: "18+, opted out of betting", locks: [true, true, false] },
]

export function TripleLockDemo({
  chapter,
  halftime,
  notes,
  channelName,
  chapterTitle,
}: {
  chapter: Record<Viewer, Sponsor>
  halftime: Record<Viewer, Sponsor>
  notes: Record<Viewer, string>
  channelName: string
  chapterTitle: string
}) {
  const [viewer, setViewer] = useState<Viewer>("verified")
  const state = STATES.find((s) => s.id === viewer)!
  const [session, age, optout] = state.locks
  const restricted = !!(chapter[viewer].ageCategory || halftime[viewer].ageCategory)
  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.2fr)] lg:gap-10">
      <div className="flex flex-col gap-5">
        <div className="flex flex-col gap-2">
          <p id="who-watching" className="text-[13px] font-semibold text-muted-foreground">
            Who is watching {channelName}?
          </p>
          <div role="radiogroup" aria-labelledby="who-watching" className="grid grid-cols-2 gap-2">
            {STATES.map((s) => (
              <button
                key={s.id}
                type="button"
                role="radio"
                aria-checked={viewer === s.id}
                onClick={() => setViewer(s.id)}
                className={cn(
                  "min-h-11 rounded-md border px-3 py-2 text-left text-[14px] font-semibold outline-none transition-colors focus-visible:ring-2 focus-visible:ring-ring",
                  viewer === s.id ? "border-foreground bg-foreground text-background" : "bg-card hover:bg-accent",
                )}
              >
                {s.label}
              </button>
            ))}
          </div>
        </div>
        <LockStatus
          locks={{ session: { pass: session }, age: { pass: age }, optout: { pass: optout } }}
          verdict={restricted ? "All three pass: the age-restricted sponsor can show. Evidence is written before the ad serves." : "Fail closed: an everyday sponsor fills the same space."}
        />
        <p className="text-[14px] leading-[21px] text-muted-foreground" aria-live="polite">
          {notes[viewer]}
        </p>
      </div>
      <div className="flex flex-col gap-4 rounded-lg border bg-background p-4 sm:p-6" aria-live="polite">
        <p className="text-[12px] font-bold uppercase tracking-[1px] text-muted-foreground">What this viewer sees</p>
        <div className="rounded-md border px-3 py-2.5">
          <ChapterSponsorCredit key={chapter[viewer].id} sponsor={chapter[viewer]} chapter={chapterTitle} />
        </div>
        <HalftimeBreak key={halftime[viewer].id} sponsor={halftime[viewer]} className="my-0" />
      </div>
    </div>
  )
}
