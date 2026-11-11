import type { Metadata } from "next"
import { StyleStep } from "@/components/auth/style-step"

export const metadata: Metadata = { title: "Choose your look" }

export default function SignupStylePage() {
  return <StyleStep />
}
