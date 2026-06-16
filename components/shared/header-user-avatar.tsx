"use client";

import type { StaticImageData } from "next/image";

import { useOptionalUserProfile } from "@/components/providers/user-profile-provider";
import { UserAvatar } from "@/components/shared/user-avatar";
import { cn } from "@/lib/utils";

export function HeaderUserAvatar({
  name,
  avatarUrl,
  size = "sm",
}: {
  name: string;
  avatarUrl?: string | StaticImageData | null;
  size?: "sm" | "md";
}) {
  const userProfile = useOptionalUserProfile();
  const displayName = userProfile?.displayName ?? name;
  const dimension = size === "sm" ? "size-9" : "size-10";
  const resolvedSrc = avatarUrl ?? userProfile?.avatarUrl;
  const imageSrc =
    typeof resolvedSrc === "string"
      ? resolvedSrc.trim() || undefined
      : resolvedSrc;

  return (
    <div
      className={cn(
        "relative shrink-0 overflow-hidden rounded-full ring-2 ring-teal-500/30",
        dimension,
      )}
      aria-hidden
    >
      <UserAvatar
        src={imageSrc}
        alt={displayName}
        size={size === "sm" ? 36 : 40}
        gender={userProfile?.profile?.gender}
      />
    </div>
  );
}
