"use client"

import { useEffect, useRef, useState } from "react"
import {
  ArrowDown,
  ArrowUp,
  Check,
  Heading2,
  Image as ImageIcon,
  List,
  Minus,
  Pilcrow,
  Plus,
  Quote,
  RotateCcw,
  SquarePlay,
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { VideoThumb } from "@/components/brand/media"
import { cn } from "@/lib/utils"
import type { Block } from "@/lib/types"
import { ASSIST_LABELS, type AssistAction, fixText, suggestFor } from "../review/assist"
import type { EBlock, EFlag } from "../review/types"
import { ImageField } from "./image-field"

let uid = 1000
export const newBlockId = () => `b${uid++}`

export type BlockType = Block["type"]

export interface EmbedVideo {
  id: string
  title: string
  poster?: string
  tone: string
  durationSec: number
}

export const BLOCK_TYPES: { type: BlockType; label: string; icon: typeof Pilcrow }[] = [
  { type: "paragraph", label: "Paragraph", icon: Pilcrow },
  { type: "heading", label: "Heading", icon: Heading2 },
  { type: "quote", label: "Quote", icon: Quote },
  { type: "list", label: "List", icon: List },
  { type: "image", label: "Image", icon: ImageIcon },
  { type: "video", label: "Video embed", icon: SquarePlay },
  { type: "divider", label: "Divider", icon: Minus },
]

export function emptyBlock(type: BlockType, videos: EmbedVideo[] = []): Block {
  switch (type) {
    case "heading":
      return { type: "heading", text: "" }
    case "quote":
      return { type: "quote", text: "", cite: "" }
    case "list":
      return { type: "list", items: [""] }
    case "divider":
      return { type: "divider" }
    case "image":
      return { type: "image", caption: "" }
    case "video":
      return { type: "video", videoId: videos[0]?.id ?? "" }
    default:
      return { type: "paragraph", text: "" }
  }
}

export const toEBlocks = (blocks: Block[]): EBlock[] => blocks.map((block) => ({ id: newBlockId(), block }))

const FLAG_TITLE: Record<string, string> = {
  odds: "Odds mentioned",
  bet_now: "“Bet now” language",
  bet_cta: "Call to bet",
  bookmaker: "Bookmaker named",
}

const BLOCK_NAME: Record<BlockType, string> = {
  paragraph: "paragraph",
  heading: "heading",
  quote: "quote",
  list: "list",
  image: "image caption",
  video: "video embed",
  divider: "divider",
}

/** Apply a compliance fix to whichever text the block holds. */
export function fixBlock(block: Block, flag: Pick<EFlag, "kind" | "excerpt">): Block {
  switch (block.type) {
    case "paragraph":
    case "heading":
    case "quote":
      return { ...block, text: fixText(block.text, flag) }
    case "list":
      return { ...block, items: block.items.map((i) => (i.includes(flag.excerpt) ? fixText(i, flag) : i)) }
    case "image":
      return { ...block, caption: fixText(block.caption, flag) }
    default:
      return block
  }
}

type Suggestion = { status: "loading"; action: AssistAction } | { status: "ready"; action: AssistAction; block: Block; seed: number }

export type SetBlocks = (fn: (b: EBlock[]) => EBlock[], opts?: { history?: boolean }) => void

/**
 * The studio's block editor (EDT-02): headings, paragraphs, quotes, lists,
 * images, video embeds and dividers, with optional AI assist and compliance flags.
 */
export function BlockEditor({
  blocks,
  setBlocks,
  flags = [],
  onResolveFlag,
  assist,
  types = BLOCK_TYPES.map((t) => t.type),
  videos = [],
  serif = true,
  emptyHint = "Start with a paragraph, or add a heading, image or quote.",
}: {
  blocks: EBlock[]
  setBlocks: SetBlocks
  /** Open compliance flags. */
  flags?: EFlag[]
  onResolveFlag?: (flag: EFlag, how: "fixed" | "dismissed") => void
  /** Turns on AI assist. Key points feed "Expand". */
  assist?: { keyPoints: string[] }
  types?: BlockType[]
  videos?: EmbedVideo[]
  /** Body copy in the reading serif (articles) or the interface sans (pages). */
  serif?: boolean
  emptyHint?: string
}) {
  const [suggestions, setSuggestions] = useState<Record<string, Suggestion>>({})
  const timers = useRef<number[]>([])
  useEffect(() => () => timers.current.forEach((t) => window.clearTimeout(t)), [])
  const allowed = BLOCK_TYPES.filter((t) => types.includes(t.type) && (t.type !== "video" || videos.length > 0))

  const nthOfType = (id: string) => {
    const target = blocks.find((b) => b.id === id)
    let n = 0
    for (const b of blocks) {
      if (b.block.type === target?.block.type) n++
      if (b.id === id) return n
    }
    return n
  }

  const setBlock = (id: string, block: Block, history = false) =>
    setBlocks((bs) => bs.map((b) => (b.id === id ? { ...b, block } : b)), { history })

  const runAssist = (b: EBlock, action: AssistAction, seed = 0) => {
    setSuggestions((s) => ({ ...s, [b.id]: { status: "loading", action } }))
    const t = window.setTimeout(() => {
      setSuggestions((s) => ({
        ...s,
        [b.id]: { status: "ready", action, seed, block: suggestFor(b.block, action, assist?.keyPoints ?? [], seed) },
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

  const insertAfter = (index: number, type: BlockType) =>
    setBlocks(
      (bs) => {
        const next = [...bs]
        next.splice(index + 1, 0, { id: newBlockId(), block: emptyBlock(type, videos) })
        return next
      },
      { history: true },
    )

  const move = (index: number, dir: -1 | 1) =>
    setBlocks(
      (bs) => {
        const next = [...bs]
        const j = index + dir
        if (j < 0 || j >= next.length) return bs
        ;[next[index], next[j]] = [next[j], next[index]]
        return next
      },
      { history: true },
    )

  const remove = (id: string) => {
    clearSuggestion(id)
    setBlocks((bs) => bs.filter((b) => b.id !== id), { history: true })
  }

  const assistable = (t: BlockType) => !!assist && (t === "paragraph" || t === "heading" || t === "quote" || t === "list")

  return (
    <div>
      {blocks.length === 0 && (
        <p className="rounded-md border border-dashed px-4 py-6 text-center text-sm text-muted-foreground">{emptyHint}</p>
      )}
      <ol className="grid gap-1">
        {blocks.map((b, i) => {
          const blockFlags = flags.filter((f) => f.blockId === b.id && f.state === "open")
          const sug = suggestions[b.id]
          return (
            <li key={b.id} className="group/block relative">
              <div
                className={cn(
                  "relative flex gap-1 rounded-md pl-1 transition-colors focus-within:bg-accent/40 hover:bg-accent/40 sm:pl-0",
                  blockFlags.length && "bg-destructive/[0.04] ring-1 ring-destructive/40 hover:bg-destructive/[0.06]",
                )}
              >
                <div className="min-w-0 flex-1 py-1 pr-1">
                  <BlockBody
                    block={b.block}
                    flags={blockFlags}
                    onChange={(nb, history) => setBlock(b.id, nb, history)}
                    index={i}
                    videos={videos}
                    serif={serif}
                  />
                </div>
                <div className="order-last flex shrink-0 flex-col items-center sm:contents">
                  <BlockMenu
                    index={i}
                    count={blocks.length}
                    onMove={(d) => move(i, d)}
                    onDelete={() => remove(b.id)}
                    onInsert={(t) => insertAfter(i, t)}
                    type={b.block.type}
                    types={allowed}
                  />
                  {assistable(b.block.type) && <AssistMenu disabled={sug?.status === "loading"} onPick={(a) => runAssist(b, a)} />}
                </div>
              </div>

              {sug && (
                <SuggestionPanel
                  suggestion={sug}
                  serif={serif}
                  onAccept={(nb) => {
                    setBlock(b.id, nb, true)
                    clearSuggestion(b.id)
                  }}
                  onReject={() => clearSuggestion(b.id)}
                  onRetry={() => runAssist(b, sug.action, (sug.status === "ready" ? sug.seed : 0) + 1)}
                />
              )}

              {blockFlags.map((f) => (
                <div key={f.id} role="note" className="mb-3 mt-2 flex flex-col gap-3 rounded-md border border-destructive/50 bg-card p-3 sm:flex-row sm:items-start">
                  <TriangleAlert className="mt-0.5 hidden size-4 shrink-0 text-destructive sm:block" aria-hidden />
                  <div className="min-w-0 flex-1 text-[13px] leading-5">
                    <p className="font-semibold text-destructive">
                      {FLAG_TITLE[f.kind]} in {BLOCK_NAME[b.block.type]} {nthOfType(b.id)}
                    </p>
                    <p className="mt-0.5 text-muted-foreground">{f.message}</p>
                    <p className="mt-1.5 font-serif italic">&ldquo;{f.excerpt}&rdquo;</p>
                  </div>
                  {onResolveFlag && (
                    <div className="flex shrink-0 gap-2">
                      <Button size="sm" variant="ghost" onClick={() => onResolveFlag(f, "dismissed")}>
                        Dismiss
                      </Button>
                      <Button size="sm" onClick={() => onResolveFlag(f, "fixed")}>
                        Fix
                      </Button>
                    </div>
                  )}
                </div>
              ))}
            </li>
          )
        })}
      </ol>
      <AddBlock types={allowed} onAdd={(t) => insertAfter(blocks.length - 1, t)} />
    </div>
  )
}

function BlockBody({
  block,
  flags,
  onChange,
  index,
  videos,
  serif,
}: {
  block: Block
  flags: EFlag[]
  onChange: (b: Block, history?: boolean) => void
  index: number
  videos: EmbedVideo[]
  serif: boolean
}) {
  const base = "field-sizing-content block w-full resize-none bg-transparent px-2 py-1 outline-none placeholder:text-muted-foreground/70"
  switch (block.type) {
    case "paragraph":
      return (
        <HighlightArea
          value={block.text}
          marks={flags.map((f) => f.excerpt)}
          onChange={(text) => onChange({ ...block, text })}
          className={serif ? "font-serif text-[17px] leading-[28px]" : "text-[16px] leading-[26px]"}
          label={`Paragraph, block ${index + 1}`}
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
      return <ListEditor items={block.items} onChange={(items) => onChange({ ...block, items })} label="List item" serif={serif} />
    case "divider":
      return (
        <div className="px-2 py-4" role="separator">
          <hr className="border-border" />
        </div>
      )
    case "image":
      return (
        <figure className="grid gap-1.5 px-2 py-1">
          <ImageField
            src={block.src}
            onChange={(src) => onChange({ ...block, src }, true)}
            label="Add an image"
            ratio="3/2"
            compact
          />
          <input
            value={block.caption}
            onChange={(e) => onChange({ ...block, caption: e.target.value })}
            placeholder="Write a caption, and credit the photographer"
            aria-label={`Image caption, block ${index + 1}`}
            className="w-full rounded-sm bg-transparent py-1 text-[13px] text-muted-foreground outline-none placeholder:text-muted-foreground/70 focus-visible:text-foreground"
          />
        </figure>
      )
    case "video": {
      const v = videos.find((x) => x.id === block.videoId)
      return (
        <div className="grid gap-2 px-2 py-1 sm:grid-cols-[200px_minmax(0,1fr)] sm:items-center sm:gap-4">
          <VideoThumb tone={v?.tone} src={v?.poster} durationSec={v?.durationSec} className="rounded-md" />
          <div className="grid min-w-0 gap-1.5">
            <p className="text-xs font-medium text-muted-foreground">Video embed · plays on the page</p>
            <Select value={block.videoId || undefined} onValueChange={(videoId) => onChange({ ...block, videoId }, true)}>
              <SelectTrigger className="w-full" aria-label={`Video for block ${index + 1}`}>
                <SelectValue placeholder="Choose a video" />
              </SelectTrigger>
              <SelectContent>
                {videos.map((x) => (
                  <SelectItem key={x.id} value={x.id}>
                    {x.title}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      )
    }
  }
}

/** A textarea with flagged phrases highlighted behind the text. */
export function HighlightArea({
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

export function ListEditor({
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
  types,
  onMove,
  onDelete,
  onInsert,
}: {
  index: number
  count: number
  type: BlockType
  types: typeof BLOCK_TYPES
  onMove: (d: -1 | 1) => void
  onDelete: () => void
  onInsert: (t: BlockType) => void
}) {
  const Icon = BLOCK_TYPES.find((t) => t.type === type)?.icon ?? Pilcrow
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon-sm"
          className="mt-1 shrink-0 text-muted-foreground opacity-100 transition-opacity group-focus-within/block:opacity-100 group-hover/block:opacity-100 data-[state=open]:opacity-100 sm:absolute sm:-left-9 sm:top-0 sm:opacity-0"
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
            {types.map((t) => (
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
  serif,
  onAccept,
  onReject,
  onRetry,
}: {
  suggestion: Suggestion
  serif: boolean
  onAccept: (b: Block) => void
  onReject: () => void
  onRetry: () => void
}) {
  const label = ASSIST_LABELS[suggestion.action]
  return (
    <div className="mb-3 mt-1 overflow-hidden rounded-md border bg-card" role="status" aria-live="polite">
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
          <p className={cn("whitespace-pre-line px-3 py-3", serif ? "font-serif text-[16px] leading-[26px]" : "text-[15px] leading-[24px]")}>
            {blockText(suggestion.block)}
          </p>
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

function AddBlock({ types, onAdd }: { types: typeof BLOCK_TYPES; onAdd: (t: BlockType) => void }) {
  return (
    <div className="mt-3 flex flex-wrap items-center gap-1 border-t border-dashed pt-3">
      <span className="mr-1 text-xs font-medium text-muted-foreground">Add</span>
      {types.map((t) => (
        <Button key={t.type} variant="ghost" size="sm" onClick={() => onAdd(t.type)} className="text-muted-foreground">
          <t.icon /> {t.label}
        </Button>
      ))}
    </div>
  )
}
