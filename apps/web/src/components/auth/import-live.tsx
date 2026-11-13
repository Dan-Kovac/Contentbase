"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { ArrowRight, CircleCheck, Copy, ExternalLink, FileText, Inbox, Mail } from "lucide-react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Spinner } from "@/components/ui/spinner"
import { AuthHeading, AuthShell } from "./auth-shell"
import { ChannelPreview } from "./channel-preview"
import { YouTubeIcon } from "./provider-icons"
import { useSignupDraft } from "./signup-draft"
import { SignupSteps } from "./signup-steps"

const RECENT = [
  "The Blues have a centre-bounce problem",
  "Mailbag #43: is the sub rule dead?",
  "Phantom draft, version three",
  "AFLW finals: who can actually win it",
  "Round 7 in five minutes",
  "Inside the Blues' pre-season camp",
  "Why Brisbane's forward line works without a key target",
  "The rookies who could start in Round 1",
]

/** Step 6: channel is live, import animates from sample numbers. */
export function ImportLive() {
  const [draft] = useSignupDraft()
  const total = draft.importScope === "recent" ? 50 : 222
  const finalSkipped = draft.importScope === "recent" ? 2 : 6
  const finalFailed = draft.importScope === "recent" ? 1 : 2
  const [done, setDone] = useState(0)

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- prototype simulation: reset before the timer starts
    setDone(0)
    const step = Math.max(1, Math.round(total / 60))
    const t = setInterval(() => {
      setDone((d) => {
        const n = Math.min(total, d + step)
        if (n >= total) clearInterval(t)
        return n
      })
    }, 160)
    return () => clearInterval(t)
  }, [total])

  const finished = done >= total
  const skipped = Math.round((done / total) * finalSkipped)
  const failed = Math.round((done / total) * finalFailed)
  const imported = done - skipped - failed
  const drafts = Math.min(imported, Math.floor(done / 9))
  const url = `${draft.subdomain || "footyfix"}.homestand.com.au`
  const current = RECENT[Math.floor(done / 7) % RECENT.length]

  return (
    <AuthShell
      top={<SignupSteps current={3} />}
      aside={
        <div className="flex flex-col gap-5">
          <p className="text-[13px] font-semibold uppercase tracking-[1px] text-brand-muted">{url}</p>
          <ChannelPreview name={draft.name} subdomain={draft.subdomain} template={draft.template} accentHex={draft.accentHex} pairing={draft.pairing} logoUrl={draft.logoUrl} iconUrl={draft.iconUrl} ctaLabel={draft.ctaLabel} />
        </div>
      }
    >
      <AuthHeading
        kicker="You're in"
        title="Your channel is live"
        lede={
          <>
            {draft.name || "Your channel"} is on the web now. Share it once your first stories are published.
          </>
        }
      />

      <div className="flex flex-wrap items-center gap-2 rounded-lg border p-3 pl-4">
        <span className="min-w-0 flex-1 break-all font-medium">{url}</span>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => {
            try {
              void navigator.clipboard?.writeText(`https://${url}`)
            } catch {
              /* clipboard blocked */
            }
            toast("Link copied")
          }}
        >
          <Copy aria-hidden />
          Copy
        </Button>
        <Button asChild variant="outline" size="sm">
          <Link href="/c/footyfix">
            <ExternalLink aria-hidden />
            Open
          </Link>
        </Button>
      </div>

      <section aria-labelledby="import-title" className="flex flex-col gap-4 rounded-lg border p-5">
        <div className="flex items-center justify-between gap-3">
          <h2 id="import-title" className="flex items-center gap-2 text-[15px] font-semibold">
            <YouTubeIcon className="size-4" />
            {finished ? "Import finished" : "Importing from YouTube"}
          </h2>
          <span className="text-[13px] text-muted-foreground tabular">{total} videos found</span>
        </div>
        <Progress
          value={(done / total) * 100}
          aria-label="Import progress"
          className="h-2.5 bg-muted *:data-[slot=progress-indicator]:bg-pitch"
        />
        <p className="flex min-h-5 items-center gap-2 text-[13px] text-muted-foreground" aria-live="polite">
          {finished ? (
            <>
              <CircleCheck className="size-4 text-pop-ink" aria-hidden />
              {imported} imported · {skipped} skipped · {failed} failed. Retry failed items from your studio.
            </>
          ) : (
            <>
              <Spinner className="size-3.5" aria-hidden />
              <span className="truncate">
                {done} of {total} · {current}
              </span>
            </>
          )}
        </p>
        <dl className="grid grid-cols-3 gap-2 border-t pt-4">
          <Stat label="Imported" value={imported} />
          <Stat label="Drafts ready" value={drafts} />
          <Stat label="Need a look" value={skipped + failed} />
        </dl>
      </section>

      <section aria-labelledby="next-title" className="flex flex-col gap-4">
        <h2 id="next-title" className="text-[15px] font-semibold">
          What happens next
        </h2>
        <ol className="flex flex-col gap-3 text-[14px] leading-[21px]">
          <Next icon={<Inbox aria-hidden />} title="Drafts land in Ready to review">
            Each video arrives as a pack: a video page, an article draft, shorts and the search details.
          </Next>
          <Next icon={<FileText aria-hidden />} title="You review and publish">
            Change what you like. Nothing goes live until you publish.
          </Next>
          <Next icon={<Mail aria-hidden />} title="We email you when it's done">
            Sent to sam.doherty@gmail.com with the import report.
          </Next>
        </ol>
      </section>

      <div className="flex flex-col gap-2">
        <Button asChild variant="pop" size="xl" className="w-full">
          <Link href="/studio/review/v_blues">
            Review your first draft
            <ArrowRight aria-hidden />
          </Link>
        </Button>
        <Button asChild variant="ghost" size="lg" className="w-full">
          <Link href="/studio">Go to your studio</Link>
        </Button>
      </div>
    </AuthShell>
  )
}

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <div className="flex flex-col gap-0.5">
      <dt className="text-[12px] text-muted-foreground">{label}</dt>
      <dd className="text-[24px] font-extrabold tracking-[-0.02em] tabular">{value}</dd>
    </div>
  )
}

function Next({ icon, title, children }: { icon: React.ReactNode; title: string; children: React.ReactNode }) {
  return (
    <li className="flex gap-3">
      <span className="grid size-8 shrink-0 place-items-center rounded-[4px] bg-muted [&_svg]:size-4">{icon}</span>
      <span className="flex flex-col">
        <span className="font-semibold">{title}</span>
        <span className="text-muted-foreground">{children}</span>
      </span>
    </li>
  )
}
