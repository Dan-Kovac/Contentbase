// Simulated AI assist (EDT-02) and compliance fixes (ING-10) for the prototype.
// Deterministic: the same block and action always give the same suggestion.
import type { Block, ComplianceFlag } from "@/lib/types"

export type AssistAction = "rewrite" | "shorten" | "expand" | "tone_plain" | "tone_punchy" | "tone_formal"

export const ASSIST_LABELS: Record<AssistAction, string> = {
  rewrite: "Rewrite",
  shorten: "Shorten",
  expand: "Expand",
  tone_plain: "Plainer",
  tone_punchy: "Punchier",
  tone_formal: "More formal",
}

/** Hand-written rewrites for the demo drafts, keyed by the start of the text. */
const REWRITES: [string, string][] = [
  ["Three weeks ago Carlton", "Carlton's centre-bounce numbers looked fine three weeks ago. On Saturday Collingwood won the clearances at the centre bounce fourteen to six, and the scoreboard told the same story."],
  ["It isn't an effort problem", "Effort isn't the problem. Patrick Cripps still wins his own ball. What goes wrong is everything around him once it hits the ground."],
  ["Watch the third quarter", "Go back to the third quarter. Carlton's wingers leave early, trusting Cripps to win it. When he doesn't, nobody is on the defensive side, and Collingwood went straight out of the middle three times in eight minutes."],
  ["The answer might be playing", "The fix could already be at Coburg. Carlton's second-year midfielder is averaging nine clearances in three VFL games as a pure inside mid. Bring him in, shift Adam Walsh to the wing for a fortnight, and two holes close together."],
  ["Carlton host Brisbane", "Brisbane are next. If the centre bounce looks the same, the talk moves from structure to personnel."],
  ["The wingers are leaving early", "Wingers who leave before the ball is won"],
  ["The fix may already be on the list", "The answer might already be at Coburg"],
  ["Barrier one has won", "Four of the last ten Cox Plates have gone to barrier one. That gets quoted every spring. The more useful number is what happened to the horses drawn wide."],
  ["Moonee Valley's short straight", "The Valley gives a wide runner two bad options: burn early to cross, or drop back and wait for a split. The short straight and tight turns make both expensive."],
  ["Look for the horses", "Middle-drawn horses that can settle handy have won six of the last ten. Start there."],
]

const CONTRACTIONS: [RegExp, string][] = [
  [/\bisn't\b/g, "is not"],
  [/\bdoesn't\b/g, "does not"],
  [/\bdon't\b/g, "do not"],
  [/\bcan't\b/g, "cannot"],
  [/\bit's\b/g, "it is"],
  [/\bIt's\b/g, "It is"],
  [/\bthere's\b/g, "there is"],
  [/\bwon't\b/g, "will not"],
  [/\bhe's\b/g, "he is"],
]

function sentences(t: string) {
  return t.match(/[^.?]+[.?]+["”]?\s*/g)?.map((s) => s.trim()) ?? [t]
}

function cap(s: string) {
  return s.charAt(0).toUpperCase() + s.slice(1)
}

function transform(text: string, action: AssistAction, keyPoints: string[], seed: number): string {
  const s = sentences(text)
  switch (action) {
    case "rewrite": {
      const hit = REWRITES.find(([k]) => text.startsWith(k))
      if (hit) return hit[1]
      if (s.length >= 2) return [s[1], s[0], ...s.slice(2)].join(" ")
      return `Put simply: ${text.charAt(0).toLowerCase()}${text.slice(1)}`
    }
    case "shorten": {
      if (s.length >= 3) return s.slice(0, Math.ceil(s.length / 2)).join(" ")
      if (s.length === 2) return s[0]
      const cut = text.replace(/,[^,]*\.$/, ".")
      return cut !== text ? cut : text.replace(/\s+(really|very|just|still|straight)\b/g, "")
    }
    case "expand": {
      const kp = keyPoints.length ? keyPoints[seed % keyPoints.length] : ""
      const extra = kp
        ? `The numbers back it up: ${kp.charAt(0).toLowerCase()}${kp.slice(1)}.`
        : "It is the detail that decides close games."
      return `${text} ${extra}`
    }
    case "tone_plain":
      return s
        .flatMap((x) => x.split(/,\s+(?:and|but)\s+/).map((p, i, a) => (i < a.length - 1 && !/[.?]$/.test(p) ? `${p}.` : p)))
        .map(cap)
        .join(" ")
        .replace(/\bpersonnel\b/g, "who plays")
    case "tone_punchy":
      return s
        .map((x) => x.replace(/,\s+and\s+/g, ". ").replace(/\b[Tt]he issue is\b/g, "The problem:"))
        .map(cap)
        .join(" ")
    case "tone_formal": {
      let out = text
      for (const [re, v] of CONTRACTIONS) out = out.replace(re, v)
      return out.replace(/\bbloke\b/g, "player")
    }
  }
}

export function suggestFor(block: Block, action: AssistAction, keyPoints: string[], seed: number): Block {
  switch (block.type) {
    case "paragraph":
    case "heading":
      return { ...block, text: block.type === "heading" && action === "expand" ? `${block.text}, and why it matters` : transform(block.text, action, keyPoints, seed) }
    case "quote":
      return { ...block, text: action === "expand" || action === "rewrite" ? block.text : transform(block.text, action, keyPoints, seed) }
    case "list":
      return {
        ...block,
        items:
          action === "shorten"
            ? block.items.map((i) => i.replace(/\s+(against|averaged by|in the).*$/, ""))
            : action === "expand" && keyPoints.length
              ? [...block.items, keyPoints[seed % keyPoints.length]]
              : block.items.map((i) => transform(i, action, keyPoints, seed)),
      }
    default:
      return block
  }
}

/** A compliant rewrite of the flagged text (ING-10). */
export function fixText(text: string, flag: Pick<ComplianceFlag, "kind" | "excerpt">): string {
  let out = text
  if (flag.kind === "bet_now" || flag.kind === "bet_cta") {
    out = out.replace(/,?\s*and [^.]*\bbet now\b[^.]*/i, "")
    if (out === text) out = out.replace(flag.excerpt, "").replace(/\s{2,}/g, " ")
  } else if (flag.kind === "odds") {
    out = out.replace(/\bis at \$\d+(\.\d+)?/, "firmed").replace(/\$\d+(\.\d+)?/g, "a short price")
  } else if (flag.kind === "bookmaker") {
    out = out.replace(flag.excerpt, "a bookmaker")
  }
  return out.replace(/\s+\./g, ".").trim()
}

/** Extra headline ideas for "Suggest another" (ING-04, EDT-02). */
export function headlineIdeas(title: string, keyPoints: string[]): string[] {
  const ideas = [
    ...keyPoints.slice(0, 2).map((k) => k.replace(/\.$/, "")),
    `${title}: what changed`,
  ]
  return ideas.filter(Boolean)
}
