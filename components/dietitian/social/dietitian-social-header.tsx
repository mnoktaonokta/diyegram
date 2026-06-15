"use client";

import { motion } from "framer-motion";
import { Grid3X3 } from "lucide-react";

import { UserAvatar } from "@/components/shared/user-avatar";
import type { GenderOption } from "@/lib/types/user-profile";
import { cn } from "@/lib/utils";

export function DietitianSocialHeader({
  name,
  avatarUrl,
  gender,
  title,
  bio,
  postCount,
  canEdit,
  onShareClick,
}: {
  name: string;
  avatarUrl: string;
  gender?: GenderOption;
  title: string;
  bio: string;
  postCount: number;
  canEdit?: boolean;
  onShareClick?: () => void;
}) {
  return (
    <section className="border-b border-slate-200/80 px-4 py-6 dark:border-slate-800">
      <div className="flex items-start gap-4">
        <div className="relative size-20 shrink-0 overflow-hidden rounded-full ring-4 ring-teal-500/20">
          <UserAvatar
            src={avatarUrl}
            alt={name}
            size={80}
            gender={gender}
          />
        </div>

        <div className="min-w-0 flex-1 pt-1">
          <h1 className="truncate text-lg font-bold text-slate-800 dark:text-zinc-100">
            {name}
          </h1>
          <p className="mt-0.5 text-sm font-medium text-teal-600 dark:text-teal-400">
            {title}
          </p>
          <div className="mt-3 flex items-center gap-4 text-sm">
            <span className="font-semibold text-slate-800 dark:text-zinc-100">
              {postCount}
              <span className="ml-1 font-normal text-slate-500 dark:text-zinc-400">
                içerik
              </span>
            </span>
            <span className="inline-flex items-center gap-1 text-slate-500 dark:text-zinc-400">
              <Grid3X3 className="size-3.5" />
              Grid
            </span>
          </div>
        </div>
      </div>

      <p className="mt-4 text-sm leading-relaxed text-slate-600 dark:text-zinc-300">
        {bio}
      </p>

      {canEdit ? (
        <motion.button
          type="button"
          whileTap={{ scale: 0.98 }}
          onClick={onShareClick}
          className={cn(
            "mt-5 flex w-full items-center justify-center gap-2 rounded-2xl",
            "bg-teal-500 px-4 py-3 text-sm font-semibold text-white shadow-sm",
            "transition-colors hover:bg-teal-600",
          )}
        >
          <span className="text-base">➕</span>
          İçerik Paylaş
        </motion.button>
      ) : null}
    </section>
  );
}
