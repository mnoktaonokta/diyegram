import type { ProgressAchievementDefinition } from "@/lib/mock/client-data";
import {
  getMaxConsecutiveExerciseDays,
  getMaxConsecutiveWaterGoalDays,
  getJourneyDayCount,
} from "@/lib/utils/progress-analytics";

export type ProgressAchievementContext = {
  weightLostFromStart: number;
  fatLostFromStart: number;
  journeyStartDate: string;
  dailyActivity: Array<{
    waterGlasses: number;
    exerciseMinutes: number;
  }>;
};

export function isAchievementUnlocked(
  achievementId: string,
  context: ProgressAchievementContext,
) {
  switch (achievementId) {
    case "first-3kg":
      return context.weightLostFromStart >= 3;
    case "first-5kg":
      return context.weightLostFromStart >= 5;
    case "one-month":
      return getJourneyDayCount(context.journeyStartDate) >= 30;
    case "water-champion":
      return getMaxConsecutiveWaterGoalDays(context.dailyActivity) >= 7;
    case "fat-milestone":
      return context.fatLostFromStart >= 3;
    case "consistency":
      return getMaxConsecutiveExerciseDays(context.dailyActivity) >= 7;
    default:
      return false;
  }
}

export function resolveAchievementTitle(
  achievement: ProgressAchievementDefinition,
  _context: ProgressAchievementContext,
) {
  return achievement.title;
}

export function buildAchievementStates(
  definitions: ProgressAchievementDefinition[],
  context: ProgressAchievementContext,
) {
  return definitions.map((achievement) => {
    const unlocked = isAchievementUnlocked(achievement.id, context);

    return {
      ...achievement,
      title: unlocked
        ? resolveAchievementTitle(achievement, context)
        : achievement.title,
      unlocked,
    };
  });
}
