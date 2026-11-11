import type { Metadata } from "next"
import { PageHeader } from "@/components/shell/page-header"
import { AuditTable } from "@/components/admin/audit-table"
import { auditLog } from "@/components/admin/data"

export const metadata: Metadata = { title: "Audit log" }

export default function AuditPage() {
  return (
    <div>
      <PageHeader title="Audit log" description="Every admin and system action, with who did it, what changed and why." />
      <AuditTable entries={auditLog} />
    </div>
  )
}
