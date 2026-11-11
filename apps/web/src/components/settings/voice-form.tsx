"use client"

import { useRef, useState } from "react"
import { ArrowRight, FileText, Globe, Link2, Loader2, Plus, Sparkles, Upload, X } from "lucide-react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { StatusBadge } from "@/components/brand/status-badge"
import { cn } from "@/lib/utils"
import type { Channel, VoiceSource } from "@/lib/types"
import { Panel, PanelBody, PanelFooter, Section } from "./section"

const SAMPLE_SOURCE =
  "The Blues were insane on Saturday night but their centre bounce work was a mess, they lost the clearances 14-6 and the Pies kicked 4 goals straight out of the middle. Cripps looks a lock for the Brownlow but he can't do it on his own."

const SAMPLE_REWRITE =
  "Carlton's centre-bounce work fell apart against Collingwood on Saturday night. They lost the clearances 14 to 6, and Collingwood kicked four goals straight out of the middle. Patrick Cripps is still winning his own ball. The problem is who's standing next to him when it spills."

const CHANGES = [
  "Club names in full: “the Blues” is now Carlton, “the Pies” is Collingwood",
  "Banned words removed: “insane”, “lock”",
  "Numbers under ten in words: “4 goals” is now “four goals”",
  "Explains the why: the last line names the cause, not just the result",
]

