import type { Metadata } from "next"
import Link from "next/link"
import { StatusBadge } from "@/components/brand/status-badge"
import { VideoThumb } from "@/components/brand/media"
import { AsideStatement, AuthHeading, AuthShell, OrDivider } from "@/components/auth/auth-shell"
import { EmailLinkForm } from "@/components/auth/email-link-form"
import { ProviderButton } from "@/components/auth/provider-button"
import { listVideos } from "@/lib/data"
import { formatDuration } from "@/lib/format"

export const metadata: Metadata = { title: "Sign in" }

export default function SignInPage() {
  const ready = listVideos("ch_footyfix", ["ready", "processing"]).slice(0, 3)
  return (
    <AuthShell
      aside={
        <>
          <AsideStatement title="Welcome back to your studio." body="New uploads have been turning into drafts while you were away." />
          <ul className="flex max-w-[440px] flex-col gap-2" aria-label="Your review queue">
            {ready.map((v) => (
              <li key={v.id} className="flex items-center gap-3 rounded-lg border border-white/10 bg-white/5 p-2.5">
                <VideoThumb tone={v.posterTone} className="w-[88px] shrink-0 [&_span.grid]:size-7 [&_svg.size-5]:size-3.5" />
                <div className="flex min-w-0 flex-1 flex-col gap-1.5">
                  <p className="truncate text-[14px] font-semibold">{v.title}</p>
                  <div className="flex items-center gap-2">
                    <StatusBadge tone={v.status === "ready" ? "ready" : "processing"} className={v.status === "ready" ? "" : "border-white/15 bg-white/10 text-brand-muted"} />
                    <span className="font-mono text-[12px] text-brand-muted">{formatDuration(v.durationSec)}</span>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </>
      }
    >
      <AuthHeading title="Sign in to Homestand" lede="Pick up where you left off in your studio." />
      <div className="flex flex-col gap-5">
        <ProviderButton provider="google" href="/studio" />
        <OrDivider />
        <EmailLinkForm />
      </div>
      <p className="text-[14px] text-muted-foreground">
        New to Homestand?{" "}
        <Link href="/signup" className="font-semibold text-foreground underline-offset-4 hover:underline">
          Start a free trial
        </Link>
      </p>
      <p className="text-[13px] leading-5 text-muted-foreground">
        Watching a channel, not running one?{" "}
        <Link href="/account/signin" className="underline underline-offset-2 hover:text-foreground">
          Sign in as a viewer
        </Link>
        .
      </p>
    </AuthShell>
  )
}
