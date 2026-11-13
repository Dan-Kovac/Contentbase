"use client"

/**
 * One viewer state for the whole channel (AUD-01, TLK-01–03). The prototype has no real
 * sessions, so the state lives here and in localStorage. The real flows set it: joining signs
 * the viewer in, the age check verifies them, and any "Don't show me betting ads" opts them out.
 *
 * Ad decisions are never made here. The server decides the sponsor for every viewer state
 * (`slotOptions`), and this only picks one of those four answers.
 */
import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react"
import { ChevronDown, Eye, ShieldCheck, ShieldOff, X } from "lucide-react"
import { toast } from "sonner"
import {
  HalftimeBreak,
  OPT_OUT_EVENT,
  PresentedBy,
  SponsoredShortCard,
  SponsoredStoryCard,
} from "@/components/brand/native-ads"
import { cn } from "@/lib/utils"
import type { Sponsor } from "@/lib/types"
import type { StorySize } from "./styles"

export type Viewer = "logged_out" | "signed_in" | "verified" | "opted_out"

const VIEWERS: Viewer[] = ["logged_out", "signed_in", "verified", "opted_out"]
const STORE = "homestand:viewer"
const DEMO_STORE = "homestand:demo-bar"

function read(key: string) {
  try {
    return window.localStorage.getItem(key)
  } catch {
    return null
  }
}
function write(key: string, value: string) {
  try {
    window.localStorage.setItem(key, value)
  } catch {
    /* private mode or blocked storage: the state still works for this page */
  }
}

interface Ctx {
  viewer: Viewer
  setViewer: (v: Viewer) => void
  signedIn: boolean
  verified: boolean
}

const ViewerCtx = createContext<Ctx>({ viewer: "logged_out", setViewer: () => {}, signedIn: false, verified: false })

export function useViewer() {
  return useContext(ViewerCtx)
}

/** Read the stored viewer outside React (e.g. to send a just-joined viewer back). */
export function storeViewer(v: Viewer) {
  write(STORE, v)
}

export function ViewerProvider({ children }: { children: React.ReactNode }) {
  const [viewer, setViewerState] = useState<Viewer>("logged_out")

  const setViewer = useCallback((v: Viewer) => {
    setViewerState(v)
    write(STORE, v)
  }, [])

  // Restore after hydration: ?as= in the URL wins, then what this browser remembers.
  useEffect(() => {
    const fromUrl = new URLSearchParams(window.location.search).get("as")
    const stored = read(STORE)
    const next = [fromUrl, stored].find((x): x is Viewer => !!x && (VIEWERS as string[]).includes(x))
    // eslint-disable-next-line react-hooks/set-state-in-effect -- one-time restore from the URL and storage after hydration
    if (next) setViewerState(next)
    if (fromUrl && next === fromUrl) write(STORE, fromUrl)
  }, [])

  // Any "Don't show me betting ads" on the page opts this viewer out everywhere.
  useEffect(() => {
    const onOptOut = (e: Event) => {
      if ((e as CustomEvent).detail !== "wagering") return
      setViewerState((v) => {
        const next = v === "verified" ? "opted_out" : v
        write(STORE, next)
        return next
      })
    }
    window.addEventListener(OPT_OUT_EVENT, onOptOut)
    return () => window.removeEventListener(OPT_OUT_EVENT, onOptOut)
  }, [])

  const value = useMemo<Ctx>(
    () => ({ viewer, setViewer, signedIn: viewer !== "logged_out", verified: viewer === "verified" || viewer === "opted_out" }),
    [viewer, setViewer],
  )
  return <ViewerCtx.Provider value={value}>{children}</ViewerCtx.Provider>
}

/* ---------------------------------------------------------------------------------------------
 * A sponsor unit that follows the viewer. The server passes the sponsor for each viewer state.
 * ------------------------------------------------------------------------------------------- */

type SlotProps =
  | { format: "story"; size?: StorySize; ratio?: "16/9" | "3/2"; standfirst?: boolean; variant?: "card" | "rail" }
  | { format: "short"; fill?: boolean; variant?: "row" | "feed" }
  | { format: "halftime" }
  | { format: "presented"; tone?: "light" | "dark" }

export function SponsorSlot({ options, className, ...props }: SlotProps & { options: Record<Viewer, Sponsor>; className?: string }) {
  const { viewer } = useViewer()
  const sponsor = options[viewer]
  switch (props.format) {
    case "story":
      return <SponsoredStoryCard key={sponsor.id} sponsor={sponsor} className={className} size={props.size} ratio={props.ratio} standfirst={props.standfirst} variant={props.variant} />
    case "short":
      return <SponsoredShortCard key={sponsor.id} sponsor={sponsor} className={className} fill={props.fill} variant={props.variant} />
    case "halftime":
      return <HalftimeBreak key={sponsor.id} sponsor={sponsor} className={className} />
    case "presented":
      return <PresentedBy key={sponsor.id} sponsor={sponsor} className={className} tone={props.tone} />
  }
}

