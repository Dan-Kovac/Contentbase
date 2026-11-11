import type { Metadata } from "next"
import { AuthHeading, AuthShell } from "@/components/auth/auth-shell"
import { ImportTicker } from "@/components/auth/import-ticker"
import { NameForm } from "@/components/auth/name-form"
import { SignupSteps } from "@/components/auth/signup-steps"

export const metadata: Metadata = { title: "Name your channel" }

export default function SignupNamePage() {
  return (
    <AuthShell
      top={<SignupSteps current={2} />}
      aside={
        <>
          <div className="flex flex-col gap-4">
            <p className="max-w-[16ch] text-[40px] font-extrabold leading-[42px] tracking-[-0.035em] xl:text-[52px] xl:leading-[54px]">
              Your name. Your address.
            </p>
            <p className="max-w-[44ch] text-[16px] leading-[25px] text-brand-muted">
              Your import has already started. By the time you choose a look, the first drafts will be waiting.
            </p>
          </div>
          <ImportTicker />
        </>
      }
    >
      <AuthHeading title="Name your channel" lede="This is what viewers see at the top of every page." />
      <NameForm />
    </AuthShell>
  )
}
