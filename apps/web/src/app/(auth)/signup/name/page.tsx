import type { Metadata } from "next"
import { NameForm } from "@/components/auth/name-form"

export const metadata: Metadata = { title: "Make it yours" }

export default function SignupNamePage() {
  return <NameForm />
}
