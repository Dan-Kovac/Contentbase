import type { Block, Chapter, ComplianceFlag } from "@/lib/types"

export type EBlock = { id: string; block: Block }
export type EFlag = ComplianceFlag & { blockId: string; state: "open" | "fixed" | "dismissed" }

export interface ArticleState {
  headlineOptions: string[]
  headline: string
  standfirst: string
  blocks: EBlock[]
  keyPoints: string[]
  flags: EFlag[]
  chapters: Chapter[]
}

/** Update the article. `history: true` records an undo step (structural edits). */
export type ArticleUpdate = (fn: (s: ArticleState) => ArticleState, opts?: { history?: boolean }) => void

export function parseTimecode(v: string): number | null {
  const parts = v.trim().split(":").map((p) => Number(p))
  if (!parts.length || parts.some((p) => Number.isNaN(p) || p < 0)) return null
  return parts.reduce((a, p) => a * 60 + p, 0)
}
