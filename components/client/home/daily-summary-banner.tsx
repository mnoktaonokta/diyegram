"use client";

import { X } from "lucide-react";

import { useClientDay } from "@/components/client/client-day-provider";
import { formatExerciseSummary } from "@/lib/mock/client-data";
import { cn } from "@/lib/utils";

function SummaryChip({
  children,
  onRemove,
  className,
  removeLabel,
}: {
  children: React.ReactNode;
  onRemove?: () => void;
  className?: string;
  removeLabel: string;
}) {
  return (
    <div
      className={cn(
        "group relative flex shrink-0 items-center gap-2 rounded-xl px-3 py-2",
        className,
      )}
    >
      {children}
      {onRemove ? (
        <button
          type="button"
          onClick={onRemove}
          aria-label={removeLabel}
          className="flex size-5 items-center justify-center rounded-full bg-black/10 text-slate-600 opacity-70 transition-opacity hover:opacity-100 dark:bg-white/10 dark:text-zinc-200"
        >
          <X className="size-3" />
        </button>
      ) : null}
    </div>
  );
}

export function DailySummaryBanner() {
  const { selectedDailyRecord, removeWaterGlass, removeExercise } =
    useClientDay();
  const { waterGlasses, exercises } = selectedDailyRecord;

  return (
    <div className="mx-4 mt-4 flex gap-3 overflow-x-auto rounded-2xl border border-slate-200/80 bg-white px-4 py-3 shadow-sm dark:border-slate-800 dark:bg-slate-900 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
      {waterGlasses > 0 ? (
        <SummaryChip
          className="bg-sky-500/10"
          onRemove={removeWaterGlass}
          removeLabel="Su kaydını geri al"
        >
          <span className="text-base">💧</span>
          <p className="whitespace-nowrap text-sm font-semibold text-slate-800 dark:text-zinc-100">
            {waterGlasses} Bardak
          </p>
        </SummaryChip>
      ) : (
        <SummaryChip className="bg-slate-50 dark:bg-slate-800/60" removeLabel="">
          <span className="text-base">💧</span>
          <p className="whitespace-nowrap text-sm text-slate-400 dark:text-zinc-500">
            Su kaydı yok
          </p>
        </SummaryChip>
      )}

      {exercises.length > 0 ? (
        exercises.map((exercise) => (
          <SummaryChip
            key={exercise.id}
            className="bg-amber-400/10"
            onRemove={() => removeExercise(exercise.id)}
            removeLabel="Egzersiz kaydını sil"
          >
            <p className="whitespace-nowrap text-sm font-semibold text-slate-800 dark:text-zinc-100">
              {formatExerciseSummary(exercise)}
            </p>
          </SummaryChip>
        ))
      ) : (
        <SummaryChip className="bg-slate-50 dark:bg-slate-800/60" removeLabel="">
          <p className="whitespace-nowrap text-sm text-slate-400 dark:text-zinc-500">
            Henüz egzersiz kaydı yok
          </p>
        </SummaryChip>
      )}
    </div>
  );
}
