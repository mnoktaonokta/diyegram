"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { signOut } from "next-auth/react";
import { motion } from "framer-motion";
import { LogOut, Settings, Sparkles } from "lucide-react";

import { getDefaultAvatarForGender } from "@/lib/constants/avatars";
import { useOptionalUserProfile } from "@/components/providers/user-profile-provider";
import { UserAvatar } from "@/components/shared/user-avatar";
import { cn } from "@/lib/utils";

type ProfileMenuProps = {
  name: string;
  email?: string | null;
  avatarUrl: string;
  size?: "sm" | "md";
  settingsHref?: string;
  socialProfileHref?: string;
};

export function ProfileMenu({
  name,
  email,
  avatarUrl,
  size = "sm",
  settingsHref = "/settings",
  socialProfileHref,
}: ProfileMenuProps) {
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const userProfile = useOptionalUserProfile();
  const displayName = userProfile?.displayName ?? name;
  const resolvedAvatarUrl =
    userProfile?.avatarUrl?.trim() ||
    avatarUrl.trim() ||
    getDefaultAvatarForGender(userProfile?.profile?.gender);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setOpen(false);
      }
    }

    if (open) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [open]);

  const dimension = size === "sm" ? "size-9" : "size-10";

  return (
    <div className="relative" ref={containerRef}>
      <motion.button
        type="button"
        whileTap={{ scale: 0.96 }}
        onClick={() => setOpen((prev) => !prev)}
        className={cn(
          "relative overflow-hidden rounded-full ring-2 ring-teal-500/30 transition-shadow hover:ring-teal-500/50",
          dimension,
        )}
        aria-label="Profil menüsü"
        aria-expanded={open}
      >
        <UserAvatar
          src={resolvedAvatarUrl}
          alt={displayName}
          size={size === "sm" ? 36 : 40}
          gender={userProfile?.profile?.gender}
        />
      </motion.button>

      {open ? (
        <div className="absolute right-0 top-full z-50 mt-2 w-56 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-md dark:border-slate-800 dark:bg-slate-900">
          <div className="border-b border-slate-100 px-4 py-3 dark:border-slate-800">
            <p className="truncate text-sm font-bold text-slate-800 dark:text-zinc-100">
              {displayName}
            </p>
            {email ? (
              <p className="truncate text-xs text-slate-500 dark:text-zinc-400">
                {email}
              </p>
            ) : null}
          </div>
          <Link
            href={settingsHref}
            onClick={() => setOpen(false)}
            className="flex w-full items-center gap-2 px-4 py-3 text-left text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50 dark:text-zinc-300 dark:hover:bg-slate-800/60"
          >
            <Settings className="size-4 shrink-0" />
            Ayarlar
          </Link>
          {socialProfileHref ? (
            <Link
              href={socialProfileHref}
              onClick={() => setOpen(false)}
              className="flex w-full items-center gap-2 px-4 py-3 text-left text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50 dark:text-zinc-300 dark:hover:bg-slate-800/60"
            >
              <Sparkles className="size-4 shrink-0" />
              Sosyal Profil
            </Link>
          ) : null}
          <button
            type="button"
            onClick={() => signOut({ callbackUrl: "/login" })}
            className="flex w-full items-center gap-2 px-4 py-3 text-left text-sm font-medium text-rose-600 transition-colors hover:bg-rose-50 dark:text-rose-400 dark:hover:bg-rose-950/40"
          >
            <LogOut className="size-4 shrink-0" />
            Çıkış Yap
          </button>
        </div>
      ) : null}
    </div>
  );
}
