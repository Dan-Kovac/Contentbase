import Link from "next/link"
import { ArrowLeft } from "lucide-react"
import { Wordmark } from "@/components/brand/wordmark"

/** Viewer account: a simple platform header over a quiet grey ground. */
export default function AccountLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-svh flex-col bg-muted">
      <header className="border-b bg-background">
        <div className="mx-auto flex h-16 w-full max-w-[1280px] items-center gap-4 px-4 sm:px-6 lg:px-8">
          <Link href="/account" aria-label="Homestand account" className="rounded-sm outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2">
            <Wordmark height={20} />
          </Link>
          <Link
            href="/c/footyfix"
            className="ml-auto inline-flex items-center gap-1.5 rounded-md px-2 py-1.5 text-[14px] font-medium text-muted-foreground outline-none hover:bg-accent hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring"
          >
            <ArrowLeft className="size-4" aria-hidden />
            Back to Footy Fix
          </Link>
        </div>
      </header>
      <div className="flex-1">{children}</div>
      <footer className="border-t bg-background">
        <div className="mx-auto flex w-full max-w-[1280px] flex-wrap gap-x-6 gap-y-2 px-4 py-6 text-[13px] text-muted-foreground sm:px-6 lg:px-8">
          <span>One account for every Homestand channel.</span>
          <Link href="/pricing#faq" className="hover:text-foreground">
            Privacy
          </Link>
          <Link href="/advertisers#triple-lock" className="hover:text-foreground">
            Responsible gambling
          </Link>
          <a href="https://www.gamblinghelponline.org.au" className="hover:text-foreground">
            Gambling Help Online: 1800 858 858
          </a>
        </div>
      </footer>
    </div>
  )
}
