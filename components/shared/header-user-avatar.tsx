"use client";

import { getDefaultAvatarForGender } from "@/lib/constants/avatars";
import { useOptionalUserProfile } from "@/components/providers/user-profile-provider";
import { UserAvatar } from "@/components/shared/user-avatar";
import { cn } from "@/lib/utils";

export function HeaderUserAvatar({
  name,
  avatarUrl,
  size = "sm",
}: {
  name: string;
  avatarUrl: string;
  size?: "sm" | "md";
}) {
  const userProfile = useOptionalUserProfile();
  const displayName = userProfile?.displayName ?? name;
  const resolvedAvatarUrl =
    userProfile?.avatarUrl?.trim() ||
    avatarUrl.trim() ||
    getDefaultAvatarForGender(userProfile?.profile?.gender);
  const dimension = size === "sm" ? "size-9" : "size-10";

  return (
    <div
      className={cn(
        "relative shrink-0 overflow-hidden rounded-full ring-2 ring-teal-500/30",
        dimension,
      )}
      aria-hidden
    >
      <UserAvatar
        src={resolvedAvatarUrl}
        alt={displayName}
        size={size === "sm" ? 36 : 40}
        gender={userProfile?.profile?.gender}
      />
    </div>
  );
}
