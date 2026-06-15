"use client";

import { Suspense } from "react";

import { FeedCard } from "@/components/dietitian/feed/feed-card";
import type { DietitianFeedPost } from "@/lib/mock/dietitian-data";
import { groupPostsByMealType } from "@/lib/mock/dietitian-data";
import { useResolvedFeedPostDeepLink } from "@/components/shared/use-feed-post-deep-link";

function DietitianDailyMealFeedContent({
  posts,
  onMutate,
}: {
  posts: DietitianFeedPost[];
  onMutate?: () => void;
}) {
  const highlightPostId = useResolvedFeedPostDeepLink(posts);

  if (posts.length === 0) {
    return (
      <div className="mx-4 mt-6 rounded-2xl border border-dashed border-slate-200 bg-white/60 px-6 py-14 text-center dark:border-slate-800 dark:bg-slate-900/60">
        <p className="text-4xl">📅</p>
        <p className="mt-3 text-sm font-medium text-slate-600 dark:text-zinc-400">
          Bu güne ait veri girilmedi
        </p>
        <p className="mt-1 text-xs text-slate-400 dark:text-zinc-500">
          Danışan bu tarihte öğün paylaşmamış
        </p>
      </div>
    );
  }

  const sections = groupPostsByMealType(posts).filter(
    (section) => section.posts.length > 0,
  );

  return (
    <section className="mt-6 space-y-6 px-4 pb-6">
      {sections.map(({ mealType, label, posts: sectionPosts }) => (
        <div key={mealType} className="space-y-3">
          <h2 className="text-sm font-bold tracking-wide text-slate-800 dark:text-zinc-100">
            {label}
          </h2>
          <div className="space-y-4">
            {sectionPosts.map((post) => (
              <FeedCard
                key={post.id}
                post={post}
                showClientHeader={false}
                isHighlighted={post.id === highlightPostId}
                onMutate={onMutate}
              />
            ))}
          </div>
        </div>
      ))}
    </section>
  );
}

export function DietitianDailyMealFeed({
  posts,
  onMutate,
}: {
  posts: DietitianFeedPost[];
  onMutate?: () => void;
}) {
  return (
    <Suspense fallback={null}>
      <DietitianDailyMealFeedContent posts={posts} onMutate={onMutate} />
    </Suspense>
  );
}
