"use client"

import { Globe, Play } from "lucide-react"
import { channelStyle } from "@/lib/format"
import type { AccentName, Pairing, Template } from "@/lib/types"
import { cn } from "@/lib/utils"

const LEAD = {
  kicker: "AFL",
  headline: "The Blues have a centre-bounce problem",
  standfirst: "Three weeks ago the stoppage numbers looked fine. They no longer do, and the fix may already be on the list.",
  byline: "Sam Doherty · 6 min read",
  duration: "18:06",
}

function initials(name: string) {
  const parts = name.trim().split(/\s+/).filter(Boolean)
  return (parts.length > 1 ? parts[0][0] + parts[1][0] : (parts[0] ?? "H").slice(0, 2)).toUpperCase()
}

const headlineStyle: React.CSSProperties = {
  fontFamily: "var(--chan-display)",
  fontWeight: "var(--chan-weight)" as unknown as number,
  letterSpacing: "var(--chan-tracking)",
}

function Poster({ className, children }: { className?: string; children?: React.ReactNode }) {
  return (
    <div className={cn("relative aspect-video w-full overflow-hidden rounded-[6px] bg-[#1c4fb8]", className)}>
      <svg viewBox="0 0 160 90" preserveAspectRatio="xMidYMax slice" className="absolute inset-0 size-full" aria-hidden>
        <rect x="0" y="70" width="160" height="20" fill="#fff" opacity="0.08" />
        <rect x="20" y="56" width="120" height="14" fill="#fff" opacity="0.08" />
        <rect x="40" y="42" width="80" height="14" fill="#fff" opacity="0.06" />
      </svg>
      <span className="absolute left-1/2 top-1/2 grid size-10 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full bg-black/35 text-white">
        <Play className="ml-0.5 size-4 fill-current" aria-hidden />
      </span>
      <span className="absolute bottom-2 right-2 rounded-[2px] bg-black/80 px-1.5 py-0.5 font-mono text-[11px] text-white">{LEAD.duration}</span>
      {children}
    </div>
  )
}

