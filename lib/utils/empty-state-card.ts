import { cn } from "@/lib/utils";

/** Tıklanabilir boş durum kartları için ortak görsel ipuçları */
export function emptyStateCardClassName(className?: string) {
  return cn(
    "border-2 border-dashed border-slate-300 bg-white/60 dark:border-slate-700 dark:bg-slate-900/60",
    "cursor-pointer transition-all duration-200 active:scale-[0.98]",
    "hover:border-emerald-500/50 hover:bg-slate-100/90 dark:hover:border-emerald-500/50 dark:hover:bg-slate-800/40",
    className,
  );
}
