import Skeleton from "@/app/_components/Skeleton";

/** Prev/next cards + "More from this Issue" grid, streamed below the body. */
export function RelatedSkeleton() {
  return (
    <section className="py-10 md:py-14" aria-busy="true" aria-label="Loading related articles">
      <div className="mb-12 grid grid-cols-1 gap-6 md:mb-16 md:grid-cols-2 md:gap-8">
        {Array.from({ length: 2 }).map((_, i) => (
          <div key={i} className="article-card flex flex-col gap-2 p-5 md:p-6">
            <Skeleton className="h-3 w-28" />
            <Skeleton className="h-5 w-full" />
          </div>
        ))}
      </div>
      <Skeleton className="mb-6 h-8 w-56 md:mb-8" />
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:gap-6">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="article-card flex flex-row items-center gap-4 p-4">
            <Skeleton className="h-20 w-20 shrink-0" />
            <div className="flex flex-1 flex-col gap-2">
              <Skeleton className="h-3 w-16" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-3 w-1/2" />
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

/** Issue cover + recent posts column. */
export function SidebarSkeleton() {
  return (
    <div className="flex flex-col gap-4" aria-busy="true" aria-label="Loading sidebar">
      <Skeleton className="aspect-[3/4] w-40 self-center lg:w-full" />
      {Array.from({ length: 5 }).map((_, i) => (
        <div key={i} className="flex gap-3 p-2">
          <Skeleton className="h-16 w-16 shrink-0" />
          <div className="flex flex-1 flex-col gap-2">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-3 w-1/2" />
          </div>
        </div>
      ))}
    </div>
  );
}

/** Full article page skeleton (route-level loading state during navigation). */
export default function ArticleSkeleton() {
  return (
    <div
      className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:grid lg:grid-cols-[minmax(0,1fr)_20rem] lg:gap-10 lg:px-8"
      aria-busy="true"
      aria-label="Loading"
    >
      <div className="min-w-0">
        <div className="flex flex-col gap-4 pb-5 pt-6 md:pt-8">
          <Skeleton className="h-6 w-24 rounded-full" />
          <Skeleton className="h-9 w-full" />
          <Skeleton className="h-9 w-2/3" />
          <Skeleton className="h-5 w-40" />
        </div>
        <div className="content-card">
          <Skeleton className="mb-6 aspect-video w-full" />
          {Array.from({ length: 4 }).map((_, p) => (
            <div key={p} className="mb-6 flex flex-col gap-2.5">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-11/12" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-3/5" />
            </div>
          ))}
        </div>
      </div>
      <div className="mt-10 lg:mt-8">
        <SidebarSkeleton />
      </div>
    </div>
  );
}
