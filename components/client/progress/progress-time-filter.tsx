"use client";

import type { ProgressTimeFilter } from "@/lib/mock/client-data";
import { cn } from "@/lib/utils";

const FILTERS: { id: ProgressTimeFilter; label: string }[] = [
  { id: "week", label: "Bu Hafta" },
  { id: "month", label: "Bu Ay" },
  { id: "all", label: "Tüm Zamanlar" },
];

export function ProgressTimeFilterTabs({
  value,
  onChange,
}: {
  value: ProgressTimeFilter;
  onChange: (value: ProgressTimeFilter) => void;
}) {
  return (
    <div className="flex rounded-2xl border border-slate-200 bg-slate-100/80 p-1 dark:border-slate-800 dark:bg-slate-900/80">
      {FILTERS.map((filter) => {
        const isActive = value === filter.id;

        return (
          <button
            key={filter.id}
            type="button"
            onClick={() => onChange(filter.id)}
            className={cn(
              "flex-1 rounded-xl px-2 py-2 text-xs font-semibold transition-colors",
              isActive
                ? "bg-white text-teal-700 shadow-sm dark:bg-slate-800 dark:text-teal-300"
                : "text-slate-500 hover:text-slate-700 dark:text-zinc-400 dark:hover:text-zinc-200",
            )}
          >
            {filter.label}
          </button>
        );
      })}
    </div>
  );
}
