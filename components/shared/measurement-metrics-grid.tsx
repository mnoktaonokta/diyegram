import type { MeasurementSnapshot } from "@/lib/mock/client-data";
import {
  formatBodyMeasurement,
  formatMeasurementDelta,
  getDeltaTone,
  getMeasurementDelta,
} from "@/lib/utils/measurements";
import { cn } from "@/lib/utils";

type MetricCardProps = {
  label: string;
  primary: string;
  secondary?: string;
  primaryClassName?: string;
  secondaryClassName?: string;
  className?: string;
};

function MetricCard({
  label,
  primary,
  secondary,
  primaryClassName,
  secondaryClassName,
  className,
}: MetricCardProps) {
  return (
    <div
      className={cn(
        "rounded-xl bg-slate-50 px-3 py-2.5 dark:bg-slate-800/50",
        className,
      )}
    >
      <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-400 dark:text-zinc-500">
        {label}
      </p>
      <p
        className={cn(
          "mt-1 text-sm font-bold text-slate-800 dark:text-zinc-100",
          primaryClassName,
        )}
      >
        {primary}
      </p>
      {secondary ? (
        <p
          className={cn(
            "text-xs text-slate-500 dark:text-zinc-400",
            secondaryClassName,
          )}
        >
          {secondary}
        </p>
      ) : null}
    </div>
  );
}

export function MeasurementMetricsGrid({
  measurements,
  lastActivity,
  showLastActivity = false,
  className,
}: {
  measurements: MeasurementSnapshot;
  lastActivity?: string;
  showLastActivity?: boolean;
  className?: string;
}) {
  const { weightDiff, fatDiff } = getMeasurementDelta(measurements);
  const start = formatBodyMeasurement(measurements.start);
  const previous = formatBodyMeasurement(measurements.previous);
  const current = formatBodyMeasurement(measurements.current);

  return (
    <div
      className={cn(
        "grid grid-cols-2 gap-2 sm:grid-cols-3",
        className,
      )}
    >
      <MetricCard
        label="Başlangıç"
        primary={start.weight}
        secondary={`${start.fat} yağ`}
      />
      <MetricCard
        label="Önceki"
        primary={previous.weight}
        secondary={`${previous.fat} yağ`}
      />
      <MetricCard
        label="Güncel"
        primary={current.weight}
        secondary={`${current.fat} yağ`}
        className="col-span-2 sm:col-span-1"
      />
      <MetricCard
        label="Fark"
        primary={formatMeasurementDelta(weightDiff, "kg")}
        secondary={formatMeasurementDelta(fatDiff, "%") + " yağ"}
        primaryClassName={getDeltaTone(weightDiff)}
        secondaryClassName={getDeltaTone(fatDiff)}
      />
      <MetricCard
        label="Hedef"
        primary={`${measurements.targetWeight} kg`}
        secondary={`%${measurements.targetFatPercentage.toFixed(1)} yağ`}
        primaryClassName="text-teal-600 dark:text-teal-400"
      />
      {showLastActivity ? (
        <MetricCard
          label="Son Aktivite"
          primary={lastActivity ?? "—"}
          className="col-span-2 sm:col-span-1"
        />
      ) : null}
    </div>
  );
}
