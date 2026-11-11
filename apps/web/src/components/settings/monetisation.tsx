"use client"

import { useState } from "react"
import Link from "next/link"
import { AlertCircle, Ban, History, Lock, ShieldCheck, ShieldOff } from "lucide-react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Checkbox } from "@/components/ui/checkbox"
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
import { cn } from "@/lib/utils"
import type { Channel, ChannelMode } from "@/lib/types"
import { FixedNote, Panel, PanelFooter, Section, SettingRow, Tag } from "./section"
import { AdSlotsDiagram } from "./ad-slots-diagram"

const MODES: { id: ChannelMode; label: string; summary: string; detail: string }[] = [
  {
    id: "standard",
    label: "Standard",
    summary: "No wagering ads, ever.",
    detail: "Every other approved category can run, subject to your blocks below. The simplest choice for most channels.",
  },
  {
    id: "triple_lock",
    label: "Triple lock",
    summary: "Wagering ads only to signed-in adults who haven't opted out.",
    detail: "Viewers who don't pass all three checks see a non-wagering ad in the same slot. You earn more from a premium, verified audience.",
  },
  {
    id: "racing_only",
    label: "Racing-only",
    summary: "For channels that only cover racing.",
    detail: "Dedicated racing services are exempt from the triple lock. You declare your content is racing-only, we check new posts and remind you to review it each quarter.",
  },
]

const MODE_LABEL: Record<ChannelMode, string> = { standard: "Standard", triple_lock: "Triple lock", racing_only: "Racing-only" }

const CATEGORIES = [
  { id: "wagering", label: "Wagering", description: "Bookmakers and racing wagering services." },
  { id: "alcohol", label: "Alcohol", description: "Beer, wine, spirits and bottle shops." },
  { id: "crypto", label: "Crypto and trading", description: "Exchanges, tokens and share trading apps." },
  { id: "dating", label: "Dating", description: "Dating apps and services." },
  { id: "supplements", label: "Weight loss and supplements", description: "Diet programs, supplements and fat burners." },
  { id: "political", label: "Political and issue", description: "Parties, candidates and advocacy campaigns." },
]

const LOCKS = [
  { Icon: Lock, title: "Signed in", body: "The viewer has a Homestand account and is signed in." },
  { Icon: ShieldCheck, title: "18+ confirmed", body: "Age checked by a certified provider. We keep the result, never their ID." },
  { Icon: Ban, title: "Not opted out", body: "They haven't chosen “Don't show me betting ads”, here or on any channel." },
]

type LogEntry = { when: string; who: string; change: string }

