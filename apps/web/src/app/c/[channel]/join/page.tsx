import { Suspense } from "react"
import type { Metadata } from "next"
import { notFound } from "next/navigation"
import { Bell, Lock, Plus } from "lucide-react"
import { JoinForm } from "@/components/channel/channel-cta"
import { DISPLAY } from "@/components/channel/lib"
import { ChannelPageSkeleton } from "@/components/channel/skeleton"
import { getChannel } from "@/lib/data"
import { cn } from "@/lib/utils"

type Params = Promise<{ channel: string }>
type Search = Promise<{ next?: string; mode?: string }>

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { channel: slug } = await params
  const channel = getChannel(slug)
  if (!channel) return {}
  return { title: { absolute: `Join ${channel.name}` }, robots: { index: false } }
}

/**
 * AUD-01: joining a channel, in the channel's own brand. It creates (or signs in to) a free
 * Homestand account, which works on every Homestand channel. Homestand appears only as
 * "Powered by" in the footer.
 */
async function JoinContent({ params, searchParams }: { params: Params; searchParams: Search }) {
  const { channel: slug } = await params
  const { next, mode } = await searchParams
  const channel = getChannel(slug)
  if (!channel) notFound()
  const signin = mode === "signin"
  const broadcast = channel.template === "broadcast"
  const benefits = [
    { Icon: Lock, title: "Members-only videos", text: `Watch everything ${channel.name} keeps for members.` },
    { Icon: Bell, title: "A weekly digest", text: "New episodes and articles from the channels you follow, every Monday." },
    { Icon: Plus, title: `Follow ${channel.name}`, text: "One free account works on every Homestand channel." },
  ]
  return (
    <div className="mx-auto grid max-w-[1080px] gap-10 px-4 py-10 md:grid-cols-[1fr_420px] md:gap-16 md:px-8 md:py-16">
      <div className="flex flex-col gap-6">
        <span className="grid size-14 place-items-center rounded-lg bg-[var(--chan)] text-[26px] font-black text-[var(--chan-on)]" aria-hidden>
          {channel.name[0]}
        </span>
        <h1 className={cn(DISPLAY, "text-[40px] leading-[1] md:text-[56px]", broadcast && "uppercase")}>
          {signin ? `Sign in to ${channel.name}` : `Join ${channel.name}`}
        </h1>
        <p className="max-w-[46ch] text-[18px] leading-[27px] text-muted-foreground">{signin ? "Welcome back. We'll send you a link, no password needed." : channel.cta.line}</p>
        {!signin && (
          <ul className="mt-2 flex flex-col gap-5">
            {benefits.map(({ Icon, title, text }) => (
              <li key={title} className="flex gap-3">
                <span className="grid size-9 shrink-0 place-items-center rounded-md border" aria-hidden>
                  <Icon className="size-4" />
                </span>
                <span className="flex flex-col gap-0.5">
                  <span className="text-[15px] font-semibold">{title}</span>
                  <span className="text-[14px] leading-[21px] text-muted-foreground">{text}</span>
                </span>
              </li>
            ))}
          </ul>
        )}
      </div>
      <div className="flex flex-col gap-5 self-start rounded-lg border bg-card p-6 md:p-8">
        <p className="text-[17px] font-semibold">{signin ? "Sign in" : `${channel.cta.label}. It's free.`}</p>
        <JoinForm channel={{ slug: channel.slug, name: channel.name, cta: channel.cta, template: channel.template }} next={next} mode={signin ? "signin" : undefined} />
        <p className="border-t pt-4 text-[12px] leading-[18px] text-muted-foreground">
          One free account works on every Homestand channel. We never post for you and never sell your details. You can confirm you&apos;re 18+ later, only if you want to see age-restricted ads.
        </p>
      </div>
    </div>
  )
}

// params and searchParams are URL data: read them inside Suspense so the shared App Shell stays instant.
export default function JoinPage({ params, searchParams }: { params: Params; searchParams: Search }) {
  return (
    <Suspense fallback={<ChannelPageSkeleton variant="page" />}>
      <JoinContent params={params} searchParams={searchParams} />
    </Suspense>
  )
}
