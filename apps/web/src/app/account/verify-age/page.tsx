import type { Metadata } from "next"
import { VerifyAgeFlow } from "@/components/account/verify-age-flow"

export const metadata: Metadata = { title: "Confirm your age" }

export default function VerifyAgePage() {
  return <VerifyAgeFlow />
}
