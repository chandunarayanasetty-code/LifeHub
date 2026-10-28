import { Skeleton } from "@/components/ui/skeleton";

export default function AppLoading() {
  return (
    <div className="space-y-5" aria-busy="true" aria-live="polite">
      <span className="sr-only">Loading page…</span>

      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="space-y-2.5">
          <Skeleton className="h-3 w-40" />
          <Skeleton className="h-10 w-72 max-w-full" />
          <Skeleton className="h-3.5 w-80 max-w-full" />
        </div>
        <div className="flex gap-2">
          <Skeleton className="h-9 w-24" />
          <Skeleton className="h-9 w-28" />
          <Skeleton className="h-9 w-24" />
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: 4 }).map((_, index) => (
          <Skeleton key={index} className="h-[118px] rounded-xl" />
        ))}
      </div>

      <div className="grid gap-3 xl:grid-cols-3">
        <Skeleton className="h-[310px] rounded-xl xl:col-span-2" />
        <Skeleton className="h-[310px] rounded-xl" />
      </div>

      <div className="grid gap-3 xl:grid-cols-3">
        <Skeleton className="h-[260px] rounded-xl xl:col-span-2" />
        <Skeleton className="h-[260px] rounded-xl" />
      </div>
    </div>
  );
}
