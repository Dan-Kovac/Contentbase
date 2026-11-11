"use client"

import { useEffect, useRef, useState } from "react"
import {
  ArrowDown,
  ArrowUp,
  Check,
  Heading2,
  List,
  Minus,
  MoreHorizontal,
  Pilcrow,
  Plus,
  Quote,
  RotateCcw,
  Sparkles,
  Trash2,
  TriangleAlert,
  X,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { VideoThumb } from "@/components/brand/media"
import { cn } from "@/lib/utils"
import type { Block } from "@/lib/types"
import { ASSIST_LABELS, type AssistAction, fixText, headlineIdeas, suggestFor } from "./assist"
import type { ArticleState, ArticleUpdate, EBlock, EFlag } from "./types"
import { ChaptersEditor } from "./chapters-editor"

let uid = 1000
const newId = () => `b${uid++}`

const BLOCK_TYPES: { type: Block["type"]; label: string; icon: typeof Pilcrow }[] = [
  { type: "paragraph", label: "Paragraph", icon: Pilcrow },
  { type: "heading", label: "Heading", icon: Heading2 },
  { type: "quote", label: "Quote", icon: Quote },
  { type: "list", label: "List", icon: List },
  { type: "divider", label: "Divider", icon: Minus },
]

function emptyBlock(type: Block["type"]): Block {
  switch (type) {
    case "heading":
      return { type: "heading", text: "" }
    case "quote":
      return { type: "quote", text: "", cite: "" }
    case "list":
      return { type: "list", items: [""] }
    case "divider":
      return { type: "divider" }
    default:
      return { type: "paragraph", text: "" }
  }
}

const FLAG_TITLE: Record<string, string> = {
  odds: "Odds mentioned",
  bet_now: "“Bet now” language",
  bet_cta: "Call to bet",
  bookmaker: "Bookmaker named",
}

type Suggestion = { status: "loading"; action: AssistAction } | { status: "ready"; action: AssistAction; block: Block; seed: number }

export function ArticleEditor({
  article,
  update,
  title,
  videoTone,
  durationSec,
  source,
  canUndo,
  canRedo,
  onUndo,
  onRedo,
}: {
  article: ArticleState
  update: ArticleUpdate
  title: string
  videoTone: string
  durationSec: number
  source: "youtube" | "upload"
  canUndo: boolean
  canRedo: boolean
  onUndo: () => void
  onRedo: () => void
}) {
  const [suggestions, setSuggestions] = useState<Record<string, Suggestion>>({})
  const [custom, setCustom] = useState("")
  const ideaIndex = useRef(0)
  const timers = useRef<number[]>([])
  useEffect(() => () => timers.current.forEach((t) => window.clearTimeout(t)), [])

  const openFlags = article.flags.filter((f) => f.state === "open")
  const paraNumber = (id: string) => {
    let n = 0
    for (const b of article.blocks) {
      if (b.block.type === "paragraph") n++
      if (b.id === id) return n
    }
    return n
  }

  const setBlock = (id: string, block: Block, history = false) =>
    update((s) => ({ ...s, blocks: s.blocks.map((b) => (b.id === id ? { ...b, block } : b)) }), { history })

  const runAssist = (b: EBlock, action: AssistAction, seed = 0) => {
    setSuggestions((s) => ({ ...s, [b.id]: { status: "loading", action } }))
    const t = window.setTimeout(() => {
      setSuggestions((s) => ({
        ...s,
        [b.id]: { status: "ready", action, seed, block: suggestFor(b.block, action, article.keyPoints, seed) },
      }))
    }, 650)
    timers.current.push(t)
  }

  const clearSuggestion = (id: string) =>
    setSuggestions((s) => {
      const n = { ...s }
      delete n[id]
      return n
    })

  const insertAfter = (index: number, type: Block["type"]) =>
    update(
      (s) => {
        const blocks = [...s.blocks]
        blocks.splice(index + 1, 0, { id: newId(), block: emptyBlock(type) })
        return { ...s, blocks }
      },
      { history: true },
    )

  const move = (index: number, dir: -1 | 1) =>
    update(
      (s) => {
        const blocks = [...s.blocks]
        const j = index + dir
        if (j < 0 || j >= blocks.length) return s
        ;[blocks[index], blocks[j]] = [blocks[j], blocks[index]]
        return { ...s, blocks }
      },
      { history: true },
    )

  const remove = (id: string) =>
    update(
      (s) => ({
        ...s,
        blocks: s.blocks.filter((b) => b.id !== id),
        flags: s.flags.map((f) => (f.blockId === id ? { ...f, state: "dismissed" as const } : f)),
      }),
      { history: true },
    )

  const resolveFlag = (flag: EFlag, how: "fixed" | "dismissed") =>
    update(
      (s) => {
        let blocks = s.blocks
        if (how === "fixed") {
          blocks = s.blocks.map((b) =>
            b.id === flag.blockId && b.block.type === "paragraph" ? { ...b, block: { ...b.block, text: fixText(b.block.text, flag) } } : b,
          )
        }
        return { ...s, blocks, flags: s.flags.map((f) => (f.id === flag.id ? { ...f, state: how } : f)) }
      },
      { history: true },
    )

  const suggestHeadline = () => {
    const ideas = headlineIdeas(title, article.keyPoints).filter((i) => !article.headlineOptions.includes(i))
    if (!ideas.length) return
    const idea = ideas[ideaIndex.current++ % ideas.length]
    update((s) => ({ ...s, headlineOptions: [...s.headlineOptions, idea], headline: idea }), { history: true })
  }

  return (
    <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_300px] xl:grid-cols-[minmax(0,1fr)_340px]">
      <div className="min-w-0 max-w-[760px]">
        {/* Headline options (ING-04) */}
        <section aria-labelledby="headline-h">
          <div className="mb-3 flex items-center justify-between gap-3">
            <h2 id="headline-h" className="kicker text-foreground">
              Headline
            </h2>
            <Button variant="ghost" size="sm" onClick={suggestHeadline}>
              <Sparkles /> Suggest another
            </Button>
          </div>
          <RadioGroup
            value={article.headline}
            onValueChange={(v) => update((s) => ({ ...s, headline: v }))}
            className="gap-2"
            aria-label="Headline options"
          >
            {article.headlineOptions.map((h, i) => {
              const id = `hl-${i}`
              const on = h === article.headline
              return (
                <Label
                  key={h + i}
                  htmlFor={id}
                  className={cn(
                    "flex cursor-pointer items-start gap-3 rounded-lg border px-3.5 py-3 text-[15px] font-semibold leading-[21px] transition-colors hover:bg-accent/60",
                    on && "border-foreground bg-card hover:bg-card",
                  )}
                >
                  <RadioGroupItem id={id} value={h} className="mt-0.5" />
                  <span className="flex-1">{h}</span>
                  <span className="shrink-0 pt-0.5 text-xs font-normal text-muted-foreground tabular">{h.length} chars</span>
                </Label>
              )
            })}
          </RadioGroup>
          <form
            className="mt-2 flex gap-2"
            onSubmit={(e) => {
              e.preventDefault()
              const v = custom.trim()
              if (!v) return
              update((s) => ({ ...s, headlineOptions: [...s.headlineOptions, v], headline: v }), { history: true })
              setCustom("")
            }}
          >
            <Input value={custom} onChange={(e) => setCustom(e.target.value)} placeholder="Write your own headline" aria-label="Write your own headline" />
            <Button type="submit" variant="outline" disabled={!custom.trim()}>
              Add
            </Button>
          </form>
        </section>

        {/* Standfirst */}
        <section className="mt-8" aria-labelledby="standfirst-h">
          <h2 id="standfirst-h" className="kicker mb-3 text-foreground">
            Standfirst
          </h2>
          <textarea
            value={article.standfirst}
            onChange={(e) => update((s) => ({ ...s, standfirst: e.target.value }))}
            aria-labelledby="standfirst-h"
            rows={2}
            className="field-sizing-content w-full resize-none rounded-md border border-transparent bg-transparent px-3 py-2 font-serif text-[19px] leading-[28px] text-muted-foreground outline-none transition-colors hover:border-border focus-visible:border-input focus-visible:text-foreground focus-visible:ring-2 focus-visible:ring-ring/30"
          />
        </section>

        {/* Body */}
        <section className="mt-8" aria-labelledby="body-h">
          <div className="mb-3 flex items-center justify-between gap-3">
            <h2 id="body-h" className="kicker text-foreground">
              Article
            </h2>
            <div className="flex items-center gap-1">
              <Button variant="ghost" size="icon-sm" onClick={onUndo} disabled={!canUndo} aria-label="Undo">
                <RotateCcw />
              </Button>
              <Button variant="ghost" size="icon-sm" onClick={onRedo} disabled={!canRedo} aria-label="Redo">
                <RotateCcw className="-scale-x-100" />
              </Button>
            </div>
          </div>
          <ol className="grid gap-1">
            {article.blocks.map((b, i) => {
              const flags = article.flags.filter((f) => f.blockId === b.id && f.state === "open")
              const sug = suggestions[b.id]
              return (
                <li key={b.id} className="group/block relative">
                  <div
                    className={cn(
                      "relative flex gap-1 rounded-md pl-1 transition-colors focus-within:bg-accent/40 hover:bg-accent/40 sm:pl-0",
                      flags.length && "bg-destructive/[0.04] ring-1 ring-destructive/40 hover:bg-destructive/[0.06]",
                    )}
                  >
                    <div className="min-w-0 flex-1 py-1 pr-1">
                      <BlockBody block={b.block} flags={flags} onChange={(nb) => setBlock(b.id, nb)} index={i} />
                    </div>
                    <div className="order-last flex shrink-0 flex-col items-center sm:contents">
                    <BlockMenu
                      index={i}
                      count={article.blocks.length}
                      onMove={(d) => move(i, d)}
                      onDelete={() => remove(b.id)}
                      onInsert={(t) => insertAfter(i, t)}
                      type={b.block.type}
                    />
                    {b.block.type !== "divider" && b.block.type !== "video" && b.block.type !== "image" && (
                      <AssistMenu disabled={sug?.status === "loading"} onPick={(a) => runAssist(b, a)} />
                    )}
                    </div>
                  </div>

                  {sug && (
                    <SuggestionPanel
                      suggestion={sug}
                      onAccept={(nb) => {
                        setBlock(b.id, nb, true)
                        clearSuggestion(b.id)
                      }}
                      onReject={() => clearSuggestion(b.id)}
                      onRetry={() => runAssist(b, sug.action, (sug.status === "ready" ? sug.seed : 0) + 1)}
                    />
                  )}

                  {flags.map((f) => (
                    <div key={f.id} role="note" className="mt-2 mb-3 flex flex-col gap-3 rounded-md border border-destructive/50 bg-card p-3 sm:flex-row sm:items-start">
                      <TriangleAlert className="mt-0.5 hidden size-4 shrink-0 text-destructive sm:block" aria-hidden />
                      <div className="min-w-0 flex-1 text-[13px] leading-5">
                        <p className="font-semibold text-destructive">
                          {FLAG_TITLE[f.kind]} in paragraph {paraNumber(b.id)}
                        </p>
                        <p className="mt-0.5 text-muted-foreground">{f.message}</p>
                        <p className="mt-1.5 font-serif italic">&ldquo;{f.excerpt}&rdquo;</p>
                      </div>
                      <div className="flex shrink-0 gap-2">
                        <Button size="sm" variant="ghost" onClick={() => resolveFlag(f, "dismissed")}>
                          Dismiss
                        </Button>
                        <Button size="sm" onClick={() => resolveFlag(f, "fixed")}>
                          Fix
                        </Button>
                      </div>
                    </div>
                  ))}
                </li>
              )
            })}
          </ol>
          <AddBlock onAdd={(t) => insertAfter(article.blocks.length - 1, t)} />
        </section>

        {/* Key points */}
        <section className="mt-10" aria-labelledby="kp-h">
          <h2 id="kp-h" className="kicker mb-3 text-foreground">
            Key points
          </h2>
          <ListEditor
            items={article.keyPoints.length ? article.keyPoints : [""]}
            onChange={(items) => update((s) => ({ ...s, keyPoints: items }))}
            label="Key point"
          />
        </section>
      </div>

      {/* Right rail: video, chapters, checks */}
      <aside className="grid content-start gap-4 lg:sticky lg:top-20 lg:self-start">
        <ChaptersEditor
          chapters={article.chapters}
          onChange={(chapters) => update((s) => ({ ...s, chapters }))}
          tone={videoTone}
          durationSec={durationSec}
          source={source}
        />
        <div className="rounded-lg border bg-card p-4">
          <p className="text-sm font-semibold">Compliance pre-check</p>
          {openFlags.length ? (
            <p className="mt-1.5 flex items-start gap-2 text-[13px] leading-5 text-destructive">
              <TriangleAlert className="mt-0.5 size-3.5 shrink-0" aria-hidden />
              {openFlags.length} {openFlags.length === 1 ? "flag" : "flags"} to resolve before you publish
            </p>
          ) : (
            <p className="mt-1.5 flex items-center gap-2 text-[13px] text-muted-foreground">
              <span className="size-[7px] bg-pop-ink" aria-hidden /> No odds, betting calls to action or bookmakers found
            </p>
          )}
          <p className="mt-3 border-t pt-3 text-xs leading-[18px] text-muted-foreground">
            We check drafts for odds, calls to bet, named bookmakers and &ldquo;bet now&rdquo; language.
          </p>
        </div>
      </aside>
    </div>
  )
}

