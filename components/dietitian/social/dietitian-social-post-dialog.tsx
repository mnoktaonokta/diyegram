"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Bookmark, Heart, X } from "lucide-react";
import { toast } from "sonner";

import { HashtagText } from "@/components/dietitian/social/hashtag-text";
import { ImageCarousel } from "@/components/shared/image-carousel";
import { Button } from "@/components/ui/button";
import {
  getDietitianPostImages,
  type DietitianSocialPost,
} from "@/lib/types/dietitian-social";
import { cn } from "@/lib/utils";

export function DietitianSocialPostDialog({
  post,
  open,
  onClose,
  readOnly = true,
  onHashtagClick,
}: {
  post: DietitianSocialPost | null;
  open: boolean;
  onClose: () => void;
  readOnly?: boolean;
  onHashtagClick?: (hashtag: string) => void;
}) {
  const [engagement, setEngagement] = useState({ liked: false, saved: false });

  useEffect(() => {
    if (post) {
      setEngagement({ liked: false, saved: false });
    }
  }, [post?.id]);

  if (!post) {
    return null;
  }

  const images = getDietitianPostImages(post);

  function handleLike() {
    setEngagement((current) => {
      const next = { ...current, liked: !current.liked };
      toast.success(next.liked ? "Beğenildi ❤️" : "Beğeni kaldırıldı");
      return next;
    });
  }

  function handleSave() {
    setEngagement((current) => {
      const next = { ...current, saved: !current.saved };
      toast.success(next.saved ? "Kaydedildi 🔖" : "Kayıttan çıkarıldı");
      return next;
    });
  }

  return (
    <AnimatePresence>
      {open ? (
        <>
          <motion.button
            type="button"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm"
            onClick={onClose}
            aria-label="Kapat"
          />
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 24 }}
            className="fixed inset-x-4 top-[6dvh] z-50 mx-auto flex max-h-[88dvh] w-full max-w-md flex-col overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-2xl dark:border-slate-800 dark:bg-slate-950"
          >
            <div className="flex items-center justify-between border-b border-slate-100 px-4 py-3 dark:border-slate-800">
              <p className="truncate text-sm font-semibold text-slate-800 dark:text-zinc-100">
                {post.title}
              </p>
              <button
                type="button"
                onClick={onClose}
                className="flex size-9 items-center justify-center rounded-full text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                <X className="size-5" />
              </button>
            </div>

            <div className="min-h-0 flex-1 overflow-y-auto">
              <ImageCarousel
                images={images}
                altPrefix={post.title}
                aspectClass="aspect-square"
              />

              <div className="space-y-3 p-4">
                {!readOnly ? (
                  <div className="flex gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      className={cn(
                        "rounded-2xl",
                        engagement.liked &&
                          "border-rose-200 bg-rose-50 text-rose-600 dark:border-rose-900 dark:bg-rose-950/40 dark:text-rose-300",
                      )}
                      onClick={handleLike}
                    >
                      <Heart
                        className={cn(
                          "size-4",
                          engagement.liked && "fill-current",
                        )}
                      />
                      Beğen
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      className={cn(
                        "rounded-2xl",
                        engagement.saved &&
                          "border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-900 dark:bg-amber-950/40 dark:text-amber-300",
                      )}
                      onClick={handleSave}
                    >
                      <Bookmark
                        className={cn(
                          "size-4",
                          engagement.saved && "fill-current",
                        )}
                      />
                      Kaydet
                    </Button>
                  </div>
                ) : null}

                <HashtagText
                  text={post.description}
                  onHashtagClick={onHashtagClick}
                />
              </div>
            </div>
          </motion.div>
        </>
      ) : null}
    </AnimatePresence>
  );
}
