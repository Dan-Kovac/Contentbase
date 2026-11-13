import { redirect } from "next/navigation"

/** Every channel starts on a 14-day Pro trial; the plan is chosen later in Billing. */
export default function SignupPlanPage() {
  redirect("/signup/importing")
}
