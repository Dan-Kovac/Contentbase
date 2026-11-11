import { notFound } from "next/navigation"
import { listChannels } from "@/lib/data"

// Any unknown path under a channel shows the channel's own 404 (with search) inside its chrome.
// Imported URLs never land here: they 301 to their new pages (MIG-05).
export function generateStaticParams() {
  return listChannels().map((c) => ({ channel: c.slug, missing: ["not-found"] }))
}

// Always a 404, so there is no shell to keep instant.
export const instant = false

export default function MissingChannelPage() {
  notFound()
}
