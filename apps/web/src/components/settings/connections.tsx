"use client"

import { useState } from "react"
import Link from "next/link"
import {
  ArrowRight,
  Bell,
  Check,
  ChevronRight,
  CloudUpload,
  FileVideo,
  Inbox,
  Loader2,
  RefreshCw,
  Rss,
  Search,
  Unplug,
} from "lucide-react"
import { InstagramGlyph, TikTokGlyph, YouTubeGlyph } from "./glyphs"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { StatusBadge } from "@/components/brand/status-badge"
import { compact } from "@/lib/format"
import { cn } from "@/lib/utils"
import type { Channel } from "@/lib/types"
import { Panel, Section, SettingRow, Tag } from "./section"

function Mark({ children, className }: { children: React.ReactNode; className?: string }) {
  return <span className={cn("grid size-10 shrink-0 place-items-center rounded-md border bg-background text-foreground", className)}>{children}</span>
}

const PIPELINE = [
  { title: "You upload to YouTube", body: "Long videos and Shorts, as you do now." },
  { title: "We import it", body: "Usually within 10 minutes, with your captions as the transcript." },
  { title: "We build a draft pack", body: "Video page, article, suggested shorts and SEO." },
  { title: "Ready to review", body: "It waits in your queue. Nothing goes live until you publish." },
]

