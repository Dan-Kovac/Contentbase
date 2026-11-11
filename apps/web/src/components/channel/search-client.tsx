"use client"

import { useMemo, useState } from "react"
import Link from "next/link"
import { usePathname, useSearchParams } from "next/navigation"
import { FileText, SearchX, Search as SearchIcon } from "lucide-react"
import { VideoThumb } from "@/components/brand/media"
import { Empty, EmptyContent, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from "@/components/ui/empty"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"

export interface SearchDoc {
  id: string
  type: "video" | "article" | "short"
  title: string
  snippet: string
  meta: string
  href: string
  tone: string
  durationLabel?: string
  haystack: string
}

const TYPES = [
  { id: "all", label: "All" },
  { id: "video", label: "Videos" },
  { id: "article", label: "Articles" },
  { id: "short", label: "Shorts" },
] as const
type Filter = (typeof TYPES)[number]["id"]

function excerpt(doc: SearchDoc, q: string) {
  if (!q) return doc.snippet
  const i = doc.haystack.toLowerCase().indexOf(q.toLowerCase())
  if (i < 0 || doc.snippet.toLowerCase().includes(q.toLowerCase()) || doc.title.toLowerCase().includes(q.toLowerCase())) return doc.snippet
  const start = Math.max(0, i - 60)
  return `${start > 0 ? "…" : ""}${doc.haystack.slice(start, i + q.length + 90).trim()}…`
}

function Mark({ text, q }: { text: string; q: string }) {
  if (!q) return <>{text}</>
  const parts = text.split(new RegExp(`(${q.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")})`, "ig"))
  return (
    <>
      {parts.map((p, i) =>
        p.toLowerCase() === q.toLowerCase() ? (
          <mark key={i} className="rounded-[2px] bg-[var(--chan)] px-0.5 text-[var(--chan-on)]">
            {p}
          </mark>
        ) : (
          <span key={i}>{p}</span>
        ),
      )}
    </>
  )
}

export function SearchFromParams(props: { docs: SearchDoc[]; channelName: string; suggestions: string[] }) {
  const params = useSearchParams()
  return <ChannelSearch {...props} initialQuery={params.get("q") ?? ""} />
}

export function ChannelSearch({
  docs,
  channelName,
  suggestions,
  initialQuery = "",
}: {
  docs: SearchDoc[]
  channelName: string
  suggestions: string[]
  initialQuery?: string
}) {
  const [q, setQ] = useState(initialQuery)
  const [filter, setFilter] = useState<Filter>("all")
  const pathname = usePathname()
  const query = q.trim()

  const matches = useMemo(() => {
    if (!query) return []
    const terms = query.toLowerCase().split(/\s+/)
    return docs.filter((d) => terms.every((t) => d.haystack.toLowerCase().includes(t)))
  }, [docs, query])

  const counts = {
    all: matches.length,
    video: matches.filter((m) => m.type === "video").length,
    article: matches.filter((m) => m.type === "article").length,
    short: matches.filter((m) => m.type === "short").length,
  }
  const shown = filter === "all" ? matches : matches.filter((m) => m.type === filter)

  const update = (v: string) => {
    setQ(v)
    const url = v.trim() ? `${pathname}?q=${encodeURIComponent(v.trim())}` : pathname
    window.history.replaceState(null, "", url)
  }

  return (
    <div>
      <form role="search" onSubmit={(e) => e.preventDefault()} className="relative">
        <SearchIcon className="pointer-events-none absolute left-4 top-1/2 size-5 -translate-y-1/2 text-muted-foreground" aria-hidden />
        <Input
          type="search"
          name="q"
          value={q}
          onChange={(e) => update(e.target.value)}
          placeholder={`Search ${channelName}`}
          aria-label={`Search ${channelName}`}
          className="h-14 pl-12 text-[18px] md:text-[18px]"
          autoFocus
        />
      </form>

      {!query ? (
        <div className="mt-8">
          <h2 className="kicker mb-3 text-foreground">Try</h2>
          <ul className="flex flex-wrap gap-2">
            {suggestions.map((s) => (
              <li key={s}>
                <button
                  type="button"
                  onClick={() => update(s)}
                  className="h-9 rounded-full border border-input px-4 text-[14px] font-medium outline-none hover:bg-accent focus-visible:ring-2 focus-visible:ring-ring"
                >
                  {s}
                </button>
              </li>
            ))}
          </ul>
        </div>
      ) : (
        <>
          <div className="mt-6 flex flex-wrap items-center gap-2 border-b pb-3" role="tablist" aria-label="Result type">
            {TYPES.map((t) => (
              <button
                key={t.id}
                type="button"
                role="tab"
                aria-selected={filter === t.id}
                onClick={() => setFilter(t.id)}
                className={cn(
                  "h-8 rounded-md px-3 text-[14px] font-semibold outline-none focus-visible:ring-2 focus-visible:ring-ring",
                  filter === t.id ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-accent hover:text-foreground",
                )}
              >
                {t.label} <span className="tabular opacity-70">{counts[t.id]}</span>
              </button>
            ))}
          </div>
          <p className="sr-only" aria-live="polite">
            {matches.length} results for {query}
          </p>

          {shown.length ? (
            <ul className="divide-y">
              {shown.map((d) => (
                <li key={`${d.type}-${d.id}`}>
                  <Link href={d.href} className="group flex gap-4 py-5 outline-none focus-visible:ring-2 focus-visible:ring-ring md:gap-6">
                    <div className={cn("shrink-0", d.type === "short" ? "w-[72px] md:w-[90px]" : "w-[128px] md:w-[220px]")}>
                      {d.type === "article" ? (
                        <div className="grid aspect-video w-full place-items-center rounded-lg bg-muted text-muted-foreground">
                          <FileText className="size-6" aria-hidden />
                        </div>
                      ) : (
                        <VideoThumb tone={d.tone} ratio={d.type === "short" ? "9/16" : "16/9"} />
                      )}
                    </div>
                    <div className="flex min-w-0 flex-col gap-1.5">
                      <span className="text-[11px] font-bold uppercase tracking-[1px] text-muted-foreground">
                        {d.type === "video" ? "Video" : d.type === "article" ? "Article" : "Short"}
                        {d.durationLabel ? ` · ${d.durationLabel}` : ""}
                      </span>
                      <span className="font-[family-name:var(--chan-display)] text-[19px] font-bold leading-[24px] tracking-[var(--chan-tracking)] group-hover:underline group-hover:underline-offset-4 md:text-[22px] md:leading-[27px]">
                        <Mark text={d.title} q={query} />
                      </span>
                      <span className="line-clamp-2 font-[family-name:var(--chan-body)] text-[15px] leading-[22px] text-foreground/75">
                        <Mark text={excerpt(d, query)} q={query} />
                      </span>
                      <span className="text-[13px] text-muted-foreground">{d.meta}</span>
                    </div>
                  </Link>
                </li>
              ))}
            </ul>
          ) : (
            <Empty className="mt-8 border">
              <EmptyHeader>
                <EmptyMedia variant="icon">
                  <SearchX />
                </EmptyMedia>
                <EmptyTitle>No results for “{query}”</EmptyTitle>
                <EmptyDescription>
                  Check the spelling, or try a team, a trainer or a topic. Transcripts are searched too.
                </EmptyDescription>
              </EmptyHeader>
              <EmptyContent>
                <div className="flex flex-wrap justify-center gap-2">
                  {suggestions.slice(0, 4).map((s) => (
                    <button
                      key={s}
                      type="button"
                      onClick={() => {
                        update(s)
                        setFilter("all")
                      }}
                      className="h-8 rounded-full border border-input px-3 text-[13px] font-medium hover:bg-accent"
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </EmptyContent>
            </Empty>
          )}
        </>
      )}
    </div>
  )
}
