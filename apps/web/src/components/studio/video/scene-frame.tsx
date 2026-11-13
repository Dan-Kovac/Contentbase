// One storyboard scene, drawn in a template's style with the publication's brand kit. It is a
// still of the scene (the prototype has no renderer); sizes use container units so the same scene
// reads at any frame size, from a thumbnail to the preview.
import { readableOn } from "@/lib/format"
import { cn } from "@/lib/utils"
import type { VideoTemplate } from "@/lib/types"
import type { Scene } from "./storyboard"

export interface BrandKit {
  name: string
  accentHex: string
  /** The pairing's display face, as a CSS font-family value. */
  display: string
  domain: string
}

type Look = { ground: string; ink: string; muted: string; panel: string; rule: string }

function look(style: VideoTemplate["style"], accent: string): Look {
  switch (style) {
    case "explainer":
      return { ground: "#0b0b0b", ink: "#ffffff", muted: "rgba(255,255,255,.65)", panel: "rgba(255,255,255,.08)", rule: accent }
    case "report":
      return { ground: "#ffffff", ink: "#0a0a0a", muted: "#5c5c5c", panel: "#f2f2f2", rule: accent }
    case "countdown":
      return { ground: accent, ink: readableOn(accent), muted: readableOn(accent) === "#ffffff" ? "rgba(255,255,255,.75)" : "rgba(10,10,10,.7)", panel: "rgba(0,0,0,.12)", rule: readableOn(accent) }
    case "datadesk":
      return { ground: "#f4f1ea", ink: "#141414", muted: "#5f5a50", panel: "#e8e3d8", rule: accent }
    case "racecard":
      return { ground: "#fbf6e9", ink: "#1d1a14", muted: "#6b6253", panel: "#efe6cf", rule: "#1d1a14" }
    case "chalkboard":
      return { ground: "#1f3a2e", ink: "#f4f1e6", muted: "rgba(244,241,230,.7)", panel: "rgba(244,241,230,.08)", rule: "#f4f1e6" }
  }
}

