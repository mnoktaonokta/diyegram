"use client";

import { useMemo, useState } from "react";
import { ChartLine } from "lucide-react";

import { ClientDataSkeleton } from "@/components/client/client-data-skeleton";
import { useClientClinicalData } from "@/components/client/clinical/use-client-clinical-data";
import { ProgressAchievementsGrid } from "@/components/client/progress/progress-achievements-grid";
import { ProgressInsightCards } from "@/components/client/progress/progress-insight-cards";
import { ProgressTimeFilterTabs } from "@/components/client/progress/progress-time-filter";
import { ProgressTrendChart } from "@/components/client/progress/progress-trend-chart";
import { ProgressVisualGallery } from "@/components/client/progress/progress-visual-gallery";
import { useClientProgressData } from "@/components/client/progress/use-client-progress-data";
import {
  PROGRESS_ACHIEVEMENT_DEFINITIONS,
  type ProgressTimeFilter,
} from "@/lib/mock/client-data";
import { buildAchievementStates } from "@/lib/utils/progress-achievements";
import {
  computeProgressInsights,
  filterProgressHistory,
} from "@/lib/utils/progress-analytics";

export function ClientProgressView() {
  const { clinical, isLoading: isClinicalLoading } = useClientClinicalData();
  const {
    history,
    activity,
    isLoading: isProgressLoading,
  } = useClientProgressData();
  const [timeFilter, setTimeFilter] = useState<ProgressTimeFilter>("month");

  const isLoading = isClinicalLoading || isProgressLoading || !clinical;

  const insights = useMemo(() => {
    if (!clinical) {
      return {
        totalWeightLost: 0,
        totalFatLost: 0,
        averageSteps: 0,
        averageExerciseMinutes: 0,
      };
    }

    return computeProgressInsights(
      history,
      activity,
      timeFilter,
      clinical.programStartedAt,
    );
  }, [activity, clinical, history, timeFilter]);

  const chartData = useMemo(() => {
    if (!clinical) {
      return [];
    }

    return filterProgressHistory(history, timeFilter, clinical.programStartedAt);
  }, [clinical, history, timeFilter]);

  const achievements = useMemo(() => {
    if (!clinical) {
      return [];
    }

    return buildAchievementStates(PROGRESS_ACHIEVEMENT_DEFINITIONS, {
      weightLostFromStart: clinical.start.weight - clinical.current.weight,
      fatLostFromStart:
        clinical.start.fatPercentage - clinical.current.fatPercentage,
      journeyStartDate: clinical.programStartedAt,
      dailyActivity: activity,
    });
  }, [activity, clinical]);

  if (isLoading) {
    return (
      <div className="space-y-5 px-4 pb-6 pt-4">
        <ClientDataSkeleton rows={2} />
        <ClientDataSkeleton rows={4} />
        <ClientDataSkeleton rows={5} />
      </div>
    );
  }

  return (
    <div className="space-y-5 px-4 pb-6 pt-4">
      <header className="flex items-center gap-3">
        <div className="flex size-12 items-center justify-center rounded-2xl bg-amber-400/15 text-amber-600 dark:text-amber-400">
          <ChartLine className="size-6" />
        </div>
        <div>
          <h1 className="text-xl font-bold text-slate-800 dark:text-zinc-100">
            Gelişimim
          </h1>
          <p className="text-sm text-slate-500 dark:text-zinc-400">
            Uzun vadeli yolculuğunun analitik özeti
          </p>
        </div>
      </header>

      <ProgressTimeFilterTabs value={timeFilter} onChange={setTimeFilter} />
      <ProgressInsightCards insights={insights} />

      <section className="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <div className="mb-4 flex items-center justify-between gap-3">
          <div>
            <h2 className="text-sm font-bold text-slate-800 dark:text-zinc-100">
              Kilo ve Yağ Trendi
            </h2>
            <p className="mt-0.5 text-xs text-slate-500 dark:text-zinc-400">
              Mavi: kilo · Yeşil: yağ oranı
            </p>
          </div>
          <div className="flex items-center gap-3 text-[10px] font-semibold">
            <span className="inline-flex items-center gap-1 text-sky-500">
              <span className="size-2 rounded-full bg-sky-400" />
              Kilo
            </span>
            <span className="inline-flex items-center gap-1 text-emerald-500">
              <span className="size-2 rounded-full bg-emerald-400" />
              Yağ
            </span>
          </div>
        </div>
        <ProgressTrendChart data={chartData} />
      </section>

      <ProgressVisualGallery programStartedAt={clinical.programStartedAt} />
      <ProgressAchievementsGrid achievements={achievements} />
    </div>
  );
}
