"use client"

import { useEffect, useRef, useState } from "react"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { cn } from "@/lib/utils"

/**
 * A sideways row with previous and next buttons on larger screens, so it's obvious there is more
 * to see. Touch and trackpads still scroll it directly.
 */
export function ScrollRow({ children, className, label }: { children: React.ReactNode; className?: string; label: string }) {
  const ref = useRef<HTMLDivElement>(null)
  const [edges, setEdges] = useState({ start: true, end: false })

  useEffect(() => {
    const el = ref.current
    if (!el) return
    const update = () => setEdges({ start: el.scrollLeft < 4, end: el.scrollLeft + el.clientWidth >= el.scrollWidth - 4 })
    update()
    el.addEventListener("scroll", update, { passive: true })
    window.addEventListener("resize", update)
    return () => {
      el.removeEventListener("scroll", update)
      window.removeEventListener("resize", update)
    }
  }, [])

  const go = (dir: 1 | -1) => ref.current?.scrollBy({ left: dir * ref.current.clientWidth * 0.8, behavior: "smooth" })
  const btn =
    "absolute top-[132px] z-10 hidden size-10 place-items-center rounded-full border bg-background/95 text-foreground shadow-popover outline-none transition-opacity hover:bg-accent focus-visible:ring-2 focus-visible:ring-ring md:grid"

  return (
    <div className="relative">
      <div ref={ref} className={className} data-shorts-row>
        {children}
      </div>
      <button type="button" aria-label={`Previous ${label}`} onClick={() => go(-1)} className={cn(btn, "-left-5", edges.start && "pointer-events-none opacity-0")}>
        <ChevronLeft className="size-5" aria-hidden />
      </button>
      <button type="button" aria-label={`More ${label}`} onClick={() => go(1)} className={cn(btn, "-right-5", edges.end && "pointer-events-none opacity-0")}>
        <ChevronRight className="size-5" aria-hidden />
      </button>
    </div>
  )
}
