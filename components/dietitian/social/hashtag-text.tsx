"use client";

import { parseHashtagSegments } from "@/lib/utils/dietitian-hashtags";
import { cn } from "@/lib/utils";

export function HashtagText({
  text,
  onHashtagClick,
  className,
}: {
  text: string;
  onHashtagClick?: (hashtag: string) => void;
  className?: string;
}) {
  const segments = parseHashtagSegments(text);

  if (segments.length === 0) {
    return null;
  }

  return (
    <p className={cn("whitespace-pre-line leading-relaxed", className)}>
      {segments.map((segment, index) =>
        segment.type === "hashtag" ? (
          <button
            key={`${segment.tag}-${index}`}
            type="button"
            onClick={() => onHashtagClick?.(segment.tag)}
            className={cn(
              "font-semibold text-teal-600 transition-colors hover:text-teal-500",
              "dark:text-teal-400 dark:hover:text-teal-300",
              onHashtagClick ? "cursor-pointer" : "cursor-default",
            )}
          >
            {segment.value}
          </button>
        ) : (
          <span key={`text-${index}`}>{segment.value}</span>
        ),
      )}
    </p>
  );
}
