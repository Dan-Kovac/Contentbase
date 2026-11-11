"use client"

import { useRouter } from "next/navigation"
import { ArrowRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Switch } from "@/components/ui/switch"
import { cn } from "@/lib/utils"
import { YouTubeIcon } from "./provider-icons"
import { useSignupDraft } from "./signup-draft"

export interface YouTubeChannelOption {
  handle: string
  title: string
  subscribers: string
  videos: number
  initials: string
  tone: string
}

/** Step 2: which YouTube channel, how much to import, and auto-import. */
export function ChannelPicker({ options }: { options: YouTubeChannelOption[] }) {
  const router = useRouter()
  const [draft, update] = useSignupDraft()
  const selected = options.find((o) => o.handle === draft.youtubeHandle) ?? options[0]

  return (
    <form
      className="flex flex-col gap-8"
      onSubmit={(e) => {
        e.preventDefault()
        router.push("/signup/name")
      }}
    >
      <fieldset className="flex flex-col gap-3">
        <legend className="mb-3 text-[15px] font-semibold">Channels on sam.doherty@gmail.com</legend>
        <RadioGroup value={selected.handle} onValueChange={(v) => update({ youtubeHandle: v })} className="gap-2">
          {options.map((o) => (
            <Label
              key={o.handle}
              htmlFor={`yt-${o.handle}`}
              className={cn(
                "flex cursor-pointer items-center gap-4 rounded-lg border p-4 font-normal transition-colors hover:bg-accent",
                selected.handle === o.handle && "border-foreground ring-1 ring-foreground",
              )}
            >
              <span className="grid size-11 shrink-0 place-items-center rounded-full text-[14px] font-bold text-white" style={{ background: o.tone }} aria-hidden>
                {o.initials}
              </span>
              <span className="flex min-w-0 flex-1 flex-col gap-1">
                <span className="flex items-center gap-1.5 text-[15px] font-semibold">
                  {o.title}
                  <YouTubeIcon className="size-3.5" />
                </span>
                <span className="text-[13px] text-muted-foreground">
                  {o.handle} · {o.subscribers} subscribers · {o.videos} public videos
                </span>
              </span>
              <RadioGroupItem id={`yt-${o.handle}`} value={o.handle} />
            </Label>
          ))}
        </RadioGroup>
      </fieldset>

      <fieldset className="flex flex-col gap-3">
        <legend className="mb-3 text-[15px] font-semibold">What should we import?</legend>
        <RadioGroup value={draft.importScope} onValueChange={(v) => update({ importScope: v as "all" | "recent" })} className="gap-2">
          {[
            { v: "all", title: `All public videos (${selected.videos})`, note: "Best for search. Your back catalogue starts ranking too." },
            { v: "recent", title: "The most recent 50", note: "Faster to review. You can import the rest later." },
          ].map((o) => (
            <Label
              key={o.v}
              htmlFor={`scope-${o.v}`}
              className={cn(
                "flex cursor-pointer items-start gap-3 rounded-lg border p-4 font-normal transition-colors hover:bg-accent",
                draft.importScope === o.v && "border-foreground ring-1 ring-foreground",
              )}
            >
              <RadioGroupItem id={`scope-${o.v}`} value={o.v} className="mt-0.5" />
              <span className="flex flex-col gap-1">
                <span className="text-[15px] font-semibold">{o.title}</span>
                <span className="text-[13px] leading-5 text-muted-foreground">{o.note}</span>
              </span>
            </Label>
          ))}
        </RadioGroup>
      </fieldset>

      <div className="flex items-start justify-between gap-4 rounded-lg border p-4">
        <div className="flex flex-col gap-1">
          <Label htmlFor="auto-import" className="text-[15px] font-semibold">
            Auto-import new uploads
          </Label>
          <p id="auto-import-note" className="text-[13px] leading-5 text-muted-foreground">
            Each new video becomes a draft in Ready to review. Nothing goes live until you publish.
          </p>
        </div>
        <Switch
          id="auto-import"
          checked={draft.autoImport}
          onCheckedChange={(v) => update({ autoImport: v })}
          aria-describedby="auto-import-note"
        />
      </div>

      <div className="flex flex-col gap-3">
        <Button type="submit" size="xl" className="w-full">
          Start import
          <ArrowRight aria-hidden />
        </Button>
        <p className="text-center text-[13px] text-muted-foreground">Import runs in the background while you name your channel.</p>
      </div>
    </form>
  )
}
