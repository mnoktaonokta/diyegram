import type { DietitianSocialPost } from "@/lib/types/dietitian-social";

const HASHTAG_PATTERN = /#([\p{L}\p{N}_]+)/gu;

export function normalizeHashtag(tag: string) {
  return tag.replace(/^#/, "").toLocaleLowerCase("tr");
}

export function extractHashtags(text: string) {
  const tags = new Set<string>();

  for (const match of text.matchAll(HASHTAG_PATTERN)) {
    const value = match[1];
    if (value) {
      tags.add(normalizeHashtag(value));
    }
  }

  return Array.from(tags);
}

export function filterPostsByHashtag(
  posts: DietitianSocialPost[],
  hashtag: string,
) {
  const normalized = normalizeHashtag(hashtag);

  return posts.filter((post) =>
    extractHashtags(post.description).includes(normalized),
  );
}

export type HashtagTextSegment =
  | { type: "text"; value: string }
  | { type: "hashtag"; value: string; tag: string };

export function parseHashtagSegments(text: string): HashtagTextSegment[] {
  const segments: HashtagTextSegment[] = [];
  let lastIndex = 0;

  for (const match of text.matchAll(HASHTAG_PATTERN)) {
    const index = match.index ?? 0;
    const rawTag = match[0];
    const tag = match[1];

    if (!tag || !rawTag) {
      continue;
    }

    if (index > lastIndex) {
      segments.push({ type: "text", value: text.slice(lastIndex, index) });
    }

    segments.push({ type: "hashtag", value: rawTag, tag });
    lastIndex = index + rawTag.length;
  }

  if (lastIndex < text.length) {
    segments.push({ type: "text", value: text.slice(lastIndex) });
  }

  return segments;
}
