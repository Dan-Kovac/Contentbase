"use client"

import Link from "next/link"
import { useState } from "react"
import { toast } from "sonner"
import { ChevronLeft, ExternalLink, Navigation, RotateCcw } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { StatusBadge } from "@/components/brand/status-badge"
import { cn } from "@/lib/utils"
import type { CustomPage } from "@/lib/types"
import { BlockEditor, type EmbedVideo, type SetBlocks, toEBlocks } from "../editor/block-editor"
import { SaveIndicator, useAutosave } from "../editor/autosave"
import { useHistory } from "../editor/use-history"
import { slugify, SLUG_RE } from "../editor/util"
import type { EBlock } from "../review/types"
import { getTemplate } from "./templates"

export interface PageChannel {
  name: string
  slug: string
  domain: string
  owner: string
  /** Items already in the channel header, not counting this page. */
  navCount: number
  /** Slugs other pages already use. */
  takenSlugs: string[]
}

const NAV_MAX = 8

interface Draft {
  title: string
  blocks: EBlock[]
}

/** EDT-07: a custom channel page (About, Contact, Partners) built from blocks. */
export function PageEditor({
  page,
  templateId,
  channel,
  videos,
}: {
  page: CustomPage | null
  templateId?: string
  channel: PageChannel
  videos: EmbedVideo[]
}) {
  const template = page ? undefined : getTemplate(templateId) ?? getTemplate("blank")
  const { state: draft, update, undo, redo, canUndo, canRedo } = useHistory<Draft>(() => ({
    title: page?.title ?? template?.title ?? "",
    blocks: toEBlocks(page?.blocks ?? template?.blocks(channel.name, channel.owner) ?? []),
  }))
  const [slugInput, setSlugInput] = useState(
    page?.slug ?? (template && channel.takenSlugs.includes(template.slug) ? template.altSlug : template?.slug) ?? "",
  )
  const [slugTouched, setSlugTouched] = useState(!!page || !!template?.slug)
  const [inNav, setInNav] = useState(page?.inNav ?? template?.inNav ?? false)
  const [status, setStatus] = useState<CustomPage["status"]>(page?.status ?? "draft")
  const [created, setCreated] = useState(!!page)

  const slug = slugTouched ? slugInput : slugify(draft.title)
  const slugTaken = channel.takenSlugs.includes(slug)
  const slugError = !slug
    ? "Add a slug, e.g. about."
    : !SLUG_RE.test(slug)
      ? "Use lowercase letters, numbers and single hyphens, e.g. work-with-us."
      : slugTaken
        ? `Another page already uses /p/${slug}. Pick a different slug.`
        : null
  const navFull = !inNav && channel.navCount >= NAV_MAX
  const live = status === "published"
  const saving = useAutosave([draft, slug, inNav])
  const previewHref = `/c/${channel.slug}/p/${slug || "page"}`

  const setBlocks: SetBlocks = (fn, opts) => update((d) => ({ ...d, blocks: fn(d.blocks) }), opts)

  const check = () => {
    if (!draft.title.trim()) {
      toast.error("Add a title", { description: "The title shows at the top of the page and in your channel's header." })
      return false
    }
    if (slugError) {
      toast.error("Fix the slug", { description: slugError })
      return false
    }
    return true
  }

  const saveDraft = () => {
    if (!check()) return
    setCreated(true)
    toast.success("Draft saved", { description: `Only you can see /p/${slug} until you publish.` })
  }

  const publish = () => {
    if (!check()) return
    setCreated(true)
    setStatus("published")
    toast.success(live ? "Updated" : "Published", {
      description: live ? "Your changes are live." : `${draft.title} is live at ${channel.domain}/p/${slug}${inNav ? " and in your header" : ""}.`,
      action: { label: "View", onClick: () => window.open(previewHref, "_blank") },
    })
  }

  const unpublish = () => {
    setStatus("draft")
    toast.success("Unpublished", { description: `${draft.title} is a draft again. Visitors to /p/${slug} see your channel home.` })
  }

  return (
    <div className="flex min-h-[calc(100svh-8rem)] flex-col">
      <div className="mb-8">
        <Link
          href="/studio/pages"
          className="-ml-1 inline-flex items-center gap-1 rounded-sm text-[13px] font-medium text-muted-foreground hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          <ChevronLeft className="size-4" aria-hidden /> Pages
        </Link>
        <div className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-2">
          <StatusBadge tone={status} />
          {inNav && (
            <span className="inline-flex items-center gap-1 text-[13px] text-muted-foreground">
              <Navigation className="size-3.5" aria-hidden /> In navigation
            </span>
          )}
          {!created && <span className="text-[13px] text-muted-foreground">{template && template.id !== "blank" ? `From the ${template.label} template` : "New page"}</span>}
        </div>
      </div>

      <div className="grid flex-1 gap-10 lg:grid-cols-[minmax(0,1fr)_300px] xl:grid-cols-[minmax(0,1fr)_340px]">
        <div className="min-w-0 max-w-[760px]">
          <label htmlFor="page-title" className="sr-only">
            Page title
          </label>
          <textarea
            id="page-title"
            rows={1}
            value={draft.title}
            onChange={(e) => update((d) => ({ ...d, title: e.target.value.replace(/\n/g, "") }))}
            placeholder="Page title"
            className="field-sizing-content w-full resize-none rounded-md border border-transparent bg-transparent px-3 py-2 text-[30px] font-extrabold leading-[36px] tracking-[-0.7px] outline-none transition-colors placeholder:text-muted-foreground/60 hover:border-border focus-visible:border-input focus-visible:ring-2 focus-visible:ring-ring/30 sm:text-[34px] sm:leading-[40px]"
          />

          <section className="mt-6" aria-labelledby="content-h">
            <div className="mb-3 flex items-center justify-between gap-3">
              <h2 id="content-h" className="kicker text-foreground">
                Content
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
            <BlockEditor blocks={draft.blocks} setBlocks={setBlocks} assist={{ keyPoints: [] }} videos={videos} />
          </section>
        </div>

        <aside className="grid content-start gap-4 lg:sticky lg:top-20 lg:self-start" aria-label="Page settings">
          <div className="grid gap-4 rounded-lg border bg-card p-4">
            <p className="text-sm font-semibold">Page settings</p>
            <div className="grid gap-1.5">
              <Label htmlFor="page-slug">Slug</Label>
              <div className="flex min-w-0 items-center rounded-md border border-input focus-within:ring-[3px] focus-within:ring-ring/50">
                <span className="shrink-0 border-r bg-muted px-2.5 py-2 font-mono text-xs text-muted-foreground">/p/</span>
                <input
                  id="page-slug"
                  value={slug}
                  onChange={(e) => {
                    setSlugTouched(true)
                    setSlugInput(e.target.value.toLowerCase().replace(/\s+/g, "-"))
                  }}
                  aria-invalid={!!slugError}
                  aria-describedby="page-slug-help"
                  placeholder="about"
                  className="h-9 min-w-0 flex-1 bg-transparent px-2.5 font-mono text-[13px] outline-none"
                />
              </div>
              <p id="page-slug-help" className={cn("text-xs leading-[18px]", slugError ? "text-destructive" : "text-muted-foreground")}>
                {slugError ?? (live ? "Changing it after publishing adds a redirect from the old address." : "Lowercase words joined by hyphens.")}
              </p>
            </div>

            <div className="flex items-start justify-between gap-4 border-t pt-4">
              <div className="grid gap-0.5">
                <Label htmlFor="page-nav">Show in navigation</Label>
                <p id="page-nav-help" className="text-xs leading-[18px] text-muted-foreground">
                  {navFull
                    ? `Your header has ${NAV_MAX} items, the most it holds. Remove one in Design to add this page.`
                    : `Adds “${draft.title || "this page"}” to your channel header. ${channel.navCount + (inNav ? 1 : 0)} of ${NAV_MAX} items used.`}
                </p>
              </div>
              <Switch id="page-nav" checked={inNav} onCheckedChange={setInNav} disabled={navFull} aria-describedby="page-nav-help" />
            </div>

            <div className="grid gap-1.5 border-t pt-4">
              <p className="text-[13px] text-muted-foreground">Address</p>
              <p className="break-all font-mono text-xs">
                {channel.domain}/p/{slug || "…"}
              </p>
              <Button variant="outline" size="sm" asChild className="mt-1 w-fit">
                <a href={previewHref} target="_blank" rel="noreferrer">
                  <ExternalLink /> Preview on your channel
                  <span className="sr-only"> (opens in a new tab)</span>
                </a>
              </Button>
            </div>
          </div>
          <p className="px-1 text-xs leading-[18px] text-muted-foreground">
            Pages use your channel&apos;s fonts, accent colour and template, so they match the rest of your channel.
          </p>
        </aside>
      </div>

      <div className="sticky bottom-0 z-10 -mx-4 mt-12 border-t bg-background/95 px-4 py-3 backdrop-blur md:-mx-8 md:px-8">
        <div className="flex flex-wrap items-center gap-x-6 gap-y-3">
          <SaveIndicator saving={created && saving} label={created ? "Saved" : "Not saved yet"} />
          <div className="ml-auto flex flex-wrap items-center gap-2">
            {live ? (
              <Button variant="ghost" onClick={unpublish}>
                Unpublish
              </Button>
            ) : (
              <Button variant="outline" onClick={saveDraft}>
                Save draft
              </Button>
            )}
            <Button variant="pop" onClick={publish}>
              {live ? "Update" : "Publish"}
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
