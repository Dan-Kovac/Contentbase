import type { Block } from "@/lib/types"
import type { EBlock } from "../review/types"

/** "Work with us" → "work-with-us". */
export function slugify(s: string) {
  return s
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/&/g, " and ")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 72)
    .replace(/-+$/, "")
}

export const SLUG_RE = /^[a-z0-9]+(-[a-z0-9]+)*$/

function words(b: Block) {
  const t = b.type === "list" ? b.items.join(" ") : b.type === "image" ? b.caption : "text" in b ? b.text : ""
  return t.split(/\s+/).filter(Boolean).length
}

export function wordCount(blocks: EBlock[], ...extra: string[]) {
  return blocks.reduce((n, b) => n + words(b.block), 0) + extra.reduce((n, t) => n + t.split(/\s+/).filter(Boolean).length, 0)
}

/** Reading time at 230 words a minute, at least one minute. */
export const readMinutes = (n: number) => Math.max(1, Math.round(n / 230))
