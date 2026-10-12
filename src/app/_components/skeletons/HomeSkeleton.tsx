import Skeleton from "@/app/_components/Skeleton";

// Section-level skeletons: used as Suspense fallbacks on the home page so each
// section shimmers independently and swaps in as soon as its data streams.

export function HeroSkeleton() {
  return (
    <section className="py-5 md:py-6" aria-busy="true" aria-label="Loading latest issue">
      <div
        className="grid grid-cols-[7rem_1fr] items-center gap-4 rounded-[20px] border px-4 py-4 sm:flex sm:gap-6 sm:px-6 sm:py-5 lg:px-7"
        style={{ borderColor: "var(--hero-border)", backgroundColor: "var(--hero-bg)" }}
      >
        <Skeleton className="aspect-[3/4] w-full sm:w-40 sm:shrink-0" />
        <div className="flex min-w-0 flex-1 flex-col gap-2.5">
          <Skeleton className="h-5 w-24 rounded-full" />
          <Skeleton className="h-5 w-3/4" />
          <Skeleton className="h-4 w-1/2" />
          <div className="mt-1 flex gap-4">
            <Skeleton className="h-8 w-14" />
            <Skeleton className="h-8 w-14" />
          </div>
          <Skeleton className="mt-2 hidden h-10 w-44 sm:block" />
        </div>
        <Skeleton className="col-span-2 h-11 w-full sm:hidden" />
        <Skeleton className="hidden h-48 w-96 shrink-0 rounded-xl lg:block" />
      </div>
    </section>
  );
}

export function CoverStoriesSkeleton() {
  return (
    <section className="py-5 md:py-6" aria-busy="true" aria-label="Loading cover stories">
      <Skeleton className="mb-4 h-7 w-40" />
      <div className="grid grid-cols-1 gap-5 lg:grid-cols-5">
        <Skeleton className="aspect-[4/3] w-full rounded-2xl sm:aspect-[16/9] lg:col-span-3" />
        <div className="flex flex-col gap-3 lg:col-span-2">
          {Array.from({ length: 3 }).map((_, i) => (
            <div
              key={i}
              className="flex h-28 overflow-hidden rounded-[14px] border"
              style={{ borderColor: "var(--border-subtle)" }}
            >
              <Skeleton className="h-full w-2/5 rounded-none" />
              <div className="flex flex-1 flex-col justify-center gap-2 p-3">
                <Skeleton className="h-3 w-16" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-3 w-1/2" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export function CardsSkeleton({ count = 4 }: { count?: number }) {
  return (
    <section className="py-5 md:py-6" aria-busy="true" aria-label="Loading articles">
      <Skeleton className="mb-4 h-7 w-32" />
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: count }).map((_, i) => (
          <div key={i} className="flex flex-col gap-2">
            <Skeleton className="aspect-[16/10] w-full" />
            <Skeleton className="h-3 w-20" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-3 w-2/3" />
          </div>
        ))}
      </div>
    </section>
  );
}

export function ArchiveSkeleton() {
  return (
    <section className="py-6 md:py-10" aria-busy="true" aria-label="Loading archive">
      <Skeleton className="mb-4 h-8 w-48" />
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
        {Array.from({ length: 6 }).map((_, i) => (
          <Skeleton key={i} className="aspect-[3/4] w-full" />
        ))}
      </div>
    </section>
  );
}

/** Full home page skeleton (route-level loading state during navigation). */
export default function HomeSkeleton() {
  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
      <HeroSkeleton />
      <CoverStoriesSkeleton />
      <CardsSkeleton />
      <ArchiveSkeleton />
    </div>
  );
}
