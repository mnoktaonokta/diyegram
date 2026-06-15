import { cn } from "@/lib/utils";

export function ClientDataSkeleton({
  className,
  rows = 3,
}: {
  className?: string;
  rows?: number;
}) {
  return (
    <div
      className={cn(
        "animate-pulse rounded-2xl border border-slate-200/80 bg-white p-4 dark:border-slate-800 dark:bg-slate-900",
        className,
      )}
      aria-busy="true"
      aria-label="Yükleniyor"
    >
      <div className="h-4 w-1/3 rounded-lg bg-slate-200 dark:bg-slate-800" />
      <div className="mt-3 h-3 w-2/3 rounded-lg bg-slate-100 dark:bg-slate-800/80" />
      {Array.from({ length: rows }).map((_, index) => (
        <div
          key={index}
          className="mt-3 h-10 rounded-xl bg-slate-100 dark:bg-slate-800/60"
        />
      ))}
    </div>
  );
}
