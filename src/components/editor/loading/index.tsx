import { Skeleton } from "@/components/ui/skeleton";

export function Loading() {
  return (
    <section className="flex flex-col w-full h-full gap-4 mt-4">
      <div className="flex flex-row justify-between gap-4 items-center">
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-10 w-[180px]" />
      </div>
      <Skeleton className="h-[30px] w-full" />
    </section>
  );
}