function BlockBody({
  block,
  flags,
  onChange,
  index,
}: {
  block: Block
  flags: EFlag[]
  onChange: (b: Block) => void
  index: number
}) {
  const base =
    "field-sizing-content block w-full resize-none bg-transparent px-2 py-1 outline-none placeholder:text-muted-foreground/70"
  switch (block.type) {
    case "paragraph":
      return (
        <HighlightArea
          value={block.text}
          marks={flags.map((f) => f.excerpt)}
          onChange={(text) => onChange({ ...block, text })}
          className="font-serif text-[17px] leading-[28px]"
          label={`Paragraph ${index + 1}`}
          placeholder="Write a paragraph"
        />
      )
    case "heading":
      return (
        <textarea
          rows={1}
          value={block.text}
          aria-label={`Heading, block ${index + 1}`}
          placeholder="Heading"
          onChange={(e) => onChange({ ...block, text: e.target.value.replace(/\n/g, "") })}
          className={cn(base, "pt-3 text-[22px] font-bold leading-[28px] tracking-[-0.3px]")}
        />
      )
    case "quote":
      return (
        <div className="my-1 border-l-[3px] border-foreground pl-3">
          <textarea
            rows={1}
            value={block.text}
            aria-label={`Quote, block ${index + 1}`}
            placeholder="Quote"
            onChange={(e) => onChange({ ...block, text: e.target.value })}
            className={cn(base, "font-serif text-[21px] italic leading-[30px]")}
          />
          <input
            value={block.cite ?? ""}
            onChange={(e) => onChange({ ...block, cite: e.target.value })}
            placeholder="Who said it"
            aria-label="Quote attribution"
            className="w-full bg-transparent px-2 py-0.5 text-[13px] font-semibold text-muted-foreground outline-none"
          />
        </div>
      )
    case "list":
      return <ListEditor items={block.items} onChange={(items) => onChange({ ...block, items })} label="List item" serif />
    case "divider":
      return (
        <div className="px-2 py-4" role="separator">
          <hr className="border-border" />
        </div>
      )
    case "video":
      return <div className="px-2 py-1 text-sm text-muted-foreground">Video embed</div>
    case "image":
      return <div className="px-2 py-1 text-sm text-muted-foreground">Image: {block.caption}</div>
  }
}

