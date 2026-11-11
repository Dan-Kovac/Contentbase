import { NotFoundSearch } from "@/components/channel/not-found-search"

export default function ChannelNotFound() {
  return (
    <div className="mx-auto max-w-[680px] px-4 py-20 md:px-8 md:py-28">
      <p className="kicker text-foreground">404</p>
      <h1 className="mt-4 font-[family-name:var(--chan-display)] text-[40px] leading-[1.05] [font-weight:var(--chan-weight)] tracking-[var(--chan-tracking)] md:text-[56px]">
        We couldn&apos;t find that page
      </h1>
      <p className="mt-4 font-[family-name:var(--chan-body)] text-[19px] leading-[29px] text-foreground/80">
        It may have moved or been taken down. Search the channel and you&apos;ll likely find it.
      </p>
      <div className="mt-8">
        <NotFoundSearch />
      </div>
    </div>
  )
}
