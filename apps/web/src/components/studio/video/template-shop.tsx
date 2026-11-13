"use client"

import { useState } from "react"
import Link from "next/link"
import { Check } from "lucide-react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { FORMAT_INFO } from "@/lib/credits"
import type { VideoTemplate } from "@/lib/types"
import { SceneFrame, type BrandKit } from "./scene-frame"
import type { Scene } from "./storyboard"

/** Every template, drawn with this publication's brand kit, so you see your own video before you buy. */
export function TemplateShop({ templates, brand, samples }: { templates: VideoTemplate[]; brand: BrandKit; samples: Scene[] }) {
  const [bought, setBought] = useState<string[]>([])
  const owns = (t: VideoTemplate) => t.owned || bought.includes(t.id)
  const groups = [
    { title: "Included with your plan", items: templates.filter((t) => t.owned) },
    { title: "Add to your account", items: templates.filter((t) => !t.owned) },
  ]
  return (
    <div className="grid gap-10">
      {groups.map((g) => (
        <section key={g.title} aria-label={g.title}>
          <h2 className="mb-3 text-lg font-semibold tracking-[-0.2px]">{g.title}</h2>
          <ul className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {g.items.map((t) => (
              <li key={t.id} className="flex flex-col gap-4 rounded-lg border bg-card p-4">
                <div className="grid grid-cols-3 gap-1.5" aria-hidden>
                  {samples.slice(0, 3).map((s, i) => (
                    <SceneFrame key={s.id} scene={s} index={i} template={t} brand={brand} ratio="9/16" captions={false} />
                  ))}
                </div>
                <div className="flex flex-col gap-1">
                  <p className="flex flex-wrap items-baseline justify-between gap-2">
                    <span className="text-[17px] font-semibold">{t.name}</span>
                    <span className="text-[12px] text-muted-foreground">by {t.by}</span>
                  </p>
                  <p className="text-[14px] leading-[21px] text-muted-foreground">{t.tagline}</p>
                  <p className="text-[13px]">
                    <span className="font-semibold">Best for:</span> <span className="text-muted-foreground">{t.bestFor}</span>
                  </p>
                  <p className="text-[12px] text-muted-foreground">{t.formats.map((f) => FORMAT_INFO[f].label).join(" · ")}</p>
                </div>
                <div className="mt-auto flex items-center justify-between gap-3 border-t pt-3">
                  {owns(t) ? (
                    <>
                      <span className="flex items-center gap-1.5 text-[13px] font-semibold">
                        <Check className="size-4" aria-hidden /> {t.owned ? "Included" : "Yours"}
                      </span>
                      <Button asChild size="sm" variant="outline">
                        <Link href="/studio/video/new">Use it</Link>
                      </Button>
                    </>
                  ) : (
                    <>
                      <span className="text-[15px] font-semibold">${t.price} <span className="text-[12px] font-normal text-muted-foreground">once, inc. GST</span></span>
                      <Button
                        size="sm"
                        onClick={() => {
                          setBought((b) => [...b, t.id])
                          toast.success(`${t.name} added to your account`, { description: `Charged $${t.price} inc. GST to your card. It works on every publication.` })
                        }}
                      >
                        Add template
                      </Button>
                    </>
                  )}
                </div>
              </li>
            ))}
          </ul>
        </section>
      ))}
      <p className="text-[13px] leading-5 text-muted-foreground">
        Templates are motion styles, not stock footage. Each one takes your colours, type, logo and voice, and works for every publication on your account. Motion designers can sell
        their own; Homestand reviews every template before it&apos;s listed.
      </p>
    </div>
  )
}
