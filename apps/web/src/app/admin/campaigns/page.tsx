import type { Metadata } from "next"
import { Info } from "lucide-react"
import { PageHeader } from "@/components/shell/page-header"
import { StatusBadge } from "@/components/brand/status-badge"
import {
  Table,
  TableBody,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { listCampaigns } from "@/lib/data"
import { aud, number } from "@/lib/format"
import type { Campaign } from "@/lib/types"

export const metadata: Metadata = { title: "Campaigns" }

const PRICING: Record<Campaign["pricing"], string> = { cpm: "CPM", flat: "Flat fee", cpc: "CPC" }
const STATUS: Record<Campaign["status"], React.ReactNode> = {
  live: <StatusBadge tone="published">Live</StatusBadge>,
  scheduled: <StatusBadge tone="scheduled" />,
  ended: <StatusBadge tone="neutral">Ended</StatusBadge>,
  in_review: <StatusBadge tone="neutral">In review</StatusBadge>,
}

function ctr(c: Campaign) {
  return c.impressions ? `${((c.clicks / c.impressions) * 100).toFixed(2)}%` : "–"
}

export default function CampaignsPage() {
  const campaigns = listCampaigns()
  const totals = campaigns.reduce(
    (t, c) => ({ budget: t.budget + c.budget, spent: t.spent + c.spent, impressions: t.impressions + c.impressions, clicks: t.clicks + c.clicks }),
    { budget: 0, spent: 0, impressions: 0, clicks: 0 },
  )

  return (
    <div>
      <PageHeader
        title="Campaigns"
        description="Direct-sold campaigns managed by our team. Creators never sell or contract wagering placements."
      />

      <div className="mb-6 flex items-start gap-3 rounded-lg border bg-muted/50 px-4 py-3 text-[14px] leading-[21px]">
        <Info className="mt-0.5 size-4 shrink-0" aria-hidden />
        <p>
          <span className="font-semibold">Pricing is never tied to sign-ups, deposits or bets.</span>{" "}
          Campaigns are sold on CPM, a flat fee or CPC only (ADS-05). Wagering CPC needs legal sign-off before it can go live.
        </p>
      </div>

      <div className="overflow-x-auto rounded-lg border">
        <Table className="min-w-[1080px]">
          <TableHeader>
            <TableRow>
              <TableHead>Advertiser</TableHead>
              <TableHead>Wagering</TableHead>
              <TableHead>Pricing</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Flight</TableHead>
              <TableHead>Channels</TableHead>
              <TableHead className="text-right">Budget</TableHead>
              <TableHead className="text-right">Spent</TableHead>
              <TableHead className="text-right">Impressions</TableHead>
              <TableHead className="text-right">Clicks</TableHead>
              <TableHead className="text-right">CTR</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {campaigns.map((c) => (
              <TableRow key={c.id}>
                <TableCell>
                  <div className="font-medium">{c.advertiser}</div>
                  <div className="font-mono text-[12px] text-muted-foreground">{c.id}</div>
                </TableCell>
                <TableCell>{c.isWagering ? <StatusBadge tone="wagering">Yes</StatusBadge> : <span className="text-muted-foreground">No</span>}</TableCell>
                <TableCell>
                  {PRICING[c.pricing]}
                  {c.pricing === "cpc" && c.isWagering && (
                    <div className="text-[12px] text-muted-foreground">Pending legal sign-off</div>
                  )}
                </TableCell>
                <TableCell>{STATUS[c.status]}</TableCell>
                <TableCell className="whitespace-nowrap">{c.flight}</TableCell>
                <TableCell className="text-muted-foreground">{c.channels.join(", ")}</TableCell>
                <TableCell className="text-right tabular">{aud(c.budget, false)}</TableCell>
                <TableCell className="text-right tabular">
                  {aud(c.spent)}
                  <div className="text-[12px] text-muted-foreground">{Math.round((c.spent / c.budget) * 100)}%</div>
                </TableCell>
                <TableCell className="text-right tabular">{number(c.impressions)}</TableCell>
                <TableCell className="text-right tabular">{number(c.clicks)}</TableCell>
                <TableCell className="text-right tabular">{ctr(c)}</TableCell>
              </TableRow>
            ))}
          </TableBody>
          <TableFooter>
            <TableRow>
              <TableCell colSpan={6} className="font-semibold">Total, {campaigns.length} campaigns (AUD, ex GST)</TableCell>
              <TableCell className="text-right font-semibold tabular">{aud(totals.budget, false)}</TableCell>
              <TableCell className="text-right font-semibold tabular">{aud(totals.spent)}</TableCell>
              <TableCell className="text-right font-semibold tabular">{number(totals.impressions)}</TableCell>
              <TableCell className="text-right font-semibold tabular">{number(totals.clicks)}</TableCell>
              <TableCell className="text-right font-semibold tabular">
                {totals.impressions ? `${((totals.clicks / totals.impressions) * 100).toFixed(2)}%` : "–"}
              </TableCell>
            </TableRow>
          </TableFooter>
        </Table>
      </div>
    </div>
  )
}
