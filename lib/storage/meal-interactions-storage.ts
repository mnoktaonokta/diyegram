import type { FeedbackStatus } from "@/lib/mock/dietitian-data";
import type { MealComment } from "@/lib/types/meal-comments";

import {
  appendFeedComment,
  getCommentsForPost,
} from "@/lib/storage/feed-comments-storage";

const FEEDBACK_KEY = "diyegram:meal-feedback";

type FeedbackMap = Record<string, FeedbackStatus>;

const listeners = new Set<() => void>();

export function subscribeMealInteractions(onStoreChange: () => void) {
  listeners.add(onStoreChange);
  return () => {
    listeners.delete(onStoreChange);
  };
}

function notifyMealInteractionChange() {
  listeners.forEach((listener) => listener());
}

function loadFeedbackMap(): FeedbackMap {
  if (typeof window === "undefined") {
    return {};
  }

  try {
    const raw = window.localStorage.getItem(FEEDBACK_KEY);
    if (!raw) {
      return {};
    }

    return JSON.parse(raw) as FeedbackMap;
  } catch {
    return {};
  }
}

function saveFeedbackMap(feedback: FeedbackMap) {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.setItem(FEEDBACK_KEY, JSON.stringify(feedback));
}

export function getFeedbackForMeal(
  mealId: string,
  fallback: FeedbackStatus = "PENDING",
): FeedbackStatus {
  return loadFeedbackMap()[mealId] ?? fallback;
}

export function setFeedbackForMeal(mealId: string, feedback: FeedbackStatus) {
  const next = { ...loadFeedbackMap(), [mealId]: feedback };
  saveFeedbackMap(next);
  notifyMealInteractionChange();
}

export function getMergedCommentsForMeal(
  mealId: string,
  seedComments: MealComment[] = [],
) {
  return getCommentsForPost(mealId, seedComments);
}

export function appendDietitianComment(mealId: string, comment: MealComment) {
  appendFeedComment(mealId, comment);
  notifyMealInteractionChange();
}

export { getCommentsForPost };
