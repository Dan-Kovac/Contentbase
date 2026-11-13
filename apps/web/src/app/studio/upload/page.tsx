import Link from "next/link"
import { Clapperboard, RefreshCw } from "lucide-react"
import { PageHeader } from "@/components/shell/page-header"

import { currentPublication } from "@/lib/publication"
import { UploadFlow } from "@/components/studio/upload-flow"

export const metadata = { title: "Upload" }

export default async function UploadPage() {
  const channel = (await currentPublication())
  return (
    <div>
      <PageHeader
        title="Upload a video"
        description="For videos that aren't on YouTube. You get the same draft pack: a video page, an article, shorts and SEO, ready to review."
      />
      <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_300px]">
        <div className="min-w-0">
          <UploadFlow />
          <dl className="mt-6 grid grid-cols-1 gap-px overflow-hidden rounded-lg border bg-border text-[13px] sm:grid-cols-3">
            {[
              ["Formats", "MP4 or MOV"],
              ["Size", "Up to 4 GB"],
              ["Length", "Up to 3 hours"],
            ].map(([k, v]) => (
              <div key={k} className="bg-card px-4 py-3">
                <dt className="text-muted-foreground">{k}</dt>
                <dd className="mt-0.5 font-semibold">{v}</dd>
              </div>
            ))}
          </dl>
        </div>

        <aside className="grid content-start gap-4">
          <div className="rounded-lg border bg-card p-4">
            <p className="flex items-center gap-2 text-sm font-semibold">
              <RefreshCw className="size-4" aria-hidden /> YouTube videos import automatically
            </p>
            <p className="mt-1.5 text-[13px] leading-5 text-muted-foreground">
              Auto-import is on for {channel.youtube?.handle}. New uploads arrive in Ready to review on their own, so there&apos;s no need to
              upload them here.
            </p>
            <Link href="/studio/imports" className="mt-3 inline-block text-[13px] font-medium underline underline-offset-4 hover:text-muted-foreground">
              See imports
            </Link>
          </div>
          <div className="rounded-lg border bg-card p-4">
            <p className="flex items-center gap-2 text-sm font-semibold">
              <Clapperboard className="size-4" aria-hidden /> Have the original?
            </p>
            <p className="mt-1.5 text-[13px] leading-5 text-muted-foreground">
              Upload it and we&apos;ll match it to the YouTube video. That unlocks rendered vertical shorts with burned-in captions, which we
              can&apos;t cut from YouTube itself.
            </p>
          </div>
        </aside>
      </div>
    </div>
  )
}
