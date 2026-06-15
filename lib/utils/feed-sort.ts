import type { DietitianFeedPost } from "@/lib/mock/dietitian-data";

export function compareFeedPostsNewestFirst(
  a: DietitianFeedPost,
  b: DietitianFeedPost,
) {
  const dateCompare = b.date.localeCompare(a.date);
  if (dateCompare !== 0) {
    return dateCompare;
  }

  return (b.time ?? "00:00").localeCompare(a.time ?? "00:00");
}

export function sortFeedPostsNewestFirst(posts: DietitianFeedPost[]) {
  return [...posts].sort(compareFeedPostsNewestFirst);
}
