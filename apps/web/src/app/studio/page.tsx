import { PageHeader } from "@/components/shell/page-header"
import { VideoCard } from "@/components/brand/media"
import { AdSlot } from "@/components/brand/ad-slot"
import { StatusBadge } from "@/components/brand/status-badge"
import { Button } from "@/components/ui/button"

export default function StudioHome() {
  return (
    <div>
      <PageHeader title="Good morning, Sam" description="Two videos are ready to review." actions={<><Button variant="outline">Preview</Button><Button variant="pop">Publish</Button></>} />
      <div className="flex gap-2"><StatusBadge tone="ready" /><StatusBadge tone="published" /><StatusBadge tone="live" /><StatusBadge tone="exclusive" /></div>
      <div className="mt-6 grid grid-cols-3 gap-6"><VideoCard href="#" title="The Blues have a centre-bounce problem" kicker="AFL · Round 7" tone="#1c4fb8" durationSec={1086} meta="Ready to review" /></div>
      <div className="mt-6"><AdSlot wagering /></div>
    </div>
  )
}