export function SceneFrame({
  scene,
  index,
  template,
  brand,
  ratio,
  captions = true,
  className,
}: {
  scene: Scene
  index: number
  template: VideoTemplate
  brand: BrandKit
  ratio: string
  captions?: boolean
  className?: string
}) {
  const l = look(template.style, brand.accentHex)
  const on = readableOn(brand.accentHex)
  const tall = ratio === "9/16" || ratio === "4/5"
  const display = { fontFamily: brand.display, fontWeight: 800, letterSpacing: "-0.02em" }
  const chalk = template.style === "chalkboard"
  const max = Math.max(...(scene.rows?.map((r) => r.value) ?? [1]))

  return (
    <div
      className={cn("@container relative isolate w-full overflow-hidden rounded-md", className)}
      style={{ aspectRatio: ratio, background: l.ground, color: l.ink }}
      aria-label={`Scene ${index + 1}: ${scene.onScreen}`}
      role="img"
    >
      {/* Background image for title and image scenes */}
      {scene.image && (scene.kind === "title" || scene.kind === "image") && (
        <>
          {/* eslint-disable-next-line @next/next/no-img-element -- prototype media */}
          <img src={scene.image} alt="" className="absolute inset-0 -z-20 size-full object-cover" />
          <div className="absolute inset-0 -z-10" style={{ background: `linear-gradient(${tall ? "0deg" : "90deg"}, ${l.ground} 18%, ${l.ground}cc 52%, ${l.ground}33 100%)` }} />
        </>
      )}
      {chalk && <div className="absolute inset-[3%] -z-10 rounded-sm border-2 border-dashed opacity-25" style={{ borderColor: l.rule }} />}

      <div className={cn("flex h-full flex-col justify-between", tall ? "p-[7cqw]" : "p-[4.5cqw]")}>
        {/* Top: brand mark and scene label */}
        <div className="flex items-center justify-between gap-2">
          <span className="flex items-center gap-[1.5cqw]">
            <span className="grid place-items-center rounded-[0.6cqw] font-black" style={{ width: tall ? "7cqw" : "4cqw", height: tall ? "7cqw" : "4cqw", fontSize: tall ? "4cqw" : "2.3cqw", background: brand.accentHex, color: on }}>
              {brand.name[0]}
            </span>
            <span className="font-semibold" style={{ fontSize: tall ? "3.6cqw" : "2cqw" }}>
              {brand.name}
            </span>
          </span>
          {template.style === "countdown" && scene.kind !== "title" && scene.kind !== "end" && (
            <span style={{ ...display, fontSize: tall ? "22cqw" : "13cqw", lineHeight: 0.8, opacity: 0.9 }}>{index}</span>
          )}
          {template.style === "report" && <span className="h-[0.8cqw] w-[18cqw]" style={{ background: l.rule }} />}
        </div>

        {/* Middle: the scene itself */}
        <div className={cn("flex flex-col", tall ? "gap-[3cqw]" : "gap-[1.8cqw]")}>
          {scene.kind === "chart" && scene.rows ? (
            <>
              <p style={{ ...display, fontSize: tall ? "6.5cqw" : "3.6cqw", lineHeight: 1.05 }}>{scene.onScreen}</p>
              <ul className={cn("flex flex-col", tall ? "gap-[2.4cqw]" : "gap-[1.3cqw]")}>
                {scene.rows.map((r) => (
                  <li key={r.label} className="flex items-center gap-[1.5cqw]" style={{ fontSize: tall ? "3.6cqw" : "1.9cqw" }}>
                    <span className="w-[26%] shrink-0 truncate font-semibold">{r.label}</span>
                    <span className="relative h-[1.2em] flex-1 overflow-hidden rounded-[0.4cqw]" style={{ background: l.panel }}>
                      <span className="absolute inset-y-0 left-0 rounded-[0.4cqw]" style={{ width: `${(r.value / max) * 100}%`, background: chalk ? "transparent" : brand.accentHex, border: chalk ? `2px dashed ${l.rule}` : undefined }} />
                    </span>
                    <span className="w-[18%] shrink-0 text-right font-semibold tabular-nums">{r.value}</span>
                  </li>
                ))}
              </ul>
            </>
          ) : scene.kind === "table" && scene.rows ? (
            <>
              <p style={{ ...display, fontSize: tall ? "6.5cqw" : "3.6cqw", lineHeight: 1.05 }}>{scene.onScreen}</p>
              <table className="w-full border-collapse" style={{ fontSize: tall ? "3.4cqw" : "1.8cqw" }}>
                <tbody>
                  {scene.rows.map((r) => (
                    <tr key={r.label} style={{ borderTop: `1px solid ${l.panel}` }}>
                      <td className="py-[0.8cqw] font-semibold">{r.label}</td>
                      <td className="py-[0.8cqw] text-right" style={{ color: l.muted }}>
                        {r.display}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </>
          ) : scene.kind === "quote" ? (
            <>
              <span className="block h-[0.8cqw] w-[10cqw]" style={{ background: l.rule }} />
              <p style={{ ...display, fontSize: tall ? "7cqw" : "4.2cqw", lineHeight: 1.08 }}>“{scene.onScreen}”</p>
              {scene.cite && <p style={{ fontSize: tall ? "3.4cqw" : "1.9cqw", color: l.muted }}>{scene.cite}</p>}
            </>
          ) : scene.kind === "end" ? (
            <>
              <p style={{ ...display, fontSize: tall ? "9cqw" : "5.4cqw", lineHeight: 1 }}>{scene.onScreen}</p>
              <span className="w-fit rounded-full px-[2.4cqw] py-[1cqw] font-semibold" style={{ background: brand.accentHex, color: on, fontSize: tall ? "3.6cqw" : "2cqw" }}>
                {brand.domain}
              </span>
            </>
          ) : (
            <>
              {scene.kind === "point" && template.style !== "countdown" && <span className="block h-[0.8cqw] w-[10cqw]" style={{ background: l.rule }} />}
              <p
                className={cn(scene.kind === "title" && "max-w-[92%]", scene.kind !== "title" && !tall && "max-w-[78%]")}
                style={{ ...display, fontSize: scene.kind === "title" ? (tall ? "9cqw" : "5.6cqw") : tall ? "7.4cqw" : "4.4cqw", lineHeight: 1.04 }}
              >
                {scene.onScreen}
              </p>
            </>
          )}
        </div>

        {/* Bottom: burned-in captions */}
        {captions ? (
          <p className="line-clamp-2 rounded-[0.6cqw] px-[1.6cqw] py-[0.8cqw]" style={{ background: "rgba(0,0,0,.62)", color: "#fff", fontSize: tall ? "3.4cqw" : "1.75cqw", lineHeight: 1.3 }}>
            {scene.voiceover}
          </p>
        ) : (
          <span />
        )}
      </div>
    </div>
  )
}
