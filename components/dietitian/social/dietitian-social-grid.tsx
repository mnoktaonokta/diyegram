"use client";

import Image from "next/image";
import { motion } from "framer-motion";

import {
  getDietitianPostCoverImage,
  getDietitianPostImages,
  type DietitianSocialPost,
} from "@/lib/types/dietitian-social";

export function DietitianSocialGrid({
  posts,
  onSelectPost,
  emptyTitle = "Henüz paylaşım yok",
  emptyHint,
}: {
  posts: DietitianSocialPost[];
  onSelectPost: (post: DietitianSocialPost) => void;
  emptyTitle?: string;
  emptyHint?: string;
}) {
  if (posts.length === 0) {
    return (
      <div className="mx-4 my-8 rounded-2xl border border-dashed border-slate-200 bg-white/60 px-6 py-14 text-center dark:border-slate-800 dark:bg-slate-900/60">
        <p className="text-3xl">📸</p>
        <p className="mt-3 text-sm font-medium text-slate-600 dark:text-zinc-400">
          {emptyTitle}
        </p>
        {emptyHint ? (
          <p className="mt-1 text-xs text-slate-500 dark:text-zinc-500">
            {emptyHint}
          </p>
        ) : null}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-3 gap-0.5 bg-slate-200 dark:bg-slate-800">
      {posts.map((post, index) => {
        const coverImage = getDietitianPostCoverImage(post);
        const imageCount = getDietitianPostImages(post).length;

        return (
          <motion.button
            key={post.id}
            type="button"
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: index * 0.03 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => onSelectPost(post)}
            className="group relative aspect-square overflow-hidden bg-slate-100 dark:bg-slate-900"
          >
            {coverImage ? (
              <Image
                src={coverImage}
                alt={post.title}
                fill
                className="object-cover transition-transform duration-300 group-hover:scale-105"
                sizes="(max-width: 448px) 33vw, 150px"
                unoptimized={coverImage.startsWith("data:")}
              />
            ) : (
              <div className="flex size-full items-center justify-center bg-slate-100 text-2xl dark:bg-slate-900">
                📸
              </div>
            )}
            {imageCount > 1 ? (
              <span className="absolute right-1.5 top-1.5 rounded-full bg-black/55 px-1.5 py-0.5 text-[10px] font-semibold text-white">
                1/{imageCount}
              </span>
            ) : null}
          </motion.button>
        );
      })}
    </div>
  );
}
