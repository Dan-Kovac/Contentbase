// The publication a studio session is working on. One account can run several publications
// (a creator with more than one YouTube channel, or a media business with several in-house
// brands); the studio header switches between them. Prototype: kept in a cookie.
import { cookies } from "next/headers"
import { DEMO_CHANNEL_SLUG, getChannel } from "@/lib/data"
import type { Channel } from "@/lib/types"

export const PUB_COOKIE = "hs-pub"

/** Read inside a Suspense boundary (the studio layout provides one). */
export async function currentPublication(): Promise<Channel> {
  const slug = (await cookies()).get(PUB_COOKIE)?.value
  return (slug && getChannel(slug)) || getChannel(DEMO_CHANNEL_SLUG)!
}
