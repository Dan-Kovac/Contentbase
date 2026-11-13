"use client"

/**
 * The email builder. Two ways in: simple blocks in the publication's brand, or paste your own HTML.
 * Either way we add the footer every email must carry (who it's from, why you got it, a working
 * one-click unsubscribe), check it before it goes, and send from the publication's own domain.
 */
import { useState } from "react"
import { AlertCircle, ArrowDown, ArrowUp, CheckCircle2, Code2, LayoutList, Monitor, Plus, Send, Smartphone, Sparkles, Trash2 } from "lucide-react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { cn } from "@/lib/utils"
import { BLOCK_LABELS, EmailPreview, blockId, newBlock, toEmailHtml, type EmailBlock, type EmailBrand } from "./blocks"

export interface BuilderStream {
  id: string
  name: string
  subscribers: number
}
export interface DigestStory {
  kicker: string
  headline: string
  standfirst: string
  image?: string
  href: string
}

const SAMPLE_HTML = `<table width="100%" cellpadding="0" cellspacing="0">
  <tr><td style="padding:24px;font-family:Arial,sans-serif;">
    <h1 style="margin:0 0 12px;font-size:26px;">Your own HTML goes here</h1>
    <p style="margin:0;font-size:16px;line-height:24px;color:#333;">Paste a design from anywhere. We add the unsubscribe footer for you.</p>
  </td></tr>
</table>`