function Highlighted({ text, words }: { text: string; words: string[] }) {
  if (words.length === 0) return <>{text}</>
  const escaped = words.map((w) => w.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"))
  const re = new RegExp(`\\b(${escaped.join("|")})\\b`, "gi")
  const parts = text.split(re)
  return (
    <>
      {parts.map((p, i) =>
        i % 2 === 1 ? (
          <mark key={i} className="rounded-[2px] bg-destructive/10 px-0.5 text-destructive line-through decoration-1">
            {p}
          </mark>
        ) : (
          <span key={i}>{p}</span>
        ),
      )}
    </>
  )
}

const ACCEPTED = [".docx", ".pdf", ".md", ".txt"]

const PROFILE = {
  summary:
    "Measured and dry, with a sports editor's patience. You lead with the number, then explain the cause. You praise effort without excusing results, and you end on what to watch next rather than a verdict.",
  phrases: ["The fix may already be on the list", "It isn't an effort problem", "Watch the third quarter again", "Two holes close at once", "The conversation changes"],
  sentence: { average: 16, short: 38, medium: 47, long: 15 },
  avoids: ["insane", "unreal", "lock", "smokey", "must-win", "statement game"],
  example:
    "Brisbane's forward line didn't go cold on Saturday. It went missing. They had 54 inside-50s and kicked nine goals, and the reason isn't Joe Daniher's kicking. Watch where Charlie Cameron leads from: he's starting deep, so by the time the ball arrives he's already used his space. Move him up the ground for a fortnight and the numbers look different.",
}

const KIND_ICON: Record<VoiceSource["kind"], typeof FileText> = { upload: FileText, url: Link2, site: Globe }

function wordCount(n: number) {
  return `${n.toLocaleString("en-AU")} words`
}

function validUrl(v: string) {
  try {
    const u = new URL(/^https?:\/\//i.test(v.trim()) ? v.trim() : `https://${v.trim()}`)
    return u.hostname.includes(".") ? u : null
  } catch {
    return null
  }
}

export function VoiceForm({ channel }: { channel: Channel }) {
  const [tone, setTone] = useState(channel.voice.tone)
  const [banned, setBanned] = useState(channel.voice.bannedWords)
  const [word, setWord] = useState("")
  const [houseStyle, setHouseStyle] = useState(channel.voice.houseStyle)
  const [tryState, setTryState] = useState<"idle" | "working" | "done">("idle")

  // Learning sources
  const [sources, setSources] = useState<VoiceSource[]>(channel.voice.sources)
  const [dragging, setDragging] = useState(false)
  const [uploadError, setUploadError] = useState<string | null>(null)
  const [articleUrl, setArticleUrl] = useState("")
  const [urlError, setUrlError] = useState<string | null>(null)
  const [siteUrl, setSiteUrl] = useState(channel.customDomain ?? "")
  const [siteError, setSiteError] = useState<string | null>(null)
  const fileRef = useRef<HTMLInputElement>(null)
  const counter = useRef(0)

  const learnedWords = sources.filter((s) => s.status === "learned").reduce((n, s) => n + s.words, 0)
  const processing = sources.filter((s) => s.status === "processing").length

  function addSource(src: Omit<VoiceSource, "id" | "status">, delay: number) {
    counter.current += 1
    const id = `new${counter.current}`
    setSources((l) => [{ ...src, id, status: "processing" }, ...l])
    // Simulated: learning finishes after a moment.
    setTimeout(() => setSources((l) => l.map((s) => (s.id === id ? { ...s, status: "learned" } : s))), delay)
  }

  function addFiles(files: FileList | File[]) {
    const list = Array.from(files)
    const bad = list.filter((f) => !ACCEPTED.some((ext) => f.name.toLowerCase().endsWith(ext)))
    setUploadError(bad.length ? `${bad.map((f) => f.name).join(", ")} can't be read. Upload .docx, .pdf, .md or .txt files.` : null)
    list
      .filter((f) => !bad.includes(f))
      .forEach((f, i) => {
        // A rough estimate until the file is parsed: about six bytes a word in plain text.
        const words = Math.max(120, Math.round(f.size / (f.name.endsWith(".txt") || f.name.endsWith(".md") ? 6 : 14)))
        addSource({ kind: "upload", label: f.name, words }, 1600 + i * 500)
      })
    if (list.length > bad.length) toast.success("Uploaded", { description: "We're reading your writing now." })
  }

  function addUrl() {
    const u = validUrl(articleUrl)
    if (!u) {
      setUrlError("That isn't a web address. Paste the full link, e.g. https://footyfix.com.au/the-blues-centre-bounce.")
      return
    }
    setUrlError(null)
    addSource({ kind: "url", label: `${u.hostname.replace(/^www\./, "")}${u.pathname === "/" ? "" : u.pathname}`, words: 1100 + (u.pathname.length % 9) * 85 }, 1800)
    setArticleUrl("")
  }

  function importSite() {
    const u = validUrl(siteUrl)
    if (!u) {
      setSiteError("That isn't a web address. Check the spelling, e.g. footyfix.com.au.")
      return
    }
    setSiteError(null)
    addSource({ kind: "site", label: `${u.hostname.replace(/^www\./, "")} · every article`, words: 48200 }, 3200)
    toast.success("Import started", { description: `We're reading every article on ${u.hostname}. This takes a few minutes for a big site.` })
  }

  const wordClean = word.trim().toLowerCase()
  const wordError = wordClean && banned.includes(wordClean) ? `“${wordClean}” is already on the list.` : null

  function addWord() {
    if (!wordClean || wordError) return
    setBanned((b) => [...b, wordClean])
    setWord("")
  }

  return (
    <div>
      <Section
        id="learn"
        title="Learn from your writing"
        description="Give us articles you've written and we'll learn how you sound: your rhythm, your phrases and the words you never use. The more you add, the closer your drafts get."
      >
        <div className="grid gap-3">
          <Panel>
            <PanelBody>
              <div
                onDragOver={(e) => {
                  e.preventDefault()
                  setDragging(true)
                }}
                onDragLeave={() => setDragging(false)}
                onDrop={(e) => {
                  e.preventDefault()
                  setDragging(false)
                  addFiles(e.dataTransfer.files)
                }}
                className={cn(
                  "grid place-items-center gap-2 rounded-lg border border-dashed px-4 py-7 text-center transition-colors",
                  dragging ? "border-foreground bg-accent" : "bg-muted/30",
                )}
              >
                <span className="grid size-10 place-items-center rounded-full border bg-background">
                  <Upload className="size-4" aria-hidden />
                </span>
                <p className="text-sm font-medium">Drop articles here</p>
                <p className="text-[13px] text-muted-foreground">.docx, .pdf, .md or .txt, up to 20 MB each</p>
                <input
                  ref={fileRef}
                  id="voice-files"
                  type="file"
                  multiple
                  accept={ACCEPTED.join(",")}
                  className="sr-only"
                  onChange={(e) => {
                    if (e.target.files) addFiles(e.target.files)
                    e.target.value = ""
                  }}
                />
                <Button type="button" variant="outline" size="sm" className="mt-1" onClick={() => fileRef.current?.click()}>
                  Choose files
                </Button>
              </div>
              {uploadError && (
                <p role="alert" className="-mt-2 text-[13px] text-destructive">
                  {uploadError}
                </p>
              )}

              <form
                className="grid gap-2"
                onSubmit={(e) => {
                  e.preventDefault()
                  addUrl()
                }}
              >
                <Label htmlFor="voice-url">Paste an article link</Label>
                <div className="flex gap-2">
                  <Input
                    id="voice-url"
                    value={articleUrl}
                    onChange={(e) => setArticleUrl(e.target.value)}
                    placeholder="https://"
                    inputMode="url"
                    aria-invalid={!!urlError}
                    aria-describedby={urlError ? "voice-url-error" : undefined}
                  />
                  <Button type="submit" variant="outline" disabled={!articleUrl.trim()}>
                    <Plus /> Add
                  </Button>
                </div>
                {urlError && (
                  <p id="voice-url-error" className="text-[13px] text-destructive">
                    {urlError}
                  </p>
                )}
              </form>

              <form
                className="grid gap-2 border-t pt-5"
                onSubmit={(e) => {
                  e.preventDefault()
                  importSite()
                }}
              >
                <Label htmlFor="voice-site">Import everything from my site</Label>
                <p className="-mt-1 text-[13px] text-muted-foreground">We read every article on your site once. Nothing on the site changes.</p>
                <div className="flex gap-2">
                  <Input
                    id="voice-site"
                    value={siteUrl}
                    onChange={(e) => setSiteUrl(e.target.value)}
                    placeholder="yoursite.com.au"
                    inputMode="url"
                    aria-invalid={!!siteError}
                    aria-describedby={siteError ? "voice-site-error" : undefined}
                  />
                  <Button type="submit" variant="outline" disabled={!siteUrl.trim()}>
                    <Globe /> Import
                  </Button>
                </div>
                {siteError && (
                  <p id="voice-site-error" className="text-[13px] text-destructive">
                    {siteError}
                  </p>
                )}
              </form>
            </PanelBody>
          </Panel>

          <Panel>
            <div className="flex flex-wrap items-center justify-between gap-2 border-b px-4 py-3 sm:px-5">
              <p className="text-sm font-semibold">Learning sources</p>
              <p className="text-[13px] text-muted-foreground" aria-live="polite">
                {wordCount(learnedWords)} learned{processing ? ` · ${processing} processing` : ""}
              </p>
            </div>
            <ul aria-label="Learning sources" className="divide-y">
              {sources.map((s) => {
                const Icon = KIND_ICON[s.kind]
                return (
                  <li key={s.id} className="flex items-center gap-3 px-4 py-3 sm:px-5">
                    <span className="grid size-8 shrink-0 place-items-center rounded-md border bg-muted/40">
                      <Icon className="size-4" aria-hidden />
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium">{s.label}</p>
                      <p className="text-[13px] text-muted-foreground">
                        {s.kind === "upload" ? "Upload" : s.kind === "url" ? "Article link" : "Whole site"} · {s.status === "processing" ? `about ${wordCount(s.words)}` : wordCount(s.words)}
                      </p>
                    </div>
                    {s.status === "learned" ? (
                      <StatusBadge tone="published">Learned</StatusBadge>
                    ) : (
                      <span className="flex items-center gap-1.5 text-[12px] font-medium text-muted-foreground">
                        <Loader2 className="size-3.5 animate-spin motion-reduce:animate-none" aria-hidden /> Processing
                      </span>
                    )}
                    <Button
                      variant="ghost"
                      size="icon-sm"
                      aria-label={`Remove ${s.label}`}
                      onClick={() => setSources((l) => l.filter((x) => x.id !== s.id))}
                    >
                      <X />
                    </Button>
                  </li>
                )
              })}
              {sources.length === 0 && <li className="px-4 py-6 text-center text-[13px] text-muted-foreground sm:px-5">No writing yet. Add an article to start.</li>}
            </ul>
          </Panel>
        </div>
      </Section>

      <Section
        id="profile"
        title="Your voice profile"
        description="What we learned from your writing. Every draft article, headline and caption uses it. Refine it by hand below."
        aside={processing ? <span className="text-[12px] text-muted-foreground">Updating</span> : undefined}
      >
        <Panel>
          <div className="grid gap-px bg-border">
            <div className="grid gap-2 bg-card p-4 sm:p-5">
              <p className="kicker text-muted-foreground">Tone</p>
              <p className="text-[15px] leading-6">{PROFILE.summary}</p>
            </div>
            <div className="grid gap-px bg-border md:grid-cols-2">
              <div className="grid content-start gap-2.5 bg-card p-4 sm:p-5">
                <p className="kicker text-muted-foreground">Signature phrases</p>
                <ul className="grid gap-1.5 font-serif text-[15px] leading-6">
                  {PROFILE.phrases.map((p) => (
                    <li key={p}>“{p}”</li>
                  ))}
                </ul>
              </div>
              <div className="grid content-start gap-5 bg-card p-4 sm:p-5">
                <div className="grid gap-2.5">
                  <p className="kicker text-muted-foreground">Sentence length</p>
                  <p className="text-sm">
                    <span className="text-[22px] font-bold tabular">{PROFILE.sentence.average}</span> words on average. Short, then a longer one to explain.
                  </p>
                  <div className="flex h-2 overflow-hidden rounded-full" aria-hidden>
                    <span className="bg-foreground" style={{ width: `${PROFILE.sentence.short}%` }} />
                    <span className="bg-foreground/45" style={{ width: `${PROFILE.sentence.medium}%` }} />
                    <span className="bg-foreground/15" style={{ width: `${PROFILE.sentence.long}%` }} />
                  </div>
                  <p className="flex flex-wrap gap-x-4 text-[12px] text-muted-foreground tabular">
                    <span>Under 10 words: {PROFILE.sentence.short}%</span>
                    <span>10 to 25: {PROFILE.sentence.medium}%</span>
                    <span>Over 25: {PROFILE.sentence.long}%</span>
                  </p>
                </div>
                <div className="grid gap-2.5">
                  <p className="kicker text-muted-foreground">Words you avoid</p>
                  <ul className="flex flex-wrap gap-1.5" aria-label="Words you avoid">
                    {PROFILE.avoids.map((w) => (
                      <li key={w} className="rounded-full border px-2.5 py-0.5 text-[13px] text-muted-foreground line-through decoration-1">
                        {w}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
            <div className="grid gap-2 bg-card p-4 sm:p-5">
              <p className="kicker text-muted-foreground">An example in your voice</p>
              <p className="max-w-[68ch] font-serif text-[16px] leading-[1.65]">{PROFILE.example}</p>
            </div>
          </div>
          <PanelFooter note={`Learned from ${wordCount(learnedWords)} across ${sources.filter((s) => s.status === "learned").length} sources.`} />
        </Panel>
      </Section>

      <Section id="tone" title="Tone" description="Adjust what we learned. Write it the way you'd brief a new writer. Your words take priority over the profile.">
        <Panel>
          <PanelBody>
            <div className="grid gap-2">
              <Label htmlFor="voice-tone">Tone of voice</Label>
              <Textarea id="voice-tone" value={tone} onChange={(e) => setTone(e.target.value)} rows={3} maxLength={300} aria-describedby="voice-tone-help" />
              <p id="voice-tone-help" className="flex justify-between gap-3 text-[13px] text-muted-foreground">
                <span>Two or three short sentences work best.</span>
                <span className="tabular">{tone.length}/300</span>
              </p>
            </div>
          </PanelBody>
          <PanelFooter>
            <Button size="sm" disabled={!tone.trim()} onClick={() => toast.success("Saved")}>
              Save
            </Button>
          </PanelFooter>
        </Panel>
      </Section>

      <Section id="banned" title="Banned words" description="Words your drafts never use, on top of the ones you already avoid. We swap them out and flag them if they appear in a quote.">
        <Panel>
          <PanelBody>
            <ul aria-label="Banned words" className="flex flex-wrap gap-2">
              {banned.length === 0 && <li className="text-[13px] text-muted-foreground">No banned words yet.</li>}
              {banned.map((w) => (
                <li key={w} className="flex h-7 items-center gap-1 rounded-full border bg-muted pl-3 pr-1 text-[13px] font-medium">
                  {w}
                  <button
                    type="button"
                    aria-label={`Remove ${w}`}
                    onClick={() => setBanned((b) => b.filter((x) => x !== w))}
                    className="grid size-5 place-items-center rounded-full text-muted-foreground outline-none hover:bg-background hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring"
                  >
                    <X className="size-3" />
                  </button>
                </li>
              ))}
            </ul>
            <form
              className="grid gap-2"
              onSubmit={(e) => {
                e.preventDefault()
                addWord()
              }}
            >
              <Label htmlFor="banned-word">Add a word or phrase</Label>
              <div className="flex gap-2">
                <Input
                  id="banned-word"
                  value={word}
                  onChange={(e) => setWord(e.target.value)}
                  placeholder="e.g. massive"
                  className="sm:max-w-[280px]"
                  aria-invalid={!!wordError}
                  aria-describedby={wordError ? "banned-word-error" : undefined}
                />
                <Button type="submit" variant="outline" disabled={!wordClean || !!wordError}>
                  <Plus /> Add
                </Button>
              </div>
              {wordError && (
                <p id="banned-word-error" className="text-[13px] text-destructive">
                  {wordError}
                </p>
              )}
            </form>
          </PanelBody>
          <PanelFooter note={`${banned.length} ${banned.length === 1 ? "word" : "words"}`}>
            <Button size="sm" onClick={() => toast.success("Saved")}>
              Save
            </Button>
          </PanelFooter>
        </Panel>
      </Section>

      <Section id="house-style" title="House style" description="Spelling, names, numbers and anything else your sub-editor would fix.">
        <Panel>
          <PanelBody>
            <div className="grid gap-2">
              <Label htmlFor="house-style">House style rules</Label>
              <Textarea id="house-style" value={houseStyle} onChange={(e) => setHouseStyle(e.target.value)} rows={5} maxLength={1200} />
              <p className="text-[13px] text-muted-foreground">One rule per sentence works best. We always write in Australian English.</p>
            </div>
          </PanelBody>
          <PanelFooter>
            <Button size="sm" onClick={() => toast.success("Saved")}>
              Save
            </Button>
          </PanelFooter>
        </Panel>
      </Section>

      <Section id="try" title="Try it" description="See a rough paragraph rewritten in your voice. This is a sample. Your real drafts use your transcripts.">
        <Panel>
          <div className="grid gap-px bg-border md:grid-cols-2">
            <div className="bg-card p-4 sm:p-5">
              <p className="kicker text-muted-foreground">Rough draft</p>
              <p className="mt-3 font-serif text-[15px] leading-[1.6]">
                <Highlighted text={SAMPLE_SOURCE} words={banned} />
              </p>
            </div>
            <div className="bg-card p-4 sm:p-5" aria-live="polite">
              <p className="kicker">In your voice</p>
              {tryState === "done" ? (
                <p className="mt-3 font-serif text-[15px] leading-[1.6]">{SAMPLE_REWRITE}</p>
              ) : tryState === "working" ? (
                <div className="mt-3 grid gap-2" aria-label="Rewriting">
                  {[100, 94, 98, 72, 88].map((w, i) => (
                    <div key={i} className="h-3.5 animate-pulse rounded bg-muted" style={{ width: `${w}%` }} />
                  ))}
                </div>
              ) : (
                <p className="mt-3 text-[13px] text-muted-foreground">Rewrite the paragraph to see your tone, banned words and house style at work.</p>
              )}
            </div>
          </div>
          {tryState === "done" && (
            <div className="border-t px-4 py-3 sm:px-5">
              <p className="text-[13px] font-semibold">What changed</p>
              <ul className="mt-1.5 grid gap-1 text-[13px] text-muted-foreground">
                {CHANGES.map((c) => (
                  <li key={c} className="flex gap-2">
                    <ArrowRight className="mt-0.5 size-3.5 shrink-0" aria-hidden /> {c}
                  </li>
                ))}
              </ul>
            </div>
          )}
          <PanelFooter note="Drafts are always drafts. Nothing goes live until you publish.">
            <Button
              size="sm"
              variant="outline"
              disabled={tryState === "working"}
              onClick={() => {
                setTryState("working")
                setTimeout(() => setTryState("done"), 1100)
              }}
            >
              {tryState === "working" ? <Loader2 className="animate-spin" /> : <Sparkles />} {tryState === "done" ? "Rewrite again" : "Rewrite in my voice"}
            </Button>
          </PanelFooter>
        </Panel>
      </Section>
    </div>
  )
}
