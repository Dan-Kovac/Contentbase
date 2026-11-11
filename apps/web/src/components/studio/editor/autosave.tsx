"use client"

import { useEffect, useRef, useState } from "react"
import { Loader2 } from "lucide-react"

/** Shows "Saving" briefly whenever `deps` change after the first render (EDT-01). */
export function useAutosave(deps: unknown[]) {
  const [saving, setSaving] = useState(false)
  const first = useRef(true)
  useEffect(() => {
    if (first.current) {
      first.current = false
      return
    }
    setSaving(true)
    const t = window.setTimeout(() => setSaving(false), 700)
    return () => window.clearTimeout(t)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps)
  return saving
}

export function SaveIndicator({ saving, label = "Saved" }: { saving: boolean; label?: string }) {
  return (
    <p className="flex min-w-[88px] items-center gap-1.5 text-[13px] text-muted-foreground" aria-live="polite">
      {saving ? (
        <>
          <Loader2 className="size-3.5 animate-spin" aria-hidden /> Saving
        </>
      ) : (
        <>
          <span className="size-1.5 rounded-full bg-pop-ink" aria-hidden /> {label}
        </>
      )}
    </p>
  )
}
