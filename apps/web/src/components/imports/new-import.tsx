"use client"

import { useRef, useState } from "react"
import Link from "next/link"
import { useSearchParams } from "next/navigation"
import { AlertCircle, ArrowRight, Check, CheckCircle2, FileUp, Info, Redo2 } from "lucide-react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { StatusBadge } from "@/components/brand/status-badge"
import { cn } from "@/lib/utils"
import { SourceMark, SOURCE_LABEL, type ImportSource } from "./source-meta"

const SOURCES: { id: ImportSource; blurb: string; imports: string[] }[] = [
  {
    id: "youtube",
    blurb: "Connected as @footyfixau",
    imports: ["Every public video, with title, description, thumbnail, date and duration", "Your captions, as each video's transcript", "YouTube Shorts, if you choose", "A draft pack for each video when you ask for one"],
  },
  {
    id: "wordpress",
    blurb: "Export file or REST API",
    imports: ["Posts and pages, cleaned into Homestand blocks", "Categories and tags, as sections", "Authors and bylines", "Featured images and media library files"],
  },
  {
    id: "ghost",
    blurb: "JSON export",
    imports: ["Posts and pages, cleaned into Homestand blocks", "Tags, as sections", "Authors and feature images", "Members, as followers marked unverified until they sign in"],
  },
  {
    id: "substack",
    blurb: "Export zip",
    imports: ["Posts, with images and embeds", "Subscribers, as followers marked unverified until they sign in", "Publish dates, so your archive keeps its order"],
  },
  {
    id: "rss",
    blurb: "Any feed URL",
    imports: ["Every item in the feed, with title, body and date", "Enclosure media, such as video files", "New items as they appear, if you keep the feed connected"],
  },
]

const URL_RE = /^https?:\/\/[^\s.]+\.[^\s]{2,}$/i

function DropZone({ id, accept, hint, file, onFile, error }: { id: string; accept: string; hint: string; file: File | null; onFile: (f: File) => void; error?: string | null }) {
  const [over, setOver] = useState(false)
  const ref = useRef<HTMLInputElement>(null)
  return (
    <div className="grid gap-2">
      <label
        htmlFor={id}
        onDragOver={(e) => {
          e.preventDefault()
          setOver(true)
        }}
        onDragLeave={() => setOver(false)}
        onDrop={(e) => {
          e.preventDefault()
          setOver(false)
          const f = e.dataTransfer.files?.[0]
          if (f) onFile(f)
        }}
        className={cn(
          "flex cursor-pointer flex-col items-center gap-2 rounded-lg border border-dashed px-4 py-8 text-center transition-colors hover:bg-accent/50 has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-ring",
          over && "border-foreground bg-accent/60",
          error && "border-destructive",
        )}
      >
        <FileUp className="size-5" aria-hidden />
        {file ? (
          <span className="text-sm font-medium">
            {file.name} <span className="font-normal text-muted-foreground">· {(file.size / 1024 / 1024).toFixed(1)} MB</span>
          </span>
        ) : (
          <span className="text-sm">
            <span className="font-medium underline underline-offset-2">Choose a file</span> or drag it here
          </span>
        )}
        <span className="text-[13px] text-muted-foreground">{hint}</span>
        <input
          ref={ref}
          id={id}
          type="file"
          accept={accept}
          className="sr-only"
          aria-describedby={error ? `${id}-error` : undefined}
          onChange={(e) => {
            const f = e.target.files?.[0]
            if (f) onFile(f)
          }}
        />
      </label>
      {error && (
        <p id={`${id}-error`} className="flex items-center gap-1.5 text-[13px] text-destructive">
          <AlertCircle className="size-4 shrink-0" aria-hidden /> {error}
        </p>
      )}
    </div>
  )
}

function fileCheck(f: File | null, ext: string, what: string) {
  if (!f) return null
  return f.name.toLowerCase().endsWith(ext) ? null : `${f.name} isn't a ${ext} file. Upload the ${what}.`
}

