"use client"

import { useState } from "react"
import { ArrowRight, Loader2, Plus, Sparkles, X } from "lucide-react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import type { Channel } from "@/lib/types"
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

export function VoiceForm({ channel }: { channel: Channel }) {
  const [tone, setTone] = useState(channel.voice.tone)
  const [banned, setBanned] = useState(channel.voice.bannedWords)
  const [word, setWord] = useState("")
  const [houseStyle, setHouseStyle] = useState(channel.voice.houseStyle)
  const [tryState, setTryState] = useState<"idle" | "working" | "done">("idle")

  const wordClean = word.trim().toLowerCase()
  const wordError = wordClean && banned.includes(wordClean) ? `“${wordClean}” is already on the list.` : null

  function addWord() {
    if (!wordClean || wordError) return
    setBanned((b) => [...b, wordClean])
    setWord("")
  }

  return (
    <div>
      <Section id="tone" title="Tone" description="How your drafts should sound. Write it the way you'd brief a new writer.">
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

      <Section id="banned" title="Banned words" description="Words your drafts never use. We swap them out and flag them if they appear in a quote.">
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
