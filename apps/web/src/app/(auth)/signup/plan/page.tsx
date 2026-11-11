import type { Metadata } from "next"
import { AsideStatement, AuthHeading, AuthShell } from "@/components/auth/auth-shell"
import { ImportTicker } from "@/components/auth/import-ticker"
import { PlanPicker } from "@/components/auth/plan-picker"
import { SignupSteps } from "@/components/auth/signup-steps"
import { TRIAL_ENDS } from "@/components/marketing/plans"

export const metadata: Metadata = { title: "Choose a plan" }

export default function SignupPlanPage() {
  return (
    <AuthShell
      top={<SignupSteps current={4} />}
      aside={
        <>
          <AsideStatement
            title="Free for 14 days. Then your call."
            body={`Use every feature of your plan until ${TRIAL_ENDS}. Change plans or cancel from Billing in your studio, any time.`}
          />
          <ImportTicker start={64} />
        </>
      }
    >
      <AuthHeading title="Choose a plan" lede="All prices in AUD and include GST. You won't be charged during your trial." />
      <PlanPicker />
    </AuthShell>
  )
}