function NewImport({ initial }: { initial: ImportSource }) {
  const [source, setSource] = useState<ImportSource>(initial)
  const [started, setStarted] = useState<ImportSource | null>(null)
  const [submitted, setSubmitted] = useState(false)

  // YouTube
  const [ytScope, setYtScope] = useState("new")
  const [ytShorts, setYtShorts] = useState(true)
  // WordPress
  const [wpMode, setWpMode] = useState("file")
  const [wpFile, setWpFile] = useState<File | null>(null)
  const [wpUrl, setWpUrl] = useState("")
  const [wpUser, setWpUser] = useState("")
  const [wpPass, setWpPass] = useState("")
  // Ghost, Substack, RSS
  const [ghostFile, setGhostFile] = useState<File | null>(null)
  const [subFile, setSubFile] = useState<File | null>(null)
  const [feed, setFeed] = useState("")

  const meta = SOURCES.find((s) => s.id === source)!

  const errors: Record<string, string | null> = {
    wpFile: wpMode === "file" ? (wpFile ? fileCheck(wpFile, ".xml", "WXR export from Tools → Export in WordPress") : "Choose your WordPress export file (.xml).") : null,
    wpUrl: wpMode === "rest" ? (!wpUrl ? "Enter your site address, e.g. https://trackside.com.au." : !URL_RE.test(wpUrl) ? "That address doesn't look right. Include https://, e.g. https://trackside.com.au." : null) : null,
    wpUser: wpMode === "rest" && !wpUser.trim() ? "Enter your WordPress username." : null,
    wpPass: wpMode === "rest" ? (!wpPass.trim() ? "Paste an application password." : wpPass.replace(/\s/g, "").length < 24 ? "Application passwords are 24 characters. Copy the whole thing from your WordPress profile." : null) : null,
    ghost: ghostFile ? fileCheck(ghostFile, ".json", "JSON export from Settings → Labs in Ghost") : "Choose your Ghost export file (.json).",
    substack: subFile ? fileCheck(subFile, ".zip", "zip from Settings → Exports in Substack") : "Choose your Substack export (.zip).",
    feed: !feed ? "Enter a feed URL, e.g. https://trackside.com.au/feed." : !URL_RE.test(feed) ? "That isn't a full URL. Include https://, e.g. https://trackside.com.au/feed." : null,
  }
  const relevant: Record<ImportSource, string[]> = {
    youtube: [],
    wordpress: ["wpFile", "wpUrl", "wpUser", "wpPass"],
    ghost: ["ghost"],
    substack: ["substack"],
    rss: ["feed"],
  }
  const invalid = relevant[source].some((k) => errors[k])
  const show = (k: string) => (submitted ? errors[k] : null)

  function start() {
    setSubmitted(true)
    if (invalid) return
    setStarted(source)
    toast.success("Import started", { description: "We'll email you when it's finished." })
  }

  if (started) {
    return (
      <div className="rounded-lg border bg-card p-6 sm:p-8">
        <CheckCircle2 className="size-6" aria-hidden />
        <h2 className="mt-3 text-xl font-bold tracking-[-0.3px]">Your {SOURCE_LABEL[started]} import has started</h2>
        <p className="mt-1 max-w-[60ch] text-sm text-muted-foreground">
          {started === "youtube"
            ? "New videos land in Ready to review as they're drafted. Large imports are spread over a day or two, because YouTube limits how fast we can fetch captions."
            : "You can leave this page. We'll email you when it's done, with the report and your redirect map."}
        </p>
        <div className="mt-5 flex flex-wrap gap-2">
          <Button asChild>
            <Link href={started === "youtube" ? "/studio/imports/imp_yt_sync" : "/studio/imports"}>
              View progress <ArrowRight />
            </Link>
          </Button>
          <Button
            variant="ghost"
            onClick={() => {
              setStarted(null)
              setSubmitted(false)
            }}
          >
            Start another import
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="grid gap-6">
      <fieldset>
        <legend className="mb-3 text-[15px] font-semibold">Choose a source</legend>
        <RadioGroup
          value={source}
          onValueChange={(v) => {
            setSource(v as ImportSource)
            setSubmitted(false)
          }}
          className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-5"
        >
          {SOURCES.map((s) => (
            <label
              key={s.id}
              className={cn(
                "relative flex cursor-pointer items-center gap-3 rounded-lg border bg-card p-3 transition-colors hover:bg-accent/50 has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-ring lg:flex-col lg:items-start",
                source === s.id && "border-foreground ring-1 ring-foreground",
              )}
            >
              <RadioGroupItem value={s.id} className="sr-only" />
              <SourceMark source={s.id} className="size-9" />
              <span className="min-w-0">
                <span className="block text-sm font-semibold">{SOURCE_LABEL[s.id]}</span>
                <span className="block text-[13px] text-muted-foreground">{s.blurb}</span>
              </span>
              {source === s.id && <Check className="ml-auto size-4 lg:absolute lg:right-3 lg:top-3" aria-hidden />}
            </label>
          ))}
        </RadioGroup>
      </fieldset>

      <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_320px]">
        <section aria-labelledby="source-title" className="overflow-hidden rounded-lg border bg-card">
          <div className="border-b px-4 py-3 sm:px-5">
            <h2 id="source-title" className="text-[15px] font-semibold">
              Import from {SOURCE_LABEL[source]}
            </h2>
          </div>
          <div className="grid gap-5 p-4 sm:p-5">
            {source === "youtube" && (
              <>
                <div className="flex flex-wrap items-center gap-2 text-sm">
                  <span className="font-medium">@footyfixau</span> <StatusBadge tone="connected" />
                  <span className="text-[13px] text-muted-foreground">142k subscribers · 222 public videos</span>
                </div>
                <RadioGroup value={ytScope} onValueChange={setYtScope} className="gap-2" aria-label="What to import">
                  <label className="flex items-start gap-3 rounded-md border p-3 has-[[data-state=checked]]:border-foreground">
                    <RadioGroupItem value="new" className="mt-0.5" />
                    <span>
                      <span className="block text-sm font-medium">Only videos that aren&apos;t on my channel</span>
                      <span className="block text-[13px] text-muted-foreground">8 videos, including 6 skipped and 2 failed last time.</span>
                    </span>
                  </label>
                  <label className="flex items-start gap-3 rounded-md border p-3 has-[[data-state=checked]]:border-foreground">
                    <RadioGroupItem value="all" className="mt-0.5" />
                    <span>
                      <span className="block text-sm font-medium">Re-import everything</span>
                      <span className="block text-[13px] text-muted-foreground">Refreshes titles, descriptions and thumbnails. Articles you&apos;ve edited are never overwritten.</span>
                    </span>
                  </label>
                </RadioGroup>
                <label className="flex items-center gap-3 text-sm">
                  <Checkbox checked={ytShorts} onCheckedChange={(v) => setYtShorts(v === true)} />
                  Include YouTube Shorts
                </label>
              </>
            )}

            {source === "wordpress" && (
              <Tabs value={wpMode} onValueChange={(v) => { setWpMode(v); setSubmitted(false) }}>
                <TabsList>
                  <TabsTrigger value="file">Upload export file</TabsTrigger>
                  <TabsTrigger value="rest">Connect with REST API</TabsTrigger>
                </TabsList>
                <TabsContent value="file" className="mt-4 grid gap-2">
                  <DropZone id="wp-file" accept=".xml,text/xml,application/xml" hint="WXR file from Tools → Export → All content. Up to 500 MB." file={wpFile} onFile={setWpFile} error={show("wpFile")} />
                  <p className="text-[13px] text-muted-foreground">Images are fetched from your live site, so keep it online until the import finishes.</p>
                </TabsContent>
                <TabsContent value="rest" className="mt-4 grid gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="wp-url">Site address</Label>
                    <Input id="wp-url" placeholder="https://trackside.com.au" value={wpUrl} onChange={(e) => setWpUrl(e.target.value)} aria-invalid={!!show("wpUrl")} aria-describedby="wp-url-error" />
                    {show("wpUrl") && <p id="wp-url-error" className="text-[13px] text-destructive">{show("wpUrl")}</p>}
                  </div>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="grid gap-2">
                      <Label htmlFor="wp-user">Username</Label>
                      <Input id="wp-user" autoComplete="off" value={wpUser} onChange={(e) => setWpUser(e.target.value)} aria-invalid={!!show("wpUser")} aria-describedby="wp-user-error" />
                      {show("wpUser") && <p id="wp-user-error" className="text-[13px] text-destructive">{show("wpUser")}</p>}
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="wp-pass">Application password</Label>
                      <Input id="wp-pass" type="password" autoComplete="off" placeholder="xxxx xxxx xxxx xxxx xxxx xxxx" value={wpPass} onChange={(e) => setWpPass(e.target.value)} className="font-mono" aria-invalid={!!show("wpPass")} aria-describedby="wp-pass-error wp-pass-help" />
                      {show("wpPass") && <p id="wp-pass-error" className="text-[13px] text-destructive">{show("wpPass")}</p>}
                    </div>
                  </div>
                  <p id="wp-pass-help" className="text-[13px] text-muted-foreground">
                    Create one in WordPress under Users → Profile → Application passwords. It&apos;s read-only for us, and you can revoke it after the import.
                  </p>
                </TabsContent>
              </Tabs>
            )}

            {source === "ghost" && (
              <DropZone id="ghost-file" accept=".json,application/json" hint="JSON export from Settings → Labs → Export your content." file={ghostFile} onFile={setGhostFile} error={show("ghost")} />
            )}

            {source === "substack" && (
              <DropZone id="sub-file" accept=".zip,application/zip" hint="Zip from Settings → Exports → New export." file={subFile} onFile={setSubFile} error={show("substack")} />
            )}

            {source === "rss" && (
              <div className="grid gap-2">
                <Label htmlFor="feed-url">Feed URL</Label>
                <Input id="feed-url" placeholder="https://trackside.com.au/feed" value={feed} onChange={(e) => setFeed(e.target.value)} aria-invalid={!!show("feed")} aria-describedby="feed-help" />
                {show("feed") ? (
                  <p id="feed-help" className="text-[13px] text-destructive">
                    {show("feed")}
                  </p>
                ) : (
                  <p id="feed-help" className="text-[13px] text-muted-foreground">
                    RSS 2.0 or Atom. Feeds often only list recent items, so use an export instead if you have one.
                  </p>
                )}
              </div>
            )}

            <div className="flex items-start gap-3 rounded-md border bg-muted/40 p-3">
              {source === "youtube" ? <Info className="mt-0.5 size-4 shrink-0" aria-hidden /> : <Redo2 className="mt-0.5 size-4 shrink-0" aria-hidden />}
              <p className="text-[13px] leading-5">
                {source === "youtube" ? (
                  <>
                    <span className="font-medium">Videos stay on YouTube</span> and play in its player on your pages, so no redirects are needed. Big imports are spread over a day or two, because YouTube limits how fast we can fetch captions.
                  </>
                ) : (
                  <>
                    <span className="font-medium">Every old URL gets a 301 redirect</span> to its new page, so you keep your search rankings. After the import we crawl your old URLs and report any broken links.
                  </>
                )}
              </p>
            </div>
          </div>
          <div className="flex flex-wrap items-center justify-between gap-3 border-t bg-muted/40 px-4 py-3 sm:px-5">
            <p className="text-[13px] text-muted-foreground">Nothing is published. Imported items arrive as drafts or archive pages you can review.</p>
            <Button variant="pop" onClick={start}>
              Start import
            </Button>
          </div>
          {submitted && invalid && (
            <p role="alert" className="border-t px-4 py-2.5 text-[13px] text-destructive sm:px-5">
              Fix the highlighted field to start the import.
            </p>
          )}
        </section>

        <aside aria-label="What gets imported" className="h-fit rounded-lg border bg-card p-4 sm:p-5">
          <p className="text-[13px] font-semibold">What gets imported</p>
          <ul className="mt-3 grid gap-2 text-[13px] leading-5">
            {meta.imports.map((i) => (
              <li key={i} className="flex gap-2">
                <Check className="mt-0.5 size-3.5 shrink-0" aria-hidden /> {i}
              </li>
            ))}
          </ul>
          <p className="mt-4 border-t pt-3 text-[13px] text-muted-foreground">
            Items we can&apos;t bring across are listed in the report with the reason and a Retry button.
          </p>
        </aside>
      </div>
    </div>
  )
}

const VALID = new Set<ImportSource>(["youtube", "wordpress", "ghost", "substack", "rss"])

/** Reads ?source= so links from Connections open the right source. */
export function NewImportFromParams() {
  const params = useSearchParams()
  const s = params.get("source") as ImportSource | null
  const initial = s && VALID.has(s) ? s : "youtube"
  return <NewImport key={initial} initial={initial} />
}

export function NewImportFallback() {
  return <NewImport initial="youtube" />
}
