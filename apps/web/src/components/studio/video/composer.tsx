"use client"

/**
 * Words to video. Pick an article (or paste text), a template and a format. The script is drafted
 * scene by scene in the publication's brand kit and voice; edit any line, see the credit cost, then
 * generate. The result is a draft that waits for review, like everything else on Homestand.
 */
import { useEffect, useMemo, useState } from "react"
import Link from "next/link"
import { ArrowRight, Check, CircleCheck, Coins, Mic, Sparkles, Wand2 } from "lucide-react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Switch } from "@/components/ui/switch"
import { Textarea } from "@/components/ui/textarea"
import { FORMAT_INFO, renderCost } from "@/lib/credits"
import { cn } from "@/lib/utils"
import type { Block, VideoFormat, VideoTemplate } from "@/lib/types"
import { SceneFrame, type BrandKit } from "./scene-frame"
import { buildStoryboard, clock, totalSeconds, type Scene } from "./storyboard"

export interface ComposerArticle {
  id: string
  headline: string
  standfirst: string
  hero?: string
  blocks: Block[]
}

const VOICES = [
  { id: "measured", label: "Measured", note: "Warm and even, like a match-day explainer" },
  { id: "upbeat", label: "Upbeat", note: "Quicker, for shorts and the feed" },
]

function textToBlocks(text: string): Block[] {
  return text
    .split(/\n{2,}/)
    .map((p) => p.trim())
    .filter(Boolean)
    .map((p) => (/^#+\s/.test(p) ? { type: "heading" as const, text: p.replace(/^#+\s*/, "") } : { type: "paragraph" as const, text: p }))
}

export function VideoComposer({
  articles,
  templates,
  brand,
  cta,
  voiceTone,
  balance: startBalance,
  initialArticle,
}: {
  articles: ComposerArticle[]
  templates: VideoTemplate[]
  brand: BrandKit
  cta: string
  voiceTone: string
  balance: number
  initialArticle?: string
}) {
  const owned = templates.filter((t) => t.owned)
  const [source, setSource] = useState<string>(initialArticle && articles.some((a) => a.id === initialArticle) ? initialArticle : (articles[0]?.id ?? "paste"))
  const [pasted, setPasted] = useState("")
  const [templateId, setTemplateId] = useState(owned[0]?.id ?? "")
  const [format, setFormat] = useState<VideoFormat>("long")
  const [voice, setVoice] = useState(true)
  const [voiceId, setVoiceId] = useState(VOICES[0].id)
  const [edits, setEdits] = useState<Record<string, string>>({})
  const [selected, setSelected] = useState(0)
  const [balance, setBalance] = useState(startBalance)
  const [phase, setPhase] = useState<"edit" | "rendering" | "done">("edit")
  const [progress, setProgress] = useState(0)

  const template = templates.find((t) => t.id === templateId) ?? owned[0]
  const article = articles.find((a) => a.id === source)
  const src = article ?? { headline: pasted.split("\n")[0]?.slice(0, 90) || "Your headline", standfirst: "", blocks: textToBlocks(pasted.split("\n").slice(1).join("\n")) }

  const scenes: Scene[] = useMemo(() => {
    const built = buildStoryboard(src, format, cta)
    return built.map((s) => (edits[s.id] ? { ...s, voiceover: edits[s.id] } : s))
    // eslint-disable-next-line react-hooks/exhaustive-deps -- src is derived from source, pasted and articles
  }, [source, pasted, format, cta, edits, articles])

  const seconds = totalSeconds(scenes)
  const cost = renderCost(format, seconds, voice)
  const short = format === "short"
  const ratio = FORMAT_INFO[format].ratio
  const current = scenes[Math.min(selected, scenes.length - 1)]
  const canAfford = cost <= balance
  const noSource = !article && pasted.trim().split(/\s+/).length < 20

  // Formats a template can't make fall back to one it can.
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- keeps the format valid for the chosen template
    if (template && !template.formats.includes(format)) setFormat(template.formats[0])
  }, [template, format])

  useEffect(() => {
    if (phase !== "rendering") return
    const t = setInterval(() => setProgress((p) => Math.min(100, p + 5)), 140)
    const done = setTimeout(() => {
      setPhase("done")
      setBalance((b) => b - cost)
    }, 3000)
    return () => {
      clearInterval(t)
      clearTimeout(done)
    }
  }, [phase, cost])

  if (!template) return null

  if (phase !== "edit") {
    return (
      <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_360px]">
        <div className={cn("mx-auto w-full", short ? "max-w-[360px]" : format === "inapp" ? "max-w-[480px]" : "")}>
          <SceneFrame scene={scenes[0]} index={0} template={template} brand={brand} ratio={ratio} />
        </div>
        <div className="flex flex-col gap-5">
          {phase === "rendering" ? (
            <>
              <p className="flex items-center gap-2 text-[15px] font-semibold">
                <Wand2 className="size-4" aria-hidden /> Rendering {scenes.length} scenes in {template.name}
              </p>
              <Progress value={progress} aria-label="Render progress" />
              <ul className="flex flex-col gap-1.5 text-[13px] text-muted-foreground">
                <li className={cn(progress > 15 && "text-foreground")}>Voiceover in your {VOICES.find((v) => v.id === voiceId)?.label.toLowerCase()} voice</li>
                <li className={cn(progress > 45 && "text-foreground")}>Charts, tables and type in {brand.name}&apos;s colours</li>
                <li className={cn(progress > 75 && "text-foreground")}>Captions burned in, {FORMAT_INFO[format].label.toLowerCase()} {ratio.replace("/", ":")}</li>
              </ul>
            </>
          ) : (
            <>
              <p className="flex items-center gap-2 text-[17px] font-semibold">
                <CircleCheck className="size-5 text-pop-ink" aria-hidden /> Your draft video is ready to review
              </p>
              <p className="text-[14px] leading-[21px] text-muted-foreground">
                {clock(seconds)} · {scenes.length} scenes · {cost} credits used, {balance.toLocaleString("en-AU")} left. Nothing goes live until you publish.
                {voice && " The video is labelled as using a synthetic voice."}
              </p>
              <div className="flex flex-col gap-2">
                <Button variant="pop" size="lg" onClick={() => toast.success(`Published to ${brand.name}`, { description: short ? "It's in your shorts row and feed." : "It has its own video page, with chapters from the scenes." })}>
                  Publish to {brand.name}
                </Button>
                <Button variant="outline" size="lg" onClick={() => toast("Download ready", { description: "MP4 with captions, plus an SRT file." })}>
                  Download MP4
                </Button>
                <Button variant="ghost" onClick={() => setPhase("edit")}>
                  Back to the storyboard
                </Button>
              </div>
            </>
          )}
        </div>
      </div>
    )
  }

  return (
    <div className="grid gap-8 xl:grid-cols-[360px_minmax(0,1fr)]">
      {/* Settings */}
      <div className="flex flex-col gap-7">
        <fieldset className="flex flex-col gap-2">
          <legend className="mb-2 text-[13px] font-semibold uppercase tracking-[0.8px] text-muted-foreground">1. Words</legend>
          <div role="radiogroup" aria-label="Source" className="flex flex-col gap-1.5">
            {articles.map((a) => (
              <button
                key={a.id}
                type="button"
                role="radio"
                aria-checked={source === a.id}
                onClick={() => {
                  setSource(a.id)
                  setEdits({})
                  setSelected(0)
                }}
                className={cn("flex items-start gap-2.5 rounded-lg border p-3 text-left text-[14px] outline-none transition-colors focus-visible:ring-2 focus-visible:ring-ring", source === a.id ? "border-foreground ring-1 ring-foreground" : "hover:bg-accent")}
              >
                <span className="min-w-0 flex-1 font-semibold leading-5">{a.headline}</span>
                {source === a.id && <Check className="mt-0.5 size-4 shrink-0" aria-hidden />}
              </button>
            ))}
            <button
              type="button"
              role="radio"
              aria-checked={source === "paste"}
              onClick={() => {
                setSource("paste")
                setEdits({})
                setSelected(0)
              }}
              className={cn("rounded-lg border border-dashed p-3 text-left text-[14px] font-semibold outline-none transition-colors focus-visible:ring-2 focus-visible:ring-ring", source === "paste" ? "border-foreground ring-1 ring-foreground" : "hover:bg-accent")}
            >
              Paste your own text
            </button>
          </div>
          {source === "paste" && (
            <Textarea
              aria-label="Your text"
              value={pasted}
              onChange={(e) => setPasted(e.target.value)}
              placeholder={"First line is the headline.\n\nThen paragraphs, separated by a blank line."}
              className="min-h-36"
            />
          )}
        </fieldset>

        <fieldset className="flex flex-col gap-2">
          <legend className="mb-2 flex w-full items-center justify-between text-[13px] font-semibold uppercase tracking-[0.8px] text-muted-foreground">
            2. Template
            <Link href="/studio/video/templates" className="text-[13px] font-semibold normal-case tracking-normal text-foreground underline-offset-4 hover:underline">
              Get more
            </Link>
          </legend>
          <div role="radiogroup" aria-label="Template" className="grid grid-cols-3 gap-2">
            {owned.map((t) => (
              <button
                key={t.id}
                type="button"
                role="radio"
                aria-checked={templateId === t.id}
                onClick={() => setTemplateId(t.id)}
                className={cn("flex flex-col gap-1.5 rounded-lg border p-1.5 text-left outline-none transition-colors focus-visible:ring-2 focus-visible:ring-ring", templateId === t.id ? "border-foreground ring-1 ring-foreground" : "hover:bg-accent")}
              >
                <SceneFrame scene={scenes[1] ?? scenes[0]} index={1} template={t} brand={brand} ratio="16/9" captions={false} className="rounded-[4px]" />
                <span className="px-0.5 text-[12px] font-semibold leading-4">{t.name}</span>
              </button>
            ))}
          </div>
          <p className="text-[12px] leading-[18px] text-muted-foreground">{template.tagline}</p>
        </fieldset>

        <fieldset className="flex flex-col gap-2">
          <legend className="mb-2 text-[13px] font-semibold uppercase tracking-[0.8px] text-muted-foreground">3. Format</legend>
          <div role="radiogroup" aria-label="Format" className="grid grid-cols-3 gap-2">
            {(Object.keys(FORMAT_INFO) as VideoFormat[]).map((f) => {
              const ok = template.formats.includes(f)
              return (
                <button
                  key={f}
                  type="button"
                  role="radio"
                  aria-checked={format === f}
                  disabled={!ok}
                  onClick={() => {
                    setFormat(f)
                    setSelected(0)
                  }}
                  className={cn(
                    "flex flex-col items-center gap-1.5 rounded-lg border p-2.5 text-[13px] font-semibold outline-none transition-colors focus-visible:ring-2 focus-visible:ring-ring disabled:opacity-40",
                    format === f ? "border-foreground ring-1 ring-foreground" : "hover:bg-accent",
                  )}
                >
                  <span className="rounded-[2px] border-2 border-current" style={{ aspectRatio: FORMAT_INFO[f].ratio, height: 22 }} aria-hidden />
                  {FORMAT_INFO[f].label}
                </button>
              )
            })}
          </div>
          <p className="text-[12px] leading-[18px] text-muted-foreground">{FORMAT_INFO[format].note}</p>
        </fieldset>

        <fieldset className="flex flex-col gap-3">
          <legend className="mb-2 text-[13px] font-semibold uppercase tracking-[0.8px] text-muted-foreground">4. Voice and brand</legend>
          <label className="flex items-center justify-between gap-3 rounded-lg border p-3">
            <span className="flex items-center gap-2 text-[14px] font-semibold">
              <Mic className="size-4" aria-hidden /> Synthetic voiceover
            </span>
            <Switch checked={voice} onCheckedChange={setVoice} aria-label="Synthetic voiceover" />
          </label>
          {voice && (
            <div role="radiogroup" aria-label="Voice" className="grid grid-cols-2 gap-2">
              {VOICES.map((v) => (
                <button
                  key={v.id}
                  type="button"
                  role="radio"
                  aria-checked={voiceId === v.id}
                  onClick={() => setVoiceId(v.id)}
                  className={cn("flex flex-col gap-0.5 rounded-lg border p-2.5 text-left outline-none focus-visible:ring-2 focus-visible:ring-ring", voiceId === v.id ? "border-foreground ring-1 ring-foreground" : "hover:bg-accent")}
                >
                  <span className="text-[13px] font-semibold">{v.label}</span>
                  <span className="text-[12px] leading-4 text-muted-foreground">{v.note}</span>
                </button>
              ))}
            </div>
          )}
          <div className="flex items-start gap-3 rounded-lg bg-muted/60 p-3 text-[13px] leading-5">
            <span className="mt-0.5 size-5 shrink-0 rounded-[4px]" style={{ background: brand.accentHex }} aria-hidden />
            <span className="text-muted-foreground">
              <span className="font-semibold text-foreground">{brand.name} brand kit</span> · your colour, type and logo. Script written in your voice: “{voiceTone}”{" "}
              <Link href="/studio/settings/design" className="font-semibold text-foreground underline-offset-4 hover:underline">
                Edit
              </Link>
            </span>
          </div>
        </fieldset>
      </div>

      {/* Preview and storyboard */}
      <div className="flex min-w-0 flex-col gap-6">
        <div className={cn("mx-auto w-full", short ? "max-w-[340px]" : format === "inapp" ? "max-w-[460px]" : "")}>
          {current && <SceneFrame scene={current} index={selected} template={template} brand={brand} ratio={ratio} />}
          <p className="mt-2 text-center text-[12px] text-muted-foreground">
            Scene {selected + 1} of {scenes.length} · a still from the storyboard. The render adds motion and voice.
          </p>
        </div>

        <section aria-labelledby="storyboard-h">
          <div className="mb-3 flex items-baseline justify-between gap-3">
            <h2 id="storyboard-h" className="text-lg font-semibold tracking-[-0.2px]">
              Storyboard
            </h2>
            <span className="text-[13px] text-muted-foreground tabular-nums">
              {scenes.length} scenes · {clock(seconds)}
            </span>
          </div>
          <ol className="flex flex-col divide-y rounded-lg border bg-card">
            {scenes.map((s, i) => (
              <li key={s.id} className={cn("grid gap-3 p-3 sm:grid-cols-[150px_minmax(0,1fr)] sm:gap-4", i === selected && "bg-accent/50")}>
                <button type="button" onClick={() => setSelected(i)} aria-label={`Preview scene ${i + 1}`} className="rounded-md outline-none focus-visible:ring-2 focus-visible:ring-ring">
                  <SceneFrame scene={s} index={i} template={template} brand={brand} ratio="16/9" captions={false} />
                </button>
                <div className="flex min-w-0 flex-col gap-1.5">
                  <p className="flex items-center gap-2 text-[12px] text-muted-foreground">
                    <span className="font-mono tabular-nums">{String(i + 1).padStart(2, "0")}</span>
                    <span className="font-semibold uppercase tracking-[0.6px] text-foreground">{s.kind === "point" ? "Point" : s.kind === "end" ? "End card" : s.kind}</span>
                    <span className="tabular-nums">{s.seconds}s</span>
                  </p>
                  <Textarea
                    aria-label={`Voiceover for scene ${i + 1}`}
                    value={s.voiceover}
                    onChange={(e) => setEdits((x) => ({ ...x, [s.id]: e.target.value }))}
                    onFocus={() => setSelected(i)}
                    className="min-h-16 text-[14px] leading-[21px]"
                  />
                </div>
              </li>
            ))}
          </ol>
        </section>
      </div>

      {/* Cost and generate */}
      <div className="sticky bottom-4 z-20 xl:col-span-2">
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-lg border bg-background/95 px-4 py-3 shadow-popover backdrop-blur">
          <p className="flex flex-wrap items-center gap-x-4 gap-y-1 text-[13px] text-muted-foreground">
            <span className="flex items-center gap-1.5 font-semibold text-foreground">
              <Coins className="size-4" aria-hidden /> {cost} credits
            </span>
            <span>
              {FORMAT_INFO[format].label} · {clock(seconds)} {voice ? "· with voiceover" : "· no voiceover"}
            </span>
            <span>{canAfford ? `${(balance - cost).toLocaleString("en-AU")} left after this` : "Not enough credits"}</span>
            {!canAfford && (
              <Link href="/studio/credits" className="font-semibold text-foreground underline-offset-4 hover:underline">
                Top up
              </Link>
            )}
          </p>
          <Button
            variant="pop"
            size="lg"
            disabled={!canAfford || noSource}
            onClick={() => {
              setProgress(0)
              setPhase("rendering")
            }}
          >
            <Sparkles /> Generate video <ArrowRight />
          </Button>
        </div>
      </div>
    </div>
  )
}
