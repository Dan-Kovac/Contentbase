import Link from "next/link"
import { Monogram } from "@/components/brand/wordmark"

const NAV = [
  ["Overview", "/admin"],
  ["Creative review", "/admin/review"],
  ["Campaigns", "/admin/campaigns"],
  ["Ad decisions", "/admin/evidence"],
  ["Channels", "/admin/channels"],
  ["Moderation", "/admin/moderation"],
  ["Audit log", "/admin/audit"],
]

export const metadata = { title: { default: "Admin", template: "%s · Admin · Homestand" } }

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-svh flex-col bg-background">
      <header className="sticky top-0 z-30 bg-brand-black text-brand-white">
        <div className="mx-auto flex h-14 max-w-[1440px] items-center gap-6 px-4 md:px-8">
          <Link href="/admin" className="flex items-center gap-2">
            <Monogram size={26} />
            <span className="rounded-[2px] border border-white/20 px-1.5 py-0.5 text-[11px] font-bold uppercase tracking-[1px] text-brand-muted">
              Admin
            </span>
          </Link>
          <nav aria-label="Admin" className="flex gap-5 overflow-x-auto text-[14px] font-medium text-brand-muted">
            {NAV.map(([label, href]) => (
              <Link key={href} href={href} className="whitespace-nowrap hover:text-brand-white">
                {label}
              </Link>
            ))}
          </nav>
        </div>
      </header>
      <main className="mx-auto w-full max-w-[1440px] flex-1 px-4 py-8 md:px-8">{children}</main>
    </div>
  )
}
