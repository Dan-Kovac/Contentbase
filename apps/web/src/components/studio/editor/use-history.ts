"use client"

import { useCallback, useRef, useState } from "react"

/** Undo history for an editor. Typing is grouped into steps at most every 2 s; `history: true` always records one. */
export function useHistory<T>(initial: () => T) {
  const [hist, setHist] = useState(() => ({ past: [] as T[], present: initial(), future: [] as T[] }))
  const lastPush = useRef(0)
  const update = useCallback((fn: (s: T) => T, opts?: { history?: boolean }) => {
    const now = performance.now()
    const record = !!opts?.history || now - lastPush.current > 2000
    if (record) lastPush.current = now
    setHist((h) => {
      const next = fn(h.present)
      if (next === h.present) return h
      if (!record) return { ...h, present: next }
      return { past: [...h.past.slice(-49), h.present], present: next, future: [] }
    })
  }, [])
  const undo = useCallback(
    () => setHist((h) => (h.past.length ? { past: h.past.slice(0, -1), present: h.past[h.past.length - 1], future: [h.present, ...h.future] } : h)),
    [],
  )
  const redo = useCallback(
    () => setHist((h) => (h.future.length ? { past: [...h.past, h.present], present: h.future[0], future: h.future.slice(1) } : h)),
    [],
  )
  return { state: hist.present, update, undo, redo, canUndo: hist.past.length > 0, canRedo: hist.future.length > 0 }
}
