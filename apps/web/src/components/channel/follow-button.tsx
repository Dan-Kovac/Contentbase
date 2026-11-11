"use client"

import { useState } from "react"
import { Check, Plus } from "lucide-react"
import { toast } from "sonner"
import { number } from "@/lib/format"
import { cn } from "@/lib/utils"

/** AUD-02. Prototype: toggles locally; the real button asks a logged-out viewer to sign in first. */
export function FollowButton({ channelName, followers }: { channelName: string; followers: number }) {
  const [following, setFollowing] = useState(false)
  return (
    <div className="flex flex-wrap items-center gap-3">
      <button
        type="button"
        aria-pressed={following}
        onClick={() => {
          setFollowing((f) => !f)
          toast(following ? `Unfollowed ${channelName}` : `Following ${channelName}. New episodes arrive in your weekly digest.`)
        }}
        className={cn(
          "inline-flex h-11 items-center gap-2 rounded-full px-6 text-[15px] font-bold outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
          following ? "border border-input bg-background text-foreground" : "bg-[var(--chan)] text-[var(--chan-on)]",
        )}
      >
        {following ? <Check className="size-4" aria-hidden /> : <Plus className="size-4" aria-hidden />}
        {following ? "Following" : "Follow"}
      </button>
      <span className="text-[14px] text-muted-foreground">{number(followers + (following ? 1 : 0))} followers</span>
    </div>
  )
}