/** A textarea with flagged phrases highlighted behind the text. */
function HighlightArea({
  value,
  marks,
  onChange,
  className,
  label,
  placeholder,
}: {
  value: string
  marks: string[]
  onChange: (v: string) => void
  className: string
  label: string
  placeholder: string
}) {
  const parts: { t: string; m: boolean }[] = []
  if (marks.length) {
    let rest = value
    while (rest.length) {
      let best = -1
      let len = 0
      for (const m of marks) {
        const at = rest.indexOf(m)
        if (at !== -1 && (best === -1 || at < best)) {
          best = at
          len = m.length
        }
      }
      if (best === -1) {
        parts.push({ t: rest, m: false })
        break
      }
      if (best) parts.push({ t: rest.slice(0, best), m: false })
      parts.push({ t: rest.slice(best, best + len), m: true })
      rest = rest.slice(best + len)
    }
  }
  return (
    <div className="relative">
      {marks.length > 0 && (
        <div aria-hidden className={cn("pointer-events-none absolute inset-0 whitespace-pre-wrap break-words px-2 py-1 text-transparent", className)}>
          {parts.map((p, i) =>
            p.m ? (
              <mark key={i} className="rounded-[2px] bg-destructive/15 text-transparent underline decoration-destructive decoration-2 underline-offset-4">
                {p.t}
              </mark>
            ) : (
              <span key={i}>{p.t}</span>
            ),
          )}
        </div>
      )}
      <textarea
        rows={1}
        value={value}
        aria-label={label}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
        className={cn(
          "field-sizing-content relative block w-full resize-none bg-transparent px-2 py-1 outline-none placeholder:text-muted-foreground/70",
          className,
        )}
      />
    </div>
  )
}

