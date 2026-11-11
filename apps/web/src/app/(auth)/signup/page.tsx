import type { Metadata } from "next"
import Link from "next/link"
import { Eye, FileText, Film, Search } from "lucide-react"
import { AsideStatement, AuthHeading, AuthShell } from "@/components/auth/auth-shell"
import { EmailFallback } from "@/components/auth/email-fallback"
import { ProviderButton } from "@/components/auth/provider-button"
import { SignupSteps } from "@/components/auth/signup-steps"

export const metadata: Metadata = { title: "Start your free trial" }

const GETS = [
  { Icon: Film, text: "A video page for every upload, with chapters and captions" },
  { Icon: FileText, text: "An article draft in your voice" },
  { Icon: Search, text: "Shorts and the search details, ready to review" },
]

export default function SignupConnectPage() {
  return (
    <AuthShell
      top={<SignupSteps current={0} />}
      aside={
        <>
          <AsideStatement
            title="Turn your YouTube channel into a publication you own."
            body="Connect once. Every video you've made, and every one you make next, arrives as a draft you can publish."
          />
          <ul className="flex flex-col gap-3">
            {GETS.map(({ Icon, text }) => (
              <li key={text} className="flex items-center gap-3 text-[15px]">
                <span className="grid size-8 place-items-center rounded-[4px] bg-white/10" aria-hidden>
                  <Icon className="size-4" />
                </span>
                {text}
              </li>
            ))}
          </ul>
        </>
      }
    >
      <AuthHeading
        kicker="14-day free trial"
        title="Connect your YouTube channel"
        lede="Sign in with the Google account that owns your channel. We'll find your videos and start importing straight away."
      />
      <div className="flex flex-col gap-4">
        <ProviderButton provider="google" href="/signup/channel" variant="default" />
        <div className="flex gap-3 rounded-lg border bg-muted/50 p-4">
          <Eye className="mt-0.5 size-4 shrink-0 text-muted-foreground" aria-hidden />
          <p className="text-[13px] leading-5 text-muted-foreground">
            <span className="font-semibold text-foreground">Read-only access.</span> It lets us import your public videos, titles, descriptions and
            captions. We can&apos;t upload, edit or delete anything on YouTube.
          </p>
        </div>
      </div>
      <EmailFallback />
      <p className="border-t pt-6 text-[14px] text-muted-foreground">
        Already have a channel?{" "}
        <Link href="/signin" className="font-semibold text-foreground underline-offset-4 hover:underline">
          Sign in
        </Link>
      </p>
    </AuthShell>
  )
}
