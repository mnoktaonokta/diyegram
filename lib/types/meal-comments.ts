export type CommentAuthorRole = "CLIENT" | "DIETITIAN";

export type MealComment = {
  id: string;
  authorRole: CommentAuthorRole;
  authorName: string;
  text: string;
  createdAt: string;
};

export function createMealComment(
  text: string,
  authorRole: CommentAuthorRole,
  authorName: string,
  options?: { createdAt?: string; minutesAgo?: number },
): MealComment {
  let createdAt = options?.createdAt;

  if (!createdAt && options?.minutesAgo !== undefined) {
    const date = new Date();
    date.setMinutes(date.getMinutes() - options.minutesAgo);
    createdAt = date.toISOString();
  }

  return {
    id: `comment-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    authorRole,
    authorName,
    text,
    createdAt: createdAt ?? new Date().toISOString(),
  };
}
