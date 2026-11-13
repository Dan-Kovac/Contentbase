"use client"

import { useLayoutEffect, useRef, useState } from "react"
import { Play, Search, UserRound } from "lucide-react"
import { channelStyle } from "@/lib/format"
import { cn } from "@/lib/utils"
import type { HomeModule, Pairing, Template } from "@/lib/types"

/**
 * A miniature channel homepage for a template, drawn at a fixed design width and
 * scaled to fit its container, so a card, the live preview and sign-up all show
 * the same page. It uses the creator's accent, pairing and logo and real photos
 * from /media. Grounds and text colours are fixed (a channel is light or, for
 * Broadcast, dark), whatever the studio theme.
 */

const DESIGN_WIDTH = 720

const display: React.CSSProperties = {
  fontFamily: "var(--chan-display)",
  fontWeight: "var(--chan-weight)" as unknown as number,
  letterSpacing: "var(--chan-tracking)",
}
const body: React.CSSProperties = { fontFamily: "var(--chan-body)" }

const LEAD = {
  kicker: "AFL · Round 7",
  headline: "The Blues have a centre-bounce problem",
  standfirst: "Carlton lost the centre clearances fourteen to six against Collingwood. The fix may already be on the list.",
  byline: "Sam Doherty · 6 min read",
  photo: "/media/mcg-night.jpg",
  duration: "18:06",
}

const STORIES = [
  { kicker: "AFL", title: "Round 7 in five minutes", photo: "/media/afl-docklands.jpg", duration: "5:12" },
  { kicker: "Draft", title: "Phantom draft, version three", photo: "/media/stadium-day-pitch.jpg", duration: "24:40" },
  { kicker: "AFLW", title: "AFLW finals: who can actually win it", photo: "/media/stadium-lights-blue.jpg", duration: "16:03" },
  { kicker: "AFL", title: "Mailbag: is the sub rule dead?", photo: "/media/stadium-night-stand.jpg", duration: "31:18" },
]

const SHORTS = [
  { title: "Cripps from the boundary", photo: "/media/stadium-lights-blue.jpg" },
  { title: "Every centre clearance, Q3", photo: "/media/afl-docklands.jpg" },
  { title: "The smother of the round", photo: "/media/stadium-night-wide.jpg" },
  { title: "Coburg's nine-clearance mid", photo: "/media/stadium-day-pitch.jpg" },
]

const SECTION_PHOTOS = ["/media/stadium-night-wide.jpg", "/media/broadcast-control-room.jpg", "/media/stadium-crowd-red.jpg", "/media/mcg-night.jpg"]

export const DEFAULT_MODULES: { id: HomeModule; enabled: boolean }[] = [
  { id: "lead", enabled: true },
  { id: "shorts", enabled: true },
  { id: "grid", enabled: true },
  { id: "sections", enabled: true },
]

/** Scales a fixed-width child to the container's width. */
function ScaledFrame({ width, maxHeight, children }: { width: number; maxHeight?: number; children: React.ReactNode }) {
  const outer = useRef<HTMLDivElement>(null)
  const inner = useRef<HTMLDivElement>(null)
  const [box, setBox] = useState<{ scale: number; height: number } | null>(null)

  useLayoutEffect(() => {
    const o = outer.current
    const i = inner.current
    if (!o || !i) return
    const update = () => {
      const scale = o.clientWidth / width
      const h = maxHeight ? Math.min(i.offsetHeight, maxHeight) : i.offsetHeight
      setBox({ scale, height: h * scale })
    }
    update()
    const ro = new ResizeObserver(update)
    ro.observe(o)
    ro.observe(i)
    return () => ro.disconnect()
  }, [width, maxHeight])

  return (
    <div ref={outer} className="relative w-full overflow-hidden" style={box ? { height: box.height } : { aspectRatio: "4 / 3" }}>
      <div
        ref={inner}
        className={cn("absolute left-0 top-0 origin-top-left", !box && "opacity-0")}
        style={{ width, transform: `scale(${box?.scale ?? 0.5})` }}
      >
        {children}
      </div>
    </div>
  )
}

