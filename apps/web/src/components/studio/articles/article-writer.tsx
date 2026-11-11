"use client"

import Link from "next/link"
import { useMemo, useState } from "react"
import { toast } from "sonner"
import { CalendarClock, ChevronLeft, Eye, Lock, RotateCcw, TriangleAlert } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet"
import { Switch } from "@/components/ui/switch"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { StatusBadge } from "@/components/brand/status-badge"
import { cn } from "@/lib/utils"
import type { ContentStatus, StandaloneArticle } from "@/lib/types"
import { ScheduleDialog } from "../schedule-dialog"
import { CompliancePanel } from "../review/article-editor"
import { SeoPanel, type SeoState } from "../review/seo-panel"
import type { EBlock, EFlag } from "../review/types"
import { BlockEditor, type EmbedVideo, fixBlock, type SetBlocks, toEBlocks } from "../editor/block-editor"
import { BlocksPreview } from "../editor/blocks-preview"
import { detectFlags } from "../editor/compliance"
import { ImageField } from "../editor/image-field"
import { SaveIndicator, useAutosave } from "../editor/autosave"
import { useHistory } from "../editor/use-history"
import { readMinutes, slugify, SLUG_RE, wordCount } from "../editor/util"

export interface WriterChannel {
  name: string
  slug: string
  domain: string
  sections: { slug: string; label: string }[]
  authors: string[]
}

interface Draft {
  headline: string
  standfirst: string
  hero?: string
  blocks: EBlock[]
}

