import Link from "next/link"
import { ArrowRight, ExternalLink, Plus, TriangleAlert } from "lucide-react"
import { PageHeader } from "@/components/shell/page-header"
import { PublicationTile, SwitchLink } from "@/components/shell/publication-switcher"
import { VideoThumb } from "@/components/brand/media"
import { StatusBadge } from "@/components/brand/status-badge"
import { Button } from "@/components/ui/button"
import { TemplatePreview } from "@/components/settings/template-preview"
import { getEarnings, listChannels, listVideos } from "@/lib/data"
import { compact } from "@/lib/format"
import { currentPublication } from "@/lib/publication"
import { pubScale, studioDays, sum, toPack } from "@/components/studio/lib"
import { previewLead } from "@/components/channel/lib"
import { cn } from "@/lib/utils"

export const metadata = { title: "All publications" }

const aud = (n: number) => `$${n.toLocaleString("en-AU")}`

/**
 * One account, every publication: a creator with more than one YouTube channel, or a media
 * business running several in-house brands, sees them all here and jumps into any one.
 */
export default async function PublicationsPage() {
  const current = await currentPublication()
  const pubs = listChannels().map((c) => {
    const days = studioDays(pubScale(c.slug)).slice(-30)
    const ready = listVideos(c.id, "ready").map((v) => toPack(v, c.name))
    return {
      c,
      views: sum(days, "views"),
      verified: sum(days, "signUps"),
      earnings: getEarnings(c.id)?.total ?? 0,
      ready,
      flagged: ready.filter((p) => p.flags.length).length,
      domain: c.customDomain ?? `${c.slug}.homestand.com.au`,
    }
  })
  const totals = [
    { label: "Publications", value: String(pubs.length) },
    { label: "Views, 30 days", value: compact(pubs.reduce((n, p) => n + p.views, 0)) },
    { label: "Followers", value: compact(pubs.reduce((n, p) => n + p.c.followers, 0)) },
    { label: "Sponsor earnings, 30 days", value: aud(pubs.reduce((n, p) => n + p.earnings, 0)) },
    { label: "Ready to review", value: String(pubs.reduce((n, p) => n + p.ready.length, 0)) },
  ]
  const queue = pubs.flatMap((p) => p.ready.map((pack) => ({ pack, p })))

  return (
    <div className="grid grid-cols-1 gap-10">
      <PageHeader
        title="All publications"
        description="Every brand on your account, side by side. Open one to work on it; the switcher at the top of the studio takes you between them from anywhere."
        className="pb-0"
        actions={
          <Button asChild>
            <Link href="/signup/channel">
              <Plus /> Add a publication
            </Link>
          </Button>
        }
      />

      <dl className="grid grid-cols-2 gap-px overflow-hidden rounded-lg border bg-border sm:grid-cols-3 lg:grid-cols-5">
        {totals.map((t) => (
          <div key={t.label} className="flex flex-col gap-1 bg-card p-4">
            <dt className="order-2 text-[13px] text-muted-foreground">{t.label}</dt>
            <dd className="order-1 text-[28px] font-bold leading-8 tracking-[-0.6px]">{t.value}</dd>
          </div>
        ))}
      </dl>

      <section aria-labelledby="pubs-h" className="min-w-0">
        <h2 id="pubs-h" className="sr-only">
          Your publications
        </h2>
        <ul className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {pubs.map(({ c, views, verified, earnings, ready, flagged, domain }) => (
            <li key={c.id} className={cn("flex min-w-0 flex-col overflow-hidden rounded-lg border bg-card", c.id === current.id && "ring-1 ring-foreground")}>
              <div className="relative border-b bg-muted/40 p-3" aria-hidden>
                <TemplatePreview template={c.template} accentHex={c.accentHex} pairing={c.pairing} name={c.name} nav={c.nav.map((n) => n.label)} ctaLabel={c.cta.label} lead={previewLead(c)} maxHeight={300} />
              </div>
              <div className="flex flex-1 flex-col gap-4 p-5">
                <div className="flex items-start gap-3">
                  <PublicationTile pub={c} size={36} />
                  <div className="min-w-0 flex-1">
                    <p className="flex flex-wrap items-center gap-2 text-[17px] font-semibold">
                      {c.name}
                      {c.id === current.id && <span className="rounded-sm bg-muted px-1.5 text-[11px] font-semibold text-muted-foreground">Open now</span>}
                    </p>
                    <p className="truncate font-mono text-xs text-muted-foreground">{domain}</p>
                  </div>
                  <span className="shrink-0 text-[12px] text-muted-foreground">{c.template === "editorial" ? "Editorial" : "Broadcast"} · {c.mode === "age_verified" ? "Age-verified" : "Standard"}</span>
                </div>
                <dl className="grid grid-cols-2 gap-3 border-y py-3 sm:grid-cols-4">
                  {[
                    ["Views", compact(views)],
                    ["Followers", compact(c.followers)],
                    ["Confirmed 18+", compact(verified)],
                    ["Earnings", aud(earnings)],
                  ].map(([label, value]) => (
                    <div key={label} className="flex flex-col gap-0.5">
                      <dt className="order-2 text-[12px] text-muted-foreground">{label}</dt>
                      <dd className="order-1 text-[17px] font-semibold">{value}</dd>
                    </div>
                  ))}
                </dl>
                <p className="flex items-center gap-2 text-[13px] text-muted-foreground">
                  {ready.length ? (
                    <>
                      <StatusBadge tone="ready" /> {ready.length === 1 ? "One draft pack" : `${ready.length} draft packs`} waiting
                      {flagged > 0 && (
                        <span className="inline-flex items-center gap-1 text-destructive">
                          <TriangleAlert className="size-3.5" aria-hidden /> {flagged} with compliance flags
                        </span>
                      )}
                    </>
                  ) : (
                    "All caught up"
                  )}
                </p>
                <div className="mt-auto flex flex-wrap items-center gap-2">
                  <SwitchLink
                    slug={c.slug}
                    to="/studio"
                    className="inline-flex h-9 items-center gap-1.5 rounded-md bg-primary px-4 text-sm font-semibold text-primary-foreground outline-none hover:bg-primary/90 focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                  >
                    Open studio <ArrowRight className="size-4" aria-hidden />
                  </SwitchLink>
                  {ready.length > 0 && (
                    <SwitchLink
                      slug={c.slug}
                      to="/studio/review"
                      className="inline-flex h-9 items-center rounded-md border bg-background px-4 text-sm font-semibold outline-none hover:bg-accent focus-visible:ring-2 focus-visible:ring-ring"
                    >
                      Review {ready.length}
                    </SwitchLink>
                  )}
                  <Button variant="ghost" size="sm" asChild className="ml-auto">
                    <Link href={`/c/${c.slug}`}>
                      View site <ExternalLink />
                    </Link>
                  </Button>
                </div>
              </div>
            </li>
          ))}
          <li>
            <Link
              href="/signup/channel"
              className="flex h-full min-h-[200px] flex-col items-center justify-center gap-3 rounded-lg border border-dashed p-8 text-center outline-none transition-colors hover:bg-accent/50 focus-visible:ring-2 focus-visible:ring-ring"
            >
              <span className="grid size-10 place-items-center rounded-md border bg-background" aria-hidden>
                <Plus className="size-5" />
              </span>
              <span className="text-[15px] font-semibold">Add a publication</span>
              <span className="max-w-[36ch] text-[13px] leading-5 text-muted-foreground">
                Another YouTube channel, a new brand or a site you&apos;re moving across. Each gets its own name, look, domain and button.
              </span>
            </Link>
          </li>
        </ul>
      </section>

      {queue.length > 0 && (
        <section aria-labelledby="all-queue-h">
          <div className="mb-3 flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1">
            <h2 id="all-queue-h" className="text-lg font-semibold tracking-[-0.2px]">
              Ready to review, every publication
            </h2>
            <p className="text-[13px] text-muted-foreground">Nothing goes live until someone publishes it</p>
          </div>
          <ul className="divide-y rounded-lg border bg-card">
            {queue.map(({ pack, p }) => (
              <li key={pack.id}>
                <SwitchLink
                  slug={p.c.slug}
                  to={`/studio/review/${pack.id}`}
                  className="flex w-full items-center gap-4 p-3 text-left outline-none hover:bg-accent/60 focus-visible:bg-accent sm:px-4"
                >
                  <div className="w-[96px] shrink-0">
                    <VideoThumb tone={pack.posterTone} src={pack.poster} durationSec={pack.durationSec} />
                  </div>
                  <span className="min-w-0 flex-1">
                    <span className="flex items-center gap-2 text-[12px] text-muted-foreground">
                      <PublicationTile pub={p.c} size={16} /> {p.c.name}
                    </span>
                    <span className="mt-0.5 block truncate text-sm font-semibold">{pack.title}</span>
                    {pack.flags.length > 0 && (
                      <span className="mt-0.5 flex items-center gap-1 text-xs text-destructive">
                        <TriangleAlert className="size-3.5" aria-hidden /> {pack.flags.length} compliance {pack.flags.length === 1 ? "flag" : "flags"} to resolve
                      </span>
                    )}
                  </span>
                  <span className="hidden shrink-0 text-sm font-semibold sm:inline">Review</span>
                  <ArrowRight className="size-4 shrink-0 text-muted-foreground" aria-hidden />
                </SwitchLink>
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  )
}
