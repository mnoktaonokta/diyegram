"use client";

import { useEffect, useMemo } from "react";
import { useSearchParams } from "next/navigation";

import { resolveDeepLinkPostId } from "@/lib/utils/feed-deep-link";

type DeepLinkPost = {
  id: string;
  mealType: string;
  isCheat: boolean;
};

export function useResolvedFeedPostDeepLink(posts: DeepLinkPost[]) {
  const searchParams = useSearchParams();
  const requestedPostId = searchParams.get("post");

  const highlightPostId = useMemo(
    () => resolveDeepLinkPostId(posts, requestedPostId),
    [posts, requestedPostId],
  );

  useEffect(() => {
    if (!highlightPostId) {
      return;
    }

    function scrollToPost() {
      document
        .getElementById(`feed-post-${highlightPostId}`)
        ?.scrollIntoView({ behavior: "smooth", block: "center" });
    }

    const frame = requestAnimationFrame(scrollToPost);
    const retry = window.setTimeout(scrollToPost, 350);
    const lateRetry = window.setTimeout(scrollToPost, 900);

    return () => {
      cancelAnimationFrame(frame);
      window.clearTimeout(retry);
      window.clearTimeout(lateRetry);
    };
  }, [highlightPostId, posts]);

  return highlightPostId;
}
