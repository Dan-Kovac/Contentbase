import { PageHeader } from "@/components/shell/page-header"
import { getEarnings, listShorts, listVideos } from "@/lib/data"
import { currentPublication } from "@/lib/publication"
import { AnalyticsDashboard, type TopItem } from "@/components/studio/analytics-dashboard"
import { pubScale, studioDays } from "@/components/studio/lib"
import { EarningsPanel } from "@/components/studio/earnings"

export const metadata = { title: "Analytics" }

export default async function AnalyticsPage() {
  const channel = (await currentPublication())
  // The last 30 days are the shared daily stats; studioDays() adds the 60 before for comparisons.
  const days = studioDays(pubScale(channel.slug))
  const earn = getEarnings(channel.id)
  const top: TopItem[] = [
    ...listVideos(channel.id, "published").map<TopItem>((v) => ({ id: v.id, title: v.title, kind: "Video", views: v.views, watchMinutes: v.watchMinutes, tone: v.posterTone, src: v.poster })),
    ...listShorts(channel.id, "published").map<TopItem>((s) => ({ id: s.id, title: s.title, kind: "Short", views: s.views, watchMinutes: Math.round((s.views * s.durationSec * 0.7) / 60), tone: s.posterTone, src: s.poster })),
  ]
    .sort((a, b) => b.views - a.views)
    .slice(0, 6)

  return (
    <div>
      <PageHeader
        title="Analytics"
        description={`How ${channel.name} is doing across your pages, videos and shorts. Your audience and search traffic, measured by us, owned by you.`}
      />
      <div className="grid gap-10">
        {earn && <EarningsPanel earn={earn} />}
        <AnalyticsDashboard days={days} top={top} />
      </div>
    </div>
  )
}
