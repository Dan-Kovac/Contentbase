"use client"

import { useState } from "react"
import Link from "next/link"
import { ArrowDown, ArrowUp, Pause, Play, Plus, Trash2 } from "lucide-react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { StatusBadge } from "@/components/brand/status-badge"
import { Panel, PanelBody, PanelFooter, Section } from "./section"
import type { Channel } from "@/lib/types"

const TIME_ZONES = [
  { value: "Australia/Melbourne", label: "Melbourne (AEDT, UTC+11)" },
  { value: "Australia/Sydney", label: "Sydney (AEDT, UTC+11)" },
  { value: "Australia/Hobart", label: "Hobart (AEDT, UTC+11)" },
  { value: "Australia/Brisbane", label: "Brisbane (AEST, UTC+10)" },
  { value: "Australia/Adelaide", label: "Adelaide (ACDT, UTC+10:30)" },
  { value: "Australia/Darwin", label: "Darwin (ACST, UTC+9:30)" },
  { value: "Australia/Perth", label: "Perth (AWST, UTC+8)" },
]

const SUBDOMAIN = /^[a-z0-9](?:[a-z0-9-]{1,28}[a-z0-9])$/

function slugify(s: string) {
  return s.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "")
}

type SectionItem = { key: string; slug: string; label: string }

