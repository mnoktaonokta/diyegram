import type { StaticImageData } from "next/image";
import Image from "next/image";

import { getDefaultAvatarForGender } from "@/lib/constants/avatars";
import {
  isStaticImageData,
  resolveImageSrc,
  shouldSkipImageOptimization,
} from "@/lib/utils/image-src";
import type { GenderOption } from "@/lib/types/user-profile";
import { cn } from "@/lib/utils";

function resolveAvatarSource(
  src: string | StaticImageData | null | undefined,
  gender?: GenderOption,
  fallbackSrc?: string | StaticImageData,
): string | StaticImageData {
  if (isStaticImageData(src)) {
    return src;
  }

  const trimmed = typeof src === "string" ? src.trim() : "";
  if (trimmed) {
    return trimmed;
  }

  if (fallbackSrc) {
    return fallbackSrc;
  }

  return getDefaultAvatarForGender(gender);
}

export function UserAvatar({
  src,
  alt,
  className,
  size = 40,
  gender,
  fallbackSrc,
}: {
  src?: string | StaticImageData | null;
  alt: string;
  className?: string;
  size?: number;
  gender?: GenderOption;
  fallbackSrc?: string | StaticImageData;
}) {
  const finalSrc = resolveAvatarSource(src, gender, fallbackSrc);

  if (!finalSrc) {
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

  const isDataUrl =
    typeof finalSrc === "string" && finalSrc.startsWith("data:");

  return (
    <Image
      src={finalSrc}
      alt={alt}
      fill
      className={cn("object-cover", className)}
      sizes={`${size}px`}
      unoptimized={
        isDataUrl ||
        (typeof finalSrc === "string" && shouldSkipImageOptimization(finalSrc))
      }
    />
  );
}
