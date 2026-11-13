"use client"

import { useCallback, useEffect, useState } from "react"
import type { Pairing, Plan, Template } from "@/lib/types"

/** Choices carried between sign-up steps. Prototype only: kept in sessionStorage. */
export interface SignupDraft {
  youtubeHandle: string
  importScope: "all" | "recent"
  autoImport: boolean
  name: string
  subdomain: string
  template: Template
  /** The creator's own accent as typed (validated with checkAccent before continuing). */
  accentHex: string
  /** Logo and icon as data URLs, so they survive moving between steps. */
  logoUrl: string | null
  iconUrl: string | null
  pairing: Pairing
  /** Every new channel starts on a Pro trial; the plan is chosen later in Billing. */
  plan: Plan
  /** The channel's call-to-action button. */
  ctaLabel: string
}

export const DEFAULT_DRAFT: SignupDraft = {
  youtubeHandle: "@footyfixau",
  importScope: "all",
  autoImport: true,
  name: "Footy Fix",
  subdomain: "footyfix",
  template: "editorial",
  accentHex: "#1C4FB8",
  logoUrl: null,
  iconUrl: null,
  pairing: "minimal",
  plan: "pro",
  ctaLabel: "Join free",
}

const KEY = "homestand.signup"

function read(): SignupDraft {
  try {
    const raw = window.sessionStorage.getItem(KEY)
    if (!raw) return DEFAULT_DRAFT
    const d: SignupDraft = { ...DEFAULT_DRAFT, ...JSON.parse(raw) }
    // Drafts saved before templates were cut to two.
    if (d.template !== "editorial" && d.template !== "broadcast") d.template = "editorial"
    return d
  } catch {
    return DEFAULT_DRAFT
  }
}

export function useSignupDraft() {
  const [draft, setDraft] = useState<SignupDraft>(DEFAULT_DRAFT)

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- sessionStorage is only readable after mount
    setDraft(read())
  }, [])

  const update = useCallback((patch: Partial<SignupDraft>) => {
    setDraft((d) => {
      const next = { ...d, ...patch }
      try {
        window.sessionStorage.setItem(KEY, JSON.stringify(next))
      } catch {
        /* storage unavailable or full (a large logo): the prototype still works in memory */
      }
      return next
    })
  }, [])

  return [draft, update] as const
}

/** "Footy Fix!" -> "footyfix" */
export function toSubdomain(name: string) {
  return name
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[^a-z0-9]+/g, "")
    .slice(0, 30)
}
