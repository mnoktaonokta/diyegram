import type {
  ProgressDailyActivity,
  ProgressHistoryPoint,
  ProgressTimeFilter,
} from "@/lib/mock/client-data";
import { daysAgoKey, parseDateKey, todayKey } from "@/lib/utils/calendar";

export type ProgressInsights = {
  totalWeightLost: number;
  totalFatLost: number;
  averageSteps: number;
  averageExerciseMinutes: number;
};

function getPeriodStart(filter: ProgressTimeFilter) {
  if (filter === "week") {
    return daysAgoKey(6);
  }

  if (filter === "month") {
    return daysAgoKey(29);
  }

  return null;
}

function isWithinPeriod(date: string, filter: ProgressTimeFilter) {
  const start = getPeriodStart(filter);
  if (!start) {
    return true;
  }

  return date >= start && date <= todayKey();
}

export function filterProgressHistory(
  history: ProgressHistoryPoint[],
  filter: ProgressTimeFilter,
  programStartedAt?: string,
) {
  const scoped = programStartedAt
    ? history.filter((point) => point.date >= programStartedAt)
    : history;

  const filtered = scoped.filter((point) => isWithinPeriod(point.date, filter));

  if (filtered.length >= 2) {
    return filtered;
  }

  if (scoped.length >= 2) {
    return [scoped[0]!, scoped[scoped.length - 1]!];
  }

  return scoped;
}

export function filterProgressActivity(
  activity: ProgressDailyActivity[],
  filter: ProgressTimeFilter,
  programStartedAt?: string,
) {
  const scoped = programStartedAt
    ? activity.filter((entry) => entry.date >= programStartedAt)
    : activity;

  return scoped.filter((entry) => isWithinPeriod(entry.date, filter));
}

export function computeProgressInsights(
  history: ProgressHistoryPoint[],
  activity: ProgressDailyActivity[],
  filter: ProgressTimeFilter,
  programStartedAt?: string,
): ProgressInsights {
  const filteredHistory = filterProgressHistory(
    history,
    filter,
    programStartedAt,
  );
  const filteredActivity = filterProgressActivity(
    activity,
    filter,
    programStartedAt,
  );

  const first = filteredHistory[0];
  const last = filteredHistory[filteredHistory.length - 1];

  const totalWeightLost =
    first && last ? Math.max(0, first.weight - last.weight) : 0;
  const totalFatLost =
    first && last ? Math.max(0, first.fatPercentage - last.fatPercentage) : 0;

  const averageSteps =
    filteredActivity.length > 0
      ? Math.round(
          filteredActivity.reduce((sum, entry) => sum + entry.steps, 0) /
            filteredActivity.length,
        )
      : 0;

  const averageExerciseMinutes =
    filteredActivity.length > 0
      ? Math.round(
          filteredActivity.reduce(
            (sum, entry) => sum + entry.exerciseMinutes,
            0,
          ) / filteredActivity.length,
        )
      : 0;

  return {
    totalWeightLost,
    totalFatLost,
    averageSteps,
    averageExerciseMinutes,
  };
}

export function formatChartDateLabel(dateKey: string) {
  return new Intl.DateTimeFormat("tr-TR", {
    day: "numeric",
    month: "short",
  }).format(parseDateKey(dateKey));
}

export function getJourneyDayCount(journeyStartDate: string) {
  const start = parseDateKey(journeyStartDate);
  const today = parseDateKey(todayKey());
  start.setHours(0, 0, 0, 0);
  today.setHours(0, 0, 0, 0);

  const diffMs = today.getTime() - start.getTime();
  return Math.max(1, Math.ceil(diffMs / (1000 * 60 * 60 * 24)) + 1);
}

export function getProgramDayLabel(
  programStartedAt: string,
  targetDate: string,
) {
  if (targetDate === todayKey()) {
    return "Bugün";
  }

  const start = parseDateKey(programStartedAt);
  const target = parseDateKey(targetDate);
  start.setHours(0, 0, 0, 0);
  target.setHours(0, 0, 0, 0);

  const diffMs = target.getTime() - start.getTime();
  const day = Math.max(1, Math.floor(diffMs / (1000 * 60 * 60 * 24)) + 1);

  if (day <= 1) {
    return "1. Gün";
  }

  return `${day}. Gün`;
}

export function getMaxConsecutiveWaterGoalDays(
  activity: Array<{ waterGlasses: number }>,
  goal = 6,
) {
  let max = 0;
  let current = 0;

  for (const entry of activity) {
    if (entry.waterGlasses >= goal) {
      current += 1;
      max = Math.max(max, current);
    } else {
      current = 0;
    }
  }

  return max;
}

export function getMaxConsecutiveExerciseDays(
  activity: Array<{ exerciseMinutes: number }>,
) {
  let max = 0;
  let current = 0;

  for (const entry of activity) {
    if (entry.exerciseMinutes > 0) {
      current += 1;
      max = Math.max(max, current);
    } else {
      current = 0;
    }
  }

  return max;
}
