"use client"

import { useMemo, useRef, useState } from "react"
import { AlertCircle, ArrowDown, ArrowUp, Check, GripVertical, ImageUp, Plus, Trash2 } from "lucide-react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { PAIRINGS, channelStyle } from "@/lib/format"
import { cn } from "@/lib/utils"
import type { Channel, ChannelCta, HomeModule, Pairing, Template } from "@/lib/types"
import { FixedNote, Panel, Section, Tag } from "./section"
import { AccentField, accentState } from "./accent-field"
import { TemplatePreview } from "./template-preview"

const MODULE_INFO: Record<HomeModule, { label: string; description: string; ad?: boolean }> = {
  lead: { label: "Lead story", description: "Your latest or pinned video, full width, with its headline. Carries one “Presented by” credit.", ad: true },
  shorts: { label: "Shorts row", description: "Your YouTube Shorts and clips. Carries one sponsored short.", ad: true },
  grid: { label: "Article grid", description: "Your newest videos and articles, newest first. Carries one sponsored story when there are no section rows.", ad: true },
  sections: { label: "Section rows", description: "One row for each section. The first row carries one sponsored story, the size of the stories beside it.", ad: true },
}

const TEMPLATES: { id: Template; label: string; description: string }[] = [
  { id: "editorial", label: "Editorial", description: "A white magazine. A photo lead with its headline beside it, then a grid of stories." },
  { id: "broadcast", label: "Broadcast", description: "Dark and video-led. A full-bleed hero, then rails of videos like a streaming app." },
]

const MAX_NAV = 8

/** Button presets for the call to action. The creator can also write their own. */
export const CTA_PRESETS = ["Join free", "Follow", "Subscribe", "Become a member"]

type NavItem = { key: string; label: string; href: string }

function FileButton({
  id,
  label,
  onFile,
  hasFile,
  onClear,
}: {
  id: string
  label: string
  onFile: (f: File) => void
  hasFile: boolean
  onClear: () => void
}) {
  const ref = useRef<HTMLInputElement>(null)
  return (
    <div className="flex flex-wrap gap-2">
      <input
        ref={ref}
        id={id}
        type="file"
        accept=".svg,.png,image/svg+xml,image/png"
        className="sr-only"
        onChange={(e) => {
          const f = e.target.files?.[0]
          if (f) onFile(f)
          e.target.value = ""
        }}
      />
      <Button type="button" variant="outline" size="sm" onClick={() => ref.current?.click()}>
        <ImageUp /> {hasFile ? "Replace" : label}
      </Button>
      {hasFile && (
        <Button type="button" variant="ghost" size="sm" onClick={onClear}>
          Remove
        </Button>
      )}
    </div>
  )
}

function fileError(f: File) {
  const ok = f.type === "image/svg+xml" || f.type === "image/png" || /\.(svg|png)$/i.test(f.name)
  if (!ok) return `${f.name} isn't an SVG or PNG. Export your logo as SVG (best) or PNG and try again.`
  if (f.size > 2 * 1024 * 1024) return `${f.name} is over 2 MB. Export it smaller or as an SVG.`
  return null
}

