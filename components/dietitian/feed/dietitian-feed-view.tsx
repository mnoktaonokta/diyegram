"use client";

import { useCallback, useEffect, useMemo, useState } from "react";

import { getDietitianFeedPostsAction } from "@/app/actions/meal";
import { useDietitianFeedFilter } from "@/components/dietitian/feed/dietitian-feed-filter-provider";
import { SocialFeed } from "@/components/dietitian/feed/social-feed";
import type { DietitianFeedPost } from "@/lib/mock/dietitian-data";

export function DietitianFeedView() {
  const { showCheatOnly } = useDietitianFeedFilter();
  const [posts, setPosts] = useState<DietitianFeedPost[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshToken, setRefreshToken] = useState(0);

  const loadPosts = useCallback(async (options?: { silent?: boolean }) => {
    if (!options?.silent) {
      setIsLoading(true);
    }

    const result = await getDietitianFeedPostsAction();

    if (result.success) {
      setPosts(result.data);
    } else if (!options?.silent) {
      setPosts([]);
    }

    if (!options?.silent) {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadPosts();
  }, [loadPosts, refreshToken]);

  const visiblePosts = useMemo(
    () => (showCheatOnly ? posts.filter((post) => post.isCheat) : posts),
    [posts, showCheatOnly],
  );

  if (isLoading) {
    return (
      <div className="mx-4 mt-4 rounded-2xl border border-slate-200 bg-white/60 px-6 py-12 text-center text-sm text-slate-500 dark:border-slate-800 dark:bg-slate-900/60 dark:text-zinc-400">
        Akış yükleniyor...
      </div>
    );
  }

  return (
    <SocialFeed
      posts={visiblePosts}
      cheatFilterActive={showCheatOnly}
      onMutate={() => void loadPosts({ silent: true })}
    />
  );
}
