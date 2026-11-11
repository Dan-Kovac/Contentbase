"use client"

import { Play, Search, UserRound } from "lucide-react"
import { cn } from "@/lib/utils"
import type { HomeModule, Template } from "@/lib/types"

export type PreviewNavItem = { key: string; label: string }

const display: React.CSSProperties = {
  fontFamily: "var(--chan-display)",
  fontWeight: "var(--chan-weight)" as unknown as number,
  letterSpacing: "var(--chan-tracking)",
}
const body: React.CSSProperties = { fontFamily: "var(--chan-body)" }

const TONES = ["#1c4fb8", "#0e5a3a", "#8a1c2c", "#5b2a86", "#1b2a4a", "#8a5300", "#334155"]

function Thumb({ tone, ratio = "16/9", play = false, className }: { tone?: string; ratio?: string; play?: boolean; className?: string }) {
  return (
    <div className={cn("relative overflow-hidden rounded-[4px]", className)} style={{ aspectRatio: ratio, background: tone ?? "var(--chan)" }}>
      <svg viewBox="0 0 160 90" preserveAspectRatio="xMidYMax slice" className="absolute inset-0 size-full" aria-hidden>
        <rect x="0" y="70" width="160" height="20" fill="#fff" opacity="0.1" />
        <rect x="20" y="56" width="120" height="14" fill="#fff" opacity="0.08" />
        <rect x="40" y="42" width="80" height="14" fill="#fff" opacity="0.06" />
      </svg>
      {play && (
        <span className="absolute inset-0 grid place-items-center">
          <span className="grid size-8 place-items-center rounded-full bg-black/35 text-white">
            <Play className="ml-0.5 size-3.5 fill-current" aria-hidden />
          </span>
        </span>
      )}
    </div>
  )
}

function Kicker({ children }: { children: React.ReactNode }) {
  return (
    <span className="flex items-center gap-1.5 text-[9px] font-bold uppercase tracking-[0.9px] text-neutral-950">
      <span className="size-[5px] shrink-0" style={{ background: "var(--chan)" }} aria-hidden />
      {children}
    </span>
  )
}

/**
 * A scaled-down channel home, built from the same variables a real channel
 * root carries (--chan, --chan-on, --chan-display, --chan-body …).
 */
