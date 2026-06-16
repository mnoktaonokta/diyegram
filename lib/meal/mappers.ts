import type { MealTypeKey } from "@/lib/mock/client-data";
import type {
  DietitianFeedPost,
  FeedbackStatus,
} from "@/lib/mock/dietitian-data";
import type { MealComment } from "@/lib/types/meal-comments";
import type {
  ClientMealPost,
} from "@/lib/mock/client-data";
import type { Comment, MealPost, User } from "@/lib/generated/prisma/client";

import { dateToDateKey } from "@/lib/meal/date";
import { formatFeedTimeAgo } from "@/lib/meal/time-ago";
import { resolveProfileAvatarUrl } from "@/lib/profile/mappers";
import { toImageSrc } from "@/lib/utils/image-src";
import { sanitizeImageUrls } from "@/lib/types/dietitian-social";

type MealPostWithRelations = MealPost & {
  user: Pick<User, "id" | "firstName" | "lastName" | "avatarUrl" | "gender">;
  comments: Comment[];
};

export function mapComment(comment: Comment): MealComment {
  return {
    id: comment.id,
    authorRole: comment.authorRole,
    authorName: comment.authorName,
    text: comment.text,
    createdAt: comment.createdAt.toISOString(),
  };
}

export function mapMealPostToClientMealPost(
  post: MealPostWithRelations,
): ClientMealPost {
  return {
    id: post.id,
    date: dateToDateKey(post.date),
    mealType: post.mealType as MealTypeKey,
    isCheat: post.isCheat,
    isUserCreated: post.isUserCreated,
    time: post.time ?? "",
    images: sanitizeImageUrls(post.images),
    note: post.note ?? undefined,
    comments: post.comments.map(mapComment),
    feedback: post.dietitianFeedback as FeedbackStatus,
  };
}

export function mapMealPostToDietitianFeedPost(
  post: MealPostWithRelations,
): DietitianFeedPost {
  const clientName = [post.user.firstName, post.user.lastName]
    .filter(Boolean)
    .join(" ")
    .trim();

  return {
    id: post.id,
    clientId: post.user.id,
    clientName: clientName || "Danışan",
    clientAvatar: toImageSrc(
      resolveProfileAvatarUrl(
        {
          avatarUrl: post.user.avatarUrl ?? "",
          gender:
            post.user.gender === "FEMALE"
              ? "female"
              : post.user.gender === "MALE"
                ? "male"
                : "",
        },
        "CLIENT",
      ),
    ),
    mealType: post.mealType as MealTypeKey,
    isCheat: post.isCheat,
    date: dateToDateKey(post.date),
    time: post.time ?? undefined,
    timeAgo: formatFeedTimeAgo(post.createdAt),
    images: sanitizeImageUrls(post.images),
    note: post.note ?? undefined,
    feedback: post.dietitianFeedback as FeedbackStatus,
    comments: post.comments.map(mapComment),
  };
}