export function Connections({ channel }: { channel: Channel }) {
  const yt = channel.youtube!
  const [connected, setConnected] = useState(true)
  const [autoImport, setAutoImport] = useState(yt.autoImport)
  const [importShorts, setImportShorts] = useState(true)
  const [syncing, setSyncing] = useState(false)
  const [lastSynced, setLastSynced] = useState(yt.lastSyncedAt)
  const [disconnectOpen, setDisconnectOpen] = useState(false)
  const [notify, setNotify] = useState<Record<string, boolean>>({})
  const [drive, setDrive] = useState<"off" | "connecting" | "on">("off")

  function syncNow() {
    setSyncing(true)
    setTimeout(() => {
      setSyncing(false)
      setLastSynced("Just now")
      toast.success("Synced", { description: "No new uploads since 9:02 am." })
    }, 1200)
  }

  function notifyMe(key: string, name: string) {
    setNotify((n) => ({ ...n, [key]: true }))
    toast.success(`We'll email you when ${name} is ready`)
  }

  return (
    <div>
      <Section id="youtube" title="YouTube" description="Your YouTube channel is the source for your videos and Shorts. Videos stay on YouTube and play in its player on your pages.">
        <Panel>
          <div className="flex flex-col gap-4 p-4 sm:flex-row sm:items-start sm:justify-between sm:p-5">
            <div className="flex min-w-0 gap-3">
              <Mark className="text-[#ff0033]">
                <YouTubeGlyph className="size-6" />
              </Mark>
              <div className="min-w-0">
                <p className="flex flex-wrap items-center gap-2 text-sm font-semibold">
                  {yt.handle}
                  {connected ? <StatusBadge tone="connected" /> : <StatusBadge tone="neutral">Not connected</StatusBadge>}
                </p>
                <p className="mt-0.5 text-[13px] text-muted-foreground">
                  {compact(yt.subscribers)} subscribers · {connected ? `Last synced ${lastSynced}` : "Disconnected"}
                </p>
              </div>
            </div>
            {connected ? (
              <div className="flex flex-wrap gap-2">
                <Button variant="outline" size="sm" onClick={syncNow} disabled={syncing}>
                  {syncing ? <Loader2 className="animate-spin" /> : <RefreshCw />} {syncing ? "Syncing" : "Sync now"}
                </Button>
                <Button variant="ghost" size="sm" onClick={() => setDisconnectOpen(true)}>
                  <Unplug /> Disconnect
                </Button>
              </div>
            ) : (
              <Button
                size="sm"
                onClick={() => {
                  setConnected(true)
                  toast.success("YouTube connected")
                }}
              >
                <YouTubeGlyph className="size-4" /> Connect YouTube
              </Button>
            )}
          </div>

          {connected && (
            <>
              <dl className="grid gap-px border-t bg-border text-[13px] sm:grid-cols-2">
                <div className="bg-card px-4 py-3 sm:px-5">
                  <dt className="text-muted-foreground">Permission granted</dt>
                  <dd className="mt-0.5 font-medium">Read your videos and captions</dd>
                </div>
                <div className="bg-card px-4 py-3 sm:px-5">
                  <dt className="text-muted-foreground">Captions access</dt>
                  <dd className="mt-0.5 flex items-center gap-1.5 font-medium">
                    <span className="size-[7px] bg-pop-ink" aria-hidden /> On. Your YouTube captions become each video&apos;s transcript.
                  </dd>
                </div>
              </dl>
              <div className="border-t">
                <SettingRow htmlFor="auto-import" label="Import new uploads automatically" description="Each new public video becomes a draft pack in Ready to review.">
                  <Switch
                    id="auto-import"
                    checked={autoImport}
                    onCheckedChange={(v) => {
                      setAutoImport(v)
                      toast.success(v ? "Automatic import on" : "Automatic import off")
                    }}
                  />
                </SettingRow>
                <SettingRow htmlFor="import-shorts" label="Also import YouTube Shorts" description="Shorts appear in your shorts row and on their own pages.">
                  <Switch
                    id="import-shorts"
                    checked={importShorts}
                    disabled={!autoImport}
                    onCheckedChange={(v) => {
                      setImportShorts(v)
                      toast.success("Saved")
                    }}
                  />
                </SettingRow>
              </div>
              <div className="border-t bg-muted/40 p-4 sm:p-5">
                <p className="text-[13px] font-semibold">What happens to each new video</p>
                <ol className="mt-3 grid gap-3 md:grid-cols-4 md:gap-2">
                  {PIPELINE.map((s, i) => (
                    <li key={s.title} className="relative flex gap-3 md:flex-col md:gap-2">
                      <span className="flex items-center gap-2">
                        <span
                          className={cn(
                            "grid size-6 shrink-0 place-items-center rounded-full border bg-background font-mono text-[11px] font-medium tabular",
                            i === PIPELINE.length - 1 && "border-transparent bg-pitch text-pop-foreground",
                          )}
                        >
                          {i === PIPELINE.length - 1 ? <Inbox className="size-3.5" aria-hidden /> : i + 1}
                        </span>
                        {i < PIPELINE.length - 1 && <ChevronRight className="hidden size-4 text-muted-foreground md:block" aria-hidden />}
                      </span>
                      <span className="min-w-0">
                        <span className="block text-[13px] font-medium">{s.title}</span>
                        <span className="block text-[13px] leading-5 text-muted-foreground">{s.body}</span>
                      </span>
                    </li>
                  ))}
                </ol>
                <Link href="/studio/review" className="mt-4 inline-flex items-center gap-1 text-[13px] font-medium underline underline-offset-2">
                  Open Ready to review <ArrowRight className="size-3.5" aria-hidden />
                </Link>
              </div>
            </>
          )}
        </Panel>
      </Section>

      <Section
        id="source-files"
        title="Source files"
        description="YouTube doesn't let us copy your videos, so we cut vertical shorts from your original files. Until then, draft packs carry clip suggestions you can render later."
      >
        <Panel>
          <p className="border-b px-4 py-3 text-[13px] leading-5 sm:px-5">
            Connect Google Drive or Dropbox where you keep your original videos, and we&apos;ll match them to your YouTube uploads to render shorts.
          </p>
          <div className="flex flex-col gap-3 px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-5">
            <div className="flex min-w-0 gap-3">
              <Mark>
                <CloudUpload className="size-5" aria-hidden />
              </Mark>
              <div className="min-w-0">
                <p className="flex flex-wrap items-center gap-2 text-sm font-semibold">
                  Google Drive {drive === "on" && <StatusBadge tone="connected" />}
                </p>
                <p className="mt-0.5 text-[13px] text-muted-foreground">
                  {drive === "on" ? "Watching “Footy Fix / Masters”. Matches show on each draft pack." : "Read-only access to one folder you choose."}
                </p>
              </div>
            </div>
            {drive === "on" ? (
              <Button
                variant="ghost"
                size="sm"
                className="self-start sm:self-auto"
                onClick={() => {
                  setDrive("off")
                  toast.success("Google Drive disconnected")
                }}
              >
                Disconnect
              </Button>
            ) : (
              <Button
                size="sm"
                variant="outline"
                className="self-start sm:self-auto"
                disabled={drive === "connecting"}
                onClick={() => {
                  setDrive("connecting")
                  setTimeout(() => {
                    setDrive("on")
                    toast.success("Google Drive connected")
                  }, 1000)
                }}
              >
                {drive === "connecting" && <Loader2 className="animate-spin" />} {drive === "connecting" ? "Connecting" : "Connect"}
              </Button>
            )}
          </div>
          <div className="flex flex-col gap-3 border-t px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-5">
            <div className="flex min-w-0 gap-3">
              <Mark className="text-muted-foreground">
                <FileVideo className="size-5" aria-hidden />
              </Mark>
              <div className="min-w-0">
                <p className="text-sm font-semibold">Dropbox</p>
                <p className="mt-0.5 text-[13px] text-muted-foreground">Same matching, from a Dropbox folder.</p>
              </div>
            </div>
            <Tag className="self-start sm:self-auto">Coming soon</Tag>
          </div>
          <p className="border-t bg-muted/40 px-4 py-3 text-[13px] text-muted-foreground sm:px-5">
            Videos you upload straight to Homestand get rendered shorts automatically. <Link href="/studio/upload" className="font-medium text-foreground underline underline-offset-2">Upload a video</Link>
          </p>
        </Panel>
      </Section>

      <Section id="social" title="Other video platforms" description="In the MVP your shorts come from YouTube Shorts. TikTok and Instagram are next.">
        <div className="grid gap-3 sm:grid-cols-2">
          {[
            { key: "tiktok", name: "TikTok", body: "Show your TikToks on your channel, in your shorts row.", Icon: TikTokGlyph },
            { key: "instagram", name: "Instagram", body: "Show your Reels on your channel, with captions.", Icon: InstagramGlyph },
          ].map(({ key, name, body, Icon }) => (
            <Panel key={key} className="flex flex-col">
              <div className="flex flex-1 flex-col gap-3 p-4 sm:p-5">
                <div className="flex items-start justify-between gap-3">
                  <Mark className="text-muted-foreground">
                    <Icon />
                  </Mark>
                  <Tag>Coming later</Tag>
                </div>
                <div>
                  <p className="text-sm font-semibold">{name}</p>
                  <p className="mt-0.5 text-[13px] leading-5 text-muted-foreground">{body}</p>
                </div>
              </div>
              <div className="border-t px-4 py-3 sm:px-5">
                <Button variant="outline" size="sm" disabled={notify[key]} onClick={() => notifyMe(key, name)}>
                  {notify[key] ? <Check /> : <Bell />} {notify[key] ? "We'll let you know" : "Notify me"}
                </Button>
              </div>
            </Panel>
          ))}
        </div>
      </Section>

      <Section id="sites" title="Site imports" description="Bring an existing site across. Every old URL gets a 301 redirect to its new page, so you keep your rankings.">
        <Panel>
          <ul className="divide-y">
            {[
              { key: "wordpress", name: "WordPress", body: "WXR export file, or connect with an application password." },
              { key: "ghost", name: "Ghost", body: "JSON export, including members." },
              { key: "substack", name: "Substack", body: "Export zip, including subscribers." },
              { key: "rss", name: "RSS or Atom", body: "Any feed URL, including podcast feeds with video." },
            ].map((s) => (
              <li key={s.key}>
                <Link
                  href={`/studio/imports/new?source=${s.key}`}
                  className="group flex items-center gap-3 px-4 py-3 outline-none hover:bg-accent/60 focus-visible:bg-accent focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-ring sm:px-5"
                >
                  <Mark className="size-9">{s.key === "rss" ? <Rss className="size-4" aria-hidden /> : <span className="text-[13px] font-bold">{s.name.slice(0, 1)}</span>}</Mark>
                  <span className="min-w-0 flex-1">
                    <span className="block text-sm font-medium">{s.name}</span>
                    <span className="block text-[13px] text-muted-foreground">{s.body}</span>
                  </span>
                  <span className="hidden text-[13px] font-medium sm:inline">Start import</span>
                  <ChevronRight className="size-4 text-muted-foreground transition-transform group-hover:translate-x-0.5" aria-hidden />
                </Link>
              </li>
            ))}
          </ul>
        </Panel>
      </Section>

      <Section id="search-console" title="Search" description="See which searches bring people to your channel.">
        <Panel>
          <div className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between sm:p-5">
            <div className="flex min-w-0 gap-3">
              <Mark className="text-muted-foreground">
                <Search className="size-5" aria-hidden />
              </Mark>
              <div className="min-w-0">
                <p className="text-sm font-semibold">Google Search Console</p>
                <p className="mt-0.5 text-[13px] leading-5 text-muted-foreground">Queries, clicks and rankings for your pages, inside Analytics. Your sitemap is already submitted for you.</p>
              </div>
            </div>
            <Tag className="self-start sm:self-auto">Coming soon</Tag>
          </div>
        </Panel>
      </Section>

      <Dialog open={disconnectOpen} onOpenChange={setDisconnectOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Disconnect YouTube?</DialogTitle>
            <DialogDescription>
              New uploads stop arriving and we can no longer read your captions. The 214 videos already on your channel stay published. You can reconnect at any time.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline">Keep connected</Button>
            </DialogClose>
            <Button
              variant="destructive"
              onClick={() => {
                setConnected(false)
                setDisconnectOpen(false)
                toast.success("YouTube disconnected")
              }}
            >
              Disconnect
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
