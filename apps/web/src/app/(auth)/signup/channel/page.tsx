import type { Metadata } from "next"
import { AsideStatement, AuthHeading, AuthShell } from "@/components/auth/auth-shell"
import { ChannelPicker, type YouTubeChannelOption } from "@/components/auth/channel-picker"
import { SignupSteps } from "@/components/auth/signup-steps"
import { getChannel } from "@/lib/data"
import { compact } from "@/lib/format"

export const metadata: Metadata = { title: "Choose your channel" }

export default function SignupChannelPage() {
  const ff = getChannel("footyfix")!
  const options: YouTubeChannelOption[] = [
    {
      handle: ff.youtube!.handle,
      title: ff.name,
      subscribers: compact(ff.youtube!.subscribers),
      videos: 222,
      initials: "FF",
      tone: "#0a0a0a",
    },
    {
      handle: "@samdohertyfooty",
      title: "Sam Doherty",
      subscribers: "1.2k",
      videos: 18,
      initials: "SD",
      tone: "#5c5c5c",
    },
  ]

  return (
    <AuthShell
      top={<SignupSteps current={1} />}
      aside={
        <AsideStatement
          title="Your back catalogue is worth more than you think."
          body="Every public video becomes a page Google can index. Old videos start bringing in search traffic, not just new ones."
        />
      }
    >
      <AuthHeading title="Pick your channel" lede="We found two YouTube channels on your Google account. Choose the one to build on." />
      <ChannelPicker options={options} />
    </AuthShell>
  )
}
