"use client"

import { useState } from "react"
import { Ban, History, Lock, ShieldCheck, ShieldOff } from "lucide-react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { StatusBadge } from "@/components/brand/status-badge"
import { ShortCard } from "@/components/brand/media"
import {
  ChapterSponsorCredit,
  ChapterSponsorSegment,
  HalftimeBreak,
  PresentedBy,
  SponsoredShortCard,
  StatCard,
} from "@/components/brand/native-ads"
import { cn } from "@/lib/utils"
import type { AgeCategory, Channel, ChannelMode, Sponsor } from "@/lib/types"
import { FixedNote, Panel, PanelFooter, Section, SettingRow, Tag } from "./section"

const MODES: { id: ChannelMode; label: string; summary: string; detail: string }[] = [
  {
    id: "standard",
    label: "Standard",
    summary: "No age-restricted ads.",
    detail: "Alcohol, wagering and any other age-restricted category never run on your channel. Every other approved advertiser can, subject to your blocks below.",
  },
  {
    id: "age_verified",
    label: "Age-verified",
    summary: "Age-restricted ads reach verified adults only.",
    detail: "Switches on the triple lock. Advertisers in age-restricted categories can reach viewers who are signed in, confirmed 18+ and haven't opted out. Everyone else sees an unrestricted ad in the same place.",
  },
]

const MODE_LABEL: Record<ChannelMode, string> = { standard: "Standard", age_verified: "Age-verified" }

const AGE_CATEGORIES: { id: AgeCategory; label: string; description: string; optOut: string }[] = [
  { id: "alcohol", label: "Alcohol", description: "Breweries, wineries, spirits and bottle shops.", optOut: "Don't show me alcohol ads" },
  { id: "wagering", label: "Wagering", description: "Bookmakers and racing wagering services.", optOut: "Don't show me betting ads" },
]

const OTHER_CATEGORIES = [
  { id: "crypto", label: "Crypto and trading", description: "Exchanges, tokens and share trading apps." },
  { id: "dating", label: "Dating", description: "Dating apps and services." },
  { id: "supplements", label: "Weight loss and supplements", description: "Diet programs, supplements and fat burners." },
  { id: "political", label: "Political and issue", description: "Parties, candidates and advocacy campaigns." },
]

const LOCKS = [
  { Icon: Lock, title: "Signed in", body: "The viewer has a Homestand account and is signed in." },
  { Icon: ShieldCheck, title: "18+ confirmed", body: "Age checked by a certified provider. We keep the result, never their ID." },
  { Icon: Ban, title: "Not opted out", body: "They haven't opted out of that category, here or on any Homestand channel." },
]

const CATEGORY_NAME: Record<AgeCategory, string> = { alcohol: "alcohol", wagering: "wagering" }

type LogEntry = { when: string; who: string; change: string }

function FormatExample({
  n,
  title,
  where,
  note,
  children,
}: {
  n: number
  title: string
  where: string
  note?: React.ReactNode
  children: React.ReactNode
}) {
  return (
    <li className="overflow-hidden rounded-lg border bg-card">
      <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1 border-b px-4 py-3 sm:px-5">
        <span className="font-mono text-xs text-muted-foreground tabular">{n}</span>
        <h3 className="text-sm font-semibold">{title}</h3>
        <p className="basis-full text-[13px] leading-5 text-muted-foreground sm:basis-auto">{where}</p>
      </div>
      <div className="bg-background p-4 sm:p-6">{children}</div>
      {note && <p className="border-t bg-muted/40 px-4 py-2.5 text-[12px] leading-[18px] text-muted-foreground sm:px-5">{note}</p>}
    </li>
  )
}