export function Monetisation({ channel }: { channel: Channel }) {
  const [mode, setMode] = useState<ChannelMode>(channel.mode)
  const [draftMode, setDraftMode] = useState<ChannelMode>(channel.mode)
  const [declared, setDeclared] = useState(false)
  const [declError, setDeclError] = useState(false)
  const [confirmOpen, setConfirmOpen] = useState(false)
  const [log, setLog] = useState<LogEntry[]>([
    { when: "28 October 2026, 2:20 pm", who: "Sam Doherty", change: "Standard → Triple lock" },
    { when: "28 October 2026, 2:11 pm", who: "Sam Doherty", change: "Channel created in Standard mode" },
  ])

  const [blocks, setBlocks] = useState<string[]>(channel.adCategoryBlocks)
  const [savedBlocks, setSavedBlocks] = useState<string[]>(channel.adCategoryBlocks)
  const blocksDirty = [...blocks].sort().join() !== [...savedBlocks].sort().join()

  const adsenseAvailable = channel.plan === "publisher" || channel.plan === "enterprise"
  const [adsense, setAdsense] = useState(channel.adsenseEnabled)

  function requestModeChange() {
    if (draftMode === "racing_only" && !declared) {
      setDeclError(true)
      return
    }
    setConfirmOpen(true)
  }
  function applyMode() {
    setLog((l) => [{ when: "Just now", who: "Sam Doherty", change: `${MODE_LABEL[mode]} → ${MODE_LABEL[draftMode]}` }, ...l])
    setMode(draftMode)
    setConfirmOpen(false)
    toast.success("Channel mode changed", { description: `${MODE_LABEL[draftMode]}. The change is logged.` })
  }

  const wageringForced = mode === "standard"

  return (
    <div>
      <Section
        id="mode"
        title="Channel mode"
        description="Decides whether wagering ads can ever run on your channel. Every change is logged with your name and the time, and our compliance team can see it."
      >
        <Panel>
          <RadioGroup
            value={draftMode}
            onValueChange={(v) => {
              setDraftMode(v as ChannelMode)
              setDeclError(false)
            }}
            className="gap-0 divide-y"
            aria-label="Channel mode"
          >
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
                {m.id === "racing_only" && draftMode === "racing_only" && (
                  <div className="mt-3 ml-7 grid gap-2">
                    <label className={cn("flex items-start gap-3 rounded-md border bg-background p-3", declError && "border-destructive")}>
                      <Checkbox
                        checked={declared}
                        onCheckedChange={(v) => {
                          setDeclared(v === true)
                          setDeclError(false)
                        }}
                        className="mt-0.5"
                        aria-describedby={declError ? "decl-error" : undefined}
                      />
                      <span className="text-[13px] leading-5">
                        I declare that {channel.name} covers horse, harness or greyhound racing only. I&apos;ll keep it that way, and I understand Homestand checks new content and may move the channel to Triple lock if it isn&apos;t.
                      </span>
                    </label>
                    {declError && (
                      <p id="decl-error" className="flex items-center gap-1.5 text-[13px] text-destructive">
                        <AlertCircle className="size-4 shrink-0" aria-hidden /> Tick the racing-only declaration to use this mode.
                      </p>
                    )}
                    {channel.sections.some((s) => !/racing|form|trainer/i.test(s.label)) && (
                      <p className="text-[13px] text-muted-foreground">
                        Heads up: your sections ({channel.sections.map((s) => s.label).join(", ")}) aren&apos;t racing. Racing-only is unlikely to be right for {channel.name}.
                      </p>
                    )}
                  </div>
                )}
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
            <Button size="sm" disabled={draftMode === mode} onClick={requestModeChange}>
              Change mode
            </Button>
          </PanelFooter>
        </Panel>
        <details className="group mt-3 text-[13px]">
          <summary className="cursor-pointer font-medium outline-none focus-visible:ring-2 focus-visible:ring-ring">Change log</summary>
          <ul className="mt-2 grid gap-1 text-muted-foreground">
            {log.map((e, i) => (
              <li key={i} className="flex flex-wrap gap-x-2">
                <span className="tabular">{e.when}</span>·<span>{e.who}</span>·<span className="text-foreground">{e.change}</span>
              </li>
            ))}
          </ul>
        </details>
      </Section>

      <Section id="triple-lock" title="How the triple lock works" description="Wagering ads only reach signed-in, age-verified adults who haven't opted out, so you can earn from them legally from 1 January 2027.">
        <div className="grid gap-3">
          <ol className="grid gap-2 sm:grid-cols-3">
            {LOCKS.map(({ Icon, title, body }, i) => (
              <li key={title} className="rounded-lg border bg-card p-4">
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
              <span className="font-semibold">Fail closed.</span> If any check fails, errors or takes too long, the slot gets a non-wagering ad instead. Live coverage never carries wagering ads, and every decision is logged as evidence.
            </p>
          </div>
        </div>
      </Section>

      <Section
        id="slots"
        title="Ad slots on your channel"
        description="Homestand places every ad. These are the only positions that exist, and each one reserves its space so pages never jump."
      >
        <AdSlotsDiagram />
        <FixedNote
          className="mt-3"
          title="Density cap"
          items={[
            "At most 1 ad per 600 words of article, and 3 ads on any page in total",
            "No pop-ups, interstitials, sticky overlays, auto-playing sound or AdSense Auto ads",
            "Every unit is labelled “Advertisement”, “Sponsored” or “Presented by”",
          ]}
        />
      </Section>

      <Section id="categories" title="Blocked ad categories" description="Switch on a category to keep those ads off your channel. Blocked slots are filled by other advertisers.">
        <Panel>
          {CATEGORIES.map((c) => {
            const isWagering = c.id === "wagering"
            const forced = isWagering && wageringForced
            const checked = forced || blocks.includes(c.id)
            return (
              <SettingRow
                key={c.id}
                htmlFor={`block-${c.id}`}
                label={
                  <span className="flex flex-wrap items-center gap-2">
                    Block {c.label.toLowerCase()} ads {forced && <Tag className="h-[18px] px-1.5 text-[10px]">Standard mode</Tag>}
                  </span>
                }
                description={forced ? "Always blocked in Standard mode, across direct ads, our network and AdSense." : c.description}
              >
                <Switch
                  id={`block-${c.id}`}
                  checked={checked}
                  disabled={forced}
                  onCheckedChange={(v) => setBlocks((b) => (v ? [...b, c.id] : b.filter((x) => x !== c.id)))}
                />
              </SettingRow>
            )
          })}
          <PanelFooter note="You can block categories, but you can't add slots.">
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

      <Section id="adsense" title="Google AdSense" description="Fill unsold slots with AdSense. It runs inside the same fixed slots and frames, with sensitive categories blocked to match your mode.">
        <Panel>
          <SettingRow
            htmlFor="adsense"
            label={
              <span className="flex flex-wrap items-center gap-2">
                Use AdSense in unsold slots {!adsenseAvailable && <Tag className="h-[18px] px-1.5 text-[10px]">Publisher plan</Tag>}
              </span>
            }
            description={
              adsenseAvailable ? (
                "Earnings appear in your own AdSense account."
              ) : (
                <>
                  Available on Publisher ($299 a month inc. GST) and up.{" "}
                  <Link href="/studio/settings/billing" className="font-medium text-foreground underline underline-offset-2">
                    Compare plans
                  </Link>
                </>
              )
            }
          >
            <Switch
              id="adsense"
              checked={adsense}
              disabled={!adsenseAvailable}
              onCheckedChange={(v) => {
                setAdsense(v)
                toast.success(v ? "AdSense on" : "AdSense off")
              }}
            />
          </SettingRow>
        </Panel>
      </Section>

      <Section id="earnings" title="How you're paid" description="Ad income is shared through a pool, not deal by deal.">
        <Panel>
          <div className="grid gap-3 p-4 sm:p-5">
            <div className="flex flex-wrap items-center gap-2">
              <p className="text-sm font-semibold">Pooled ad revenue share</p>
              <Tag>Next phase</Tag>
            </div>
            <p className="text-[13px] leading-5 text-muted-foreground">
              You never contract with wagering advertisers directly. Homestand sells every slot, and each month a share of net ad revenue is split between channels by verified watch minutes and article reads. Your pay doesn&apos;t depend on which ads ran on your channel.
            </p>
            <p className="text-[13px] leading-5 text-muted-foreground">Payouts start in the next phase. Your verified minutes are already being counted.</p>
          </div>
        </Panel>
      </Section>

      <Dialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              Change to {MODE_LABEL[draftMode]}?
            </DialogTitle>
            <DialogDescription>
              {draftMode === "standard"
                ? "Wagering ads stop on your channel within a minute, across direct ads, our network and AdSense."
                : draftMode === "triple_lock"
                  ? "Wagering ads can start reaching signed-in viewers confirmed 18+ who haven't opted out. Everyone else sees non-wagering ads."
                  : "Your racing-only declaration is recorded. We'll check new content and ask you to review the declaration each quarter."}{" "}
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