function Photo({ src, className, ratio = "16/9", play, duration, children }: { src: string; className?: string; ratio?: string; play?: "sm" | "lg"; duration?: string; children?: React.ReactNode }) {
  return (
    <div className={cn("relative overflow-hidden bg-neutral-800", className)} style={{ aspectRatio: ratio }}>
      {/* eslint-disable-next-line @next/next/no-img-element -- sample poster in a scaled preview */}
      <img src={src} alt="" className="absolute inset-0 size-full object-cover" loading="lazy" />
      {play && (
        <span className="absolute inset-0 grid place-items-center">
          <span className={cn("grid place-items-center rounded-full bg-black/40 text-white backdrop-blur-sm", play === "lg" ? "size-16" : "size-9")}>
            <Play className={cn("ml-0.5 fill-current", play === "lg" ? "size-7" : "size-4")} aria-hidden />
          </span>
        </span>
      )}
      {duration && <span className="absolute bottom-2 right-2 rounded-[2px] bg-black/80 px-1.5 py-0.5 font-mono text-[11px] text-white">{duration}</span>}
      {children}
    </div>
  )
}

function Kicker({ children, dark }: { children: React.ReactNode; dark?: boolean }) {
  return (
    <span className={cn("flex items-center gap-2 text-[11px] font-bold uppercase tracking-[1.2px]", dark ? "text-white" : "text-neutral-950")}>
      <span className="size-[7px] shrink-0" style={{ background: "var(--chan)" }} aria-hidden />
      {children}
    </span>
  )
}

function Logo({ name, logoUrl, dark }: { name: string; logoUrl?: string | null; dark?: boolean }) {
  if (logoUrl)
    return (
      // eslint-disable-next-line @next/next/no-img-element -- client-side preview of the chosen file
      <img src={logoUrl} alt="" className="h-7 w-auto max-w-[200px] object-contain" />
    )
  return (
    <span className="flex min-w-0 items-center gap-2">
      <span className="grid size-7 shrink-0 place-items-center rounded-[4px] text-[13px] font-extrabold" style={{ background: "var(--chan)", color: "var(--chan-on)" }}>
        {initials(name)}
      </span>
      <span className={cn("truncate text-[24px] leading-none", dark ? "text-white" : "text-neutral-950")} style={display}>
        {name}
      </span>
    </span>
  )
}

function initials(name: string) {
  const parts = name.trim().split(/\s+/).filter(Boolean)
  return (parts.length > 1 ? parts[0][0] + parts[1][0] : (parts[0] ?? "H").slice(0, 2)).toUpperCase()
}

function Masthead({ name, logoUrl, nav, dark }: { name: string; logoUrl?: string | null; nav: string[]; dark: boolean }) {
  return (
    <header className={cn("border-b px-8", dark ? "border-white/10 bg-neutral-950" : "border-neutral-200 bg-white")}>
      <div className="flex h-16 items-center gap-4">
        <Logo name={name} logoUrl={logoUrl} dark={dark} />
        <span className={cn("ml-auto flex items-center gap-4", dark ? "text-white/70" : "text-neutral-500")}>
          <Search className="size-[18px]" aria-hidden />
          <UserRound className="size-[18px]" aria-hidden />
          <span className="rounded-full px-4 py-1.5 text-[13px] font-semibold" style={{ background: "var(--chan)", color: "var(--chan-on)" }}>
            Follow
          </span>
        </span>
      </div>
      <nav className="-mb-px flex gap-6 overflow-hidden text-[14px] font-medium">
        {nav.map((label, i) => (
          <span
            key={`${label}-${i}`}
            className={cn("whitespace-nowrap border-b-2 pb-2.5", i === 0 ? (dark ? "text-white" : "text-neutral-950") : cn("border-transparent", dark ? "text-white/55" : "text-neutral-500"))}
            style={i === 0 ? { borderColor: "var(--chan)" } : undefined}
          >
            {label || "Untitled"}
          </span>
        ))}
      </nav>
    </header>
  )
}

function SponsorBand({ dark }: { dark: boolean }) {
  return (
    <div className={cn("flex items-center justify-between gap-4 border-t-2 pt-2.5 text-[13px]", dark ? "text-white/70" : "text-neutral-500")} style={{ borderColor: "#0f3d2e" }}>
      <span className="flex items-center gap-2">
        <span className="text-[11px] font-bold uppercase tracking-[1px]">Presented by</span>
        <span className="grid size-[18px] place-items-center rounded-[4px] bg-[#0f3d2e] text-[8px] font-bold text-white">SC</span>
        <span className={cn("font-semibold", dark ? "text-white" : "text-neutral-950")}>Southern Cross Utes</span>
      </span>
      <span>Built for the drive to every away game.</span>
    </div>
  )
}

