import type { Metadata } from "next"
import { ImportLive } from "@/components/auth/import-live"

export const metadata: Metadata = { title: "Your channel is live" }

export default function SignupImportingPage() {
  return <ImportLive />
}
