import Link from "next/link"
import { ArrowRight, Plus } from "lucide-react"
import { PageHeader } from "@/components/shell/page-header"
import { Button } from "@/components/ui/button"
import { DEMO_CHANNEL_SLUG, getChannel, listPages } from "@/lib/data"
import { PagesList, type PageRow } from "@/components/studio/pages/pages-list"
import { PAGE_TEMPLATES } from "@/components/studio/pages/templates"

export const metadata = { title: "Pages" }

export default function PagesPage() {
  const channel = getChannel(DEMO_CHANNEL_SLUG)!
  const rows: PageRow[] = listPages(channel.id).map((p) => ({
    id: p.id,
    title: p.title,
    slug: p.slug,
    status: p.status,
    inNav: p.inNav,
    blocks: p.blocks.length,
  }))

  return (
    <div className="grid grid-cols-1 gap-10">
      <PageHeader
        title="Pages"
        description={`Pages that sit outside your feed, like About and Work with us. Each lives at ${channel.customDomain ?? channel.slug}/p/ and can go in your channel header.`}
        className="pb-0"
        actions={
          <Button asChild>
            <Link href="/studio/pages/new">
              <Plus /> New page
            </Link>
          </Button>
        }
      />

      <section aria-labelledby="your-pages-h">
        <h2 id="your-pages-h" className="sr-only">
          Your pages
        </h2>
        <PagesList initialRows={rows} channelSlug={channel.slug} />
      </section>

      <section id="templates" aria-labelledby="templates-h" className="scroll-mt-20">
        <div className="mb-3 flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1">
          <h2 id="templates-h" className="text-lg font-semibold tracking-[-0.2px]">
            Start from a template
          </h2>
          <p className="text-[13px] text-muted-foreground">Each one is a first draft you can change completely</p>
        </div>
        <ul className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          {PAGE_TEMPLATES.map((t) => (
            <li key={t.id}>
              <Link
                href={t.id === "blank" ? "/studio/pages/new" : `/studio/pages/new?template=${t.id}`}
                className="group flex h-full flex-col gap-3 rounded-lg border bg-card p-4 transition-colors hover:bg-accent/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              >
                <span className="grid size-9 place-items-center rounded-md bg-muted">
                  <t.icon className="size-[18px]" aria-hidden />
                </span>
                <div className="flex-1">
                  <p className="font-semibold">{t.label}</p>
                  <p className="mt-0.5 text-[13px] leading-5 text-muted-foreground">{t.description}</p>
                  {rows.some((r) => r.slug === t.slug) && (
                    <p className="mt-2 text-xs text-muted-foreground">You have one already: {rows.find((r) => r.slug === t.slug)?.title}</p>
                  )}
                </div>
                <span className="flex items-center gap-1 text-[13px] font-medium">
                  Use template <ArrowRight className="size-3.5 transition-transform group-hover:translate-x-0.5" aria-hidden />
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </section>
    </div>
  )
}
