import { PageHeader } from "@/components/shell/page-header"
import { DEMO_CHANNEL_SLUG, getChannel, listShorts, listVideos } from "@/lib/data"
import { AnalyticsDashboard, type TopItem } from "@/components/studio/analytics-dashboard"
import { studioDays } from "@/components/studio/lib"

export const metadata = { title: "Analytics" }

export default function AnalyticsPage() {
  const channel = getChannel(DEMO_CHANNEL_SLUG)!
  // The last 30 days are the shared daily stats; studioDays() adds the 60 before for comparisons.
  const days = studioDays()
  const top: TopItem[] = [
    ...listVideos(channel.id, "published").map<TopItem>((v) => ({ id: v.id, title: v.title, kind: "Video", views: v.views, watchMinutes: v.watchMinutes, tone: v.posterTone })),
    ...listShorts(channel.id, "published").map<TopItem>((s) => ({ id: s.id, title: s.title, kind: "Short", views: s.views, watchMinutes: Math.round((s.views * s.durationSec * 0.7) / 60), tone: s.posterTone })),
  ]
    .sort((a, b) => b.views - a.views)
    .slice(0, 6)

  return (
    <div>
      <PageHeader
        title="Analytics"
        description={`How ${channel.name} is doing across your pages, videos and shorts. Your audience and search traffic, measured by us, owned by you.`}
      />
      <AnalyticsDashboard days={days} top={top} />
    </div>
  )
}
