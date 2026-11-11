import Link from "next/link"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { PLANS, planPrice } from "./plans"
import { TickList } from "./section"

/** Full plan cards for the pricing page. */
export function PricingCards() {
  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {PLANS.map((p) => (
        <div
          key={p.id}
          id={p.id}
          className={cn(
            "relative flex scroll-mt-24 flex-col gap-6 rounded-lg border bg-card p-6",
            p.featured && "border-foreground ring-1 ring-foreground",
          )}
        >
          <div className="flex flex-col gap-1.5">
            <div className="flex items-center justify-between gap-2">
              <h3 className="text-[20px] font-bold tracking-[-0.01em]">{p.name}</h3>
              {p.featured && (
                <span className="rounded-[2px] bg-primary px-2 py-1 text-[11px] font-bold uppercase leading-none tracking-[0.8px] text-primary-foreground">
                  Most chosen
                </span>
              )}
            </div>
            <p className="text-[14px] text-muted-foreground">{p.for}</p>
          </div>
          <div className="flex flex-col gap-1">
            <p className="flex items-baseline gap-1.5">
              <span className="text-[44px] font-extrabold leading-none tracking-[-0.03em] tabular">{planPrice(p)}</span>
              {p.price != null && <span className="text-[14px] text-muted-foreground">a month</span>}
            </p>
            <p className="text-[13px] text-muted-foreground">
              {p.price != null ? "AUD inc. GST · 14-day free trial" : "Annual contract · AUD inc. GST"}
            </p>
          </div>
          <Button asChild size="lg" variant={p.featured ? "default" : "outline"} className="w-full">
            <Link href={p.href}>{p.cta}</Link>
          </Button>
          <TickList items={p.includes} />
        </div>
      ))}
    </div>
  )
}

const TEASER: Record<string, string> = {
  starter: "One channel on your subdomain. 10 video hours a month.",
  pro: "Your own domain, the triple lock and an ad revenue share.",
  publisher: "Three channels, team roles and migration assistance.",
  enterprise: "Unlimited channels and white-glove migration.",
}

/** Compact four-column teaser for the landing page. */
export function PricingTeaser() {
  return (
    <div className="grid overflow-hidden rounded-lg border bg-card sm:grid-cols-2 lg:grid-cols-4">
      {PLANS.map((p, i) => (
        <div
          key={p.id}
          className={cn(
            "flex flex-col gap-3 p-6",
            i > 0 && "border-t sm:border-t-0",
            i % 2 === 1 && "sm:border-l",
            i >= 2 && "sm:border-t lg:border-t-0",
            i === 2 && "lg:border-l",
          )}
        >
          <h3 className="text-[16px] font-bold">{p.name}</h3>
          <p className="flex items-baseline gap-1.5">
            <span className="text-[34px] font-extrabold leading-none tracking-[-0.03em] tabular">{planPrice(p)}</span>
            {p.price != null && <span className="text-[13px] text-muted-foreground">a month inc. GST</span>}
          </p>
          <p className="text-[14px] leading-[21px] text-muted-foreground">{TEASER[p.id]}</p>
        </div>
      ))}
    </div>
  )
}