/** A standalone article: written in the studio, not drafted from a video. */
export function ArticleWriter({
  article,
  channel,
  videos,
}: {
  article: StandaloneArticle | null
  channel: WriterChannel
  videos: EmbedVideo[]
}) {
  const isNew = !article
  const { state: draft, update, undo, redo, canUndo, canRedo } = useHistory<Draft>(() => ({
    headline: article?.headline ?? "",
    standfirst: article?.standfirst ?? "",
    hero: article?.hero,
    blocks: toEBlocks(article?.blocks ?? [{ type: "paragraph", text: "" }]),
  }))
  const [section, setSection] = useState(article?.section ?? channel.sections[0]?.slug ?? "")
  const [author, setAuthor] = useState(article?.author ?? channel.authors[0] ?? "")
  const [status, setStatus] = useState<ContentStatus>(article?.status ?? "draft")
  const [publishedAt, setPublishedAt] = useState(article?.publishedAt)
  const [scheduledFor, setScheduledFor] = useState<string>()
  const [exclusive, setExclusive] = useState(false)
  const [tab, setTab] = useState("write")
  const [scheduleOpen, setScheduleOpen] = useState(false)
  const [previewOpen, setPreviewOpen] = useState(false)
  const [blocked, setBlocked] = useState(false)
  const [dismissed, setDismissed] = useState<Set<string>>(new Set())

  // SEO follows the headline and standfirst until you edit a field yourself.
  const [seoState, setSeoState] = useState<SeoState>({
    titleTag: article ? `${article.headline} | ${channel.name}`.slice(0, 70) : "",
    metaDescription: article?.standfirst ?? "",
    slug: article?.slug ?? "",
    altText: "",
    thumb: 0,
    customThumb: null,
  })
  const [touched, setTouched] = useState<Set<keyof SeoState>>(() => new Set(article ? ["titleTag", "metaDescription", "slug"] : []))
  const seo: SeoState = {
    ...seoState,
    titleTag: touched.has("titleTag") ? seoState.titleTag : draft.headline ? `${draft.headline} | ${channel.name}` : "",
    metaDescription: touched.has("metaDescription") ? seoState.metaDescription : draft.standfirst,
    slug: touched.has("slug") ? seoState.slug : slugify(draft.headline),
  }
  const setSeo = (fn: (s: SeoState) => SeoState) => {
    const next = fn(seo)
    const changed = (Object.keys(next) as (keyof SeoState)[]).filter((k) => next[k] !== seo[k])
    if (changed.length) setTouched((t) => new Set([...t, ...changed]))
    setSeoState(next)
  }

  const flags = useMemo(() => detectFlags(draft.blocks, dismissed), [draft.blocks, dismissed])
  const words = wordCount(draft.blocks, draft.standfirst)
  const saving = useAutosave([draft, section, author, exclusive, seoState])
  const live = status === "published"
  const path = `${channel.domain}/a/${seo.slug || "your-article"}`
  const sectionName = channel.sections.find((s) => s.slug === section)?.label ?? section

  const setBlocks: SetBlocks = (fn, opts) => update((d) => ({ ...d, blocks: fn(d.blocks) }), opts)

  const resolveFlag = (flag: EFlag, how: "fixed" | "dismissed") => {
    if (how === "dismissed") {
      setDismissed((s) => new Set([...s, flag.id]))
      return
    }
    update((d) => ({ ...d, blocks: d.blocks.map((b) => (b.id === flag.blockId ? { ...b, block: fixBlock(b.block, flag) } : b)) }), { history: true })
  }

  const ready = () => {
    if (!draft.headline.trim()) {
      setTab("write")
      toast.error("Add a headline", { description: "Every article needs a headline before it can go live." })
      return false
    }
    if (!SLUG_RE.test(seo.slug)) {
      setTab("seo")
      toast.error("Fix the slug", { description: "Use lowercase letters, numbers and single hyphens, e.g. ladder-after-round-7." })
      return false
    }
    if (flags.length) {
      setBlocked(true)
      return false
    }
    return true
  }

  const publish = () => {
    if (!ready()) return
    setStatus("published")
    setPublishedAt("11 November 2026")
    setScheduledFor(undefined)
    toast.success(live ? "Updated" : "Published", {
      description: live ? "Your changes are live." : `${draft.headline} is live on ${channel.domain}.`,
      action: { label: "View", onClick: () => window.open(`/c/${channel.slug}/a/${seo.slug}`, "_blank") },
    })
  }

  const saveDraft = () => {
    toast.success("Draft saved", { description: "Nothing goes live until you publish." })
  }

  return (
    <div className="flex min-h-[calc(100svh-8rem)] flex-col">
      <div className="mb-6">
        <Link
          href="/studio/articles"
          className="-ml-1 inline-flex items-center gap-1 rounded-sm text-[13px] font-medium text-muted-foreground hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          <ChevronLeft className="size-4" aria-hidden /> Articles
        </Link>
        <div className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-2">
          <StatusBadge tone={status} />
          {exclusive && <StatusBadge tone="exclusive" />}
          {status === "scheduled" && scheduledFor && <span className="text-[13px] text-muted-foreground tabular">{scheduledFor}</span>}
        </div>
        <h1 className={cn("mt-2 max-w-[40ch] text-[28px] font-bold leading-[34px] tracking-[-0.6px] sm:text-[30px]", !draft.headline && "text-muted-foreground")}>
          {draft.headline || (isNew ? "New article" : "Untitled article")}
        </h1>
        <p className="mt-1.5 text-[14px] text-muted-foreground">
          {channel.name} · {sectionName} · By {author}
          {live && publishedAt ? ` · Published ${publishedAt}` : ""}
        </p>
      </div>

      <Tabs value={tab} onValueChange={setTab} className="flex-1 gap-6">
        <div className="-mx-4 overflow-x-auto border-b px-4 md:mx-0 md:px-0">
          <TabsList variant="line" className="h-10 gap-4 p-0">
            <TabsTrigger value="write" className="flex-none px-0.5">
              Write
              {flags.length > 0 && (
                <span className="grid h-[18px] min-w-[18px] place-items-center rounded-full bg-destructive px-1 text-[11px] font-bold text-destructive-foreground tabular" aria-label={`${flags.length} flags`}>
                  {flags.length}
                </span>
              )}
            </TabsTrigger>
            <TabsTrigger value="seo" className="flex-none px-0.5">
              SEO &amp; sharing
            </TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="write" className="pt-2">
          <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_300px] xl:grid-cols-[minmax(0,1fr)_340px]">
            <div className="min-w-0 max-w-[760px]">
              <section aria-labelledby="hero-h">
                <h2 id="hero-h" className="kicker mb-3 text-foreground">
                  Hero image
                </h2>
                <ImageField src={draft.hero} onChange={(hero) => update((d) => ({ ...d, hero }), { history: true })} label="Add a hero image" />
              </section>

              <section className="mt-8" aria-labelledby="headline-h">
                <div className="mb-2 flex items-center justify-between gap-3">
                  <h2 id="headline-h" className="kicker text-foreground">
                    Headline
                  </h2>
                  <span className={cn("text-xs tabular", draft.headline.length > 90 ? "font-semibold text-destructive" : "text-muted-foreground")}>
                    {draft.headline.length} / 90
                  </span>
                </div>
                <textarea
                  rows={1}
                  value={draft.headline}
                  onChange={(e) => update((d) => ({ ...d, headline: e.target.value.replace(/\n/g, "") }))}
                  aria-labelledby="headline-h"
                  placeholder="Write a headline"
                  className="field-sizing-content w-full resize-none rounded-md border border-transparent bg-transparent px-3 py-2 text-[28px] font-extrabold leading-[34px] tracking-[-0.6px] outline-none transition-colors placeholder:text-muted-foreground/60 hover:border-border focus-visible:border-input focus-visible:ring-2 focus-visible:ring-ring/30"
                />
              </section>

              <section className="mt-6" aria-labelledby="standfirst-h">
                <h2 id="standfirst-h" className="kicker mb-2 text-foreground">
                  Standfirst
                </h2>
                <textarea
                  rows={2}
                  value={draft.standfirst}
                  onChange={(e) => update((d) => ({ ...d, standfirst: e.target.value }))}
                  aria-labelledby="standfirst-h"
                  placeholder="One or two sentences that tell readers why this matters"
                  className="field-sizing-content w-full resize-none rounded-md border border-transparent bg-transparent px-3 py-2 font-serif text-[19px] leading-[28px] text-muted-foreground outline-none transition-colors placeholder:text-muted-foreground/60 hover:border-border focus-visible:border-input focus-visible:text-foreground focus-visible:ring-2 focus-visible:ring-ring/30"
                />
              </section>

              <section className="mt-8" aria-labelledby="body-h">
                <div className="mb-3 flex items-center justify-between gap-3">
                  <h2 id="body-h" className="kicker text-foreground">
                    Article
                  </h2>
                  <div className="flex items-center gap-1">
                    <Button variant="ghost" size="icon-sm" onClick={undo} disabled={!canUndo} aria-label="Undo">
                      <RotateCcw />
                    </Button>
                    <Button variant="ghost" size="icon-sm" onClick={redo} disabled={!canRedo} aria-label="Redo">
                      <RotateCcw className="-scale-x-100" />
                    </Button>
                  </div>
                </div>
                <BlockEditor
                  blocks={draft.blocks}
                  setBlocks={setBlocks}
                  flags={flags}
                  onResolveFlag={resolveFlag}
                  assist={{ keyPoints: [] }}
                  videos={videos}
                />
              </section>
            </div>

            <aside className="grid content-start gap-4 lg:sticky lg:top-20 lg:self-start" aria-label="Article details">
              <div className="grid gap-4 rounded-lg border bg-card p-4">
                <p className="text-sm font-semibold">Details</p>
                <div className="grid gap-1.5">
                  <Label htmlFor="art-section">Section</Label>
                  <Select value={section} onValueChange={setSection}>
                    <SelectTrigger id="art-section" className="w-full">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {channel.sections.map((s) => (
                        <SelectItem key={s.slug} value={s.slug}>
                          {s.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid gap-1.5">
                  <Label htmlFor="art-author">Author</Label>
                  <Select value={author} onValueChange={setAuthor}>
                    <SelectTrigger id="art-author" className="w-full">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {channel.authors.map((a) => (
                        <SelectItem key={a} value={a}>
                          {a}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <dl className="grid gap-2 border-t pt-3 text-[13px]">
                  <div className="flex justify-between gap-2">
                    <dt className="text-muted-foreground">Length</dt>
                    <dd className="font-medium tabular">
                      {words} words · {readMinutes(words)} min read
                    </dd>
                  </div>
                  <div className="grid gap-0.5">
                    <dt className="text-muted-foreground">Address</dt>
                    <dd className="break-all font-mono text-xs">{path}</dd>
                  </div>
                </dl>
              </div>
              <CompliancePanel open={flags.length} />
            </aside>
          </div>
        </TabsContent>

        <TabsContent value="seo" className="pt-2">
          <SeoPanel
            seo={seo}
            setSeo={setSeo}
            domain={channel.domain}
            channelName={channel.name}
            headline={draft.headline || "Your headline"}
            image={draft.hero}
            pathPrefix="a/"
          />
        </TabsContent>
      </Tabs>

      {/* Sticky action bar */}
      <div className="sticky bottom-0 z-10 -mx-4 mt-12 border-t bg-background/95 px-4 py-3 backdrop-blur md:-mx-8 md:px-8">
        <div className="flex flex-wrap items-center gap-x-6 gap-y-3">
          <SaveIndicator saving={saving} />
          <div className="flex items-center gap-2.5">
            <Switch id="exclusive" checked={exclusive} onCheckedChange={setExclusive} aria-describedby="exclusive-help" />
            <Label htmlFor="exclusive" className="flex items-center gap-1.5 text-[13px] font-medium">
              <Lock className="size-3.5" aria-hidden /> Exclusive
              <span id="exclusive-help" className="hidden font-normal text-muted-foreground lg:inline">
                (signed-in only)
              </span>
            </Label>
          </div>
          {flags.length > 0 && (
            <button
              type="button"
              onClick={() => setTab("write")}
              className="flex items-center gap-1.5 rounded-sm text-[13px] font-medium text-destructive hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              <TriangleAlert className="size-3.5" aria-hidden /> {flags.length} {flags.length === 1 ? "flag" : "flags"} to resolve
            </button>
          )}
          <div className="ml-auto flex flex-wrap items-center gap-2">
            <Button variant="ghost" onClick={() => setPreviewOpen(true)}>
              <Eye /> <span className="hidden sm:inline">Preview</span>
              <span className="sr-only sm:hidden">Preview</span>
            </Button>
            {!live && (
              <Button variant="ghost" onClick={saveDraft} className="hidden sm:inline-flex">
                Save draft
              </Button>
            )}
            {!live && (
              <Button variant="outline" onClick={() => ready() && setScheduleOpen(true)}>
                <CalendarClock /> Schedule
              </Button>
            )}
            <Button variant="pop" onClick={publish}>
              {live ? "Update" : "Publish"}
            </Button>
          </div>
        </div>
      </div>

      <ScheduleDialog
        open={scheduleOpen}
        onOpenChange={setScheduleOpen}
        itemTitle={draft.headline}
        onSchedule={(when) => {
          setStatus("scheduled")
          setScheduledFor(when)
          toast.success("Scheduled", { description: `${draft.headline} goes live ${when}, Melbourne time.` })
        }}
      />

      <Sheet open={previewOpen} onOpenChange={setPreviewOpen}>
        <SheetContent side="right" className="w-full gap-0 overflow-y-auto sm:max-w-[720px]">
          <SheetHeader className="border-b">
            <SheetTitle>Preview</SheetTitle>
            <SheetDescription>The article as signed-in visitors will see it on {channel.name}.</SheetDescription>
          </SheetHeader>
          <article className="mx-auto w-full max-w-[68ch] px-5 py-8">
            <div className="flex items-center gap-2">
              <span className="kicker">{sectionName}</span>
              {exclusive && <StatusBadge tone="exclusive" />}
            </div>
            <h1 className="mt-3 text-balance text-[32px] font-extrabold leading-[36px] tracking-[-0.8px]">{draft.headline || "Your headline"}</h1>
            {draft.standfirst && <p className="mt-3 font-serif text-[19px] leading-[28px] text-muted-foreground">{draft.standfirst}</p>}
            <p className="mt-4 text-[13px] text-muted-foreground">
              By <span className="font-semibold text-foreground">{author}</span> · {readMinutes(words)} min read
            </p>
            {draft.hero && (
              // eslint-disable-next-line @next/next/no-img-element -- prototype media
              <img src={draft.hero} alt={seo.altText} className="mt-6 aspect-video w-full rounded-lg object-cover" />
            )}
            <div className="mt-8">
              <BlocksPreview blocks={draft.blocks} videos={videos} />
            </div>
          </article>
        </SheetContent>
      </Sheet>

      <AlertDialog open={blocked} onOpenChange={setBlocked}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Resolve {flags.length === 1 ? "one flag" : `${flags.length} flags`} first</AlertDialogTitle>
            <AlertDialogDescription>
              The compliance pre-check found betting language in this article. Fix or dismiss each flag, then publish.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <ul className="grid gap-2 text-[13px]">
            {flags.map((f) => (
              <li key={f.id} className="rounded-md bg-muted px-3 py-2">
                <span className="font-serif italic">&ldquo;{f.excerpt}&rdquo;</span>
              </li>
            ))}
          </ul>
          <AlertDialogFooter>
            <AlertDialogCancel>Close</AlertDialogCancel>
            <AlertDialogAction onClick={() => setTab("write")}>Show flags</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
