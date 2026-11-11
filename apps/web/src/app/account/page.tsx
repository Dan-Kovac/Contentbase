import type { Metadata } from "next"
import { AccountCentre, type FollowedChannel } from "@/components/account/account-centre"
import { listChannels } from "@/lib/data"
import { ACCENTS, compact } from "@/lib/format"

export const metadata: Metadata = { title: "Your account" }

export default function AccountPage() {
  const channels: FollowedChannel[] = listChannels().map((c) => ({
    slug: c.slug,
    name: c.name,
    tagline: c.tagline,
    accent: ACCENTS[c.accent].value,
    accentOn: ACCENTS[c.accent].on,
    initials: c.name
      .split(/\s+/)
      .map((w) => w[0])
      .join("")
      .slice(0, 2)
      .toUpperCase(),
    followers: compact(c.followers),
  }))
  return <AccountCentre channels={channels} />
}
