import { Suspense } from "react"
import Link from "next/link"
import { ArrowLeft } from "lucide-react"
import { PageHeader } from "@/components/shell/page-header"
import { NewImportFallback, NewImportFromParams } from "@/components/imports/new-import"

export const metadata = { title: "New import" }

export default function NewImportPage() {
  return (
    <div className="mx-auto max-w-[1120px]">
      <Link href="/studio/imports" className="mb-3 inline-flex items-center gap-1.5 text-[13px] font-medium text-muted-foreground hover:text-foreground">
        <ArrowLeft className="size-3.5" aria-hidden /> Imports
      </Link>
      <PageHeader title="New import" description="Move your videos, posts and subscribers to Homestand. Your old links keep working." />
      <Suspense fallback={<NewImportFallback />}>
        <NewImportFromParams />
      </Suspense>
    </div>
  )
}