export function Monetisation({ channel, sponsors }: { channel: Channel; sponsors: Sponsor[] }) {
  const [mode, setMode] = useState<ChannelMode>(channel.mode)
  const [draftMode, setDraftMode] = useState<ChannelMode>(channel.mode)
  const [confirmOpen, setConfirmOpen] = useState(false)
  const [log, setLog] = useState<LogEntry[]>([
    { when: "28 October 2026, 2:20 pm", who: channel.owner, change: "Standard → Age-verified" },
    { when: "28 October 2026, 2:11 pm", who: channel.owner, change: "Channel created in Standard mode" },
  ])

  const [ageBlocks, setAgeBlocks] = useState<AgeCategory[]>(channel.blockedAgeCategories)
  const [savedAgeBlocks, setSavedAgeBlocks] = useState<AgeCategory[]>(channel.blockedAgeCategories)
  const ageDirty = [...ageBlocks].sort().join() !== [...savedAgeBlocks].sort().join()

  const [blocks, setBlocks] = useState<string[]>(channel.adCategoryBlocks)
  const [savedBlocks, setSavedBlocks] = useState<string[]>(channel.adCategoryBlocks)
  const blocksDirty = [...blocks].sort().join() !== [...savedBlocks].sort().join()

  const verified = mode === "age_verified"

  function applyMode() {
    setLog((l) => [{ when: "Just now", who: channel.owner, change: `${MODE_LABEL[mode]} → ${MODE_LABEL[draftMode]}` }, ...l])
    setMode(draftMode)
    setConfirmOpen(false)
    toast.success("Mode changed", { description: `${MODE_LABEL[draftMode]}. The change is logged.` })
  }

  // Examples follow the channel's own settings: a blocked category is swapped for an unrestricted sponsor.
  const allowed = (s: Sponsor) => !s.ageCategory || (verified && !ageBlocks.includes(s.ageCategory))
  const unrestricted = sponsors.filter((s) => !s.ageCategory)
  function pick(id: string, fallback: number) {
    const preferred = sponsors.find((s) => s.id === id) ?? sponsors[0]
    if (allowed(preferred)) return { sponsor: preferred, swapped: null }
    return { sponsor: unrestricted[fallback % unrestricted.length] ?? preferred, swapped: preferred.ageCategory ?? null }
  }
  const chapter = pick("sp_ute", 0)
  const halftime = pick("sp_boots", 1)
  const stat = pick("sp_brew", 0)
  const short = pick("sp_harbour", 1)
  const presented = pick("sp_ute", 0)

  function exampleNote({ sponsor, swapped }: { sponsor: Sponsor; swapped: AgeCategory | null }) {
    if (sponsor.ageCategory)
      return `Age-restricted example (${CATEGORY_NAME[sponsor.ageCategory]}). Shown only to signed-in viewers confirmed 18+ who haven't opted out, with the opt-out link in the ad.`
    if (swapped)
      return verified
        ? `You block ${CATEGORY_NAME[swapped]} ads, so an unrestricted sponsor takes this place.`
        : `Standard mode has no ${CATEGORY_NAME[swapped]} ads, so an unrestricted sponsor takes this place.`
    return undefined
  }

  return (
    <div>
      <Section
        id="mode"
        title="Advertising mode"
        description="Decides whether age-restricted categories can ever advertise on your channel. Every change is logged with your name and the time, and our compliance team can see it."
      >
        <Panel>
          <RadioGroup value={draftMode} onValueChange={(v) => setDraftMode(v as ChannelMode)} className="gap-0 divide-y" aria-label="Advertising mode">
            {MODES.map((m) => (
              <div key={m.id} className={cn("px-4 py-4 sm:px-5", draftMode === m.id && "bg-muted/40")}>
                <label className="flex cursor-pointer items-start gap-3">
                  <RadioGroupItem value={m.id} className="mt-0.5" />
                  <span className="min-w-0">
                    <span className="flex flex-wrap items-center gap-2 text-sm font-semibold">
                      {m.label}
                      {mode === m.id && <StatusBadge tone="published">Current</StatusBadge>}
                    </span>
                    <span className="mt-0.5 block text-sm">{m.summary}</span>
                    <span className="mt-0.5 block text-[13px] leading-5 text-muted-foreground">{m.detail}</span>
                  </span>
                </label>
              </div>
            ))}
          </RadioGroup>
          <PanelFooter
            note={
              <span className="flex items-center gap-1.5">
                <History className="size-3.5 shrink-0" aria-hidden /> Last change: {log[0].when}, {log[0].who}
              </span>
            }
          >
            <Button size="sm" disabled={draftMode === mode} onClick={() => setConfirmOpen(true)}>
              Change mode
            </Button>
          </PanelFooter>
        </Panel>
        <details className="group mt-3 text-[13px]">
          <summary className="cursor-pointer rounded-sm font-medium outline-none focus-visible:ring-2 focus-visible:ring-ring">Change log</summary>
          <ul className="mt-2 grid gap-1 text-muted-foreground">
            {log.map((e, i) => (
              <li key={i} className="flex flex-wrap gap-x-2">
                <span className="tabular">{e.when}</span>·<span>{e.who}</span>·<span className="text-foreground">{e.change}</span>
              </li>
            ))}
          </ul>
        </details>
      </Section>

      <Section
        id="triple-lock"
        title="The triple lock"
        aside={verified ? <StatusBadge tone="published">On</StatusBadge> : <Tag className="h-[20px] px-1.5 text-[10px]">Off</Tag>}
        description="Age-restricted ads only reach signed-in, age-verified adults who haven't opted out, so you can earn from them legally, including wagering from 1 January 2027."
      >
        <div className="grid gap-3">
          <ol className="grid gap-2 sm:grid-cols-3">
            {LOCKS.map(({ Icon, title, body }, i) => (
              <li key={title} className={cn("rounded-lg border bg-card p-4", !verified && "opacity-70")}>
                <span className="flex items-center gap-2 text-sm font-semibold">
                  <span className="font-mono text-xs text-muted-foreground tabular">{i + 1}</span>
                  <Icon className="size-4" aria-hidden /> {title}
                </span>
                <p className="mt-1.5 text-[13px] leading-5 text-muted-foreground">{body}</p>
              </li>
            ))}
          </ol>
          <div className="flex items-start gap-3 rounded-lg border bg-muted/40 p-4">
            <ShieldOff className="mt-0.5 size-4 shrink-0" aria-hidden />
            <p className="text-[13px] leading-5">
              <span className="font-semibold">Fail closed.</span> If any check fails, errors or takes too long, the viewer gets an unrestricted ad in the same place. Live coverage never carries wagering ads, and every decision is logged as evidence.
            </p>
          </div>
          {!verified && <p className="text-[13px] text-muted-foreground">The triple lock switches on when you change to Age-verified mode.</p>}
        </div>
      </Section>

      <Section
        id="age-categories"
        title="Age-restricted categories"
        description="Choose which age-restricted advertisers can reach your verified adults. More categories will be added here as advertisers join."
      >
        <Panel>
          {AGE_CATEGORIES.map((c) => {
            const forced = !verified
            const checked = forced || ageBlocks.includes(c.id)
            return (
              <SettingRow
                key={c.id}
                htmlFor={`age-${c.id}`}
                label={
                  <span className="flex flex-wrap items-center gap-2">
                    Block {c.label.toLowerCase()} ads {forced && <Tag className="h-[18px] px-1.5 text-[10px]">Standard mode</Tag>}
                  </span>
                }
                description={
                  forced ? (
                    "Always blocked in Standard mode."
                  ) : (
                    <>
                      {c.description} Viewers can always choose “{c.optOut}”.
                    </>
                  )
                }
              >
                <Switch
                  id={`age-${c.id}`}
                  checked={checked}
                  disabled={forced}
                  onCheckedChange={(v) => setAgeBlocks((b) => (v ? [...b, c.id] : b.filter((x) => x !== c.id)))}
                />
              </SettingRow>
            )
          })}
          <PanelFooter note={verified ? "Blocked categories are filled by unrestricted advertisers." : "Change to Age-verified mode to choose categories."}>
            <Button
              size="sm"
              disabled={!ageDirty || !verified}
              onClick={() => {
                setSavedAgeBlocks(ageBlocks)
                toast.success("Saved")
              }}
            >
              Save
            </Button>
          </PanelFooter>
        </Panel>
      </Section>

      <Section id="categories" title="Other blocked categories" description="Switch on a category to keep those ads off your channel, whatever your mode. Other advertisers fill the space.">
        <Panel>
          {OTHER_CATEGORIES.map((c) => (
            <SettingRow key={c.id} htmlFor={`block-${c.id}`} label={`Block ${c.label.toLowerCase()} ads`} description={c.description}>
              <Switch
                id={`block-${c.id}`}
                checked={blocks.includes(c.id)}
                onCheckedChange={(v) => setBlocks((b) => (v ? [...b, c.id] : b.filter((x) => x !== c.id)))}
              />
            </SettingRow>
          ))}
          <PanelFooter note="You can block categories, but you can't add ad placements.">
            <Button
              size="sm"
              disabled={!blocksDirty}
              onClick={() => {
                setSavedBlocks(blocks)
                toast.success("Saved")
              }}
            >
              Save
            </Button>
          </PanelFooter>
        </Panel>
      </Section>

      <Section
        stacked
        id="formats"
        title="How ads appear on your channel"
        description="Homestand Native Formats. Advertisers send us a brief, and we set it in your channel's design. No banners, no third-party scripts and nothing that shifts the page. These are the only five formats, shown here with real sponsors."
      >
        <ol className="grid gap-4">
          <FormatExample n={1} title="Chapter sponsor" where="A brand presents one chapter of a video: a credit under the player and a coloured segment on the timeline." note={exampleNote(chapter)}>
            <div className="grid max-w-[640px] gap-4">
              <div className="grid gap-2">
                <div className="relative h-1.5 rounded-full bg-muted" aria-hidden>
                  <span className="absolute inset-y-0 left-0 w-[22%] rounded-full bg-foreground/70" />
                  <ChapterSponsorSegment sponsor={chapter.sponsor} from={0.32} to={0.55} />
                </div>
                <ol className="grid gap-1 text-[13px]" aria-label="Sample chapters">
                  <li className="flex gap-3 text-muted-foreground">
                    <span className="font-mono tabular">0:00</span> Cold open
                  </li>
                  <li className="flex gap-3 font-medium">
                    <span className="font-mono tabular text-muted-foreground">5:48</span> Centre-bounce breakdown
                  </li>
                  <li className="flex gap-3 text-muted-foreground">
                    <span className="font-mono tabular">10:02</span> The fix at Coburg
                  </li>
                </ol>
              </div>
              <ChapterSponsorCredit sponsor={chapter.sponsor} chapter="Centre-bounce breakdown" />
            </div>
          </FormatExample>

          <FormatExample n={2} title="Half-time break" where="A pause between sections of a long article, set like a broadcast break. At most one per article." note={exampleNote(halftime)}>
            <HalftimeBreak sponsor={halftime.sponsor} />
          </FormatExample>

          <FormatExample n={3} title="Stat card" where="A sponsor message set like a scoreboard tile, beside the key points of a video or in a stat row." note={exampleNote(stat)}>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              <div className="hidden min-h-[188px] flex-col justify-between rounded-lg border p-5 lg:flex" aria-hidden>
                <p className="text-[11px] font-bold uppercase tracking-[1px] text-muted-foreground">Centre clearances</p>
                <div>
                  <p className="text-[48px] font-extrabold leading-none tracking-[-1.5px]">6–14</p>
                  <p className="mt-1.5 text-[14px] leading-5 text-muted-foreground">Carlton v Collingwood, Round 7</p>
                </div>
              </div>
              <StatCard sponsor={stat.sponsor} />
            </div>
          </FormatExample>

          <FormatExample n={4} title="Sponsored short" where="A vertical card the same size as your shorts, in the shorts row and feed. At most one in every eight shorts." note={exampleNote(short)}>
            <div className="-mx-4 flex gap-3 overflow-x-auto px-4 pb-1 sm:mx-0 sm:px-0">
              <ShortCard href="#formats" title="Cripps from the boundary" src="/media/mcg-night.jpg" durationSec={38} />
              <SponsoredShortCard sponsor={short.sponsor} />
              <ShortCard href="#formats" title="The smother of the round" src="/media/stadium-night-wide.jpg" durationSec={24} />
            </div>
          </FormatExample>

          <FormatExample n={5} title="Presented by" where="A credit across the top of one homepage module or the lead story, the way a broadcast is brought to you by a sponsor." note={exampleNote(presented)}>
            <div className="grid gap-3">
              <h4 className="text-xl font-bold tracking-[-0.01em]">Latest stories</h4>
              <PresentedBy sponsor={presented.sponsor} />
            </div>
          </FormatExample>
        </ol>
      </Section>

      <Section id="rules" title="Fixed by Homestand" description="These rules apply to every channel and every advertiser.">
        <FixedNote
          title="Ad rules"
          items={[
            "Every ad is labelled “Sponsored” or “Presented by”, and age-restricted ads carry an 18+ mark and an opt-out link",
            "At most 1 ad per 600 words of article, and 3 ads on any page in total",
            "No pop-ups, interstitials, sticky overlays, auto-playing sound or banner networks",
            "Ads are never placed between a headline and its first paragraph, and an Exclusive gate carries none",
            "You never contract with advertisers directly. Homestand sells, reviews and places every ad.",
          ]}
        />
      </Section>

      <Section id="earnings" title="How you're paid" description="Ad income is shared through a pool, not deal by deal.">
        <Panel>
          <div className="grid gap-3 p-4 sm:p-5">
            <div className="flex flex-wrap items-center gap-2">
              <p className="text-sm font-semibold">Pooled ad revenue share</p>
              <Tag>Next</Tag>
            </div>
            <p className="text-[13px] leading-5 text-muted-foreground">
              Each month a share of net ad revenue is split between channels by verified watch minutes and article reads. Your pay doesn&apos;t depend on which ads ran on your channel, so there is never a reason to favour one advertiser.
            </p>
            <p className="text-[13px] leading-5 text-muted-foreground">Payouts start in the next phase. Your verified minutes are already being counted.</p>
          </div>
        </Panel>
      </Section>

      <Dialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Change to {MODE_LABEL[draftMode]}?</DialogTitle>
            <DialogDescription>
              {draftMode === "standard"
                ? "Age-restricted ads, including alcohol and wagering, stop on your channel within a minute."
                : "The triple lock switches on. Age-restricted advertisers you haven't blocked can reach viewers who are signed in, confirmed 18+ and haven't opted out. Everyone else sees unrestricted ads."}{" "}
              The change is logged with your name and the time.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline">Cancel</Button>
            </DialogClose>
            <Button onClick={applyMode}>Change mode</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
