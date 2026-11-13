// Words to video: turn an article's blocks into a storyboard of scenes. Prototype only: the real
// version drafts the script with the model, in the publication's brand voice, and the video engine
// renders each scene in the chosen template. Here the draft is built from the article's own words
// so the demo is predictable.
import type { Block, VideoFormat } from "@/lib/types"

export type SceneKind = "title" | "point" | "chart" | "table" | "quote" | "image" | "end"

export interface Scene {
  id: string
  kind: SceneKind
  /** What the voiceover says. */
  voiceover: string
  /** The big words on screen. */
  onScreen: string
  /** Chart bars or table rows, parsed from the article. */
  rows?: { label: string; value: number; display: string }[]
  cite?: string
  image?: string
  seconds: number
}

export interface StoryboardSource {
  headline: string
  standfirst: string
  hero?: string
  blocks: Block[]
}

const WORDS_PER_SECOND = 2.6

function secondsFor(text: string, min = 3) {
  return Math.max(min, Math.round(text.split(/\s+/).filter(Boolean).length / WORDS_PER_SECOND))
}

/** The first sentence, or the first ~16 words, for on-screen type. */
function headlineOf(text: string) {
  const first = text.split(/(?<=[.!?])\s/)[0]
  const words = first.split(/\s+/)
  return words.length > 16 ? `${words.slice(0, 16).join(" ")}…` : first
}

/** "Brisbane: 6 wins, 138%" → { label: "Brisbane", value: 138 }. The last number on the line wins. */
function parseRow(item: string) {
  const [label, rest = item] = item.includes(":") ? item.split(/:\s*/, 2) : [item, item]
  const nums = [...rest.matchAll(/(\d+(?:\.\d+)?)/g)].map((m) => Number(m[1]))
  if (!nums.length) return null
  return { label: label.trim(), value: nums[nums.length - 1], display: rest.trim() }
}

export function buildStoryboard(src: StoryboardSource, format: VideoFormat, cta: string): Scene[] {
  const scenes: Scene[] = []
  let n = 0
  const add = (s: Omit<Scene, "id">) => scenes.push({ ...s, id: `sc${++n}` })

  add({ kind: "title", onScreen: src.headline, voiceover: src.standfirst, image: src.hero, seconds: secondsFor(src.standfirst, 5) })

  let heading = ""
  for (const b of src.blocks) {
    if (b.type === "heading") {
      heading = b.text
    } else if (b.type === "paragraph") {
      const hasNumbers = (b.text.match(/\d+/g) ?? []).length >= 2
      add({
        kind: heading ? "point" : hasNumbers ? "point" : "image",
        onScreen: heading || headlineOf(b.text),
        voiceover: b.text,
        image: heading ? undefined : src.hero,
        seconds: secondsFor(b.text),
      })
      heading = ""
    } else if (b.type === "list") {
      const rows = b.items.map(parseRow).filter((r): r is NonNullable<typeof r> => !!r)
      const voice = b.items.join(". ") + "."
      if (rows.length >= 2) add({ kind: rows.length <= 4 ? "chart" : "table", onScreen: heading || "By the numbers", voiceover: voice, rows, seconds: secondsFor(voice, 6) })
      else add({ kind: "point", onScreen: heading || b.items[0], voiceover: voice, seconds: secondsFor(voice) })
      heading = ""
    } else if (b.type === "quote") {
      add({ kind: "quote", onScreen: b.text, voiceover: `As ${b.cite ?? "they"} put it: ${b.text}`, cite: b.cite, seconds: secondsFor(b.text, 4) })
    } else if (b.type === "image" && b.src) {
      add({ kind: "image", onScreen: b.caption, voiceover: b.caption, image: b.src, seconds: 3 })
    }
  }

  add({ kind: "end", onScreen: cta, voiceover: `For more, ${cta.toLowerCase()}.`, seconds: 4 })

  if (format !== "short") return scenes
  // Shorts: the title, the strongest three scenes (numbers first) and the end card, under 60 seconds.
  const middle = scenes.slice(1, -1).sort((a, b) => Number(!!b.rows) - Number(!!a.rows))
  const picked = [scenes[0], ...middle.slice(0, 3), scenes[scenes.length - 1]]
  let total = 0
  return picked
    .map((s) => ({ ...s, seconds: Math.min(s.seconds, s.kind === "title" ? 6 : 14) }))
    .filter((s) => (total += s.seconds) <= 60 || s.kind === "end")
}

export function totalSeconds(scenes: Scene[]) {
  return scenes.reduce((n, s) => n + s.seconds, 0)
}

export function clock(seconds: number) {
  return `${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(2, "0")}`
}