export function ChannelPreview({
  name,
  logoUrl,
  template,
  modules,
  nav,
  sectionLabels,
  style,
  domain,
}: {
  name: string
  logoUrl?: string | null
  template: Template
  modules: { id: HomeModule; enabled: boolean }[]
  nav: PreviewNavItem[]
  sectionLabels: string[]
  style: React.CSSProperties
  domain: string
}) {
  const dark = template === "broadcast"
  const centred = template === "minimal"
  const on = modules.filter((m) => m.enabled)

  const logo = logoUrl ? (
    // eslint-disable-next-line @next/next/no-img-element
    <img src={logoUrl} alt={`${name} logo`} className="h-[22px] w-auto max-w-[140px] object-contain" />
  ) : (
    <span className="flex min-w-0 items-center gap-1.5">
      <span className="size-[18px] shrink-0 rounded-[4px]" style={{ background: "var(--chan)" }} aria-hidden />
      <span className="truncate text-[17px] leading-none" style={display}>
        {name || "Your channel"}
      </span>
    </span>
  )

  return (
    <div style={style} className="overflow-hidden rounded-lg border bg-white text-neutral-950 [color-scheme:light]">
      <div className="flex items-center gap-2 border-b bg-neutral-100 px-3 py-2">
        <span className="flex gap-1" aria-hidden>
          <span className="size-2 rounded-full bg-neutral-300" />
          <span className="size-2 rounded-full bg-neutral-300" />
          <span className="size-2 rounded-full bg-neutral-300" />
        </span>
        <span className="mx-auto truncate rounded bg-white px-3 py-0.5 font-mono text-[10px] text-neutral-600">{domain}</span>
      </div>

      {/* Masthead */}
      <div className={cn("border-b", dark ? "border-neutral-800 bg-neutral-950 text-white" : "bg-white")}>
        <div className={cn("flex items-center gap-2 px-4 pt-3", centred ? "justify-center" : "justify-between")}>
          {logo}
          {!centred && (
            <span className="flex shrink-0 items-center gap-1.5">
              <Search className="size-3.5 opacity-70" aria-hidden />
              <UserRound className="size-3.5 opacity-70" aria-hidden />
              <span className="rounded-full px-2.5 py-1 text-[10px] font-bold" style={{ background: "var(--chan)", color: "var(--chan-on)" }}>
                Follow
              </span>
            </span>
          )}
        </div>
        <nav aria-label="Preview navigation" className={cn("flex gap-3 overflow-hidden px-4 pt-2 text-[11px] font-medium", centred && "justify-center")}>
          {nav.map((n, i) => (
            <span
              key={n.key}
              className={cn("whitespace-nowrap border-b-2 pb-1.5", i === 0 ? (dark ? "text-white" : "text-neutral-950") : cn("border-transparent", dark ? "text-neutral-400" : "text-neutral-500"))}
              style={i === 0 ? { borderColor: "var(--chan)" } : undefined}
            >
              {n.label || "Untitled"}
            </span>
          ))}
        </nav>
      </div>

      <div className="grid gap-4 px-4 py-4">
        {on.length === 0 && <p className="py-10 text-center text-xs text-neutral-500">Turn on at least one module to fill your homepage.</p>}
        {on.map((m) => {
          switch (m.id) {
            case "lead":
              if (template === "broadcast")
                return (
                  <div key="lead" className="relative overflow-hidden rounded-[4px]">
                    <Thumb play />
                    <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/85 to-transparent p-3 pt-10 text-white">
                      <span className="mb-1 inline-block rounded-[2px] px-1.5 py-0.5 text-[8px] font-bold uppercase tracking-[0.8px]" style={{ background: "var(--chan)", color: "var(--chan-on)" }}>
                        AFL · Round 7
                      </span>
                      <h3 className="text-[19px] leading-[1.05] [text-wrap:balance]" style={display}>
                        The Blues have a centre-bounce problem
                      </h3>
                    </div>
                  </div>
                )
              return (
                <div key="lead" className={cn("grid gap-2", centred && "text-center")}>
                  {centred && (
                    <>
                      <div className="flex justify-center">
                        <Kicker>AFL · Round 7</Kicker>
                      </div>
                      <h3 className="text-[21px] leading-[1.05] [text-wrap:balance]" style={display}>
                        The Blues have a centre-bounce problem
                      </h3>
                    </>
                  )}
                  <Thumb play />
                  {!centred && (
                    <>
                      <Kicker>AFL · Round 7</Kicker>
                      <h3 className="text-[21px] leading-[1.05] [text-wrap:balance]" style={display}>
                        The Blues have a centre-bounce problem
                      </h3>
                    </>
                  )}
                  <p className="text-[11px] leading-[1.45] text-neutral-600" style={body}>
                    Carlton lost the centre clearances fourteen to six against Collingwood. The fix may already be on the list.
                  </p>
                </div>
              )
            case "shorts":
              return (
                <div key="shorts" className="grid gap-1.5">
                  <span className="text-[11px] font-bold" style={display}>
                    Shorts
                  </span>
                  <div className="grid grid-cols-4 gap-1.5">
                    {[0, 1, 2].map((i) => (
                      <Thumb key={i} tone={TONES[i + 3]} ratio="9/16" />
                    ))}
                    <div className="flex flex-col gap-0.5 rounded-[2px] border bg-neutral-50 p-1">
                      <span className="text-[6px] font-bold uppercase tracking-[0.6px] text-neutral-500">Sponsored</span>
                      <div className="flex-1 rounded-[2px] bg-neutral-200" />
                    </div>
                  </div>
                </div>
              )
            case "sponsor":
              return (
                <div key="sponsor" className="rounded-[2px] border bg-neutral-50 px-2 pb-2 pt-1">
                  <span className="text-[7px] font-bold uppercase tracking-[0.8px] text-neutral-500">Presented by</span>
                  <div className="mt-1 grid place-items-center rounded-[2px] bg-neutral-200 text-[9px] font-medium text-neutral-500" style={{ aspectRatio: "970/250" }}>
                    970 × 250
                  </div>
                </div>
              )
            case "grid":
              return (
                <div key="grid" className="grid gap-1.5">
                  <span className="text-[11px] font-bold" style={display}>
                    Latest
                  </span>
                  <div className="grid grid-cols-2 gap-x-2 gap-y-2.5">
                    {["Round 7 in five minutes", "Phantom draft, version three", "AFLW finals: who can actually win it", "Mailbag #43: is the sub rule dead?"].map((t, i) => (
                      <div key={t} className="grid gap-1">
                        <Thumb tone={TONES[i]} />
                        <span className="text-[10.5px] leading-[1.2]" style={display}>
                          {t}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )
            case "sections":
              return (
                <div key="sections" className="grid gap-3">
                  {sectionLabels.slice(0, 2).map((label, si) => (
                    <div key={label} className="grid gap-1.5">
                      <div className="flex items-center justify-between">
                        <Kicker>{label}</Kicker>
                        <span className="text-[9px] font-medium underline underline-offset-2">See all</span>
                      </div>
                      <div className="grid grid-cols-3 gap-1.5">
                        {[0, 1, 2].map((i) => (
                          <Thumb key={i} tone={TONES[(i + si * 3 + 2) % TONES.length]} />
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )
          }
        })}
      </div>
    </div>
  )
}
