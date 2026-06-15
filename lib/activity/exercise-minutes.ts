import type { DailyExerciseEntry } from "@/lib/mock/client-data";

export function parseExerciseMinutes(detail: string) {
  const match = detail.match(/(\d+)/);
  if (!match) {
    return 0;
  }

  return Number.parseInt(match[1]!, 10);
}

export function sumExerciseMinutes(
  exercises: Pick<DailyExerciseEntry, "detail">[],
) {
  return exercises.reduce((total, exercise) => {
    return total + parseExerciseMinutes(exercise.detail);
  }, 0);
}
