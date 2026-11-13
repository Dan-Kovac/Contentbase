import Link from "next/link"
import { Search } from "lucide-react"
import { Wordmark } from "@/components/brand/wordmark"
import { ChannelNavLinks } from "@/components/channel/channel-nav"
import { ChannelCtaBlock, HeaderActions } from "@/components/channel/channel-cta"
import { cn } from "@/lib/utils"
import type { Channel } from "@/lib/types"

type NavItem = { label: string; href: string }

const defaultNav = (channel: Channel): NavItem[] =>
  channel.nav.map((n) => ({ label: n.label, href: `/c/${channel.slug}${n.href ? `/${n.href}` : ""}` }))

export function ChannelLogo({ channel, className }: { channel: Channel; className?: string }) {
  const broadcast = channel.template === "broadcast"
  return (
    <Link href={`/c/${channel.slug}`} className={cn("flex shrink-0 items-center gap-2 rounded-sm text-foreground outline-none focus-visible:ring-2 focus-visible:ring-ring", className)}>
      <span className={cn("grid size-6 place-items-center bg-[var(--chan)] md:size-7", broadcast ? "rounded-[3px]" : "rounded-[5px]")} aria-hidden>
        <span className="text-[13px] font-black leading-none text-[var(--chan-on)] md:text-[15px]">{channel.name[0]}</span>
      </span>
      <span
        className={cn("whitespace-nowrap text-[22px] leading-none md:text-[24px]", broadcast && "uppercase")}
        style={{ fontFamily: "var(--chan-display)", fontWeight: "var(--chan-weight)" as unknown as number, letterSpacing: "var(--chan-tracking)" }}
      >
        {channel.name}
      </span>
    </Link>
  )
}

/**
 * Shared channel header. Editorial: a white bar with quiet nav. Broadcast: a near-black bar with
 * an accent rule on top and uppercase nav (the channel root carries the dark tokens).
 */
export function ChannelHeader({ channel, nav = defaultNav(channel) }: { channel: Channel; nav?: NavItem[] }) {
  const home = `/c/${channel.slug}`
  const broadcast = channel.template === "broadcast"
  return (
    <header className={cn("sticky top-0 z-30 border-b backdrop-blur", broadcast ? "border-t-[3px] border-t-[var(--chan)] bg-background/90" : "bg-background/95")}>
      <div className="mx-auto flex h-14 max-w-[1280px] items-center gap-3 px-4 md:h-16 md:gap-8 md:px-8">
        <ChannelLogo channel={channel} />
        <ChannelNavLinks
          items={nav}
          home={home}
          variant="desktop"
          className={cn("hidden text-[14px] font-medium md:block", broadcast && "text-[13px] font-bold uppercase tracking-[1px]")}
        />
        <div className="ml-auto flex items-center gap-1">
          <Link href={`/c/${channel.slug}/search`} aria-label="Search" className="grid size-9 place-items-center rounded-md outline-none hover:bg-accent focus-visible:ring-2 focus-visible:ring-ring">
            <Search className="size-[18px]" aria-hidden />
          </Link>
          <HeaderActions channel={{ slug: channel.slug, name: channel.name, cta: channel.cta, template: channel.template }} />
        </div>
      </div>
      <ChannelNavLinks
        items={nav}
        home={home}
        variant="mobile"
        className={cn("overflow-x-auto border-t px-4 text-[14px] font-medium [scrollbar-width:none] md:hidden", broadcast && "text-[13px] font-bold uppercase tracking-[1px]")}
      />
    </header>
  )
}

export function ChannelFooter({ channel, nav = defaultNav(channel) }: { channel: Channel; nav?: NavItem[] }) {
  return (
    <footer className="mt-24 border-t bg-background">
      <div className="mx-auto grid max-w-[1280px] gap-8 px-4 py-10 md:grid-cols-[1fr_auto] md:px-8">
        <div className="flex max-w-[52ch] flex-col gap-3">
          <ChannelLogo channel={channel} />
          <p className="text-[14px] leading-[21px] text-muted-foreground">{channel.tagline}</p>
          <ChannelCtaBlock channel={{ slug: channel.slug, name: channel.name, cta: channel.cta, template: channel.template }} tone="inline" className="mt-2" />
        </div>
        <nav aria-label="Footer">
          <ul className="flex flex-wrap gap-x-6 gap-y-2 text-[14px] font-medium">
            {nav.map((n) => (
              <li key={n.href}>
                <Link href={n.href} className="rounded-sm text-muted-foreground outline-none hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring">
                  {n.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </div>
      <div className="border-t">
        <div className="mx-auto flex max-w-[1280px] flex-wrap items-center justify-between gap-4 px-4 py-5 text-[13px] text-muted-foreground md:px-8">
          <Link href="/account#ads" className="rounded-sm underline underline-offset-2 outline-none hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring">
            Don&apos;t show me betting ads
          </Link>
          <Link href="/" className="flex items-center gap-1.5 rounded-sm outline-none hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring">
            Powered by <Wordmark height={13} />
          </Link>
        </div>
      </div>
    </footer>
  )
}
