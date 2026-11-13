// Class strings shared by channel pages and by anything that must match them (sponsor units,
// previews). No data imports, so client components can use it without pulling in sample data.

/** Display face for the channel's pairing (weight and tracking come from the pairing too). */
export const DISPLAY =
  "font-[family-name:var(--chan-display)] [font-weight:var(--chan-weight)] tracking-[var(--chan-tracking)]"
/** Reading face: Source Serif 4 for Grandstand and Minimal, Archivo for Broadcast. */
export const BODY = "font-[family-name:var(--chan-body)]"
/** Accent-underlined link that stays readable whatever the accent (pale accents fail as text). */
export const ACCENT_LINK =
  "underline decoration-[var(--chan)] decoration-2 underline-offset-4 hover:decoration-foreground"

/**
 * The three widths on channel pages. Container: grids, player with chapters. Wide: article
 * headline and hero. Column: body text and everything that sits in it (half-time break, key
 * points, transcript, call to action).
 */
export const CONTAINER = "mx-auto w-full max-w-[1280px] px-4 md:px-8"
export const WIDE = "mx-auto w-full max-w-[920px]"
export const COLUMN = "mx-auto w-full max-w-[68ch]"

/** Headline sizes for grid story cards. A sponsored story uses the same map, so it can't drift. */
export const STORY_HEADLINE = {
  sm: "text-[19px] leading-[23px]",
  md: "text-[22px] leading-[26px] md:text-[24px] md:leading-[28px]",
  lg: "text-[28px] leading-[32px] md:text-[36px] md:leading-[40px]",
} as const
export type StorySize = keyof typeof STORY_HEADLINE

export const STORY_STANDFIRST = "text-[16px] leading-[24px] text-foreground/75 md:text-[17px] md:leading-[26px]"

/** Broadcast rail cards: the width every card in a rail shares. */
export const RAIL_CARD = "w-[78vw] max-w-[400px] shrink-0 snap-start sm:w-[340px] lg:w-[400px]"
export const RAIL_HEADLINE = "text-[24px] leading-[26px] md:text-[28px] md:leading-[30px]"
