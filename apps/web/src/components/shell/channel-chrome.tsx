import Link from "next/link"
import { Search, UserRound } from "lucide-react"
import { Wordmark } from "@/components/brand/wordmark"
import type { Channel } from "@/lib/types"

export function ChannelLogo({ channel }: { channel: Channel }) {
  return (
    <Link href={`/c/${channel.slug}`} className="flex items-center gap-2 text-foreground">
      <span className="size-6 rounded-[5px] bg-[var(--chan)]" aria-hidden />
      <span
        className="whitespace-nowrap text-[22px] leading-none"
        style={{ fontFamily: "var(--chan-display)", fontWeight: "var(--chan-weight)" as unknown as number, letterSpacing: "var(--chan-tracking)" }}
      >
        {channel.name}
      </span>
    </Link>
  )
}

export function ChannelHeader({ channel }: { channel: Channel }) {
  return (
    <header className="sticky top-0 z-30 border-b bg-background/95 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-[1280px] items-center gap-6 px-4 md:px-8">
        <ChannelLogo channel={channel} />
        <nav aria-label="Sections" className="hidden items-center gap-5 text-[14px] font-medium text-muted-foreground md:flex">
          {channel.nav.map((n) => (
            <Link key={n.label} href={`/c/${channel.slug}${n.href ? `/${n.href}` : ""}`} className="hover:text-foreground">
              {n.label}
            </Link>
          ))}
        </nav>
        <div className="ml-auto flex items-center gap-1">
          <Link href={`/c/${channel.slug}/search`} aria-label="Search" className="grid size-9 place-items-center rounded-md hover:bg-accent">
            <Search className="size-[18px]" />
          </Link>
          <Link href="/account" aria-label="Your account" className="grid size-9 place-items-center rounded-md hover:bg-accent">
            <UserRound className="size-[18px]" />
          </Link>
          <Link
            href="/account/signin"
            className="ml-1 inline-flex h-8 items-center rounded-full bg-[var(--chan)] px-4 text-[13px] font-bold text-[var(--chan-on)]"
          >
            Follow
          </Link>
        </div>
      </div>
      <nav aria-label="Sections" className="flex gap-5 overflow-x-auto border-t px-4 py-2 text-[14px] font-medium text-muted-foreground md:hidden">
        {channel.nav.map((n) => (
          <Link key={n.label} href={`/c/${channel.slug}${n.href ? `/${n.href}` : ""}`} className="whitespace-nowrap hover:text-foreground">
            {n.label}
          </Link>
        ))}
      </nav>
    </header>
  )
}

export function ChannelFooter({ channel }: { channel: Channel }) {
  return (
    <footer className="mt-24 border-t">
      <div className="mx-auto flex max-w-[1280px] flex-wrap items-center justify-between gap-4 px-4 py-8 text-[13px] text-muted-foreground md:px-8">
        <div className="flex items-center gap-4">
          <ChannelLogo channel={channel} />
          <span>{channel.tagline}</span>
        </div>
        <div className="flex items-center gap-4">
          <Link href="/account#ads" className="underline underline-offset-2 hover:text-foreground">
            Don&apos;t show me betting ads
          </Link>
          <Link href="/" className="flex items-center gap-1.5 hover:text-foreground">
            Powered by <Wordmark height={13} />
          </Link>
        </div>
      </div>
    </footer>
  )
}
