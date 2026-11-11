import type { Metadata } from "next"
import { Fragment } from "react"
import { Check, Minus } from "lucide-react"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { DarkHero, Section, SectionHeading } from "@/components/marketing/section"
import { PricingCards } from "@/components/marketing/pricing-cards"
import { COMPARISON, PLANS, planPrice } from "@/components/marketing/plans"

export const metadata: Metadata = {
  title: "Pricing",
  description: "Starter $29, Pro $99, Publisher $299 a month, AUD inc. GST. Every plan starts with a 14-day free trial.",
}

const FAQ = [
  {
    q: "How does the 14-day free trial work?",
    a: "Every plan starts with 14 days free. You don't need a card to start. If you add one, we charge on day 15; if you don't, your channel pauses until you choose a plan. Nothing is deleted.",
  },
  {
    q: "Do prices include GST?",
    a: "Yes. Every price is in Australian dollars and includes GST. Your invoices show the GST amount for your BAS.",
  },
  {
    q: "What counts as a video hour?",
    a: "One hour of video we process into a page, an article draft and shorts. A 20-minute video uses 20 minutes. Imported YouTube Shorts don't count, and unused hours don't roll over.",
  },
  {
    q: "What happens if I go over my video hours?",
    a: "We tell you at 80% and again at 100%. New videos still import, and their drafts wait until the next month or until you upgrade. We never charge overage without asking.",
  },
  {
    q: "Can I use my own domain?",
    a: "On Pro and above. Every channel starts on a homestand.com.au subdomain, and you can point your own domain at it whenever you're ready. We handle SSL.",
  },
  {
    q: "Do you take a cut of my ad revenue?",
    a: "Ads run in designed slots across the network. On Pro and above you receive a share of net ad revenue, split by your channel's verified viewing. On Publisher you can also run Google AdSense in the same slots and keep that income.",
  },
  {
    q: "Do I need the triple lock?",
    a: "Only if you want wagering ads. With triple lock mode off, no wagering ad reaches your channel from any source. Racing-only channels can declare racing-only mode instead.",
  },
  {
    q: "Can I leave and take my content with me?",
    a: "Yes. Export your articles, video pages, follower list and redirect map at any time. It's your channel.",
  },
]

export default function PricingPage() {
  return (
    <>
      <DarkHero>
        <SectionHeading
          as="h1"
          dark
          align="center"
          kicker="Pricing"
          title={
            <>
              Simple plans. <span className="text-pitch">Your channel.</span>
            </>
          }
          lede="Every plan starts with a 14-day free trial. No card needed to start. All prices in AUD and include GST."
        />
      </DarkHero>

      <section aria-label="Plans" className="mx-auto -mt-2 w-full max-w-[1280px] px-4 pt-12 sm:px-6 lg:px-8">
        <PricingCards />
      </section>

      <Section labelledBy="compare-title">
        <SectionHeading id="compare-title" kicker="Compare" title="Every plan, side by side." />
        <div className="mt-10 rounded-lg border">
          <Table className="min-w-[680px]">
            <TableHeader>
              <TableRow className="hover:bg-transparent">
                <TableHead className="w-[34%] py-4 text-[13px]">
                  <span className="sr-only">Feature</span>
                </TableHead>
                {PLANS.map((p) => (
                  <TableHead key={p.id} className="py-4 align-bottom">
                    <span className="block text-[15px] font-bold text-foreground">{p.name}</span>
                    <span className="block text-[13px] font-normal text-muted-foreground tabular">
                      {planPrice(p)}
                      {p.price != null && " a month"}
                    </span>
                  </TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {COMPARISON.map((g) => (
                <Fragment key={g.group}>
                  <TableRow className="bg-muted/60 hover:bg-muted/60">
                    <TableCell colSpan={5} className="py-2.5 text-[11px] font-bold uppercase tracking-[1px] text-muted-foreground">
                      {g.group}
                    </TableCell>
                  </TableRow>
                  {g.rows.map((r) => (
                    <TableRow key={r.label}>
                      <TableCell className="whitespace-normal py-3 text-[14px] font-medium">{r.label}</TableCell>
                      {r.values.map((v, i) => (
                        <TableCell key={i} className="whitespace-normal py-3 text-[14px]">
                          {v === true ? (
                            <Check className="size-4 text-pop-ink" strokeWidth={2.5} aria-label="Included" />
                          ) : v === false ? (
                            <Minus className="size-4 text-muted-foreground" aria-label="Not included" />
                          ) : (
                            <span className="tabular">{v}</span>
                          )}
                        </TableCell>
                      ))}
                    </TableRow>
                  ))}
                </Fragment>
              ))}
            </TableBody>
          </Table>
        </div>
        <p className="mt-4 text-[13px] text-muted-foreground">Prices in AUD and include GST. Pay monthly and cancel any time.</p>
      </Section>

      <Section tone="muted" id="faq" labelledBy="faq-title">
        <div className="grid grid-cols-1 gap-10 lg:grid-cols-[1fr_1.6fr] lg:gap-16">
          <SectionHeading id="faq-title" kicker="FAQ" title="Questions, answered." lede="Something else? Email hello@homestand.com.au and a person replies within a working day." />
          <Accordion type="single" collapsible className="rounded-lg border bg-card px-5">
            {FAQ.map((f, i) => (
              <AccordionItem key={f.q} value={`q${i}`}>
                <AccordionTrigger className="py-5 text-[16px] font-semibold">{f.q}</AccordionTrigger>
                <AccordionContent className="pb-5 text-[15px] leading-[24px] text-muted-foreground">{f.a}</AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </Section>
    </>
  )
}