/** The one sponsored story: the same box as the story cards beside it. */
function SponsoredStory() {
  return (
    <div className="flex flex-col gap-2">
      <div className="relative flex flex-col justify-between overflow-hidden rounded-[6px] bg-[#111111] p-3 text-white" style={{ aspectRatio: "16/9" }}>
        <span className="grid size-6 place-items-center rounded-[4px] bg-white text-[9px] font-bold text-[#111111]">KB</span>
        <span className="text-[17px] font-extrabold leading-[1.05]">Kick Boots Co.</span>
        <span className="absolute bottom-2 right-2 rounded-[2px] bg-black/70 px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-[0.8px]">Sponsored</span>
      </div>
      <span className="text-[11px] font-bold uppercase tracking-[1px] text-neutral-500">Sponsored · Kick Boots Co.</span>
      <p className="text-[19px] leading-[1.12]" style={display}>
        Grip for the wet ones.
      </p>
    </div>
  )
}

function SponsoredShort() {
  return (
    <div className="flex flex-col gap-2">
      <div className="relative overflow-hidden rounded-[6px] bg-[#111111]" style={{ aspectRatio: "9/16" }}>
        <span className="absolute bottom-12 left-3 right-3 text-[14px] font-extrabold leading-[1.1] text-white">Grip for the wet ones.</span>
        <span className="absolute left-2 top-2 rounded-[2px] bg-black/70 px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-[0.8px] text-white">Sponsored</span>
        <span className="absolute bottom-3 left-3 rounded-full bg-white px-2.5 py-1 text-[10px] font-bold text-[#111111]">Shop the range</span>
      </div>
      <p className="text-[13px] font-semibold leading-[17px]">Grip for the wet ones.</p>
    </div>
  )
}

function Editorial({ modules, sectionLabels }: { modules: HomeModule[]; sectionLabels: string[] }) {
  return (
    <div className="grid gap-10 px-8 py-8">
      {modules.map((m) => {
        switch (m) {
          case "lead":
            return (
              <article key="lead" className="grid grid-cols-[1.5fr_1fr] items-center gap-7">
                <Photo src={LEAD.photo} className="rounded-[6px]" play="lg" duration={LEAD.duration} />
                <div className="flex flex-col gap-3">
                  <Kicker>{LEAD.kicker}</Kicker>
                  <h3 className="text-[30px] leading-[1.05] [text-wrap:balance]" style={display}>
                    {LEAD.headline}
                  </h3>
                  <p className="text-[15px] leading-[23px] text-neutral-600" style={body}>
                    {LEAD.standfirst}
                  </p>
                  <p className="text-[12px] text-neutral-500">{LEAD.byline}</p>
                  <SponsorBand dark={false} />
                </div>
              </article>
            )
          case "grid":
            return (
              <section key="grid" className="grid gap-4">
                <h4 className="border-t border-neutral-950 pt-3 text-[20px] leading-none" style={display}>
                  Latest stories
                </h4>
                <div className="grid grid-cols-3 gap-5">
                  {STORIES.slice(0, 2).map((s) => (
                    <div key={s.title} className="flex flex-col gap-2">
                      <Photo src={s.photo} className="rounded-[6px]" />
                      <Kicker>{s.kicker}</Kicker>
                      <p className="text-[19px] leading-[1.12]" style={display}>
                        {s.title}
                      </p>
                    </div>
                  ))}
                  <SponsoredStory />
                </div>
              </section>
            )
          case "shorts":
            return (
              <section key="shorts" className="grid gap-4">
                <h4 className="border-t border-neutral-950 pt-3 text-[20px] leading-none" style={display}>
                  Shorts
                </h4>
                <div className="grid grid-cols-5 gap-3">
                  {SHORTS.slice(0, 3).map((s) => (
                    <div key={s.title} className="flex flex-col gap-2">
                      <Photo src={s.photo} ratio="9/16" className="rounded-[6px]" />
                      <p className="text-[13px] font-semibold leading-[17px]">{s.title}</p>
                    </div>
                  ))}
                  <SponsoredShort />
                  <div className="flex flex-col gap-2">
                    <Photo src={SHORTS[3].photo} ratio="9/16" className="rounded-[6px]" />
                    <p className="text-[13px] font-semibold leading-[17px]">{SHORTS[3].title}</p>
                  </div>
                </div>
              </section>
            )
          case "sections":
            return (
              <div key="sections" className="grid grid-cols-2 gap-8">
                {(sectionLabels.length ? sectionLabels : ["AFL", "AFLW"]).slice(0, 2).map((label, si) => (
                  <section key={label} className="grid content-start gap-3">
                    <div className="flex items-center justify-between border-t border-neutral-950 pt-3">
                      <Kicker>{label}</Kicker>
                      <span className="text-[12px] font-medium underline underline-offset-2">See all</span>
                    </div>
                    {STORIES.slice(si, si + 3).map((s) => (
                      <div key={s.title} className="flex items-center gap-3 border-b border-neutral-200 pb-3 last:border-b-0">
                        <Photo src={s.photo} className="w-24 shrink-0 rounded-[4px]" />
                        <p className="text-[15px] leading-[1.15]" style={display}>
                          {s.title}
                        </p>
                      </div>
                    ))}
                  </section>
                ))}
              </div>
            )
        }
      })}
    </div>
  )
}

