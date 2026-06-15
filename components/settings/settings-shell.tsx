"use client";

import Link from "next/link";
import { ArrowLeft } from "lucide-react";

import { ProfileMenu } from "@/components/auth/profile-menu";
import { useUserProfile } from "@/components/providers/user-profile-provider";
import { getRoleHomePath, type Role } from "@/types/role";

export function SettingsShell({
  role,
  userName,
  userEmail,
  avatarUrl,
  children,
}: {
  role: Role;
  userName: string;
  userEmail?: string | null;
  avatarUrl: string;
  children: React.ReactNode;
}) {
  const { displayName, avatarUrl: profileAvatarUrl } = useUserProfile();
  const homePath = getRoleHomePath(role);
  const roleLabel = role === "CLIENT" ? "Danışan" : "Diyetisyen";

  return (
    <div className="relative mx-auto flex min-h-dvh w-full max-w-md flex-col bg-slate-50 dark:bg-slate-950">
      <header className="sticky top-0 z-30 border-b border-slate-200/80 bg-slate-50/95 backdrop-blur-md dark:border-slate-800 dark:bg-slate-950/95">
        <div className="flex items-center justify-between gap-3 px-4 py-3">
          <div className="flex min-w-0 items-center gap-2">
            <Link
              href={homePath}
              className="flex size-9 shrink-0 items-center justify-center rounded-full text-slate-600 transition-colors hover:bg-slate-100 dark:text-zinc-400 dark:hover:bg-slate-800"
              aria-label="Geri dön"
            >
              <ArrowLeft className="size-5" />
            </Link>
            <div className="min-w-0">
              <p className="truncate text-base font-bold text-slate-800 dark:text-zinc-100">
                Profil ve Ayarlar
              </p>
              <p className="text-xs text-slate-500 dark:text-zinc-400">
                Diyegram · {roleLabel}
              </p>
            </div>
          </div>
          <ProfileMenu
            name={displayName || userName}
            email={userEmail}
            avatarUrl={profileAvatarUrl || avatarUrl}
            settingsHref="/settings"
          />
        </div>
      </header>
      <main className="flex-1 px-4 py-5 pb-8">{children}</main>
    </div>
  );
}
