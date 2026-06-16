"use client";

import { useState } from "react";
import { Flame } from "lucide-react";

import { ClientDataSkeleton } from "@/components/client/client-data-skeleton";
import { useClientClinicalData } from "@/components/client/clinical/use-client-clinical-data";
import { NewDietProgramModal } from "@/components/client/diet/new-diet-program-modal";
import { MeasurementMetricsGrid } from "@/components/shared/measurement-metrics-grid";
import { getWeightProgressFromSnapshot } from "@/lib/utils/measurements";
import { cn } from "@/lib/utils";

function hasActiveProgram(
  motivation: NonNullable<
    ReturnType<typeof useClientClinicalData>["motivation"]
  >,
) {
  return (
    motivation.start.weight > 0 ||
    motivation.current.weight > 0 ||
    motivation.nextAppointmentDate != null
  );
}

export function MotivationCard() {
  const { motivation, isLoading } = useClientClinicalData();
  const [newDietOpen, setNewDietOpen] = useState(false);

  if (isLoading || !motivation) {
    return <ClientDataSkeleton className="mx-4 mt-4" rows={4} />;
  }

  if (!hasActiveProgram(motivation)) {
    return (
      <>
        <div className="mt-4 px-4">
          <button
            type="button"
            onClick={() => setNewDietOpen(true)}
            aria-label="Yeni diyete başla"
            className={cn(
              "block w-full rounded-2xl border border-dashed border-slate-200 bg-white/70 p-5 text-center shadow-sm",
              "cursor-pointer transition-all hover:bg-slate-800/50 active:scale-[0.98]",
              "dark:border-slate-800 dark:bg-slate-900/60",
            )}
          >
          <p className="text-2xl">🎯</p>
          <p className="mt-2 text-sm font-semibold text-slate-800 dark:text-zinc-100">
            Henüz diyet programınız başlamadı
          </p>
          <p className="mt-1 text-xs text-slate-500 dark:text-zinc-400">
            Dokunun ve yeni programınızı hemen başlatın
          </p>
        </button>
        </div>

        <NewDietProgramModal
          open={newDietOpen}
          onClose={() => setNewDietOpen(false)}
        />
      </>
    );
  }

  const progress = getWeightProgressFromSnapshot(motivation);
  const lostWeight = motivation.start.weight - motivation.current.weight;
  const remainingWeight = motivation.current.weight - motivation.targetWeight;

  return (
    <div className="mx-4 mt-4 rounded-2xl border border-slate-200/80 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-sm font-bold text-slate-800 dark:text-zinc-100">
            {motivation.daysUntilCheckup != null ? (
              <>
                Kontrole Son{" "}
                <span className="text-teal-600 dark:text-teal-400">
                  {motivation.daysUntilCheckup} Gün
                </span>
              </>
            ) : (
              "Kontrol randevusu planlanmadı"
            )}
          </p>
          <p className="mt-1 text-xs text-slate-500 dark:text-zinc-400">
            {motivation.nextAppointmentDate
              ? `Randevu: ${motivation.nextAppointmentDate}`
              : "Randevu tarihi henüz girilmedi"}
          </p>
        </div>
        <div className="flex items-center gap-1 rounded-full bg-amber-400/15 px-2.5 py-1 text-xs font-medium text-amber-600 dark:text-amber-400">
          <Flame className="size-3.5" />
          {progress}%
        </div>
      </div>

      <div className="mt-4">
        <div className="mb-2 flex items-end justify-between text-xs">
          <span className="text-slate-500 dark:text-zinc-400">
            Mevcut:{" "}
            <strong className="text-slate-800 dark:text-zinc-100">
              {motivation.current.weight} kg
            </strong>
          </span>
          <span className="text-slate-500 dark:text-zinc-400">
            Hedef:{" "}
            <strong className="text-teal-600 dark:text-teal-400">
              {motivation.targetWeight} kg · %{motivation.targetFatPercentage.toFixed(1)} yağ
            </strong>
          </span>
        </div>

        <div className="h-2.5 overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
          <div
            className="h-full rounded-full bg-gradient-to-r from-teal-500 to-amber-400 transition-all duration-500"
            style={{ width: `${progress}%` }}
          />
        </div>

        <p className="mt-2 text-xs text-slate-500 dark:text-zinc-400">
          {lostWeight.toFixed(1)} kg verildi · Hedefe {remainingWeight.toFixed(1)}{" "}
          kg kaldı
        </p>
      </div>

      <div className="mt-4 border-t border-slate-100 pt-4 dark:border-slate-800">
        <MeasurementMetricsGrid measurements={motivation} />
      </div>
    </div>
  );
}