function Rail({ title, items, start = 0 }: { title: string; items: typeof STORIES; start?: number }) {
  return (
    <section className="grid gap-3">
      <div className="flex items-center justify-between px-8">
        <h4 className="text-[20px] leading-none text-white" style={display}>
          {title}
        </h4>
        <span className="text-[12px] font-medium text-white/60">See all</span>
      </div>
      <div className="flex gap-3 overflow-hidden pl-8">
        {[...items.slice(start), ...items.slice(0, start)].map((s) => (
          <div key={s.title} className="flex w-[228px] shrink-0 flex-col gap-2">
            <Photo src={s.photo} className="rounded-[6px]" play="sm" duration={s.duration} />
            <p className="text-[15px] leading-[1.15] text-white" style={display}>
              {s.title}
            </p>
          </div>
        ))}
      </div>
    </section>
  )
}

function Broadcast({ modules, sectionLabels }: { modules: HomeModule[]; sectionLabels: string[] }) {
  return (
    <div className={cn("grid gap-9 pb-9", modules[0] !== "lead" && "pt-8")}>
      {modules.map((m) => {
        switch (m) {
          case "lead":
            return (
              <article key="lead" className="relative">
                <Photo src={LEAD.photo} ratio="16/8" className="w-full">
                  <div className="absolute inset-0 bg-gradient-to-t from-neutral-950 via-neutral-950/50 to-transparent" />
                  <div className="absolute inset-x-0 bottom-0 flex max-w-[540px] flex-col gap-3 p-8">
                    <span className="w-fit rounded-[2px] px-2 py-1 text-[11px] font-bold uppercase tracking-[1px]" style={{ background: "var(--chan)", color: "var(--chan-on)" }}>
                      {LEAD.kicker}
                    </span>
                    <h3 className="text-[40px] leading-[1.02] text-white [text-wrap:balance]" style={display}>
                      {LEAD.headline}
                    </h3>
                    <span className="flex items-center gap-3">
                      <span className="flex items-center gap-2 rounded-full px-4 py-2 text-[13px] font-semibold" style={{ background: "var(--chan)", color: "var(--chan-on)" }}>
                        <Play className="size-3.5 fill-current" aria-hidden /> Watch · {LEAD.duration}
                      </span>
                      <span className="text-[12px] text-white/70">{LEAD.byline}</span>
                    </span>
                    <SponsorBand dark />
                  </div>
                </Photo>
              </article>
            )
          case "grid":
            return <Rail key="grid" title="Latest videos" items={STORIES} />
          case "shorts":
            return (
              <section key="shorts" className="grid gap-3">
                <h4 className="px-8 text-[20px] leading-none text-white" style={display}>
                  Shorts
                </h4>
                <div className="flex gap-3 overflow-hidden pl-8 text-white">
                  {SHORTS.slice(0, 2).map((s) => (
                    <div key={s.title} className="flex w-[132px] shrink-0 flex-col gap-2">
                      <Photo src={s.photo} ratio="9/16" className="rounded-[6px]" />
                      <p className="text-[13px] font-semibold leading-[17px]">{s.title}</p>
                    </div>
                  ))}
                  <div className="w-[132px] shrink-0">
                    <SponsoredShort />
                  </div>
                  {SHORTS.slice(2).map((s) => (
                    <div key={s.title} className="flex w-[132px] shrink-0 flex-col gap-2">
                      <Photo src={s.photo} ratio="9/16" className="rounded-[6px]" />
                      <p className="text-[13px] font-semibold leading-[17px]">{s.title}</p>
                    </div>
                  ))}
                </div>
              </section>
            )
          case "sections":
            return (
              <div key="sections" className="grid gap-9">
                {(sectionLabels.length ? sectionLabels : ["AFL", "AFLW"]).slice(0, 2).map((label, si) => (
                  <Rail key={label} title={label} items={STORIES.map((s, i) => ({ ...s, photo: SECTION_PHOTOS[(i + si) % SECTION_PHOTOS.length] }))} start={si + 1} />
                ))}
              </div>
            )
        }
      })}
    </div>
  )
}

