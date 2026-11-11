"use client"

import { useEffect, useState } from "react"
import { Progress } from "@/components/ui/progress"
import { YouTubeIcon } from "./provider-icons"
import { useSignupDraft } from "./signup-draft"

/** Small live import counter for the black panel during sign-up. Sample numbers. */
export function ImportTicker({ start = 12 }: { start?: number }) {
  const [draft] = useSignupDraft()
  const total = draft.importScope === "recent" ? 50 : 222
  const [done, setDone] = useState(start)

  useEffect(() => {
    const t = setInterval(() => setDone((d) => (d >= total * 0.6 ? d : d + 1)), 900)
    return () => clearInterval(t)
  }, [total])

  return (
    <div className="flex max-w-[400px] flex-col gap-3 rounded-lg border border-white/10 bg-white/5 p-4" aria-live="off">
      <div className="flex items-center justify-between gap-3 text-[13px]">
        <span className="flex items-center gap-2 font-semibold">
          <YouTubeIcon className="size-4" />
          Importing {draft.youtubeHandle}
        </span>
        <span className="font-mono text-brand-muted tabular">
          {Math.min(done, total)} / {total}
        </span>
      </div>
      <Progress value={(done / total) * 100} aria-label="Import progress" className="bg-white/10 *:data-[slot=progress-indicator]:bg-pitch" />
    </div>
  )
}
