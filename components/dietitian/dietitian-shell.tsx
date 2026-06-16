"use client";

import type { ReactNode } from "react";

import { DietitianBottomBar } from "@/components/dietitian/dietitian-bottom-bar";
import { DietitianInviteButton } from "@/components/dietitian/dietitian-invite-button";
import { AppHeaderLogo } from "@/components/shared/app-header-logo";
import { HeaderUserAvatar } from "@/components/shared/header-user-avatar";
import { NotificationCenter } from "@/components/notifications/notification-center";
import { DietitianFeedHeader } from "@/components/dietitian/dietitian-feed-header";
import { useUserProfile } from "@/components/providers/user-profile-provider";
import type { ClientProfile } from "@/lib/mock/dietitian-data";

export function DietitianShell({
  children,
  title = "Danışan Akışı",
  userName = "Diyetisyen",
  userEmail,
  variant = "default",
  clients,
}: {
  children: React.ReactNode;
  title?: ReactNode;
  userName?: string;
  userEmail?: string | null;
  variant?: "default" | "feed";
  clients?: ClientProfile[];
}) {
  const { displayName, avatarUrl: profileAvatarUrl } = useUserProfile();

  return (
    <div className="relative mx-auto flex min-h-dvh w-full max-w-md flex-col bg-slate-50 dark:bg-slate-950">
      {variant === "feed" && clients ? (
        <DietitianFeedHeader
          clients={clients}
          userName={displayName || userName}
          userEmail={userEmail}
        />
      ) : (
        <header className="sticky top-0 z-30 flex items-center justify-between border-b border-slate-200/80 bg-slate-50/95 px-4 py-3 backdrop-blur-md dark:border-slate-800 dark:bg-slate-950/95">
          <div className="flex min-w-0 flex-1 items-center gap-3 pr-3">
            <AppHeaderLogo />
            <p className="truncate text-base font-bold text-slate-800 dark:text-zinc-100">
              {title}
            </p>
          </div>
          <div className="flex shrink-0 items-center gap-1">
            <DietitianInviteButton />
            <NotificationCenter audience="DIETITIAN" />
            <HeaderUserAvatar
              name={displayName || userName}
              avatarUrl={profileAvatarUrl}
            />
          </div>
        </header>
      )}
      <main className="flex-1 pb-24">{children}</main>
      <DietitianBottomBar />
    </div>
  );
}