function ListEditor({
  items,
  onChange,
  label,
  serif,
}: {
  items: string[]
  onChange: (items: string[]) => void
  label: string
  serif?: boolean
}) {
  const refs = useRef<(HTMLTextAreaElement | null)[]>([])
  const focusAt = useRef<number | null>(null)
  useEffect(() => {
    if (focusAt.current != null) {
      refs.current[focusAt.current]?.focus()
      focusAt.current = null
    }
  })
  return (
    <ul className="grid gap-0.5">
      {items.map((it, i) => (
        <li key={i} className="flex items-start gap-2.5 pl-2">
          <span className={cn("size-[5px] shrink-0 rounded-full bg-foreground", serif ? "mt-[16px]" : "mt-[13px]")} aria-hidden />
          <textarea
            rows={1}
            ref={(el) => {
              refs.current[i] = el
            }}
            value={it}
            aria-label={`${label} ${i + 1}`}
            placeholder={label}
            onChange={(e) => onChange(items.map((x, j) => (j === i ? e.target.value.replace(/\n/g, "") : x)))}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault()
                const next = [...items]
                next.splice(i + 1, 0, "")
                focusAt.current = i + 1
                onChange(next)
              } else if (e.key === "Backspace" && !it && items.length > 1) {
                e.preventDefault()
                focusAt.current = Math.max(0, i - 1)
                onChange(items.filter((_, j) => j !== i))
              }
            }}
            className={cn(
              "field-sizing-content min-w-0 flex-1 resize-none rounded-sm bg-transparent px-1 py-1 outline-none focus-visible:bg-accent/60",
              serif ? "font-serif text-[17px] leading-[26px]" : "text-[15px] leading-[22px]",
            )}
          />
        </li>
      ))}
    </ul>
  )
}

