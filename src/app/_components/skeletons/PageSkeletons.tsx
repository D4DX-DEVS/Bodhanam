import Skeleton from "@/app/_components/Skeleton";

// Route-level skeletons, one per listing page, mirroring each page's real
// grid at every breakpoint so content swaps in without a layout jump.

const range = (n: number) => Array.from({ length: n }, (_, i) => i);

function PageHeading({ subtitle = true }: { subtitle?: boolean }) {
  return (
    <div className="mb-8 flex flex-col gap-3 md:mb-10">
      <Skeleton className="h-10 w-48 md:h-14 md:w-64" />
      {subtitle && <Skeleton className="h-4 w-72 max-w-full" />}
    </div>
  );
}

function ArticleCardSkeleton() {
  return (
    <div className="article-card flex h-full flex-col overflow-hidden">
      <Skeleton className="aspect-[16/9] w-full rounded-none" />
      <div className="flex flex-col gap-2 p-4">
        <Skeleton className="h-3 w-16" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-3 w-1/2" />
      </div>
    </div>
  );
}

export function ArchivesSkeleton() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 md:py-16 lg:px-8 lg:py-20" aria-busy="true" aria-label="Loading">
      <PageHeading />
      <div className="mb-8 flex gap-2 sm:gap-3 md:mb-12">
        <Skeleton className="h-11 flex-1" />
        <Skeleton className="h-11 w-[7.5rem] sm:w-36" />
      </div>
      <div className="grid grid-cols-2 gap-x-6 gap-y-10 md:grid-cols-3 lg:grid-cols-4 lg:gap-x-8 lg:gap-y-12">
        {range(8).map((i) => (
          <div key={i} className="flex flex-col items-center gap-4">
            <Skeleton className="aspect-[3/4] w-full" />
            <Skeleton className="h-4 w-3/4" />
          </div>
        ))}
      </div>
    </div>
  );
}

export function AuthorsSkeleton() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 md:py-16 lg:px-8 lg:py-20" aria-busy="true" aria-label="Loading">
      <PageHeading />
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
        {range(15).map((i) => (
          <div
            key={i}
            className="flex flex-col items-center gap-2 rounded-xl border p-5"
            style={{ borderColor: "var(--border-subtle)" }}
          >
            <Skeleton className="h-12 w-12 rounded-full" />
            <Skeleton className="h-4 w-4/5" />
            <Skeleton className="h-3 w-1/2" />
          </div>
        ))}
      </div>
    </div>
  );
}

export function AuthorArticlesSkeleton() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 md:py-16 lg:px-8 lg:py-20" aria-busy="true" aria-label="Loading">
      <div className="mb-12 flex items-center gap-4 md:mb-16">
        <Skeleton className="h-16 w-16 shrink-0 rounded-full" />
        <div className="flex flex-1 flex-col gap-2">
          <Skeleton className="h-8 w-56 max-w-full" />
          <Skeleton className="h-4 w-28" />
        </div>
      </div>
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {range(6).map((i) => (
          <ArticleCardSkeleton key={i} />
        ))}
      </div>
    </div>
  );
}

export function SearchSkeleton() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6 md:py-16 lg:px-8" aria-busy="true" aria-label="Loading">
      <div className="mx-auto mb-10 flex max-w-2xl flex-col items-center gap-4">
        <Skeleton className="h-10 w-40" />
        <Skeleton className="h-14 w-full rounded-full" />
        <Skeleton className="h-9 w-48" />
      </div>
      <div className="flex flex-col gap-4">
        {range(5).map((i) => (
          <div
            key={i}
            className="flex items-start gap-4 rounded-lg border p-5 md:gap-6 md:p-6"
            style={{ borderColor: "var(--border-subtle)" }}
          >
            <Skeleton className="h-20 w-20 shrink-0 md:h-24 md:w-24" />
            <div className="flex flex-1 flex-col gap-2">
              <Skeleton className="h-3 w-20" />
              <Skeleton className="h-5 w-full" />
              <Skeleton className="h-3 w-1/3" />
              <Skeleton className="h-3 w-4/5" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export function IssueSkeleton() {
  return (
    <div aria-busy="true" aria-label="Loading">
      <div className="mx-auto max-w-7xl px-4 pb-4 pt-10 sm:px-6 md:pb-6 md:pt-14 lg:px-8 lg:pt-16">
        <div className="grid grid-cols-1 items-center gap-8 md:grid-cols-[minmax(0,240px)_1fr] lg:gap-12">
          <Skeleton className="mx-auto aspect-[3/4] w-full max-w-[220px] md:mx-0" />
          <div className="flex flex-col items-center gap-3 md:items-start">
            <Skeleton className="h-5 w-28 rounded-full" />
            <Skeleton className="h-9 w-64 max-w-full" />
            <Skeleton className="h-4 w-40" />
            <Skeleton className="h-4 w-full max-w-md" />
          </div>
        </div>
      </div>
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <Skeleton className="mb-6 h-7 w-40" />
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {range(8).map((i) => (
            <ArticleCardSkeleton key={i} />
          ))}
        </div>
      </div>
    </div>
  );
}

export function ContactSkeleton() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 md:py-16 lg:px-8 lg:py-20" aria-busy="true" aria-label="Loading">
      <PageHeading />
      <div className="mb-10 grid grid-cols-1 gap-4 sm:gap-6 md:mb-20 md:grid-cols-2">
        {range(2).map((i) => (
          <div
            key={i}
            className="flex flex-col gap-4 rounded-2xl border p-5 sm:p-7"
            style={{ borderColor: "var(--border-subtle)" }}
          >
            <div className="flex items-center gap-3">
              <Skeleton className="h-10 w-10 rounded-xl" />
              <Skeleton className="h-6 w-40" />
            </div>
            {range(3).map((r) => (
              <div key={r} className="flex items-center gap-3">
                <Skeleton className="h-10 w-10 shrink-0 rounded-xl" />
                <div className="flex flex-1 flex-col gap-1.5">
                  <Skeleton className="h-3 w-16" />
                  <Skeleton className="h-4 w-3/4" />
                </div>
              </div>
            ))}
          </div>
        ))}
      </div>
      <Skeleton className="mb-4 h-7 w-44" />
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {range(6).map((i) => (
          <div key={i} className="flex items-center gap-3 py-1">
            <Skeleton className="h-10 w-10 shrink-0 rounded-full" />
            <Skeleton className="h-4 w-48" />
          </div>
        ))}
      </div>
    </div>
  );
}
