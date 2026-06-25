"use client";

import { Suspense } from "react";

import { useClientDay } from "@/components/client/client-day-provider";
import { useMealUpload } from "@/components/client/meal-upload-provider";
import { useUserProfile } from "@/components/providers/user-profile-provider";
import { useResolvedFeedPostDeepLink } from "@/components/shared/use-feed-post-deep-link";

import { MealPostCard } from "@/components/client/home/meal-post-card";
import { emptyStateCardClassName } from "@/lib/utils/empty-state-card";

function MealFeedContent() {
  const { mealSections, removeMealImage, addMealComment, isMealsLoading } =
    useClientDay();
  const { openMealUpload } = useMealUpload();
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
                  onRemoveImage={
                    post.isUserCreated
                      ? (imageUrl) => void removeMealImage(post.id, imageUrl)
                      : undefined
                  }
                  onAddComment={(text) =>
                    addMealComment(post.id, text, "CLIENT", authorName)
                  }
                />
              ))}
            </div>
          ) : (
            <button
              type="button"
              onClick={() => openMealUpload({ presetMealType: mealType })}
              aria-label={`${label} öğünü ekle`}
              className={emptyStateCardClassName("group flex aspect-[4/1] w-full items-center justify-center rounded-2xl")}
            >
              <p className="text-sm text-slate-400 transition-colors group-hover:text-slate-600 dark:text-zinc-500 dark:group-hover:text-zinc-300">
                Henüz öğün eklenmedi · Dokunun
              </p>
            </button>
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