export function TemplatePreview({
  template,
  accentHex,
  pairing,
  name,
  logoUrl,
  iconUrl,
  nav = ["Latest", "AFL", "AFLW", "Shorts", "About"],
  modules = DEFAULT_MODULES,
  sectionLabels = ["AFL", "AFLW"],
  domain,
  maxHeight,
  className,
}: {
  template: Template
  accentHex: string
  pairing: Pairing
  name: string
  logoUrl?: string | null
  iconUrl?: string | null
  nav?: string[]
  modules?: { id: HomeModule; enabled: boolean }[]
  sectionLabels?: string[]
  /** Show a browser bar with this address. */
  domain?: string
  /** Crop the page at this height (design pixels) with a fade. */
  maxHeight?: number
  className?: string
}) {
  const dark = template === "broadcast"
  const on = modules.filter((m) => m.enabled).map((m) => m.id)
  const title = name.trim() || "Your channel"

  return (
    <div className={cn("overflow-hidden rounded-lg border [color-scheme:light]", dark ? "border-neutral-800 bg-neutral-950" : "bg-white", className)}>
      {domain && (
        <div className="flex items-center gap-2 border-b border-neutral-200 bg-neutral-100 px-3 py-2">
          <span className="flex gap-1" aria-hidden>
            <span className="size-2 rounded-full bg-neutral-300" />
            <span className="size-2 rounded-full bg-neutral-300" />
            <span className="size-2 rounded-full bg-neutral-300" />
          </span>
          <span className="mx-auto flex min-w-0 items-center gap-1.5 rounded bg-white px-3 py-0.5 text-[11px] text-neutral-600">
            {iconUrl ? (
              // eslint-disable-next-line @next/next/no-img-element -- client-side preview of the chosen file
              <img src={iconUrl} alt="" className="size-3 shrink-0 rounded-[2px] object-cover" />
            ) : (
              <span className="size-3 shrink-0 rounded-[2px]" style={{ background: accentHex }} aria-hidden />
            )}
            <span className="truncate font-mono">{domain}</span>
          </span>
        </div>
      )}
      <ScaledFrame width={DESIGN_WIDTH} maxHeight={maxHeight}>
        <div style={channelStyle(accentHex, pairing)} className={cn("relative", dark ? "bg-neutral-950 text-white" : "bg-white text-neutral-950")}>
          <Masthead name={title} logoUrl={logoUrl} nav={nav} dark={dark} />
          {on.length === 0 ? (
            <p className={cn("py-24 text-center text-[15px]", dark ? "text-white/60" : "text-neutral-500")}>Turn on at least one module to fill your homepage.</p>
          ) : dark ? (
            <Broadcast modules={on} sectionLabels={sectionLabels} />
          ) : (
            <Editorial modules={on} sectionLabels={sectionLabels} />
          )}
          {!maxHeight && (
            <footer className={cn("flex justify-between border-t px-8 py-5 text-[12px]", dark ? "border-white/10 text-white/50" : "border-neutral-200 text-neutral-500")}>
              <span>© 2026 {title}</span>
              <span>Powered by Homestand</span>
            </footer>
          )}
          {maxHeight && (
            <div
              className={cn("pointer-events-none absolute inset-x-0 h-24 bg-gradient-to-b from-transparent", dark ? "to-neutral-950" : "to-white")}
              style={{ top: maxHeight - 96 }}
              aria-hidden
            />
          )}
        </div>
      </ScaledFrame>
    </div>
  )
}