export function ChannelForm({ channel }: { channel: Channel }) {
  // Details
  const [name, setName] = useState(channel.name)
  const [tagline, setTagline] = useState(channel.tagline)
  const nameError = name.trim().length === 0 ? "Add a channel name. It shows in your header and in search results." : null

  // Address
  const [subdomain, setSubdomain] = useState(channel.slug)
  const [timeZone, setTimeZone] = useState("Australia/Melbourne")
  const subError =
    subdomain.length < 3
      ? "Use at least 3 characters."
      : !SUBDOMAIN.test(subdomain)
        ? "Use lowercase letters, numbers and hyphens only, and don't start or end with a hyphen."
        : null

  // Sections
  const [sections, setSections] = useState<SectionItem[]>(channel.sections.map((s) => ({ key: s.slug, ...s })))
  const [newSection, setNewSection] = useState("")
  const sectionNames = sections.map((s) => s.label.trim().toLowerCase())
  const newSectionError =
    newSection.trim() && sectionNames.includes(newSection.trim().toLowerCase()) ? "You already have a section with that name." : null

  function moveSection(i: number, dir: -1 | 1) {
    setSections((list) => {
      const next = [...list]
      const j = i + dir
      if (j < 0 || j >= next.length) return list
      ;[next[i], next[j]] = [next[j], next[i]]
      return next
    })
  }
  function addSection() {
    const label = newSection.trim()
    if (!label || newSectionError) return
    setSections((l) => [...l, { key: `${slugify(label)}-${l.length}`, slug: slugify(label), label }])
    setNewSection("")
  }

  // Danger zone
  const [paused, setPaused] = useState(false)
  const [confirmingDelete, setConfirmingDelete] = useState(false)
  const [confirmText, setConfirmText] = useState("")
  const [deleteScheduled, setDeleteScheduled] = useState(false)

  return (
    <div>
      {paused && (
        <Alert className="mb-8">
          <Pause />
          <AlertTitle>Your channel is paused</AlertTitle>
          <AlertDescription>Visitors see a short &ldquo;Back soon&rdquo; page. Your content, followers and settings are safe.</AlertDescription>
        </Alert>
      )}

      <Section id="details" title="Channel details" description="Your channel's name and tagline appear in the header, in search results and when people share a link.">
        <Panel>
          <PanelBody>
            <div className="grid gap-2">
              <Label htmlFor="ch-name">Channel name</Label>
              <Input id="ch-name" value={name} onChange={(e) => setName(e.target.value)} maxLength={40} aria-invalid={!!nameError} aria-describedby={nameError ? "ch-name-error" : undefined} />
              {nameError && <p id="ch-name-error" className="text-[13px] text-destructive">{nameError}</p>}
            </div>
            <div className="grid gap-2">
              <div className="flex items-baseline justify-between">
                <Label htmlFor="ch-tagline">Tagline</Label>
                <span className="text-xs text-muted-foreground tabular">{tagline.length}/80</span>
              </div>
              <Input id="ch-tagline" value={tagline} onChange={(e) => setTagline(e.target.value)} maxLength={80} aria-describedby="ch-tagline-help" />
              <p id="ch-tagline-help" className="text-[13px] text-muted-foreground">One line on what you cover. It sits under your logo in the footer.</p>
            </div>
          </PanelBody>
          <PanelFooter>
            <Button size="sm" disabled={!!nameError} onClick={() => toast.success("Saved")}>
              Save
            </Button>
          </PanelFooter>
        </Panel>
      </Section>

      <Section
        id="address"
        title="Address and time zone"
        description={
          <>
            Your Homestand address always works, even with a custom domain. <Link href="/studio/settings/domain">Manage domains</Link>
          </>
        }
      >
        <Panel>
          <PanelBody>
            <div className="grid gap-2">
              <Label htmlFor="ch-sub">Subdomain</Label>
              <div className="flex min-w-0 rounded-md border border-input shadow-xs focus-within:ring-[3px] focus-within:ring-ring/50 has-[[aria-invalid=true]]:border-destructive">
                <input
                  id="ch-sub"
                  value={subdomain}
                  onChange={(e) => setSubdomain(e.target.value.toLowerCase())}
                  aria-invalid={!!subError}
                  aria-describedby={subError ? "ch-sub-error" : "ch-sub-help"}
                  className="h-9 min-w-0 flex-1 rounded-l-md bg-transparent px-3 font-mono text-sm outline-none"
                  spellCheck={false}
                />
                <span className="flex items-center rounded-r-md border-l bg-muted px-3 font-mono text-[13px] text-muted-foreground">.homestand.com.au</span>
              </div>
              {subError ? (
                <p id="ch-sub-error" className="text-[13px] text-destructive">{subError}</p>
              ) : (
                <p id="ch-sub-help" className="text-[13px] text-muted-foreground">
                  Changing it redirects the old address for 12 months. Your custom domain, <span className="font-mono">{channel.customDomain}</span>, stays primary.
                </p>
              )}
            </div>
            <div className="grid gap-2">
              <Label htmlFor="ch-tz">Time zone</Label>
              <Select value={timeZone} onValueChange={setTimeZone}>
                <SelectTrigger id="ch-tz" className="w-full sm:w-[320px]" aria-describedby="ch-tz-help">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {TIME_ZONES.map((t) => (
                    <SelectItem key={t.value} value={t.value}>
                      {t.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p id="ch-tz-help" className="text-[13px] text-muted-foreground">Scheduled posts and the dates on your pages use this time zone.</p>
            </div>
          </PanelBody>
          <PanelFooter>
            <Button size="sm" disabled={!!subError} onClick={() => toast.success("Saved")}>
              Save
            </Button>
          </PanelFooter>
        </Panel>
      </Section>

      <Section id="sections" title="Sections" description="Sections group your videos and articles, and each gets its own page. Add them to your navigation in Design.">
        <Panel>
          <ul aria-label="Sections" className="divide-y">
            {sections.map((s, i) => (
              <li key={s.key} className="flex items-center gap-2 px-4 py-2.5 sm:px-5">
                <span className="w-5 shrink-0 text-center font-mono text-xs text-muted-foreground tabular">{i + 1}</span>
                <Input
                  aria-label={`Section ${i + 1} name`}
                  value={s.label}
                  onChange={(e) => setSections((l) => l.map((x) => (x.key === s.key ? { ...x, label: e.target.value } : x)))}
                  className="h-8 min-w-0 flex-1"
                />
                <span className="hidden w-28 shrink-0 truncate font-mono text-xs text-muted-foreground md:block">/s/{slugify(s.label) || s.slug}</span>
                <div className="flex shrink-0 items-center">
                  <Button variant="ghost" size="icon-sm" aria-label={`Move ${s.label} up`} disabled={i === 0} onClick={() => moveSection(i, -1)}>
                    <ArrowUp />
                  </Button>
                  <Button variant="ghost" size="icon-sm" aria-label={`Move ${s.label} down`} disabled={i === sections.length - 1} onClick={() => moveSection(i, 1)}>
                    <ArrowDown />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon-sm"
                    aria-label={`Remove ${s.label}`}
                    disabled={sections.length === 1}
                    onClick={() => setSections((l) => l.filter((x) => x.key !== s.key))}
                  >
                    <Trash2 />
                  </Button>
                </div>
              </li>
            ))}
          </ul>
          <div className="border-t px-4 py-3 sm:px-5">
            <form
              className="flex gap-2"
              onSubmit={(e) => {
                e.preventDefault()
                addSection()
              }}
            >
              <Input
                aria-label="New section name"
                placeholder="e.g. Trade period"
                value={newSection}
                onChange={(e) => setNewSection(e.target.value)}
                className="h-8 min-w-0 flex-1"
                aria-invalid={!!newSectionError}
                aria-describedby={newSectionError ? "new-section-error" : undefined}
              />
              <Button type="submit" size="sm" variant="outline" disabled={!newSection.trim() || !!newSectionError}>
                <Plus /> Add section
              </Button>
            </form>
            {newSectionError && <p id="new-section-error" className="mt-2 text-[13px] text-destructive">{newSectionError}</p>}
          </div>
          <PanelFooter note="Renaming a section keeps its old address as a redirect.">
            <Button size="sm" disabled={sections.some((s) => !s.label.trim())} onClick={() => toast.success("Saved")}>
              Save
            </Button>
          </PanelFooter>
        </Panel>
      </Section>

      <Section id="danger" title="Danger zone" description="Pausing is reversible at any time. Deleting is permanent after 14 days.">
        <div className="overflow-hidden rounded-lg border border-destructive/40 bg-card">
          <div className="flex flex-col gap-3 px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-5">
            <div className="min-w-0">
              <p className="flex items-center gap-2 text-sm font-medium">
                {paused ? "Resume channel" : "Pause channel"} {paused && <StatusBadge tone="draft">Paused</StatusBadge>}
              </p>
              <p className="mt-0.5 text-[13px] text-muted-foreground">
                {paused
                  ? "Bring your pages back online. Ads and new imports start again."
                  : "Take your pages offline for now. New YouTube uploads still arrive as drafts."}
              </p>
            </div>
            <Button
              variant="outline"
              size="sm"
              className="self-start sm:self-auto"
              onClick={() => {
                setPaused((p) => !p)
                toast.success(paused ? "Channel resumed" : "Channel paused")
              }}
            >
              {paused ? <Play /> : <Pause />} {paused ? "Resume channel" : "Pause channel"}
            </Button>
          </div>
          <div className="border-t px-4 py-4 sm:px-5">
            {deleteScheduled ? (
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="text-sm font-medium text-destructive">Deletion scheduled</p>
                  <p className="mt-0.5 text-[13px] text-muted-foreground">
                    Your channel goes offline now and is deleted in 14 days. You can cancel until then.
                  </p>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  className="self-start sm:self-auto"
                  onClick={() => {
                    setDeleteScheduled(false)
                    setConfirmingDelete(false)
                    setConfirmText("")
                    toast.success("Deletion cancelled")
                  }}
                >
                  Cancel deletion
                </Button>
              </div>
            ) : (
              <>
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <div className="min-w-0">
                    <p className="text-sm font-medium">Delete channel</p>
                    <p className="mt-0.5 text-[13px] text-muted-foreground">
                      Removes every page, video, article and short, and stops billing. Your YouTube channel isn&apos;t touched.
                    </p>
                  </div>
                  {!confirmingDelete && (
                    <Button variant="outline" size="sm" className="self-start border-destructive/50 text-destructive hover:text-destructive sm:self-auto" onClick={() => setConfirmingDelete(true)}>
                      <Trash2 /> Delete channel
                    </Button>
                  )}
                </div>
                {confirmingDelete && (
                  <form
                    className="mt-4 grid gap-3 rounded-md border border-destructive/40 bg-background p-4"
                    onSubmit={(e) => {
                      e.preventDefault()
                      if (confirmText !== channel.slug) return
                      setDeleteScheduled(true)
                      toast.success("Deletion scheduled")
                    }}
                  >
                    <p className="text-sm">
                      This deletes <strong>{channel.name}</strong> and {channel.followers.toLocaleString("en-AU")} followers lose access. 301 redirects from your old site stop working.
                    </p>
                    <div className="grid gap-2">
                      <Label htmlFor="ch-delete-confirm">
                        Type <span className="font-mono">{channel.slug}</span> to confirm
                      </Label>
                      <Input id="ch-delete-confirm" value={confirmText} onChange={(e) => setConfirmText(e.target.value)} autoComplete="off" spellCheck={false} className="font-mono sm:max-w-[280px]" />
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <Button type="submit" variant="destructive" size="sm" disabled={confirmText !== channel.slug}>
                        Delete channel
                      </Button>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          setConfirmingDelete(false)
                          setConfirmText("")
                        }}
                      >
                        Keep channel
                      </Button>
                    </div>
                  </form>
                )}
              </>
            )}
          </div>
        </div>
      </Section>
    </div>
  )
}
