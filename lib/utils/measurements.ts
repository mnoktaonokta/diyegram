import type { BodyMeasurement, MeasurementSnapshot } from "@/lib/mock/client-data";

export function getMeasurementDelta(snapshot: MeasurementSnapshot) {
  return {
    weightDiff: snapshot.current.weight - snapshot.previous.weight,
    fatDiff: snapshot.current.fatPercentage - snapshot.previous.fatPercentage,
  };
}

export function formatMeasurementDelta(value: number, unit: "kg" | "%") {
  if (value === 0) {
    return unit === "kg" ? "0 kg" : "0%";
  }

  const sign = value > 0 ? "+" : "";
  return unit === "kg" ? `${sign}${value.toFixed(1)} kg` : `${sign}${value.toFixed(1)}%`;
}

export function getDeltaTone(delta: number) {
  if (delta < 0) {
    return "text-emerald-600 dark:text-emerald-400";
  }

  if (delta > 0) {
    return "text-rose-600 dark:text-rose-400";
  }

  return "text-slate-500 dark:text-zinc-400";
}

export function getWeightProgressFromSnapshot(snapshot: MeasurementSnapshot) {
  const total = snapshot.start.weight - snapshot.targetWeight;
  const progress = snapshot.start.weight - snapshot.current.weight;

  if (total <= 0) {
    return 0;
  }

  return Math.min(100, Math.max(0, Math.round((progress / total) * 100)));
}

export function formatBodyMeasurement(measurement: BodyMeasurement) {
  return {
    weight: `${measurement.weight} kg`,
    fat: `%${measurement.fatPercentage.toFixed(1)}`,
  };
}
