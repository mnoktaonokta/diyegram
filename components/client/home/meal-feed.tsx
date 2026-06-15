"use client";

import { Suspense } from "react";

import { useClientDay } from "@/components/client/client-day-provider";
import { useUserProfile } from "@/components/providers/user-profile-provider";
import { useResolvedFeedPostDeepLink } from "@/components/shared/use-feed-post-deep-link";

import { MealPostCard } from "@/components/client/home/meal-post-card";

function MealFeedContent() {
  const { mealSections, removeMeal, addMealComment, isMealsLoading } =
    useClientDay();
  const { firstName, displayName } = useUserProfile();
  const authorName = firstName || displayName;

  const posts = mealSections.flatMap((section) => section.posts);
  const highlightPostId = useResolvedFeedPostDeepLink(posts);

  if (isMealsLoading) {
    return (
      <section className="mt-6 px-4 pb-4">
        <div className="rounded-2xl border border-slate-200 bg-white/60 px-6 py-10 text-center text-sm text-slate-500 dark:border-slate-800 dark:bg-slate-900/60 dark:text-zinc-400">
          Öğünler yükleniyor...
        </div>
      </section>
    );
  }

  return (
    <section className="mt-6 space-y-6 px-4 pb-4">
      {mealSections.map(({ mealType, label, posts }) => (
        <div key={mealType} className="space-y-3">
          <h2 className="text-sm font-bold tracking-wide text-slate-800 dark:text-zinc-100">
            {label}
          </h2>

          {posts.length > 0 ? (
            <div className="space-y-3">
              {posts.map((post) => (
                <MealPostCard
                  key={post.id}
                  post={post}
                  isHighlighted={post.id === highlightPostId}
                  onDelete={
                    post.isUserCreated
                      ? () => void removeMeal(post.id)
                      : undefined
                  }
                  onAddComment={(text) =>
                    addMealComment(post.id, text, "CLIENT", authorName)
                  }
                />
              ))}
            </div>
          ) : (
            <div className="flex aspect-[4/1] items-center justify-center rounded-2xl border border-dashed border-slate-200 bg-white/60 dark:border-slate-800 dark:bg-slate-900/60">
              <p className="text-sm text-slate-400 dark:text-zinc-500">
                Henüz öğün eklenmedi
              </p>
            </div>
          )}
        </div>
      ))}
    </section>
  );
}

export function MealFeed() {
  return (
    <Suspense fallback={null}>
      <MealFeedContent />
    </Suspense>
  );
}
