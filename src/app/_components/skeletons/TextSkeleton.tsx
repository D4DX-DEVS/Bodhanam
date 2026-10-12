import Skeleton from "@/app/_components/Skeleton";

/** Static content pages (about, contact): title + paragraph blocks. */
export default function TextSkeleton() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 md:py-16 lg:px-8 lg:py-20" aria-busy="true" aria-label="Loading">
      <Skeleton className="mb-8 h-9 w-56" />
      {Array.from({ length: 3 }).map((_, p) => (
        <div key={p} className="mb-6 flex flex-col gap-2.5">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-4/5" />
        </div>
      ))}
    </div>
  );
}
