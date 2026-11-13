import { PageHeader } from "@/components/shell/page-header"
import { SubscriberImport } from "@/components/studio/email/subscriber-import"
import { listEmailStreams, listSubscriberImports } from "@/lib/data"
import { compact } from "@/lib/format"
import { currentPublication } from "@/lib/publication"

export const metadata = { title: "Subscribers" }

export default async function SubscribersPage() {
  const channel = await currentPublication()
  const streams = listEmailStreams(channel.id)
  const imports = listSubscriberImports(channel.id)
  return (
    <div className="mx-auto max-w-[1040px]">
      <PageHeader
        title="Subscribers"
        description="Everyone on your lists is a member of your channel: they joined on your site, or you brought them across with consent. Export them any time. They're yours."
      />
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-[minmax(0,1fr)_320px]">
        <section aria-labelledby="import-h" className="min-w-0">
          <h2 id="import-h" className="mb-3 text-lg font-semibold tracking-[-0.2px]">
            Import a list
          </h2>
          <SubscriberImport streams={streams.map(({ id, name }) => ({ id, name }))} channelName={channel.name} />
        </section>
        <aside className="flex flex-col gap-4" aria-label="Lists and history">
          <div className="rounded-lg border bg-card p-4">
            <p className="mb-2 text-[13px] font-semibold">By newsletter</p>
            <ul className="flex flex-col gap-2 text-[14px]">
              {streams.map((s) => (
                <li key={s.id} className="flex justify-between gap-3">
                  <span>{s.name}</span>
                  <span className="font-semibold">{compact(s.subscribers)}</span>
                </li>
              ))}
            </ul>
          </div>
          {imports.length > 0 && (
            <div className="rounded-lg border bg-card p-4">
              <p className="mb-2 text-[13px] font-semibold">Past imports</p>
              <ul className="flex flex-col gap-3 text-[13px]">
                {imports.map((i) => (
                  <li key={i.id} className="flex flex-col gap-0.5">
                    <span className="truncate font-semibold">{i.file}</span>
                    <span className="text-muted-foreground">
                      {i.at} · {i.imported.toLocaleString("en-AU")} subscribed, {i.duplicates} duplicates, {i.invalid} invalid, {i.suppressed} unsubscribed before
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          )}
          <p className="text-[12px] leading-[18px] text-muted-foreground">
            Unsubscribes are honoured on every publication you run, straight away, and kept on a suppression list so an import never adds them back.
          </p>
        </aside>
      </div>
    </div>
  )
}
