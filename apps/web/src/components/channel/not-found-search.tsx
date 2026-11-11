"use client"

import Link from "next/link"
import { useParams } from "next/navigation"
import { Search } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

/** The channel 404 offers search (B11). Imported URLs already 301 to their new pages (MIG-05). */
export function NotFoundSearch() {
  const params = useParams<{ channel?: string }>()
  const base = params?.channel ? `/c/${params.channel}` : "/"
  return (
    <div className="flex flex-col gap-5">
      <form action={`${base}/search`} method="get" role="search" className="flex gap-2">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" aria-hidden />
          <Input name="q" type="search" placeholder="Search videos, articles and shorts" aria-label="Search this channel" className="h-11 pl-9" />
        </div>
        <Button type="submit" size="lg" className="h-11">
          Search
        </Button>
      </form>
      <Link href={base} className="w-fit text-[14px] font-semibold underline underline-offset-4">
        Go to the channel home
      </Link>
    </div>
  )
}
