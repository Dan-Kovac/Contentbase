import Link from "next/link"
import { Suspense } from "react"
import { ExternalLink, Plus } from "lucide-react"
import { SidebarInset, SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { StudioSidebar } from "@/components/shell/studio-sidebar"
import { getChannel, DEMO_CHANNEL_SLUG } from "@/lib/data"

export const metadata = { title: { default: "Studio", template: "%s · Studio · Homestand" } }

export default function StudioLayout({ children }: { children: React.ReactNode }) {
  const channel = getChannel(DEMO_CHANNEL_SLUG)!
  return (
    <SidebarProvider>
      <Suspense>
        <StudioSidebar />
      </Suspense>
      <SidebarInset>
        <header className="sticky top-0 z-20 flex h-16 items-center gap-3 border-b bg-background/95 px-4 backdrop-blur md:px-6">
          <SidebarTrigger className="-ml-1" />
          <div className="flex min-w-0 items-center gap-2">
            <span className="size-4 shrink-0 rounded-[4px] bg-pitch" aria-hidden />
            <span className="truncate text-[15px] font-semibold">{channel.name}</span>
            <span className="hidden truncate font-mono text-xs text-muted-foreground sm:inline">{channel.customDomain}</span>
          </div>
          <div className="ml-auto flex items-center gap-2">
            <Button variant="ghost" size="sm" asChild className="hidden sm:inline-flex">
              <Link href={`/c/${channel.slug}`}>
                View channel <ExternalLink />
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
        <main className="mx-auto w-full max-w-[1280px] flex-1 px-4 py-8 md:px-8">{children}</main>
      </SidebarInset>
    </SidebarProvider>
  )
}
