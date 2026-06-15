type DeepLinkPost = {
  id: string;
  mealType: string;
  isCheat: boolean;
};

export function resolveDeepLinkPostId(
  posts: DeepLinkPost[],
  postId: string | null | undefined,
): string | null {
  if (!postId) {
    return null;
  }

  if (posts.some((post) => post.id === postId)) {
    return postId;
  }

  return null;
}
