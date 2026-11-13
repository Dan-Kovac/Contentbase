import { redirect } from "next/navigation"

/** Look moved into step 3 (Make it yours); logo and type pairing live in Design settings. */
export default function SignupStylePage() {
  redirect("/signup/name")
}
