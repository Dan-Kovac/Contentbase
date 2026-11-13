import { PAIRINGS } from "@/lib/format"
import type { Channel } from "@/lib/types"
import type { BrandKit } from "./scene-frame"

/** The brand kit a video template takes: the publication's own colour, type, name and address. */
export function brandKit(c: Channel): BrandKit {
  return {
    name: c.name,
    accentHex: c.accentHex,
    display: PAIRINGS[c.pairing].display,
    domain: c.customDomain ?? `${c.slug}.homestand.com.au`,
  }
}
