"use client"

import { useState } from "react"
import { cn } from "@/lib/utils"

export type AdFormat = "mrec" | "band" | "band-mobile" | "short-card"

const SIZE: Record<AdFormat, { w: number; h: number; label: string }> = {
  mrec: { w: 300, h: 250, label: "300 × 250" },
  band: { w: 970, h: 250, label: "970 × 250" },
  "band-mobile": { w: 320, h: 100, label: "320 × 100" },
  "short-card": { w: 168, h: 299, label: "9:16" },
}

/**
 * The only way an ad appears on a channel (ADS-01, ADS-07). Fixed size, labelled,
 * space reserved before load. Wagering units carry the opt-out link (TLK-03).
 */
export function AdSlot({
  format = "mrec",
  wagering = false,
  house = false,
  label,
  advertiser,
  className,
  responsiveBand = false,
}: {
  format?: AdFormat
  wagering?: boolean
  house?: boolean
  label?: string
  advertiser?: string
  className?: string
  /** For the homepage band: 970×250 on desktop, 320×100 below md. */
  responsiveBand?: boolean
}) {
  const [optedOut, setOptedOut] = useState(false)
  const isWagering = wagering && !optedOut
  const size = SIZE[format]
  const heading = label ?? (format === "band" || format === "band-mobile" ? "Presented by" : format === "short-card" ? "Sponsored" : "Advertisement")

  const creative = (w: number, h: number, text: string) => (
    <div
      className={cn(
        "grid max-w-full place-items-center rounded-[2px] text-center text-[13px] font-medium",
        house ? "border border-dashed border-input bg-background text-foreground" : "bg-muted text-muted-foreground",
      )}
      style={{ width: w, height: h }}
    >
      {house ? (
        <span className="px-4">Follow this channel for new episodes every Monday</span>
      ) : (
        <span className="px-4">
          {advertiser ? <span className="block font-semibold text-foreground">{advertiser}</span> : null}
          {isWagering ? "Wagering creative (approved)" : text}
        </span>
      )}
    </div>
  )

  return (
    <aside
      aria-label={heading}
      className={cn("mx-auto flex w-fit max-w-full flex-col items-center gap-2 rounded-[2px] border border-border bg-ad-frame px-3 pb-3 pt-2", className)}
    >
      <div className="flex w-full items-center justify-between gap-3">
        <span className="text-[11px] font-bold uppercase leading-4 tracking-[1px] text-ad-label">{heading}</span>
        {isWagering && (
          <button
            type="button"
            onClick={() => setOptedOut(true)}
            className="text-xs font-medium text-foreground underline underline-offset-2 outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            Don&apos;t show me betting ads
          </button>
        )}
        {optedOut && <span className="text-xs text-muted-foreground">Done. No betting ads on Homestand.</span>}
      </div>
      {responsiveBand ? (
        <>
          <div className="hidden md:block">{creative(970, 250, "970 × 250")}</div>
          <div className="md:hidden">{creative(320, 100, "320 × 100")}</div>
        </>
      ) : (
        creative(size.w, size.h, size.label)
      )}
    </aside>
  )
}
