"use client";

import { useEffect, useState, useTransition } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Heart, ThumbsDown } from "lucide-react";
import { toast } from "sonner";

import {
  createMealCommentAction,
  updateMealFeedbackAction,
} from "@/app/actions/meal";
import { MealCommentThread } from "@/components/shared/meal-comment-thread";
import { ImageCarousel } from "@/components/shared/image-carousel";
import { UserAvatar } from "@/components/shared/user-avatar";
import { MEAL_TYPE_LABELS } from "@/lib/mock/client-data";
import type { DietitianFeedPost } from "@/lib/mock/dietitian-data";
import { QUICK_COMMENT_TEMPLATES } from "@/lib/mock/dietitian-data";
import { cn } from "@/lib/utils";

export function FeedCard({
  post,
  showClientHeader = true,
  compact = false,
  isHighlighted = false,
  onMutate,
}: {
  post: DietitianFeedPost;
  showClientHeader?: boolean;
  compact?: boolean;
  isHighlighted?: boolean;
  onMutate?: () => void;
}) {
  const [feedback, setFeedback] = useState(post.feedback);
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    setFeedback(post.feedback);
  }, [post.feedback, post.id]);
  const isCheat = post.isCheat;

  function handleMutate(nextFeedback?: typeof feedback) {
    if (nextFeedback) {
      setFeedback(nextFeedback);
    }
    onMutate?.();
  }

  function handleAddComment(text: string) {
    startTransition(async () => {
      const result = await createMealCommentAction(post.id, text);

      if (!result.success) {
        toast.error(result.error);
        return;
      }

      handleMutate();
    });
  }

  function toggleLike() {
    const next = feedback === "LIKED" ? "PENDING" : "LIKED";

    startTransition(async () => {
      const result = await updateMealFeedbackAction(post.id, next);

      if (!result.success) {
        toast.error(result.error);
        return;
      }

      handleMutate(result.data.feedback);
    });
  }

  function toggleDislike() {
    const next = feedback === "DISLIKED" ? "PENDING" : "DISLIKED";

    startTransition(async () => {
      const result = await updateMealFeedbackAction(post.id, next);

      if (!result.success) {
        toast.error(result.error);
        return;
      }

      handleMutate(result.data.feedback);
    });
  }

  return (
    <article
      id={`feed-post-${post.id}`}
      className={cn(
        "relative overflow-hidden rounded-2xl bg-white shadow-sm transition-shadow dark:bg-slate-900",
        isCheat
          ? "border-2 border-rose-500"
          : "border border-slate-200/80 dark:border-slate-800",
        isHighlighted &&
          "ring-2 ring-teal-500 ring-offset-2 ring-offset-slate-50 dark:ring-offset-slate-950",
        isPending && "opacity-80",
      )}
    >
      {isCheat ? (
        <span className="absolute right-3 top-3 z-10 flex size-9 items-center justify-center rounded-full bg-rose-500 text-lg shadow-md">
          🚨
        </span>
      ) : null}

      {showClientHeader ? (
        <div className="flex items-center gap-3 px-4 py-3">
          <Link
            href={`/dietitian/client/${post.clientId}`}
            className="relative size-10 shrink-0 overflow-hidden rounded-full ring-2 ring-teal-500/20"
          >
            <UserAvatar
              src={post.clientAvatar}
              alt={post.clientName}
              size={40}
            />
          </Link>
          <div className="min-w-0 flex-1">
            <Link
              href={`/dietitian/client/${post.clientId}`}
              className="block truncate text-sm font-bold text-slate-800 hover:text-teal-600 dark:text-zinc-100 dark:hover:text-teal-400"
            >
              {post.clientName}
            </Link>
            <p className="text-xs text-slate-500 dark:text-zinc-400">
              {post.timeAgo} · {MEAL_TYPE_LABELS[post.mealType]}
            </p>
          </div>
        </div>
      ) : (
        <div className="px-4 pt-3">
          <p className="text-xs text-slate-500 dark:text-zinc-400">
            {post.time ?? post.timeAgo} · {MEAL_TYPE_LABELS[post.mealType]}
          </p>
        </div>
      )}

      <ImageCarousel
        images={post.images}
        altPrefix={`${post.clientName} ${post.mealType}`}
        aspectClass={compact ? "aspect-square" : "aspect-[4/3]"}
      />

      {post.note ? (
        <p className="px-4 py-3 text-sm leading-relaxed text-slate-700 dark:text-zinc-300">
          {post.note}
        </p>
      ) : null}

      <div className="flex items-center gap-2 border-t border-slate-100 px-4 py-3 dark:border-slate-800">
        <motion.button
          type="button"
          whileTap={{ scale: 0.96 }}
          onClick={toggleLike}
          disabled={isPending}
          aria-label="Beğen"
          className={cn(
            "flex size-9 items-center justify-center rounded-full transition-colors",
            feedback === "LIKED"
              ? "bg-teal-500/15 text-teal-600 dark:text-teal-400"
              : "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-zinc-400",
          )}
        >
          <Heart
            className={cn("size-4", feedback === "LIKED" && "fill-current")}
          />
        </motion.button>

        <motion.button
          type="button"
          whileTap={{ scale: 0.96 }}
          onClick={toggleDislike}
          disabled={isPending}
          aria-label="Pek olmamış"
          className={cn(
            "flex size-9 items-center justify-center rounded-full transition-colors",
            feedback === "DISLIKED"
              ? "bg-slate-200 text-slate-800 dark:bg-slate-700 dark:text-zinc-100"
              : "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-zinc-400",
          )}
        >
          <ThumbsDown className="size-4" />
        </motion.button>
      </div>

      <MealCommentThread
        comments={post.comments}
        onAddComment={handleAddComment}
        quickTemplates={QUICK_COMMENT_TEMPLATES}
        currentAuthorRole="DIETITIAN"
      />
    </article>
  );
}
