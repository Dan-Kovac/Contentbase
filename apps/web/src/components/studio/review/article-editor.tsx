"use client"

import { useRef, useState } from "react"
import { RotateCcw, Sparkles, TriangleAlert } from "lucide-react"
import { Button } from "@/components/ui/button"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { cn } from "@/lib/utils"
import { headlineIdeas } from "./assist"
import type { ArticleState, ArticleUpdate, EFlag } from "./types"
import { ChaptersEditor } from "./chapters-editor"
import { BlockEditor, fixBlock, ListEditor, type SetBlocks } from "../editor/block-editor"

export function ArticleEditor({
  article,
  update,
  title,
  videoTone,
  poster,
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
  poster?: string
  durationSec: number
  source: "youtube" | "upload"
  canUndo: boolean
  canRedo: boolean
  onUndo: () => void
  onRedo: () => void
}) {
  const [custom, setCustom] = useState("")
  const ideaIndex = useRef(0)

  const openFlags = article.flags.filter((f) => f.state === "open")

  // Removing a block also dismisses its open flags, in the same undo step.
  const setBlocks: SetBlocks = (fn, opts) =>
    update((s) => {
      const blocks = fn(s.blocks)
      if (blocks === s.blocks) return s
      const ids = new Set(blocks.map((b) => b.id))
      return {
        ...s,
        blocks,
        flags: s.flags.map((f) => (f.state === "open" && !ids.has(f.blockId) ? { ...f, state: "dismissed" as const } : f)),
      }
    }, opts)

  const resolveFlag = (flag: EFlag, how: "fixed" | "dismissed") =>
    update(
      (s) => ({
        ...s,
        blocks: how === "fixed" ? s.blocks.map((b) => (b.id === flag.blockId ? { ...b, block: fixBlock(b.block, flag) } : b)) : s.blocks,
        flags: s.flags.map((f) => (f.id === flag.id ? { ...f, state: how } : f)),
      }),
      { history: true },
    )

  const suggestHeadline = () => {
    const ideas = headlineIdeas(title, article.keyPoints).filter((i) => !article.headlineOptions.includes(i))
    if (!ideas.length) return
    const idea = ideas[ideaIndex.current++ % ideas.length]
    update((s) => ({ ...s, headlineOptions: [...s.headlineOptions, idea], headline: idea }), { history: true })
  }

  return (
    <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_300px] xl:grid-cols-[minmax(0,1fr)_360px]">
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
          <BlockEditor
            blocks={article.blocks}
            setBlocks={setBlocks}
            flags={openFlags}
            onResolveFlag={resolveFlag}
            assist={{ keyPoints: article.keyPoints }}
            types={["paragraph", "heading", "quote", "list", "image", "divider"]}
          />
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
          poster={poster}
          title={title}
          durationSec={durationSec}
          source={source}
        />
        <CompliancePanel open={openFlags.length} />
      </aside>
    </div>
  )
}

/** The compliance pre-check summary card (ING-10). */
export function CompliancePanel({ open, className }: { open: number; className?: string }) {
  return (
    <div className={cn("rounded-lg border bg-card p-4", className)}>
      <p className="text-sm font-semibold">Compliance pre-check</p>
      {open ? (
        <p className="mt-1.5 flex items-start gap-2 text-[13px] leading-5 text-destructive">
          <TriangleAlert className="mt-0.5 size-3.5 shrink-0" aria-hidden />
          {open} {open === 1 ? "flag" : "flags"} to resolve before you publish
        </p>
      ) : (
        <p className="mt-1.5 flex items-start gap-2 text-[13px] leading-5 text-muted-foreground">
          <span className="mt-[6px] size-[7px] shrink-0 bg-pop-ink" aria-hidden /> No odds, betting calls to action or bookmakers found
        </p>
      )}
      <p className="mt-3 border-t pt-3 text-xs leading-[18px] text-muted-foreground">
        We check as you write for odds, calls to bet, named bookmakers and &ldquo;bet now&rdquo; language.
      </p>
    </div>
  )
}
