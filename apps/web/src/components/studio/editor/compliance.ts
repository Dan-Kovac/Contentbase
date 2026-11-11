// The compliance pre-check (ING-10) for writing in the studio. It runs as you
// type and finds odds, calls to bet, named bookmakers and "bet now" language.
import type { ComplianceFlag } from "@/lib/types"
import type { EBlock, EFlag } from "../review/types"

const RULES: { kind: ComplianceFlag["kind"]; re: RegExp; message: string }[] = [
  { kind: "bet_now", re: /\bbet now\b/i, message: "Calls to bet aren't allowed in editorial. Remove the phrase or rewrite the sentence." },
  { kind: "bet_cta", re: /\b(place a bet|get on (?:it|him|her|them)|back (?:it|him|her|them) in|have a punt|put your money on)\b/i, message: "This reads as an invitation to bet. Describe the form instead." },
  { kind: "odds", re: /\$\d+(?:\.\d{1,2})?\b(?=[^.]*\b(?:favourite|odds|price|win|place|chance|paying)\b)|\b\d+\/\d+ (?:on|favourite)\b|\bpaying \$\d+(?:\.\d{1,2})?/i, message: "Odds can't appear in editorial that runs next to wagering ads. Describe the market without a price." },
  { kind: "bookmaker", re: /\b(Sportsbet|Ladbrokes|Bet365|Neds|PointsBet|TAB|Betfair|Unibet|BlueBet)\b/, message: "Naming a bookmaker in editorial can count as advertising. Use \"a bookmaker\" instead." },
]

function textOf(b: EBlock["block"]) {
  if (b.type === "list") return b.items.join(" ")
  if (b.type === "image") return b.caption
  if ("text" in b) return b.text
  return ""
}

/** Flags for the current blocks. `dismissed` holds keys the writer has dismissed. */
export function detectFlags(blocks: EBlock[], dismissed: Set<string>): EFlag[] {
  const out: EFlag[] = []
  blocks.forEach((b, blockIndex) => {
    const text = textOf(b.block)
    if (!text) return
    for (const r of RULES) {
      const m = text.match(r.re)
      if (!m) continue
      const id = `${b.id}:${r.kind}:${m[0].toLowerCase()}`
      if (dismissed.has(id)) continue
      out.push({ id, kind: r.kind, blockIndex, blockId: b.id, excerpt: m[0], message: r.message, state: "open" })
    }
  })
  return out
}