export function DesignEditor({ channel }: { channel: Channel }) {
  // Brand
  const [logoUrl, setLogoUrl] = useState<string | null>(null)
  const [logoName, setLogoName] = useState<string | null>(null)
  const [iconUrl, setIconUrl] = useState<string | null>(null)
  const [uploadError, setUploadError] = useState<string | null>(null)

  const [accent, setAccent] = useState(channel.accentHex.toUpperCase())
  const [pairing, setPairing] = useState<Pairing>(channel.pairing)
  const [template, setTemplate] = useState<Template>(channel.template)

  // Homepage
  const [modules, setModules] = useState(channel.modules)
  const [cta, setCta] = useState<ChannelCta>(channel.cta)
  const [dragIndex, setDragIndex] = useState<number | null>(null)

  // Navigation
  const [nav, setNav] = useState<NavItem[]>(channel.nav.map((n, i) => ({ key: `n${i}`, ...n })))
  const navCounter = useRef(nav.length)

  const destinations = useMemo(
    () => [
      { value: "", label: "Home" },
      ...channel.sections.map((s) => ({ value: `s/${s.slug}`, label: `Section: ${s.label}` })),
      { value: "shorts", label: "Shorts" },
      { value: "about", label: "About" },
      { value: "search", label: "Search" },
    ],
    [channel.sections],
  )

  // Contrast check: the preview keeps the last colour that passed, so it never shows an unreadable channel.
  const accentCheck = accentState(accent)
  const [lastGood, setLastGood] = useState(channel.accentHex)
  if (accentCheck.ok && accentCheck.hex && accentCheck.hex !== lastGood) setLastGood(accentCheck.hex)
  const previewAccent = accentCheck.hex ?? lastGood
  const accentBlocked = !accentCheck.ok

  const style = useMemo(() => channelStyle(previewAccent, pairing), [previewAccent, pairing])

  const current = { logoUrl, logoName, iconUrl, accent, pairing, template, modules, nav, cta }
  const snapshot = JSON.stringify({ ...current, logoName: null, accent: accentCheck.hex ?? accent, nav: nav.map(({ label, href }) => ({ label, href })) })
  const [saved, setSaved] = useState({ snapshot, state: current })
  const dirty = saved.snapshot !== snapshot

  function discard() {
    const s = saved.state
    setLogoUrl(s.logoUrl)
    setLogoName(s.logoName)
    setIconUrl(s.iconUrl)
    setAccent(s.accent)
    setPairing(s.pairing)
    setTemplate(s.template)
    setModules(s.modules)
    setNav(s.nav)
    setCta(s.cta)
    setUploadError(null)
  }
  const navError = nav.some((n) => !n.label.trim()) ? "Every navigation item needs a name." : null
  const ctaError = !cta.label.trim()
    ? "Your button needs some text."
    : cta.action === "link" && !/^https:\/\/\S+\.\S+/.test(cta.href ?? "")
      ? "Add the full address for your button, starting with https://."
      : null
  const blocked = accentBlocked || !!navError || !!ctaError

  function moveModule(from: number, to: number) {
    setModules((list) => {
      if (to < 0 || to >= list.length || from === to) return list
      const next = [...list]
      const [m] = next.splice(from, 1)
      next.splice(to, 0, m)
      return next
    })
  }
  function moveNav(from: number, to: number) {
    setNav((list) => {
      if (to < 0 || to >= list.length) return list
      const next = [...list]
      const [m] = next.splice(from, 1)
      next.splice(to, 0, m)
      return next
    })
  }

  function save() {
    if (blocked) return
    setSaved({ snapshot, state: current })
    toast.success("Saved", { description: "Your channel shows the new design now." })
  }

  return (
    <div className="grid gap-8 xl:grid-cols-[minmax(0,1fr)_400px] xl:gap-10">
      <div className="min-w-0">
        {/* Logo */}
        <Section stacked id="logo" title="Logo and icon" description="SVG or PNG, up to 2 MB. With no logo, we set your channel name in your type pairing's headline face.">
          <Panel className="divide-y">
            <div className="flex flex-col gap-4 p-4 sm:flex-row sm:items-center sm:p-5">
              <div className="grid h-16 w-full shrink-0 place-items-center rounded-md border bg-white px-3 sm:w-48" style={style}>
                {logoUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={logoUrl} alt="Your logo" className="max-h-7 w-auto max-w-full object-contain" />
                ) : (
                  <span className="flex items-center gap-1.5 text-neutral-950">
                    <span className="size-5 rounded-[4px]" style={{ background: "var(--chan)" }} aria-hidden />
                    <span className="text-xl leading-none" style={{ fontFamily: "var(--chan-display)", fontWeight: "var(--chan-weight)" as unknown as number, letterSpacing: "var(--chan-tracking)" }}>
                      {channel.name}
                    </span>
                  </span>
                )}
              </div>
              <div className="grid min-w-0 gap-2">
                <Label htmlFor="logo-file">Logo</Label>
                <p className="text-[13px] text-muted-foreground">{logoName ?? "Wide logos work best. We show it 28px tall on desktop and 24px on mobile."}</p>
                <FileButton
                  id="logo-file"
                  label="Upload logo"
                  hasFile={!!logoUrl}
                  onFile={(f) => {
                    const err = fileError(f)
                    setUploadError(err)
                    if (err) return
                    setLogoUrl(URL.createObjectURL(f))
                    setLogoName(f.name)
                  }}
                  onClear={() => {
                    setLogoUrl(null)
                    setLogoName(null)
                  }}
                />
              </div>
            </div>
            <div className="flex flex-col gap-4 p-4 sm:flex-row sm:items-center sm:p-5">
              <div className="grid size-16 shrink-0 place-items-center overflow-hidden rounded-md border bg-white" style={style}>
                {iconUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={iconUrl} alt="Your square icon" className="size-full object-cover" />
                ) : (
                  <span className="grid size-10 place-items-center rounded-md text-lg" style={{ background: "var(--chan)", color: "var(--chan-on)", fontFamily: "var(--chan-display)", fontWeight: 800 }}>
                    {channel.name.slice(0, 1)}
                  </span>
                )}
              </div>
              <div className="grid min-w-0 gap-2">
                <Label htmlFor="icon-file">Square icon</Label>
                <p className="text-[13px] text-muted-foreground">Used for the browser tab, home-screen shortcuts and social cards. At least 512 × 512.</p>
                <FileButton
                  id="icon-file"
                  label="Upload icon"
                  hasFile={!!iconUrl}
                  onFile={(f) => {
                    const err = fileError(f)
                    setUploadError(err)
                    if (!err) setIconUrl(URL.createObjectURL(f))
                  }}
                  onClear={() => setIconUrl(null)}
                />
              </div>
            </div>
          </Panel>
          {uploadError && (
            <p role="alert" className="mt-2 flex items-center gap-2 text-[13px] text-destructive">
              <AlertCircle className="size-4 shrink-0" aria-hidden /> {uploadError}
            </p>
          )}
        </Section>

        {/* Accent */}
        <Section
          stacked
          id="accent"
          title="Accent colour"
          description="Your own colour, as a hex. It appears on your logo tile, the active nav underline, your call-to-action button, kicker squares and links. We check its contrast as you type and pick black or white text for it."
        >
          <Panel>
            <div className="p-4 sm:p-5">
              <AccentField id="accent-hex" value={accent} onChange={setAccent} />
            </div>
          </Panel>
        </Section>

        {/* Call to action */}
        <Section
          stacked
          id="cta"
          title="Call to action"
          description="The one thing you want visitors to do. It's the button in your header and footer, at the end of every article and on members-only videos. Sign in always sits beside it."
        >
          <Panel>
            <div className="grid gap-5 p-4 sm:p-5">
              <div className="grid gap-2">
                <Label htmlFor="cta-label">Button</Label>
                <div className="flex flex-wrap gap-1.5" role="group" aria-label="Button presets">
                  {CTA_PRESETS.map((p) => (
                    <button
                      key={p}
                      type="button"
                      aria-pressed={cta.label === p}
                      onClick={() => setCta((c) => ({ ...c, label: p }))}
                      className={cn(
                        "h-8 rounded-full border px-3 text-[13px] font-semibold outline-none transition-colors focus-visible:ring-2 focus-visible:ring-ring",
                        cta.label === p ? "border-foreground bg-foreground text-background" : "border-input hover:bg-accent",
                      )}
                    >
                      {p}
                    </button>
                  ))}
                </div>
                <Input id="cta-label" value={cta.label} maxLength={20} onChange={(e) => setCta((c) => ({ ...c, label: e.target.value }))} aria-invalid={!cta.label.trim()} className="max-w-[320px]" />
                <p className="text-[13px] text-muted-foreground">Or write your own, up to 20 characters.</p>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="cta-line">Supporting line</Label>
                <Input id="cta-line" value={cta.line} maxLength={60} onChange={(e) => setCta((c) => ({ ...c, line: e.target.value }))} />
                <p className="text-[13px] text-muted-foreground">One sentence on what they get, up to 60 characters. Shown beside the button.</p>
              </div>
              <div className="grid gap-2">
                <Label>Where it goes</Label>
                <div className="grid gap-2 sm:grid-cols-2" role="radiogroup" aria-label="Where the button goes">
                  {(
                    [
                      { id: "join", title: "Join this channel", note: "A free account on your channel. You see who joins and they get your weekly digest." },
                      { id: "link", title: "My own link", note: "Your newsletter, shop, Patreon or anything else." },
                    ] as const
                  ).map((o) => (
                    <button
                      key={o.id}
                      type="button"
                      role="radio"
                      aria-checked={cta.action === o.id}
                      onClick={() => setCta((c) => ({ ...c, action: o.id }))}
                      className={cn(
                        "flex flex-col gap-1 rounded-lg border p-3 text-left outline-none transition-colors focus-visible:ring-2 focus-visible:ring-ring",
                        cta.action === o.id ? "border-foreground ring-1 ring-foreground" : "hover:bg-accent",
                      )}
                    >
                      <span className="text-[14px] font-semibold">{o.title}</span>
                      <span className="text-[13px] leading-[19px] text-muted-foreground">{o.note}</span>
                    </button>
                  ))}
                </div>
                {cta.action === "link" && (
                  <Input
                    aria-label="Button link"
                    placeholder="https://"
                    value={cta.href ?? ""}
                    onChange={(e) => setCta((c) => ({ ...c, href: e.target.value }))}
                    aria-invalid={!!ctaError}
                    className="mt-1"
                  />
                )}
              </div>
            </div>
          </Panel>
        </Section>

        {/* Type pairing */}
        <Section stacked id="type" title="Type pairing" description="A headline face and a reading face that work together. Sizes, weights and line lengths are set for you.">
          <div role="radiogroup" aria-label="Type pairing" className="grid gap-2 sm:grid-cols-3">
            {(Object.keys(PAIRINGS) as Pairing[]).map((k) => {
              const p = PAIRINGS[k]
              const selected = pairing === k
              return (
                <button
                  key={k}
                  type="button"
                  role="radio"
                  aria-checked={selected}
                  onClick={() => setPairing(k)}
                  className={cn(
                    "flex flex-col gap-2 rounded-lg border bg-card p-4 text-left outline-none transition-colors hover:bg-accent/60 focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
                    selected && "border-foreground ring-1 ring-foreground",
                  )}
                >
                  <span className="flex items-center justify-between text-[13px] font-semibold">
                    {p.label}
                    {selected && <Check className="size-4" aria-hidden />}
                  </span>
                  <span className="text-[22px] leading-[1.05] [text-wrap:balance]" style={{ fontFamily: p.display, fontWeight: p.weight, letterSpacing: p.tracking }}>
                    Cripps wins it, nobody gets it out
                  </span>
                  <span className="text-[13px] leading-5 text-muted-foreground" style={{ fontFamily: p.body }}>
                    {p.description}
                  </span>
                </button>
              )
            })}
          </div>
          <div className="mt-2 flex flex-wrap items-center justify-between gap-2 rounded-lg border border-dashed px-4 py-3">
            <p className="text-[13px] text-muted-foreground">
              <span className="font-medium text-foreground">Custom fonts.</span> Upload your own headline and reading faces.
            </p>
            <Tag>Coming soon</Tag>
          </div>
        </Section>

        {/* Template */}
        <Section stacked id="template" title="Template" description="The shape of your homepage and pages. Each preview uses your colour, logo and type. Both templates have the same fixed ad positions.">
          <div role="radiogroup" aria-label="Template" className="grid gap-3 sm:grid-cols-2">
            {TEMPLATES.map((t) => {
              const selected = template === t.id
              return (
                <button
                  key={t.id}
                  type="button"
                  role="radio"
                  aria-checked={selected}
                  onClick={() => setTemplate(t.id)}
                  className={cn(
                    "flex flex-col gap-3 rounded-lg border bg-card p-2 pb-3 text-left outline-none transition-colors hover:bg-accent/60 focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
                    selected && "border-foreground ring-1 ring-foreground",
                  )}
                >
                  <div aria-hidden className="pointer-events-none">
                    <TemplatePreview
                      template={t.id}
                      accentHex={previewAccent}
                      pairing={pairing}
                      name={channel.name}
                      logoUrl={logoUrl}
                      nav={nav.map((n) => n.label)}
                      sectionLabels={channel.sections.map((s) => s.label)}
                      maxHeight={520}
                      className="rounded-md"
                    />
                  </div>
                  <span className="px-1">
                    <span className="flex items-center justify-between text-sm font-semibold">
                      {t.label}
                      {selected ? (
                        <span className="flex items-center gap-1 text-[12px] font-medium">
                          <Check className="size-4" aria-hidden /> Selected
                        </span>
                      ) : null}
                    </span>
                    <span className="mt-0.5 block text-[13px] leading-5 text-muted-foreground">{t.description}</span>
                  </span>
                </button>
              )
            })}
          </div>
        </Section>

        {/* Homepage modules */}
        <Section stacked id="modules" title="Homepage" description="Drag to reorder, or use the arrows. Switch a module off to hide it.">
          <Panel>
            <ol aria-label="Homepage modules" className="divide-y">
              {modules.map((m, i) => {
                const info = MODULE_INFO[m.id]
                return (
                  <li
                    key={m.id}
                    draggable
                    onDragStart={(e) => {
                      setDragIndex(i)
                      e.dataTransfer.effectAllowed = "move"
                    }}
                    onDragOver={(e) => {
                      e.preventDefault()
                      if (dragIndex === null || dragIndex === i) return
                      moveModule(dragIndex, i)
                      setDragIndex(i)
                    }}
                    onDragEnd={() => setDragIndex(null)}
                    className={cn("flex items-center gap-2 bg-card px-2 py-3 sm:gap-3 sm:px-3", dragIndex === i && "bg-accent")}
                  >
                    <GripVertical className="size-4 shrink-0 cursor-grab text-muted-foreground" aria-hidden />
                    <span className="w-4 shrink-0 font-mono text-xs text-muted-foreground tabular">{i + 1}</span>
                    <div className={cn("min-w-0 flex-1", !m.enabled && "opacity-60")}>
                      <p className="flex flex-wrap items-center gap-2 text-sm font-medium">
                        {info.label}
                        {info.ad && <Tag className="h-[18px] px-1.5 text-[10px]">Can carry a sponsor</Tag>}
                      </p>
                      <p className="text-[13px] leading-5 text-muted-foreground">{info.description}</p>
                    </div>
                    <div className="flex shrink-0 items-center">
                      <Button variant="ghost" size="icon-sm" aria-label={`Move ${info.label} up`} disabled={i === 0} onClick={() => moveModule(i, i - 1)}>
                        <ArrowUp />
                      </Button>
                      <Button variant="ghost" size="icon-sm" aria-label={`Move ${info.label} down`} disabled={i === modules.length - 1} onClick={() => moveModule(i, i + 1)}>
                        <ArrowDown />
                      </Button>
                      <Switch
                        className="ml-1"
                        aria-label={`Show ${info.label}`}
                        checked={m.enabled}
                        onCheckedChange={(v) => setModules((l) => l.map((x) => (x.id === m.id ? { ...x, enabled: v } : x)))}
                      />
                    </div>
                  </li>
                )
              })}
            </ol>
            <p className="border-t bg-muted/40 px-4 py-3 text-[13px] text-muted-foreground sm:px-5">
              You can&apos;t add ads or free-form blocks. Homestand places every sponsor so your homepage never gets crowded.
            </p>
          </Panel>
        </Section>

        {/* Navigation */}
        <Section
          stacked
          id="navigation"
          title="Navigation"
          description="The links in your header. The first item is your home link."
          aside={
            <span className="text-[13px] text-muted-foreground tabular">
              {nav.length} of {MAX_NAV}
            </span>
          }
        >
          <Panel>
            <ol aria-label="Navigation items" className="divide-y">
              {nav.map((n, i) => (
                <li key={n.key} className="grid grid-cols-[1fr_auto] items-center gap-2 px-3 py-2.5 sm:grid-cols-[minmax(0,1fr)_minmax(0,200px)_auto] sm:px-4">
                  <Input aria-label={`Item ${i + 1} name`} value={n.label} maxLength={20} onChange={(e) => setNav((l) => l.map((x) => (x.key === n.key ? { ...x, label: e.target.value } : x)))} className="h-8" aria-invalid={!n.label.trim()} />
                  <div className="col-span-2 row-start-2 sm:col-span-1 sm:row-start-auto">
                    <Select value={n.href || "home"} onValueChange={(v) => setNav((l) => l.map((x) => (x.key === n.key ? { ...x, href: v === "home" ? "" : v } : x)))}>
                      <SelectTrigger size="sm" className="w-full" aria-label={`Item ${i + 1} links to`}>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {destinations.map((d) => (
                          <SelectItem key={d.value || "home"} value={d.value || "home"}>
                            {d.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="col-start-2 row-start-1 flex items-center sm:col-start-auto sm:row-start-auto">
                    <Button variant="ghost" size="icon-sm" aria-label={`Move ${n.label || "item"} up`} disabled={i === 0} onClick={() => moveNav(i, i - 1)}>
                      <ArrowUp />
                    </Button>
                    <Button variant="ghost" size="icon-sm" aria-label={`Move ${n.label || "item"} down`} disabled={i === nav.length - 1} onClick={() => moveNav(i, i + 1)}>
                      <ArrowDown />
                    </Button>
                    <Button variant="ghost" size="icon-sm" aria-label={`Remove ${n.label || "item"}`} disabled={nav.length === 1} onClick={() => setNav((l) => l.filter((x) => x.key !== n.key))}>
                      <Trash2 />
                    </Button>
                  </div>
                </li>
              ))}
            </ol>
            <div className="flex flex-wrap items-center justify-between gap-2 border-t bg-muted/40 px-3 py-2.5 sm:px-4">
              <p className="text-[13px] text-muted-foreground">{nav.length >= MAX_NAV ? "That's the limit. Remove an item to add another." : "Up to 8 items. On mobile they scroll sideways."}</p>
              <Button
                variant="outline"
                size="sm"
                disabled={nav.length >= MAX_NAV}
                onClick={() => {
                  navCounter.current += 1
                  setNav((l) => [...l, { key: `n${navCounter.current}`, label: "Search", href: "search" }])
                }}
              >
                <Plus /> Add item
              </Button>
            </div>
          </Panel>
          {navError && <p className="mt-2 text-[13px] text-destructive">{navError}</p>}
        </Section>

        <Section stacked title="What stays the same" description="These keep every Homestand channel fast, readable and safe for advertisers.">
          <FixedNote
            items={[
              "Logo size in the header (28px desktop, 24px mobile) and its clear space",
              "Backgrounds, text colours and greys. Your accent only appears in set places.",
              "Type sizes, weights and line lengths inside each pairing",
              "Page layouts, header and mobile menu",
              "Where ads appear, how they look and how they are labelled, and the density cap of 1 ad per 600 words and 3 per page",
              "The 18+ opt-out links on age-restricted ads and the Powered by Homestand footer",
            ]}
          />
        </Section>

        {/* Save bar */}
        <div className="sticky bottom-4 z-10 mt-2">
          <div className="flex flex-wrap items-center justify-between gap-3 rounded-lg border bg-background/95 px-4 py-3 shadow-popover backdrop-blur">
            <p className={cn("min-w-0 text-[13px]", accentBlocked ? "text-destructive" : "text-muted-foreground")} aria-live="polite">
              {accentBlocked
                ? "Fix the accent colour to save. It needs 3:1 on white and 4.5:1 with text on it."
                : navError || ctaError
                  ? navError || ctaError
                  : dirty
                    ? "You have unsaved changes. The preview shows them."
                    : "All changes saved."}
            </p>
            <div className="flex gap-2">
              <Button variant="ghost" size="sm" disabled={!dirty} onClick={discard}>
                Discard
              </Button>
              <Button size="sm" disabled={!dirty || blocked} onClick={save}>
                Save changes
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Live preview */}
      <aside aria-label="Live preview" className="order-first xl:order-none">
        <div className="xl:sticky xl:top-24">
          <div className="mb-2 flex items-center justify-between">
            <p className="text-[13px] font-semibold">Live preview</p>
            <p className="text-xs text-muted-foreground">Homepage · {TEMPLATES.find((t) => t.id === template)?.label}</p>
          </div>
          <div className="mx-auto max-h-[420px] max-w-[440px] overflow-y-auto rounded-lg xl:max-h-[calc(100vh-8rem)] xl:max-w-none">
            <TemplatePreview
              template={template}
              accentHex={previewAccent}
              pairing={pairing}
              name={channel.name}
              logoUrl={logoUrl}
              iconUrl={iconUrl}
              modules={modules}
              nav={nav.map((n) => n.label)}
              sectionLabels={channel.sections.map((s) => s.label)}
              domain={channel.customDomain ?? `${channel.slug}.homestand.com.au`}
              ctaLabel={cta.label}
            />
          </div>
        </div>
      </aside>
    </div>
  )
}