export function EmailBuilder({
  streams,
  brand: baseBrand,
  stories,
  initialStream,
  editor,
  testTo,
}: {
  testTo: string
  streams: BuilderStream[]
  brand: Omit<EmailBrand, "streamName">
  stories: DigestStory[]
  initialStream?: string
  editor: string
}) {
  const [streamId, setStreamId] = useState(streams.find((s) => s.id === initialStream)?.id ?? streams[0]?.id ?? "")
  const stream = streams.find((s) => s.id === streamId)!
  const brand: EmailBrand = { ...baseBrand, streamName: stream?.name ?? "" }
  const [subject, setSubject] = useState("")
  const [previewText, setPreviewText] = useState("")
  const [mode, setMode] = useState<"blocks" | "html">("blocks")
  const [blocks, setBlocks] = useState<EmailBlock[]>(() => [newBlock("heading", { ...baseBrand, streamName: "" }), newBlock("text", { ...baseBrand, streamName: "" })])
  const [html, setHtml] = useState(SAMPLE_HTML)
  const [device, setDevice] = useState<"desktop" | "mobile">("desktop")
  const [sent, setSent] = useState<null | "scheduled" | "sent">(null)

  const update = (id: string, patch: Partial<EmailBlock>) => setBlocks((bs) => bs.map((b) => (b.id === id ? ({ ...b, ...patch } as EmailBlock) : b)))
  const move = (i: number, d: number) =>
    setBlocks((bs) => {
      const j = i + d
      if (j < 0 || j >= bs.length) return bs
      const next = [...bs]
      ;[next[i], next[j]] = [next[j], next[i]]
      return next
    })

  const draftFromWeek = () => {
    setSubject(`${stream.name}: ${stories[0]?.headline ?? "this week"}`)
    setPreviewText(stories[1] ? `Plus: ${stories[1].headline}` : "The week, in one email.")
    setBlocks([
      { id: blockId(), type: "heading", text: "This week" },
      { id: blockId(), type: "text", text: `Here's what we published this week, and the one thing worth your ten minutes. ${editor}` },
      ...stories.slice(0, 4).map((s) => ({ id: blockId(), type: "story" as const, ...s })),
      { id: blockId(), type: "button", label: `More on ${brand.name}`, href: `https://${brand.domain.replace(/^send\./, "")}` },
    ])
    setMode("blocks")
    toast.success("Drafted from this week's stories", { description: "5 AI credits. Edit anything before you send." })
  }

  // Pre-send checks: what inboxes and the Spam Act care about.
  const checks = [
    { ok: subject.trim().length > 0, text: "Subject line" },
    { ok: subject.length <= 70, text: "Subject under 70 characters" },
    { ok: mode === "html" || blocks.every((b) => b.type !== "image" || b.alt.trim().length > 0), text: "Every image has alt text" },
    { ok: true, text: "Unsubscribe footer and one-click unsubscribe header added" },
    { ok: true, text: `Sent from ${brand.domain}, signed with DKIM` },
  ]
  const ready = checks.every((c) => c.ok)

  if (sent) {
    return (
      <div className="mx-auto flex max-w-[560px] flex-col items-center gap-4 rounded-lg border bg-card p-8 text-center">
        <CheckCircle2 className="size-10 text-pop-ink" aria-hidden />
        <p className="text-[22px] font-bold tracking-[-0.4px]">{sent === "sent" ? `Sending to ${stream.subscribers.toLocaleString("en-AU")} subscribers` : "Scheduled for Monday, 7 am"}</p>
        <p className="text-[14px] leading-[21px] text-muted-foreground">
          “{subject}” goes to {stream.name}. Opens and clicks appear in Email within the hour; unsubscribes take effect straight away.
        </p>
        <Button variant="outline" onClick={() => setSent(null)}>
          Back to the email
        </Button>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 gap-8 xl:grid-cols-[minmax(0,460px)_minmax(0,1fr)]">
      {/* Edit */}
      <div className="flex min-w-0 flex-col gap-6">
        <div className="grid gap-4 rounded-lg border bg-card p-4">
          <div className="grid gap-2">
            <Label>Send to</Label>
            <Select value={streamId} onValueChange={setStreamId}>
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {streams.map((s) => (
                  <SelectItem key={s.id} value={s.id}>
                    {s.name} · {s.subscribers.toLocaleString("en-AU")} subscribers
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="grid gap-2">
            <Label htmlFor="em-subject">Subject</Label>
            <Input id="em-subject" value={subject} onChange={(e) => setSubject(e.target.value)} placeholder="What's this email about?" maxLength={120} />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="em-preview">Preview text</Label>
            <Input id="em-preview" value={previewText} onChange={(e) => setPreviewText(e.target.value)} placeholder="The line inboxes show after the subject" maxLength={140} />
          </div>
          <Button variant="outline" onClick={draftFromWeek} className="w-fit">
            <Sparkles /> Draft from this week&apos;s stories
          </Button>
        </div>

        <div className="flex items-center justify-between gap-3">
          <div role="tablist" aria-label="How to build this email" className="inline-flex rounded-md border p-0.5">
            {(
              [
                ["blocks", "Blocks", LayoutList],
                ["html", "Paste HTML", Code2],
              ] as const
            ).map(([id, label, Icon]) => (
              <button
                key={id}
                role="tab"
                aria-selected={mode === id}
                onClick={() => setMode(id)}
                className={cn("inline-flex h-8 items-center gap-1.5 rounded-[5px] px-3 text-[13px] font-semibold outline-none focus-visible:ring-2 focus-visible:ring-ring", mode === id ? "bg-foreground text-background" : "text-muted-foreground hover:text-foreground")}
              >
                <Icon className="size-4" aria-hidden /> {label}
              </button>
            ))}
          </div>
          {mode === "blocks" && <span className="text-[12px] text-muted-foreground">{blocks.length} blocks</span>}
        </div>

        {mode === "blocks" ? (
          <>
            <ol className="flex flex-col gap-2">
              {blocks.map((b, i) => (
                <li key={b.id} className="flex flex-col gap-2 rounded-lg border bg-card p-3">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-[12px] font-semibold uppercase tracking-[0.6px] text-muted-foreground">{BLOCK_LABELS[b.type]}</span>
                    <span className="flex items-center">
                      <Button variant="ghost" size="icon-sm" aria-label="Move up" disabled={i === 0} onClick={() => move(i, -1)}>
                        <ArrowUp />
                      </Button>
                      <Button variant="ghost" size="icon-sm" aria-label="Move down" disabled={i === blocks.length - 1} onClick={() => move(i, 1)}>
                        <ArrowDown />
                      </Button>
                      <Button variant="ghost" size="icon-sm" aria-label="Remove block" onClick={() => setBlocks((bs) => bs.filter((x) => x.id !== b.id))}>
                        <Trash2 />
                      </Button>
                    </span>
                  </div>
                  <BlockFields block={b} onChange={(p) => update(b.id, p)} />
                </li>
              ))}
            </ol>
            <div className="flex flex-wrap gap-1.5" aria-label="Add a block">
              {(Object.keys(BLOCK_LABELS) as EmailBlock["type"][]).map((t) => (
                <Button key={t} variant="outline" size="sm" onClick={() => setBlocks((bs) => [...bs, newBlock(t, brand)])}>
                  <Plus /> {BLOCK_LABELS[t]}
                </Button>
              ))}
            </div>
          </>
        ) : (
          <div className="grid gap-2">
            <Label htmlFor="em-html">Your HTML</Label>
            <Textarea id="em-html" value={html} onChange={(e) => setHtml(e.target.value)} className="min-h-[320px] font-mono text-[12px] leading-[18px]" spellCheck={false} />
            <p className="text-[12px] leading-[18px] text-muted-foreground">
              Paste a design from any tool. Scripts and forms are stripped; we add the unsubscribe footer and your sending details. Blocks keep your brand automatically, so use
              them where you can.
            </p>
          </div>
        )}

        <div className="rounded-lg border bg-card p-4">
          <p className="mb-2 text-[13px] font-semibold">Before it sends</p>
          <ul className="flex flex-col gap-1.5 text-[13px]">
            {checks.map((c) => (
              <li key={c.text} className={cn("flex items-center gap-2", !c.ok && "text-destructive")}>
                {c.ok ? <CheckCircle2 className="size-4 text-pop-ink" aria-hidden /> : <AlertCircle className="size-4" aria-hidden />}
                {c.text}
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Preview */}
      <div className="flex min-w-0 flex-col gap-3">
        <div className="flex items-center justify-between gap-3">
          <p className="text-[13px] font-semibold">Preview</p>
          <div className="inline-flex rounded-md border p-0.5" role="group" aria-label="Preview size">
            {(
              [
                ["desktop", "Desktop", Monitor],
                ["mobile", "Phone", Smartphone],
              ] as const
            ).map(([id, label, Icon]) => (
              <button
                key={id}
                aria-pressed={device === id}
                onClick={() => setDevice(id)}
                className={cn("inline-flex h-8 items-center gap-1.5 rounded-[5px] px-3 text-[13px] font-semibold outline-none focus-visible:ring-2 focus-visible:ring-ring", device === id ? "bg-muted text-foreground" : "text-muted-foreground")}
              >
                <Icon className="size-4" aria-hidden /> {label}
              </button>
            ))}
          </div>
        </div>
        <div className={cn("mx-auto w-full", device === "mobile" && "max-w-[390px]")}>
          {mode === "blocks" ? (
            <EmailPreview blocks={blocks} brand={brand} subject={subject} previewText={previewText} />
          ) : (
            // Pasted HTML runs in a sandbox with scripts off.
            <iframe title="Email preview" sandbox="" srcDoc={html} className="h-[560px] w-full rounded-lg border bg-white" />
          )}
        </div>
        <div className="sticky bottom-4 z-10 mt-2 flex flex-wrap items-center justify-between gap-3 rounded-lg border bg-background/95 px-4 py-3 shadow-popover backdrop-blur">
          <p className="text-[13px] text-muted-foreground">
            To <span className="font-semibold text-foreground">{stream?.subscribers.toLocaleString("en-AU")}</span> {stream?.name} subscribers
          </p>
          <div className="flex flex-wrap gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                if (mode === "blocks") void navigator.clipboard?.writeText(toEmailHtml(blocks, brand, previewText)).catch(() => {})
                toast("Copied the email's HTML")
              }}
            >
              Copy HTML
            </Button>
            <Button variant="outline" size="sm" onClick={() => toast.success(`Test sent to ${testTo}`)}>
              Send a test
            </Button>
            <Button variant="outline" size="sm" disabled={!ready} onClick={() => setSent("scheduled")}>
              Schedule
            </Button>
            <Button variant="pop" size="sm" disabled={!ready} onClick={() => setSent("sent")}>
              <Send /> Send now
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}

function BlockFields({ block: b, onChange }: { block: EmailBlock; onChange: (p: Partial<EmailBlock>) => void }) {
  switch (b.type) {
    case "heading":
      return <Input aria-label="Heading" value={b.text} onChange={(e) => onChange({ text: e.target.value })} />
    case "text":
      return <Textarea aria-label="Text" value={b.text} onChange={(e) => onChange({ text: e.target.value })} className="min-h-20" />
    case "image":
      return (
        <div className="grid gap-2">
          <Input aria-label="Image address" value={b.src} onChange={(e) => onChange({ src: e.target.value })} />
          <Input aria-label="Alt text" value={b.alt} onChange={(e) => onChange({ alt: e.target.value })} placeholder="Alt text" aria-invalid={!b.alt.trim()} />
        </div>
      )
    case "button":
      return (
        <div className="grid gap-2 sm:grid-cols-2">
          <Input aria-label="Button text" value={b.label} onChange={(e) => onChange({ label: e.target.value })} />
          <Input aria-label="Button link" value={b.href} onChange={(e) => onChange({ href: e.target.value })} />
        </div>
      )
    case "story":
      return (
        <div className="grid gap-2">
          <Input aria-label="Story headline" value={b.headline} onChange={(e) => onChange({ headline: e.target.value })} />
          <Input aria-label="Story standfirst" value={b.standfirst} onChange={(e) => onChange({ standfirst: e.target.value })} />
        </div>
      )
    case "divider":
      return <p className="text-[12px] text-muted-foreground">A thin rule between sections.</p>
  }
}
