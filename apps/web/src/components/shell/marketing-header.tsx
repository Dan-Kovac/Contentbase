import Link from "next/link"
import { Wordmark } from "@/components/brand/wordmark"
import { Button } from "@/components/ui/button"

const NAV = [
  { href: "/#creators", label: "For creators" },
  { href: "/publishers", label: "For publishers" },
  { href: "/pricing", label: "Pricing" },
  { href: "/advertisers", label: "Advertisers" },
]

/** Marketing chrome is always on brand-black: the brand looks its best there. */
export function MarketingHeader() {
  return (
    <header className="sticky top-0 z-30 border-b border-white/10 bg-brand-black/90 text-brand-white backdrop-blur">
      <div className="mx-auto flex h-16 max-w-[1280px] items-center gap-8 px-4 md:px-8">
        <Link href="/" aria-label="Homestand home" className="text-brand-white">
          <Wordmark height={22} />
        </Link>
        <nav aria-label="Main" className="hidden items-center gap-6 text-[14px] font-medium text-brand-muted md:flex">
          {NAV.map((n) => (
            <Link key={n.href} href={n.href} className="transition-colors hover:text-brand-white">
              {n.label}
            </Link>
          ))}
        </nav>
        <div className="ml-auto flex items-center gap-2">
          <Link href="/signin" className="hidden px-3 text-[14px] font-medium text-brand-muted hover:text-brand-white sm:block">
            Sign in
          </Link>
          <Button variant="pop" asChild>
            <Link href="/signup">Start free trial</Link>
          </Button>
        </div>
      </div>
    </header>
  )
}

export function MarketingFooter() {
  const cols = [
    { title: "Product", links: [["For creators", "/#creators"], ["For publishers", "/publishers"], ["Pricing", "/pricing"], ["See a channel", "/c/footyfix"]] },
    { title: "Company", links: [["Advertisers", "/advertisers"], ["Sign in", "/signin"], ["Start free trial", "/signup"]] },
    { title: "Trust", links: [["Privacy", "/pricing#faq"], ["Responsible gambling", "/advertisers#triple-lock"], ["Terms", "/pricing#faq"]] },
  ]
  return (
    <footer className="bg-brand-black text-brand-muted">
      <div className="mx-auto grid max-w-[1280px] gap-10 px-4 py-16 md:grid-cols-[1.5fr_repeat(3,1fr)] md:px-8">
        <div className="flex flex-col gap-4">
          <span className="text-brand-white">
            <Wordmark height={24} />
          </span>
          <p className="max-w-[34ch] text-[14px] leading-[22px]">Your channel. Your audience. Video-first publishing for Australian sport.</p>
        </div>
        {cols.map((c) => (
          <div key={c.title} className="flex flex-col gap-3 text-[14px]">
            <p className="font-semibold text-brand-white">{c.title}</p>
            {c.links.map(([label, href]) => (
              <Link key={label} href={href} className="hover:text-brand-white">
                {label}
              </Link>
            ))}
          </div>
        ))}
      </div>
      <div className="border-t border-white/10">
        <p className="mx-auto max-w-[1280px] px-4 py-6 text-[13px] md:px-8">
          © 2026 Homestand. Made in Melbourne. Prices in AUD and include GST.
        </p>
      </div>
    </footer>
  )
}
