"use client";

import { useEffect, useState } from "react";

import { useDietitianSocialProfile } from "@/components/dietitian/social/use-dietitian-social-profile";
import { useUserProfile } from "@/components/providers/user-profile-provider";
import type { ClientMealPost } from "@/lib/mock/client-data";
import { CLIENT_QUICK_COMMENT_TEMPLATES } from "@/lib/mock/dietitian-data";

import { MealCommentThread } from "@/components/shared/meal-comment-thread";
import { ImageCarousel } from "@/components/shared/image-carousel";
import { Heart, ThumbsDown, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { getValidImageUrls } from "@/lib/utils/image-src";

export function MealPostCard({
  post,
  onRemoveImage,
  onAddComment,
  isHighlighted = false,
}: {
  post: ClientMealPost;
  onRemoveImage?: (imageUrl: string) => void;
  onAddComment: (text: string) => void | Promise<void>;
  isHighlighted?: boolean;
}) {
  const feedback = post.feedback ?? "PENDING";
  const dietitian = useDietitianSocialProfile();
  const { firstName, displayName } = useUserProfile();
  const currentAuthorName = firstName || displayName || "Danışan";
  const validImages = getValidImageUrls(post.images);
  const hasImages = validImages.length > 0;
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  useEffect(() => {
    setCurrentImageIndex((index) =>
      validImages.length === 0 ? 0 : Math.min(index, validImages.length - 1),
    );
  }, [validImages.length]);

  function handleRemoveImage() {
    const imageUrl = validImages[currentImageIndex];

    if (imageUrl) {
      onRemoveImage?.(imageUrl);
    }
  }

  return (
    <article
      id={`feed-post-${post.id}`}
      className={cn(
        "relative overflow-hidden rounded-2xl bg-white shadow-sm transition-shadow dark:bg-slate-900",
        post.isCheat
          ? "border-2 border-rose-500"
          : "border border-slate-200/80 dark:border-slate-800",
        isHighlighted &&
          "ring-2 ring-teal-500 ring-offset-2 ring-offset-slate-50 dark:ring-offset-slate-950",
      )}
    >
      {post.isCheat ? (
        <div className="flex items-center gap-2 border-b border-rose-500/20 bg-rose-500/10 px-4 py-2 text-xs font-semibold text-rose-600 dark:text-rose-400">
          🚨 Kaçamak İtirafı
        </div>
      ) : null}

      {post.isUserCreated && hasImages && onRemoveImage ? (
        <button
          type="button"
          onClick={handleRemoveImage}
          aria-label="Fotoğrafı sil"
          className={cn(
            "absolute right-3 z-10 flex size-8 items-center justify-center rounded-full bg-black/50 text-white backdrop-blur-sm transition-colors hover:bg-black/70",
            post.isCheat ? "top-11" : "top-3",
          )}
        >
          <Trash2 className="size-3.5" />
        </button>
      ) : null}

      {hasImages ? (
        <ImageCarousel
          images={post.images}
          altPrefix={post.mealType}
          onSlideChange={setCurrentImageIndex}
        />
      ) : null}

      <div className="flex items-center justify-between px-4 py-3">
        <p className="text-xs text-slate-500 dark:text-zinc-400">{post.time}</p>
        {validImages.length > 1 ? (
          <p className="text-xs text-slate-400 dark:text-zinc-500">
            {validImages.length} fotoğraf
          </p>
        ) : null}
      </div>

      {post.note ? (
        <p className="px-4 pb-3 text-sm leading-relaxed text-slate-700 dark:text-zinc-300">
          {post.note}
        </p>
      ) : null}

      {feedback === "LIKED" || feedback === "DISLIKED" ? (
        <div className="flex flex-wrap gap-2 px-4 pb-3">
          {feedback === "LIKED" ? (
            <span className="inline-flex items-center gap-1.5 rounded-full bg-teal-500/10 px-3 py-1 text-xs font-semibold text-teal-700 dark:text-teal-300">
              <Heart className="size-3.5 fill-current" />
              Diyetisyen beğendi
            </span>
          ) : null}
          {feedback === "DISLIKED" ? (
            <span className="inline-flex items-center gap-1.5 rounded-full bg-slate-200/80 px-3 py-1 text-xs font-semibold text-slate-700 dark:bg-slate-700 dark:text-zinc-200">
              <ThumbsDown className="size-3.5" />
              Pek olmamış
            </span>
          ) : null}
        </div>
      ) : null}

      <MealCommentThread
        comments={post.comments}
        onAddComment={onAddComment}
        quickTemplates={CLIENT_QUICK_COMMENT_TEMPLATES}
        currentAuthorRole="CLIENT"
        currentAuthorName={currentAuthorName}
        dietitianProfileHref="/client/dietitian-profile"
        dietitianAvatarUrl={
          dietitian.avatarUrl.trim() || undefined
        }
        dietitianDisplayName={dietitian.name}
      />
    </article>
  );
}
