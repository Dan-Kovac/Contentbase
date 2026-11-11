import type { Metadata } from "next"
import { AccountSheet } from "@/components/account/sheet"
import { ViewerSignIn } from "@/components/account/viewer-signin"

export const metadata: Metadata = { title: "Sign in" }

export default function ViewerSignInPage() {
  return (
    <AccountSheet title="Sign in to watch" lede="Free. One account for every Homestand channel.">
      <ViewerSignIn />
      <ul className="flex flex-col gap-1.5 border-t pt-5 text-[13px] leading-5 text-muted-foreground">
        <li>Watch exclusives and follow the channels you like.</li>
        <li>We never post anything for you, and never sell your details.</li>
      </ul>
    </AccountSheet>
  )
}
