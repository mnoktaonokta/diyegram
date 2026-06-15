"use client";

import { Suspense } from "react";

import { FeedCard } from "@/components/dietitian/feed/feed-card";
import type { DietitianFeedPost } from "@/lib/mock/dietitian-data";
import { useResolvedFeedPostDeepLink } from "@/components/shared/use-feed-post-deep-link";

function SocialFeedContent({
  posts,
  cheatFilterActive = false,
  onMutate,
}: {
  posts: DietitianFeedPost[];
  cheatFilterActive?: boolean;
  onMutate?: () => void;
}) {
  const highlightPostId = useResolvedFeedPostDeepLink(posts);

  if (posts.length === 0) {
    return (
      <div className="mx-4 mt-4 rounded-2xl border border-dashed border-slate-200 bg-white/60 px-6 py-12 text-center dark:border-slate-800 dark:bg-slate-900/60">
        <p className="text-3xl">🚨</p>
        <p className="mt-3 text-sm font-medium text-slate-600 dark:text-zinc-400">
          {cheatFilterActive
            ? "Henüz kaçamak itirafı paylaşılmamış"
            : "Akışta gönderi bulunamadı"}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4 px-4 pt-4">
      {posts.map((post) => (
        <FeedCard
          key={post.id}
          post={post}
          isHighlighted={post.id === highlightPostId}
          onMutate={onMutate}
        />
      ))}
    </div>
  );
}

export function SocialFeed({
  posts,
  cheatFilterActive = false,
  onMutate,
}: {
  posts: DietitianFeedPost[];
  cheatFilterActive?: boolean;
  onMutate?: () => void;
}) {
  return (
    <Suspense
      fallback={
        <div className="px-4 pt-4 text-sm text-slate-500 dark:text-zinc-400">
          Akış yükleniyor...
        </div>
      }
    >
      <SocialFeedContent
        posts={posts}
        cheatFilterActive={cheatFilterActive}
        onMutate={onMutate}
      />
    </Suspense>
  );
}
