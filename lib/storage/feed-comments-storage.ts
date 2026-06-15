import type { MealComment } from "@/lib/types/meal-comments";
import { sortMealCommentsChronologically } from "@/lib/utils/comment-sort";

const FEED_COMMENTS_KEY = "diyegram:feed-comments";

export type FeedCommentsMap = Record<string, MealComment[]>;

export function loadFeedComments(): FeedCommentsMap {
  if (typeof window === "undefined") {
    return {};
  }

  try {
    const raw = window.localStorage.getItem(FEED_COMMENTS_KEY);
    if (!raw) {
      return {};
    }

    return JSON.parse(raw) as FeedCommentsMap;
  } catch {
    return {};
  }
}

export function saveFeedComments(comments: FeedCommentsMap) {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.setItem(FEED_COMMENTS_KEY, JSON.stringify(comments));
}

export function getCommentsForPost(
  postId: string,
  seedComments: MealComment[] = [],
): MealComment[] {
  const stored = loadFeedComments()[postId] ?? [];
  return sortMealCommentsChronologically([...seedComments, ...stored]);
}

export function appendFeedComment(postId: string, comment: MealComment) {
  const all = loadFeedComments();
  const next = sortMealCommentsChronologically([
    ...(all[postId] ?? []),
    comment,
  ]);
  saveFeedComments({ ...all, [postId]: next });
  return next;
}
