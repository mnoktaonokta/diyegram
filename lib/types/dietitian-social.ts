export type DietitianSocialPost = {
  id: string;
  imageUrls: string[];
  /** @deprecated Eski kayıtlar için; imageUrls kullanın */
  imageUrl?: string;
  title: string;
  description: string;
  createdAt: string;
};

export function sanitizeImageUrls(urls: string[] | null | undefined): string[] {
  if (!urls?.length) {
    return [];
  }

  return urls
    .map((url) => (typeof url === "string" ? url.trim() : ""))
    .filter(Boolean);
}

export function getDietitianPostImages(
  post: Pick<DietitianSocialPost, "imageUrls"> & { imageUrl?: string },
): string[] {
  const fromArray = sanitizeImageUrls(post.imageUrls);

  if (fromArray.length > 0) {
    return fromArray;
  }

  if (post.imageUrl?.trim()) {
    return [post.imageUrl.trim()];
  }

  return [];
}

export function getDietitianPostCoverImage(
  post: Pick<DietitianSocialPost, "imageUrls"> & { imageUrl?: string },
): string | null {
  return getDietitianPostImages(post)[0] ?? null;
}

export type DietitianSocialMeta = {
  title: string;
  bio: string;
};

export type DietitianPublicProfile = {
  name: string;
  avatarUrl: string;
  title: string;
  bio: string;
};
