import { Suspense } from "react"
import Link from "next/link"
import { ExternalLink, Plus } from "lucide-react"
import { SidebarInset, SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { StudioSidebar } from "@/components/shell/studio-sidebar"
import { PublicationSwitcher, type PublicationSummary } from "@/components/shell/publication-switcher"
import { StudioSectionTabs } from "@/components/shell/section-tabs"
import { listChannels, listVideos } from "@/lib/data"
import { currentPublication } from "@/lib/publication"

export const metadata = { title: { default: "Studio", template: "%s · Studio · Homestand" } }

function publications(): PublicationSummary[] {
  return listChannels().map((c) => ({
    slug: c.slug,
    name: c.name,
    accentHex: c.accentHex,
    domain: c.customDomain ?? `${c.slug}.homestand.com.au`,
    ready: listVideos(c.id, "ready").length,
    template: c.template,
  }))
}

/** The studio for the publication this account is working on (read from the session). */
async function StudioFrame({ children }: { children: React.ReactNode }) {
  const channel = await currentPublication()
  const pubs = publications()
  const reviewCount = pubs.find((p) => p.slug === channel.slug)?.ready ?? 0
  return (
    <SidebarProvider>
      <StudioSidebar reviewCount={reviewCount} publications={pubs.length} />
      <SidebarInset>
        <header className="sticky top-0 z-20 flex h-16 items-center gap-2 border-b bg-background/95 px-4 backdrop-blur md:px-6">
          <SidebarTrigger className="-ml-1" />
          <PublicationSwitcher current={channel.slug} publications={pubs} />
          <div className="ml-auto flex items-center gap-2">
            <Button variant="ghost" size="sm" asChild className="hidden sm:inline-flex">
              <Link href={`/c/${channel.slug}`}>
                View site <ExternalLink />
              </Link>
            </Button>
            <Button size="sm" asChild>
              <Link href="/studio/upload">
                <Plus /> Upload
              </Link>
            </Button>
            <Avatar className="size-8">
              <AvatarFallback className="bg-brand-black text-[12px] font-bold text-brand-white">SD</AvatarFallback>
            </Avatar>
          </div>
        </header>
        <main className="mx-auto w-full max-w-[1280px] flex-1 px-4 py-8 md:px-8">
          <StudioSectionTabs />
          {children}
        </main>
      </SidebarInset>
    </SidebarProvider>
  )
}

export default function StudioLayout({ children }: { children: React.ReactNode }) {
  return (
    <Suspense fallback={<div className="min-h-svh bg-background" />}>
      <StudioFrame>{children}</StudioFrame>
    </Suspense>
  )
}
