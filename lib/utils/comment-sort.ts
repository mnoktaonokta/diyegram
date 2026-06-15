import type { MealComment } from "@/lib/types/meal-comments";

export function sortMealCommentsChronologically(
  comments: MealComment[],
): MealComment[] {
  return [...comments].sort((a, b) => {
    const timeDiff =
      new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();

    if (timeDiff !== 0) {
      return timeDiff;
    }

    return a.id.localeCompare(b.id);
  });
}
