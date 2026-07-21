import Skeleton from "@/app/_components/Skeleton";

export default function Loading() {
  return (
    <div className="p-6">
      <Skeleton className="mb-6 h-7 w-40" />
      <div className="flex flex-col gap-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <Skeleton key={i} className="h-14 w-full" />
        ))}
      </div>
    </div>
  );
}
