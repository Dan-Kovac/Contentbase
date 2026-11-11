// WCAG 2.2 contrast helpers for the custom accent check (CHN-03).

export const HEX = /^#?([0-9a-f]{6}|[0-9a-f]{3})$/i

export function normaliseHex(input: string): string | null {
  const m = input.trim().match(HEX)
  if (!m) return null
  let h = m[1].toLowerCase()
  if (h.length === 3) h = h.split("").map((c) => c + c).join("")
  return `#${h}`
}

function luminance(hex: string) {
  const n = parseInt(hex.slice(1), 16)
  const ch = [(n >> 16) & 255, (n >> 8) & 255, n & 255].map((v) => {
    const c = v / 255
    return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4
  })
  return 0.2126 * ch[0] + 0.7152 * ch[1] + 0.0722 * ch[2]
}

export function contrast(a: string, b: string) {
  const [l1, l2] = [luminance(a), luminance(b)].sort((x, y) => y - x)
  return (l1 + 0.05) / (l2 + 0.05)
}

export const PAGE_WHITE = "#ffffff"
export const INK = "#0a0a0a"

/**
 * A custom accent must work in both places the platform uses it:
 * - as a mark on the white page (links, nav underline, kicker squares): 3:1 (WCAG 1.4.11)
 * - as a fill with text on it (Follow button, logo tile): 4.5:1 with black or white text (WCAG 1.4.3)
 */
export function checkAccent(hex: string) {
  const onPage = contrast(hex, PAGE_WHITE)
  const withWhite = contrast(hex, PAGE_WHITE)
  const withInk = contrast(hex, INK)
  const textOn = withInk >= withWhite ? INK : PAGE_WHITE
  const textRatio = Math.max(withWhite, withInk)
  return {
    onPage,
    onPagePass: onPage >= 3,
    textOn,
    textRatio,
    textPass: textRatio >= 4.5,
    pass: onPage >= 3 && textRatio >= 4.5,
  }
}

export function ratio(n: number) {
  return `${(Math.floor(n * 10) / 10).toFixed(1)}:1`
}
