"use client";

import Link from "next/link";

import { NotificationCenter } from "@/components/notifications/notification-center";
import { useUserProfile } from "@/components/providers/user-profile-provider";
import { HeaderUserAvatar } from "@/components/shared/header-user-avatar";
import { useDietitianSocialProfile } from "@/components/dietitian/social/use-dietitian-social-profile";

export function ClientHeader({
  userName,
}: {
  userName: string;
}) {
  const { firstName, displayName, avatarUrl: profileAvatarUrl, isLoading } =
    useUserProfile();
  const dietitian = useDietitianSocialProfile();

  return (
    <header className="sticky top-0 z-30 flex items-center justify-between border-b border-slate-200/80 bg-slate-50/95 px-4 py-3 backdrop-blur-md dark:border-slate-800 dark:bg-slate-950/95">
      <div>
        <p className="text-base font-bold text-slate-800 dark:text-zinc-100">
          {isLoading ? (
            <span className="inline-block h-5 w-36 animate-pulse rounded bg-slate-200 dark:bg-slate-800" />
          ) : (
            <>Merhaba, {firstName || userName.split(" ")[0]} 👋</>
          )}
        </p>
        <p className="text-xs text-slate-500 dark:text-zinc-400">
          Diyetisyeniniz:{" "}
          <Link
            href="/client/dietitian-profile"
            className="font-semibold text-teal-600 transition-colors hover:text-teal-500 dark:text-teal-400 dark:hover:text-teal-300"
          >
            {dietitian.name}
          </Link>
        </p>
      </div>
      <div className="flex shrink-0 items-center gap-1">
        <NotificationCenter audience="CLIENT" />
        <HeaderUserAvatar
          name={displayName || userName}
          avatarUrl={profileAvatarUrl}
        />
      </div>
    </header>
  );
}
