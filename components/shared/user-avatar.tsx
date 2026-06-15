import Image from "next/image";

import { getDefaultAvatarForGender } from "@/lib/constants/avatars";
import {
  resolveImageSrc,
  shouldSkipImageOptimization,
} from "@/lib/utils/image-src";
import type { GenderOption } from "@/lib/types/user-profile";
import { cn } from "@/lib/utils";

export function UserAvatar({
  src,
  alt,
  className,
  size = 40,
  gender,
  fallbackSrc,
}: {
  src: string;
  alt: string;
  className?: string;
  size?: number;
  gender?: GenderOption;
  fallbackSrc?: string;
}) {
  const resolvedFallback =
    fallbackSrc ?? getDefaultAvatarForGender(gender);
  const resolvedSrc = resolveImageSrc(src, resolvedFallback);

  if (!resolvedSrc) {
    return (
      <div
        className={cn(
          "absolute inset-0 flex items-center justify-center bg-slate-200 text-xs font-semibold text-slate-400 dark:bg-slate-800 dark:text-zinc-500",
          className,
        )}
        aria-label={alt}
      />
    );
  }

  const isDataUrl = resolvedSrc.startsWith("data:");

  return (
    <Image
      src={resolvedSrc}
      alt={alt}
      fill
      className={cn("object-cover", className)}
      sizes={`${size}px`}
      unoptimized={isDataUrl || shouldSkipImageOptimization(resolvedSrc)}
    />
  );
}
