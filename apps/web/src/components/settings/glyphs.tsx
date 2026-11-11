// Brand marks drawn locally (lucide-react v1 has no brand icons).
// Monochrome, in currentColor, decorative: always pair with a visible name.

export function YouTubeGlyph({ className = "size-5" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden>
      <rect x="1.5" y="4.5" width="21" height="15" rx="4.5" fill="currentColor" />
      <path d="M10 8.8v6.4l5.5-3.2L10 8.8Z" fill="var(--yt-play, #fff)" />
    </svg>
  )
}

export function TikTokGlyph({ className = "size-5" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="currentColor" aria-hidden>
      <path d="M16.6 5.82A4.28 4.28 0 0 1 15.54 3h-3.09v12.4a2.59 2.59 0 0 1-2.59 2.5 2.6 2.6 0 0 1-2.6-2.6c0-1.72 1.66-3.01 3.37-2.48V9.66c-3.45-.46-6.47 2.22-6.47 5.64A5.7 5.7 0 0 0 9.86 21a5.7 5.7 0 0 0 5.69-5.7V9.01a7.35 7.35 0 0 0 4.3 1.38V7.3s-1.88.09-3.25-1.48Z" />
    </svg>
  )
}

export function InstagramGlyph({ className = "size-5" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
      <rect x="3" y="3" width="18" height="18" rx="5" />
      <circle cx="12" cy="12" r="4" />
      <circle cx="17.5" cy="6.5" r="0.8" fill="currentColor" />
    </svg>
  )
}

/** Letter tile for platforms we don't draw (WordPress, Ghost, Substack). */
export function LetterGlyph({ letter }: { letter: string }) {
  return <span className="text-[13px] font-bold leading-none">{letter}</span>
}
