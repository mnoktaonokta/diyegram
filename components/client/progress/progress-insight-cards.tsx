import type { ProgressInsights } from "@/lib/utils/progress-analytics";
import { cn } from "@/lib/utils";

function InsightCard({
  label,
  value,
  hint,
  accentClassName,
}: {
  label: string;
  value: string;
  hint: string;
  accentClassName?: string;
}) {
  return (
    <div className="rounded-2xl border border-slate-200/80 bg-white px-3 py-3 dark:border-slate-800 dark:bg-slate-900">
      <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-400 dark:text-zinc-500">
        {label}
      </p>
      <p
        className={cn(
          "mt-1 text-lg font-bold text-slate-800 dark:text-zinc-100",
          accentClassName,
        )}
      >
        {value}
      </p>
      <p className="mt-1 text-[11px] text-slate-500 dark:text-zinc-400">{hint}</p>
    </div>
  );
}

export function ProgressInsightCards({ insights }: { insights: ProgressInsights }) {
  return (
    <div className="grid grid-cols-3 gap-2">
      <InsightCard
        label="Toplam Kilo"
        value={`-${insights.totalWeightLost.toFixed(1)} kg`}
        hint="Verilen kilo"
        accentClassName="text-sky-600 dark:text-sky-400"
      />
      <InsightCard
        label="Toplam Yağ"
        value={`-${insights.totalFatLost.toFixed(1)}%`}
        hint="Yakılan yağ"
        accentClassName="text-emerald-600 dark:text-emerald-400"
      />
      <InsightCard
        label="Günlük Ort."
        value={`${insights.averageSteps.toLocaleString("tr-TR")}`}
        hint={`${insights.averageExerciseMinutes} dk egzersiz`}
        accentClassName="text-amber-600 dark:text-amber-400"
      />
    </div>
  );
}