function BlockMenu({
  index,
  count,
  type,
  onMove,
  onDelete,
  onInsert,
}: {
  index: number
  count: number
  type: Block["type"]
  onMove: (d: -1 | 1) => void
  onDelete: () => void
  onInsert: (t: Block["type"]) => void
}) {
  const Icon = BLOCK_TYPES.find((t) => t.type === type)?.icon ?? Pilcrow
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon-sm"
          className="mt-1 shrink-0 text-muted-foreground opacity-100 transition-opacity sm:absolute sm:-left-8 sm:top-0 group-focus-within/block:opacity-100 group-hover/block:opacity-100 data-[state=open]:opacity-100 sm:opacity-0"
          aria-label={`Block ${index + 1} options`}
        >
          <Icon />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="w-48">
        <DropdownMenuSub>
          <DropdownMenuSubTrigger>
            <Plus /> Add block below
          </DropdownMenuSubTrigger>
          <DropdownMenuSubContent>
            {BLOCK_TYPES.map((t) => (
              <DropdownMenuItem key={t.type} onSelect={() => onInsert(t.type)}>
                <t.icon /> {t.label}
              </DropdownMenuItem>
            ))}
          </DropdownMenuSubContent>
        </DropdownMenuSub>
        <DropdownMenuSeparator />
        <DropdownMenuItem disabled={index === 0} onSelect={() => onMove(-1)}>
          <ArrowUp /> Move up
        </DropdownMenuItem>
        <DropdownMenuItem disabled={index === count - 1} onSelect={() => onMove(1)}>
          <ArrowDown /> Move down
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem variant="destructive" onSelect={onDelete}>
          <Trash2 /> Delete block
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

function AssistMenu({ onPick, disabled }: { onPick: (a: AssistAction) => void; disabled?: boolean }) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          disabled={disabled}
          className="mt-1 h-7 shrink-0 gap-1 px-2 text-xs text-muted-foreground opacity-100 transition-opacity group-focus-within/block:opacity-100 group-hover/block:opacity-100 data-[state=open]:opacity-100 sm:opacity-0"
        >
          <Sparkles className="size-3.5" />
          <span className="hidden sm:inline">AI assist</span>
          <span className="sr-only sm:hidden">AI assist</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48">
        <DropdownMenuLabel className="text-xs font-medium text-muted-foreground">AI assist</DropdownMenuLabel>
        {(["rewrite", "shorten", "expand"] as const).map((a) => (
          <DropdownMenuItem key={a} onSelect={() => onPick(a)}>
            {ASSIST_LABELS[a]}
          </DropdownMenuItem>
        ))}
        <DropdownMenuSub>
          <DropdownMenuSubTrigger>Change tone</DropdownMenuSubTrigger>
          <DropdownMenuSubContent>
            {(["tone_plain", "tone_punchy", "tone_formal"] as const).map((a) => (
              <DropdownMenuItem key={a} onSelect={() => onPick(a)}>
                {ASSIST_LABELS[a]}
              </DropdownMenuItem>
            ))}
          </DropdownMenuSubContent>
        </DropdownMenuSub>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

function blockText(b: Block) {
  if (b.type === "list") return b.items.join("\n")
  if ("text" in b) return b.text
  return ""
}

function SuggestionPanel({
  suggestion,
  onAccept,
  onReject,
  onRetry,
}: {
  suggestion: Suggestion
  onAccept: (b: Block) => void
  onReject: () => void
  onRetry: () => void
}) {
  const label = ASSIST_LABELS[suggestion.action]
  return (
    <div className="mt-1 mb-3 overflow-hidden rounded-md border bg-card" role="status" aria-live="polite">
      <div className="flex items-center gap-2 border-b bg-muted/60 px-3 py-1.5 text-xs font-semibold">
        <Sparkles className="size-3.5 text-pop-ink" aria-hidden />
        Suggestion · {label}
      </div>
      {suggestion.status === "loading" ? (
        <div className="grid gap-2 p-3" aria-label="Drafting a suggestion">
          <div className="h-3 w-11/12 animate-pulse rounded-sm bg-muted" />
          <div className="h-3 w-4/5 animate-pulse rounded-sm bg-muted" />
          <div className="h-3 w-2/3 animate-pulse rounded-sm bg-muted" />
        </div>
      ) : (
        <>
          <p className="whitespace-pre-line px-3 py-3 font-serif text-[16px] leading-[26px]">{blockText(suggestion.block)}</p>
          <div className="flex flex-wrap items-center justify-end gap-2 border-t px-3 py-2">
            <Button size="sm" variant="ghost" onClick={onRetry} className="mr-auto">
              <RotateCcw /> Try again
            </Button>
            <Button size="sm" variant="outline" onClick={onReject}>
              <X /> Reject
            </Button>
            <Button size="sm" onClick={() => onAccept(suggestion.block)}>
              <Check /> Accept
            </Button>
          </div>
        </>
      )}
    </div>
  )
}

function AddBlock({ onAdd }: { onAdd: (t: Block["type"]) => void }) {
  return (
    <div className="mt-3 flex flex-wrap items-center gap-1 border-t border-dashed pt-3">
      <span className="mr-1 text-xs font-medium text-muted-foreground">Add</span>
      {BLOCK_TYPES.map((t) => (
        <Button key={t.type} variant="ghost" size="sm" onClick={() => onAdd(t.type)} className="text-muted-foreground">
          <t.icon /> {t.label}
        </Button>
      ))}
    </div>
  )
}
