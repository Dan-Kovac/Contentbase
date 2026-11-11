"use client"

import { useCallback, useEffect, useState } from "react"
import type { AccentName, Pairing, Plan, Template } from "@/lib/types"

/** Choices carried between sign-up steps. Prototype only: kept in sessionStorage. */
export interface SignupDraft {
  youtubeHandle: string
  importScope: "all" | "recent"
  autoImport: boolean
  name: string
  subdomain: string
  template: Template
  accent: AccentName
  pairing: Pairing
  plan: Plan
}

export const DEFAULT_DRAFT: SignupDraft = {
  youtubeHandle: "@footyfixau",
  importScope: "all",
  autoImport: true,
  name: "Footy Fix",
  subdomain: "footyfix",
  template: "editorial",
  accent: "pitch",
  pairing: "minimal",
  plan: "pro",
}

const KEY = "homestand.signup"

function read(): SignupDraft {
  try {
    const raw = window.sessionStorage.getItem(KEY)
    return raw ? { ...DEFAULT_DRAFT, ...JSON.parse(raw) } : DEFAULT_DRAFT
  } catch {
    return DEFAULT_DRAFT
  }
}

export function useSignupDraft() {
  const [draft, setDraft] = useState<SignupDraft>(DEFAULT_DRAFT)

  useEffect(() => {
    setDraft(read())
  }, [])

  const update = useCallback((patch: Partial<SignupDraft>) => {
    setDraft((d) => {
      const next = { ...d, ...patch }
      try {
        window.sessionStorage.setItem(KEY, JSON.stringify(next))
      } catch {
        /* storage unavailable: the prototype still works with defaults */
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