/** Live preview of a channel's masthead and lead story for the chosen look. */
export function ChannelPreview({
  name,
  subdomain,
  template,
  accent,
  pairing,
}: {
  name: string
  subdomain: string
  template: Template
  accent: AccentName
  pairing: Pairing
}) {
  const display = name.trim() || "Your channel"
  const nav = ["Latest", "AFL", "AFLW", "Shorts"]
  const logo = (
    <span className="grid size-7 shrink-0 place-items-center rounded-[4px] bg-[var(--chan)] text-[12px] font-extrabold text-[var(--chan-on)]">
      {initials(display)}
    </span>
  )
  const title = (
    <span className="truncate text-[18px] leading-none" style={headlineStyle}>
      {display}
    </span>
  )
  const follow = <span className="shrink-0 rounded-full bg-[var(--chan)] px-3 py-1 text-[12px] font-semibold text-[var(--chan-on)]">Follow</span>

  return (
    <figure className="overflow-hidden rounded-lg border border-white/10 bg-brand-grey" aria-label={`Preview of ${display}`}>
      <div className="flex items-center gap-2 px-3 py-2">
        <span className="flex gap-1" aria-hidden>
          <span className="size-2 rounded-full bg-white/20" />
          <span className="size-2 rounded-full bg-white/20" />
          <span className="size-2 rounded-full bg-white/20" />
        </span>
        <span className="flex min-w-0 flex-1 items-center gap-1.5 rounded-[4px] bg-black/40 px-2 py-0.5 text-[11px] text-brand-muted">
          <Globe className="size-3 shrink-0" aria-hidden />
          <span className="truncate">{(subdomain || "yourchannel") + ".homestand.com.au"}</span>
        </span>
      </div>
      <div className="bg-white text-[#0a0a0a]" style={channelStyle(accent, pairing)}>
        {template === "editorial" && (
          <>
            <div className="flex items-center gap-2.5 border-b border-[#e3e3e3] px-4 py-3">
              {logo}
              {title}
              <nav className="ml-3 hidden gap-3 text-[12px] font-medium text-[#5c5c5c] sm:flex" aria-hidden>
                {nav.map((n, i) => (
                  <span key={n} className={i === 0 ? "text-[#0a0a0a] underline decoration-[var(--chan)] decoration-2 underline-offset-[14px]" : ""}>
                    {n}
                  </span>
                ))}
              </nav>
              <span className="ml-auto">{follow}</span>
            </div>
            <div className="grid gap-4 p-4 sm:grid-cols-[1.3fr_1fr]">
              <Poster className="bg-[var(--chan)]" />
              <div className="flex flex-col justify-center gap-2">
                <span className="kicker text-[#0a0a0a]">{LEAD.kicker}</span>
                <p className="text-[22px] leading-[1.05]" style={headlineStyle}>
                  {LEAD.headline}
                </p>
                <p className="line-clamp-3 text-[13px] leading-[19px] text-[#5c5c5c]" style={{ fontFamily: "var(--chan-body)" }}>
                  {LEAD.standfirst}
                </p>
                <p className="text-[11px] text-[#5c5c5c]">{LEAD.byline}</p>
              </div>
            </div>
          </>
        )}
        {template === "broadcast" && (
          <>
            <div className="flex items-center gap-2.5 bg-[#0a0a0a] px-4 py-3 text-white">
              {logo}
              {title}
              <nav className="ml-3 hidden gap-3 text-[12px] font-medium text-[#a3a3a3] sm:flex" aria-hidden>
                {nav.map((n, i) => (
                  <span key={n} className={i === 0 ? "text-white" : ""}>
                    {n}
                  </span>
                ))}
              </nav>
              <span className="ml-auto">{follow}</span>
            </div>
            <div className="p-4">
              <Poster className="rounded-[6px] bg-[var(--chan)]">
                <div className="absolute inset-x-0 bottom-0 flex flex-col gap-1.5 bg-gradient-to-t from-black/85 to-transparent p-4 pr-16 text-white">
                  <span className="w-fit bg-[var(--chan)] px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-[1px] text-[var(--chan-on)]">{LEAD.kicker}</span>
                  <p className="text-[22px] leading-[1.05]" style={headlineStyle}>
                    {LEAD.headline}
                  </p>
                </div>
              </Poster>
              <p className="mt-3 line-clamp-2 text-[13px] leading-[19px] text-[#5c5c5c]" style={{ fontFamily: "var(--chan-body)" }}>
                {LEAD.standfirst}
              </p>
            </div>
          </>
        )}
        {template === "minimal" && (
          <>
            <div className="flex flex-col items-center gap-2 border-b border-[#e3e3e3] px-4 pb-3 pt-5">
              <span className="text-[24px] leading-none" style={headlineStyle}>
                {display}
              </span>
              <nav className="flex gap-4 text-[12px] font-medium text-[#5c5c5c]" aria-hidden>
                {nav.map((n, i) => (
                  <span key={n} className={i === 0 ? "text-[#0a0a0a] underline decoration-[var(--chan)] decoration-2 underline-offset-[10px]" : ""}>
                    {n}
                  </span>
                ))}
              </nav>
            </div>
            <div className="mx-auto flex max-w-[460px] flex-col gap-3 p-5 text-center">
              <span className="kicker mx-auto text-[#0a0a0a]">{LEAD.kicker}</span>
              <p className="text-[24px] leading-[1.05]" style={headlineStyle}>
                {LEAD.headline}
              </p>
              <p className="line-clamp-2 text-[13px] leading-[19px] text-[#5c5c5c]" style={{ fontFamily: "var(--chan-body)" }}>
                {LEAD.standfirst}
              </p>
              <Poster className="bg-[var(--chan)]" />
            </div>
          </>
        )}
      </div>
    </figure>
  )
}
