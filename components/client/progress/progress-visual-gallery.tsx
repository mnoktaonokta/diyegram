"use client";

import { useMemo, useRef, useState } from "react";
import Image from "next/image";
import { AnimatePresence, motion } from "framer-motion";
import { X } from "lucide-react";
import { toast } from "sonner";

import { addProgressPhotoAction } from "@/app/actions/progress";
import { useUserProfile } from "@/components/providers/user-profile-provider";
import { useClientProgressData } from "@/components/client/progress/use-client-progress-data";
import {
  getProgressPhotoLabel,
  resolveProgressPhotos,
  resolveSampleGender,
} from "@/lib/mock/progress-sample-photos";
import type { ProgressPhoto } from "@/lib/types/client-progress";
import { todayKey } from "@/lib/utils/calendar";
import {
  resolveProgressImageSrc,
  shouldSkipImageOptimization,
} from "@/lib/utils/image-src";
import { cn } from "@/lib/utils";

function ProgressPhotoViewerModal({
  photo,
  label,
  open,
  onClose,
}: {
  photo: ProgressPhoto | null;
  label: string;
  open: boolean;
  onClose: () => void;
}) {
  if (!photo) {
    return null;
  }

  const imageSrc = resolveProgressImageSrc(photo.imageUrl);

  if (!imageSrc) {
    return null;
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
            className="fixed inset-0 z-50 bg-black/90 backdrop-blur-sm"
            onClick={onClose}
            aria-label="Kapat"
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.96 }}
            className="fixed inset-x-4 top-[8dvh] z-50 mx-auto flex max-h-[84dvh] w-full max-w-md flex-col overflow-hidden rounded-3xl border border-slate-800 bg-slate-950 shadow-2xl"
          >
            <div className="flex items-center justify-between border-b border-slate-800 px-4 py-3">
              <p className="text-sm font-semibold text-zinc-100">{label}</p>
              <button
                type="button"
                onClick={onClose}
                className="flex size-9 items-center justify-center rounded-full text-zinc-400 hover:bg-slate-800"
              >
                <X className="size-5" />
              </button>
            </div>
            <div className="relative min-h-0 flex-1 bg-black">
              <Image
                src={imageSrc}
                alt={label}
                fill
                className="object-contain"
                unoptimized={shouldSkipImageOptimization(imageSrc)}
              />
            </div>
          </motion.div>
        </>
      ) : null}
    </AnimatePresence>
  );
}

export function ProgressVisualGallery({
  programStartedAt,
}: {
  programStartedAt: string;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const { profile } = useUserProfile();
  const { photos: userPhotos, refreshProgress } = useClientProgressData();
  const sampleGender = resolveSampleGender(profile?.gender);
  const displayPhotos = useMemo(
    () => resolveProgressPhotos(programStartedAt, userPhotos, sampleGender),
    [programStartedAt, sampleGender, userPhotos],
  );
  const showingSamples = userPhotos.length === 0;
  const [selectedPhoto, setSelectedPhoto] = useState<ProgressPhoto | null>(
    null,
  );
  const [isUploading, setIsUploading] = useState(false);

  async function handleFileChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.target.value = "";

    if (!file) {
      return;
    }

    if (!file.type.startsWith("image/")) {
      toast.error("Lütfen bir görsel dosyası seçin.");
      return;
    }

    setIsUploading(true);

    try {
      const formData = new FormData();
      formData.append("image", file);
      formData.append("dateKey", todayKey());

      const result = await addProgressPhotoAction(formData);

      if (!result.success) {
        toast.error(result.error);
        return;
      }

      refreshProgress();
      toast.success("Gelişim fotoğrafı eklendi");
    } catch {
      toast.error("Fotoğraf yüklenemedi.");
    } finally {
      setIsUploading(false);
    }
  }

  return (
    <section className="space-y-3 rounded-2xl border border-slate-200/80 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-950">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h2 className="text-sm font-bold text-slate-800 dark:text-zinc-100">
            Görsel Gelişim
          </h2>
          <p className="mt-0.5 text-xs text-slate-500 dark:text-zinc-400">
            {showingSamples
              ? "Örnek ilerleme görselleri — kendi fotoğrafını yükleyince değişir"
              : "Yolculuğunu fotoğraflarla takip et"}
          </p>
        </div>
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={isUploading}
          className={cn(
            "shrink-0 rounded-full border px-3 py-1.5 text-[11px] font-semibold shadow-sm transition-colors",
            "border-slate-200 bg-white text-slate-700 hover:border-teal-300 hover:bg-teal-50 hover:text-teal-700",
            "disabled:cursor-not-allowed disabled:opacity-60",
            "dark:border-slate-700 dark:bg-slate-900 dark:text-zinc-200",
            "dark:hover:border-teal-700 dark:hover:bg-slate-900/80 dark:hover:text-teal-300",
          )}
        >
          {isUploading ? "Yükleniyor..." : "➕ Gelişim Fotoğrafı Yükle"}
        </button>
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          capture="environment"
          className="hidden"
          onChange={handleFileChange}
        />
      </div>

      {displayPhotos.length > 0 ? (
        <div className="-mx-4 px-4">
          <div className="flex gap-3 overflow-x-auto pb-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            {displayPhotos.map((photo) => {
              const label = getProgressPhotoLabel(photo, programStartedAt);
              const imageSrc = resolveProgressImageSrc(photo.imageUrl);

              if (!imageSrc) {
                return null;
              }

              return (
                <button
                  key={photo.id}
                  type="button"
                  onClick={() => setSelectedPhoto(photo)}
                  className={cn(
                    "group w-36 shrink-0 overflow-hidden rounded-2xl border text-left shadow-sm transition-transform hover:scale-[1.02]",
                    "border-slate-200/80 bg-white dark:border-slate-800 dark:bg-slate-950",
                  )}
                >
                  <div className="relative aspect-[3/4] bg-slate-950">
                    <Image
                      src={imageSrc}
                      alt={label}
                      fill
                      className="object-cover transition-transform duration-300 group-hover:scale-105"
                      unoptimized={shouldSkipImageOptimization(imageSrc)}
                    />
                    {showingSamples ? (
                      <span className="absolute left-2 top-2 rounded-full bg-slate-950/80 px-2 py-0.5 text-[9px] font-semibold uppercase tracking-wide text-zinc-400 backdrop-blur-sm">
                        Örnek
                      </span>
                    ) : null}
                  </div>
                  <div className="border-t border-slate-100 px-3 py-2 dark:border-slate-800 dark:bg-slate-950">
                    <p className="text-xs font-semibold text-teal-600 dark:text-teal-400">
                      {label}
                    </p>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      ) : null}

      <ProgressPhotoViewerModal
        photo={selectedPhoto}
        label={
          selectedPhoto
            ? getProgressPhotoLabel(selectedPhoto, programStartedAt)
            : ""
        }
        open={Boolean(selectedPhoto)}
        onClose={() => setSelectedPhoto(null)}
      />
    </section>
  );
}
