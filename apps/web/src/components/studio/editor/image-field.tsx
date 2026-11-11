"use client"

import { useId, useRef, useState } from "react"
import { Check, ImagePlus, Images, Trash2, Upload } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { cn } from "@/lib/utils"
import { PHOTO_LIBRARY } from "./media"

const ACCEPT = "image/jpeg,image/png,image/webp"
const MAX_BYTES = 10 * 1024 * 1024

/**
 * Upload an image or pick one from the channel's photo library. Uploads stay in
 * the browser as object URLs in the prototype; the real build sends them to the CDN.
 */
export function ImageField({
  src,
  onChange,
  label,
  ratio = "16/9",
  help = "JPG, PNG or WebP, at least 1600 px wide.",
  compact = false,
  className,
}: {
  src?: string
  onChange: (src: string | undefined, name?: string) => void
  label: string
  ratio?: "16/9" | "3/2"
  help?: string
  compact?: boolean
  className?: string
}) {
  const fileRef = useRef<HTMLInputElement>(null)
  const helpId = useId()
  const [picking, setPicking] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [dragging, setDragging] = useState(false)

  const take = (f: File | undefined) => {
    if (!f) return
    if (!/^image\/(jpeg|png|webp)$/.test(f.type)) {
      setError(`${f.name} isn't a JPG, PNG or WebP. Export it in one of those and try again.`)
      return
    }
    if (f.size > MAX_BYTES) {
      setError(`${f.name} is over 10 MB. Resize it to 2400 px wide or less and try again.`)
      return
    }
    setError(null)
    onChange(URL.createObjectURL(f), f.name)
  }

  return (
    <div className={cn("grid gap-2", className)}>
      {src ? (
        <div className="group/img relative overflow-hidden rounded-lg border bg-muted" style={{ aspectRatio: ratio }}>
          {/* eslint-disable-next-line @next/next/no-img-element -- prototype media; next/image once uploads are on the CDN */}
          <img src={src} alt="" className="absolute inset-0 size-full object-cover" />
          <div className="absolute right-2 top-2 flex gap-1.5">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button size="sm" variant="secondary" className="bg-background/90 shadow-xs backdrop-blur hover:bg-background">
                  <ImagePlus /> Replace
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-52">
                <DropdownMenuItem onSelect={() => fileRef.current?.click()}>
                  <Upload /> Upload from your computer
                </DropdownMenuItem>
                <DropdownMenuItem onSelect={() => setPicking(true)}>
                  <Images /> Choose from your photos
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            <Button
              size="icon-sm"
              variant="secondary"
              className="bg-background/90 shadow-xs backdrop-blur hover:bg-background"
              aria-label={`Remove ${label.toLowerCase()}`}
              onClick={() => onChange(undefined)}
            >
              <Trash2 />
            </Button>
          </div>
        </div>
      ) : (
        <div
          onDragOver={(e) => {
            e.preventDefault()
            setDragging(true)
          }}
          onDragLeave={() => setDragging(false)}
          onDrop={(e) => {
            e.preventDefault()
            setDragging(false)
            take(e.dataTransfer.files?.[0])
          }}
          className={cn(
            "grid place-items-center rounded-lg border border-dashed px-4 text-center transition-colors",
            compact ? "py-6" : "py-10",
            dragging ? "border-foreground bg-accent" : "bg-card",
          )}
          style={compact ? undefined : { aspectRatio: ratio }}
        >
          <div className="grid justify-items-center gap-3">
            <span className="grid size-9 place-items-center rounded-full bg-muted">
              <ImagePlus className="size-[18px]" aria-hidden />
            </span>
            <div>
              <p className="text-sm font-semibold">{label}</p>
              <p id={helpId} className="mt-0.5 text-xs text-muted-foreground">
                Drag a photo here. {help}
              </p>
            </div>
            <div className="flex flex-wrap justify-center gap-2">
              <Button size="sm" variant="outline" onClick={() => fileRef.current?.click()} aria-describedby={helpId}>
                <Upload /> Upload
              </Button>
              <Button size="sm" variant="ghost" onClick={() => setPicking(true)}>
                <Images /> Choose from your photos
              </Button>
            </div>
          </div>
        </div>
      )}
      <input
        ref={fileRef}
        type="file"
        accept={ACCEPT}
        className="sr-only"
        tabIndex={-1}
        aria-label={`Upload ${label.toLowerCase()}`}
        onChange={(e) => {
          take(e.target.files?.[0])
          e.target.value = ""
        }}
      />
      {error && (
        <p className="text-xs text-destructive" role="alert">
          {error}
        </p>
      )}
      <PhotoPicker
        open={picking}
        onOpenChange={setPicking}
        current={src}
        onPick={(p) => {
          setError(null)
          onChange(p)
        }}
      />
    </div>
  )
}

function PhotoPicker({
  open,
  onOpenChange,
  current,
  onPick,
}: {
  open: boolean
  onOpenChange: (o: boolean) => void
  current?: string
  onPick: (src: string) => void
}) {
  const [sel, setSel] = useState<string | undefined>(current)
  return (
    <Dialog
      open={open}
      onOpenChange={(o) => {
        if (o) setSel(current)
        onOpenChange(o)
      }}
    >
      <DialogContent className="max-h-[90svh] gap-4 overflow-y-auto sm:max-w-[720px]">
        <DialogHeader>
          <DialogTitle>Your photos</DialogTitle>
          <DialogDescription>Photos from your uploads and videos. Pick one to use here.</DialogDescription>
        </DialogHeader>
        <div role="radiogroup" aria-label="Photos" className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          {PHOTO_LIBRARY.map((p) => {
            const on = sel === p.src
            return (
              <button
                key={p.src}
                type="button"
                role="radio"
                aria-checked={on}
                onClick={() => setSel(p.src)}
                onDoubleClick={() => {
                  onPick(p.src)
                  onOpenChange(false)
                }}
                className={cn(
                  "group relative grid gap-1.5 rounded-lg p-1 text-left outline-none transition-shadow focus-visible:ring-2 focus-visible:ring-ring",
                  on ? "ring-2 ring-foreground" : "hover:ring-1 hover:ring-input",
                )}
              >
                <span className="relative block aspect-[3/2] overflow-hidden rounded-md bg-muted">
                  {/* eslint-disable-next-line @next/next/no-img-element -- prototype media */}
                  <img src={p.src} alt="" className="absolute inset-0 size-full object-cover" loading="lazy" />
                  {on && (
                    <span className="absolute right-1.5 top-1.5 grid size-5 place-items-center rounded-full bg-foreground text-background">
                      <Check className="size-3" strokeWidth={3} aria-hidden />
                    </span>
                  )}
                </span>
                <span className="line-clamp-1 px-0.5 text-xs text-muted-foreground">{p.label}</span>
              </button>
            )
          })}
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button
            disabled={!sel}
            onClick={() => {
              if (sel) onPick(sel)
              onOpenChange(false)
            }}
          >
            Use photo
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
