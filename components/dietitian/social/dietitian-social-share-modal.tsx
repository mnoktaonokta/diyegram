"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { AnimatePresence, motion } from "framer-motion";
import { ImageIcon, Plus, Upload, X } from "lucide-react";
import { toast } from "sonner";

import { createDietitianPostAction } from "@/app/actions/dietitian-post";
import { ImageCarousel } from "@/components/shared/image-carousel";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

const MAX_PHOTOS = 10;

type PendingImage = {
  file: File;
  previewUrl: string;
};

export function DietitianSocialShareModal({
  open,
  onClose,
  onShared,
}: {
  open: boolean;
  onClose: () => void;
  onShared?: () => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [images, setImages] = useState<PendingImage[]>([]);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    return () => {
      for (const image of images) {
        URL.revokeObjectURL(image.previewUrl);
      }
    };
  }, [images]);

  function resetForm() {
    for (const image of images) {
      URL.revokeObjectURL(image.previewUrl);
    }
    setImages([]);
    setTitle("");
    setDescription("");
  }

  function handleClose() {
    resetForm();
    onClose();
  }

  function removeImage(index: number) {
    setImages((current) => {
      const next = [...current];
      const removed = next.splice(index, 1)[0];
      if (removed) {
        URL.revokeObjectURL(removed.previewUrl);
      }
      return next;
    });
  }

  async function handleFileChange(event: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(event.target.files ?? []);
    event.target.value = "";

    if (files.length === 0) {
      return;
    }

    const remainingSlots = MAX_PHOTOS - images.length;
    if (remainingSlots <= 0) {
      toast.error(`En fazla ${MAX_PHOTOS} fotoğraf ekleyebilirsiniz.`);
      return;
    }

    const filesToProcess = files.slice(0, remainingSlots);
    if (files.length > remainingSlots) {
      toast.message(`Yalnızca ${remainingSlots} fotoğraf daha eklenebilir.`);
    }

    const hasInvalidFile = filesToProcess.some(
      (file) =>
        !file.type.startsWith("image/") &&
        !/\.(jpe?g|png|webp|gif|heic|heif|avif)$/i.test(file.name),
    );

    if (hasInvalidFile) {
      toast.error("Lütfen yalnızca görsel dosyaları seçin.");
      return;
    }

    setIsUploading(true);

    try {
      const nextImages = filesToProcess.map((file) => ({
        file,
        previewUrl: URL.createObjectURL(file),
      }));
      setImages((current) => [...current, ...nextImages]);
    } catch {
      toast.error("Fotoğraf yüklenemedi.");
    } finally {
      setIsUploading(false);
    }
  }

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();

    if (images.length === 0) {
      toast.error("Lütfen en az bir fotoğraf yükleyin.");
      return;
    }

    setIsSubmitting(true);

    try {
      const formData = new FormData();
      formData.append("title", title.trim());
      formData.append("description", description.trim());
      for (const image of images) {
        formData.append("images", image.file);
      }

      const result = await createDietitianPostAction(formData);

      if (!result.success) {
        toast.error(result.error ?? "Paylaşım başarısız oldu.");
        return;
      }

      onShared?.();
      toast.success("Paylaşıldı");
      handleClose();
    } catch {
      toast.error("Paylaşım sırasında bir hata oluştu.");
    } finally {
      setIsSubmitting(false);
    }
  }

  const previewUrls = images.map((image) => image.previewUrl);
  const canAddMore = images.length < MAX_PHOTOS;

  return (
    <AnimatePresence>
      {open ? (
        <>
          <motion.button
            type="button"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm"
            onClick={handleClose}
            aria-label="Kapat"
          />
          <motion.div
            initial={{ opacity: 0, y: "100%" }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: "100%" }}
            transition={{ type: "spring", damping: 28, stiffness: 320 }}
            className="fixed inset-x-0 bottom-0 z-50 mx-auto max-h-[92dvh] w-full max-w-md overflow-hidden rounded-t-3xl border border-slate-200 bg-white shadow-2xl dark:border-slate-800 dark:bg-slate-950"
          >
            <div className="flex items-center justify-between border-b border-slate-100 px-4 py-3 dark:border-slate-800">
              <h2 className="text-base font-bold text-slate-800 dark:text-zinc-100">
                İçerik Paylaş
              </h2>
              <button
                type="button"
                onClick={handleClose}
                className="flex size-9 items-center justify-center rounded-full text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                <X className="size-5" />
              </button>
            </div>

            <form
              onSubmit={handleSubmit}
              className="max-h-[calc(92dvh-56px)] space-y-4 overflow-y-auto px-4 py-4 pb-8"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between gap-2">
                  <Label>Fotoğraflar</Label>
                  {images.length > 0 ? (
                    <span className="text-xs text-slate-500 dark:text-zinc-400">
                      {images.length}/{MAX_PHOTOS}
                    </span>
                  ) : null}
                </div>

                {images.length > 0 ? (
                  <div className="space-y-3">
                    <div className="overflow-hidden rounded-2xl border border-slate-200 dark:border-slate-700">
                      <ImageCarousel
                        images={previewUrls}
                        altPrefix="Önizleme"
                        aspectClass="aspect-[4/3]"
                      />
                    </div>

                    <div className="flex gap-2 overflow-x-auto pb-1">
                      {images.map((image, index) => (
                        <div
                          key={image.previewUrl}
                          className="relative size-16 shrink-0 overflow-hidden rounded-xl border border-slate-200 dark:border-slate-700"
                        >
                          <Image
                            src={image.previewUrl}
                            alt={`Önizleme ${index + 1}`}
                            fill
                            className="object-cover"
                            unoptimized
                          />
                          <button
                            type="button"
                            onClick={() => removeImage(index)}
                            className="absolute right-0.5 top-0.5 flex size-5 items-center justify-center rounded-full bg-black/60 text-white"
                            aria-label={`${index + 1}. fotoğrafı kaldır`}
                          >
                            <X className="size-3" />
                          </button>
                        </div>
                      ))}
                    </div>

                    {canAddMore ? (
                      <button
                        type="button"
                        onClick={() => inputRef.current?.click()}
                        disabled={isUploading}
                        className={cn(
                          "flex w-full items-center justify-center gap-2 rounded-2xl border-2 border-dashed px-4 py-3",
                          "border-teal-200 bg-teal-50/70 text-sm font-semibold text-teal-700",
                          "transition-colors hover:border-teal-300 hover:bg-teal-50",
                          "disabled:cursor-not-allowed disabled:opacity-60",
                          "dark:border-teal-800 dark:bg-teal-950/40 dark:text-teal-300 dark:hover:bg-teal-950/60",
                        )}
                      >
                        {isUploading ? (
                          <Upload className="size-4 animate-pulse" />
                        ) : (
                          <Plus className="size-4" />
                        )}
                        {isUploading
                          ? "Yükleniyor..."
                          : "Başka fotoğraf eklemek ister misiniz?"}
                      </button>
                    ) : null}
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => inputRef.current?.click()}
                    disabled={isUploading}
                    className={cn(
                      "relative flex aspect-[4/3] w-full items-center justify-center overflow-hidden rounded-2xl border-2 border-dashed",
                      "border-slate-200 bg-slate-50 dark:border-slate-700 dark:bg-slate-900/60",
                    )}
                  >
                    <div className="flex flex-col items-center gap-2 text-slate-500 dark:text-zinc-400">
                      {isUploading ? (
                        <Upload className="size-8 animate-pulse" />
                      ) : (
                        <ImageIcon className="size-8" />
                      )}
                      <span className="text-sm font-medium">
                        {isUploading ? "Yükleniyor..." : "Fotoğraf seçin"}
                      </span>
                      <span className="text-xs text-slate-400 dark:text-zinc-500">
                        Birden fazla fotoğraf ekleyebilirsiniz
                      </span>
                    </div>
                  </button>
                )}

                <input
                  ref={inputRef}
                  type="file"
                  accept="image/*"
                  multiple
                  className="hidden"
                  onChange={handleFileChange}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="social-title">Başlık (isteğe bağlı)</Label>
                <Input
                  id="social-title"
                  value={title}
                  onChange={(event) => setTitle(event.target.value)}
                  placeholder="Örn: Avokado Toast Tarifi"
                  className="rounded-2xl"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="social-description">Açıklama (isteğe bağlı)</Label>
                <textarea
                  id="social-description"
                  value={description}
                  onChange={(event) => setDescription(event.target.value)}
                  placeholder="Paylaşımınızı yazın. Etiket eklemek için #kullanın (ör. #tarif #motivasyon)"
                  rows={5}
                  className="w-full rounded-2xl border border-input bg-background px-3 py-2.5 text-sm shadow-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 dark:bg-input/30"
                />
              </div>

              <Button
                type="submit"
                disabled={isSubmitting || isUploading}
                className="h-11 w-full rounded-2xl text-sm font-semibold"
              >
                {isSubmitting ? "Paylaşılıyor..." : "Paylaş"}
              </Button>
            </form>
          </motion.div>
        </>
      ) : null}
    </AnimatePresence>
  );
}
