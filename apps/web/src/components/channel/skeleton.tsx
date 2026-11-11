import { Skeleton } from "@/components/ui/skeleton"

/** Shared App Shell placeholder while the URL-specific part of a channel page streams in. */
export function ChannelPageSkeleton({ variant = "page" }: { variant?: "page" | "video" | "home" }) {
  return (
    <div className="mx-auto max-w-[1280px] px-4 pt-8 md:px-8 md:pt-10" aria-busy="true" aria-label="Loading">
      {variant === "page" ? (
        <div className="flex flex-col gap-4">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-14 w-2/3" />
          <Skeleton className="h-5 w-1/2" />
          <div className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {[0, 1, 2].map((i) => (
              <Skeleton key={i} className="aspect-video w-full rounded-lg" />
            ))}
          </div>
        </div>
      ) : (
        <div className="grid gap-6 lg:grid-cols-12 lg:gap-10">
          <Skeleton className="aspect-video w-full rounded-lg lg:col-span-8" />
          <div className="flex flex-col gap-4 lg:col-span-4">
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-24 w-full" />
            <Skeleton className="h-16 w-5/6" />
          </div>
        </div>
      )}
    </div>
  )
}