/* ---------------------------------------------------------------------------------------------
 * Demo bar: a small control fixed to the bottom of channel pages so a demo can show every ad
 * state without signing in four times. ?demo=0 hides it.
 * ------------------------------------------------------------------------------------------- */

export const VIEWER_LABELS: Record<Viewer, string> = {
  logged_out: "Logged out",
  signed_in: "Signed in",
  verified: "Confirmed 18+",
  opted_out: "18+, opted out of betting ads",
}

export function DemoBar({ notes }: { notes: Record<Viewer, string> }) {
  const { viewer, setViewer } = useViewer()
  const [open, setOpen] = useState(true)
  const [hidden, setHidden] = useState(true)

  useEffect(() => {
    const param = new URLSearchParams(window.location.search).get("demo")
    if (param === "0" || param === "1") write(DEMO_STORE, param)
    // eslint-disable-next-line react-hooks/set-state-in-effect -- reads the URL and storage once after hydration
    setHidden(read(DEMO_STORE) === "0")
    if (read(DEMO_STORE + ":open") === "0") setOpen(false)
  }, [])

  if (hidden) return null
  const restricted = viewer === "verified" || viewer === "opted_out"

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => {
          setOpen(true)
          write(DEMO_STORE + ":open", "1")
        }}
        className="fixed bottom-4 left-1/2 z-40 inline-flex h-9 -translate-x-1/2 items-center gap-2 rounded-full bg-brand-black px-4 font-sans text-[13px] font-semibold text-brand-white shadow-popover outline-none focus-visible:ring-2 focus-visible:ring-ring"
      >
        <Eye className="size-4" aria-hidden /> Viewing as: {VIEWER_LABELS[viewer]}
      </button>
    )
  }

  return (
    <div
      role="region"
      aria-label="Demo: view this channel as"
      className="fixed inset-x-3 bottom-3 z-40 mx-auto max-w-[760px] rounded-xl bg-brand-black/95 p-3 font-sans text-brand-white shadow-popover backdrop-blur sm:bottom-4"
    >
      <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
        <span id="viewing-as" className="text-[11px] font-bold uppercase tracking-[1px] text-brand-muted">
          Viewing as
        </span>
        <div role="radiogroup" aria-labelledby="viewing-as" className="flex flex-wrap gap-1">
          {VIEWERS.map((v) => (
            <button
              key={v}
              type="button"
              role="radio"
              aria-checked={viewer === v}
              onClick={() => {
                setViewer(v)
                if (v === "opted_out") toast("You won't see betting ads on Homestand")
              }}
              className={cn(
                "h-8 rounded-md px-2.5 text-[12px] font-semibold outline-none transition-colors focus-visible:ring-2 focus-visible:ring-brand-white",
                viewer === v ? "bg-brand-white text-brand-black" : "text-brand-white/80 hover:bg-white/10",
              )}
            >
              {VIEWER_LABELS[v]}
            </button>
          ))}
        </div>
        <span className="ml-auto flex items-center gap-1">
          <button
            type="button"
            aria-label="Collapse"
            onClick={() => {
              setOpen(false)
              write(DEMO_STORE + ":open", "0")
            }}
            className="grid size-8 place-items-center rounded-md text-brand-muted outline-none hover:bg-white/10 hover:text-brand-white focus-visible:ring-2 focus-visible:ring-brand-white"
          >
            <ChevronDown className="size-4" aria-hidden />
          </button>
          <button
            type="button"
            aria-label="Hide the demo bar"
            onClick={() => {
              setHidden(true)
              write(DEMO_STORE, "0")
              toast("Demo bar hidden. Add ?demo=1 to the address to bring it back.")
            }}
            className="grid size-8 place-items-center rounded-md text-brand-muted outline-none hover:bg-white/10 hover:text-brand-white focus-visible:ring-2 focus-visible:ring-brand-white"
          >
            <X className="size-4" aria-hidden />
          </button>
        </span>
      </div>
      <p className="mt-2 flex items-start gap-2 text-[12px] leading-[18px] text-brand-muted" aria-live="polite">
        {restricted ? <ShieldCheck className="mt-px size-4 shrink-0 text-pop" aria-hidden /> : <ShieldOff className="mt-px size-4 shrink-0" aria-hidden />}
        {notes[viewer]}
      </p>
    </div>
  )
}
